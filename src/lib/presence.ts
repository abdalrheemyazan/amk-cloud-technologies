import type { Prisma, PresenceStatus } from "@prisma/client";
import { normalizeAgentStatus, type AgentStatus } from "@/lib/support-types";

type Tx = Prisma.TransactionClient;

export type PresenceMode = "AUTO" | "MANUAL";

export type PresenceRecomputeResult = {
  activeChatsCount: number;
  status: AgentStatus;
  mode: PresenceMode;
};

// Call after a technician takes on a new active chat (accept, transfer-in).
// Always lands on BUSY — callers are expected to have already verified the
// technician isn't OFFLINE before handing them work.
export async function recomputePresenceAfterSessionGain(
  tx: Tx,
  technicianId: string,
): Promise<PresenceRecomputeResult> {
  const activeChatsCount = await tx.supportSession.count({
    where: { technicianId, status: "ACTIVE" },
  });

  const presence = await tx.technicianPresence.upsert({
    where: { technicianId },
    update: { status: "BUSY", activeChatsCount, lastSeenAt: new Date() },
    create: { technicianId, status: "BUSY", mode: "AUTO", activeChatsCount },
  });

  return {
    activeChatsCount,
    status: normalizeAgentStatus(presence.status),
    mode: presence.mode === "MANUAL" ? "MANUAL" : "AUTO",
  };
}

// Call after a technician's active chat ends (close, resolve, transfer-out).
// AUTO mode follows the workflow: back to AVAILABLE once the technician has
// no other active chats, otherwise stays BUSY. MANUAL mode (agent pinned
// themselves to BUSY or OFFLINE) is left untouched.
export async function recomputePresenceAfterSessionLoss(
  tx: Tx,
  technicianId: string,
): Promise<PresenceRecomputeResult> {
  const activeChatsCount = await tx.supportSession.count({
    where: { technicianId, status: "ACTIVE" },
  });

  const presence = await tx.technicianPresence.findUnique({ where: { technicianId } });
  const mode: PresenceMode = presence?.mode === "MANUAL" ? "MANUAL" : "AUTO";

  let nextStatus: PresenceStatus = presence?.status ?? "OFFLINE";
  if (mode === "AUTO") {
    nextStatus = activeChatsCount === 0 ? "AVAILABLE" : "BUSY";
  }

  const updated = await tx.technicianPresence.upsert({
    where: { technicianId },
    update: { status: nextStatus, activeChatsCount, lastSeenAt: new Date() },
    create: { technicianId, status: nextStatus, mode, activeChatsCount },
  });

  return {
    activeChatsCount,
    status: normalizeAgentStatus(updated.status),
    mode,
  };
}

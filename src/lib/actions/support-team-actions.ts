"use server";

import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import { normalizeAgentStatus, type AgentStatus } from "@/lib/support-types";
import { recomputePresenceAfterSessionGain, recomputePresenceAfterSessionLoss } from "@/lib/presence";
import type { AgentStatusChange } from "@/lib/actions/support-chat-actions";
import {
  discardStagedSupportAttachments,
  stageSupportAttachments,
  storedSupportAttachmentView,
  supportAttachmentCreateData,
  supportAttachmentExpiry,
  validateSupportAttachments,
  type SupportAttachmentUpload,
  type SupportAttachmentView,
} from "@/lib/support-attachments";

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

const GENERIC_ERROR = "לא ניתן להשלים את הפעולה כרגע. נסו שוב בעוד מספר רגעים.";
const UPLOAD_ERROR = "לא ניתן להעלות את התמונה כרגע. נסה שוב בעוד מספר רגעים.";
const CLEAR_ERROR = "לא ניתן לנקות את השיחה כרגע. נסה שוב בעוד מספר רגעים.";
const PRESENCE_WINDOW_MS = 2 * 60 * 1000;
const INTERNAL_CHAT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

async function requireStaffUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = {
    id: session.user.id as string,
    role: session.user.role as Role,
  };

  if (!STAFF_ROLES.includes(user.role)) return null;
  return user;
}

async function canCollaborateOnSession(
  sessionId: string,
  sessionOwnerId: string | null,
  user: { id: string; role: Role },
) {
  if (user.role === "ADMINISTRATOR" || sessionOwnerId === user.id) return true;

  const [transfer, message] = await Promise.all([
    prisma.supportTransfer.findFirst({
      where: {
        sessionId,
        OR: [{ fromAgentId: user.id }, { toAgentId: user.id }],
      },
      select: { id: true },
    }),
    prisma.internalSupportMessage.findFirst({
      where: {
        sessionId,
        OR: [{ senderId: user.id }, { recipientId: user.id }],
      },
      select: { id: true },
    }),
  ]);

  return Boolean(transfer || message);
}

const SPECIALTY_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "לקוח",
  SUPPORT_AGENT: "תמיכה כללית",
  TECHNICIAN: "תמיכה טכנית",
  TEAM_LEADER: "ניהול והסלמות",
  CLOUD_ENGINEER: "תשתיות וענן",
  ADMINISTRATOR: "ניהול מערכת",
};

const ROLE_LABEL_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "לקוח",
  SUPPORT_AGENT: "נציג/ת תמיכה",
  TECHNICIAN: "טכנאי/ת תמיכה",
  TEAM_LEADER: "ראש צוות",
  CLOUD_ENGINEER: "מהנדס/ת ענן",
  ADMINISTRATOR: "מנהל/ת מערכת",
};

function displayAgentName(user: { name: string | null; displayName?: string | null }) {
  return user.displayName?.trim() || user.name?.trim() || "נציג/ת AMK";
}

export type ConnectedSupportAgent = {
  id: string;
  name: string;
  imageUrl: string | null;
  role: string;
  status: AgentStatus;
  activeConversationCount: number;
  specialty: string;
  isCurrent: boolean;
  lastSeenAt: string;
};

export async function getConnectedSupportAgents(): Promise<ActionResult<ConnectedSupportAgent[]>> {
  const currentUser = await requireStaffUser();
  if (!currentUser) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const cutoff = new Date(Date.now() - PRESENCE_WINDOW_MS);
    const agents = await prisma.user.findMany({
      where: {
        role: { in: STAFF_ROLES },
        status: "ACTIVE",
        presence: { isNot: null },
      },
      include: {
        presence: true,
        _count: {
          select: {
            technicianSessions: { where: { status: "ACTIVE" } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const connected = agents
      .filter(
        (agent) =>
          agent.presence &&
          agent.presence.status !== "OFFLINE" &&
          agent.presence.lastSeenAt >= cutoff,
      )
      .map((agent) => ({
        id: agent.id,
        name: displayAgentName(agent),
        imageUrl: agent.profileImageUrl,
        role: ROLE_LABEL_BY_ROLE[agent.role],
        status: normalizeAgentStatus(agent.presence?.status),
        activeConversationCount: agent._count.technicianSessions,
        specialty: agent.supportSpecialty?.trim() || SPECIALTY_BY_ROLE[agent.role],
        isCurrent: agent.id === currentUser.id,
        lastSeenAt: agent.presence!.lastSeenAt.toISOString(),
      }));

    connected.sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      if (a.status === "AVAILABLE" && b.status !== "AVAILABLE") return -1;
      if (b.status === "AVAILABLE" && a.status !== "AVAILABLE") return 1;
      return a.name.localeCompare(b.name, "he");
    });

    return { ok: true, data: connected };
  } catch (error) {
    console.error("getConnectedSupportAgents failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type InternalSupportMessageView = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sessionId: string | null;
  createdAt: string;
  isMine: boolean;
  attachments: SupportAttachmentView[];
};

export async function getInternalSupportConversation(
  otherAgentId: string,
): Promise<ActionResult<InternalSupportMessageView[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };
  if (!otherAgentId || otherAgentId === user.id) return { ok: false, error: "INVALID_AGENT" };

  try {
    const otherAgent = await prisma.user.findFirst({
      where: { id: otherAgentId, role: { in: STAFF_ROLES }, status: "ACTIVE" },
      select: { id: true },
    });
    if (!otherAgent) return { ok: false, error: "AGENT_NOT_FOUND" };

    const clearState = await prisma.internalChatClearState.findUnique({
      where: { viewerId_peerId: { viewerId: user.id, peerId: otherAgentId } },
      select: { clearedAt: true },
    });
    const retentionCutoff = new Date(Date.now() - INTERNAL_CHAT_RETENTION_MS);
    const visibleAfter =
      clearState && clearState.clearedAt > retentionCutoff
        ? clearState.clearedAt
        : retentionCutoff;

    const messages = await prisma.internalSupportMessage.findMany({
      where: {
        createdAt: { gt: visibleAfter },
        OR: [
          { senderId: user.id, recipientId: otherAgentId },
          { senderId: otherAgentId, recipientId: user.id },
        ],
      },
      include: {
        attachments: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "asc" },
        },
        sender: { select: { name: true, displayName: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    await prisma.internalSupportMessage.updateMany({
      where: { senderId: otherAgentId, recipientId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return {
      ok: true,
      data: messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        senderName: displayAgentName(message.sender),
        content: message.content,
        sessionId: message.sessionId,
        createdAt: message.createdAt.toISOString(),
        isMine: message.senderId === user.id,
        attachments: message.attachments.map(storedSupportAttachmentView),
      })),
    };
  } catch (error) {
    console.error("getInternalSupportConversation failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function sendInternalSupportMessage(
  recipientId: string,
  content: string,
  sessionId?: string | null,
  attachments?: SupportAttachmentUpload[],
): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const trimmed = content.trim();
  if (!trimmed && (!attachments || attachments.length === 0)) {
    return { ok: false, error: "EMPTY_MESSAGE" };
  }
  if (recipientId === user.id) return { ok: false, error: "INVALID_AGENT" };
  const validated = validateSupportAttachments(attachments);
  if (!validated.ok) return { ok: false, error: validated.error };

  try {
    const recipient = await prisma.user.findFirst({
      where: { id: recipientId, role: { in: STAFF_ROLES }, status: "ACTIVE" },
      select: { id: true },
    });
    if (!recipient) return { ok: false, error: "AGENT_NOT_FOUND" };

    if (sessionId) {
      const supportSession = await prisma.supportSession.findUnique({
        where: { id: sessionId },
        select: { id: true, technicianId: true },
      });
      if (
        !supportSession ||
        !(await canCollaborateOnSession(sessionId, supportSession.technicianId, user))
      ) {
        return { ok: false, error: "NOT_FOUND" };
      }
    }

    const messageId = randomUUID();
    const participantScope = [user.id, recipientId].sort().join("-");
    const staged = await stageSupportAttachments({
      attachments: validated.attachments,
      messageId,
      scope: sessionId || `internal-${participantScope}`,
    });

    try {
      await prisma.internalSupportMessage.create({
        data: {
          id: messageId,
          senderId: user.id,
          recipientId,
          content: trimmed.slice(0, 4000),
          sessionId: sessionId || null,
          attachments:
            staged.length > 0
              ? {
                  create: staged.map((attachment) =>
                    supportAttachmentCreateData(attachment, {
                      expiresAt: supportAttachmentExpiry(),
                      sessionId,
                      uploadedById: user.id,
                    }),
                  ),
                }
              : undefined,
        },
      });
    } catch (error) {
      await discardStagedSupportAttachments(staged).catch((cleanupError) => {
        console.error("Failed to roll back internal chat attachments:", cleanupError);
      });
      throw error;
    }

    if (sessionId) {
      const existingActivity = await prisma.supportActivity.findFirst({
        where: { sessionId, type: "CONSULTATION_STARTED" },
        select: { id: true },
      });

      if (!existingActivity) {
        await prisma.supportActivity.create({
          data: {
            sessionId,
            actorId: user.id,
            type: "CONSULTATION_STARTED",
            message: "נציג התמיכה מתייעץ עם מומחה נוסף",
          },
        });
      }
    }

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    console.error("sendInternalSupportMessage failed:", error);
    return { ok: false, error: validated.attachments.length > 0 ? UPLOAD_ERROR : GENERIC_ERROR };
  }
}

export async function clearSupportChatForAgent(otherAgentId: string): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "אין לך הרשאה לבצע פעולה זו." };
  if (!otherAgentId || otherAgentId === user.id) {
    return { ok: false, error: "INVALID_AGENT" };
  }

  try {
    const otherAgent = await prisma.user.findFirst({
      where: { id: otherAgentId, role: { in: STAFF_ROLES }, status: "ACTIVE" },
      select: { id: true },
    });
    if (!otherAgent) return { ok: false, error: "AGENT_NOT_FOUND" };

    await prisma.internalChatClearState.upsert({
      where: { viewerId_peerId: { viewerId: user.id, peerId: otherAgentId } },
      update: { clearedAt: new Date() },
      create: { viewerId: user.id, peerId: otherAgentId },
    });

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    console.error("clearSupportChatForAgent failed:", error);
    return { ok: false, error: CLEAR_ERROR };
  }
}

export type SupportTransferView = {
  id: string;
  fromAgentName: string;
  toAgentName: string;
  note: string | null;
  status: string;
  createdAt: string;
};

export async function transferSupportSession(
  sessionId: string,
  targetAgentId: string,
  note?: string,
): Promise<ActionResult<{ targetAgentName: string }>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };
  if (!targetAgentId || targetAgentId === user.id) {
    return { ok: false, error: "יש לבחור נציג אחר להעברת הטיפול." };
  }

  try {
    const [supportSession, targetAgent] = await Promise.all([
      prisma.supportSession.findUnique({
        where: { id: sessionId },
        select: { id: true, technicianId: true, status: true, customerId: true },
      }),
      prisma.user.findFirst({
        where: { id: targetAgentId, role: { in: STAFF_ROLES }, status: "ACTIVE" },
        include: { presence: true },
      }),
    ]);

    if (
      !supportSession ||
      supportSession.status !== "ACTIVE" ||
      (supportSession.technicianId !== user.id && user.role !== "ADMINISTRATOR")
    ) {
      return { ok: false, error: "הפנייה כבר אינה זמינה להעברה." };
    }

    if (
      !targetAgent ||
      !targetAgent.presence ||
      targetAgent.presence.status === "OFFLINE"
    ) {
      return { ok: false, error: "הנציג שנבחר אינו מחובר כעת." };
    }

    const targetAgentName = displayAgentName(targetAgent);
    const transferNote = note?.trim().slice(0, 2000) || null;
    const expectedOwnerId = supportSession.technicianId;

    const transferred = await prisma.$transaction(async (tx) => {
      const ownershipUpdate = await tx.supportSession.updateMany({
        where: {
          id: sessionId,
          status: "ACTIVE",
          technicianId: expectedOwnerId,
        },
        data: { technicianId: targetAgentId },
      });

      if (ownershipUpdate.count === 0) return false;

      await tx.supportTransfer.create({
        data: {
          sessionId,
          fromAgentId: user.id,
          toAgentId: targetAgentId,
          note: transferNote,
          status: "COMPLETED",
        },
      });

      await tx.internalSupportMessage.create({
        data: {
          senderId: user.id,
          recipientId: targetAgentId,
          sessionId,
          content: transferNote
            ? `הטיפול בפנייה הועבר אליך. הערת העברה: ${transferNote}`
            : "הטיפול בפנייה הועבר אליך.",
        },
      });

      await tx.supportActivity.create({
        data: {
          sessionId,
          actorId: user.id,
          type: "TRANSFERRED",
          message: `הפנייה הועברה לטיפול של ${targetAgentName}`,
        },
      });

      if (expectedOwnerId) {
        await recomputePresenceAfterSessionLoss(tx, expectedOwnerId);
      }
      await recomputePresenceAfterSessionGain(tx, targetAgentId);

      return true;
    });

    if (!transferred) {
      return { ok: false, error: "הפנייה הועברה בינתיים על ידי נציג אחר." };
    }

    revalidatePath("/support/agent");
    revalidatePath("/portal");
    return { ok: true, data: { targetAgentName } };
  } catch (error) {
    console.error("transferSupportSession failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function getSupportTransferHistory(
  sessionId: string,
): Promise<ActionResult<SupportTransferView[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const supportSession = await prisma.supportSession.findUnique({
      where: { id: sessionId },
      select: { technicianId: true },
    });

    if (
      !supportSession ||
      !(await canCollaborateOnSession(sessionId, supportSession.technicianId, user))
    ) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const transfers = await prisma.supportTransfer.findMany({
      where: { sessionId },
      include: {
        fromAgent: { select: { name: true, displayName: true } },
        toAgent: { select: { name: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      ok: true,
      data: transfers.map((transfer) => ({
        id: transfer.id,
        fromAgentName: displayAgentName(transfer.fromAgent),
        toAgentName: displayAgentName(transfer.toAgent),
        note: transfer.note,
        status: transfer.status,
        createdAt: transfer.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getSupportTransferHistory failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type SupportActivityView = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

function mapActivity(activity: {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
}): SupportActivityView {
  return {
    id: activity.id,
    type: activity.type,
    message: activity.message,
    createdAt: activity.createdAt.toISOString(),
  };
}

export async function getMySupportActivity(
  sessionId: string,
): Promise<ActionResult<SupportActivityView[]>> {
  const session = await getServerSession(authOptions);
  const customerId = session?.user?.id as string | undefined;
  if (!customerId) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const supportSession = await prisma.supportSession.findUnique({
      where: { id: sessionId },
      select: { customerId: true },
    });
    if (!supportSession || supportSession.customerId !== customerId) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const activities = await prisma.supportActivity.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return { ok: true, data: activities.map(mapActivity) };
  } catch (error) {
    console.error("getMySupportActivity failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function getStaffSupportActivity(
  sessionId: string,
): Promise<ActionResult<SupportActivityView[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const supportSession = await prisma.supportSession.findUnique({
      where: { id: sessionId },
      select: { technicianId: true },
    });
    if (
      !supportSession ||
      !(await canCollaborateOnSession(sessionId, supportSession.technicianId, user))
    ) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const activities = await prisma.supportActivity.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return { ok: true, data: activities.map(mapActivity) };
  } catch (error) {
    console.error("getStaffSupportActivity failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function resolveSupportSession(
  sessionId: string,
): Promise<ActionResult<AgentStatusChange | null>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const supportSession = await prisma.supportSession.findUnique({
      where: { id: sessionId },
      select: { technicianId: true, status: true },
    });
    if (
      !supportSession ||
      supportSession.status !== "ACTIVE" ||
      (supportSession.technicianId !== user.id && user.role !== "ADMINISTRATOR")
    ) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const technicianId = supportSession.technicianId;

    const outcome = await prisma.$transaction(async (tx) => {
      await tx.supportSession.update({
        where: { id: sessionId },
        data: { status: "RESOLVED", closedAt: new Date() },
      });
      await tx.supportActivity.create({
        data: {
          sessionId,
          actorId: user.id,
          type: "RESOLVED",
          message: "הבעיה נפתרה",
        },
      });

      if (!technicianId) return null;
      return recomputePresenceAfterSessionLoss(tx, technicianId);
    });

    revalidatePath("/support/agent");
    revalidatePath("/portal");

    if (!outcome || technicianId !== user.id) {
      return { ok: true, data: null };
    }

    const change: AgentStatusChange = {
      agentStatus: outcome.status,
      message:
        outcome.status === "AVAILABLE"
          ? "הסטטוס חזר לזמין לקבלת פניות."
          : outcome.status === "OFFLINE" && outcome.mode === "MANUAL"
            ? "הסטטוס נשאר לא זמין לפי הבחירה הידנית שלך."
            : null,
    };
    return { ok: true, data: change };
  } catch (error) {
    console.error("resolveSupportSession failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}


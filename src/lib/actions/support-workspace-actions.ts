"use server";

import { getServerSession } from "next-auth";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/support-labels";
import { normalizeAgentStatus, type AgentStatus } from "@/lib/support-types";
import {
  cleanupExpiredSupportSessions,
  type ActiveChat,
  type AgentMetrics,
  type PendingChatRequest,
} from "@/lib/actions/support-chat-actions";
import type { ConnectedSupportAgent } from "@/lib/actions/support-team-actions";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type SupportWorkspaceSnapshot = {
  status: AgentStatus;
  pending: PendingChatRequest[];
  active: ActiveChat[];
  metrics: AgentMetrics;
  agents: ConnectedSupportAgent[];
};

const GENERIC_ERROR = "לא ניתן לטעון את סביבת התמיכה כרגע. נסו שוב בעוד מספר רגעים.";
const PRESENCE_WINDOW_MS = 2 * 60 * 1000;
const SPECIALTY_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "לקוח",
  SUPPORT_AGENT: "תמיכה כללית",
  TECHNICIAN: "תמיכה טכנית",
  TEAM_LEADER: "ניהול והסלמות",
  CLOUD_ENGINEER: "תשתיות וענן",
  ADMINISTRATOR: "ניהול מערכת",
};

export async function getSupportWorkspaceSnapshot(): Promise<ActionResult<SupportWorkspaceSnapshot>> {
  const startedAt = performance.now();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !STAFF_ROLES.includes(session.user.role as Role)) {
    return { ok: false, error: "UNAUTHORIZED" };
  }
  const userId = session.user.id as string;

  try {
    await cleanupExpiredSupportSessions();
    await prisma.technicianPresence.updateMany({
      where: { technicianId: userId },
      data: { lastSeenAt: new Date() },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const cutoff = new Date(Date.now() - PRESENCE_WINDOW_MS);

    const [presence, pendingRows, activeRows, closedTodayCount, handledSessions, agentRows] =
      await Promise.all([
        prisma.technicianPresence.findUnique({ where: { technicianId: userId } }),
        prisma.supportSession.findMany({
          where: { technicianId: null, status: "PENDING" },
          orderBy: { createdAt: "asc" },
          include: { customer: { select: { name: true, email: true } } },
        }),
        prisma.supportSession.findMany({
          where: { technicianId: userId, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          include: { customer: { select: { name: true, email: true } } },
        }),
        prisma.supportSession.count({
          where: {
            technicianId: userId,
            status: { in: ["RESOLVED", "CLOSED"] },
            updatedAt: { gte: startOfToday },
          },
        }),
        prisma.supportSession.findMany({
          where: {
            technicianId: userId,
            createdAt: { gte: startOfToday },
            status: { in: ["ACTIVE", "CLOSED", "RESOLVED"] },
          },
          select: {
            createdAt: true,
            messages: {
              where: { senderId: userId },
              orderBy: { createdAt: "asc" },
              take: 1,
              select: { createdAt: true },
            },
          },
        }),
        prisma.user.findMany({
          where: {
            role: { in: STAFF_ROLES },
            status: "ACTIVE",
            presence: { isNot: null },
          },
          include: {
            presence: true,
            _count: { select: { technicianSessions: { where: { status: "ACTIVE" } } } },
          },
          orderBy: { name: "asc" },
        }),
      ]);

    const pending: PendingChatRequest[] = pendingRows.map((row) => ({
      id: row.id,
      customerName: row.customer?.name ?? null,
      customerEmail: row.customer?.email ?? null,
      category: row.category,
      summary: row.summary,
      createdAt: row.createdAt.toISOString(),
    }));
    const active: ActiveChat[] = activeRows.map((row) => ({
      id: row.id,
      customerName: row.customer?.name ?? null,
      customerEmail: row.customer?.email ?? null,
      category: row.category,
      summary: row.summary,
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt?.toISOString() ?? null,
    }));
    const responseTimes = handledSessions.flatMap((row) =>
      row.messages[0]
        ? [(row.messages[0].createdAt.getTime() - row.createdAt.getTime()) / 60_000]
        : [],
    );
    const metrics: AgentMetrics = {
      pendingCount: pending.length,
      activeCount: active.length,
      closedTodayCount,
      avgResponseMinutes:
        responseTimes.length > 0
          ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
          : 0,
    };
    const agents: ConnectedSupportAgent[] = agentRows
      .filter(
        (agent) =>
          agent.presence &&
          agent.presence.status !== "OFFLINE" &&
          agent.presence.lastSeenAt >= cutoff,
      )
      .map((agent) => ({
        id: agent.id,
        name: agent.displayName?.trim() || agent.name?.trim() || "נציג/ת AMK",
        imageUrl: agent.profileImageUrl,
        role: ROLE_LABELS[agent.role] ?? agent.role,
        status: normalizeAgentStatus(agent.presence?.status),
        activeConversationCount: agent._count.technicianSessions,
        specialty: agent.supportSpecialty?.trim() || SPECIALTY_BY_ROLE[agent.role],
        isCurrent: agent.id === userId,
        lastSeenAt: agent.presence!.lastSeenAt.toISOString(),
      }))
      .sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        if (a.status === "AVAILABLE" && b.status !== "AVAILABLE") return -1;
        if (b.status === "AVAILABLE" && a.status !== "AVAILABLE") return 1;
        return a.name.localeCompare(b.name, "he");
      });

    if (process.env.NODE_ENV === "development") {
      console.info(`[perf] support-workspace ${Math.round(performance.now() - startedAt)}ms`);
    }
    return {
      ok: true,
      data: { status: normalizeAgentStatus(presence?.status), pending, active, metrics, agents },
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("getSupportWorkspaceSnapshot failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

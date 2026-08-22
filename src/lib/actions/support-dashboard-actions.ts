"use server";

import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/support-labels";
import { normalizeAgentStatus, type AgentStatus } from "@/lib/support-types";
import { cleanupExpiredSupportSessions } from "@/lib/actions/support-chat-actions";
import type { ConnectedSupportAgent } from "@/lib/actions/support-team-actions";
import {
  calculateRequestPriority,
  type RequestPriorityLevel,
  type RequestSlaRisk,
} from "@/lib/support/calculate-request-priority";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const PRESENCE_WINDOW_MS = 2 * 60 * 1000;
const PRIORITY_QUEUE_LIMIT = 50;

const SPECIALTY_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "לקוח",
  SUPPORT_AGENT: "תמיכה כללית",
  TECHNICIAN: "תמיכה טכנית",
  TEAM_LEADER: "ניהול והסלמות",
  CLOUD_ENGINEER: "תשתיות וענן",
  ADMINISTRATOR: "ניהול מערכת",
};

export type RequestAssignment = "UNASSIGNED" | "MINE" | "OTHER_AGENT";

export type PriorityRequest = {
  id: string;
  customerName: string | null;
  subject: string | null;
  category: string | null;
  level: RequestPriorityLevel;
  slaRisk: RequestSlaRisk;
  assignment: RequestAssignment;
  awaitingStaff: boolean;
  waitingMinutes: number;
  lastActivityAt: string;
  createdAt: string;
  /** Internal ordering signal; not surfaced in the UI. */
  score: number;
};

export type MyActiveItem = {
  id: string;
  customerName: string | null;
  subject: string | null;
  category: string | null;
  awaitingStaff: boolean;
  lastActivityAt: string;
};

export type DashboardBreakdownEntry = {
  key: string;
  label: string;
  count: number;
};

export type TeamWorkloadEntry = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  activeConversationCount: number;
  isCurrent: boolean;
};

export type SupportDashboardMetrics = {
  activeCount: number;
  pendingCount: number;
  criticalCount: number;
  closedTodayCount: number;
  avgResponseMinutes: number;
  slaBreachCount: number;
};

export type SupportDashboardData = {
  metrics: SupportDashboardMetrics;
  priorityRequests: PriorityRequest[];
  myActiveItems: MyActiveItem[];
  connectedAgents: ConnectedSupportAgent[];
  breakdownByService: DashboardBreakdownEntry[];
  breakdownByStatus: DashboardBreakdownEntry[];
  breakdownByPriority: DashboardBreakdownEntry[];
  teamWorkload: TeamWorkloadEntry[];
};

const PRIORITY_LABELS: Record<RequestPriorityLevel, string> = {
  CRITICAL: "קריטי",
  HIGH: "גבוה",
  MEDIUM: "בינוני",
  LOW: "נמוך",
};

const PRIORITY_ORDER: RequestPriorityLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export async function getSupportDashboardData(): Promise<ActionResult<SupportDashboardData>> {
  const startedAt = performance.now();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !STAFF_ROLES.includes(session.user.role as Role)) {
    return { ok: false, error: "UNAUTHORIZED" };
  }
  const userId = session.user.id as string;
  const now = new Date();

  try {
    await cleanupExpiredSupportSessions();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const presenceCutoff = new Date(Date.now() - PRESENCE_WINDOW_MS);

    const [openRows, closedTodayCount, handledSessions, agentRows] = await Promise.all([
      // Single query for the whole operational queue. The `messages` peek and
      // `_count` are correlated sub-selects (one round-trip), not an N+1.
      prisma.supportSession.findMany({
        where: { status: { in: ["PENDING", "ACTIVE"] } },
        select: {
          id: true,
          status: true,
          category: true,
          subject: true,
          createdAt: true,
          technicianId: true,
          customer: { select: { name: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { senderRole: true, createdAt: true },
          },
          _count: { select: { transfers: true } },
        },
        orderBy: { createdAt: "asc" },
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
        where: { role: { in: STAFF_ROLES }, status: "ACTIVE", presence: { isNot: null } },
        select: {
          id: true,
          name: true,
          displayName: true,
          profileImageUrl: true,
          role: true,
          supportSpecialty: true,
          presence: { select: { status: true, lastSeenAt: true } },
          _count: { select: { technicianSessions: { where: { status: "ACTIVE" } } } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    // ---- Priority queue --------------------------------------------------
    const scored = openRows.map((row) => {
      const lastMessage = row.messages[0] ?? null;
      const lastMessageFromCustomer = lastMessage?.senderRole === "CUSTOMER";
      const isAssigned = row.technicianId !== null;
      const priority = calculateRequestPriority({
        status: row.status,
        createdAt: row.createdAt,
        lastMessageAt: lastMessage?.createdAt ?? null,
        lastMessageFromCustomer,
        isAssigned,
        transferCount: row._count.transfers,
        now,
      });

      const assignment: RequestAssignment = !isAssigned
        ? "UNASSIGNED"
        : row.technicianId === userId
          ? "MINE"
          : "OTHER_AGENT";
      const awaitingStaff = lastMessageFromCustomer || !isAssigned;

      return {
        request: {
          id: row.id,
          customerName: row.customer?.name ?? null,
          subject: row.subject,
          category: row.category,
          level: priority.level,
          slaRisk: priority.slaRisk,
          assignment,
          awaitingStaff,
          waitingMinutes: priority.waitingMinutes,
          lastActivityAt: (lastMessage?.createdAt ?? row.createdAt).toISOString(),
          createdAt: row.createdAt.toISOString(),
          score: priority.score,
        } satisfies PriorityRequest,
        row,
        isAssigned,
        awaitingStaff,
      };
    });

    scored.sort((a, b) =>
      b.request.score - a.request.score || b.request.waitingMinutes - a.request.waitingMinutes,
    );

    const priorityRequests = scored.slice(0, PRIORITY_QUEUE_LIMIT).map((entry) => entry.request);

    // ---- Metrics ---------------------------------------------------------
    const myActiveEntries = scored.filter(
      (entry) => entry.row.status === "ACTIVE" && entry.row.technicianId === userId,
    );
    const pendingCount = scored.filter((entry) => entry.row.status === "PENDING").length;
    const criticalCount = scored.filter((entry) => entry.request.level === "CRITICAL").length;
    const slaBreachCount = scored.filter((entry) => entry.request.slaRisk === "BREACHED").length;

    const responseTimes = handledSessions.flatMap((row) =>
      row.messages[0]
        ? [(row.messages[0].createdAt.getTime() - row.createdAt.getTime()) / 60_000]
        : [],
    );
    const avgResponseMinutes =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
        : 0;

    const metrics: SupportDashboardMetrics = {
      activeCount: myActiveEntries.length,
      pendingCount,
      criticalCount,
      closedTodayCount,
      avgResponseMinutes,
      slaBreachCount,
    };

    // ---- My active work --------------------------------------------------
    const myActiveItems: MyActiveItem[] = myActiveEntries
      .sort((a, b) => b.request.waitingMinutes - a.request.waitingMinutes)
      .map((entry) => ({
        id: entry.request.id,
        customerName: entry.request.customerName,
        subject: entry.request.subject,
        category: entry.request.category,
        awaitingStaff: entry.awaitingStaff,
        lastActivityAt: entry.request.lastActivityAt,
      }));

    // ---- Breakdowns (derived in JS from the single open-queue query) -----
    const serviceCounts = new Map<string, number>();
    for (const entry of scored) {
      const label = entry.row.category?.trim() || "אחר";
      serviceCounts.set(label, (serviceCounts.get(label) ?? 0) + 1);
    }
    const breakdownByService: DashboardBreakdownEntry[] = [...serviceCounts.entries()]
      .map(([label, count]) => ({ key: label, label, count }))
      .sort((a, b) => b.count - a.count);

    let newCount = 0;
    let inTreatmentCount = 0;
    let waitingCustomerCount = 0;
    for (const entry of scored) {
      if (entry.row.status === "PENDING") newCount += 1;
      else if (entry.awaitingStaff) inTreatmentCount += 1;
      else waitingCustomerCount += 1;
    }
    const breakdownByStatus: DashboardBreakdownEntry[] = [
      { key: "NEW", label: "חדש", count: newCount },
      { key: "IN_TREATMENT", label: "בטיפול", count: inTreatmentCount },
      { key: "WAITING_CUSTOMER", label: "ממתין ללקוח", count: waitingCustomerCount },
      { key: "CLOSED_TODAY", label: "נסגר היום", count: closedTodayCount },
    ];

    const priorityCounts = new Map<RequestPriorityLevel, number>();
    for (const entry of scored) {
      priorityCounts.set(entry.request.level, (priorityCounts.get(entry.request.level) ?? 0) + 1);
    }
    const breakdownByPriority: DashboardBreakdownEntry[] = PRIORITY_ORDER.map((level) => ({
      key: level,
      label: PRIORITY_LABELS[level],
      count: priorityCounts.get(level) ?? 0,
    }));

    // ---- Connected agents + team workload --------------------------------
    const connectedAgents: ConnectedSupportAgent[] = agentRows
      .filter(
        (agent) =>
          agent.presence &&
          agent.presence.status !== "OFFLINE" &&
          agent.presence.lastSeenAt >= presenceCutoff,
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

    const teamWorkload: TeamWorkloadEntry[] = connectedAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: agent.status,
      activeConversationCount: agent.activeConversationCount,
      isCurrent: agent.isCurrent,
    }));

    if (process.env.NODE_ENV === "development") {
      console.info(`[perf] support-dashboard ${Math.round(performance.now() - startedAt)}ms`);
    }

    return {
      ok: true,
      data: {
        metrics,
        priorityRequests,
        myActiveItems,
        connectedAgents,
        breakdownByService,
        breakdownByStatus,
        breakdownByPriority,
        teamWorkload,
      },
    };
  } catch (error) {
    const correlationId = randomUUID().slice(0, 8).toUpperCase();
    console.error(`[ERR-${correlationId}] getSupportDashboardData failed:`, error);
    return {
      ok: false,
      error: `לא הצלחנו לטעון את נתוני הלוח (קוד: ERR-${correlationId}). נסו שוב בעוד מספר רגעים.`,
    };
  }
}

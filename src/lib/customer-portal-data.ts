import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCustomerProfileById, type CustomerProfile } from "@/lib/customer-profile-data";
import type { CustomerSectionKey } from "@/lib/customer-portal-sections";
import type { MyRequestSummary } from "@/lib/actions/support-chat-actions";
import { devPerfReset, devPerfSummary } from "@/lib/dev-perf";

export type CustomerPortalActivityItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  sessionId: string;
};

export type CustomerPortalInitialData = {
  displayName: string | null;
  profileImageUrl: string | null;
  openRequestsCount: number;
  inProgressCount: number;
  waitingCustomerCount: number;
  activeServicesCount: number;
  recentUpdatesCount: number;
  recentRequests: MyRequestSummary[];
  recentActivities: CustomerPortalActivityItem[];
  supportAvailable: boolean | null;
  profile: CustomerProfile | null;
};

export type PortalShellData = {
  displayName: string | null;
  profileImageUrl: string | null;
  openRequestsCount: number;
};

const OPEN_STATUSES = ["PENDING", "NEW", "ACTIVE", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_CUSTOMER", "WAITING_INTERNAL"];

export const getPortalShellData = cache(async (userId: string): Promise<PortalShellData> => {
  const [basicUser, openRequestsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, displayName: true, profileImageUrl: true },
    }),
    prisma.supportSession.count({
      where: { customerId: userId, status: { in: OPEN_STATUSES } },
    }),
  ]);

  return {
    displayName: basicUser?.displayName?.trim() || basicUser?.name?.trim() || null,
    profileImageUrl: basicUser?.profileImageUrl ?? null,
    openRequestsCount,
  };
});

function requestSummary(session: {
  id: string;
  subject: string | null;
  category: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}): MyRequestSummary {
  return {
    id: session.id,
    subject: session.subject,
    category: session.category,
    status: session.status,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    closedAt: session.closedAt?.toISOString() ?? null,
  };
}

export async function loadCustomerPortalData(
  userId: string,
  activeSection: CustomerSectionKey,
): Promise<CustomerPortalInitialData> {
  const startedAt = performance.now();
  devPerfReset();

  const isOverview = activeSection === "overview";
  const needsRequests = isOverview || activeSection === "requests";
  const needsAvailability = isOverview || activeSection === "chat";
  const needsFullProfile = activeSection === "settings";

  const [
    shell,
    inProgressCount,
    waitingCustomerCount,
    activeServicesCount,
    recentSessions,
    recentActivities,
    availableAgent,
    profile,
  ] = await Promise.all([
    getPortalShellData(userId),
    isOverview
      ? prisma.supportSession.count({
          where: { customerId: userId, status: { in: ["ACTIVE", "IN_PROGRESS"] } },
        })
      : Promise.resolve(0),
    isOverview
      ? prisma.supportSession.count({
          where: { customerId: userId, status: { in: ["WAITING_FOR_CUSTOMER", "WAITING_CUSTOMER"] } },
        })
      : Promise.resolve(0),
    isOverview
      ? prisma.service.count({
          where: { status: "ACTIVE" },
        })
      : Promise.resolve(0),
    needsRequests
      ? prisma.supportSession.findMany({
          where: { customerId: userId, status: { not: "AI_CHAT" } },
          select: {
            id: true,
            subject: true,
            category: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            closedAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: isOverview ? 5 : 50,
        })
      : Promise.resolve([]),
    isOverview
      ? prisma.supportActivity.findMany({
          where: { session: { customerId: userId } },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            type: true,
            message: true,
            createdAt: true,
            sessionId: true,
          },
        })
      : Promise.resolve([]),
    needsAvailability
      ? prisma.technicianPresence.findFirst({
          where: { status: "AVAILABLE" },
          select: { id: true },
        })
      : Promise.resolve(null),
    needsFullProfile ? getCustomerProfileById(userId) : Promise.resolve(null),
  ]);

  if (process.env.NODE_ENV === "development") {
    const summary = devPerfSummary();
    console.info(
      `[perf] portal:${activeSection} data ${Math.round(performance.now() - startedAt)}ms | queries: ${summary?.count ?? 0}` +
        (summary?.slowest ? ` | slowest: ${summary.slowest.durationMs}ms "${summary.slowest.query}"` : ""),
    );
  }

  return {
    displayName: shell.displayName,
    profileImageUrl: shell.profileImageUrl,
    openRequestsCount: shell.openRequestsCount,
    inProgressCount,
    waitingCustomerCount,
    activeServicesCount,
    recentUpdatesCount: 2, // Announcements / maintenance notifications
    recentRequests: recentSessions.map(requestSummary),
    recentActivities: recentActivities.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      createdAt: a.createdAt.toISOString(),
      sessionId: a.sessionId,
    })),
    supportAvailable: needsAvailability ? Boolean(availableAgent) : null,
    profile,
  };
}

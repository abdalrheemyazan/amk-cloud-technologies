import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCustomerProfileById, type CustomerProfile } from "@/lib/customer-profile-data";
import type { CustomerSectionKey } from "@/lib/customer-portal-sections";
import type { MyRequestSummary } from "@/lib/actions/support-chat-actions";
import { devPerfReset, devPerfSummary } from "@/lib/dev-perf";

export type CustomerPortalInitialData = {
  displayName: string | null;
  profileImageUrl: string | null;
  openRequestsCount: number;
  recentRequests: MyRequestSummary[];
  supportAvailable: boolean | null;
  profile: CustomerProfile | null;
};

export type PortalShellData = {
  displayName: string | null;
  profileImageUrl: string | null;
  openRequestsCount: number;
};

const OPEN_STATUSES = ["PENDING", "ACTIVE"];

// The persistent portal layout (sidebar/user card/badge) and the active
// section's page both need this — React's cache() dedupes it to a single
// DB round trip per request instead of fetching it twice.
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
  // Reset here (not inside getPortalShellData) so the count below covers every
  // query this navigation issues, including the shell query when it isn't cached yet.
  devPerfReset();
  const needsRequests = activeSection === "overview" || activeSection === "requests";
  const needsAvailability = activeSection === "overview" || activeSection === "chat";
  const needsFullProfile = activeSection === "settings";

  const [shell, recentSessions, availableAgent, profile] = await Promise.all([
    getPortalShellData(userId),
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
          take: activeSection === "overview" ? 3 : 20,
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
    recentRequests: recentSessions.map(requestSummary),
    supportAvailable: needsAvailability ? Boolean(availableAgent) : null,
    profile,
  };
}

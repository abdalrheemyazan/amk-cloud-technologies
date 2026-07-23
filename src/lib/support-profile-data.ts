import "server-only";

import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/support-labels";
import { SUPPORT_TEMPLATE_DEFAULTS, type SupportAgentProfile } from "@/lib/support-profile";
import { normalizeAgentStatus } from "@/lib/support-types";

export const SUPPORT_PROFILE_SELECT = {
  name: true,
  displayName: true,
  email: true,
  role: true,
  phone: true,
  department: true,
  supportSpecialty: true,
  supportLanguages: true,
  openingMessageTemplate: true,
  detailsRequestTemplate: true,
  waitingMessageTemplate: true,
  closingMessageTemplate: true,
  maxActiveChats: true,
  defaultAvailabilityStatus: true,
  autoAwayMinutes: true,
  newRequestNotifications: true,
  profileImageUrl: true,
} as const;

type SupportProfileRow = {
  name: string | null;
  displayName: string | null;
  email: string;
  role: Role;
  phone: string | null;
  department: string | null;
  supportSpecialty: string | null;
  supportLanguages: string[];
  openingMessageTemplate: string | null;
  detailsRequestTemplate: string | null;
  waitingMessageTemplate: string | null;
  closingMessageTemplate: string | null;
  maxActiveChats: number;
  defaultAvailabilityStatus: string;
  autoAwayMinutes: number | null;
  newRequestNotifications: boolean;
  profileImageUrl: string | null;
};

export function supportProfileFromUser(user: SupportProfileRow): SupportAgentProfile {
  return {
    name: user.name?.trim() || "",
    displayName: user.displayName?.trim() || user.name?.trim() || "",
    email: user.email,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] ?? user.role,
    phone: user.phone?.trim() || "",
    department: user.department?.trim() || "",
    specialty: user.supportSpecialty?.trim() || "",
    supportLanguages: user.supportLanguages,
    openingMessage: user.openingMessageTemplate || SUPPORT_TEMPLATE_DEFAULTS.openingMessage,
    detailsRequest: user.detailsRequestTemplate || SUPPORT_TEMPLATE_DEFAULTS.detailsRequest,
    waitingMessage: user.waitingMessageTemplate || SUPPORT_TEMPLATE_DEFAULTS.waitingMessage,
    closingMessage: user.closingMessageTemplate || SUPPORT_TEMPLATE_DEFAULTS.closingMessage,
    maxActiveChats: user.maxActiveChats,
    defaultAvailabilityStatus: normalizeAgentStatus(user.defaultAvailabilityStatus),
    autoAwayMinutes: user.autoAwayMinutes,
    newRequestNotifications: user.newRequestNotifications,
    profileImageUrl: user.profileImageUrl,
  };
}

export async function getSupportProfileById(userId: string) {
  const startedAt = performance.now();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SUPPORT_PROFILE_SELECT,
  });
  if (process.env.NODE_ENV === "development") {
    console.info(`[perf] support-agent-profile ${Math.round(performance.now() - startedAt)}ms`);
  }
  return user && STAFF_ROLES.includes(user.role) ? supportProfileFromUser(user) : null;
}

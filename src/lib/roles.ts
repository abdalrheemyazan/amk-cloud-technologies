import { Role } from "@prisma/client";

export const STAFF_ROLES: Role[] = [
  Role.ADMINISTRATOR,
  Role.SUPPORT_AGENT,
  Role.TECHNICIAN,
  Role.TEAM_LEADER,
  Role.CLOUD_ENGINEER,
];

export function isStaffRole(role: string | null | undefined): boolean {
  return !!role && (STAFF_ROLES as string[]).includes(role);
}

export function getPostLoginRedirect(role: string | null | undefined): string {
  return isStaffRole(role) ? "/support/agent" : "/portal";
}

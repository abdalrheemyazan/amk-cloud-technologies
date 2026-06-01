export const ROLES = {
  ADMINISTRATOR: "ADMINISTRATOR",
  TEAM_LEADER: "TEAM_LEADER", // Equivalent to Admin/Elevated Support
  CLOUD_ENGINEER: "CLOUD_ENGINEER", // Equivalent to Technician
  TECHNICIAN: "TECHNICIAN",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  CUSTOMER: "CUSTOMER",
} as const;

export type Role = keyof typeof ROLES;

export const roleGroups = {
  admin: [ROLES.ADMINISTRATOR, ROLES.TEAM_LEADER],
  technical: [ROLES.ADMINISTRATOR, ROLES.TEAM_LEADER, ROLES.CLOUD_ENGINEER, ROLES.TECHNICIAN],
  support: [ROLES.ADMINISTRATOR, ROLES.TEAM_LEADER, ROLES.SUPPORT_AGENT],
  internal: [
    ROLES.ADMINISTRATOR,
    ROLES.TEAM_LEADER,
    ROLES.CLOUD_ENGINEER,
    ROLES.TECHNICIAN,
    ROLES.SUPPORT_AGENT,
  ],
  customer: [ROLES.CUSTOMER],
};

export const hasPermission = (userRole: string, allowedRoles: string[]) => {
  return allowedRoles.includes(userRole);
};

export type TicketMessageItem = {
  id: string;
  message: string;
  createdAt: Date;
  senderName: string | null;
  isFromCustomer: boolean;
};

export type TechnicianTicket = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  agentId: string | null;
  agentName: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerCompany: string | null;
  messages: TicketMessageItem[];
};

export type TechnicianNoteItem = {
  id: string;
  content: string;
  createdAt: Date;
};

export type AgentStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

export function normalizeAgentStatus(status: string | null | undefined): AgentStatus {
  if (status === "AVAILABLE") return "AVAILABLE";

  if (status === "BUSY" || status === "IN_TICKET" || status === "IN_REMOTE_SESSION") {
    return "BUSY";
  }

  return "OFFLINE";
}

export type SupportSectionKey =
  | "dashboard"
  | "my-tasks"
  | "remote-support"
  | "active-customers"
  | "quick-solutions"
  | "technical-tools"
  | "treatment-notes"
  | "treatment-history"
  | "settings";

export const DEFAULT_SUPPORT_SECTION: SupportSectionKey = "dashboard";

export const SUPPORT_SECTIONS: SupportSectionKey[] = [
  "dashboard",
  "my-tasks",
  "remote-support",
  "active-customers",
  "quick-solutions",
  "technical-tools",
  "treatment-notes",
  "treatment-history",
  "settings",
];

export function isSupportSectionKey(value: string | null | undefined): value is SupportSectionKey {
  return !!value && (SUPPORT_SECTIONS as string[]).includes(value);
}

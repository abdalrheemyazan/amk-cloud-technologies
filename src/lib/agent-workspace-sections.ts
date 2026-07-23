import {
  LayoutDashboard,
  Inbox,
  MessageSquare,
  Users,
  MessageSquareText,
  Lightbulb,
  Wrench,
  StickyNote,
  History,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";

export type AgentSectionKey =
  | "dashboard"
  | "new-requests"
  | "active-chats"
  | "customers-in-treatment"
  | "canned-replies"
  | "quick-solutions"
  | "technical-tools"
  | "treatment-notes"
  | "history"
  | "availability-settings";

export const DEFAULT_AGENT_SECTION: AgentSectionKey = "dashboard";

export const AGENT_NAV_ITEMS: { key: AgentSectionKey; label: string; icon: LucideIcon }[] = [
  { key: "dashboard", label: "לוח תמיכה", icon: LayoutDashboard },
  { key: "new-requests", label: "בקשות חדשות", icon: Inbox },
  { key: "active-chats", label: "שיחות פעילות", icon: MessageSquare },
  { key: "customers-in-treatment", label: "לקוחות בטיפול", icon: Users },
  { key: "canned-replies", label: "תגובות מוכנות", icon: MessageSquareText },
  { key: "quick-solutions", label: "פתרונות מהירים", icon: Lightbulb },
  { key: "technical-tools", label: "כלים טכניים", icon: Wrench },
  { key: "treatment-notes", label: "הערות טיפול", icon: StickyNote },
  { key: "history", label: "היסטוריית שיחות", icon: History },
  { key: "availability-settings", label: "הגדרות אישיות", icon: UserRoundCog },
];

export function isAgentSectionKey(value: string): value is AgentSectionKey {
  return AGENT_NAV_ITEMS.some((item) => item.key === value);
}

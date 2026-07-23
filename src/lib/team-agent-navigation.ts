import {
  History,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  MessageSquareText,
  StickyNote,
  UserRoundCog,
  Users,
  Wrench,
} from "lucide-react";
import type { AgentSectionKey } from "@/lib/agent-workspace-sections";

export const TEAM_AGENT_NAV_ITEMS: Array<{
  key: AgentSectionKey;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
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


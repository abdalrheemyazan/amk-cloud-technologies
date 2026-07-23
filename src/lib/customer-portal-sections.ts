import {
  Bell,
  ContactRound,
  FileText,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  Server,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";

export type CustomerNavSectionKey =
  | "overview"
  | "services"
  | "new-request"
  | "requests"
  | "chat"
  | "documents"
  | "updates"
  | "settings"
  | "contact";

export type CustomerSectionKey = CustomerNavSectionKey;

export const DEFAULT_CUSTOMER_SECTION: CustomerNavSectionKey = "overview";

export const CUSTOMER_NAV_ITEMS: { key: CustomerNavSectionKey; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "סקירה כללית", icon: LayoutDashboard },
  { key: "services", label: "השירותים שלי", icon: Server },
  { key: "new-request", label: "פתיחת פנייה", icon: PlusCircle },
  { key: "requests", label: "הפניות שלי", icon: Inbox },
  { key: "chat", label: "צ׳אט תמיכה", icon: MessageCircle },
  { key: "documents", label: "מסמכים וקבצים", icon: FileText },
  { key: "updates", label: "הודעות ועדכונים", icon: Bell },
  { key: "settings", label: "הגדרות אישיות", icon: UserRoundCog },
  { key: "contact", label: "צור קשר", icon: ContactRound },
];

export const CUSTOMER_NAV_GROUPS: { label: string; keys: CustomerNavSectionKey[] }[] = [
  { label: "ראשי", keys: ["overview", "services"] },
  { label: "תמיכה", keys: ["new-request", "requests", "chat"] },
  { label: "משאבים", keys: ["documents", "updates", "contact"] },
  { label: "חשבון", keys: ["settings"] },
];

export const CUSTOMER_SECTION_HREFS: Record<CustomerSectionKey, string> = {
  overview: "/portal",
  services: "/portal/services",
  "new-request": "/portal/new-request",
  requests: "/portal/requests",
  chat: "/portal/chat",
  documents: "/portal/documents",
  updates: "/portal/updates",
  settings: "/portal/settings",
  contact: "/portal/contact",
};

export function isCustomerSectionKey(value: string | null | undefined): value is CustomerSectionKey {
  return !!value && CUSTOMER_NAV_ITEMS.some((item) => item.key === value);
}

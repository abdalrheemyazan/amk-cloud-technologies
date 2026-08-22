import {
  Bell,
  ContactRound,
  FileText,
  Inbox,
  LayoutDashboard,
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
  | "documents"
  | "updates"
  | "settings"
  | "contact";

export type CustomerSectionKey = CustomerNavSectionKey | "chat";

export const DEFAULT_CUSTOMER_SECTION: CustomerNavSectionKey = "overview";

export const CUSTOMER_NAV_ITEMS: { key: CustomerNavSectionKey; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "סקירה כללית", icon: LayoutDashboard },
  { key: "services", label: "השירותים שלי", icon: Server },
  { key: "new-request", label: "פתיחת פנייה", icon: PlusCircle },
  { key: "requests", label: "הפניות שלי", icon: Inbox },
  { key: "documents", label: "מסמכים וקבצים", icon: FileText },
  { key: "updates", label: "הודעות ועדכונים", icon: Bell },
  { key: "settings", label: "הגדרות אישיות", icon: UserRoundCog },
  { key: "contact", label: "צור קשר", icon: ContactRound },
];

export const CUSTOMER_NAV_GROUPS: { label: string; keys: CustomerNavSectionKey[] }[] = [
  { label: "ראשי", keys: ["overview", "services"] },
  { label: "תמיכה", keys: ["new-request", "requests"] },
  { label: "משאבים", keys: ["documents", "updates", "contact"] },
  { label: "חשבון", keys: ["settings"] },
];

export const CUSTOMER_SECTION_HREFS: Record<CustomerSectionKey, string> = {
  overview: "/portal",
  services: "/portal/services",
  "new-request": "/portal/new-request",
  requests: "/portal/requests",
  chat: "/portal/requests",
  documents: "/portal/documents",
  updates: "/portal/updates",
  settings: "/portal/settings",
  contact: "/portal/contact",
};

export function isCustomerSectionKey(value: string | null | undefined): value is CustomerSectionKey {
  return !!value && CUSTOMER_NAV_ITEMS.some((item) => item.key === value);
}

// Lets the persistent portal shell (rendered once in layout.tsx) figure out
// which nav item is active from the URL alone, instead of every page having
// to pass activeSection down as a prop.
export function pathnameToSection(pathname: string): CustomerSectionKey {
  if (pathname === "/portal") return "overview";

  const match = Object.entries(CUSTOMER_SECTION_HREFS).find(
    ([key, href]) => key !== "overview" && (pathname === href || pathname.startsWith(`${href}/`)),
  );
  return (match?.[0] as CustomerSectionKey | undefined) ?? "overview";
}

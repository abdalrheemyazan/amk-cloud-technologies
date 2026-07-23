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
import SidebarNavItem from "./SidebarNavItem";
import { ROLE_LABELS } from "@/lib/support-labels";
import type { AgentStatus } from "@/lib/support-types";
import SupportAgentAvatar from "./SupportAgentAvatar";
import SupportSidebarBrand from "./SupportSidebarBrand";
import SupportSidebarLogoutButton from "./SupportSidebarLogoutButton";

export type SidebarNavItemDef = { key: string; label: string; icon: LucideIcon };

const DEFAULT_NAV_ITEMS: SidebarNavItemDef[] = [
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

/** Maps section keys to their display group */
const NAV_GROUPS: { label: string; keys: string[] }[] = [
  { label: "ראשי", keys: ["dashboard", "new-requests", "active-chats"] },
  { label: "עבודה ותמיכה", keys: ["customers-in-treatment", "canned-replies", "quick-solutions", "technical-tools"] },
  { label: "ניהול", keys: ["treatment-notes", "history"] },
  { label: "אישי", keys: ["availability-settings"] },
];

const STATUS_META = {
  AVAILABLE: { label: "זמין", dotClass: "bg-emerald-500", textClass: "text-emerald-700" },
  BUSY: { label: "עסוק", dotClass: "bg-amber-400", textClass: "text-amber-700" },
  OFFLINE: { label: "לא זמין", dotClass: "bg-slate-400", textClass: "text-slate-500" },
} as const;

export default function SupportSidebarContent({
  userName,
  userRole,
  userImage,
  userStatus = "AVAILABLE",
  activeSection,
  onSelectSection,
  navItems = DEFAULT_NAV_ITEMS,
  badges,
}: {
  userName: string | null;
  userRole: string | null;
  userImage?: string | null;
  userStatus?: AgentStatus;
  activeSection: string;
  onSelectSection: (section: string) => void;
  navItems?: SidebarNavItemDef[];
  badges?: Record<string, number>;
}) {
  const roleLabel = userRole ? ROLE_LABELS[userRole] ?? userRole : null;
  const statusMeta = STATUS_META[userStatus] ?? STATUS_META.OFFLINE;

  // Build lookup for fast icon/label retrieval
  const itemMap = Object.fromEntries(navItems.map((i) => [i.key, i]));

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <SupportSidebarBrand />

      {/* ── Navigation ── */}
      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-2" aria-label="תפריט ניווט">
        {NAV_GROUPS.map((group) => {
          // Only render groups whose items actually exist in navItems
          const groupItems = group.keys
            .map((k) => itemMap[k])
            .filter(Boolean) as SidebarNavItemDef[];

          if (groupItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-1">
              {/* Group label */}
              <p className="mb-1 mt-3 px-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 first:mt-1">
                {group.label}
              </p>

              {groupItems.map((item) => (
                <SidebarNavItem
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  active={item.key === activeSection}
                  badge={badges?.[item.key]}
                  onClick={() => onSelectSection(item.key)}
                />
              ))}

              {group.label === "אישי" && <SupportSidebarLogoutButton />}
            </div>
          );
        })}
      </nav>

      {/* Static user info — display only, no actions */}
      <div className="border-t border-slate-100 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2.5 rounded-[15px] border border-slate-100 bg-slate-50/80 px-2.5 py-2">
          <div className="relative shrink-0">
            <SupportAgentAvatar name={userName} imageUrl={userImage} className="h-9 w-9" textClassName="text-xs" />
            <span
              aria-label={statusMeta.label}
              title={statusMeta.label}
              className={`absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-white ${statusMeta.dotClass}`}
            />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12px] font-black text-slate-900">{userName?.trim() || "נציג תמיכה"}</p>
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <span className="truncate">{roleLabel ?? "Support Agent"}</span>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <span className={`shrink-0 ${statusMeta.textClass}`}>{statusMeta.label}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

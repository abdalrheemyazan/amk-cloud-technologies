import { UserRound } from "lucide-react";
import SidebarNavItem from "@/components/support/SidebarNavItem";
import SupportSidebarLogoutButton from "@/components/support/SupportSidebarLogoutButton";
import SupportAgentAvatar from "@/components/support/SupportAgentAvatar";
import CustomerPortalBrand from "./CustomerPortalBrand";
import {
  CUSTOMER_NAV_GROUPS,
  CUSTOMER_NAV_ITEMS,
  CUSTOMER_SECTION_HREFS,
  type CustomerSectionKey,
} from "@/lib/customer-portal-sections";

export default function CustomerPortalSidebarContent({
  userName,
  userImage,
  activeSection,
  onNavigate,
  badges,
}: {
  userName: string | null;
  userImage?: string | null;
  activeSection: CustomerSectionKey;
  onNavigate?: () => void;
  badges?: Partial<Record<CustomerSectionKey, number>>;
}) {
  const itemMap = Object.fromEntries(CUSTOMER_NAV_ITEMS.map((item) => [item.key, item]));
  const navActiveSection = activeSection;

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <CustomerPortalBrand />

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-2" aria-label="תפריט האזור האישי">
        {CUSTOMER_NAV_GROUPS.map((group) => {
          const groupItems = group.keys.map((key) => itemMap[key]).filter(Boolean);
          if (groupItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-1">
              <p className="mb-1 mt-3 px-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 first:mt-1">
                {group.label}
              </p>

              {groupItems.map((item) => (
                <SidebarNavItem
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  active={item.key === navActiveSection}
                  badge={badges?.[item.key]}
                  href={CUSTOMER_SECTION_HREFS[item.key]}
                  onClick={onNavigate}
                />
              ))}

              {group.label === "חשבון" && <SupportSidebarLogoutButton />}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2.5 rounded-[15px] border border-slate-100 bg-slate-50/80 px-2.5 py-2">
          <SupportAgentAvatar name={userName} imageUrl={userImage} className="h-9 w-9" textClassName="text-xs" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12px] font-black text-slate-900">{userName?.trim() || "לקוח AMK"}</p>
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <UserRound className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">לקוח</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

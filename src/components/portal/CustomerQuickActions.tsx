"use client";

import { MessageCircle, PhoneCall, PlusCircle, Server, type LucideIcon } from "lucide-react";
import Link from "next/link";

type QuickAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
};

export default function CustomerQuickActions({
  onNewRequest,
  onOpenChat,
  onOpenServices,
}: {
  onNewRequest: () => void;
  onOpenChat: () => void;
  onOpenServices: () => void;
}) {
  const actions: QuickAction[] = [
    { key: "new-request", label: "פתיחת פנייה חדשה", icon: PlusCircle, onClick: onNewRequest },
    { key: "chat", label: "צ׳אט תמיכה", icon: MessageCircle, onClick: onOpenChat },
    { key: "services", label: "השירותים שלי", icon: Server, onClick: onOpenServices },
    { key: "contact", label: "צור קשר", icon: PhoneCall, href: "/portal/contact" },
  ];

  return (
    <section aria-label="פעולות מהירות" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const className =
          "group flex items-center gap-2.5 rounded-[16px] border border-[#E2E8F0] bg-white px-3.5 py-3 text-right text-xs font-black text-[#0F172A] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700";
        const iconWrap = (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        );

        if (action.href) {
          return (
            <Link key={action.key} href={action.href} className={className}>
              {iconWrap}
              <span className="min-w-0 truncate">{action.label}</span>
            </Link>
          );
        }

        return (
          <button key={action.key} type="button" onClick={action.onClick} className={className}>
            {iconWrap}
            <span className="min-w-0 truncate">{action.label}</span>
          </button>
        );
      })}
    </section>
  );
}

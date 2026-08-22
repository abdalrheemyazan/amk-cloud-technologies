"use client";

import {
  Bell,
  ContactRound,
  FileText,
  Inbox,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type QuickAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
};

export default function CustomerQuickActions() {
  const actions: QuickAction[] = [
    { key: "new-request", label: "פתיחת פנייה חדשה", icon: PlusCircle, href: "/portal/new-request" },
    { key: "requests", label: "הפניות שלי", icon: Inbox, href: "/portal/requests" },
    { key: "documents", label: "מסמכים וקבצים", icon: FileText, href: "/portal/documents" },
    { key: "updates", label: "הודעות ועדכונים", icon: Bell, href: "/portal/updates" },
    { key: "contact", label: "צור קשר", icon: ContactRound, href: "/portal/contact" },
  ];

  return (
    <section aria-label="פעולות מהירות" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.key}
            href={action.href}
            prefetch={true}
            className="group flex items-center gap-2.5 rounded-[16px] border border-[#E2E8F0] bg-white px-3.5 py-3 text-right text-xs font-black text-[#0F172A] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="min-w-0 truncate">{action.label}</span>
          </Link>
        );
      })}
    </section>
  );
}

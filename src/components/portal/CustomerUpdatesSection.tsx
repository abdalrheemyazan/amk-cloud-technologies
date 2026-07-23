import Link from "next/link";
import { Bell, CalendarClock, Megaphone, ServerCog } from "lucide-react";
import CustomerPortalEmptyState from "./CustomerPortalEmptyState";
import CustomerPortalPageShell from "./CustomerPortalPageShell";

export default function CustomerUpdatesSection() {
  return (
    <CustomerPortalPageShell
      title="הודעות ועדכונים"
      description="עדכוני תחזוקה, הודעות שירות ועדכונים חשובים לחשבון שלך."
      eyebrow="מרכז עדכונים"
      icon={Bell}
      tone="violet"
      badge="הכול נקרא"
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_250px]">
        <CustomerPortalEmptyState
          icon={Bell}
          title="אין עדכונים חדשים כרגע"
          description="הודעות תחזוקה, עדכוני שירות והתראות חשבון יופיעו כאן לפי סדר הזמן."
          action={{ label: "צפייה בשירותים", href: "/portal/services" }}
        />

        <aside className="rounded-[20px] border border-slate-200 bg-white p-4">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">סוגי עדכונים</p>
          <div className="space-y-2">
            {[
              { icon: ServerCog, label: "תחזוקת מערכת", color: "bg-amber-50 text-amber-600" },
              { icon: Megaphone, label: "הודעות שירות", color: "bg-blue-50 text-blue-600" },
              { icon: CalendarClock, label: "עדכוני חשבון", color: "bg-violet-50 text-violet-600" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.color}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-black text-slate-700">{item.label}</span>
                </div>
              );
            })}
          </div>
          <Link href="/portal/settings" className="mt-4 block text-center text-[11px] font-black text-blue-700 hover:text-blue-800">
            ניהול העדפות התראות
          </Link>
        </aside>
      </div>
    </CustomerPortalPageShell>
  );
}

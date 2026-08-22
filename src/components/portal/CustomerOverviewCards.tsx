"use client";

import {
  Bell,
  Clock3,
  Inbox,
  PlayCircle,
  Server,
  type LucideIcon,
} from "lucide-react";

type Tone = "blue" | "amber" | "emerald" | "purple" | "indigo";

const TONE_STYLES: Record<Tone, { icon: string; rail: string; value: string }> = {
  blue: { icon: "bg-blue-50 text-blue-600", rail: "bg-blue-500", value: "text-blue-700" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", rail: "bg-emerald-500", value: "text-emerald-700" },
  purple: { icon: "bg-purple-50 text-purple-600", rail: "bg-purple-500", value: "text-purple-700" },
  amber: { icon: "bg-amber-50 text-amber-600", rail: "bg-amber-500", value: "text-amber-700" },
  indigo: { icon: "bg-indigo-50 text-indigo-600", rail: "bg-indigo-500", value: "text-indigo-700" },
};

type OverviewCard = {
  icon: LucideIcon;
  label: string;
  value: string;
  caption?: string;
  tone: Tone;
};

export default function CustomerOverviewCards({
  loaded,
  openRequestsCount,
  inProgressCount = 0,
  waitingCustomerCount = 0,
  activeServicesCount = 0,
  recentUpdatesCount = 0,
}: {
  loaded: boolean;
  openRequestsCount: number;
  inProgressCount?: number;
  waitingCustomerCount?: number;
  activeServicesCount?: number;
  recentUpdatesCount?: number;
}) {
  const cards: OverviewCard[] = [
    {
      icon: Inbox,
      label: "פניות פתוחות",
      value: loaded ? String(openRequestsCount) : "—",
      caption: loaded ? (openRequestsCount > 0 ? "סה״כ פניות פעילות" : "אין פניות פתוחות") : "טוען...",
      tone: "blue",
    },
    {
      icon: PlayCircle,
      label: "פניות בטיפול",
      value: loaded ? String(inProgressCount) : "—",
      caption: loaded ? (inProgressCount > 0 ? "נציג מטפל כרגע" : "אין פניות בטיפול") : "טוען...",
      tone: "emerald",
    },
    {
      icon: Clock3,
      label: "ממתינות לתשובתך",
      value: loaded ? String(waitingCustomerCount) : "—",
      caption: loaded ? (waitingCustomerCount > 0 ? "נדרשת פעולה ממך" : "הכל מעודכן") : "טוען...",
      tone: "purple",
    },
    {
      icon: Server,
      label: "שירותים פעילים",
      value: loaded ? String(activeServicesCount) : "—",
      caption: loaded ? (activeServicesCount > 0 ? "זמינים בחשבונך" : "תשתיות ענן פעילות") : "טוען...",
      tone: "indigo",
    },
    {
      icon: Bell,
      label: "עדכונים אחרונים",
      value: loaded ? String(recentUpdatesCount) : "—",
      caption: "הודעות שירות ומערכת",
      tone: "amber",
    },
  ];

  return (
    <section aria-label="סקירה כללית" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const colors = TONE_STYLES[card.tone];
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="relative flex min-h-[120px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] transition-all hover:shadow-[0_10px_25px_-15px_rgba(15,23,42,0.25)]"
          >
            <span className={`absolute inset-y-3 right-0 w-[3px] rounded-l-full ${colors.rail}`} aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${colors.icon}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-[11px] font-extrabold leading-tight text-[#64748B]">{card.label}</span>
            </div>
            <div className="mt-2">
              <div className={`text-[1.6rem] font-black leading-none tracking-tight tabular-nums ${colors.value}`}>
                {card.value}
              </div>
              {card.caption && <p className="mt-1 text-[10px] font-semibold text-[#94A3B8] truncate">{card.caption}</p>}
            </div>
          </article>
        );
      })}
    </section>
  );
}

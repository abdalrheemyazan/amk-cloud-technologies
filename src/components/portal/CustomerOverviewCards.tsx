"use client";

import { Bell, FileText, MessageSquare, Server, type LucideIcon } from "lucide-react";

type Tone = "blue" | "amber" | "slate" | "violet";

const TONE_STYLES: Record<Tone, { icon: string; rail: string; value: string }> = {
  blue: { icon: "bg-blue-50 text-blue-600", rail: "bg-blue-500", value: "text-blue-700" },
  amber: { icon: "bg-amber-50 text-amber-600", rail: "bg-amber-500", value: "text-amber-700" },
  slate: { icon: "bg-slate-100 text-slate-500", rail: "bg-slate-400", value: "text-slate-500" },
  violet: { icon: "bg-violet-50 text-violet-600", rail: "bg-violet-500", value: "text-violet-700" },
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
}: {
  loaded: boolean;
  openRequestsCount: number;
}) {
  const cards: OverviewCard[] = [
    {
      icon: Server,
      label: "שירותים פעילים",
      value: "0",
      caption: "אין נתונים זמינים",
      tone: "slate",
    },
    {
      icon: MessageSquare,
      label: "פניות פתוחות",
      value: loaded ? String(openRequestsCount) : "—",
      caption: loaded ? (openRequestsCount > 0 ? "ממתינות לטיפול" : "אין פניות פתוחות") : "טוען...",
      tone: "blue",
    },
    {
      icon: FileText,
      label: "חשבוניות",
      value: "—",
      caption: "אין חשבוניות להצגה כרגע",
      tone: "amber",
    },
    {
      icon: Bell,
      label: "עדכונים אחרונים",
      value: "0",
      caption: "אין עדכונים חדשים כרגע",
      tone: "violet",
    },
  ];

  return (
    <section aria-label="סקירה כללית" className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      {cards.map((card) => {
        const colors = TONE_STYLES[card.tone];
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_10px_28px_-24px_rgba(15,23,42,0.45)] md:p-5"
          >
            <span className={`absolute inset-y-4 right-0 w-[3px] rounded-l-full ${colors.rail}`} aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${colors.icon}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-extrabold leading-4 text-[#64748B]">{card.label}</span>
            </div>
            <div>
              <div className={`text-[1.7rem] font-black leading-none tracking-[-0.035em] ${colors.value}`}>
                {card.value}
              </div>
              {card.caption && <p className="mt-1.5 text-[10px] font-bold text-[#94A3B8]">{card.caption}</p>}
            </div>
          </article>
        );
      })}
    </section>
  );
}

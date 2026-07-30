"use client";

import {
  AlertTriangle,
  CheckCheck,
  Clock3,
  Flame,
  Inbox,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import type { SupportDashboardMetrics } from "@/lib/actions/support-dashboard-actions";

type Tone = "blue" | "amber" | "red" | "emerald" | "slate" | "rose";

const TONES: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  emerald: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-700",
  rose: "bg-rose-50 text-rose-700",
};

export default function DashboardKpiRow({
  metrics,
  loading,
}: {
  metrics: SupportDashboardMetrics | null;
  loading: boolean;
}) {
  const cards: { icon: LucideIcon; label: string; value: string | number; tone: Tone }[] = [
    { icon: MessageSquare, label: "שיחות פעילות", value: metrics?.activeCount ?? 0, tone: "blue" },
    { icon: Inbox, label: "בקשות ממתינות", value: metrics?.pendingCount ?? 0, tone: "amber" },
    { icon: Flame, label: "בקשות קריטיות", value: metrics?.criticalCount ?? 0, tone: "red" },
    { icon: CheckCheck, label: "טופלו היום", value: metrics?.closedTodayCount ?? 0, tone: "emerald" },
    {
      icon: Clock3,
      label: "זמן תגובה ממוצע",
      value: `${metrics?.avgResponseMinutes ?? 0} דק׳`,
      tone: "slate",
    },
    { icon: AlertTriangle, label: "חריגות SLA", value: metrics?.slaBreachCount ?? 0, tone: "rose" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="flex min-h-[74px] flex-col justify-between rounded-[14px] border border-slate-200/80 bg-white p-3 shadow-[0_6px_20px_-20px_rgba(15,23,42,0.75)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold leading-3 text-slate-500">{card.label}</span>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${TONES[card.tone]}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
            {loading && !metrics ? (
              <span className="h-6 w-8 animate-pulse rounded bg-slate-100" aria-hidden="true" />
            ) : (
              <p className="text-[1.35rem] font-black leading-none tracking-[-0.03em] text-slate-950">
                {card.value}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  CheckCheck,
  Clock3,
  Inbox,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { AgentMetrics } from "@/lib/actions/support-chat-actions";
import type { AgentStatus } from "@/lib/support-types";
import CompactAgentStatusControl from "./CompactAgentStatusControl";
import PremiumAnimatedBorder from "./PremiumAnimatedBorder";

const STATUS_COPY: Record<AgentStatus, { label: string; dot: string }> = {
  AVAILABLE: { label: "זמין לקבלת פניות", dot: "bg-emerald-500" },
  BUSY: { label: "עסוק כעת", dot: "bg-amber-500" },
  OFFLINE: { label: "לא זמין", dot: "bg-slate-400" },
};

type MetricProps = {
  icon: LucideIcon;
  label: string;
  value: string | number | undefined;
  tone: "blue" | "amber" | "emerald" | "slate";
};

const METRIC_TONES = {
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-700",
};

export default function SupportCommandHeader({
  agentName,
  lastUpdated,
  metrics,
  status,
  onStatusChange,
  onRefresh,
}: {
  agentName: string | null;
  lastUpdated: Date | null;
  metrics: AgentMetrics | null;
  status: AgentStatus;
  onStatusChange: (status: AgentStatus) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const statusCopy = STATUS_COPY[status];
  const syncTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  async function refresh() {
    setRefreshing(true);
    try {
      await onRefresh();
      setNotice("הנתונים סונכרנו");
    } finally {
      setRefreshing(false);
      window.setTimeout(() => setNotice(null), 2200);
    }
  }

  async function changeStatus(nextStatus: AgentStatus) {
    if (nextStatus === status || changingStatus) return;
    setChangingStatus(true);
    const succeeded = await onStatusChange(nextStatus);
    setNotice(succeeded ? "הזמינות עודכנה" : "לא ניתן לעדכן את הזמינות");
    setChangingStatus(false);
    window.setTimeout(() => setNotice(null), 2600);
  }

  return (
    <PremiumAnimatedBorder
      variant="support-header"
      className="support-header-in rounded-[24px] shadow-[0_18px_48px_-38px_rgba(15,23,42,0.65)]"
    >
      <section className="overflow-hidden rounded-[24px] bg-white">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#0B1739] text-white shadow-[0_10px_24px_-14px_rgba(11,23,57,0.75)]">
              <Wifi className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className={`absolute -left-1 -top-1 h-3 w-3 rounded-full border-[3px] border-white ${statusCopy.dot}`} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[1.55rem] font-black tracking-[-0.025em] text-slate-950 sm:text-[1.75rem]">
                עמדת נציג תמיכה
              </h1>
              <p className="mt-1 max-w-xl text-[13px] font-medium leading-5 text-slate-500">
                סביבת עבודה מאוחדת לטיפול, תיאום והעברת בעלות בין חברי הצוות.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400 xl:border-0 xl:pt-0">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-slate-600">{agentName || "נציג/ת תמיכה"}</span>
            </span>
            <span>סנכרון אחרון {syncTime}</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              כל המערכות פעילות
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-slate-500 outline-none transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {refreshing ? "מסנכרן" : "רענון"}
            </button>
          </div>
        </div>

        <div className="support-stagger mt-5 grid grid-cols-2 gap-2.5 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(360px,1.45fr)]">
          <Metric icon={MessageSquare} label="שיחות פעילות" value={metrics?.activeCount} tone="blue" />
          <Metric icon={Inbox} label="בקשות ממתינות" value={metrics?.pendingCount} tone="amber" />
          <Metric icon={CheckCheck} label="טופלו היום" value={metrics?.closedTodayCount} tone="emerald" />
          <Metric
            icon={Clock3}
            label="זמן תגובה ממוצע"
            value={metrics ? `${metrics.avgResponseMinutes} דק׳` : undefined}
            tone="slate"
          />

          <div className="col-span-2 flex min-w-0 flex-col justify-between gap-3 rounded-[16px] border border-slate-200 bg-slate-50/70 p-3.5 xl:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/80">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-400">זמינות נציג</p>
                  <p className="truncate text-xs font-black text-slate-800">{statusCopy.label}</p>
                </div>
              </div>
              {notice && (
                <span role="status" className="shrink-0 text-[10px] font-bold text-blue-700">
                  {notice}
                </span>
              )}
            </div>
            <CompactAgentStatusControl status={status} onChange={changeStatus} disabled={changingStatus} />
          </div>
        </div>
      </div>
      </section>
    </PremiumAnimatedBorder>
  );
}

function Metric({ icon: Icon, label, value, tone }: MetricProps) {
  return (
    <article className="flex min-h-[92px] flex-col justify-between rounded-[16px] border border-slate-200/80 bg-white p-3.5 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.75)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold leading-4 text-slate-500">{label}</span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] ${METRIC_TONES[tone]}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
      <p className="text-[1.55rem] font-black leading-none tracking-[-0.035em] text-slate-950">
        {value ?? "—"}
      </p>
    </article>
  );
}


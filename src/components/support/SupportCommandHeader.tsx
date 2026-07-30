"use client";

import { useState } from "react";
import { RefreshCw, UserRound, Wifi } from "lucide-react";
import type { AgentStatus } from "@/lib/support-types";
import CompactAgentStatusControl from "./CompactAgentStatusControl";

const STATUS_DOT: Record<AgentStatus, string> = {
  AVAILABLE: "bg-emerald-500",
  BUSY: "bg-amber-500",
  OFFLINE: "bg-slate-400",
};

export default function SupportCommandHeader({
  agentName,
  lastUpdated,
  status,
  onStatusChange,
  onRefresh,
}: {
  agentName: string | null;
  lastUpdated: Date | null;
  status: AgentStatus;
  onStatusChange: (status: AgentStatus) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
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
    <section className="rounded-[18px] border border-slate-200/80 bg-white px-4 py-3 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.75)] sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Title + identity */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0B1739] text-white">
            <Wifi className="h-4 w-4" aria-hidden="true" />
            <span className={`absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white ${STATUS_DOT[status]}`} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-[-0.02em] text-slate-950 sm:text-xl">
              עמדת נציג תמיכה
            </h1>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
              מרכז עבודה לניהול פניות, שיחות ותיעדוף משימות בזמן אמת.
            </p>
          </div>
        </div>

        {/* Metadata + availability */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-2.5 lg:border-0 lg:pt-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <UserRound className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            {agentName || "נציג/ת תמיכה"}
          </span>
          <span className="hidden text-[11px] font-semibold text-slate-400 sm:inline">
            סנכרון אחרון {syncTime}
          </span>
          <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-slate-400 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            כל המערכות פעילות
          </span>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 outline-none transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            {refreshing ? "מסנכרן" : "רענון"}
          </button>

          <div className="flex items-center gap-2">
            <span className="sr-only" aria-live="polite">
              {notice}
            </span>
            {notice && (
              <span role="status" className="hidden text-[10px] font-bold text-blue-700 xl:inline">
                {notice}
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-400">זמינות</span>
            <CompactAgentStatusControl status={status} onChange={changeStatus} disabled={changingStatus} />
          </div>
        </div>
      </div>
    </section>
  );
}

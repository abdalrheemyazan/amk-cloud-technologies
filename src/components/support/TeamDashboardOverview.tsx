"use client";

import { Check, Inbox, LockKeyhole, RotateCw, TriangleAlert, X } from "lucide-react";
import type { PendingChatRequest } from "@/lib/actions/support-chat-actions";
import type { ConnectedSupportAgent } from "@/lib/actions/support-team-actions";
import type { SupportDashboardData } from "@/lib/actions/support-dashboard-actions";
import type { AgentSectionKey } from "@/lib/agent-workspace-sections";
import ConnectedAgentsPanel from "./ConnectedAgentsPanel";
import DashboardKpiRow from "./dashboard/DashboardKpiRow";
import PriorityQueue from "./dashboard/PriorityQueue";
import MyActiveWork from "./dashboard/MyActiveWork";
import DashboardBreakdowns from "./dashboard/DashboardBreakdowns";

export default function TeamDashboardOverview({
  pending,
  agents,
  notice,
  data,
  dashboardLoaded,
  dashboardError,
  onRetry,
  onNavigate,
  onAccept,
  onReject,
  onOpenChat,
  onMessageAgent,
}: {
  pending: PendingChatRequest[];
  agents: ConnectedSupportAgent[];
  notice: string | null;
  data: SupportDashboardData | null;
  dashboardLoaded: boolean;
  dashboardError: string | null;
  onRetry: () => void;
  onNavigate: (section: AgentSectionKey) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onOpenChat: (id: string) => void;
  onMessageAgent: (agent: ConnectedSupportAgent) => void;
}) {
  const incoming = pending[0] ?? null;
  const connectedAgents = data?.connectedAgents ?? agents;

  return (
    <div className="space-y-4">
      {incoming && (
        <section className="relative overflow-hidden rounded-[18px] bg-[#0B1739] px-4 py-3.5 text-white shadow-[0_20px_46px_-34px_rgba(11,23,57,0.85)]">
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-cyan-300 via-blue-400 to-blue-600" aria-hidden="true" />
          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white/10 text-cyan-200 ring-1 ring-white/10">
                <Inbox className="h-4 w-4" aria-hidden="true" />
                <span className="absolute -left-1 -top-1 flex h-3 w-3">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-300/60 motion-reduce:animate-none" />
                  <span className="relative h-3 w-3 rounded-full border-2 border-[#0B1739] bg-cyan-300" />
                </span>
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-cyan-200">פנייה חדשה ממתינה</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-blue-100">
                    {pending.length} בתור
                  </span>
                </div>
                <h2 className="mt-0.5 truncate text-sm font-black">{incoming.customerName || "לקוח/ה"}</h2>
                <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-blue-100/70">
                  {incoming.category || "תמיכה כללית"} · {incoming.summary || "ללא תקציר"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden items-center gap-1.5 px-1 text-[10px] font-semibold text-blue-100/70 sm:inline-flex">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                הראשון שמקבל נועל את הטיפול
              </span>
              <button
                type="button"
                onClick={() => onReject(incoming.id)}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-[10px] font-black text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                דחייה
              </button>
              <button
                type="button"
                onClick={() => onAccept(incoming.id)}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-blue-500 px-4 text-[10px] font-black text-white shadow-lg shadow-blue-950/25 outline-none hover:bg-blue-400 focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                קבלת הפנייה
              </button>
            </div>
          </div>
        </section>
      )}

      {notice && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] font-bold text-amber-800">
          {notice}
        </div>
      )}

      <DashboardKpiRow metrics={data?.metrics ?? null} loading={!dashboardLoaded} />

      {dashboardError && !data ? (
        <section className="flex flex-col items-center justify-center rounded-[18px] border border-red-100 bg-red-50/60 px-4 py-10 text-center">
          <TriangleAlert className="h-8 w-8 text-red-400" aria-hidden="true" />
          <p className="mt-3 text-xs font-black text-red-700">לא ניתן לטעון את נתוני לוח התמיכה כרגע.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-black text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            נסה שוב
          </button>
        </section>
      ) : (
        <>
          <PriorityQueue
            requests={data?.priorityRequests ?? []}
            loaded={dashboardLoaded}
            onAccept={onAccept}
            onOpenChat={onOpenChat}
          />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.9fr)]">
            <MyActiveWork
              items={data?.myActiveItems ?? []}
              loaded={dashboardLoaded}
              onOpenChat={onOpenChat}
              onShowAll={() => onNavigate("active-chats")}
            />
            <ConnectedAgentsPanel agents={connectedAgents} onMessage={onMessageAgent} className="max-h-[420px]" />
          </div>

          <DashboardBreakdowns
            byService={data?.breakdownByService ?? []}
            byStatus={data?.breakdownByStatus ?? []}
            byPriority={data?.breakdownByPriority ?? []}
            teamWorkload={data?.teamWorkload ?? []}
            loaded={dashboardLoaded}
          />
        </>
      )}
    </div>
  );
}

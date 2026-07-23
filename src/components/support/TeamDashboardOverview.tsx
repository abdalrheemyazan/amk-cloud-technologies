"use client";

import {
  ArrowLeft,
  Check,
  Inbox,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import type {
  ActiveChat,
  PendingChatRequest,
} from "@/lib/actions/support-chat-actions";
import type { ConnectedSupportAgent } from "@/lib/actions/support-team-actions";
import type { AgentSectionKey } from "@/lib/agent-workspace-sections";
import ConnectedAgentsPanel from "./ConnectedAgentsPanel";
import StatusBadge from "./SupportStatusBadge";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeamDashboardOverview({
  pending,
  active,
  agents,
  loaded,
  notice,
  onNavigate,
  onAccept,
  onReject,
  onOpenChat,
  onMessageAgent,
}: {
  pending: PendingChatRequest[];
  active: ActiveChat[];
  agents: ConnectedSupportAgent[];
  loaded: boolean;
  notice: string | null;
  onNavigate: (section: AgentSectionKey) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onOpenChat: (id: string) => void;
  onMessageAgent: (agent: ConnectedSupportAgent) => void;
}) {
  const incoming = pending[0] ?? null;

  return (
    <div className="space-y-4">
      {incoming && (
        <section className="relative overflow-hidden rounded-[20px] bg-[#0B1739] px-5 py-4 text-white shadow-[0_20px_46px_-30px_rgba(11,23,57,0.85)]">
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-cyan-300 via-blue-400 to-blue-600" aria-hidden="true" />
          <div className="absolute -left-16 -top-24 h-52 w-52 rounded-full bg-blue-500/15 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3.5">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/10 text-cyan-200 ring-1 ring-white/10">
                <Inbox className="h-[18px] w-[18px]" aria-hidden="true" />
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
                <h2 className="mt-1 truncate text-base font-black">{incoming.customerName || "לקוח/ה"}</h2>
                <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-blue-100/70">
                  {incoming.category || "תמיכה כללית"} · {incoming.summary || "ללא תקציר"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-1 text-[10px] font-semibold text-blue-100/70">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                הראשון שמקבל נועל את הטיפול
              </span>
              <button
                type="button"
                onClick={() => onReject(incoming.id)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-[10px] font-black text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                דחייה
              </button>
              <button
                type="button"
                onClick={() => onAccept(incoming.id)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-500 px-4 text-[10px] font-black text-white shadow-lg shadow-blue-950/25 outline-none hover:bg-blue-400 focus-visible:ring-2 focus-visible:ring-cyan-300"
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

      <div className="support-stagger grid grid-cols-1 gap-4 xl:grid-cols-[minmax(245px,0.82fr)_minmax(0,1.42fr)_minmax(270px,0.9fr)]">
        <ConnectedAgentsPanel agents={agents} onMessage={onMessageAgent} className="max-h-[570px]" />

        <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-sm font-black text-slate-950">שיחות בטיפול שלי</h2>
              </div>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                בעלות פעילה והמשך טיפול
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("active-chats")}
              className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 hover:text-blue-800"
            >
              סביבת שיחה מלאה
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2 p-3">
            {active.length === 0 && (
              <div className="flex min-h-52 flex-col items-center justify-center text-center">
                <ShieldCheck className="h-8 w-8 text-slate-300" aria-hidden="true" />
                <p className="mt-3 text-xs font-black text-slate-600">אין שיחות פעילות בבעלותך</p>
                <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-400">
                  קבלת פנייה חדשה תנעל אותה עבורך ותציג אותה כאן.
                </p>
              </div>
            )}

            {active.slice(0, 6).map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => onOpenChat(chat.id)}
                className="group flex w-full items-center gap-3 rounded-[14px] border border-slate-100 p-3 text-right outline-none transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-blue-50 text-blue-700">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-xs font-black text-slate-900">{chat.customerName || "לקוח/ה"}</span>
                    <StatusBadge status="ACTIVE" />
                  </span>
                  <span className="mt-1 block truncate text-[10px] font-semibold text-slate-400">
                    {chat.category || "תמיכה כללית"} · נפתחה {formatTime(chat.createdAt)}
                  </span>
                </span>
                <ArrowLeft className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:-translate-x-0.5 group-hover:text-blue-600" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <h2 className="text-sm font-black text-slate-950">בקשות ממתינות</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("new-requests")}
                className="text-[10px] font-extrabold text-blue-700 hover:text-blue-800"
              >
                הצגת הכל
              </button>
            </div>

            <div className="space-y-2 p-3">
              {loaded && pending.length === 0 && (
                <div className="py-8 text-center">
                  <Inbox className="mx-auto h-6 w-6 text-slate-300" aria-hidden="true" />
                  <p className="mt-2 text-[11px] font-bold text-slate-400">התור נקי כרגע</p>
                </div>
              )}
              {pending.slice(0, 3).map((request) => (
                <div key={request.id} className="rounded-[14px] border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-black text-slate-900">{request.customerName || "לקוח/ה"}</p>
                      <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-400">{request.category || "תמיכה כללית"}</p>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400">{formatTime(request.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAccept(request.id)}
                    className="mt-2.5 inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-[10px] font-black text-white outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    קבלת טיפול
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
            <div className="flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-blue-700" aria-hidden="true" />
              <h2 className="text-xs font-black text-blue-950">עבודה כצוות, בלי לחשוף שיח פנימי</h2>
            </div>
            <p className="mt-2 text-[10px] font-semibold leading-4 text-blue-800/65">
              בחרו נציג מהרשימה לשיחה פנימית. מתוך פנייה פעילה אפשר גם לצרף את ההקשר ולהעביר בעלות באופן מתועד.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}


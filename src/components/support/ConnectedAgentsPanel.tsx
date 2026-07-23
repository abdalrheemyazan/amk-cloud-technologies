"use client";

import { ArrowLeftRight, MessageCircle, UsersRound } from "lucide-react";
import type { ConnectedSupportAgent } from "@/lib/actions/support-team-actions";
import SupportAgentAvatar from "./SupportAgentAvatar";

const STATUS_META = {
  AVAILABLE: { label: "זמין", dot: "bg-emerald-500", text: "text-emerald-700" },
  BUSY: { label: "עסוק", dot: "bg-amber-500", text: "text-amber-700" },
  OFFLINE: { label: "לא זמין", dot: "bg-slate-400", text: "text-slate-500" },
};

export default function ConnectedAgentsPanel({
  agents,
  selectedAgentId,
  canTransfer = false,
  onMessage,
  onTransfer,
  className = "",
}: {
  agents: ConnectedSupportAgent[];
  selectedAgentId?: string | null;
  canTransfer?: boolean;
  onMessage: (agent: ConnectedSupportAgent) => void;
  onTransfer?: (agent: ConnectedSupportAgent) => void;
  className?: string;
}) {
  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)] ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-sm font-black text-slate-950">צוות תמיכה מחובר</h2>
          </div>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
            {agents.length} נציגים זמינים לתיאום
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          LIVE
        </span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
        {agents.length === 0 && (
          <div className="flex min-h-40 flex-col items-center justify-center px-5 text-center">
            <UsersRound className="h-7 w-7 text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-xs font-bold text-slate-500">אין נציגים מחוברים כרגע</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">הרשימה תתעדכן אוטומטית.</p>
          </div>
        )}

        {agents.map((agent) => {
          const status = STATUS_META[agent.status];
          const selected = selectedAgentId === agent.id;

          return (
            <div
              key={agent.id}
              className={`group rounded-[14px] border p-2.5 transition-colors ${
                selected
                  ? "border-blue-200 bg-blue-50/70"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <button
                type="button"
                onClick={() => !agent.isCurrent && onMessage(agent)}
                disabled={agent.isCurrent}
                className="flex w-full items-center gap-2.5 text-right outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default"
              >
                <span className="relative shrink-0">
                  <SupportAgentAvatar name={agent.name} imageUrl={agent.imageUrl} className="h-9 w-9 rounded-[12px]" textClassName="text-[11px]" />
                  <span className={`absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${status.dot}`} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-black text-slate-900">{agent.name}</span>
                    {agent.isCurrent && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700">
                        אני
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-400">
                    {agent.role} · {agent.specialty}
                  </span>
                </span>

                <span className="text-left">
                  <span className={`block text-[10px] font-extrabold ${status.text}`}>{status.label}</span>
                  <span className="mt-0.5 block text-[9px] font-semibold text-slate-400">
                    {agent.activeConversationCount} שיחות
                  </span>
                </span>
              </button>

              {!agent.isCurrent && (
                <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-2">
                  <button
                    type="button"
                    onClick={() => onMessage(agent)}
                    className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg bg-slate-100 text-[10px] font-extrabold text-slate-700 outline-none transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <MessageCircle className="h-3 w-3" aria-hidden="true" />
                    שיחה פנימית
                  </button>
                  <button
                    type="button"
                    disabled={!canTransfer || !onTransfer}
                    onClick={() => onTransfer?.(agent)}
                    className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-[10px] font-extrabold text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    title={canTransfer ? "העברת הטיפול לנציג" : "יש לבחור שיחה פעילה"}
                  >
                    <ArrowLeftRight className="h-3 w-3" aria-hidden="true" />
                    העברת טיפול
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}


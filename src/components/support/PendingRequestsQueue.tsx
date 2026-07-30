"use client";

import { useState } from "react";
import { Check, X, Inbox, AlertCircle, Eye, Clock3 } from "lucide-react";
import type { PendingChatRequest } from "@/lib/actions/support-chat-actions";
import StatusBadge from "./SupportStatusBadge";
import PendingRequestDetailsDialog from "./PendingRequestDetailsDialog";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function formatWaiting(iso: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `${minutes} דק׳`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest > 0 ? `${hours}:${String(rest).padStart(2, "0")} שע׳` : `${hours} שע׳`;
  return `${Math.floor(hours / 24)} ימים`;
}

function initials(name: string | null) {
  const clean = (name ?? "").trim();
  if (!clean) return "לק";
  const parts = clean.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function PendingRequestsQueue({
  requests,
  loaded,
  notice,
  onAccept,
  onReject,
}: {
  requests: PendingChatRequest[];
  loaded: boolean;
  notice?: string | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [detailsId, setDetailsId] = useState<string | null>(null);

  return (
    <section className="flex min-h-[420px] flex-col rounded-[20px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#EFF6FF] text-blue-600">
            <Inbox className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-sm font-black text-[#0F172A]">בקשות חדשות</h2>
        </div>
        {loaded && requests.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500">
            {requests.length}
          </span>
        )}
      </div>

      {notice && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {notice}
        </div>
      )}

      {loaded && requests.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F7FB] text-[#94A3B8]">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-[#94A3B8]">אין בקשות ממתינות כרגע</p>
        </div>
      )}

      <div className="space-y-2.5">
        {requests.map((request) => (
          <article
            key={request.id}
            className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3.5 transition-all duration-200 hover:border-blue-200 hover:shadow-[0_10px_28px_-20px_rgba(37,99,235,0.55)]"
          >
            <span
              className="absolute inset-y-3 right-0 w-[3px] rounded-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-60 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />

            {/* Identity + waiting */}
            <div className="flex items-start gap-2.5 pr-1.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[11px] font-black text-blue-700">
                {initials(request.customerName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black text-[#0F172A]">
                    {request.customerName ?? "לקוח"}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    {formatWaiting(request.createdAt)}
                  </span>
                </div>
                {request.customerEmail && (
                  <p className="truncate text-[11px] font-semibold text-[#94A3B8]" dir="ltr">
                    {request.customerEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pr-1.5">
              {request.category && (
                <span className="inline-block rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                  {request.category}
                </span>
              )}
              <StatusBadge status="PENDING" />
              <span className="text-[10px] font-semibold text-[#CBD5E1]">·</span>
              <span className="text-[10px] font-semibold text-[#94A3B8]">נפתחה {formatTime(request.createdAt)}</span>
            </div>

            {/* Summary */}
            {request.summary && (
              <p className="mt-2.5 line-clamp-2 rounded-xl bg-[#F8FAFC] px-3 py-2 text-[11px] font-medium leading-relaxed text-[#475569] pr-1.5">
                {request.summary}
              </p>
            )}

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2 pr-1.5">
              <button
                onClick={() => setDetailsId(request.id)}
                className="inline-flex h-8 flex-1 min-w-[128px] items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[11px] font-black text-[#334155] outline-none transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                צפייה בפרטי הפנייה
              </button>
              <button
                onClick={() => onAccept(request.id)}
                className="inline-flex h-8 flex-1 min-w-[110px] items-center justify-center gap-1.5 rounded-lg bg-gradient-to-l from-blue-600 to-indigo-600 text-[11px] font-black text-white shadow-sm outline-none transition-all hover:from-blue-500 hover:to-indigo-500 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                קבלת שיחה
              </button>
              <button
                onClick={() => onReject(request.id)}
                aria-label="דחיית הפנייה"
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-black text-[#64748B] outline-none transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                דחייה
              </button>
            </div>
          </article>
        ))}
      </div>

      {detailsId && (
        <PendingRequestDetailsDialog
          key={detailsId}
          requestId={detailsId}
          onAccept={(id) => {
            setDetailsId(null);
            onAccept(id);
          }}
          onReject={(id) => {
            setDetailsId(null);
            onReject(id);
          }}
          onClose={() => setDetailsId(null)}
        />
      )}
    </section>
  );
}

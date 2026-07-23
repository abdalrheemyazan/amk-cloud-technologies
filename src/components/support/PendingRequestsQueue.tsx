"use client";

import { Check, X, Inbox, AlertCircle } from "lucide-react";
import type { PendingChatRequest } from "@/lib/actions/support-chat-actions";
import StatusBadge from "./SupportStatusBadge";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
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
  return (
    <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 md:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] flex flex-col min-h-[420px]">
      <h2 className="text-sm font-black text-[#0F172A] mb-4">בקשות חדשות</h2>

      {notice && (
        <div className="mb-3 flex items-center gap-2 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {notice}
        </div>
      )}

      {loaded && requests.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-10 text-center">
          <div className="w-11 h-11 rounded-full bg-[#F4F7FB] text-[#94A3B8] flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-sm text-[#94A3B8] font-semibold">אין בקשות ממתינות כרגע</p>
        </div>
      )}

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="border border-[#E2E8F0] rounded-2xl p-4 hover:border-blue-200 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-sm text-[#0F172A]">{request.customerName ?? "לקוח"}</span>
              <span className="text-[11px] text-[#94A3B8] font-semibold">{formatTime(request.createdAt)}</span>
            </div>
            {request.customerEmail && (
              <p className="text-[11px] text-[#94A3B8] font-semibold mb-1.5" dir="ltr">{request.customerEmail}</p>
            )}
            <div className="flex items-center gap-1.5 mb-2">
              {request.category && (
                <span className="inline-block text-[11px] font-bold text-blue-600 bg-[#EFF6FF] rounded-full px-2.5 py-0.5">
                  {request.category}
                </span>
              )}
              <StatusBadge status="PENDING" />
            </div>
            {request.summary && (
              <p className="text-xs text-[#64748B] font-semibold mb-3 leading-relaxed line-clamp-2">
                {request.summary}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => onAccept(request.id)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-2 text-xs font-black transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                קבלת שיחה
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] rounded-xl py-2 text-xs font-black transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                דחייה
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { Archive, Calendar, Loader2, MessageCircleOff, User, X } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";
import type { SupportConversationDetail } from "@/lib/actions/support-chat-actions";
import AttachmentThumbnails from "./AttachmentThumbnails";
import StatusBadge from "./StatusBadge";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function HistoryConversationModal({
  loading,
  error,
  detail,
  onClose,
}: {
  loading: boolean;
  error: string | null;
  detail: SupportConversationDetail | null;
  onClose: () => void;
}) {
  return (
    <ModalPortal
      onClose={onClose}
      labelledBy="history-conversation-title"
      rootClassName="items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      panelClassName="flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[24px] border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.7)] sm:h-auto sm:max-h-[85vh] sm:rounded-[24px]"
    >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 shrink-0">
          <div className="min-w-0">
            <h2 id="history-conversation-title" className="text-base font-black text-slate-950">
              צפייה בשיחה
            </h2>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              מוצגות שיחות מ־7 הימים האחרונים בלבד.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-modal-autofocus
            aria-label="סגירה"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-10 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-400">טוען את השיחה...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 py-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <MessageCircleOff className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold text-slate-700">{error}</p>
          </div>
        )}

        {!loading && !error && detail && (
          <>
            <div className="shrink-0 space-y-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#0B1739] text-white">
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{detail.customerName ?? "לקוח"}</p>
                    {detail.category && (
                      <p className="truncate text-[10px] font-bold text-slate-500">{detail.category}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={detail.status} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">
                    <Archive className="h-3 w-3" aria-hidden="true" />
                    שיחה סגורה
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  נפתח {formatTime(detail.createdAt)}
                </span>
                {detail.closedAt && <span>נסגר {formatTime(detail.closedAt)}</span>}
                {detail.technicianName && <span>טופל ע״י {detail.technicianName}</span>}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[#F4F7FB] px-4 py-4">
              {detail.timeline.length === 0 && (
                <p className="py-8 text-center text-xs font-semibold text-slate-400">אין הודעות להצגה</p>
              )}

              {detail.timeline.map((item) =>
                item.kind === "activity" ? (
                  <div key={item.id} className="flex justify-center">
                    <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[10px] font-bold text-slate-500">
                      {item.message} · {formatTime(item.createdAt)}
                    </span>
                  </div>
                ) : (
                  <div key={item.id} className={item.isFromCustomer ? "flex justify-start" : "flex justify-end"}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold leading-relaxed ${
                        item.isFromCustomer
                          ? "rounded-bl-sm border border-[#E2E8F0] bg-white text-[#0F172A]"
                          : "rounded-br-sm bg-blue-600 text-white"
                      }`}
                    >
                      {item.message}
                      <AttachmentThumbnails attachments={item.attachments} />
                      <p
                        className={`mt-1 text-[10px] font-semibold ${
                          item.isFromCustomer ? "text-slate-400" : "text-blue-100"
                        }`}
                      >
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}

        <footer className="flex shrink-0 items-center justify-end border-t border-slate-100 bg-white px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            סגירה
          </button>
        </footer>
    </ModalPortal>
  );
}

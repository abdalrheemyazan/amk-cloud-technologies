"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle,
  Eye,
  Inbox,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  cancelSupportRequest,
  customerConfirmResolution,
  type MyRequestSummary,
} from "@/lib/actions/support-chat-actions";
import { STATUS_LABELS, STATUS_STYLES, ticketDisplayId } from "@/lib/support-labels";
import CustomerCancelRequestModal from "./CustomerCancelRequestModal";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CustomerRequestsList({
  requests,
  loaded,
  onOpenRequest,
  onCancelled,
  limit,
}: {
  requests: MyRequestSummary[];
  loaded: boolean;
  onOpenRequest: (id: string) => void;
  onCancelled?: () => void;
  limit?: number;
}) {
  const items = limit ? requests.slice(0, limit) : requests;
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);

  async function confirmCancel() {
    if (!cancelingId) return;
    setCancelSubmitting(true);
    setCancelError(null);
    const result = await cancelSupportRequest(cancelingId);
    setCancelSubmitting(false);

    if (!result.ok) {
      setCancelError(result.error);
      return;
    }

    setCancelingId(null);
    onCancelled?.();
  }

  async function handleConfirmResolution(sessionId: string, confirmed: boolean) {
    setResolvingId(sessionId);
    const result = await customerConfirmResolution(sessionId, confirmed);
    setResolvingId(null);
    if (result.ok) {
      setResolutionNotice(
        confirmed
          ? "תודה! הפנייה נסגרה בהצלחה."
          : "הפנייה נפתחה מחדש ונציג התמיכה קיבל עדכון."
      );
      onCancelled?.();
    } else {
      setResolutionNotice(result.error);
    }
  }

  if (!loaded) {
    return <p className="py-4 text-center text-xs font-semibold text-[#94A3B8]">טוען את הפניות שלך...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2.5 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F7FB] text-[#94A3B8]">
          <Inbox className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-[#94A3B8]">לא נמצאו פניות תואמות.</p>
        <p className="max-w-sm text-[11px] font-semibold leading-5 text-slate-400">
          כשנפתחת פנייה חדשה, הסטטוס והעדכונים שלה מופיעים כאן בזמן אמת.
        </p>
        <Link href="/portal/new-request" className="mt-1 text-xs font-black text-blue-700 hover:text-blue-800">
          פתיחת פנייה חדשה
        </Link>
      </div>
    );
  }

  return (
    <>
      {resolutionNotice && (
        <div className="mb-3 rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-xs font-bold text-blue-800 flex items-center justify-between">
          <span>{resolutionNotice}</span>
          <button
            type="button"
            onClick={() => setResolutionNotice(null)}
            className="text-[10px] text-blue-600 hover:text-blue-800"
          >
            סגור
          </button>
        </div>
      )}

      <div className="divide-y divide-[#E2E8F0]">
        {items.map((request) => {
          const statusLabel = STATUS_LABELS[request.status] ?? request.status;
          const statusStyle = STATUS_STYLES[request.status] ?? "bg-slate-100 text-slate-500 border-slate-200";
          const cancelable = request.status === "PENDING" || request.status === "NEW";
          const isResolvedWaitingConfirmation = request.status === "RESOLVED";

          return (
            <div
              key={request.id}
              className="py-3 px-2 rounded-xl transition-colors hover:bg-slate-50/80 space-y-2"
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={`פתיחת פנייה: ${request.subject ?? request.category ?? "כללי"}`}
                onClick={() => onOpenRequest(request.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenRequest(request.id);
                  }
                }}
                className="group flex cursor-pointer flex-wrap items-center justify-between gap-3 outline-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-400">
                      {ticketDisplayId(request.id)}
                    </span>
                    <p className="truncate text-sm font-black text-[#0F172A] group-hover:text-blue-700">
                      {request.subject || request.category || "כללי"}
                    </p>
                  </div>
                  <p className="text-[11px] font-semibold text-[#94A3B8] mt-0.5">
                    {request.category ?? "כללי"} · נפתח {formatTime(request.createdAt)} · עודכן {formatTime(request.updatedAt)}
                    {request.closedAt && ` · נסגר ${formatTime(request.closedAt)}`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${statusStyle}`}>
                    {statusLabel}
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenRequest(request.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[10px] font-black text-[#0F172A] outline-none transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye className="h-3 w-3" aria-hidden="true" />
                    צפייה בשיחה
                  </button>

                  {cancelable && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setCancelError(null);
                        setCancelingId(request.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-white px-2.5 py-1.5 text-[10px] font-black text-rose-600 outline-none transition-colors hover:border-rose-200 hover:bg-rose-50"
                    >
                      <XCircle className="h-3 w-3" aria-hidden="true" />
                      ביטול
                    </button>
                  )}
                </div>
              </div>

              {/* Resolution Confirmation Prompt */}
              {isResolvedWaitingConfirmation && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-black">
                      הנציג סימן את הפנייה כפתורה. האם הבעיה נפתרה לשביעות רצונך?
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={resolvingId === request.id}
                      onClick={() => handleConfirmResolution(request.id, true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-black shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle className="h-3 w-3" />
                      כן, אפשר לסגור
                    </button>
                    <button
                      type="button"
                      disabled={resolvingId === request.id}
                      onClick={() => handleConfirmResolution(request.id, false)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-100 px-3 py-1 text-[11px] font-black disabled:opacity-50"
                    >
                      <RotateCcw className="h-3 w-3" />
                      לא, עדיין קיימת בעיה
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cancelingId && (
        <CustomerCancelRequestModal
          submitting={cancelSubmitting}
          error={cancelError}
          onConfirm={() => void confirmCancel()}
          onClose={() => {
            if (cancelSubmitting) return;
            setCancelingId(null);
            setCancelError(null);
          }}
        />
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Inbox, XCircle } from "lucide-react";
import { cancelSupportRequest, type MyRequestSummary } from "@/lib/actions/support-chat-actions";
import CustomerCancelRequestModal from "./CustomerCancelRequestModal";

const STATUS_META: Record<string, { label: string; wrap: string }> = {
  PENDING: { label: "ממתין לנציג", wrap: "bg-amber-50 text-amber-700" },
  ACTIVE: { label: "בטיפול", wrap: "bg-emerald-50 text-emerald-700" },
  RESOLVED: { label: "נסגר", wrap: "bg-slate-100 text-slate-500" },
  CLOSED: { label: "נסגר", wrap: "bg-slate-100 text-slate-500" },
  REJECTED: { label: "נסגר", wrap: "bg-slate-100 text-slate-500" },
  EXPIRED: { label: "נסגר", wrap: "bg-slate-100 text-slate-500" },
  CANCELLED: { label: "בוטלה", wrap: "bg-slate-100 text-slate-500" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
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

  if (!loaded) {
    return <p className="py-4 text-center text-xs font-semibold text-[#94A3B8]">טוען את הפניות שלך...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2.5 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F7FB] text-[#94A3B8]">
          <Inbox className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-[#94A3B8]">אין פניות פתוחות כרגע.</p>
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
      <div className="divide-y divide-[#E2E8F0]">
        {items.map((request) => {
          const meta = STATUS_META[request.status] ?? { label: request.status, wrap: "bg-slate-100 text-slate-500" };
          const cancelable = request.status === "PENDING";

          return (
            <div
              key={request.id}
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
              className="group flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3 outline-none transition-colors hover:bg-blue-50/60 focus-visible:bg-blue-50/60 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[#0F172A] transition-colors group-hover:text-blue-700">
                  {request.subject || request.category || "כללי"}
                </p>
                <p className="text-[11px] font-semibold text-[#94A3B8]">
                  {request.category ?? "כללי"} · נפתח {formatTime(request.createdAt)} · עודכן {formatTime(request.updatedAt)}
                  {request.closedAt && ` · נסגר ${formatTime(request.closedAt)}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${meta.wrap}`}>{meta.label}</span>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenRequest(request.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[10px] font-black text-[#0F172A] outline-none transition-colors hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Eye className="h-3 w-3" aria-hidden="true" />
                  צפייה
                </button>

                {cancelable && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setCancelError(null);
                      setCancelingId(request.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-white px-2.5 py-1.5 text-[10px] font-black text-rose-600 outline-none transition-colors hover:border-rose-200 hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <XCircle className="h-3 w-3" aria-hidden="true" />
                    ביטול פנייה
                  </button>
                )}
              </div>
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

"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clock3,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Paperclip,
  Tag,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import {
  getPendingRequestDetails,
  type PendingRequestDetails,
} from "@/lib/actions/support-chat-actions";
import StatusBadge from "./SupportStatusBadge";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWaiting(iso: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `${minutes} דק׳`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest > 0 ? `${hours} שע׳ ${rest} דק׳` : `${hours} שע׳`;
  return `${Math.floor(hours / 24)} ימים`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function SectionTitle({ icon: Icon, children }: { icon: typeof FileText; children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function PendingRequestDetailsDialog({
  requestId,
  onAccept,
  onReject,
  onClose,
}: {
  requestId: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}) {
  // The parent remounts this dialog per request id (via `key`), so initial
  // state is always fresh — the effect only performs the async fetch.
  const [details, setDetails] = useState<PendingRequestDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPendingRequestDetails(requestId).then((result) => {
      if (cancelled) return;
      if (result.ok) setDetails(result.data);
      else setError(result.error === "UNAUTHORIZED" || result.error === "NOT_FOUND"
        ? "לא ניתן להציג את פרטי הפנייה. ייתכן שכבר טופלה."
        : result.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fields = details
    ? [
        { icon: UserRound, label: "לקוח", value: details.customerName || "—" },
        { icon: Mail, label: "אימייל", value: details.customerEmail || "—", dir: "ltr" as const },
        { icon: Tag, label: "סוג שירות", value: details.category || "—" },
        { icon: Clock3, label: "תאריך ושעת פתיחה", value: formatDateTime(details.createdAt) },
        { icon: Clock3, label: "זמן המתנה", value: formatWaiting(details.createdAt) },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="פרטי הפנייה"
    >
      <button
        type="button"
        aria-label="סגירת פרטי הפנייה"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white shadow-[0_28px_70px_-30px_rgba(15,23,42,0.6)]">
        {/* Header */}
        <div className="relative border-b border-[#E2E8F0] bg-gradient-to-l from-[#F5F8FF] to-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] outline-none transition-colors hover:bg-white hover:text-[#0F172A] focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-start gap-3 pl-10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-600 text-white shadow-[0_10px_22px_-12px_rgba(37,99,235,0.9)]">
              <Ticket className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-600">פרטי פנייה</p>
              <h2 className="mt-0.5 truncate text-[15px] font-black leading-5 text-[#0F172A]">
                {details?.subject || (loading ? "טוען…" : "פרטי הפנייה")}
              </h2>
              {details && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status="PENDING" />
                  {details.category && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {details.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    ממתין {formatWaiting(details.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#FBFCFE] px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-xs font-bold text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              טוען פרטי פנייה...
            </div>
          )}

          {error && !loading && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-bold text-red-700">
              {error}
            </div>
          )}

          {details && !loading && (
            <>
              {details.summary && (
                <section>
                  <SectionTitle icon={FileText}>תיאור מלא</SectionTitle>
                  <p className="whitespace-pre-wrap break-words rounded-xl border border-slate-100 bg-white px-3.5 py-3 text-xs font-semibold leading-relaxed text-[#334155]">
                    {details.summary}
                  </p>
                </section>
              )}

              <section>
                <SectionTitle icon={UserRound}>פרטי הפנייה</SectionTitle>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div
                      key={field.label}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-slate-500">
                        <field.icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{field.label}</p>
                        <p
                          className="mt-0.5 break-words text-[11px] font-bold leading-4 text-[#0F172A]"
                          dir={"dir" in field ? field.dir : undefined}
                        >
                          {field.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {details.recentMessages.length > 0 && (
                <section>
                  <SectionTitle icon={MessageSquare}>הודעות אחרונות</SectionTitle>
                  <div className="space-y-2">
                    {details.recentMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`rounded-xl border px-3 py-2 ${
                          message.isFromCustomer
                            ? "border-slate-100 bg-white"
                            : "border-blue-100 bg-[#EFF6FF]"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black ${
                              message.isFromCustomer ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {message.isFromCustomer ? "לקוח" : "נציג / מערכת"}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">{formatTime(message.createdAt)}</span>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-[11px] font-semibold leading-5 text-[#334155]">
                          {message.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {details.attachments.length > 0 && (
                <section>
                  <SectionTitle icon={Paperclip}>קבצים מצורפים</SectionTitle>
                  <ul className="space-y-1.5">
                    {details.attachments.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F1F5F9] text-slate-500">
                            <Paperclip className="h-3 w-3" aria-hidden="true" />
                          </span>
                          <span className="truncate text-[11px] font-bold text-[#334155]">{file.fileName}</span>
                        </span>
                        <span className="shrink-0 rounded-md bg-[#F1F5F9] px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                          {file.fileType} · {formatSize(file.fileSize)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {/* Sticky action bar */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => onAccept(requestId)}
            className="inline-flex h-9 flex-1 min-w-[130px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-blue-600 to-indigo-600 text-xs font-black text-white shadow-sm outline-none transition-all hover:from-blue-500 hover:to-indigo-500 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            קבלת שיחה
          </button>
          <button
            type="button"
            onClick={() => onReject(requestId)}
            className="inline-flex h-9 flex-1 min-w-[110px] items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-black text-[#334155] outline-none transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            דחייה
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl px-4 text-xs font-black text-[#64748B] outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
}

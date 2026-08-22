"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  FileText,
  Headphones,
  ImagePlus,
  Loader2,
  Send,
  X,
} from "lucide-react";
import {
  customerConfirmResolution,
  getCustomerTicketDetail,
  sendCustomerMessage,
  type CustomerTicketDetailView,
} from "@/lib/actions/support-chat-actions";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/support-labels";
import { processSelectedFiles, type PendingAttachment } from "@/lib/chat-attachments-client";
import AttachmentThumbnails from "@/components/support/AttachmentThumbnails";
import PendingAttachmentTray from "@/components/support/PendingAttachmentTray";

export default function CustomerTicketDetailsDrawer({
  ticketId,
  onClose,
  onUpdated,
}: {
  ticketId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [ticket, setTicket] = useState<CustomerTicketDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch ticket details
  useEffect(() => {
    if (!ticketId) return;

    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      const res = await getCustomerTicketDetail(ticketId!);
      if (cancelled) return;
      if (res.ok) {
        setTicket(res.data);
      } else {
        setError(res.error === "NOT_FOUND" ? "הפנייה לא נמצאה או שאין הרשאה לצפות בה." : res.error);
      }
      setLoading(false);
    }

    void loadData();

    // Auto-poll for new messages/status while open
    const interval = setInterval(async () => {
      if (cancelled || !ticketId) return;
      const pollRes = await getCustomerTicketDetail(ticketId);
      if (pollRes.ok && !cancelled) {
        setTicket(pollRes.data);
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [ticketId]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (ticket?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages?.length]);

  if (!ticketId) return null;

  async function handleSendReply(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!ticket || sending) return;
    const trimmed = replyText.trim();
    if (!trimmed && pendingAttachments.length === 0) return;

    setSending(true);
    setSendError(null);

    const res = await sendCustomerMessage(ticket.id, trimmed, pendingAttachments);
    setSending(false);

    if (res.ok) {
      setReplyText("");
      setPendingAttachments([]);
      const updated = await getCustomerTicketDetail(ticket.id);
      if (updated.ok) setTicket(updated.data);
      onUpdated?.();
    } else {
      setSendError(res.error);
    }
  }

  async function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    setAttachmentError(null);
    const { attachments, error: err } = await processSelectedFiles(
      Array.from(files),
      pendingAttachments.length
    );
    if (err) {
      setAttachmentError(err);
      return;
    }
    setPendingAttachments((prev) => [...prev, ...attachments]);
  }

  async function handleConfirmResolution(confirmed: boolean) {
    if (!ticket) return;
    setResolving(true);
    const res = await customerConfirmResolution(ticket.id, confirmed);
    setResolving(false);
    if (res.ok) {
      const updated = await getCustomerTicketDetail(ticket.id);
      if (updated.ok) setTicket(updated.data);
      onUpdated?.();
    }
  }

  const isClosed = ticket?.status === "CLOSED" || ticket?.status === "CANCELLED";
  const isResolved = ticket?.status === "RESOLVED";
  const statusLabel = ticket ? STATUS_LABELS[ticket.status] ?? ticket.status : "";
  const statusStyle = ticket
    ? STATUS_STYLES[ticket.status] ?? "bg-slate-100 text-slate-700 border-slate-200"
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs font-heebo animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl z-10 transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400">
                  {ticket?.ticketDisplayId || `#${ticketId.slice(-6).toUpperCase()}`}
                </span>
                {ticket && (
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${statusStyle}`}>
                    {statusLabel}
                  </span>
                )}
              </div>
              <h2 className="text-sm font-black text-slate-900 mt-0.5 truncate max-w-md">
                {ticket?.subject || "פניית שירות ותמיכה"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="סגור חלון"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-xs font-bold">טוען את פרטי הפנייה...</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 text-center">
              {error}
            </div>
          )}

          {!loading && ticket && (
            <>
              {/* Ticket Meta Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      תחום / שירות
                    </span>
                    <span className="font-black text-slate-800 mt-0.5 block">{ticket.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      נפתח בתאריך
                    </span>
                    <span className="font-semibold text-slate-700 mt-0.5 block">
                      {new Date(ticket.createdAt).toLocaleDateString("he-IL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      נציג מטפל
                    </span>
                    <span className="font-black text-blue-700 mt-0.5 flex items-center gap-1.5">
                      <Headphones className="h-3.5 w-3.5" />
                      {ticket.agentName ? `${ticket.agentName} (${ticket.agentRole})` : "נציג תמיכה ישויך בהקדם"}
                    </span>
                  </div>
                </div>

                {/* Resolution Confirmation Prompt */}
                {isResolved && (
                  <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5 text-indigo-950">
                      <CheckCircle className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black">הנציג סימן את הפנייה כפתורה</p>
                        <p className="text-[11px] font-medium text-indigo-800/80 mt-0.5">
                          האם הבעיה נפתרה לשביעות רצונך או שנדרש המשך טיפול?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={resolving}
                        onClick={() => handleConfirmResolution(true)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-black text-white transition-colors shadow-xs disabled:opacity-50"
                      >
                        כן, סגור פנייה
                      </button>
                      <button
                        type="button"
                        disabled={resolving}
                        onClick={() => handleConfirmResolution(false)}
                        className="rounded-xl border border-indigo-200 bg-white hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-bold text-indigo-900 transition-colors disabled:opacity-50"
                      >
                        לא, פתח מחדש
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    התכתבות והיסטוריית מענה ({ticket.messages.length})
                  </h3>
                </div>

                {ticket.messages.length === 0 ? (
                  <div className="py-8 text-center text-xs font-semibold text-slate-400 bg-white rounded-2xl border border-slate-200">
                    עדיין אין הודעות בפנייה זו. תוכל לכתוב תגובה למטה.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ticket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.isFromCustomer ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                            m.isFromCustomer
                              ? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1.5 opacity-80 text-[10px] font-bold">
                            <span>{m.isFromCustomer ? "אתה" : ticket.agentName || "נציג תמיכה"}</span>
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString("he-IL", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap">{m.message}</p>

                          {m.attachments.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-white/20">
                              <AttachmentThumbnails attachments={m.attachments} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Composer */}
        {!isClosed && ticket && (
          <div className="border-t border-slate-200 bg-white p-4 space-y-2">
            {sendError && <p className="text-xs font-bold text-rose-600">{sendError}</p>}
            {attachmentError && <p className="text-xs font-bold text-rose-600">{attachmentError}</p>}

            {pendingAttachments.length > 0 && (
              <PendingAttachmentTray
                attachments={pendingAttachments}
                onRemove={(index) =>
                  setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
                }
              />
            )}

            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  void handleFileSelect(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                title="צרף קובץ או תמונה"
              >
                <ImagePlus className="h-5 w-5" />
              </button>

              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="כתוב תגובה או פרטים נוספים לנציג..."
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />

              <button
                type="submit"
                disabled={sending || (!replyText.trim() && pendingAttachments.length === 0)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-xs"
                aria-label="שלח תגובה"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

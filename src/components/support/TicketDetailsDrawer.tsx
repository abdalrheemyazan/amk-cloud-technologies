"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  X,
  User,
  FileText,
  Wrench,
  MessageSquare,
  History,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import ComingSoonButton from "./ComingSoonButton";
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
  relativeTimeFromNow,
  ticketDisplayId,
} from "@/lib/support-labels";
import { startTicketTreatment, completeTicketTreatment, addTicketMessage } from "@/lib/actions/ticket-actions";
import type { TechnicianTicket } from "@/lib/support-types";
import ModalPortal from "@/components/ui/ModalPortal";

const ASSIST_TOOLS = ["בדיקת VPN", "בדיקת שרת", "בדיקת DNS", "בדיקת גיבוי", "שליחת קישור תמיכה מרחוק"];

const ACTION_ERROR_LABELS: Record<string, string> = {
  UNAUTHORIZED: "אין הרשאה לבצע פעולה זו",
  NOT_FOUND: "הקריאה לא נמצאה",
  ASSIGNED_TO_OTHER: "הקריאה משויכת לטכנאי אחר",
  NOT_OWNER: "הקריאה אינה משויכת אליך",
  EMPTY_MESSAGE: "יש להזין תוכן להודעה",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketDetailsDrawer({
  ticket,
  onClose,
}: {
  ticket: TechnicianTicket | null;
  onClose: () => void;
}) {
  const [isPending, startAction] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const isOpen = !!ticket;
  const isDone = ticket ? ["RESOLVED", "CLOSED", "CANCELLED"].includes(ticket.status) : false;

  const runAction = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setActionError(null);
    startAction(async () => {
      const result = await fn();
      if (!result.ok) {
        setActionError(ACTION_ERROR_LABELS[result.error ?? ""] ?? "הפעולה נכשלה, נסה שוב");
      }
    });
  };

  const handleSendReply = () => {
    if (!ticket || !replyText.trim()) return;
    setActionError(null);
    startAction(async () => {
      const result = await addTicketMessage(ticket.id, replyText.trim());
      if (result.ok) {
        setReplyText("");
      } else {
        setActionError(ACTION_ERROR_LABELS[result.error ?? ""] ?? "שליחת התגובה נכשלה");
      }
    });
  };

  const timeline = ticket
    ? [
        { id: "created", createdAt: ticket.createdAt, kind: "created" as const, label: "הקריאה נפתחה", sender: ticket.customerName },
        ...ticket.messages.map((m) => ({
          id: m.id,
          createdAt: m.createdAt,
          kind: "message" as const,
          label: m.message,
          sender: m.senderName,
          isFromCustomer: m.isFromCustomer,
        })),
      ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    : [];

  if (!isOpen || !ticket) return null;

  return (
    <ModalPortal
      onClose={onClose}
      ariaLabel="פרטי קריאה"
      rootClassName="items-stretch justify-end bg-slate-950/55 p-0 backdrop-blur-sm"
      panelClassName="h-full w-full max-w-2xl bg-transparent shadow-none"
    >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex h-full w-full flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A]">פרטי קריאה</h2>
                <p dir="ltr" className="text-xs font-semibold text-[#94A3B8]">{ticketDisplayId(ticket.id)}</p>
              </div>
              <button
                type="button"
                aria-label="סגירה"
                onClick={onClose}
                data-modal-autofocus
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* A. Ticket summary */}
              <section>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[ticket.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                  >
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${PRIORITY_STYLES[ticket.priority] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                  >
                    {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold text-[#0F172A]">{ticket.title || "משימה ללא כותרת"}</h3>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
                  <div>
                    <dt className="text-[#94A3B8]">נוצר בתאריך</dt>
                    <dd className="font-semibold text-[#334155]">{formatDate(ticket.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-[#94A3B8]">עודכן לאחרונה</dt>
                    <dd className="font-semibold text-[#334155]">{formatDate(ticket.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-[#94A3B8]">אחראי</dt>
                    <dd className="font-semibold text-[#334155]">{ticket.agentName || "לא משויך"}</dd>
                  </div>
                </dl>
              </section>

              {/* B. Customer details */}
              <section className="mt-6 rounded-2xl border border-[#E2E8F0] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <h4 className="text-sm font-bold text-[#0F172A]">פרטי לקוח</h4>
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">{ticket.customerName || "לקוח לא ידוע"}</p>
                <div className="mt-2 flex flex-col gap-1.5 text-xs text-[#64748B]">
                  {ticket.customerEmail && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {ticket.customerEmail}
                    </span>
                  )}
                  {ticket.customerPhone && (
                    <span dir="ltr" className="flex items-center justify-end gap-1.5 text-right">
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {ticket.customerPhone}
                    </span>
                  )}
                  {ticket.customerCompany && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> {ticket.customerCompany}
                    </span>
                  )}
                  {!ticket.customerEmail && !ticket.customerPhone && !ticket.customerCompany && (
                    <span className="text-[#94A3B8]">אין פרטי קשר נוספים במערכת</span>
                  )}
                </div>
              </section>

              {/* C. Problem details */}
              <section className="mt-4 rounded-2xl border border-[#E2E8F0] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <h4 className="text-sm font-bold text-[#0F172A]">פרטי התקלה</h4>
                </div>
                <p className="text-xs font-semibold text-[#94A3B8]">שירות / קטגוריה</p>
                <p className="mb-3 text-sm text-[#334155]">{ticket.category || "לא משויך"}</p>
                <p className="text-xs font-semibold text-[#94A3B8]">תיאור התקלה</p>
                <p className="whitespace-pre-wrap text-sm text-[#334155]">
                  {ticket.description || "לא סופק תיאור"}
                </p>
              </section>

              {/* D. Treatment actions */}
              <section className="mt-4 rounded-2xl border border-[#E2E8F0] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <h4 className="text-sm font-bold text-[#0F172A]">פעולות טיפול</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending || ticket.status !== "OPEN"}
                    onClick={() => runAction(() => startTicketTreatment(ticket.id))}
                    className="rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
                  >
                    התחלת טיפול
                  </button>
                  <button
                    type="button"
                    disabled={isPending || ticket.status !== "IN_PROGRESS"}
                    onClick={() => runAction(() => completeTicketTreatment(ticket.id))}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-[#E2E8F0] disabled:bg-white disabled:text-[#CBD5E1]"
                  >
                    סיום טיפול
                  </button>
                  <ComingSoonButton
                    label="סימון כממתין ללקוח"
                    message="יתווסף בהמשך"
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
                  />
                  <ComingSoonButton
                    label="סימון כממתין לחיבור מרחוק"
                    message="יתווסף בהמשך"
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
                  />
                  <ComingSoonButton
                    label="העברה לתמיכה"
                    message="יתווסף בהמשך"
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
                  />
                </div>
                {isDone && (
                  <p className="mt-2 text-[11px] font-medium text-[#94A3B8]">הטיפול בקריאה זו הסתיים.</p>
                )}
                {actionError && <p className="mt-2 text-[11px] font-semibold text-[#EF4444]">{actionError}</p>}
              </section>

              {/* E. Technician assistance */}
              <section className="mt-4 rounded-2xl border border-[#E2E8F0] p-4">
                <h4 className="mb-3 text-sm font-bold text-[#0F172A]">סיוע לטיפול</h4>
                <div className="flex flex-wrap gap-2">
                  {ASSIST_TOOLS.map((tool) => (
                    <ComingSoonButton
                      key={tool}
                      label={tool}
                      message="הכלי יתווסף בהמשך"
                      className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#CBD5E1]"
                    />
                  ))}
                </div>
              </section>

              {/* F. Internal notes */}
              <section className="mt-4 rounded-2xl border border-[#E2E8F0] p-4">
                <h4 className="mb-2 text-sm font-bold text-[#0F172A]">הערות פנימיות</h4>
                <textarea
                  disabled
                  rows={2}
                  placeholder="מודול הערות יתווסף בהמשך"
                  className="w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-[#94A3B8] outline-none"
                />
                <p className="mt-1 text-[10px] font-medium text-[#94A3B8]">הערות פנימיות גלויות לצוות בלבד, לא ללקוח.</p>
              </section>

              {/* G. Customer reply */}
              <section className="mt-4 rounded-2xl border border-[#E2E8F0] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <h4 className="text-sm font-bold text-[#0F172A]">תגובה ללקוח</h4>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="כתוב תגובה ללקוח..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isPending || !replyText.trim()}
                    onClick={handleSendReply}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
                  >
                    שליחת תגובה
                  </button>
                </div>
              </section>

              {/* H. Timeline */}
              <section className="mt-4 rounded-2xl border border-[#E2E8F0] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <h4 className="text-sm font-bold text-[#0F172A]">היסטוריית טיפול</h4>
                </div>
                {timeline.length === 0 ? (
                  <p className="text-sm text-[#94A3B8]">אין היסטוריית טיפול להצגה</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {timeline.map((entry) => (
                      <li key={entry.id} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0F172A]">
                            {entry.kind === "created" ? "הקריאה נפתחה" : entry.sender || "משתמש"}
                            {entry.kind === "message" && (
                              <span className="mr-1.5 text-[10px] font-medium text-[#94A3B8]">
                                ({entry.isFromCustomer ? "לקוח" : "צוות"})
                              </span>
                            )}
                          </p>
                          {entry.kind === "message" && (
                            <p className="mt-0.5 whitespace-pre-wrap text-sm text-[#334155]">{entry.label}</p>
                          )}
                          <p className="mt-0.5 text-[10px] text-[#94A3B8]">{relativeTimeFromNow(entry.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </motion.div>
    </ModalPortal>
  );
}

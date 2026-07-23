"use client";

import { UserRound, Mail, Tag, FileText, Clock, ShieldCheck, CheckCircle2, Send, LogOut } from "lucide-react";
import type { ActiveChat } from "@/lib/actions/support-chat-actions";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CustomerContextPanel({
  chat,
  onMarkHandled,
  onSendSummary,
  onEndChat,
}: {
  chat: ActiveChat | null;
  onMarkHandled: () => void;
  onSendSummary: () => void;
  onEndChat: () => void;
}) {
  if (!chat) {
    return (
      <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] flex items-center justify-center min-h-[420px]">
        <p className="text-sm text-[#94A3B8] font-semibold text-center">אין פרטי לקוח להצגה</p>
      </section>
    );
  }

  const fields = [
    { icon: UserRound, label: "שם לקוח", value: chat.customerName ?? "—" },
    { icon: Mail, label: "אימייל", value: chat.customerEmail ?? "—" },
    { icon: Tag, label: "תחום הפנייה", value: chat.category ?? "—" },
    { icon: FileText, label: "תקציר הבעיה", value: chat.summary ?? "—" },
    { icon: Clock, label: "זמן פתיחה", value: formatDateTime(chat.createdAt) },
    {
      icon: ShieldCheck,
      label: "תוקף שמירת השיחה",
      value: chat.expiresAt ? formatDateTime(chat.expiresAt) : "—",
    },
  ];

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 md:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] flex flex-col gap-5">
      <h2 className="text-sm font-black text-[#0F172A]">פרטי הלקוח</h2>

      <div className="space-y-3.5">
        {fields.map((field) => (
          <div key={field.label} className="flex items-start gap-2.5">
            <field.icon className="w-4 h-4 text-[#94A3B8] mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-[#94A3B8] font-bold">{field.label}</div>
              <div className="text-xs text-[#0F172A] font-semibold break-words">{field.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
        <div className="text-[11px] text-[#94A3B8] font-bold mb-1">פעולות מהירות</div>
        <button
          onClick={onMarkHandled}
          className="w-full flex items-center gap-2 bg-[#EFF6FF] hover:bg-blue-100 text-blue-600 rounded-xl px-3.5 py-2.5 text-xs font-black transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          סימון כטופל
        </button>
        <button
          onClick={onSendSummary}
          className="w-full flex items-center gap-2 bg-[#F4F7FB] hover:bg-slate-100 text-[#0F172A] rounded-xl px-3.5 py-2.5 text-xs font-black transition-colors"
        >
          <Send className="w-4 h-4" />
          שליחת הודעת סיכום
        </button>
        <button
          onClick={onEndChat}
          className="w-full flex items-center gap-2 bg-white border border-[#E2E8F0] hover:bg-rose-50 hover:border-rose-200 text-rose-600 rounded-xl px-3.5 py-2.5 text-xs font-black transition-colors"
        >
          <LogOut className="w-4 h-4" />
          סיום שיחה
        </button>
      </div>
    </section>
  );
}

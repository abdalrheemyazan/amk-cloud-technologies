"use client";

import {
  ArrowLeftRight,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  LogOut,
  Mail,
  MessageCircleQuestion,
  Tag,
  UserRound,
} from "lucide-react";
import type { ActiveChat } from "@/lib/actions/support-chat-actions";
import type {
  SupportActivityView,
  SupportTransferView,
} from "@/lib/actions/support-team-actions";
import PublicActivityTimeline from "./PublicActivityTimeline";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportCasePanel({
  chat,
  activity,
  transferHistory,
  onConsult,
  onTransfer,
  onResolve,
  onEnd,
  onAnalyze,
}: {
  chat: ActiveChat | null;
  activity: SupportActivityView[];
  transferHistory: SupportTransferView[];
  onConsult: () => void;
  onTransfer: () => void;
  onResolve: () => void;
  onEnd: () => void;
  onAnalyze: () => void;
}) {
  if (!chat) {
    return (
      <section className="flex min-h-[440px] items-center justify-center rounded-[20px] border border-slate-200/80 bg-white p-6">
        <div className="max-w-xs text-center">
          <UserRound className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
          <p className="mt-3 text-xs font-bold text-slate-500">בחרו שיחה כדי להציג פרטי לקוח וכלי תיאום.</p>
        </div>
      </section>
    );
  }

  const fields = [
    { icon: UserRound, label: "לקוח", value: chat.customerName || "—" },
    { icon: Mail, label: "דוא״ל", value: chat.customerEmail || "—" },
    { icon: Tag, label: "תחום", value: chat.category || "—" },
    { icon: FileText, label: "תקציר", value: chat.summary || "—" },
    { icon: Clock3, label: "נפתחה", value: formatDateTime(chat.createdAt) },
  ];

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)]">
      <div className="border-b border-slate-100 px-4 py-3.5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-600">Case control</p>
        <h2 className="mt-1 text-sm font-black text-slate-950">פרטי הפנייה וכלי צוות</h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <button
          type="button"
          onClick={onAnalyze}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-l from-blue-600 to-indigo-600 px-3 py-2.5 text-xs font-black text-white outline-none transition-all hover:from-blue-500 hover:to-indigo-500 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Bot className="h-4 w-4" aria-hidden="true" />
          ניתוח בעזרת AI
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onConsult}
            className="flex min-h-16 flex-col items-start justify-between rounded-[14px] border border-violet-100 bg-violet-50/70 p-3 text-right outline-none transition-colors hover:border-violet-200 hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <MessageCircleQuestion className="h-4 w-4 text-violet-700" aria-hidden="true" />
            <span className="mt-2 text-[11px] font-black text-violet-900">התייעצות פנימית</span>
          </button>
          <button
            type="button"
            onClick={onTransfer}
            className="flex min-h-16 flex-col items-start justify-between rounded-[14px] border border-blue-100 bg-blue-50/70 p-3 text-right outline-none transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeftRight className="h-4 w-4 text-blue-700" aria-hidden="true" />
            <span className="mt-2 text-[11px] font-black text-blue-900">העברת טיפול</span>
          </button>
        </div>

        <div>
          <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">פרטי לקוח</p>
          <div className="space-y-2.5">
            {fields.map((field) => (
              <div key={field.label} className="flex items-start gap-2.5">
                <field.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400">{field.label}</p>
                  <p className="break-words text-[11px] font-semibold leading-4 text-slate-800">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
              עדכונים ללקוח
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700">
              ציבורי
            </span>
          </div>
          <PublicActivityTimeline activities={activity} compact />
        </div>

        {transferHistory.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
              היסטוריית העברות
            </p>
            <div className="space-y-2">
              {transferHistory.map((transfer) => (
                <div key={transfer.id} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-black text-slate-700">
                    {transfer.fromAgentName} ? {transfer.toAgentName}
                  </p>
                  <p className="mt-1 text-[9px] font-semibold text-slate-400">
                    {formatDateTime(transfer.createdAt)}
                  </p>
                  {transfer.note && (
                    <p className="mt-1.5 text-[10px] font-semibold leading-4 text-slate-500">{transfer.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-3">
        <button
          type="button"
          onClick={onResolve}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-[10px] font-black text-white outline-none hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          סימון כנפתר
        </button>
        <button
          type="button"
          onClick={onEnd}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-rose-600 outline-none hover:border-rose-200 hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          סגירת הפנייה
        </button>
      </div>
    </section>
  );
}


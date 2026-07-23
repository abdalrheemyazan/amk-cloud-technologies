"use client";

import type { ReactNode } from "react";
import { Bot, Headphones, Trash2 } from "lucide-react";
import AttachmentThumbnails from "@/components/support/AttachmentThumbnails";
import type { SupportAttachmentView } from "@/lib/support-attachments";

export type CustomerChatSenderType = "customer" | "assistant" | "support" | "system";

function formatMessageTime(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  const time = date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) return time;
  return `${time} · ${date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })}`;
}

export default function CustomerChatMessage({
  senderType,
  text,
  createdAt,
  attachments = [],
  senderLabel,
  avatar,
  action,
  pending = false,
  deleted = false,
  deletable = false,
  onDelete,
}: {
  senderType: CustomerChatSenderType;
  text: string;
  createdAt: string;
  attachments?: SupportAttachmentView[];
  senderLabel?: string;
  avatar?: ReactNode;
  action?: ReactNode;
  pending?: boolean;
  deleted?: boolean;
  deletable?: boolean;
  onDelete?: () => void;
}) {
  const isCustomer = senderType === "customer";
  const isSystem = senderType === "system";
  const timestamp = formatMessageTime(createdAt);

  if (isSystem) {
    return (
      <div className="flex w-full justify-center" dir="ltr">
        <div className="max-w-[92%] rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1.5 text-center shadow-sm" dir="rtl">
          <span className="text-[11px] font-bold text-slate-600">{text}</span>
          <time className="ms-2 font-mono text-[9px] font-medium tabular-nums text-slate-400" dateTime={createdAt} dir="ltr">
            {timestamp}
          </time>
        </div>
      </div>
    );
  }

  return (
    <article
      className={`flex w-full items-end gap-2.5 ${isCustomer ? "justify-end" : "justify-start"}`}
      dir="ltr"
      aria-label={isCustomer ? "הודעת לקוח" : senderType === "assistant" ? "הודעת העוזר החכם" : "הודעת תמיכה"}
    >
      {!isCustomer ? (
        <div className="mb-5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white bg-white text-blue-700 shadow-[0_5px_16px_-8px_rgba(37,99,235,0.7)]">
          {avatar ??
            (senderType === "assistant" ? (
              <Bot className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Headphones className="h-4 w-4" aria-hidden="true" />
            ))}
        </div>
      ) : null}

      <div className="min-w-0 max-w-[82%] sm:max-w-[72%]">
        {!isCustomer && senderLabel ? (
          <p className="mb-1 px-1 text-left text-[10px] font-black tracking-wide text-slate-500" dir="rtl">
            {senderLabel}
          </p>
        ) : null}

        <div
          className={`min-w-[74px] overflow-hidden text-sm font-semibold leading-6 shadow-sm ${
            deleted
              ? "rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-3.5 py-2.5 italic text-slate-400"
              : isCustomer
                ? "rounded-[18px] rounded-br-[5px] bg-[#2563EB] px-3.5 py-2.5 text-white shadow-[0_9px_24px_-16px_rgba(37,99,235,0.95)]"
                : "rounded-[18px] rounded-bl-[5px] border border-slate-200/90 bg-white px-3.5 py-2.5 text-slate-800"
          }`}
          dir="rtl"
        >
          {text ? <p className="whitespace-pre-wrap break-words">{text}</p> : null}
          {!deleted && attachments.length > 0 ? (
            <AttachmentThumbnails attachments={attachments} className={text ? "mt-2.5" : "mt-0"} />
          ) : null}
          {!deleted && action ? <div className="mt-3">{action}</div> : null}
        </div>

        <div className={`mt-1 flex items-center gap-1.5 px-1 ${isCustomer ? "justify-end" : "justify-start"}`}>
          {deletable && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              aria-label="מחיקת הודעה"
              className="flex h-5 w-5 items-center justify-center rounded-md text-slate-300 outline-none transition-colors hover:bg-rose-50 hover:text-rose-500 focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
            </button>
          ) : null}
          <time className="font-mono text-[9px] font-medium tabular-nums text-slate-400" dateTime={createdAt} dir="ltr">
            {timestamp}
          </time>
          {pending ? <span className="text-[9px] font-bold text-slate-400">· שולח</span> : null}
        </div>
      </div>
    </article>
  );
}

"use client";

import { useRef, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { ImagePlus, LoaderCircle, SendHorizontal } from "lucide-react";
import PendingAttachmentTray from "@/components/support/PendingAttachmentTray";
import type { PendingAttachment } from "@/lib/chat-attachments-client";

export default function CustomerChatComposer({
  value,
  onValueChange,
  onSend,
  onFilesSelected,
  attachments,
  onRemoveAttachment,
  error,
  sending = false,
  disabled = false,
  placeholder = "כתוב את הבעיה שלך כאן...",
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  onFilesSelected: (files: File[]) => void | Promise<void>;
  attachments: PendingAttachment[];
  onRemoveAttachment: (index: number) => void;
  error: string | null;
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = !disabled && !sending && (value.trim().length > 0 || attachments.length > 0);
  const attachmentLimitReached = attachments.length >= 1;

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (canSend) void onSend();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (canSend) void onSend();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = "";
    if (files.length > 0) void onFilesSelected(files);
  }

  return (
    <div className="border-t border-slate-200/90 bg-white px-3 py-3 sm:px-4">
      <form onSubmit={submit} aria-label="שליחת הודעה בצ׳אט">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50/80 shadow-[0_5px_22px_-18px_rgba(15,23,42,0.55)] transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_8px_28px_-18px_rgba(37,99,235,0.45)]">
          {attachments.length > 0 ? (
            <div className="border-b border-slate-200/80 bg-white/80 px-2.5 py-2">
              <PendingAttachmentTray attachments={attachments} onRemove={onRemoveAttachment} />
            </div>
          ) : null}

          <div className="flex items-end gap-1.5 p-1.5" dir="rtl">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || sending || attachmentLimitReached}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 outline-none transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={attachmentLimitReached ? "כבר צורפה תמונה להודעה" : "צירוף תמונה"}
              title={attachmentLimitReached ? "ניתן לצרף תמונה אחת בכל הודעה" : "צירוף תמונה"}
            >
              <ImagePlus className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            <textarea
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || sending}
              maxLength={3000}
              rows={1}
              placeholder={placeholder}
              aria-describedby="customer-chat-composer-help customer-chat-attachment-error"
              className="max-h-28 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent px-1.5 py-2.5 text-sm font-semibold leading-5 text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!canSend}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-[0_8px_20px_-12px_rgba(37,99,235,0.95)] outline-none transition-[background-color,transform,opacity] hover:bg-blue-700 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              aria-label={sending ? "ההודעה נשלחת" : "שליחת הודעה"}
            >
              {sending ? (
                <LoaderCircle className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />
              ) : (
                <SendHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex min-h-4 flex-col items-start justify-between gap-0.5 px-1 text-[10px] font-semibold sm:flex-row sm:gap-3">
          <p id="customer-chat-attachment-error" className="text-rose-600" role={error ? "alert" : undefined} aria-live="polite">
            {error ?? ""}
          </p>
          <p id="customer-chat-composer-help" className="text-slate-400 sm:shrink-0">
            Enter לשליחה · Shift+Enter לשורה חדשה · תמונה עד 3MB
          </p>
        </div>
      </form>
    </div>
  );
}

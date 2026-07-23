"use client";

import { useRef, useState } from "react";
import { MessageSquareOff, Send, LogOut, MessagesSquare, ImagePlus, MessageSquareText } from "lucide-react";
import type { ActiveChat, ChatAttachment } from "@/lib/actions/support-chat-actions";
import { CANNED_REPLIES } from "@/lib/canned-replies";
import type { SupportReplyOption } from "@/lib/support-profile";
import { processSelectedFiles, type PendingAttachment } from "@/lib/chat-attachments-client";
import AttachmentThumbnails from "./AttachmentThumbnails";
import PendingAttachmentTray from "./PendingAttachmentTray";
import StatusBadge from "./SupportStatusBadge";

type ChatMessage = { id: string; message: string; isFromCustomer: boolean; createdAt: string; attachments: ChatAttachment[] };

export default function ActiveChatWindow({
  chat,
  closedChat,
  messages,
  messageInput,
  onMessageInputChange,
  onSend,
  onCloseChat,
  onDismissClosed,
  agentName,
  cannedReplies,
}: {
  chat: ActiveChat | null;
  closedChat: ActiveChat | null;
  messages: ChatMessage[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSend: (attachments?: PendingAttachment[]) => Promise<boolean>;
  onCloseChat: () => void;
  onDismissClosed: () => void;
  agentName: string | null;
  cannedReplies?: SupportReplyOption[];
}) {
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showCannedReplies, setShowCannedReplies] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyOptions = cannedReplies ?? CANNED_REPLIES.map((reply) => ({
    key: reply.key,
    label: reply.label,
    text: reply.getText(agentName),
  }));

  if (closedChat) {
    return (
      <section className="bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] flex flex-col items-center justify-center min-h-[420px] p-8 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <MessageSquareOff className="w-5.5 h-5.5" />
        </div>
        <p className="text-sm font-black text-[#0F172A]">
          השיחה עם {closedChat.customerName ?? "הלקוח"} הסתיימה
        </p>
        <p className="text-sm text-[#64748B] font-semibold max-w-xs">
          השיחה הסתיימה. ההיסטוריה תישמר למשך 7 ימים.
        </p>
        <button
          onClick={onDismissClosed}
          className="mt-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors"
        >
          סגירה
        </button>
      </section>
    );
  }

  if (!chat) {
    return (
      <section className="bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] flex flex-col items-center justify-center min-h-[420px] p-8 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#F4F7FB] text-[#94A3B8] flex items-center justify-center">
          <MessagesSquare className="w-5.5 h-5.5" />
        </div>
        <p className="text-sm text-[#94A3B8] font-semibold">בחר שיחה כדי להתחיל טיפול</p>
      </section>
    );
  }

  async function handleFileSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setAttachmentError(null);
    const { attachments, error } = await processSelectedFiles(Array.from(fileList), pendingAttachments.length);
    if (error) {
      setAttachmentError(error);
      return;
    }
    setPendingAttachments((prev) => [...prev, ...attachments]);
  }

  async function handleSend() {
    if ((!messageInput.trim() && pendingAttachments.length === 0) || sending) return;
    setSending(true);
    setAttachmentError(null);
    const sent = await onSend(pendingAttachments);
    if (sent) setPendingAttachments([]);
    setSending(false);
  }

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] flex flex-col overflow-hidden min-h-[420px]">
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
        <div>
          <span className="font-black text-sm text-[#0F172A]">שיחה עם {chat.customerName ?? "לקוח"}</span>
          <div className="flex items-center gap-1.5 mt-1">
            {chat.category && (
              <span className="inline-block text-[11px] font-bold text-blue-600 bg-[#EFF6FF] rounded-full px-2.5 py-0.5">
                {chat.category}
              </span>
            )}
            <StatusBadge status="ACTIVE" />
          </div>
        </div>
        <button
          onClick={onCloseChat}
          className="flex items-center gap-1.5 text-xs font-black text-rose-600 hover:text-rose-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          סיום שיחה
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F4F7FB]">
        {messages.length === 0 && (
          <p className="text-center text-xs text-[#94A3B8] font-semibold py-8">אין הודעות להצגה</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.isFromCustomer ? "flex justify-start" : "flex justify-end"}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold leading-relaxed ${
                m.isFromCustomer
                  ? "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-sm"
                  : "bg-blue-600 text-white rounded-br-sm"
              }`}
            >
              {m.message}
              <AttachmentThumbnails attachments={m.attachments} />
            </div>
          </div>
        ))}
      </div>

      {/* Canned replies */}
      <div className="border-t border-[#E2E8F0]">
        <button
          onClick={() => setShowCannedReplies((v) => !v)}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-black text-[#64748B] hover:text-blue-600 transition-colors"
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          תגובות מוכנות
        </button>
        {showCannedReplies && (
          <div className="px-3 pb-2.5 flex flex-wrap gap-1.5">
            {replyOptions.map((reply) => (
              <button
                key={reply.key}
                onClick={() => {
                  onMessageInputChange(reply.text);
                  setShowCannedReplies(false);
                }}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-[#EFF6FF] text-blue-600 hover:bg-blue-100 transition-colors"
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {(pendingAttachments.length > 0 || attachmentError) && (
        <div className="px-3 pt-3 border-t border-[#E2E8F0]">
          {attachmentError && <p className="text-[11px] text-rose-600 font-bold mb-1.5">{attachmentError}</p>}
          {pendingAttachments.length > 0 && (
            <div className="mb-2">
              <PendingAttachmentTray
                attachments={pendingAttachments}
                onRemove={(index) =>
                  setPendingAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
              />
            </div>
          )}
        </div>
      )}

      <div className="px-3 py-3 border-t border-[#E2E8F0] flex items-center gap-2">
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
          disabled={sending || pendingAttachments.length >= 3}
          className="w-11 h-11 flex items-center justify-center bg-[#F4F7FB] hover:bg-slate-100 text-[#64748B] rounded-xl transition-colors shrink-0"
          aria-label="צירוף תמונה או צילום מסך"
          title="צירוף תמונה או צילום מסך"
        >
          <ImagePlus className="w-4 h-4" />
        </button>
        <input
          value={messageInput}
          onChange={(e) => onMessageInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSend();
          }}
          placeholder="כתיבת הודעה..."
          className="flex-1 h-11 bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 rounded-xl px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || (!messageInput.trim() && pendingAttachments.length === 0)}
          className="w-11 h-11 flex items-center justify-center bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all shrink-0 shadow-sm"
          aria-label="שליחה"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

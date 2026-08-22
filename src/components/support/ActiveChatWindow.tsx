"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquareOff,
  Send,
  LogOut,
  MessagesSquare,
  ImagePlus,
  MessageSquareText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { ActiveChat, ChatAttachment } from "@/lib/actions/support-chat-actions";
import {
  getPreparedResponses,
  type PreparedResponseView,
} from "@/lib/actions/prepared-response-actions";
import type { SupportReplyOption } from "@/lib/support-profile";
import { processSelectedFiles, type PendingAttachment } from "@/lib/chat-attachments-client";
import AttachmentThumbnails from "./AttachmentThumbnails";
import PendingAttachmentTray from "./PendingAttachmentTray";
import StatusBadge from "./SupportStatusBadge";

type ChatMessage = {
  id: string;
  message: string;
  isFromCustomer: boolean;
  createdAt: string;
  attachments: ChatAttachment[];
};

export default function ActiveChatWindow({
  chat,
  closedChat,
  messages,
  messageInput,
  onMessageInputChange,
  onSend,
  onCloseChat,
  onDismissClosed,
  agentName: _agentName,
  cannedReplies: _cannedReplies,
  onSetWaitingCustomer,
  onSetWaitingInternal: _onSetWaitingInternal,
  onResolve,
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
  onSetWaitingCustomer?: () => void;
  onSetWaitingInternal?: () => void;
  onResolve?: () => void;
}) {
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showPreparedResponses, setShowPreparedResponses] = useState(false);
  const [dbPreparedResponses, setDbPreparedResponses] = useState<PreparedResponseView[]>([]);
  const [responseCategoryFilter, setResponseCategoryFilter] = useState<string>("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadResponses() {
      const res = await getPreparedResponses({ activeOnly: true });
      if (res.ok) {
        setDbPreparedResponses(res.data);
      }
    }
    loadResponses();
  }, []);

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
          השיחה הסתיימה. היסטוריית הפנייה נשמרה בבטחה.
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
        <p className="text-sm text-[#94A3B8] font-semibold">בחר שיחה פעילה מתור הפניות או מהלוח כדי להתחיל טיפול</p>
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

  const filteredResponses =
    responseCategoryFilter === "ALL"
      ? dbPreparedResponses
      : dbPreparedResponses.filter((r) => r.category === responseCategoryFilter);

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] flex flex-col overflow-hidden min-h-[460px]">
      <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 bg-gradient-to-l from-slate-50 to-white">
        <div>
          <span className="font-black text-sm text-[#0F172A]">שיחה עם {chat.customerName ?? "לקוח"}</span>
          <div className="flex items-center gap-2 mt-1">
            {chat.category && (
              <span className="inline-block text-[11px] font-bold text-blue-600 bg-[#EFF6FF] rounded-full px-2.5 py-0.5">
                {chat.category}
              </span>
            )}
            <StatusBadge status="ACTIVE" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onSetWaitingCustomer && (
            <button
              type="button"
              onClick={onSetWaitingCustomer}
              className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-xl transition-colors"
              title="העבר להמתנה ללקוח ושחרר מכסה"
            >
              <Clock className="w-3.5 h-3.5" />
              המתנה ללקוח
            </button>
          )}

          {onResolve && (
            <button
              type="button"
              onClick={onResolve}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl transition-colors"
              title="סמן כנפתר לאישור לקוח"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              פתור פנייה
            </button>
          )}

          <button
            onClick={onCloseChat}
            className="flex items-center gap-1 text-[11px] font-black text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            סיום שיחה
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F4F7FB] max-h-[460px]">
        {messages.length === 0 && (
          <p className="text-center text-xs text-[#94A3B8] font-semibold py-8">אין הודעות בשיחה זו עדיין.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.isFromCustomer ? "flex justify-start" : "flex justify-end"}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold leading-relaxed ${
                m.isFromCustomer
                  ? "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-sm shadow-sm"
                  : "bg-blue-600 text-white rounded-br-sm shadow-sm"
              }`}
            >
              {m.message}
              <AttachmentThumbnails attachments={m.attachments} />
            </div>
          </div>
        ))}
      </div>

      {/* Real Prepared Responses Tray */}
      <div className="border-t border-[#E2E8F0] bg-slate-50/50">
        <div className="flex items-center justify-between px-3 py-1.5">
          <button
            type="button"
            onClick={() => setShowPreparedResponses((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-blue-600 transition-colors"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-blue-600" />
            תגובות מוכנות ({dbPreparedResponses.length})
          </button>
          {showPreparedResponses && (
            <span className="text-[10px] font-semibold text-slate-400">
              לחיצה משבצת את הטקסט לתיבה לעריכה ולשליחה ידנית
            </span>
          )}
        </div>

        {showPreparedResponses && (
          <div className="p-3 border-t border-slate-200/80 bg-white space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              <button
                type="button"
                onClick={() => setResponseCategoryFilter("ALL")}
                className={`px-2 py-0.5 rounded-full font-bold transition-colors shrink-0 ${
                  responseCategoryFilter === "ALL"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                הכל
              </button>
              {["GREETING", "REQUEST_INFORMATION", "WAITING", "FOLLOW_UP", "RESOLUTION", "CLOSING"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setResponseCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded-full font-bold transition-colors shrink-0 ${
                    responseCategoryFilter === cat
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat === "GREETING" && "פתיחה"}
                  {cat === "REQUEST_INFORMATION" && "בקשת מידע"}
                  {cat === "WAITING" && "המתנה"}
                  {cat === "FOLLOW_UP" && "מעקב"}
                  {cat === "RESOLUTION" && "פתרון"}
                  {cat === "CLOSING" && "סיום"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredResponses.map((response) => (
                <button
                  key={response.id}
                  type="button"
                  onClick={() => {
                    onMessageInputChange(response.content);
                    setShowPreparedResponses(false);
                  }}
                  className="flex flex-col items-start p-2 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/60 text-right transition-all group"
                >
                  <span className="text-[11px] font-black text-slate-900 group-hover:text-blue-700">
                    {response.title}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                    {response.content}
                  </span>
                </button>
              ))}
            </div>
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

      <div className="px-3 py-3 border-t border-[#E2E8F0] flex items-center gap-2 bg-white">
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
          placeholder="כתיבת מענה ללקוח (או בחירת תגובה מוכנה)..."
          className="flex-1 h-11 bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 rounded-xl px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors font-medium"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || (!messageInput.trim() && pendingAttachments.length === 0)}
          className="w-11 h-11 flex items-center justify-center bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all shrink-0 shadow-sm disabled:opacity-40"
          aria-label="שליחה"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}


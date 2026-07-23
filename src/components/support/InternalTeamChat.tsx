"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AtSign, Eraser, ImagePlus, LockKeyhole, MessageCircle, Send, TicketCheck, X } from "lucide-react";
import {
  clearSupportChatForAgent,
  getInternalSupportConversation,
  sendInternalSupportMessage,
  type ConnectedSupportAgent,
  type InternalSupportMessageView,
} from "@/lib/actions/support-team-actions";
import { processSelectedFiles, type PendingAttachment } from "@/lib/chat-attachments-client";
import AttachmentThumbnails from "./AttachmentThumbnails";
import PendingAttachmentTray from "./PendingAttachmentTray";
import ModalPortal from "@/components/ui/ModalPortal";

const POLL_INTERVAL_MS = 4000;

export default function InternalTeamChat({
  agent,
  sessionId,
  customerName,
  onClose,
}: {
  agent: ConnectedSupportAgent | null;
  sessionId: string | null;
  customerName?: string | null;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<InternalSupportMessageView[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async () => {
    if (!agent) return;
    const result = await getInternalSupportConversation(agent.id);
    if (result.ok) setMessages(result.data);
  }, [agent]);

  useEffect(() => {
    if (!agent) return;
    const initialLoad = window.setTimeout(() => {
      void loadMessages();
    }, 0);
    const interval = window.setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [agent, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  if (!agent) return null;

  async function send() {
    if (!agent) return;
    const trimmed = input.trim();
    if ((!trimmed && pendingAttachments.length === 0) || sending) return;

    setSending(true);
    setError(null);
    setInput("");
    const attachmentsToSend = pendingAttachments;
    setPendingAttachments([]);

    const optimisticMessage: InternalSupportMessageView = {
      id: `local-${Date.now()}`,
      senderId: "me",
      senderName: "אני",
      content: trimmed,
      sessionId,
      createdAt: new Date().toISOString(),
      isMine: true,
      attachments: attachmentsToSend,
    };
    setMessages((current) => [...current, optimisticMessage]);

    const result = await sendInternalSupportMessage(agent.id, trimmed, sessionId, attachmentsToSend);
    if (!result.ok) {
      setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
      setInput(trimmed);
      setPendingAttachments(attachmentsToSend);
      setError(result.error);
    } else {
      await loadMessages();
    }
    setSending(false);
  }

  async function handleFileSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const { attachments, error: validationError } = await processSelectedFiles(
      Array.from(fileList),
      pendingAttachments.length,
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    setPendingAttachments((current) => [...current, ...attachments]);
  }

  async function clearConversation() {
    if (!agent || clearing) return;
    setClearing(true);
    setError(null);
    const result = await clearSupportChatForAgent(agent.id);
    if (result.ok) {
      setMessages([]);
      setShowClearConfirmation(false);
    } else {
      setError(result.error);
    }
    setClearing(false);
  }

  const mention = `@${agent.name.split(/\s+/)[0]} `;

  return (
    <ModalPortal
      onClose={onClose}
      closeOnBackdrop={!showClearConfirmation}
      closeOnEscape={!showClearConfirmation}
      labelledBy="internal-chat-title"
      rootClassName="items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      panelClassName="flex h-[82vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.65)] sm:h-[650px] sm:max-h-[82vh] sm:rounded-[24px]"
    >
        <header className="border-b border-slate-100 bg-[#0B1739] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/10">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="internal-chat-title" className="truncate text-sm font-black">
                  שיחה פנימית עם {agent.name}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-blue-100/75">
                  <LockKeyhole className="h-3 w-3" aria-hidden="true" />
                  גלוי לצוות התמיכה בלבד
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setShowClearConfirmation(true)}
                aria-label="ניקוי שיחה"
                title="ניקוי שיחה"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/65 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || pendingAttachments.length >= 3}
                aria-label="צירוף תמונה או צילום מסך"
                title="צירוף תמונה או צילום מסך"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/65 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onClose}
                data-modal-autofocus
                aria-label="סגירה"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {sessionId && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-[10px] font-bold text-blue-50">
              <TicketCheck className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
              ההתייעצות משויכת לפנייה של {customerName || "הלקוח/ה"}
            </div>
          )}
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
          {messages.length === 0 && (
            <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
              <MessageCircle className="h-8 w-8 text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-xs font-black text-slate-600">התחילו התייעצות פנימית</p>
              <p className="mt-1 max-w-xs text-[11px] leading-5 text-slate-400">
                אפשר לבקש עזרה, לשתף הקשר מקצועי או לתאם העברת טיפול.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={message.isMine ? "flex justify-start" : "flex justify-end"}>
              <div className="max-w-[82%]">
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-5 ${
                    message.isMine
                      ? "rounded-br-sm bg-blue-600 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {message.content ? <p>{message.content}</p> : null}
                  <AttachmentThumbnails attachments={message.attachments} />
                </div>
                <p className={`mt-1 px-1 text-[9px] font-semibold text-slate-400 ${
                  message.isMine ? "text-right" : "text-left"
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <footer className="border-t border-slate-100 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setInput((current) => (current.startsWith(mention) ? current : mention + current))}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            >
              <AtSign className="h-3 w-3" aria-hidden="true" />
              אזכור {agent.name.split(/\s+/)[0]}
            </button>
            <span className="text-[9px] font-semibold text-slate-400">הודעות אלה אינן מוצגות ללקוח</span>
          </div>
          {error && <p role="alert" className="mb-2 text-[10px] font-bold text-rose-600">{error}</p>}
          {pendingAttachments.length > 0 ? (
            <div className="mb-2">
              <PendingAttachmentTray
                attachments={pendingAttachments}
                onRemove={(index) =>
                  setPendingAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
              />
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(event) => {
                void handleFileSelect(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || pendingAttachments.length >= 3}
              aria-label="צירוף תמונה או צילום מסך"
              title="צירוף תמונה או צילום מסך"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
            </button>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="כתיבת הודעה פנימית..."
              className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || (!input.trim() && pendingAttachments.length === 0)}
              aria-label="שליחת הודעה פנימית"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send className={`h-4 w-4 ${sending ? "animate-pulse" : ""}`} aria-hidden="true" />
            </button>
          </div>
        </footer>

        {showClearConfirmation ? (
          <ModalPortal
            onClose={() => setShowClearConfirmation(false)}
            closeOnBackdrop={!clearing}
            closeOnEscape={!clearing}
            role="alertdialog"
            labelledBy="clear-chat-title"
            describedBy="clear-chat-description"
            zIndexClassName="z-[10000]"
            rootClassName="items-center justify-center bg-slate-950/60 p-5 backdrop-blur-sm"
            panelClassName="w-full max-w-sm rounded-[20px] border border-slate-200 bg-white p-5 text-right shadow-[0_24px_70px_-26px_rgba(15,23,42,0.65)]"
          >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Eraser className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <h3 id="clear-chat-title" className="mt-3 text-sm font-black text-slate-950">ניקוי שיחה</h3>
              <p id="clear-chat-description" className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                האם לנקות את ההודעות מהשיחה הנוכחית? הפעולה מסתירה את ההיסטוריה מהתצוגה שלך בלבד ואינה מוחקת אותה עבור חבר הצוות.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => setShowClearConfirmation(false)}
                  data-modal-autofocus
                  className="rounded-xl border border-slate-200 px-4 py-2 text-[11px] font-black text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => void clearConversation()}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-[11px] font-black text-white outline-none transition-colors hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-wait disabled:opacity-60"
                >
                  {clearing ? "מנקה..." : "ניקוי"}
                </button>
              </div>
          </ModalPortal>
        ) : null}
    </ModalPortal>
  );
}


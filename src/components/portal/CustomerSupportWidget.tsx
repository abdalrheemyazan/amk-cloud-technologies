"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Clock,
  Headphones,
  ImagePlus,
  Mail,
  MessageSquare,
  MessageSquarePlus,
  Minimize2,
  MoreVertical,
  Network,
  Phone,
  PlusCircle,
  Send,
  Server,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  deleteCustomerChatSession,
  handoffCustomerAiConversation,
  sendCustomerChatMessage,
} from "@/lib/actions/customer-chat-actions";
import {
  getMyChatMessages,
  getMyChatStatus,
  sendCustomerMessage,
  submitSupportRequest,
  type ChatMessageView,
} from "@/lib/actions/support-chat-actions";
import { processSelectedFiles, type PendingAttachment } from "@/lib/chat-attachments-client";
import type { SupportAttachmentView } from "@/lib/support-attachments";
import AttachmentThumbnails from "@/components/support/AttachmentThumbnails";
import PendingAttachmentTray from "@/components/support/PendingAttachmentTray";

type WidgetMode = "ai" | "waiting" | "human";

const QUICK_ACTIONS = [
  { id: "new-ticket", label: "פתיחת פנייה חדשה", icon: PlusCircle },
  { id: "check-status", label: "בדיקת סטטוס פנייה", icon: ShieldCheck },
  { id: "talk-agent", label: "דבר עם נציג", icon: Headphones },
  { id: "hours", label: "שעות פעילות", icon: Clock },
  { id: "contact", label: "צור קשר", icon: Phone },
  { id: "vpn", label: "VPN", icon: Network },
  { id: "vps", label: "VPS", icon: Server },
  { id: "email", label: "דואר אלקטרוני", icon: Mail },
  { id: "security", label: "אבטחת מידע", icon: Shield },
];

export default function CustomerSupportWidget({
  customerName = null,
}: {
  customerName?: string | null;
  supportAvailable?: boolean | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<WidgetMode>("ai");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [liveAgentName, setLiveAgentName] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Messages
  const [aiMessages, setAiMessages] = useState<
    Array<{ id: string; from: "bot" | "user"; text: string; attachments?: SupportAttachmentView[] }>
  >([
    {
      id: "welcome-init",
      from: "bot",
      text: customerName ? `שלום ${customerName}, איך אפשר לעזור?` : "שלום, איך אפשר לעזור?",
    },
  ]);
  const [liveMessages, setLiveMessages] = useState<ChatMessageView[]>([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, liveMessages, loading, isOpen]);

  // Poll live messages if active in live session
  useEffect(() => {
    if (!liveSessionId || !isOpen || mode === "ai") return;

    let cancelled = false;
    const fetchLive = async () => {
      const [msgRes, statusRes] = await Promise.all([
        getMyChatMessages(liveSessionId),
        getMyChatStatus(liveSessionId),
      ]);
      if (cancelled) return;
      if (msgRes.ok) setLiveMessages(msgRes.data);
      if (statusRes.ok) {
        if (statusRes.data.agentName) {
          setLiveAgentName(statusRes.data.agentName);
          setMode("human");
        } else if (statusRes.data.status === "PENDING" || statusRes.data.status === "WAITING_INTERNAL") {
          setMode("waiting");
        }
      }
    };

    void fetchLive();
    const timer = setInterval(fetchLive, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [liveSessionId, isOpen, mode]);

  const messageCounterRef = useRef(0);

  function handleStartNewChat() {
    setShowMenu(false);
    setConversationId(null);
    setLiveSessionId(null);
    setLiveAgentName(null);
    setMode("ai");
    setPendingAttachments([]);
    setAttachmentError(null);
    setInput("");
    setLiveMessages([]);
    setAiMessages([
      {
        id: `welcome-${++messageCounterRef.current}`,
        from: "bot",
        text: "שלום, איך אפשר לעזור?",
      },
    ]);
  }

  async function handleDeleteChat() {
    setShowDeleteConfirm(false);
    setShowMenu(false);
    if (conversationId) {
      await deleteCustomerChatSession(conversationId);
    }
    handleStartNewChat();
  }

  async function handleSend(customText?: string) {
    const textToSend = typeof customText === "string" ? customText : input;
    const trimmed = textToSend.trim();
    if ((!trimmed && pendingAttachments.length === 0) || loading) return;

    setInput("");
    setLoading(true);
    setAttachmentError(null);

    // Human / Live mode (AI stops responding automatically)
    if ((mode === "human" || mode === "waiting") && liveSessionId) {
      const res = await sendCustomerMessage(liveSessionId, trimmed, pendingAttachments);
      if (res.ok) {
        setPendingAttachments([]);
        const updated = await getMyChatMessages(liveSessionId);
        if (updated.ok) setLiveMessages(updated.data);
      } else {
        setAttachmentError(res.error);
      }
      setLoading(false);
      return;
    }

    // AI Mode
    const userMsgId = `u-${++messageCounterRef.current}`;
    const userMsg = { id: userMsgId, from: "user" as const, text: trimmed };
    setAiMessages((prev) => [...prev, userMsg]);

    const res = await sendCustomerChatMessage({
      conversationId,
      message: trimmed,
      attachments: pendingAttachments,
    });

    if (res.ok) {
      setConversationId(res.data.conversationId);
      setPendingAttachments([]);
      setAiMessages((prev) => [
        ...prev,
        {
          id: res.data.reply.id || `b-${++messageCounterRef.current}`,
          from: "bot" as const,
          text: res.data.reply.text,
          attachments: res.data.reply.attachments,
        },
      ]);
    } else {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `b-${++messageCounterRef.current}`,
          from: "bot" as const,
          text: res.error || "לא ניתן היה לקבל מענה כרגע. באפשרותך לפתוח פנייה או לבקש העברה לנציג.",
        },
      ]);
    }
    setLoading(false);
  }

  async function handleHandoff() {
    setLoading(true);
    if (conversationId) {
      const res = await handoffCustomerAiConversation({ conversationId });
      if (res.ok) {
        setLiveSessionId(res.data.sessionId);
        setMode("waiting");
        setAiMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            from: "bot" as const,
            text: "הבקשה הועברה לצוות התמיכה.\nנציג יצטרף לשיחה בהקדם.",
          },
        ]);
      }
    } else {
      const res = await submitSupportRequest({
        title: "פנייה מהירה מעוזר התמיכה",
        relatedService: "תמיכה כללית",
        description: "פנייה שנוצרה דרך עוזר התמיכה של AMK.",
      });
      if (res.ok) {
        setLiveSessionId(res.data.sessionId);
        setMode("waiting");
      }
    }
    setLoading(false);
  }

  async function handleQuickAction(actionId: string) {
    if (actionId === "new-ticket") {
      router.push("/portal/new-request");
      setIsOpen(false);
      return;
    }
    if (actionId === "check-status") {
      await handleSend("מה מצב הפנייה שלי?");
      return;
    }
    if (actionId === "talk-agent") {
      await handleHandoff();
      return;
    }
    if (actionId === "hours") {
      await handleSend("מה שעות הפעילות של התמיכה?");
      return;
    }
    if (actionId === "contact") {
      await handleSend("כיצד ניתן ליצור קשר טלפוני או באימייל?");
      return;
    }
    if (actionId === "vpn") {
      await handleSend("ה-VPN לא מתחבר, כיצד לפתור את הבעיה?");
      return;
    }
    if (actionId === "vps") {
      await handleSend("שרת ה-VPS אינו זמין, מה עושים?");
      return;
    }
    if (actionId === "email") {
      await handleSend("יש לי בעיה בשליחה או קבלה של דואר אלקטרוני");
      return;
    }
    if (actionId === "security") {
      await handleSend("אילו אמצעי אבטחה ואימות קיימים במערכת AMK?");
      return;
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

  return (
    <div className="fixed bottom-7 left-6 z-40 font-heebo" dir="rtl">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 px-4 py-3 text-white shadow-[0_8px_30px_-6px_rgba(15,23,42,0.45)] border border-slate-700/50 transition-transform duration-200 hover:scale-[1.03] hover:shadow-[0_12px_36px_-6px_rgba(37,99,235,0.4)] focus-visible:ring-4 focus-visible:ring-blue-400"
          aria-label="עוזר AMK"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <MessageSquare className="h-4 w-4 text-blue-300" />
          <span className="text-xs font-black tracking-wide">עוזר AMK</span>
        </button>
      )}

      {/* Expanded Widget Window */}
      {isOpen && (
        <div
          className="flex h-[580px] w-[390px] sm:w-[410px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_22px_65px_-15px_rgba(15,23,42,0.45)] transition-all animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-slate-800 bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300 backdrop-blur-sm border border-white/15">
                {mode === "human" ? (
                  <User className="h-4 w-4 text-emerald-400" />
                ) : mode === "waiting" ? (
                  <Clock className="h-4 w-4 text-amber-300 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4 text-blue-300" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-black leading-tight flex items-center gap-2">
                  עוזר התמיכה של AMK
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-300">
                  {mode === "human" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {liveAgentName || "נציג תמיכה"} • מחובר
                    </span>
                  ) : mode === "waiting" ? (
                    <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      ממתין לנציג תמיכה
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-blue-300 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      עוזר אוטומטי
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                title="שיחה חדשה"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>חדשה</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  title="תפריט שיחה"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>

                {showMenu && (
                  <div className="absolute left-0 top-full mt-1 w-36 rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-xl z-50 animate-in fade-in">
                    <button
                      type="button"
                      onClick={handleStartNewChat}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-right text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5 text-blue-600" />
                      שיחה חדשה
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-right text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      מחיקת השיחה
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                title="מזער חלון"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                title="סגור חלון"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Scroll Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/90 px-3 py-2 text-[10px]">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleQuickAction(action.id)}
                  className="flex items-center gap-1 shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 transition-all shadow-2xs"
                >
                  <Icon className="h-3 w-3 text-blue-600" />
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="border-b border-rose-100 bg-rose-50/95 p-3 text-xs animate-in fade-in">
              <p className="font-black text-rose-900 mb-2">למחוק את השיחה הנוכחית?</p>
              <p className="text-[11px] text-rose-700 mb-3">
                הודעות השיחה יימחקו וההקשר לא יישמר עבור מענה העוזר.
              </p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleDeleteChat}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-black text-white hover:bg-rose-700 shadow-xs"
                >
                  מחק
                </button>
              </div>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]">
            {mode === "ai" && (
              <>
                {aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === "user" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-medium ${
                        msg.from === "user"
                          ? "bg-blue-600 text-white rounded-bl-xs shadow-xs"
                          : "bg-white border border-slate-200/90 text-slate-800 rounded-br-xs shadow-2xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.attachments && <AttachmentThumbnails attachments={msg.attachments} />}
                    </div>
                  </div>
                ))}
              </>
            )}

            {(mode === "waiting" || mode === "human") && (
              <>
                <div className="text-center my-2">
                  <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[10px] font-black text-blue-800">
                    {mode === "waiting"
                      ? "הפנייה הועברה לתור נציגי התמיכה"
                      : `שיחה פעילה מול ${liveAgentName || "נציג תמיכה"}`}
                  </span>
                </div>
                {liveMessages.length === 0 && mode === "waiting" && (
                  <p className="text-center text-xs text-slate-500 py-6 font-semibold">
                    הבקשה הועברה לצוות התמיכה. נציג יצטרף לשיחה בהקדם.
                  </p>
                )}
                {liveMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isFromCustomer ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-medium ${
                        msg.isFromCustomer
                          ? "bg-blue-600 text-white rounded-bl-xs shadow-xs"
                          : "bg-white border border-slate-200/90 text-slate-800 rounded-br-xs shadow-2xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      {msg.attachments && <AttachmentThumbnails attachments={msg.attachments} />}
                    </div>
                  </div>
                ))}
              </>
            )}

            {loading && (
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-br-xs bg-white border border-slate-200 p-3 text-xs font-bold text-slate-500 flex items-center gap-2 shadow-2xs">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  </span>
                  <span>חושב ומחפש במאגר הידע של AMK...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Attachments Tray */}
          {(pendingAttachments.length > 0 || attachmentError) && (
            <div className="border-t border-slate-100 bg-slate-50 p-2 text-xs">
              {attachmentError && <p className="text-rose-600 font-bold mb-1">{attachmentError}</p>}
              {pendingAttachments.length > 0 && (
                <PendingAttachmentTray
                  attachments={pendingAttachments}
                  onRemove={(index) =>
                    setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              )}
            </div>
          )}

          {/* Input Footer */}
          <div className="border-t border-slate-100 p-3 bg-white">
            <div className="flex items-center gap-2">
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                title="צרף צילום מסך או קובץ"
              >
                <ImagePlus className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSend();
                }}
                placeholder={
                  mode === "human" || mode === "waiting"
                    ? "הקלד הודעה לנציג..."
                    : "שאל שאלה על שירותי AMK..."
                }
                className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading || (!input.trim() && pendingAttachments.length === 0)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-xs"
                aria-label="שלח"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {mode === "ai" && (
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1">
                <span>תשובות מבוססות ידע רשמי של AMK</span>
                <button
                  type="button"
                  onClick={handleHandoff}
                  className="text-blue-600 hover:text-blue-800 underline font-black"
                >
                  דבר עם נציג ←
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

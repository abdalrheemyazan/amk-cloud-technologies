"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Headphones, MessageCirclePlus, MessagesSquare, ShieldCheck } from "lucide-react";
import {
  CHATBOT_SMART_WELCOME_MESSAGE,
  CHAT_QUICK_CATEGORIES,
  type ChatQuickCategory,
} from "@/lib/chatbot-categories";
import {
  closeCustomerChatSession,
  deleteCustomerChatMessage,
  deleteCustomerChatSession,
  getCustomerAiConversation,
  handoffCustomerAiConversation,
  sendCustomerChatMessage,
} from "@/lib/actions/customer-chat-actions";
import {
  cancelSupportRequest,
  getMyChatMessages,
  getMyChatStatus,
  sendCustomerMessage,
  submitSupportRequest,
  type ChatMessageView,
} from "@/lib/actions/support-chat-actions";
import { getMySupportActivity, type SupportActivityView } from "@/lib/actions/support-team-actions";
import { processSelectedFiles, type PendingAttachment } from "@/lib/chat-attachments-client";
import type { SupportAttachmentView } from "@/lib/support-attachments";
import PublicActivityTimeline from "@/components/support/PublicActivityTimeline";
import SupportAgentAvatar from "@/components/support/SupportAgentAvatar";
import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog";
import ChatTypingIndicator from "./ChatTypingIndicator";
import CustomerChatComposer from "./CustomerChatComposer";
import CustomerChatMessage from "./CustomerChatMessage";
import CustomerChatOptionsMenu, { type CustomerChatOptionsMenuAction } from "./CustomerChatOptionsMenu";
import PortalLegalLinksRow from "./PortalLegalLinksRow";

export type ChatSeed = { type: "request-agent" } | { type: "view"; sessionId: string };

type BotMessage = {
  id: string;
  from: "bot" | "user";
  text: string;
  showHandoff?: boolean;
  createdAt: string;
  attachments?: SupportAttachmentView[];
  deletable?: boolean;
  deleted?: boolean;
};

type HandoffPhase = "idle" | "waiting" | "active" | "closed";

type ConfirmDialogState =
  | { kind: "delete-conversation" }
  | { kind: "delete-message"; messageId: string }
  | { kind: "close-pending" }
  | { kind: "close-active" };

const POLL_INTERVAL_MS = 4000;
const STORAGE_KEY = "amk_support_chat_session_id";
const AI_STORAGE_KEY = "amk_customer_ai_conversation_id";
const TYPING_DELAY_MS = 550;
const SHELL_CLASS =
  "flex h-[calc(100dvh-11rem)] min-h-[520px] max-h-[780px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.42)]";

function welcomeMessage(): BotMessage {
  return { id: "welcome", from: "bot", text: CHATBOT_SMART_WELCOME_MESSAGE, createdAt: new Date().toISOString() };
}

function composeTranscript(messages: BotMessage[]): string {
  return messages.map((m) => `${m.from === "user" ? "לקוח" : "עוזר חכם"}: ${m.text}`).join("\n");
}

function ChatSkeleton() {
  return (
    <section className={SHELL_CLASS} aria-hidden="true">
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-gradient-to-l from-blue-50 to-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-2.5 w-44 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-8 w-28 shrink-0 animate-pulse rounded-xl bg-slate-100" />
      </div>

      <div className="flex-1 space-y-3 overflow-hidden bg-[#F4F7FB] px-4 py-4">
        <div className="flex justify-end">
          <div className="h-16 w-64 max-w-[85%] animate-pulse rounded-2xl rounded-br-sm bg-white" />
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] bg-amber-50/60 px-4 py-2">
        <div className="h-2.5 w-4/5 animate-pulse rounded bg-amber-100" />
      </div>

      <div className="flex items-center gap-2 border-t border-[#E2E8F0] bg-white px-3 py-3">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </section>
  );
}

export default function CustomerSupportChatPanel({
  seed,
  onSeedConsumed,
}: {
  seed: ChatSeed | null;
  onSeedConsumed: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ChatQuickCategory | null>(null);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [handoffPhase, setHandoffPhase] = useState<HandoffPhase>("idle");
  const [transferring, setTransferring] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [aiConversationId, setAiConversationId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [agentImageUrl, setAgentImageUrl] = useState<string | null>(null);
  const [agentRole, setAgentRole] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<ChatMessageView[]>([]);
  const [publicActivity, setPublicActivity] = useState<SupportActivityView[]>([]);
  const [liveInput, setLiveInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [liveSending, setLiveSending] = useState(false);
  // Kept around briefly after a conversation is closed so "מחיקת שיחה" stays
  // reachable without needing to reload — cleared on new chat / after deletion.
  const [lastConversationId, setLastConversationId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, liveMessages, handoffPhase, isBotTyping]);

  function addMessage(
    from: "bot" | "user",
    text: string,
    showHandoff?: boolean,
    attachments?: SupportAttachmentView[],
  ) {
    setMessages((prev) => [
      ...prev,
      {
        id: `${from}-${Date.now()}-${Math.random()}`,
        from,
        text,
        showHandoff,
        createdAt: new Date().toISOString(),
        attachments,
      },
    ]);
  }

  function deliverBotReply(text: string, showHandoff?: boolean) {
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      addMessage("bot", text, showHandoff);
    }, TYPING_DELAY_MS);
  }

  // Creates the actual support request from a transcript + attachments. Takes
  // the transcript explicitly (rather than reading `messages` from closure) so
  // it stays correct when called from the mount-time initializer, before state
  // has settled.
  async function performTransfer(transcriptMessages: BotMessage[], attachmentsToSend: PendingAttachment[]) {
    setTransferring(true);
    if (aiConversationId) {
      const result = await handoffCustomerAiConversation({
        conversationId: aiConversationId,
        category: selectedCategory?.label,
        attachments: attachmentsToSend,
      });
      setTransferring(false);

      if (!result.ok) {
        addMessage("bot", result.error);
        return;
      }

      setChatSessionId(result.data.sessionId);
      localStorage.setItem(STORAGE_KEY, result.data.sessionId);
      localStorage.removeItem(AI_STORAGE_KEY);
      setAiConversationId(null);
      setPendingAttachments([]);
      setAttachmentError(null);
      setHandoffPhase("waiting");
      addMessage("bot", "הפנייה נפתחה ונשלחה לצוות התמיכה. נציג תמיכה יצטרף בהקדם.");
      return;
    }

    const title = selectedCategory ? `פנייה מהצ׳אט — ${selectedCategory.label}` : "פנייה מהצ׳אט התמיכה";
    const description = `${
      selectedCategory ? `תחום שנבחר: ${selectedCategory.label}\n\n` : ""
    }תמליל השיחה עם העוזר החכם של AMK:\n${composeTranscript(transcriptMessages)}`;

    const result = await submitSupportRequest({
      title,
      description,
      relatedService: selectedCategory?.label,
      urgency: "MEDIUM",
      attachments: attachmentsToSend,
    });
    setTransferring(false);

    if (!result.ok) {
      addMessage("bot", result.error);
      return;
    }

    setChatSessionId(result.data.sessionId);
    localStorage.setItem(STORAGE_KEY, result.data.sessionId);
    setPendingAttachments([]);
    setAttachmentError(null);
    setHandoffPhase("waiting");
    addMessage("bot", "הפנייה נפתחה ונשלחה לצוות התמיכה.\nנציג תמיכה יצטרף לשיחה בהקדם.");
  }

  async function handleRequestAgent() {
    if (transferring || handoffPhase !== "idle") return;
    await performTransfer(messages, pendingAttachments);
  }

  // Resets the panel to a brand-new AI intake conversation. Never touches a
  // live PENDING/ACTIVE support session on the server — those keep going
  // whether or not the customer is currently looking at them.
  function resetToFreshConversation() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AI_STORAGE_KEY);
    setChatSessionId(null);
    setAiConversationId(null);
    setAgentName(null);
    setAgentImageUrl(null);
    setAgentRole(null);
    setLiveMessages([]);
    setPublicActivity([]);
    setSelectedCategory(null);
    setInput("");
    setLiveInput("");
    setPendingAttachments([]);
    setAttachmentError(null);
    setLastConversationId(null);
    setHandoffPhase("idle");
    setMessages([welcomeMessage()]);
  }

  async function handleNewConversation() {
    // A still-open AI-only conversation is implicitly closed (not deleted) so
    // it doesn't linger — a live support session is left completely alone.
    if (aiConversationId && handoffPhase === "idle") {
      void closeCustomerChatSession(aiConversationId);
    }
    resetToFreshConversation();
  }

  function handleCloseConversation() {
    if (aiConversationId && handoffPhase === "idle") {
      void confirmCloseAiConversation();
    } else if (chatSessionId && handoffPhase === "waiting") {
      setDialogError(null);
      setConfirmDialog({ kind: "close-pending" });
    } else if (chatSessionId && handoffPhase === "active") {
      setDialogError(null);
      setConfirmDialog({ kind: "close-active" });
    }
  }

  async function confirmCloseAiConversation() {
    if (!aiConversationId) return;
    const result = await closeCustomerChatSession(aiConversationId);
    if (result.ok) {
      setLastConversationId(aiConversationId);
      localStorage.removeItem(AI_STORAGE_KEY);
      setAiConversationId(null);
      setHandoffPhase("closed");
    } else {
      addMessage("bot", result.error);
    }
  }

  async function handleConfirmDialog() {
    if (!confirmDialog) return;
    setDialogSubmitting(true);
    setDialogError(null);

    if (confirmDialog.kind === "close-pending" && chatSessionId) {
      const result = await cancelSupportRequest(chatSessionId);
      setDialogSubmitting(false);
      if (!result.ok) {
        setDialogError(result.error);
        return;
      }
      setLastConversationId(chatSessionId);
      localStorage.removeItem(STORAGE_KEY);
      setChatSessionId(null);
      setHandoffPhase("closed");
      setConfirmDialog(null);
      return;
    }

    if (confirmDialog.kind === "close-active" && chatSessionId) {
      // The ticket stays exactly as-is server-side for the agent — this only
      // stops showing it in the customer's current view.
      setDialogSubmitting(false);
      setLastConversationId(chatSessionId);
      localStorage.removeItem(STORAGE_KEY);
      setChatSessionId(null);
      setHandoffPhase("closed");
      setConfirmDialog(null);
      return;
    }

    if (confirmDialog.kind === "delete-conversation") {
      const targetId = aiConversationId ?? chatSessionId ?? lastConversationId;
      if (!targetId) {
        setDialogSubmitting(false);
        setConfirmDialog(null);
        return;
      }
      const result = await deleteCustomerChatSession(targetId);
      setDialogSubmitting(false);
      if (!result.ok) {
        setDialogError(result.error);
        return;
      }
      setConfirmDialog(null);
      resetToFreshConversation();
      return;
    }

    if (confirmDialog.kind === "delete-message") {
      const result = await deleteCustomerChatMessage(confirmDialog.messageId);
      setDialogSubmitting(false);
      if (!result.ok) {
        setDialogError(result.error);
        return;
      }
      const messageId = confirmDialog.messageId;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, text: "הודעה נמחקה", attachments: [], deletable: false, deleted: true } : m)),
      );
      setLiveMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, message: "הודעה נמחקה", attachments: [], deletable: false, deleted: true } : m)),
      );
      setConfirmDialog(null);
    }
  }

  function handleOptionsMenuAction(action: CustomerChatOptionsMenuAction) {
    if (action === "new") void handleNewConversation();
    else if (action === "close") handleCloseConversation();
    else if (action === "delete") {
      setDialogError(null);
      setConfirmDialog({ kind: "delete-conversation" });
    }
  }

  function requestDeleteMessage(messageId: string) {
    setDialogError(null);
    setConfirmDialog({ kind: "delete-message", messageId });
  }

  async function loadActiveSessionData(sessionId: string) {
    const [msgsResult, activityResult] = await Promise.all([
      getMyChatMessages(sessionId),
      getMySupportActivity(sessionId),
    ]);
    if (msgsResult.ok) setLiveMessages(msgsResult.data);
    if (activityResult.ok) setPublicActivity(activityResult.data);
  }

  async function viewSession(sessionId: string) {
    const statusResult = await getMyChatStatus(sessionId);
    if (!statusResult.ok) return;

    if (statusResult.data.status === "PENDING" || statusResult.data.status === "ACTIVE") {
      setChatSessionId(sessionId);
      localStorage.setItem(STORAGE_KEY, sessionId);
      setHandoffPhase(statusResult.data.status === "PENDING" ? "waiting" : "active");
      setAgentName(statusResult.data.agentName);
      setAgentImageUrl(statusResult.data.agentImageUrl);
      setAgentRole(statusResult.data.agentRole);
      await loadActiveSessionData(sessionId);
      return;
    }

    // Closed / resolved / rejected / cancelled / expired — show read-only, no polling.
    setChatSessionId(null);
    setLastConversationId(sessionId);
    setHandoffPhase("closed");
    await loadActiveSessionData(sessionId);
  }

  // Resolve the chat's real starting state ONCE before the first paint: a
  // seeded session to view, a resumed in-progress chat from localStorage, an
  // immediate hand-off request, or a fresh intake conversation. Nothing is
  // rendered until this settles, so the user never sees a default state that
  // then gets swapped out from under them.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (seed?.type === "view") {
        await viewSession(seed.sessionId);
        if (cancelled) return;
        onSeedConsumed();
        setReady(true);
        return;
      }

      const storedId = localStorage.getItem(STORAGE_KEY);
      let resumed = false;

      if (storedId) {
        const statusResult = await getMyChatStatus(storedId);
        if (cancelled) return;

        if (statusResult.ok && (statusResult.data.status === "PENDING" || statusResult.data.status === "ACTIVE")) {
          resumed = true;
          setChatSessionId(storedId);
          setHandoffPhase(statusResult.data.status === "PENDING" ? "waiting" : "active");
          setAgentName(statusResult.data.agentName);
          setAgentImageUrl(statusResult.data.agentImageUrl);
          setAgentRole(statusResult.data.agentRole);

          if (statusResult.data.status === "ACTIVE") {
            await loadActiveSessionData(storedId);
            if (cancelled) return;
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      if (seed?.type === "request-agent" && !resumed) {
        onSeedConsumed();
        const initialMessages = [welcomeMessage()];
        setMessages(initialMessages);
        await performTransfer(initialMessages, []);
        if (cancelled) return;
        setReady(true);
        return;
      }

      if (seed) onSeedConsumed();
      if (!resumed) {
        const storedAiConversationId = localStorage.getItem(AI_STORAGE_KEY);
        if (storedAiConversationId) {
          const aiResult = await getCustomerAiConversation(storedAiConversationId);
          if (cancelled) return;
          if (aiResult.ok) {
            setAiConversationId(aiResult.data.conversationId);
            const restoredCategory = CHAT_QUICK_CATEGORIES.find(
              (category) => category.label === aiResult.data.category,
            );
            if (restoredCategory) setSelectedCategory(restoredCategory);
            setMessages([
              welcomeMessage(),
              ...aiResult.data.messages.map((entry) => ({
                id: entry.id,
                from: entry.from,
                text: entry.text,
                createdAt: entry.createdAt,
                attachments: entry.attachments,
                deletable: entry.deletable,
                deleted: entry.deleted,
              })),
            ]);
          } else {
            localStorage.removeItem(AI_STORAGE_KEY);
            setMessages([welcomeMessage()]);
          }
        } else {
          setMessages([welcomeMessage()]);
        }
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
    // Runs once at mount — the seed is only meant to steer the *initial* state;
    // later seed changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle a seed that changes *after* the panel is already mounted and ready
  // (e.g. clicking a different past request while staying on this section).
  useEffect(() => {
    if (!ready || !seed) return;

    const timeout = window.setTimeout(() => {
      if (seed.type === "request-agent") {
        if (handoffPhase === "idle") void handleRequestAgent();
      } else if (seed.type === "view") {
        void viewSession(seed.sessionId);
      }

      onSeedConsumed();
    }, 0);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, ready]);

  useEffect(() => {
    if (!chatSessionId || (handoffPhase !== "waiting" && handoffPhase !== "active")) return;

    const interval = setInterval(async () => {
      const statusResult = await getMyChatStatus(chatSessionId);
      if (!statusResult.ok) return;
      const activityResult = await getMySupportActivity(chatSessionId);
      if (activityResult.ok) setPublicActivity(activityResult.data);

      if (statusResult.data.status === "ACTIVE") {
        setAgentName(statusResult.data.agentName);
        setAgentImageUrl(statusResult.data.agentImageUrl);
        setAgentRole(statusResult.data.agentRole);
      }

      if (statusResult.data.status === "ACTIVE" && handoffPhase !== "active") {
        setHandoffPhase("active");
        setAgentName(statusResult.data.agentName);
        setAgentImageUrl(statusResult.data.agentImageUrl);
        setAgentRole(statusResult.data.agentRole);
        addMessage("bot", "נציג תמיכה הצטרף לשיחה.");
      } else if (["REJECTED", "EXPIRED", "RESOLVED", "CLOSED", "CANCELLED"].includes(statusResult.data.status)) {
        setHandoffPhase("closed");
        setLastConversationId(chatSessionId);
        setChatSessionId(null);
        localStorage.removeItem(STORAGE_KEY);
      }

      if (statusResult.data.status === "ACTIVE") {
        const msgsResult = await getMyChatMessages(chatSessionId);
        if (msgsResult.ok) setLiveMessages(msgsResult.data);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [chatSessionId, handoffPhase]);

  function handleSelectCategory(category: ChatQuickCategory) {
    setSelectedCategory(category);
    addMessage("user", category.label);

    if (category.questions.length > 0) {
      const questionsText = `הבנתי, מדובר בנושא ${category.label}. כדי לעזור מהר יותר, אפשר לענות על השאלות הבאות:\n${category.questions
        .map((q) => `• ${q}`)
        .join("\n")}\n\nניתן גם לצרף צילום מסך של הבעיה.`;
      deliverBotReply(questionsText);
    } else {
      deliverBotReply("אפשר לתאר בקצרה את הבעיה, ובמידת הצורך לצרף צילום מסך — ואעביר אותך לנציג תמיכה בהתאם.");
    }
  }

  async function handleSend() {
    const trimmed = input.trim();
    if ((!trimmed && pendingAttachments.length === 0) || isBotTyping) return;
    const attachmentsToSend = pendingAttachments;
    const localMessageId = `user-${Date.now()}-${Math.random()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: localMessageId,
        from: "user",
        text: trimmed,
        createdAt: new Date().toISOString(),
        attachments: attachmentsToSend,
      },
    ]);
    setInput("");
    setPendingAttachments([]);
    setAttachmentError(null);
    setIsBotTyping(true);

    const result = await sendCustomerChatMessage({
      conversationId: aiConversationId,
      message: trimmed,
      category: selectedCategory?.label,
      attachments: attachmentsToSend,
    });
    setIsBotTyping(false);

    if (!result.ok) {
      if (result.conversationId) {
        setAiConversationId(result.conversationId);
        localStorage.setItem(AI_STORAGE_KEY, result.conversationId);
      } else if (attachmentsToSend.length > 0) {
        setPendingAttachments(attachmentsToSend);
      }
      addMessage("bot", result.error, true);
      return;
    }

    setAiConversationId(result.data.conversationId);
    localStorage.setItem(AI_STORAGE_KEY, result.data.conversationId);
    // Swap the optimistic id for the real one so the message becomes deletable.
    setMessages((prev) =>
      prev.map((m) =>
        m.id === localMessageId ? { ...m, id: result.data.userMessage.id, deletable: result.data.userMessage.deletable } : m,
      ),
    );
    addMessage("bot", result.data.reply.text, false, result.data.reply.attachments);
  }

  async function handleSendLiveMessage() {
    const trimmed = liveInput.trim();
    if ((!trimmed && pendingAttachments.length === 0) || !chatSessionId || liveSending) return;
    setLiveSending(true);
    setAttachmentError(null);
    setLiveInput("");
    const attachmentsToSend = pendingAttachments;
    setPendingAttachments([]);

    const optimisticId = `local-${Date.now()}`;
    setLiveMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        message: trimmed,
        isFromCustomer: true,
        createdAt: new Date().toISOString(),
        attachments: attachmentsToSend,
        deletable: false,
        deleted: false,
      },
    ]);

    const result = await sendCustomerMessage(chatSessionId, trimmed, attachmentsToSend);
    if (!result.ok) {
      setLiveMessages((current) => current.filter((message) => message.id !== optimisticId));
      setLiveInput(trimmed);
      setPendingAttachments(attachmentsToSend);
      setAttachmentError(result.error);
    } else {
      const messagesResult = await getMyChatMessages(chatSessionId);
      if (messagesResult.ok) setLiveMessages(messagesResult.data);
    }
    setLiveSending(false);
  }

  async function handleFileSelect(files: File[]) {
    if (files.length === 0) return;
    setAttachmentError(null);
    const { attachments, error } = await processSelectedFiles(files, pendingAttachments.length, {
      maxAttachments: 1,
    });
    if (error) {
      setAttachmentError(error);
      return;
    }
    setPendingAttachments((prev) => [...prev, ...attachments]);
  }

  if (!ready) {
    return <ChatSkeleton />;
  }

  const canTransfer = handoffPhase === "idle";
  const canCloseConversation =
    (!!aiConversationId && handoffPhase === "idle") || handoffPhase === "waiting" || handoffPhase === "active";
  const canDeleteConversation = !!(aiConversationId || chatSessionId || lastConversationId);
  const modeLabel =
    handoffPhase === "active"
      ? "תמיכה אנושית"
      : handoffPhase === "waiting"
        ? "ממתינים לנציג"
        : handoffPhase === "closed"
          ? "שיחה הסתיימה"
          : "מענה אוטומטי";
  const modeDotClass =
    handoffPhase === "active"
      ? "bg-emerald-500"
      : handoffPhase === "waiting"
        ? "bg-amber-500"
        : handoffPhase === "closed"
          ? "bg-slate-400"
          : "bg-cyan-500";

  return (
    <section className={SHELL_CLASS} aria-labelledby="customer-chat-title" dir="rtl">
      <header className="relative flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3.5 sm:px-5">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-cyan-400/70 to-blue-600/70" aria-hidden="true" />
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#0B1739] text-white shadow-[0_10px_28px_-15px_rgba(11,23,57,0.8)]">
            {handoffPhase === "active" ? <Headphones className="h-5 w-5" aria-hidden="true" /> : <Bot className="h-5 w-5" aria-hidden="true" />}
            <span className="absolute -bottom-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-cyan-500" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 id="customer-chat-title" className="truncate text-[15px] font-black text-slate-950 sm:text-base">
                {handoffPhase === "active" && agentName ? `שיחה עם ${agentName}` : "מרכז התמיכה של AMK"}
              </h2>
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-black text-slate-600 sm:inline-flex">
                <span className={`h-1.5 w-1.5 rounded-full ${modeDotClass}`} aria-hidden="true" />
                {modeLabel}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500 sm:text-xs">
              {selectedCategory ? `נושא: ${selectedCategory.label}` : "אפשר לתאר את התקלה או לצרף צילום מסך."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canTransfer ? (
            <button
              type="button"
              onClick={() => void handleRequestAgent()}
              disabled={transferring}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-2.5 text-[11px] font-black text-blue-700 outline-none transition-colors hover:border-blue-300 hover:bg-blue-100/70 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60 sm:px-3"
            >
              <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{transferring ? "מעביר..." : "מעבר לנציג תמיכה"}</span>
              <span className="sm:hidden">{transferring ? "מעביר" : "נציג"}</span>
            </button>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-600 sm:hidden">
              <span className={`h-1.5 w-1.5 rounded-full ${modeDotClass}`} aria-hidden="true" />
              {modeLabel}
            </span>
          )}

          <CustomerChatOptionsMenu
            canClose={canCloseConversation}
            canDelete={canDeleteConversation}
            onAction={handleOptionsMenuAction}
          />
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#F5F8FC] px-3 py-4 sm:px-5 sm:py-5"
        aria-live="polite"
      >
        {handoffPhase !== "active" ? (
          <>
            {messages.map((message) => (
              <CustomerChatMessage
                key={message.id}
                senderType={message.from === "user" ? "customer" : "assistant"}
                text={message.text}
                createdAt={message.createdAt}
                attachments={message.attachments}
                senderLabel={message.from === "bot" ? "AMK Assist" : undefined}
                deletable={message.deletable}
                deleted={message.deleted}
                onDelete={message.deletable ? () => requestDeleteMessage(message.id) : undefined}
                action={
                  message.showHandoff && canTransfer ? (
                    <button
                      type="button"
                      onClick={() => void handleRequestAgent()}
                      disabled={transferring}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1739] px-3 py-2.5 text-xs font-black text-white outline-none transition-colors hover:bg-blue-950 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Headphones className="h-4 w-4" aria-hidden="true" />
                      מעבר לנציג תמיכה
                    </button>
                  ) : undefined
                }
              />
            ))}

            {!selectedCategory && canTransfer ? (
              <div className="flex justify-start pl-[42px]" dir="ltr">
                <div className="max-w-[90%]" dir="rtl">
                  <p className="mb-1.5 text-[10px] font-black text-slate-500">נושאים נפוצים</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CHAT_QUICK_CATEGORIES.map((category) => (
                      <button
                        key={category.key}
                        type="button"
                        onClick={() => handleSelectCategory(category)}
                        className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-black text-blue-700 outline-none transition-[border-color,background-color,transform] hover:-translate-y-px hover:border-blue-300 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {isBotTyping ? <ChatTypingIndicator /> : null}

            {handoffPhase === "closed" ? (
              <CustomerChatMessage
                senderType="system"
                text="השיחה נסגרה. ניתן לפתוח שיחה חדשה בכל שלב."
                createdAt={liveMessages.at(-1)?.createdAt ?? messages.at(-1)?.createdAt ?? new Date().toISOString()}
              />
            ) : null}

            {liveMessages.length > 0 &&
              liveMessages.map((message) => (
                <CustomerChatMessage
                  key={message.id}
                  senderType={message.isFromCustomer ? "customer" : "support"}
                  text={message.message}
                  createdAt={message.createdAt}
                  attachments={message.attachments}
                  senderLabel={!message.isFromCustomer ? agentName ?? "צוות התמיכה" : undefined}
                  deletable={message.deletable}
                  deleted={message.deleted}
                  onDelete={message.deletable ? () => requestDeleteMessage(message.id) : undefined}
                />
              ))}

            {handoffPhase === "closed" && publicActivity.length > 0 ? (
              <div className="rounded-xl border border-blue-100 bg-white p-3">
                <p className="mb-2 text-[10px] font-black text-slate-700">סטטוס הטיפול</p>
                <PublicActivityTimeline activities={publicActivity} compact />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/90 px-3 py-2.5 text-emerald-900 shadow-sm">
              <span className="relative">
                <SupportAgentAvatar name={agentName} imageUrl={agentImageUrl} className="h-8 w-8" textClassName="text-[10px]" />
                <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-emerald-50 bg-emerald-500" />
              </span>
              <span className="min-w-0 text-right">
                <span className="block truncate text-xs font-black">
                  {agentName ? `אתה משוחח כעת עם ${agentName}` : "נציג תמיכה הצטרף לשיחה"}
                </span>
                {agentRole && <span className="mt-0.5 block text-[10px] font-bold text-emerald-700/75">{agentRole} · AMK Cloud Technologies</span>}
              </span>
            </div>

            {publicActivity.length > 0 ? (
              <div className="rounded-xl border border-blue-100 bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black text-slate-700">עדכוני הטיפול</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700">גלוי לך</span>
                </div>
                <PublicActivityTimeline activities={publicActivity} compact />
              </div>
            ) : null}

            {liveMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-sm">
                  <MessagesSquare className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-xs font-black text-slate-700">השיחה מוכנה</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">כתוב הודעה או צרף צילום מסך כדי להתחיל.</p>
              </div>
            ) : null}
            {liveMessages.map((message) => (
              <CustomerChatMessage
                key={message.id}
                senderType={message.isFromCustomer ? "customer" : "support"}
                text={message.message}
                createdAt={message.createdAt}
                attachments={message.attachments}
                pending={message.id.startsWith("local-")}
                senderLabel={!message.isFromCustomer ? agentName ?? "צוות התמיכה" : undefined}
                deletable={message.deletable}
                deleted={message.deleted}
                onDelete={message.deletable ? () => requestDeleteMessage(message.id) : undefined}
                avatar={
                  !message.isFromCustomer ? (
                    <SupportAgentAvatar
                      name={agentName}
                      imageUrl={agentImageUrl}
                      className="h-full w-full"
                      textClassName="text-[9px]"
                    />
                  ) : undefined
                }
              />
            ))}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-slate-200/90 bg-slate-50 px-3 py-1.5 text-[9px] font-semibold text-slate-500 sm:px-4">
        <p className="flex min-w-0 items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
          <span>אין לשלוח סיסמאות, פרטי אשראי, מפתחות API או מידע רגיש.</span>
        </p>
        <PortalLegalLinksRow compact />
      </div>

      {handoffPhase === "active" ? (
        <CustomerChatComposer
          value={liveInput}
          onValueChange={setLiveInput}
          onSend={handleSendLiveMessage}
          onFilesSelected={handleFileSelect}
          attachments={pendingAttachments}
          onRemoveAttachment={(index) => setPendingAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
          error={attachmentError}
          sending={liveSending}
          placeholder="כתוב הודעה לנציג התמיכה..."
        />
      ) : handoffPhase === "waiting" ? (
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
            ממתינים לאישור נציג תמיכה...
          </div>
        </div>
      ) : handoffPhase === "closed" ? (
        <div className="flex flex-col items-center gap-2.5 border-t border-slate-200 bg-white p-3.5 text-center">
          <p className="text-xs font-semibold text-slate-500">השיחה נסגרה. ניתן לפתוח שיחה חדשה בכל שלב.</p>
          <button
            type="button"
            onClick={() => void handleNewConversation()}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 text-xs font-black text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <MessageCirclePlus className="h-4 w-4" aria-hidden="true" />
            פתיחת שיחה חדשה
          </button>
        </div>
      ) : (
        <CustomerChatComposer
          value={input}
          onValueChange={setInput}
          onSend={handleSend}
          onFilesSelected={handleFileSelect}
          attachments={pendingAttachments}
          onRemoveAttachment={(index) => setPendingAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
          error={attachmentError}
          sending={isBotTyping}
        />
      )}

      {confirmDialog ? (
        <ConfirmActionDialog
          title={
            confirmDialog.kind === "delete-conversation"
              ? "מחיקת שיחה"
              : confirmDialog.kind === "delete-message"
                ? "מחיקת הודעה"
                : confirmDialog.kind === "close-pending"
                  ? "ביטול הפנייה"
                  : "סיום שיחה"
          }
          description={
            confirmDialog.kind === "delete-conversation"
              ? "האם למחוק את השיחה הזו? פעולה זו תמחק את ההודעות מהתצוגה שלך ולא ניתן יהיה לשחזר אותן."
              : confirmDialog.kind === "delete-message"
                ? "למחוק את ההודעה הזו?"
                : confirmDialog.kind === "close-pending"
                  ? "הפנייה עדיין ממתינה לנציג — סגירה כעת תבטל אותה."
                  : "השיחה עם הנציג תישאר פתוחה אצל צוות התמיכה — פעולה זו רק תסגור את התצוגה שלך."
          }
          confirmLabel={
            confirmDialog.kind === "delete-conversation"
              ? "מחיקת שיחה"
              : confirmDialog.kind === "delete-message"
                ? "מחיקה"
                : confirmDialog.kind === "close-pending"
                  ? "ביטול הפנייה"
                  : "סיום שיחה"
          }
          tone={confirmDialog.kind === "close-active" ? "neutral" : "danger"}
          submitting={dialogSubmitting}
          error={dialogError}
          onConfirm={() => void handleConfirmDialog()}
          onClose={() => {
            if (dialogSubmitting) return;
            setConfirmDialog(null);
            setDialogError(null);
          }}
        />
      ) : null}
    </section>
  );
}

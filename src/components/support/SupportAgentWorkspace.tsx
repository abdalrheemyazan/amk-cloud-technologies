"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import SupportShell from "./SupportShell";
import PendingRequestsQueue from "./PendingRequestsQueue";
import AgentWorkspaceHeader from "./AgentWorkspaceHeader";
import ActiveChatWindow from "./ActiveChatWindow";
import CustomerContextPanel from "./CustomerContextPanel";
import AgentDashboardOverview from "./AgentDashboardOverview";
import CustomersInTreatmentSection from "./CustomersInTreatmentSection";
import CannedRepliesSection from "./CannedRepliesSection";
import QuickSolutionsRefSection from "./QuickSolutionsRefSection";
import TechnicalToolsSection from "./TechnicalToolsSection";
import SessionNotesSection from "./SessionNotesSection";
import SessionHistorySection from "./SessionHistorySection";
import AvailabilitySettingsSection from "./AvailabilitySettingsSection";
import { AGENT_NAV_ITEMS, DEFAULT_AGENT_SECTION, isAgentSectionKey, type AgentSectionKey } from "@/lib/agent-workspace-sections";
import { CANNED_REPLIES } from "@/lib/canned-replies";
import type { PendingAttachment } from "@/lib/chat-attachments-client";
import type { AgentStatus } from "@/lib/support-types";
import {
  acceptChatRequest,
  closeChat,
  getActiveChats,
  getAgentChatMessages,
  getAgentMetrics,
  getAgentStatus,
  getPendingRequests,
  rejectChatRequest,
  sendAgentMessage,
  setAgentStatus,
  type ActiveChat,
  type AgentMetrics,
  type ChatMessageView,
  type PendingChatRequest,
} from "@/lib/actions/support-chat-actions";

const POLL_INTERVAL_MS = 5000;

export default function SupportAgentWorkspace({ agentName }: { agentName: string | null }) {
  const [activeSection, setActiveSection] = useState<AgentSectionKey>(DEFAULT_AGENT_SECTION);
  const [status, setStatus] = useState<AgentStatus>("OFFLINE");
  const [pending, setPending] = useState<PendingChatRequest[]>([]);
  const [active, setActive] = useState<ActiveChat[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [queueNotice, setQueueNotice] = useState<string | null>(null);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [closedChat, setClosedChat] = useState<ActiveChat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageView[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const refreshAll = useCallback(async () => {
    const [statusResult, pendingResult, activeResult, metricsResult] = await Promise.all([
      getAgentStatus(),
      getPendingRequests(),
      getActiveChats(),
      getAgentMetrics(),
    ]);
    if (statusResult.ok) setStatus(statusResult.data.status);
    if (pendingResult.ok) setPending(pendingResult.data);
    if (activeResult.ok) setActive(activeResult.data);
    if (metricsResult.ok) setMetrics(metricsResult.data);
    setLoaded(true);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => {
      void refreshAll();
    }, 0);
    const interval = window.setInterval(refreshAll, POLL_INTERVAL_MS);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, [refreshAll]);

  useEffect(() => {
    if (!selectedChatId) return;

    let cancelled = false;
    async function loadMessages() {
      const result = await getAgentChatMessages(selectedChatId!);
      if (!cancelled && result.ok) setChatMessages(result.data);
    }
    loadMessages();
    const interval = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedChatId]);

  useEffect(() => {
    if (!queueNotice) return;
    const timeout = setTimeout(() => setQueueNotice(null), 5000);
    return () => clearTimeout(timeout);
  }, [queueNotice]);

  function handleNavigate(section: AgentSectionKey) {
    setActiveSection(section);
  }

  async function handleStatusChange(next: AgentStatus) {
    const previous = status;
    setStatus(next);
    const result = await setAgentStatus(next);
    if (!result.ok) {
      setStatus(previous);
      return false;
    }
    return true;
  }

  async function handleAccept(id: string) {
    const result = await acceptChatRequest(id);
    if (result.ok) {
      setStatus(result.data.agentStatus);
      if (result.data.message) setQueueNotice(result.data.message);
      setClosedChat(null);
      setSelectedChatId(id);
      setActiveSection("active-chats");
    } else {
      setQueueNotice(result.error);
    }
    refreshAll();
  }

  async function handleReject(id: string) {
    const result = await rejectChatRequest(id);
    if (!result.ok) setQueueNotice(result.error);
    refreshAll();
  }

  function handleOpenChat(id: string) {
    setClosedChat(null);
    setSelectedChatId(id);
    setActiveSection("active-chats");
  }

  async function handleSendMessage(attachments?: PendingAttachment[]) {
    const trimmed = messageInput.trim();
    if ((!trimmed && (!attachments || attachments.length === 0)) || !selectedChatId) return false;
    setMessageInput("");
    const optimisticId = `local-${Date.now()}`;
    setChatMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        message: trimmed,
        isFromCustomer: false,
        createdAt: new Date().toISOString(),
        attachments: attachments ?? [],
        deletable: false,
        deleted: false,
      },
    ]);
    const result = await sendAgentMessage(selectedChatId, trimmed, attachments);
    if (!result.ok) {
      setChatMessages((current) => current.filter((message) => message.id !== optimisticId));
      setMessageInput(trimmed);
      setQueueNotice(result.error);
      return false;
    }
    return true;
  }

  async function handleCloseChat(id?: string) {
    const targetId = id ?? selectedChatId;
    if (!targetId) return;
    const snapshot = active.find((c) => c.id === targetId) ?? null;
    const result = await closeChat(targetId);
    if (result.ok) {
      if (result.data) {
        setStatus(result.data.agentStatus);
        if (result.data.message) setQueueNotice(result.data.message);
      }
      setClosedChat(snapshot);
      setSelectedChatId(null);
      setChatMessages([]);
      refreshAll();
    }
  }

  async function handleSendSummary() {
    if (!selectedChatId) return;
    const summaryText = CANNED_REPLIES.find((r) => r.key === "closing-followup")!.getText(agentName);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        message: summaryText,
        isFromCustomer: false,
        createdAt: new Date().toISOString(),
        attachments: [],
        deletable: false,
        deleted: false,
      },
    ]);
    await sendAgentMessage(selectedChatId, summaryText);
  }

  const selectedChat = active.find((c) => c.id === selectedChatId) ?? null;
  const latestPending = pending[pending.length - 1] ?? null;
  const latestActive = active[0] ?? null;

  return (
    <SupportShell
      userName={agentName}
      userRole={null}
      activeSection={activeSection}
      onSelectSection={(section) => {
        if (isAgentSectionKey(section)) setActiveSection(section);
      }}
      navItems={AGENT_NAV_ITEMS}
      badges={{ "new-requests": pending.length }}
    >
      <AgentWorkspaceHeader
        agentName={agentName}
        lastUpdated={lastUpdated}
        metrics={metrics}
        status={status}
        onStatusChange={handleStatusChange}
        onRefresh={refreshAll}
      />

      {activeSection === "dashboard" && (
        <AgentDashboardOverview latestPending={latestPending} latestActive={latestActive} onNavigate={handleNavigate} />
      )}

      {activeSection === "new-requests" && (
        <div className="max-w-2xl">
          <PendingRequestsQueue
            requests={pending}
            loaded={loaded}
            notice={queueNotice}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
      )}

      {activeSection === "active-chats" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-4 max-h-[560px] overflow-y-auto">
            <p className="text-xs font-black text-[#94A3B8] uppercase tracking-wide mb-3 px-1">שיחות פעילות</p>
            {active.length === 0 && (
              <p className="text-sm text-[#94A3B8] font-semibold text-center py-8">אין שיחות פעילות</p>
            )}
            <div className="space-y-1.5">
              {active.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl transition-colors ${
                    selectedChatId === chat.id ? "bg-blue-50 text-blue-700" : "hover:bg-[#F4F7FB]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#0F172A]">{chat.customerName ?? "לקוח"}</span>
                    <MessageSquare className="w-3.5 h-3.5 text-[#94A3B8]" />
                  </div>
                  {chat.category && <span className="text-[11px] font-semibold text-[#94A3B8]">{chat.category}</span>}
                </button>
              ))}
            </div>
          </section>

          <div className="lg:col-span-1">
            <ActiveChatWindow
              chat={selectedChat}
              closedChat={closedChat}
              messages={chatMessages}
              messageInput={messageInput}
              onMessageInputChange={setMessageInput}
              onSend={handleSendMessage}
              onCloseChat={() => handleCloseChat()}
              onDismissClosed={() => setClosedChat(null)}
              agentName={agentName}
            />
          </div>

          <CustomerContextPanel
            chat={selectedChat}
            onMarkHandled={() => handleCloseChat()}
            onSendSummary={handleSendSummary}
            onEndChat={() => handleCloseChat()}
          />
        </div>
      )}

      {activeSection === "customers-in-treatment" && (
        <CustomersInTreatmentSection activeChats={active} onOpenChat={handleOpenChat} />
      )}

      {activeSection === "canned-replies" && <CannedRepliesSection agentName={agentName} />}
      {activeSection === "quick-solutions" && <QuickSolutionsRefSection />}
      {activeSection === "technical-tools" && <TechnicalToolsSection />}
      {activeSection === "treatment-notes" && <SessionNotesSection initialSessionId={selectedChatId} />}
      {activeSection === "history" && <SessionHistorySection />}
      {activeSection === "availability-settings" && (
        <AvailabilitySettingsSection status={status} onChange={handleStatusChange} />
      )}
    </SupportShell>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import SupportShell from "./SupportShell";
import PendingRequestsQueue from "./PendingRequestsQueue";
import SupportCommandHeader from "./SupportCommandHeader";
import TeamDashboardOverview from "./TeamDashboardOverview";
import AnimatedSection from "./AnimatedSection";
import {
  DEFAULT_AGENT_SECTION,
  isAgentSectionKey,
  type AgentSectionKey,
} from "@/lib/agent-workspace-sections";
import { TEAM_AGENT_NAV_ITEMS } from "@/lib/team-agent-navigation";
import type { PendingAttachment } from "@/lib/chat-attachments-client";
import type { AgentStatus } from "@/lib/support-types";
import {
  getPersonalSupportReplies,
  type SupportAgentProfile,
} from "@/lib/support-profile";
import {
  acceptChatRequest,
  closeChat,
  getAgentChatMessages,
  rejectChatRequest,
  sendAgentMessage,
  setAgentStatus,
  setSessionWaitingCustomer,
  setSessionWaitingInternal,
  type ActiveChat,
  type ChatMessageView,
  type PendingChatRequest,
} from "@/lib/actions/support-chat-actions";
import {
  getStaffSupportActivity,
  getSupportTransferHistory,
  resolveSupportSession,
  type ConnectedSupportAgent,
  type SupportActivityView,
  type SupportTransferView,
} from "@/lib/actions/support-team-actions";
import { getSupportWorkspaceSnapshot } from "@/lib/actions/support-workspace-actions";
import {
  getSupportDashboardData,
  type SupportDashboardData,
} from "@/lib/actions/support-dashboard-actions";

const ActiveChatWindow = dynamic(() => import("./ActiveChatWindow"));
const SupportCasePanel = dynamic(() => import("./SupportCasePanel"));
const ConnectedAgentsPanel = dynamic(() => import("./ConnectedAgentsPanel"));
const InternalTeamChat = dynamic(() => import("./InternalTeamChat"));
const TransferIssueDialog = dynamic(() => import("./TransferIssueDialog"));
const CustomersInTreatmentSection = dynamic(() => import("./CustomersInTreatmentSection"));
const CannedRepliesSection = dynamic(() => import("./CannedRepliesSection"));
const AiAssistantPanel = dynamic(() => import("./AiAssistantPanel"));
const TechnicalToolsSection = dynamic(() => import("./TechnicalToolsSection"));
const SessionNotesSection = dynamic(() => import("./SessionNotesSection"));
const SessionHistorySection = dynamic(() => import("./SessionHistorySection"));
const PersonalAgentSettingsSection = dynamic(() => import("./PersonalAgentSettingsSection"));

const POLL_INTERVAL_MS = 5000;

export default function TeamSupportAgentWorkspace({
  agentName,
  userRole,
  initialProfile,
}: {
  agentName: string | null;
  userRole: string | null;
  initialProfile: SupportAgentProfile;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [activeSection, setActiveSection] = useState<AgentSectionKey>(DEFAULT_AGENT_SECTION);
  const [status, setStatus] = useState<AgentStatus>("OFFLINE");
  const [pending, setPending] = useState<PendingChatRequest[]>([]);
  const [active, setActive] = useState<ActiveChat[]>([]);
  const [agents, setAgents] = useState<ConnectedSupportAgent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [queueNotice, setQueueNotice] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<SupportDashboardData | null>(null);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [closedChat, setClosedChat] = useState<ActiveChat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageView[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [activity, setActivity] = useState<SupportActivityView[]>([]);
  const [transferHistory, setTransferHistory] = useState<SupportTransferView[]>([]);

  const [selectedTeamAgent, setSelectedTeamAgent] = useState<ConnectedSupportAgent | null>(null);
  const [transferChat, setTransferChat] = useState<ActiveChat | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const refreshAll = useCallback(async () => {
    const result = await getSupportWorkspaceSnapshot();
    if (result.ok) {
      setStatus(result.data.status);
      setPending(result.data.pending);
      setActive(result.data.active);
      setAgents(result.data.agents);
    }
    setLoaded(true);
    setLastUpdated(new Date());
  }, []);

  const refreshDashboard = useCallback(async () => {
    const result = await getSupportDashboardData();
    if (result.ok) {
      setDashboardData(result.data);
      setDashboardError(null);
    } else if (result.error !== "UNAUTHORIZED") {
      setDashboardError(result.error);
    }
    setDashboardLoaded(true);
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

  // The heavier dashboard aggregates are only fetched while the dashboard is on
  // screen, so other sections stay light.
  useEffect(() => {
    if (activeSection !== "dashboard") return;
    let cancelled = false;
    const run = () => {
      if (!cancelled) void refreshDashboard();
    };
    run();
    const interval = window.setInterval(run, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeSection, refreshDashboard]);

  useEffect(() => {
    if (!selectedChatId) return;

    let cancelled = false;

    async function loadSelectedChat() {
      const [messagesResult, activityResult, transferResult] = await Promise.all([
        getAgentChatMessages(selectedChatId!),
        getStaffSupportActivity(selectedChatId!),
        getSupportTransferHistory(selectedChatId!),
      ]);

      if (cancelled) return;
      if (messagesResult.ok) setChatMessages(messagesResult.data);
      if (activityResult.ok) setActivity(activityResult.data);
      if (transferResult.ok) setTransferHistory(transferResult.data);
    }

    loadSelectedChat();
    const interval = window.setInterval(loadSelectedChat, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [selectedChatId]);

  useEffect(() => {
    if (!queueNotice) return;
    const timeout = window.setTimeout(() => setQueueNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [queueNotice]);


  async function handleStatusChange(nextStatus: AgentStatus) {
    const previous = status;
    setStatus(nextStatus);
    const result = await setAgentStatus(nextStatus);
    if (!result.ok) {
      setStatus(previous);
      return false;
    }
    refreshAll();
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
    await refreshAll();
  }

  async function handleReject(id: string) {
    const result = await rejectChatRequest(id);
    if (!result.ok) setQueueNotice(result.error);
    await refreshAll();
    if (activeSection === "dashboard") void refreshDashboard();
  }

  function handleOpenChat(id: string) {
    setClosedChat(null);
    setSelectedChatId(id);
    setActiveSection("active-chats");
  }

  // The AI assistant only ever drafts text — it copies into the composer for the
  // agent to review and send manually. It never sends on its own.
  function handleCopyToReply(text: string) {
    setMessageInput(text);
    setAiPanelOpen(false);
    setActiveSection("active-chats");
    setQueueNotice("הטיוטה הועתקה לתיבת התגובה. בדוק/י ושלח/י ידנית.");
  }

  async function handleSendMessage(attachments?: PendingAttachment[]) {
    const trimmed = messageInput.trim();
    if ((!trimmed && (!attachments || attachments.length === 0)) || !selectedChatId) return false;

    setMessageInput("");
    const optimisticMessage: ChatMessageView = {
      id: `local-${Date.now()}`,
      message: trimmed,
      isFromCustomer: false,
      createdAt: new Date().toISOString(),
      attachments: attachments ?? [],
      deletable: false,
      deleted: false,
    };
    setChatMessages((current) => [...current, optimisticMessage]);

    const result = await sendAgentMessage(selectedChatId, trimmed, attachments);
    if (!result.ok) {
      setChatMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
      setMessageInput(trimmed);
      setQueueNotice(result.error);
      return false;
    }
    return true;
  }

  async function handleCloseChat(id?: string) {
    const targetId = id ?? selectedChatId;
    if (!targetId) return;

    const snapshot = active.find((chat) => chat.id === targetId) ?? null;
    const result = await closeChat(targetId);
    if (!result.ok) {
      setQueueNotice(result.error);
      return;
    }

    if (result.data) {
      setStatus(result.data.agentStatus);
      if (result.data.message) setQueueNotice(result.data.message);
    }
    setClosedChat(snapshot);
    setSelectedChatId(null);
    await refreshAll();
  }

  async function handleResolveChat() {
    if (!selectedChatId) return;
    const result = await resolveSupportSession(selectedChatId);
    if (!result.ok) {
      setQueueNotice(result.error);
      return;
    }

    if (result.data) {
      setStatus(result.data.agentStatus);
      setQueueNotice(result.data.message ?? "הפנייה סומנה כנפתרה והלקוח קיבל עדכון.");
    } else {
      setQueueNotice("הפנייה סומנה כנפתרה והלקוח קיבל עדכון.");
    }
    setSelectedChatId(null);
    await refreshAll();
  }

  async function handleSetWaitingCustomer() {
    if (!selectedChatId) return;
    const result = await setSessionWaitingCustomer(selectedChatId);
    if (!result.ok) {
      setQueueNotice(result.error);
      return;
    }
    if (result.data) {
      setStatus(result.data.agentStatus);
      setQueueNotice(result.data.message ?? "הפנייה הועברה להמתנה למענה מהלקוח.");
    } else {
      setQueueNotice("הפנייה הועברה להמתנה למענה מהלקוח.");
    }
    setSelectedChatId(null);
    await refreshAll();
  }

  async function handleSetWaitingInternal() {
    if (!selectedChatId) return;
    const reason = window.prompt("הזן סיבת המתנה פנימית (אופציונלי):");
    const result = await setSessionWaitingInternal(selectedChatId, reason || undefined);
    if (!result.ok) {
      setQueueNotice(result.error);
      return;
    }
    setQueueNotice("הפנייה הועברה להמתנה לבדיקה פנימית.");
    await refreshAll();
  }

  function openInternalChat(agent: ConnectedSupportAgent) {
    setSelectedTeamAgent(agent);
  }

  function openConsultation() {
    const availableAgent = agents.find((agent) => !agent.isCurrent && agent.status === "AVAILABLE")
      ?? agents.find((agent) => !agent.isCurrent);

    if (!availableAgent) {
      setQueueNotice("אין נציג נוסף מחובר כרגע להתייעצות.");
      return;
    }

    setSelectedTeamAgent(availableAgent);
  }

  function openTransfer(agent?: ConnectedSupportAgent) {
    const selectedChat = active.find((chat) => chat.id === selectedChatId) ?? null;
    if (!selectedChat) {
      setQueueNotice("יש לבחור שיחה פעילה לפני העברת הטיפול.");
      return;
    }

    setTransferTargetId(agent?.id ?? null);
    setTransferChat(selectedChat);
  }

  const selectedChat = active.find((chat) => chat.id === selectedChatId) ?? null;
  const displayName = profile.displayName || profile.name || agentName;
  const personalReplies = getPersonalSupportReplies(profile, displayName);

  return (
    <SupportShell
      userName={displayName}
      userRole={userRole}
      userImage={profile.profileImageUrl}
      userStatus={status}
      activeSection={activeSection}
      onSelectSection={(section) => {
        if (isAgentSectionKey(section)) setActiveSection(section);
      }}
      navItems={TEAM_AGENT_NAV_ITEMS}
      badges={{ "new-requests": pending.length }}
    >
      <SupportCommandHeader
        agentName={displayName}
        lastUpdated={lastUpdated}
        status={status}
        onStatusChange={handleStatusChange}
        onRefresh={async () => {
          await refreshAll();
          if (activeSection === "dashboard") await refreshDashboard();
        }}
      />

      <AnimatedSection key={activeSection} className="space-y-6">
        {queueNotice && activeSection !== "dashboard" && (
          <div role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-[11px] font-bold text-blue-800">
            {queueNotice}
          </div>
        )}

        {activeSection === "dashboard" && (
          <TeamDashboardOverview
            pending={pending}
            agents={agents}
            notice={queueNotice}
            data={dashboardData}
            dashboardLoaded={dashboardLoaded}
            dashboardError={dashboardError}
            onRetry={refreshDashboard}
            onNavigate={setActiveSection}
            onAccept={handleAccept}
            onReject={handleReject}
            onOpenChat={handleOpenChat}
            onMessageAgent={openInternalChat}
          />
        )}

        {activeSection === "new-requests" && (
          <div className="max-w-3xl">
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
          <div className="support-stagger grid grid-cols-1 gap-4 xl:grid-cols-[270px_minmax(0,1fr)_320px]">
          <ConnectedAgentsPanel
            agents={agents}
            selectedAgentId={selectedTeamAgent?.id}
            canTransfer={Boolean(selectedChat)}
            onMessage={openInternalChat}
            onTransfer={openTransfer}
            className="max-h-[720px]"
          />

          <div className="min-w-0 space-y-3">
            <section className="overflow-hidden rounded-[16px] border border-slate-200/80 bg-white px-2.5 py-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="shrink-0 px-1.5 text-[10px] font-extrabold text-slate-400">שיחות פעילות</span>
                {active.length === 0 && (
                  <span className="px-2 py-2 text-[10px] font-semibold text-slate-400">אין שיחות פעילות</span>
                )}
                {active.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`flex min-w-[145px] shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-right outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selectedChatId === chat.id
                        ? "bg-blue-50 text-blue-800"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-[10px] font-black">{chat.customerName || "לקוח/ה"}</span>
                      <span className="block truncate text-[9px] font-semibold opacity-60">{chat.category || "תמיכה כללית"}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <ActiveChatWindow
              chat={selectedChat}
              closedChat={closedChat}
              messages={chatMessages}
              messageInput={messageInput}
              onMessageInputChange={setMessageInput}
              onSend={handleSendMessage}
              onCloseChat={() => handleCloseChat()}
              onDismissClosed={() => setClosedChat(null)}
              agentName={displayName}
              cannedReplies={personalReplies}
              onSetWaitingCustomer={handleSetWaitingCustomer}
              onSetWaitingInternal={handleSetWaitingInternal}
              onResolve={handleResolveChat}
            />
          </div>

          <SupportCasePanel
            chat={selectedChat}
            activity={activity}
            transferHistory={transferHistory}
            onConsult={openConsultation}
            onTransfer={() => openTransfer()}
            onResolve={handleResolveChat}
            onEnd={() => handleCloseChat()}
            onAnalyze={() => setAiPanelOpen(true)}
          />
          </div>
        )}

        {activeSection === "customers-in-treatment" && (
          <CustomersInTreatmentSection activeChats={active} onOpenChat={handleOpenChat} />
        )}
        {activeSection === "canned-replies" && (
          <CannedRepliesSection agentName={displayName} profile={profile} />
        )}
        {activeSection === "quick-solutions" && (
          <div className="mx-auto h-[calc(100vh-220px)] min-h-[520px] max-w-3xl">
            <AiAssistantPanel
              sessionId={selectedChatId}
              sessionLabel={selectedChat?.customerName ?? null}
              onCopyToReply={handleCopyToReply}
            />
          </div>
        )}
        {activeSection === "technical-tools" && <TechnicalToolsSection />}
        {activeSection === "treatment-notes" && <SessionNotesSection initialSessionId={selectedChatId} />}
        {activeSection === "history" && <SessionHistorySection />}
        {activeSection === "availability-settings" && (
          <PersonalAgentSettingsSection
            profile={profile}
            currentStatus={status}
            onProfileUpdated={setProfile}
          />
        )}
      </AnimatedSection>

      <InternalTeamChat
        agent={selectedTeamAgent}
        sessionId={selectedChatId}
        customerName={selectedChat?.customerName}
        onClose={() => setSelectedTeamAgent(null)}
      />

      {aiPanelOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="עוזר AI טכני">
          <button
            type="button"
            aria-label="סגירת עוזר ה-AI"
            onClick={() => setAiPanelOpen(false)}
            className="flex-1 bg-slate-900/30 backdrop-blur-sm"
          />
          <div className="flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-[11px] font-black text-slate-500">ניתוח פנייה בעזרת AI</span>
              <button
                type="button"
                onClick={() => setAiPanelOpen(false)}
                className="rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                סגירה
              </button>
            </div>
            <div className="min-h-0 flex-1 p-2">
              <AiAssistantPanel
                sessionId={selectedChatId}
                sessionLabel={selectedChat?.customerName ?? null}
                onCopyToReply={handleCopyToReply}
              />
            </div>
          </div>
        </div>
      )}

      {transferChat && (
        <TransferIssueDialog
        chat={transferChat}
        agents={agents}
        initialTargetId={transferTargetId}
        onClose={() => {
          setTransferChat(null);
          setTransferTargetId(null);
        }}
        onTransferred={(targetAgentName) => {
          setQueueNotice(`הטיפול הועבר בהצלחה אל ${targetAgentName}. הלקוח עודכן.`);
          setTransferChat(null);
          setTransferTargetId(null);
          setSelectedChatId(null);
          refreshAll();
        }}
        />
      )}
    </SupportShell>
  );
}


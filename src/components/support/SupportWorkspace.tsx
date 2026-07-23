"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import SupportShell from "./SupportShell";
import SupportTopbar from "./SupportTopbar";
import SupportHeader from "./SupportHeader";
import DashboardSection from "./DashboardSection";
import MyTasksSection from "./MyTasksSection";
import RemoteSupportSection from "./RemoteSupportSection";
import ActiveCustomersSection from "./ActiveCustomersSection";
import QuickSolutionsCard from "./QuickSolutionsCard";
import TechnicalToolsCard from "./TechnicalToolsCard";
import TreatmentNotesSection from "./TreatmentNotesSection";
import TreatmentHistorySection from "./TreatmentHistorySection";
import SettingsSection from "./SettingsSection";
import TicketDetailsDrawer from "./TicketDetailsDrawer";
import type { TechnicianStatusValue } from "./TechnicianStatusSelector";
import type { RemoteSession } from "./RemoteSupportCard";
import type { WaitingCustomer } from "./WaitingCustomersCard";
import { DEFAULT_SUPPORT_SECTION, isSupportSectionKey, type SupportSectionKey, type TechnicianNoteItem, type TechnicianTicket } from "@/lib/support-types";

export default function SupportWorkspace({
  userName,
  userRole,
  initialSection,
  kpis,
  tasks,
  historyTasks,
  remoteSessions,
  waitingCustomers,
  technicianNotes,
  initialEmailNotifications,
}: {
  userName: string | null;
  userRole: string | null;
  initialSection: SupportSectionKey;
  kpis: { openTasks: number; waitingRemote: number; urgent: number; completedToday: number };
  tasks: TechnicianTicket[];
  historyTasks: TechnicianTicket[];
  remoteSessions: RemoteSession[];
  waitingCustomers: WaitingCustomer[];
  technicianNotes: TechnicianNoteItem[];
  initialEmailNotifications: boolean;
}) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SupportSectionKey>(initialSection ?? DEFAULT_SUPPORT_SECTION);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [technicianStatus, setTechnicianStatus] = useState<TechnicianStatusValue>("AVAILABLE");

  const handleSelectSection = (section: string) => {
    if (!isSupportSectionKey(section)) return;
    setActiveSection(section);
    router.replace(`/support/agent/tickets?section=${section}`, { scroll: false });
  };

  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) ?? historyTasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <>
      <SupportShell
        userName={userName}
        userRole={userRole}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      >
        <SupportTopbar
          userName={userName}
          userRole={userRole}
          status={technicianStatus}
          onStatusChange={setTechnicianStatus}
        />
        <SupportHeader />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeSection === "dashboard" && (
              <DashboardSection
                userName={userName}
                userRole={userRole}
                kpis={kpis}
                tasks={tasks}
                onOpenTask={setSelectedTaskId}
              />
            )}
            {activeSection === "my-tasks" && <MyTasksSection tasks={tasks} onOpenTask={setSelectedTaskId} />}
            {activeSection === "remote-support" && (
              <RemoteSupportSection sessions={remoteSessions} waitingCustomers={waitingCustomers} />
            )}
            {activeSection === "active-customers" && <ActiveCustomersSection tasks={tasks} />}
            {activeSection === "quick-solutions" && <QuickSolutionsCard />}
            {activeSection === "technical-tools" && <TechnicalToolsCard />}
            {activeSection === "treatment-notes" && <TreatmentNotesSection notes={technicianNotes} />}
            {activeSection === "treatment-history" && (
              <TreatmentHistorySection history={historyTasks} onOpenTask={setSelectedTaskId} />
            )}
            {activeSection === "settings" && (
              <SettingsSection
                status={technicianStatus}
                onStatusChange={setTechnicianStatus}
                initialEmailNotifications={initialEmailNotifications}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </SupportShell>

      <TicketDetailsDrawer ticket={selectedTask} onClose={() => setSelectedTaskId(null)} />
    </>
  );
}

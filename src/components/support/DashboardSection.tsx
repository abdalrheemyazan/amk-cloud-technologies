"use client";

import { useMemo } from "react";
import { AlertTriangle, ListChecks } from "lucide-react";
import TechnicianKpiCards from "./TechnicianKpiCards";
import TaskListItem from "./TaskListItem";
import TechnicianStatusCard from "./TechnicianStatusCard";
import SlaCompactCard from "./SlaCompactCard";
import { sortTasks } from "@/lib/task-sort";
import type { TechnicianTicket } from "@/lib/support-types";

const DONE_STATUSES = new Set(["RESOLVED", "CLOSED", "CANCELLED"]);

export default function DashboardSection({
  userName,
  userRole,
  kpis,
  tasks,
  onOpenTask,
}: {
  userName: string | null;
  userRole: string | null;
  kpis: { openTasks: number; waitingRemote: number; urgent: number; completedToday: number };
  tasks: TechnicianTicket[];
  onOpenTask: (taskId: string) => void;
}) {
  const urgentTasks = useMemo(() => {
    const active = tasks.filter(
      (t) => !DONE_STATUSES.has(t.status) && (t.priority === "URGENT" || t.priority === "HIGH"),
    );
    return sortTasks(active, "priority").slice(0, 5);
  }, [tasks]);

  const recentTasks = useMemo(() => {
    const active = tasks.filter((t) => !DONE_STATUSES.has(t.status));
    return sortTasks(active, "updated").slice(0, 5);
  }, [tasks]);

  return (
    <div className="flex flex-col gap-6">
      <TechnicianKpiCards
        openTasks={kpis.openTasks}
        waitingRemote={kpis.waitingRemote}
        urgent={kpis.urgent}
        completedToday={kpis.completedToday}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-[#EF4444]" aria-hidden="true" />
              <h2 className="text-base font-bold text-[#0F172A]">משימות דחופות</h2>
            </div>
            {urgentTasks.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5">
                <p className="text-sm font-medium text-[#64748B]">אין משימות דחופות כרגע</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {urgentTasks.map((task) => (
                  <TaskListItem key={task.id} task={task} onOpen={onOpenTask} compact />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
              <h2 className="text-base font-bold text-[#0F172A]">משימות מוקצות לאחרונה</h2>
            </div>
            {recentTasks.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5">
                <p className="text-sm font-medium text-[#64748B]">אין משימות פעילות כרגע</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {recentTasks.map((task) => (
                  <TaskListItem key={task.id} task={task} onOpen={onOpenTask} compact />
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <TechnicianStatusCard userName={userName} userRole={userRole} />
          <SlaCompactCard />
        </div>
      </div>
    </div>
  );
}

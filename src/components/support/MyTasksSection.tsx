"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import TaskListItem from "./TaskListItem";
import TaskFilters, { type TaskFiltersState } from "./TaskFilters";
import { sortTasks } from "@/lib/task-sort";
import { ticketDisplayId } from "@/lib/support-labels";
import type { TechnicianTicket } from "@/lib/support-types";

export default function MyTasksSection({
  tasks,
  onOpenTask,
}: {
  tasks: TechnicianTicket[];
  onOpenTask: (taskId: string) => void;
}) {
  const [filters, setFilters] = useState<TaskFiltersState>({
    query: "",
    status: "",
    priority: "",
    category: "",
    sort: "priority",
  });

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))).sort(),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const filtered = tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.category && task.category !== filters.category) return false;
      if (query) {
        const haystack = [
          task.title,
          task.customerName ?? "",
          ticketDisplayId(task.id),
          task.id,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    return sortTasks(filtered, filters.sort);
  }, [tasks, filters]);

  const hasActiveFilters = !!(filters.query || filters.status || filters.priority || filters.category);

  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#0F172A]">המשימות שלי</h2>
          </div>
          <span className="text-xs font-semibold text-[#94A3B8]">
            {tasks.length > 0 ? `מציג ${visibleTasks.length} מתוך ${tasks.length}` : null}
          </span>
        </div>
        <TaskFilters value={filters} onChange={setFilters} categories={categories} />
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-10 text-center">
          <p className="text-sm font-semibold text-[#0F172A]">אין קריאות להצגה</p>
          <p className="mt-1 text-xs text-[#94A3B8]">כאשר יוקצו לך משימות חדשות, הן יופיעו כאן.</p>
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-10 text-center">
          <p className="text-sm font-semibold text-[#0F172A]">לא נמצאו קריאות התואמות לסינון</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setFilters({ query: "", status: "", priority: "", category: "", sort: filters.sort })}
              className="mt-3 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-bold text-[#2563EB] transition-colors hover:bg-[#F8FAFC]"
            >
              איפוס סינון
            </button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleTasks.map((task) => (
            <TaskListItem key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </ul>
      )}
    </section>
  );
}

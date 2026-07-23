import { Users } from "lucide-react";
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/lib/support-labels";
import type { TechnicianTicket } from "@/lib/support-types";

export default function ActiveCustomersSection({ tasks }: { tasks: TechnicianTicket[] }) {
  const activeTasks = tasks.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");

  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <Users className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">לקוחות בטיפול</h2>
      </div>

      {activeTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-10 text-center">
          <p className="text-sm font-semibold text-[#0F172A]">אין לקוחות בטיפול כרגע</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-[#E2E8F0]">
          {activeTasks.map((task) => (
            <li key={task.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#0F172A]">{task.customerName || "לקוח לא ידוע"}</p>
                <p className="mt-0.5 truncate text-xs text-[#64748B]">
                  {task.category || "לא משויך"} · {task.title || "קריאה ללא כותרת"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${PRIORITY_STYLES[task.priority] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                >
                  {PRIORITY_LABELS[task.priority] ?? task.priority}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[task.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                >
                  {STATUS_LABELS[task.status] ?? task.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

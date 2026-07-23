import { ChevronLeft } from "lucide-react";
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
  relativeTimeFromNow,
  ticketDisplayId,
} from "@/lib/support-labels";
import type { TechnicianTicket } from "@/lib/support-types";

export default function TaskListItem({
  task,
  onOpen,
  compact = false,
}: {
  task: TechnicianTicket;
  onOpen: (taskId: string) => void;
  compact?: boolean;
}) {
  return (
    <li
      onClick={() => onOpen(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(task.id);
        }
      }}
      className={`group flex cursor-pointer flex-col gap-3 rounded-2xl border border-[#E2E8F0] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span dir="ltr" className="text-xs font-semibold text-[#94A3B8]">
            {ticketDisplayId(task.id)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[task.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
          >
            {STATUS_LABELS[task.status] ?? task.status}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${PRIORITY_STYLES[task.priority] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
          >
            {PRIORITY_LABELS[task.priority] ?? task.priority}
          </span>
        </div>

        <p className="mt-1.5 truncate text-sm font-bold text-[#0F172A]">
          {task.title || "משימה ללא כותרת"}
        </p>

        {!compact && (
          <p className="mt-1 truncate text-xs text-[#64748B]">
            {task.customerName || "לקוח לא ידוע"} · {task.category || "לא משויך"}
            {task.agentName && <> · אחראי: {task.agentName}</>}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] font-semibold text-[#64748B]">
            ממתין {relativeTimeFromNow(task.createdAt)}
          </span>
          {!compact && (
            <span className="text-[10px] font-medium text-[#94A3B8]">
              עודכן {relativeTimeFromNow(task.updatedAt)}
            </span>
          )}
        </div>

        {!compact && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(task.id);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-bold text-[#0F172A] transition-colors group-hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
          >
            פתיחת טיפול
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </li>
  );
}

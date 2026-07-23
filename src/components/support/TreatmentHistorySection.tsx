import { History } from "lucide-react";
import TaskListItem from "./TaskListItem";
import type { TechnicianTicket } from "@/lib/support-types";

export default function TreatmentHistorySection({
  history,
  onOpenTask,
}: {
  history: TechnicianTicket[];
  onOpenTask: (taskId: string) => void;
}) {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <History className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">היסטוריית טיפולים</h2>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-10 text-center">
          <p className="text-sm font-semibold text-[#0F172A]">אין היסטוריית טיפולים להצגה</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {history.map((task) => (
            <TaskListItem key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </ul>
      )}
    </section>
  );
}

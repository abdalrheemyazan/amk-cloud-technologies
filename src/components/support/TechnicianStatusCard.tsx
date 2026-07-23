import { UserCheck } from "lucide-react";
import { ROLE_LABELS } from "@/lib/support-labels";

export default function TechnicianStatusCard({
  userName,
  userRole,
}: {
  userName: string | null;
  userRole: string | null;
}) {
  const roleLabel = userRole ? ROLE_LABELS[userRole] ?? userRole : null;

  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <UserCheck className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">מצב טכנאי</h2>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#0F172A]">{userName ?? "משתמש"}</p>
          {roleLabel && <p className="truncate text-xs font-medium text-[#64748B]">{roleLabel}</p>}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
          מחובר
        </span>
      </div>
    </section>
  );
}

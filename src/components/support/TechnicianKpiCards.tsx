import { ClipboardList, Wifi, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

type Kpi = {
  label: string;
  value: number;
  hasData: boolean;
  icon: ReactNode;
  accent: string;
};

export default function TechnicianKpiCards({
  openTasks,
  waitingRemote,
  urgent,
  completedToday,
}: {
  openTasks: number;
  waitingRemote: number;
  urgent: number;
  completedToday: number;
}) {
  const kpis: Kpi[] = [
    {
      label: "משימות פתוחות",
      value: openTasks,
      hasData: true,
      icon: <ClipboardList className="w-4 h-4" aria-hidden="true" />,
      accent: "text-[#2563EB] bg-[#EFF6FF]",
    },
    {
      label: "ממתינות לחיבור מרחוק",
      value: waitingRemote,
      hasData: true,
      icon: <Wifi className="w-4 h-4" aria-hidden="true" />,
      accent: "text-[#F59E0B] bg-amber-50",
    },
    {
      label: "דחופות",
      value: urgent,
      hasData: true,
      icon: <AlertTriangle className="w-4 h-4" aria-hidden="true" />,
      accent: "text-[#EF4444] bg-red-50",
    },
    {
      label: "הושלמו היום",
      value: completedToday,
      hasData: true,
      icon: <CheckCircle2 className="w-4 h-4" aria-hidden="true" />,
      accent: "text-[#10B981] bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <div
          key={kpi.label}
          style={{ animationDelay: `${index * 70}ms`, animationFillMode: "backwards" }}
          className="animate-fade-in flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${kpi.accent}`}>
            {kpi.icon}
          </div>
          <div className="min-w-0">
            <div className="text-xl font-extrabold text-[#0F172A] tabular-nums leading-none">{kpi.value}</div>
            <div className="mt-1 truncate text-xs font-medium text-[#64748B]">{kpi.label}</div>
            {!kpi.hasData && (
              <div className="mt-0.5 text-[10px] font-medium text-[#94A3B8]">אין נתונים זמינים</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

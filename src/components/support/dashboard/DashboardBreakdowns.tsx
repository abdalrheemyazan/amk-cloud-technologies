"use client";

import { BarChart3, ListChecks, PieChart, Users } from "lucide-react";
import type {
  DashboardBreakdownEntry,
  TeamWorkloadEntry,
} from "@/lib/actions/support-dashboard-actions";
import type { AgentStatus } from "@/lib/support-types";
import { PRIORITY_META } from "./priority-presentation";

const STATUS_LABEL: Record<AgentStatus, string> = {
  AVAILABLE: "זמין",
  BUSY: "עסוק",
  OFFLINE: "לא זמין",
};

const STATUS_DOT: Record<AgentStatus, string> = {
  AVAILABLE: "bg-emerald-500",
  BUSY: "bg-amber-500",
  OFFLINE: "bg-slate-400",
};

function BreakdownCard({
  icon: Icon,
  title,
  entries,
  loaded,
  barClass,
}: {
  icon: typeof BarChart3;
  title: string;
  entries: DashboardBreakdownEntry[];
  loaded: boolean;
  barClass?: (entry: DashboardBreakdownEntry) => string;
}) {
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  const populated = entries.filter((entry) => entry.count > 0);

  return (
    <section className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)]">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
        <h3 className="text-xs font-black text-slate-950">{title}</h3>
      </div>

      {loaded && total === 0 ? (
        <p className="mt-4 text-[10px] font-semibold text-slate-400">אין נתונים להצגה</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {populated.map((entry) => {
            const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
            return (
              <li key={entry.key}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="truncate font-bold text-slate-600">{entry.label}</span>
                  <span className="font-black text-slate-900">{entry.count}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${barClass ? barClass(entry) : "bg-blue-500"}`}
                    style={{ width: `${Math.max(pct, entry.count > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function TeamWorkloadCard({
  entries,
  loaded,
}: {
  entries: TeamWorkloadEntry[];
  loaded: boolean;
}) {
  return (
    <section className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)]">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
        <h3 className="text-xs font-black text-slate-950">עומס צוות</h3>
      </div>

      {loaded && entries.length === 0 ? (
        <p className="mt-4 text-[10px] font-semibold text-slate-400">אין נציגים מחוברים נוספים</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {entries.map((agent) => (
            <li key={agent.id} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[agent.status]}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-black text-slate-800">
                    {agent.name}
                    {agent.isCurrent ? " (את/ה)" : ""}
                  </span>
                  <span className="block truncate text-[9px] font-semibold text-slate-400">
                    {agent.role} · {STATUS_LABEL[agent.status]}
                  </span>
                </span>
              </span>
              <span className="shrink-0 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600">
                {agent.activeConversationCount} פעילות
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function DashboardBreakdowns({
  byService,
  byStatus,
  byPriority,
  teamWorkload,
  loaded,
}: {
  byService: DashboardBreakdownEntry[];
  byStatus: DashboardBreakdownEntry[];
  byPriority: DashboardBreakdownEntry[];
  teamWorkload: TeamWorkloadEntry[];
  loaded: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <BreakdownCard icon={BarChart3} title="לפי סוג שירות" entries={byService} loaded={loaded} />
      <BreakdownCard icon={ListChecks} title="לפי סטטוס" entries={byStatus} loaded={loaded} />
      <BreakdownCard
        icon={PieChart}
        title="לפי עדיפות"
        entries={byPriority}
        loaded={loaded}
        barClass={(entry) => PRIORITY_META[entry.key as keyof typeof PRIORITY_META]?.dot ?? "bg-blue-500"}
      />
      <TeamWorkloadCard entries={teamWorkload} loaded={loaded} />
    </div>
  );
}

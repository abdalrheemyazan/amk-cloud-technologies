import type {
  RequestPriorityLevel,
  RequestSlaRisk,
} from "@/lib/support/calculate-request-priority";
import type { RequestAssignment } from "@/lib/actions/support-dashboard-actions";

// Shared presentation helpers + badges for the priority queue. Status is never
// conveyed by color alone — every badge carries a text label and, where useful,
// a shape/icon dot, so it remains readable for color-blind users.

export const PRIORITY_META: Record<
  RequestPriorityLevel,
  { label: string; badge: string; dot: string }
> = {
  CRITICAL: { label: "קריטי", badge: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
  HIGH: { label: "גבוה", badge: "border-orange-200 bg-orange-50 text-orange-700", dot: "bg-orange-500" },
  MEDIUM: { label: "בינוני", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  LOW: { label: "נמוך", badge: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" },
};

export const SLA_META: Record<RequestSlaRisk, { label: string; badge: string }> = {
  BREACHED: { label: "SLA נחרג", badge: "border-red-200 bg-red-50 text-red-700" },
  AT_RISK: { label: "SLA בסיכון", badge: "border-orange-200 bg-orange-50 text-orange-700" },
  NEEDS_RESPONSE: { label: "דורש תגובה", badge: "border-blue-200 bg-blue-50 text-blue-700" },
  OK: { label: "תקין", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

export const ASSIGNMENT_META: Record<RequestAssignment, { label: string; badge: string }> = {
  UNASSIGNED: { label: "לא משויך", badge: "border-slate-200 bg-slate-50 text-slate-600" },
  MINE: { label: "משויך אליי", badge: "border-blue-200 bg-blue-50 text-blue-700" },
  OTHER_AGENT: { label: "משויך לנציג", badge: "border-slate-200 bg-slate-100 text-slate-600" },
};

export function formatWaiting(minutes: number): string {
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `${minutes} דק׳`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest > 0 ? `${hours} שע׳ ${rest} דק׳` : `${hours} שע׳`;
  const days = Math.floor(hours / 24);
  return `${days} ימים`;
}

export function PriorityBadge({ level }: { level: RequestPriorityLevel }) {
  const meta = PRIORITY_META[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function SlaBadge({ risk }: { risk: RequestSlaRisk }) {
  const meta = SLA_META[risk];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

export function AssignmentBadge({ assignment }: { assignment: RequestAssignment }) {
  const meta = ASSIGNMENT_META[assignment];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

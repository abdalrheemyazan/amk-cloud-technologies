import {
  Archive,
  CheckCircle2,
  Clock3,
  Loader2,
  TimerOff,
  XCircle,
  type LucideIcon,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; wrap: string; icon: LucideIcon }> = {
  PENDING: { label: "ממתין לקבלה", wrap: "bg-amber-50 text-amber-700", icon: Clock3 },
  ACTIVE: { label: "בטיפול", wrap: "bg-emerald-50 text-emerald-700", icon: Loader2 },
  RESOLVED: { label: "נפתר", wrap: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  CLOSED: { label: "נסגר", wrap: "bg-slate-100 text-slate-600", icon: Archive },
  REJECTED: { label: "נדחה", wrap: "bg-rose-50 text-rose-700", icon: XCircle },
  EXPIRED: { label: "פג תוקף", wrap: "bg-amber-50 text-amber-700", icon: TimerOff },
};

export default function SupportStatusBadge({ status }: { status: string }) {
  const entry = STATUS_MAP[status] ?? {
    label: status,
    wrap: "bg-slate-100 text-slate-600",
    icon: Clock3,
  };
  const Icon = entry.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${entry.wrap}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {entry.label}
    </span>
  );
}


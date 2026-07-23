import { Clock, Loader2, XCircle, Archive, History, type LucideIcon } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; wrap: string; icon: LucideIcon }> = {
  PENDING: { label: "ממתין לאישור", wrap: "bg-blue-50 text-blue-700", icon: Clock },
  ACTIVE: { label: "בטיפול", wrap: "bg-emerald-50 text-emerald-700", icon: Loader2 },
  CLOSED: { label: "נסגר", wrap: "bg-slate-100 text-slate-500", icon: Archive },
  REJECTED: { label: "נדחה", wrap: "bg-rose-50 text-rose-600", icon: XCircle },
  EXPIRED: { label: "פג תוקף", wrap: "bg-amber-50 text-amber-700", icon: History },
};

export default function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_MAP[status] ?? { label: status, wrap: "bg-slate-100 text-slate-500", icon: Clock };
  const Icon = entry.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full ${entry.wrap}`}>
      <Icon className="w-3 h-3" />
      {entry.label}
    </span>
  );
}

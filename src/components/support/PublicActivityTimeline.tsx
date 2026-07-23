import {
  ArrowLeftRight,
  CheckCircle2,
  CircleDot,
  Headphones,
  MessagesSquare,
  UserRoundCheck,
} from "lucide-react";
import type { SupportActivityView } from "@/lib/actions/support-team-actions";

const TYPE_META = {
  REQUEST_RECEIVED: { icon: CircleDot, tone: "bg-blue-500" },
  AGENT_JOINED: { icon: UserRoundCheck, tone: "bg-emerald-500" },
  CONSULTATION_STARTED: { icon: MessagesSquare, tone: "bg-violet-500" },
  TRANSFERRED: { icon: ArrowLeftRight, tone: "bg-sky-500" },
  RESOLVED: { icon: CheckCircle2, tone: "bg-emerald-500" },
  CLOSED: { icon: CheckCircle2, tone: "bg-slate-500" },
};

export default function PublicActivityTimeline({
  activities,
  compact = false,
}: {
  activities: SupportActivityView[];
  compact?: boolean;
}) {
  if (activities.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-[11px] font-semibold text-slate-400">
        עדכוני הטיפול יופיעו כאן.
      </p>
    );
  }

  return (
    <ol className={compact ? "space-y-2" : "space-y-3"}>
      {activities.map((activity, index) => {
        const meta = TYPE_META[activity.type as keyof typeof TYPE_META] ?? {
          icon: Headphones,
          tone: "bg-blue-500",
        };
        const Icon = meta.icon;
        const time = new Date(activity.createdAt).toLocaleTimeString("he-IL", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <li key={activity.id} className="relative flex gap-2.5">
            {index < activities.length - 1 && (
              <span className="absolute right-[13px] top-7 h-[calc(100%+2px)] w-px bg-slate-200" aria-hidden="true" />
            )}
            <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${meta.tone}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-bold leading-4 text-slate-700">{activity.message}</p>
              <p className="mt-0.5 text-[9px] font-semibold text-slate-400">{time}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}


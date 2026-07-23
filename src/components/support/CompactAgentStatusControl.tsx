"use client";

import { Check, Clock3, Minus } from "lucide-react";
import type { AgentStatus } from "@/lib/support-types";

const OPTIONS: Array<{
  value: AgentStatus;
  label: string;
  dot: string;
  active: string;
}> = [
  {
    value: "AVAILABLE",
    label: "זמין",
    dot: "bg-emerald-500",
    active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    value: "BUSY",
    label: "עסוק",
    dot: "bg-amber-500",
    active: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    value: "OFFLINE",
    label: "לא זמין",
    dot: "bg-slate-400",
    active: "border-slate-300 bg-slate-100 text-slate-700",
  },
];

const ICONS = {
  AVAILABLE: Check,
  BUSY: Clock3,
  OFFLINE: Minus,
} satisfies Record<AgentStatus, typeof Check>;

export default function CompactAgentStatusControl({
  status,
  onChange,
  disabled = false,
}: {
  status: AgentStatus;
  onChange: (status: AgentStatus) => void | boolean | Promise<void | boolean>;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="בחירת זמינות נציג"
      className="grid w-full grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto"
    >
      {OPTIONS.map((option) => {
        const Icon = ICONS[option.value];
        const active = option.value === status;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-[10px] border px-2 text-xs font-extrabold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:min-w-[92px] ${
              active
                ? option.active
                : "border-transparent text-slate-500 hover:bg-white hover:text-slate-800"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-md ${
              active ? "bg-white/80" : "bg-white"
            }`}>
              <Icon className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="truncate">{option.label}</span>
            <span className={`hidden h-1.5 w-1.5 rounded-full sm:block ${option.dot}`} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}


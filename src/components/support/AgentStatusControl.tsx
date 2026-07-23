"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock3, Minus, type LucideIcon } from "lucide-react";
import type { AgentStatus } from "@/lib/support-types";

type StatusOption = {
  value: AgentStatus;
  label: string;
  icon: LucideIcon;
  activeSurface: string;
  activeBorder: string;
  activeText: string;
  iconSurface: string;
  dot: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "AVAILABLE",
    label: "זמין",
    icon: Check,
    activeSurface: "bg-emerald-50",
    activeBorder: "border-emerald-200/90",
    activeText: "text-emerald-800",
    iconSurface: "bg-emerald-500 text-white shadow-[0_5px_14px_rgba(16,185,129,0.24)]",
    dot: "bg-emerald-500",
  },
  {
    value: "BUSY",
    label: "עסוק",
    icon: Clock3,
    activeSurface: "bg-amber-50",
    activeBorder: "border-amber-200/90",
    activeText: "text-amber-800",
    iconSurface: "bg-amber-500 text-white shadow-[0_5px_14px_rgba(245,158,11,0.22)]",
    dot: "bg-amber-500",
  },
  {
    value: "OFFLINE",
    label: "לא זמין",
    icon: Minus,
    activeSurface: "bg-slate-100",
    activeBorder: "border-slate-300/90",
    activeText: "text-slate-700",
    iconSurface: "bg-slate-500 text-white shadow-[0_5px_14px_rgba(100,116,139,0.18)]",
    dot: "bg-slate-400",
  },
];

export default function AgentStatusControl({
  status,
  onChange,
  disabled = false,
}: {
  status: AgentStatus;
  onChange: (status: AgentStatus) => void | boolean | Promise<void | boolean>;
  disabled?: boolean;
}) {
  const selectionId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="בחירת זמינות נציג"
      className="grid w-full grid-cols-3 gap-1.5 rounded-[20px] border border-slate-200/80 bg-slate-100/75 p-1.5 shadow-inner sm:w-auto sm:gap-2"
    >
      {STATUS_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = status === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`group relative isolate flex min-w-0 items-center justify-center gap-1.5 overflow-hidden rounded-[15px] border px-1.5 py-2.5 text-sm font-extrabold outline-none transition-[color,transform,opacity] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:min-w-[112px] sm:gap-2 sm:px-3.5 ${
              isActive
                ? `${option.activeText} ${option.activeBorder}`
                : "border-transparent text-slate-500 hover:bg-white/75 hover:text-slate-800"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={`agent-status-selection-${selectionId}`}
                className={`absolute inset-0 -z-10 rounded-[14px] border ${option.activeSurface} ${option.activeBorder} shadow-[0_5px_18px_-8px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]`}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            )}

            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] transition-all duration-200 ${
                isActive
                  ? option.iconSurface
                  : "bg-white text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.06)] group-hover:text-slate-600"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </span>

            <span className="whitespace-nowrap">{option.label}</span>
            <span
              className={`hidden h-1.5 w-1.5 shrink-0 rounded-full transition-opacity sm:block ${option.dot} ${
                isActive ? "opacity-100" : "opacity-25"
              }`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

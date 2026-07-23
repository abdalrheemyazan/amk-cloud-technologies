"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCheck,
  Clock,
  Clock3,
  Inbox,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  User,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { AgentMetrics } from "@/lib/actions/support-chat-actions";
import type { AgentStatus } from "@/lib/support-types";
import AgentStatusControl from "./AgentStatusControl";
import PremiumAnimatedBorder from "./PremiumAnimatedBorder";

interface AgentWorkspaceHeaderProps {
  agentName: string | null;
  lastUpdated: Date | null;
  metrics: AgentMetrics | null;
  status: AgentStatus;
  onStatusChange: (status: AgentStatus) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

type KpiTone = "blue" | "amber" | "emerald" | "violet";

type KpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number | undefined;
  tone: KpiTone;
};

const KPI_TONES: Record<
  KpiTone,
  { icon: string; rail: string; value: string; halo: string }
> = {
  blue: {
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    rail: "bg-blue-500",
    value: "text-blue-700",
    halo: "bg-blue-500/6",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    rail: "bg-amber-500",
    value: "text-amber-700",
    halo: "bg-amber-500/7",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    rail: "bg-emerald-500",
    value: "text-emerald-700",
    halo: "bg-emerald-500/6",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    rail: "bg-violet-500",
    value: "text-violet-700",
    halo: "bg-violet-500/6",
  },
};

const STATUS_COPY: Record<AgentStatus, { label: string; description: string; color: string }> = {
  AVAILABLE: {
    label: "זמין לקבלת פניות",
    description: "בקשות צ׳אט חדשות יכולות להיכנס לתור שלך.",
    color: "bg-emerald-500",
  },
  BUSY: {
    label: "עסוק כרגע",
    description: "השיחות הפתוחות נשארות פעילות, ללא בקשות חדשות.",
    color: "bg-amber-500",
  },
  OFFLINE: {
    label: "לא זמין לקבלת פניות",
    description: "לא יוקצו לך בקשות חדשות עד לשינוי הסטטוס.",
    color: "bg-slate-400",
  },
};

export default function AgentWorkspaceHeader({
  agentName,
  lastUpdated,
  metrics,
  status,
  onStatusChange,
  onRefresh,
}: AgentWorkspaceHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });
  const reduceMotion = useReducedMotion();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    window.setTimeout(
      () => setToast((previous) => ({ ...previous, visible: false })),
      3000,
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (newStatus: AgentStatus) => {
    if (newStatus === status || isChangingStatus) return;

    setIsChangingStatus(true);
    try {
      const success = await onStatusChange(newStatus);
      showToast(
        success ? "הסטטוס עודכן בהצלחה" : "לא ניתן לעדכן את הסטטוס כרגע",
        success ? "success" : "error",
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const currentStatus = STATUS_COPY[status] ?? STATUS_COPY.OFFLINE;

  return (
    <div className="space-y-5">
      <PremiumAnimatedBorder className="rounded-[28px] p-px shadow-[0_12px_35px_-24px_rgba(15,23,42,0.28)]">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="overflow-hidden rounded-[27px] bg-white px-5 py-6 sm:px-7 sm:py-7"
        >
        <div
          className="absolute inset-y-6 right-0 w-1 rounded-l-full bg-gradient-to-b from-blue-600 via-blue-500 to-cyan-400"
          aria-hidden="true"
        />
        <div
          className="absolute -left-24 -top-28 h-64 w-64 rounded-full bg-blue-500/[0.035] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
              <Wifi className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
              <span className="absolute -left-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="text-[1.65rem] font-black leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.9rem]">
                עמדת נציג תמיכה
              </h1>
              <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500 sm:text-[15px]">
                ניהול פניות, שיחות וזמינות מתוך סביבת עבודה אחת.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-600 sm:gap-3">
            <MetaItem icon={User}>{agentName || "נציג תמיכה"}</MetaItem>
            <MetaItem icon={Clock}>סנכרון אחרון: {formattedTime}</MetaItem>
            <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-45 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              מערכת פעילה
            </span>
          </div>
        </div>
        </motion.header>
      </PremiumAnimatedBorder>

      <motion.section
        aria-label="מדדי פעילות"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06, ease: "easeOut" }}
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <KpiCard
          icon={MessageSquare}
          label="שיחות פעילות"
          value={metrics?.activeCount}
          tone="blue"
        />
        <KpiCard
          icon={Inbox}
          label="ממתינות"
          value={metrics?.pendingCount}
          tone="amber"
        />
        <KpiCard
          icon={CheckCheck}
          label="טופלו היום"
          value={metrics?.closedTodayCount}
          tone="emerald"
        />
        <KpiCard
          icon={Clock3}
          label="זמן תגובה"
          value={
            metrics?.avgResponseMinutes === undefined
              ? undefined
              : `${metrics.avgResponseMinutes} דק׳`
          }
          tone="violet"
        />
      </motion.section>

      <motion.section
        aria-labelledby="agent-availability-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.1, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.4)] sm:p-5"
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_8px_20px_-10px_rgba(15,23,42,0.7)]">
              <ShieldCheck className="h-[18px] w-[18px]" aria-hidden="true" />
              <span
                className={`absolute -left-1 -top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white ${currentStatus.color}`}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h2
                  id="agent-availability-heading"
                  className="text-base font-black tracking-[-0.01em] text-slate-950"
                >
                  זמינות נציג
                </h2>
                <span className="text-xs font-extrabold text-slate-500">
                  {currentStatus.label}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-[13px]">
                {currentStatus.description}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center xl:w-auto">
            <AgentStatusControl
              status={status}
              onChange={handleStatusChange}
              disabled={isChangingStatus}
            />
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="רענון נתוני העמדה"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[15px] border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.2)] outline-none transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-55"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>{isRefreshing ? "מרענן..." : "רענון"}</span>
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" aria-live="polite">
          <AnimatePresence>
            {toast.visible && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 10 }}
                exit={{ opacity: 0, y: -4 }}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold shadow-sm ${
                  toast.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  );
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3">
      <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, tone }: KpiCardProps) {
  const colors = KPI_TONES[tone];
  const hasValue = value !== undefined;

  return (
    <article className="group relative min-h-[128px] overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.45)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_16px_32px_-24px_rgba(15,23,42,0.5)] sm:min-h-[138px] sm:p-5">
      <span
        className={`absolute inset-y-5 right-0 w-[3px] rounded-l-full ${colors.rail}`}
        aria-hidden="true"
      />
      <span
        className={`absolute -left-9 -top-12 h-28 w-28 rounded-full ${colors.halo} blur-2xl transition-transform duration-500 group-hover:scale-125`}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col justify-between gap-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ring-1 ring-inset ${colors.icon}`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-xs font-extrabold leading-5 text-slate-500 sm:text-[13px]">
            {label}
          </span>
        </div>

        <div
          className={`text-[1.7rem] font-black leading-none tracking-[-0.035em] sm:text-[2rem] ${
            hasValue ? colors.value : "text-slate-300"
          }`}
        >
          {hasValue ? value : "—"}
        </div>
      </div>
    </article>
  );
}

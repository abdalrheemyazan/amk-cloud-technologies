import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageTone = "blue" | "cyan" | "indigo" | "emerald" | "amber" | "violet" | "slate";

const TONE_STYLES: Record<PageTone, { icon: string; wash: string; rail: string; eyebrow: string }> = {
  blue: {
    icon: "bg-blue-600 text-white shadow-blue-600/20",
    wash: "from-blue-50/90 via-white to-white",
    rail: "from-blue-600 to-cyan-400",
    eyebrow: "text-blue-700",
  },
  cyan: {
    icon: "bg-cyan-600 text-white shadow-cyan-600/20",
    wash: "from-cyan-50/90 via-white to-white",
    rail: "from-cyan-500 to-blue-600",
    eyebrow: "text-cyan-700",
  },
  indigo: {
    icon: "bg-indigo-600 text-white shadow-indigo-600/20",
    wash: "from-indigo-50/90 via-white to-white",
    rail: "from-indigo-600 to-blue-500",
    eyebrow: "text-indigo-700",
  },
  emerald: {
    icon: "bg-emerald-600 text-white shadow-emerald-600/20",
    wash: "from-emerald-50/80 via-white to-white",
    rail: "from-emerald-500 to-cyan-500",
    eyebrow: "text-emerald-700",
  },
  amber: {
    icon: "bg-amber-500 text-white shadow-amber-500/20",
    wash: "from-amber-50/90 via-white to-white",
    rail: "from-amber-400 to-orange-500",
    eyebrow: "text-amber-700",
  },
  violet: {
    icon: "bg-violet-600 text-white shadow-violet-600/20",
    wash: "from-violet-50/90 via-white to-white",
    rail: "from-violet-600 to-blue-500",
    eyebrow: "text-violet-700",
  },
  slate: {
    icon: "bg-slate-800 text-white shadow-slate-800/20",
    wash: "from-slate-100/80 via-white to-white",
    rail: "from-slate-700 to-blue-500",
    eyebrow: "text-slate-600",
  },
};

export default function CustomerPortalPageShell({
  title,
  description,
  eyebrow,
  icon: Icon,
  tone = "blue",
  badge,
  actions,
  backHref,
  backLabel = "חזרה לאזור הלקוח",
  children,
}: {
  title: string;
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  tone?: PageTone;
  badge?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="space-y-5">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 transition-colors hover:text-blue-700 focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
      ) : null}

      <header className={`relative overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-l ${styles.wash} px-5 py-5 shadow-[0_14px_40px_-34px_rgba(15,23,42,0.55)] sm:px-6 sm:py-6`}>
        <span className={`absolute inset-y-0 right-0 w-1 bg-gradient-to-b ${styles.rail}`} aria-hidden="true" />
        <span
          className="pointer-events-none absolute -left-10 -top-14 h-36 w-36 rounded-full border-[22px] border-white/60"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] shadow-lg ${styles.icon}`}>
              <Icon className="h-5 w-5" strokeWidth={2.1} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${styles.eyebrow}`}>{eyebrow}</p>
                {badge ? (
                  <span className="rounded-full border border-slate-200 bg-white/85 px-2 py-0.5 text-[9px] font-black text-slate-500">
                    {badge}
                  </span>
                ) : null}
              </div>
              <h1 className="text-xl font-black tracking-[-0.02em] text-slate-950 sm:text-2xl">{title}</h1>
              <p className="mt-1 max-w-2xl text-xs font-semibold leading-6 text-slate-600 sm:text-sm">{description}</p>
            </div>
          </div>
          {actions ? <div className="relative flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
        </div>
      </header>

      {children}
    </div>
  );
}

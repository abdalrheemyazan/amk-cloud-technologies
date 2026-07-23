"use client";

import { BookOpenText, CalendarDays, CircleX, FileText, RefreshCw, ShieldCheck, X } from "lucide-react";
import PolicyDocumentContent from "@/components/legal/PolicyDocumentContent";
import {
  POLICY_DOCUMENTS,
  type PolicyDocumentKey,
  type PolicyDocumentTone,
} from "@/lib/policy-documents";
import PortalPolicyTabs from "./PortalPolicyTabs";

const TONE = {
  privacy: {
    icon: ShieldCheck,
    rail: "from-blue-600 to-cyan-400",
    dot: "bg-blue-500",
    active: "hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800",
  },
  terms: {
    icon: FileText,
    rail: "from-violet-600 to-blue-500",
    dot: "bg-violet-500",
    active: "hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800",
  },
  cancellation: {
    icon: CircleX,
    rail: "from-amber-400 to-orange-500",
    dot: "bg-amber-500",
    active: "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-900",
  },
  refund: {
    icon: RefreshCw,
    rail: "from-emerald-500 to-cyan-500",
    dot: "bg-emerald-500",
    active: "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900",
  },
} satisfies Record<
  PolicyDocumentTone,
  { icon: typeof ShieldCheck; rail: string; dot: string; active: string }
>;

export default function PortalPolicyPanel({
  policyKey,
  onSelect,
  onClose,
}: {
  policyKey: PolicyDocumentKey;
  onSelect: (key: PolicyDocumentKey) => void;
  onClose: () => void;
}) {
  const policy = POLICY_DOCUMENTS[policyKey];
  const styles = TONE[policy.tone];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <PortalPolicyTabs activeKey={policyKey} onSelect={onSelect} />
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירת מסמך המדיניות"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 outline-none transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <article className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_52px_-44px_rgba(15,23,42,0.62)]">
        <span className={`absolute inset-y-0 right-0 w-1 bg-gradient-to-b ${styles.rail}`} aria-hidden="true" />

        <div className="grid items-start lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-slate-50/75 p-4 sm:p-5 lg:sticky lg:top-5 lg:border-b-0 lg:border-l">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold text-slate-500 shadow-sm">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span>גרסה עדכנית · {policy.updatedAt}</span>
            </div>

            <nav aria-label={`תוכן העניינים — ${policy.title}`}>
              <p className="mb-2.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                <BookOpenText className="h-4 w-4" aria-hidden="true" />
                במסמך זה
              </p>
              <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {policy.toc.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`group flex min-h-9 items-center gap-2 rounded-xl border border-transparent px-2.5 py-1.5 text-[11px] font-bold text-slate-600 outline-none transition-colors ${styles.active} focus-visible:ring-2 focus-visible:ring-blue-500`}
                    >
                      <span className="font-mono text-[9px] tabular-nums text-slate-400" dir="ltr">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 px-5 py-6 sm:px-7 sm:py-7 lg:px-9">
            <div className="portal-policy-content max-w-3xl">
              <PolicyDocumentContent policyKey={policyKey} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

"use client";

import { CircleX, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import {
  POLICY_DOCUMENT_ORDER,
  POLICY_DOCUMENTS,
  type PolicyDocumentKey,
} from "@/lib/policy-documents";

const ICONS = {
  privacy: ShieldCheck,
  terms: FileText,
  "cancellation-policy": CircleX,
  "refund-policy": RefreshCw,
} satisfies Record<PolicyDocumentKey, typeof ShieldCheck>;

export default function PortalPolicyTabs({
  activeKey,
  onSelect,
}: {
  activeKey?: PolicyDocumentKey;
  onSelect: (key: PolicyDocumentKey) => void;
}) {
  return (
    <nav
      aria-label="מסמכי מדיניות"
      className="grid grid-cols-2 gap-2 rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_14px_36px_-34px_rgba(15,23,42,0.5)] sm:grid-cols-4"
    >
      {POLICY_DOCUMENT_ORDER.map((key) => {
        const policy = POLICY_DOCUMENTS[key];
        const Icon = ICONS[key];
        const active = key === activeKey;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black outline-none transition-[border-color,background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 ${
              active
                ? "border-blue-200 bg-blue-50 text-blue-800 shadow-sm"
                : "border-transparent text-slate-600 hover:-translate-y-px hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} aria-hidden="true" />
            <span>{policy.shortTitle}</span>
          </button>
        );
      })}
    </nav>
  );
}

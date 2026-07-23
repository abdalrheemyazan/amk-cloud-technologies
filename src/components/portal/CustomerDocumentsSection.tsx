"use client";

import { useCallback, useState } from "react";
import {
  ArrowLeft,
  CircleX,
  FileCheck2,
  FileCog,
  FileText,
  FolderOpen,
  MessageCircleQuestion,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { POLICY_DOCUMENT_ORDER, POLICY_DOCUMENTS, type PolicyDocumentKey } from "@/lib/policy-documents";
import CustomerPortalPageShell from "./CustomerPortalPageShell";
import PortalPolicyPanel from "./PortalPolicyPanel";

const POLICY_CARD_STYLES = {
  privacy: { icon: ShieldCheck, wrap: "bg-blue-50 text-blue-700", border: "hover:border-blue-200" },
  terms: { icon: FileText, wrap: "bg-violet-50 text-violet-700", border: "hover:border-violet-200" },
  "cancellation-policy": { icon: CircleX, wrap: "bg-amber-50 text-amber-700", border: "hover:border-amber-200" },
  "refund-policy": { icon: RefreshCw, wrap: "bg-emerald-50 text-emerald-700", border: "hover:border-emerald-200" },
} satisfies Record<PolicyDocumentKey, { icon: typeof ShieldCheck; wrap: string; border: string }>;

const ACCOUNT_CATEGORIES = [
  { icon: FileCheck2, label: "מסמכי שירות", caption: "הסכמים ונספחים לחשבון" },
  { icon: FileCog, label: "קבצי התקנה", caption: "הוראות וחבילות חיבור" },
  { icon: ReceiptText, label: "חשבוניות", caption: "מסמכי חיוב זמינים" },
];

export default function CustomerDocumentsSection({
  initialPolicyKey = null,
}: {
  initialPolicyKey?: PolicyDocumentKey | null;
}) {
  const [activePolicy, setActivePolicyState] = useState<PolicyDocumentKey | null>(initialPolicyKey);

  const setActivePolicy = useCallback((key: PolicyDocumentKey | null) => {
    setActivePolicyState(key);
    // Sync the URL without going through the Next.js router: a router.push/replace
    // re-fetches the RSC payload (and re-runs the portal's DB queries) even when only
    // the search param changes, which is exactly the full-reload feel this avoids.
    const url = key ? `/portal/documents?policy=${key}` : "/portal/documents";
    window.history.replaceState(null, "", url);
  }, []);

  return (
    <CustomerPortalPageShell
      title="מסמכים וקבצים"
      description="כל מסמכי השירות, הקבצים והמדיניות של חשבון AMK במקום אחד."
      eyebrow="מרכז מסמכים"
      icon={FolderOpen}
      tone="amber"
      badge="גישה מאובטחת"
    >
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="space-y-4">
          <section className="rounded-[20px] border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-amber-50 text-amber-600">
                  <FolderOpen className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-950">אין מסמכים אישיים להצגה כרגע</h2>
                  <p className="mt-1 max-w-xl text-xs font-semibold leading-5 text-slate-500">
                    הסכמים, חשבוניות וקובצי שירות יופיעו כאן אוטומטית כשהם משויכים לחשבון שלך.
                  </p>
                </div>
              </div>
              <Link
                href="/portal/contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 outline-none transition-colors hover:border-blue-200 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
                בירור מול AMK
              </Link>
            </div>
          </section>

          <section className="rounded-[20px] border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="available-policies-title">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-blue-600">ספריית מדיניות</p>
                <h2 id="available-policies-title" className="mt-1 text-sm font-black text-slate-950">מסמכים זמינים לצפייה</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400">4 מסמכים</span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {POLICY_DOCUMENT_ORDER.map((key) => {
                const policy = POLICY_DOCUMENTS[key];
                const style = POLICY_CARD_STYLES[key];
                const Icon = style.icon;
                const active = key === activePolicy;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivePolicy(key)}
                    aria-current={active ? "true" : undefined}
                    className={`group relative overflow-hidden rounded-[16px] border bg-white p-3.5 text-right outline-none transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_12px_28px_-24px_rgba(15,23,42,0.55)] ${
                      active ? "border-blue-200 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.55)]" : "border-slate-200"
                    } ${style.border} focus-visible:ring-2 focus-visible:ring-blue-500`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.wrap}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-black text-slate-950">{policy.title}</span>
                        <span className="mt-1 line-clamp-2 block text-[10px] font-semibold leading-5 text-slate-500">
                          {policy.description}
                        </span>
                        <span className="mt-2 flex items-center justify-between gap-2 text-[9px] font-bold text-slate-400">
                          <span>עודכן {policy.updatedAt}</span>
                          <ArrowLeft className="h-3.5 w-3.5 text-blue-500 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {activePolicy && (
            <div key={activePolicy} className="support-section-in">
              <PortalPolicyPanel
                policyKey={activePolicy}
                onSelect={setActivePolicy}
                onClose={() => setActivePolicy(null)}
              />
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <section className="rounded-[20px] border border-slate-200 bg-white p-4" aria-labelledby="account-docs-title">
            <h2 id="account-docs-title" className="text-xs font-black text-slate-950">מסמכי החשבון</h2>
            <p className="mt-1 text-[10px] font-semibold leading-5 text-slate-400">קטגוריות שיופעלו כשיתווסף תוכן לחשבון.</p>
            <div className="mt-3 space-y-2">
              {ACCOUNT_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.label} className="flex items-center gap-2.5 rounded-[14px] border border-slate-100 bg-slate-50/65 p-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-amber-600 shadow-sm">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-black text-slate-800">{category.label}</span>
                      <span className="mt-0.5 block text-[9px] font-semibold text-slate-400">{category.caption}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[20px] border border-blue-100 bg-blue-50/70 p-4" aria-labelledby="document-help-title">
            <h2 id="document-help-title" className="text-xs font-black text-[#0B1739]">צריך מסמך שלא מופיע כאן?</h2>
            <p className="mt-1 text-[10px] font-semibold leading-5 text-slate-600">פתח פנייה קצרה ונעזור לאתר או להפיק אותו.</p>
            <Link
              href="/portal/new-request"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-3 py-2 text-[11px] font-black text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              פתיחת פנייה
            </Link>
          </section>
        </aside>
      </div>
    </CustomerPortalPageShell>
  );
}

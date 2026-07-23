import Link from "next/link";
import { Scale } from "lucide-react";
import { POLICY_DOCUMENT_ORDER, POLICY_DOCUMENTS } from "@/lib/policy-documents";

export default function PortalLegalLinksRow({ compact = false }: { compact?: boolean }) {
  return (
    <nav
      aria-label="מידע משפטי ומדיניות"
      className={`flex flex-wrap items-center ${compact ? "gap-1" : "gap-1.5"}`}
    >
      <span className={`inline-flex items-center gap-1 font-black text-slate-500 ${compact ? "px-1 text-[9px]" : "text-[10px]"}`}>
        <Scale className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
        מדיניות
      </span>
      {POLICY_DOCUMENT_ORDER.map((key) => {
        const policy = POLICY_DOCUMENTS[key];
        return (
          <Link
            key={key}
            href={policy.portalHref}
            className={`rounded-full border border-slate-200 bg-white font-black text-slate-600 outline-none transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 ${
              compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
            }`}
          >
            {policy.shortTitle}
          </Link>
        );
      })}
    </nav>
  );
}

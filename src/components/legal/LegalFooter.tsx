import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legal-links";
import type { LegalPageContext } from "@/lib/legal-page-context";

const POLICY_HREFS = new Set(["/privacy", "/terms", "/cancellation-policy", "/refund-policy"]);

export default function LegalFooter({ context = null }: { context?: LegalPageContext }) {
  return (
    <footer className="relative border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-8 text-center md:px-8">
        <span className="inline-flex items-center gap-2 text-sm font-black text-[#0B1739]">
          <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
          AMK Cloud Technologies
        </span>
        <nav aria-label="קישורים משפטיים" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={context && POLICY_HREFS.has(link.href) ? `${link.href}?from=${context}` : link.href}
              className="rounded-md text-xs font-bold text-slate-500 outline-none transition-colors hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-[11px] font-semibold text-slate-400">
          © {new Date().getFullYear()} AMK Cloud Technologies. כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
}

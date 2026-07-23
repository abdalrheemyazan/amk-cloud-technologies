import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Accessibility,
  BookOpenText,
  CalendarDays,
  CircleX,
  FileText,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import type { LegalPageContext } from "@/lib/legal-page-context";
import LegalFooter from "./LegalFooter";
import PolicyBackButton from "./PolicyBackButton";

type TocItem = { id: string; label: string };
export type LegalPageTone = "privacy" | "terms" | "cancellation" | "refund" | "accessibility" | "contact";

const TONE_CONFIG = {
  privacy: {
    icon: ShieldCheck,
    eyebrow: "פרטיות ואבטחת מידע",
    accent: "from-blue-600 via-blue-500 to-cyan-400",
    wash: "from-blue-50 via-white to-cyan-50/60",
    iconWrap: "border-blue-100 bg-blue-600 text-white shadow-blue-600/20",
    tocHover: "hover:border-blue-100 hover:bg-blue-50/70 hover:text-blue-800",
    dot: "bg-blue-500",
  },
  terms: {
    icon: FileText,
    eyebrow: "כללי שימוש ושירות",
    accent: "from-indigo-600 via-indigo-500 to-blue-400",
    wash: "from-indigo-50 via-white to-blue-50/60",
    iconWrap: "border-indigo-100 bg-indigo-600 text-white shadow-indigo-600/20",
    tocHover: "hover:border-indigo-100 hover:bg-indigo-50/70 hover:text-indigo-800",
    dot: "bg-indigo-500",
  },
  cancellation: {
    icon: CircleX,
    eyebrow: "ביטול והפסקת שירות",
    accent: "from-orange-600 via-orange-500 to-amber-400",
    wash: "from-orange-50 via-white to-amber-50/60",
    iconWrap: "border-orange-100 bg-orange-600 text-white shadow-orange-600/20",
    tocHover: "hover:border-orange-100 hover:bg-orange-50/70 hover:text-orange-900",
    dot: "bg-orange-500",
  },
  refund: {
    icon: RefreshCw,
    eyebrow: "זיכויים והחזרים",
    accent: "from-emerald-600 via-emerald-500 to-teal-400",
    wash: "from-emerald-50 via-white to-teal-50/60",
    iconWrap: "border-emerald-100 bg-emerald-600 text-white shadow-emerald-600/20",
    tocHover: "hover:border-emerald-100 hover:bg-emerald-50/70 hover:text-emerald-900",
    dot: "bg-emerald-500",
  },
  accessibility: {
    icon: Accessibility,
    eyebrow: "נגישות ושימוש שוויוני",
    accent: "from-cyan-600 via-cyan-500 to-blue-400",
    wash: "from-cyan-50 via-white to-blue-50/60",
    iconWrap: "border-cyan-100 bg-cyan-600 text-white shadow-cyan-600/20",
    tocHover: "hover:border-cyan-100 hover:bg-cyan-50/70 hover:text-cyan-900",
    dot: "bg-cyan-500",
  },
  contact: {
    icon: Mail,
    eyebrow: "קשר ושירות לקוחות",
    accent: "from-sky-600 via-blue-500 to-cyan-400",
    wash: "from-sky-50 via-white to-cyan-50/60",
    iconWrap: "border-sky-100 bg-sky-600 text-white shadow-sky-600/20",
    tocHover: "hover:border-sky-100 hover:bg-sky-50/70 hover:text-sky-900",
    dot: "bg-sky-500",
  },
} satisfies Record<LegalPageTone, Record<string, string | typeof ShieldCheck>>;

export default async function LegalPageLayout({
  title,
  description,
  tocItems,
  tone,
  context = null,
  portalHref,
  updatedAt = "23 ביולי 2026",
  children,
}: {
  title: string;
  description: string;
  tocItems?: TocItem[];
  tone: LegalPageTone;
  context?: LegalPageContext;
  portalHref?: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isCustomer = session?.user?.role === "CUSTOMER";

  if (portalHref && (context === "portal" || context === "documents" || isCustomer)) {
    redirect(portalHref);
  }

  const backTarget =
    context === "documents"
      ? { href: "/portal/documents", label: "חזרה למסמכים וקבצים" }
      : context === "portal" || isCustomer
        ? { href: "/portal", label: "חזרה לאזור הלקוח" }
        : { href: "/", label: "חזרה לדף הבית" };
  const config = TONE_CONFIG[tone];
  const Icon = config.icon;

  return (
    <div dir="rtl" className="relative flex min-h-screen flex-col overflow-hidden bg-[#F5F8FC]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(circle_at_75%_0%,rgba(37,99,235,0.10),transparent_43%),radial-gradient(circle_at_20%_10%,rgba(6,182,212,0.07),transparent_35%)]" aria-hidden="true" />

      <main className="relative flex-1 px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
            <PolicyBackButton href={backTarget.href} label={backTarget.label} />
            <div className="flex items-center gap-2 text-left" dir="ltr">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Policy Center</span>
              <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
              <span className="text-xs font-black text-[#0B1739]">AMK Cloud</span>
            </div>
          </div>

          <article className="relative overflow-hidden rounded-[28px] border border-slate-200/90 bg-white shadow-[0_28px_80px_-48px_rgba(15,23,42,0.55)]">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${config.accent}`} aria-hidden="true" />

            <header className={`relative overflow-hidden border-b border-slate-200 bg-gradient-to-bl ${config.wash} px-5 py-7 sm:px-8 sm:py-9 lg:px-10`}>
              <div className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full border-[34px] border-white/45" aria-hidden="true" />
              <div className="relative flex items-start gap-4 sm:gap-5">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-lg sm:h-14 sm:w-14 ${config.iconWrap}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-500">{config.eyebrow}</p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0B1739] sm:text-3xl lg:text-[34px]">{title}</h1>
                  <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:text-[15px]">{description}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2.5 text-[10px] font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/85 px-2.5 py-1 shadow-sm">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      עודכן לאחרונה: {updatedAt}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/85 px-2.5 py-1 shadow-sm">
                      <BookOpenText className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      מסמך מידע ושירות
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <div className={`absolute bottom-0 right-0 top-[1px] w-1 bg-gradient-to-b ${config.accent}`} aria-hidden="true" />

            <div className={tocItems && tocItems.length > 0 ? "grid items-start lg:grid-cols-[240px_minmax(0,1fr)]" : "block"}>
              {tocItems && tocItems.length > 0 ? (
                <aside className="border-b border-slate-200 bg-slate-50/65 p-4 sm:p-5 lg:sticky lg:top-0 lg:border-b-0 lg:border-l lg:p-6">
                  <nav aria-label={`תוכן העניינים — ${title}`}>
                    <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                      <BookOpenText className="h-4 w-4" aria-hidden="true" />
                      תוכן העניינים
                    </p>
                    <ol className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
                      {tocItems.map((item, index) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className={`group flex min-h-10 items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-2 text-xs font-bold text-slate-600 outline-none transition-[border-color,background-color,color] ${config.tocHover} focus-visible:ring-2 focus-visible:ring-blue-500`}
                          >
                            <span className="font-mono text-[9px] font-bold tabular-nums text-slate-400" dir="ltr">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden="true" />
                            <span>{item.label}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </aside>
              ) : null}

              <div className="min-w-0 px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
                <div className="space-y-8">{children}</div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <LegalFooter context={context} />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeAlert,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  cleanInlineMarkdown,
  isCustomerSafeArticle,
  mapCustomerArticle,
} from "@/lib/knowledge-base";
import { cn } from "@/lib/utils";

export default async function KnowledgeBaseArticlePage(
  props: PageProps<"/portal/knowledge-base/[slug]">,
) {
  const { slug } = await props.params;

  const article = await prisma.knowledgeArticle.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      category: true,
      tags: true,
      severity: true,
      audience: true,
      symptoms: true,
      diagnosisSteps: true,
      resolutionSteps: true,
      escalationCriteria: true,
      customerReplyTemplate: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  if (!article || !isCustomerSafeArticle(article)) {
    notFound();
  }

  const customerArticle = mapCustomerArticle(article);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8" dir="rtl">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/portal" className="transition hover:text-slate-900">
          הבית שלי
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-300" />
        <Link
          href="/portal/knowledge-base"
          className="transition hover:text-slate-900"
        >
          מאגר ידע
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-300" />
        <span className="font-semibold text-slate-700">{customerArticle.title}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-44px_rgba(15,23,42,0.38)] sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600">
              {customerArticle.categoryLabel}
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-bold",
                customerArticle.severityTone,
              )}
            >
              {customerArticle.severityLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
              <Clock3 className="h-4 w-4" />
              {customerArticle.readingTime} דקות קריאה
            </span>
          </div>

          <div className="mt-5 space-y-4 border-b border-slate-100 pb-8">
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {customerArticle.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600">
              {customerArticle.summary}
            </p>
          </div>

          <div className="mt-8 grid gap-6">
            <SectionCard
              icon={BadgeAlert}
              title="מה מרגישים בדרך כלל"
              items={customerArticle.symptoms}
              emptyText="לא נוספו תסמינים למדריך זה."
            />
            <SectionCard
              icon={BookOpen}
              title="מה כדאי לבדוק"
              items={customerArticle.diagnosisSteps}
              emptyText="אין צעדי בדיקה זמינים כרגע."
            />
            <SectionCard
              icon={CheckCircle2}
              title="צעדים שכדאי לנסות"
              items={customerArticle.resolutionSteps}
              emptyText="אין צעדי פתרון זמינים כרגע."
            />
            <SectionCard
              icon={ShieldCheck}
              title="מתי לפנות לתמיכה"
              items={customerArticle.escalationSteps}
              emptyText="אם ההנחיות לא פתרו את הבעיה, מומלץ לפתוח קריאה לצוות התמיכה."
            />
          </div>

          {customerArticle.customerReplyTemplate ? (
            <div className="mt-8 rounded-[1.5rem] border border-blue-100 bg-[#F8FAFF] p-5">
              <h2 className="text-sm font-black text-slate-950">מה יקרה אחרי הפנייה</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {cleanInlineMarkdown(customerArticle.customerReplyTemplate)}
              </p>
            </div>
          ) : null}
        </article>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-44px_rgba(15,23,42,0.4)]">
            <h2 className="text-sm font-black text-slate-950">מידע על המדריך</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">קטגוריה</dt>
                <dd className="font-bold text-slate-900">
                  {customerArticle.categoryLabel}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">עודכן לאחרונה</dt>
                <dd className="font-bold text-slate-900">{customerArticle.updatedAt}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">זמן קריאה</dt>
                <dd className="font-bold text-slate-900">
                  {customerArticle.readingTime} דקות
                </dd>
              </div>
            </dl>

            {customerArticle.tags.length > 0 ? (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  מילות מפתח
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {customerArticle.tags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border border-blue-100 bg-[linear-gradient(145deg,_#EFF6FF_0%,_#FFFFFF_100%)] p-6 shadow-[0_18px_60px_-40px_rgba(37,99,235,0.34)]">
            <div className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 text-[11px] font-black text-blue-700">
              זקוק לעזרה נוספת?
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">
              לא הסתדר?
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              אפשר לפתוח קריאה חדשה והצוות שלנו יבדוק את הנושא יחד איתך.
            </p>
            <Link
              href="/portal/tickets/new"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              פתיחת קריאה
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  items,
  emptyText,
}: {
  icon: typeof BadgeAlert;
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <section className="rounded-[1.6rem] border border-slate-200 bg-[#FCFDFF] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-blue-700">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>

      {items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm leading-7 text-slate-700"
            >
              <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-7 text-slate-500">{emptyText}</p>
      )}
    </section>
  );
}

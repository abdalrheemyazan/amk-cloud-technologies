"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  Clock3,
  FolderOpen,
  LifeBuoy,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categoryFilters,
  type CategoryKey,
  type CustomerKnowledgeArticle,
} from "@/lib/knowledge-base";

const categoryIcons: Record<CategoryKey, typeof BookOpen> = {
  all: BookOpen,
  vpn: Wifi,
  "internet-network": Wifi,
  email: Mail,
  security: ShieldCheck,
  backup: FolderOpen,
  "remote-support": LifeBuoy,
  "user-account": UserRound,
};

type KnowledgeBaseClientProps = {
  articles: CustomerKnowledgeArticle[];
};

export default function KnowledgeBaseClient({ articles }: KnowledgeBaseClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      activeCategory === "all" || article.categoryKey === activeCategory;

    const searchableText = [
      article.title,
      article.summary,
      article.categoryLabel,
      article.tags.join(" "),
      article.symptoms.join(" "),
      article.resolutionSteps.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8" dir="rtl">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[radial-gradient(circle_at_top_right,_rgba(191,219,254,0.85),_rgba(248,250,255,0.95)_42%,_rgba(255,255,255,0.98)_74%)] px-6 py-8 shadow-[0_20px_70px_-34px_rgba(37,99,235,0.35)] sm:px-8">
        <div className="pointer-events-none absolute inset-x-12 top-0 h-32 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-[11px] font-black text-blue-700 shadow-sm">
            <BookOpen className="h-4 w-4" />
            מרכז העזרה של AMK Cloud
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              איך נוכל לעזור לך היום?
            </h1>
            <p className="mx-auto max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
              חפש מדריכים, פתרונות ותשובות נפוצות במאגר הידע של AMK.
            </p>
          </div>

          <div className="w-full max-w-3xl rounded-[1.75rem] border border-white/90 bg-white/90 p-3 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <label className="relative block">
              <Search className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="חפש לפי תקלה, שירות או מילת מפתח..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-[#F8FAFF] pr-[3.25rem] pl-5 text-right text-sm font-medium text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        {categoryFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveCategory(filter.key)}
            className={cn(
              "rounded-full border px-4 py-2.5 text-sm font-bold transition",
              activeCategory === filter.key
                ? "border-blue-200 bg-blue-600 text-white shadow-[0_10px_24px_-14px_rgba(37,99,235,0.9)]"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700",
            )}
          >
            {filter.label}
          </button>
        ))}
      </section>

      {featuredArticles.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">מאמרים מומלצים</h2>
            <p className="mt-1 text-sm text-slate-500">
              הפתרונות שמרבית הלקוחות פותחים קודם.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredArticles.map((article, index) => {
              const Icon = categoryIcons[article.categoryKey];

              return (
                <Link
                  key={article.id}
                  href={`/portal/knowledge-base/${article.slug}`}
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_28px_70px_-38px_rgba(37,99,235,0.35)]"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-blue-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600">
                          {article.categoryLabel}
                        </span>
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold",
                            article.severityTone,
                          )}
                        >
                          {article.severityLabel}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-500">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-black leading-8 text-slate-950 transition group-hover:text-blue-700">
                    {article.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                    {article.summary}
                  </p>

                  <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      {article.readingTime} דקות קריאה
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700">
                      קרא מדריך
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">כל המדריכים</h2>
            <p className="mt-1 text-sm text-slate-500">
              עיין בפתרונות קצרים וברורים לנושאים הנפוצים בפורטל הלקוחות.
            </p>
          </div>
          <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 sm:block">
            {filteredArticles.length} תוצאות
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => {
              const Icon = categoryIcons[article.categoryKey];

              return (
                <Link
                  key={article.id}
                  href={`/portal/knowledge-base/${article.slug}`}
                  className="group flex min-h-[320px] flex-col rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_14px_44px_-34px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_25px_60px_-36px_rgba(37,99,235,0.34)]"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F8FAFF] text-blue-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600">
                        {article.categoryLabel}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px] font-bold",
                        article.severityTone,
                      )}
                    >
                      {article.severityLabel}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-black leading-8 text-slate-950 transition group-hover:text-blue-700">
                      {article.title}
                    </h3>
                    <p className="line-clamp-4 text-sm leading-7 text-slate-600">
                      {article.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                    <div className="space-y-1 text-sm text-slate-500">
                      <div className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {article.readingTime} דקות קריאה
                      </div>
                      <p className="text-xs text-slate-400">עודכן ב-{article.updatedAt}</p>
                    </div>

                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                      <ChevronLeft className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-[0_10px_40px_-35px_rgba(15,23,42,0.45)]">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-950">
                  לא מצאנו מדריך מתאים
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  נסה לחפש במילים אחרות או פתח קריאת שירות ונעזור לך.
                </p>
              </div>
              <Link
                href="/portal/tickets/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_36px_-20px_rgba(37,99,235,0.9)] transition hover:bg-blue-700"
              >
                פתיחת קריאה
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,_#EFF6FF_0%,_#F8FAFF_45%,_#FFFFFF_100%)] p-2 shadow-[0_18px_70px_-42px_rgba(37,99,235,0.35)]">
        <div className="flex flex-col gap-6 rounded-[1.6rem] border border-white/90 bg-white/80 px-6 py-7 backdrop-blur sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
              <LifeBuoy className="h-4 w-4" />
              תמיכה אנושית כשצריך
            </div>
            <h2 className="text-2xl font-black text-slate-950">לא מצאת פתרון?</h2>
            <p className="text-sm leading-7 text-slate-600">
              צוות התמיכה של AMK זמין לעזור לך. פתח קריאת שירות ונחזור אליך
              בהקדם.
            </p>
          </div>

          <Link
            href="/portal/tickets/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_36px_-20px_rgba(37,99,235,0.9)] transition hover:bg-blue-700"
          >
            פתיחת קריאה חדשה
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

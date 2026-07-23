"use client";

import { CheckCircle2, CircleDashed, MessageCircle, PlusCircle } from "lucide-react";

export default function CustomerPortalHero({
  customerName,
  supportAvailable,
  onNewRequest,
  onOpenChat,
}: {
  customerName: string | null;
  supportAvailable: boolean | null;
  onNewRequest: () => void;
  onOpenChat: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] md:p-8">
      <div
        className="pointer-events-none absolute -left-24 -top-28 h-64 w-64 rounded-full bg-blue-500/[0.05] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-blue-600">
            AMK Cloud Technologies
          </p>
          <h1 className="text-2xl font-black text-[#0F172A] md:text-3xl">אזור הלקוח של AMK</h1>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-[#64748B] md:text-base">
            נהל את השירותים שלך, עקוב אחר פניות וקבל תמיכה במקום אחד.
          </p>
          {customerName && (
            <p className="mt-3 text-sm font-bold text-[#0F172A]">שלום, {customerName}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {supportAvailable !== null && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${
                  supportAvailable ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                }`}
              >
                {supportAvailable ? (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <CircleDashed className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {supportAvailable ? "תמיכה זמינה כעת" : "אין נציגים זמינים כרגע"}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              המערכת פעילה
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2.5 sm:flex-row md:items-end">
          <button
            type="button"
            onClick={onNewRequest}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            פתיחת פנייה חדשה
          </button>
          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-black text-[#0F172A] transition-colors hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            צ׳אט תמיכה
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Bot, MessageCircle } from "lucide-react";

export default function CustomerSmartChatCard({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-gradient-to-l from-blue-50 to-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] md:p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-[#0F172A]">העוזר החכם של AMK</h2>
            <p className="mt-1 max-w-lg text-xs font-semibold leading-relaxed text-[#64748B]">
              שאל שאלה טכנית, קבל הכוונה מהירה ובמידת הצורך המשך לנציג תמיכה אנושי.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenChat}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          התחלת צ׳אט
        </button>
      </div>
    </section>
  );
}

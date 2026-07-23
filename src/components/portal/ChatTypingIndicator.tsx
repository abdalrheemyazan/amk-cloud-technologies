"use client";

import { Bot } from "lucide-react";

export default function ChatTypingIndicator({ label = "העוזר מקליד..." }: { label?: string }) {
  return (
    <div className="flex w-full items-end justify-start gap-2.5" dir="ltr" role="status" aria-live="polite">
      <div className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white bg-white text-blue-700 shadow-[0_5px_16px_-8px_rgba(37,99,235,0.7)]">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="rounded-[18px] rounded-bl-[5px] border border-slate-200/90 bg-white px-3.5 py-2.5 shadow-sm" dir="rtl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500">{label}</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"
                style={{ animationDelay: `${index * 140}ms`, animationDuration: "850ms" }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

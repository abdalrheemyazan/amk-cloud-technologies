"use client";

import { ArrowLeft, MessageCircle } from "lucide-react";
import type { MyActiveItem } from "@/lib/actions/support-dashboard-actions";

const INITIAL_VISIBLE = 5;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export default function MyActiveWork({
  items,
  loaded,
  onOpenChat,
  onShowAll,
}: {
  items: MyActiveItem[];
  loaded: boolean;
  onOpenChat: (id: string) => void;
  onShowAll: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
          <h2 className="text-sm font-black text-slate-950">בטיפול שלי</h2>
        </div>
        <button
          type="button"
          onClick={onShowAll}
          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 outline-none hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          הצג הכל
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-2 p-3">
        {loaded && items.length === 0 && (
          <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
            <MessageCircle className="h-7 w-7 text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-xs font-black text-slate-600">אין שיחות פעילות בטיפולך</p>
            <p className="mt-1 max-w-[15rem] text-[10px] leading-4 text-slate-400">
              קבלת פנייה חדשה תנעל אותה עבורך ותציג אותה כאן.
            </p>
          </div>
        )}

        {items.slice(0, INITIAL_VISIBLE).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpenChat(item.id)}
            className="group flex w-full items-center gap-3 rounded-[14px] border border-slate-100 p-2.5 text-right outline-none transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-700">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-xs font-black text-slate-900">
                  {item.customerName || "לקוח/ה"}
                </span>
                {item.awaitingStaff && (
                  <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                    דורש תגובה
                  </span>
                )}
              </span>
              <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-400">
                {item.category || "תמיכה כללית"} · עודכן {formatTime(item.lastActivityAt)}
              </span>
            </span>
            <ArrowLeft
              className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:-translate-x-0.5 group-hover:text-blue-600"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

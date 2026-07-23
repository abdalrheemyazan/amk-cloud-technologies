"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, History } from "lucide-react";
import {
  getRecentClosedChats,
  getSupportConversationDetail,
  type RecentClosedChat,
  type SupportConversationDetail,
} from "@/lib/actions/support-chat-actions";
import StatusBadge from "./StatusBadge";
import HistoryConversationModal from "./HistoryConversationModal";

const LOAD_ERROR = "לא ניתן לטעון את השיחה כרגע. נסה שוב בעוד מספר רגעים.";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function SessionHistorySection() {
  const [items, setItems] = useState<RecentClosedChat[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    getRecentClosedChats().then((result) => {
      if (result.ok) setItems(result.data);
      setLoaded(true);
    });
  }, []);

  async function openConversation(id: string) {
    setOpenId(id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    const result = await getSupportConversationDetail(id);
    if (result.ok) {
      setDetail(result.data);
    } else {
      setDetailError(LOAD_ERROR);
    }
    setDetailLoading(false);
  }

  function closeConversation() {
    setOpenId(null);
    setDetail(null);
    setDetailError(null);
  }

  if (loaded && items.length === 0) {
    return (
      <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-10 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F4F7FB] text-[#94A3B8] flex items-center justify-center">
          <History className="w-5.5 h-5.5" />
        </div>
        <p className="text-sm text-[#94A3B8] font-semibold">אין שיחות להצגה ב־7 הימים האחרונים.</p>
      </section>
    );
  }

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-5">
      <p className="text-xs text-[#94A3B8] font-semibold mb-4">מוצגות שיחות מ-7 הימים האחרונים בלבד.</p>
      <div className="divide-y divide-[#E2E8F0]">
        {items.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`פתיחת שיחה עם ${item.customerName ?? "לקוח"}`}
            onClick={() => openConversation(item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openConversation(item.id);
              }
            }}
            className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-3 outline-none transition-colors hover:bg-blue-50/60 focus-visible:bg-blue-50/60 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="min-w-0">
              <p className="text-sm font-black text-[#0F172A] transition-colors group-hover:text-blue-700">
                {item.customerName ?? "לקוח"}
              </p>
              <p className="text-[11px] text-[#94A3B8] font-semibold">
                {item.category ?? "כללי"} · נפתח {formatTime(item.createdAt)}
                {item.closedAt && ` · נסגר ${formatTime(item.closedAt)}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={item.status} />
              <span className="hidden items-center gap-1 text-[11px] font-black text-blue-600 sm:flex">
                צפייה בשיחה
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {openId && (
        <HistoryConversationModal
          loading={detailLoading}
          error={detailError}
          detail={detail}
          onClose={closeConversation}
        />
      )}
    </section>
  );
}

"use client";

import { Users, MessageSquare } from "lucide-react";
import type { ActiveChat } from "@/lib/actions/support-chat-actions";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export default function CustomersInTreatmentSection({
  activeChats,
  onOpenChat,
}: {
  activeChats: ActiveChat[];
  onOpenChat: (id: string) => void;
}) {
  if (activeChats.length === 0) {
    return (
      <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-10 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F4F7FB] text-[#94A3B8] flex items-center justify-center">
          <Users className="w-5.5 h-5.5" />
        </div>
        <p className="text-sm text-[#94A3B8] font-semibold">אין לקוחות בטיפול כרגע</p>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeChats.map((chat) => (
        <div
          key={chat.id}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]"
        >
          <p className="font-black text-sm text-[#0F172A] mb-1">{chat.customerName ?? "לקוח"}</p>
          {chat.customerEmail && <p className="text-xs text-[#94A3B8] font-semibold mb-2" dir="ltr">{chat.customerEmail}</p>}
          {chat.category && (
            <span className="inline-block text-[11px] font-bold text-blue-600 bg-[#EFF6FF] rounded-full px-2.5 py-0.5 mb-3">
              {chat.category}
            </span>
          )}
          <p className="text-[11px] text-[#94A3B8] font-semibold mb-3">נפתח בשעה {formatTime(chat.createdAt)}</p>
          <button
            onClick={() => onOpenChat(chat.id)}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-2 text-xs font-black transition-all shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            פתיחת שיחה
          </button>
        </div>
      ))}
    </div>
  );
}

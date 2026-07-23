"use client";

import { ArrowLeft } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { ActiveChat, PendingChatRequest } from "@/lib/actions/support-chat-actions";
import type { AgentSectionKey } from "@/lib/agent-workspace-sections";

export default function AgentDashboardOverview({
  latestPending,
  latestActive,
  onNavigate,
}: {
  latestPending: PendingChatRequest | null;
  latestActive: ActiveChat | null;
  onNavigate: (section: AgentSectionKey) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-[#0F172A]">הבקשה החדשה האחרונה</h2>
            <button
              onClick={() => onNavigate("new-requests")}
              className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors"
            >
              לכל הבקשות
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          {latestPending ? (
            <div className="border border-[#E2E8F0] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-black text-sm text-[#0F172A]">{latestPending.customerName ?? "לקוח"}</span>
                <StatusBadge status="PENDING" />
              </div>
              {latestPending.category && (
                <span className="inline-block text-[11px] font-bold text-blue-600 bg-[#EFF6FF] rounded-full px-2.5 py-0.5">
                  {latestPending.category}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#94A3B8] font-semibold text-center py-6">אין בקשות ממתינות כרגע</p>
          )}
        </section>

        <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-[#0F172A]">השיחה הפעילה האחרונה</h2>
            <button
              onClick={() => onNavigate("active-chats")}
              className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors"
            >
              לכל השיחות
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          {latestActive ? (
            <div className="border border-[#E2E8F0] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-black text-sm text-[#0F172A]">{latestActive.customerName ?? "לקוח"}</span>
                <StatusBadge status="ACTIVE" />
              </div>
              {latestActive.category && (
                <span className="inline-block text-[11px] font-bold text-blue-600 bg-[#EFF6FF] rounded-full px-2.5 py-0.5">
                  {latestActive.category}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#94A3B8] font-semibold text-center py-6">אין שיחות פעילות</p>
          )}
        </section>
      </div>
    </div>
  );
}

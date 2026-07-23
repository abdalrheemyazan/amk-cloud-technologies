"use client";

import { Clock3, Inbox, MessageSquare, CheckCheck } from "lucide-react";
import type { AgentMetrics } from "@/lib/actions/support-chat-actions";

export default function SupportMetrics({ metrics }: { metrics: AgentMetrics | null }) {
  const tiles = [
    { label: "בקשות ממתינות", value: metrics?.pendingCount ?? 0, icon: Inbox },
    { label: "שיחות פעילות", value: metrics?.activeCount ?? 0, icon: MessageSquare },
    {
      label: "זמן תגובה ממוצע",
      value: `${metrics?.avgResponseMinutes ?? 0} דק׳`,
      icon: Clock3,
    },
    { label: "שיחות שנסגרו היום", value: metrics?.closedTodayCount ?? 0, icon: CheckCheck },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-blue-600 flex items-center justify-center shrink-0">
            <tile.icon className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-black text-[#0F172A] leading-none">{tile.value}</div>
            <div className="text-[11px] text-[#64748B] font-bold mt-1 truncate">{tile.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

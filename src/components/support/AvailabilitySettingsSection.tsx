"use client";

import AgentStatusControl from "./AgentStatusControl";
import type { AgentStatus } from "@/lib/support-types";

const STATUS_DESCRIPTIONS: { status: AgentStatus; label: string; description: string }[] = [
  { status: "AVAILABLE", label: "זמין", description: "תוכל לקבל בקשות צ׳אט חדשות מלקוחות." },
  { status: "BUSY", label: "עסוק", description: "לא תופיע כזמין ללקוחות חדשים, אך תמשיך לטפל בשיחות הפתוחות שלך." },
  { status: "OFFLINE", label: "לא זמין", description: "לא תופיע כלל כנציג זמין, ולא תקבל בקשות חדשות." },
];

export default function AvailabilitySettingsSection({
  status,
  onChange,
}: {
  status: AgentStatus;
  onChange: (status: AgentStatus) => void;
}) {
  return (
    <div className="space-y-5">
      <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-5">
        <h2 className="text-sm font-black text-[#0F172A] mb-4">סטטוס נוכחי</h2>
        <AgentStatusControl status={status} onChange={onChange} />
      </section>

      <section className="bg-white border border-[#E2E8F0] rounded-[20px] divide-y divide-[#E2E8F0]">
        {STATUS_DESCRIPTIONS.map((item) => (
          <div key={item.label} className="p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-[#0F172A]">{item.label}</p>
              <p className="text-xs text-[#64748B] font-semibold mt-1 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

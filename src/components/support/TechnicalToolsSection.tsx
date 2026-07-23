"use client";

import { ServerCog, Activity, ShieldCheck, Terminal } from "lucide-react";

const TOOLS = [
  { key: "server-status", label: "בדיקת סטטוס שרתים", icon: ServerCog },
  { key: "remote-diag", label: "כלי אבחון מרחוק", icon: Activity },
  { key: "security-scan", label: "סריקת אבטחה בסיסית", icon: ShieldCheck },
  { key: "cli-tools", label: "כלי שורת פקודה", icon: Terminal },
];

export default function TechnicalToolsSection() {
  return (
    <div>
      <p className="text-sm text-[#64748B] font-semibold mb-5">
        כלים טכניים לשימוש הצוות. הכלים בהמשך הם placeholder ויחוברו למערכות בפועל בהמשך הפיתוח.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((tool) => (
          <div
            key={tool.key}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] opacity-70"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F7FB] text-[#94A3B8] flex items-center justify-center shrink-0">
              <tool.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-[#0F172A]">{tool.label}</p>
              <p className="text-[11px] text-[#94A3B8] font-semibold">יתווסף בהמשך</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

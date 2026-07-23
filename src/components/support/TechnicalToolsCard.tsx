import { Terminal, Wifi, Server, HardDrive, Globe, Link2 } from "lucide-react";
import ComingSoonButton from "./ComingSoonButton";

const TOOLS = [
  { label: "בדיקת חיבור", icon: Wifi },
  { label: "בדיקת VPN", icon: Terminal },
  { label: "בדיקת שרת", icon: Server },
  { label: "בדיקת גיבוי", icon: HardDrive },
  { label: "בדיקת DNS", icon: Globe },
  { label: "שליחת קישור תמיכה מרחוק", icon: Link2 },
];

export default function TechnicalToolsCard() {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-1 flex items-center gap-2">
        <Terminal className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">כלים טכניים</h2>
      </div>
      <p className="mb-4 text-xs text-[#64748B]">בדיקות מהירות וכלי אבחון עבור הטיפול השוטף.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TOOLS.map((tool) => (
          <div key={tool.label} className="relative">
            <ComingSoonButton
              label={tool.label}
              icon={<tool.icon className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />}
              message="הכלי יתווסף בהמשך"
              fullWidth
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-4 text-center text-xs font-semibold text-[#334155] transition-colors hover:border-[#CBD5E1]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

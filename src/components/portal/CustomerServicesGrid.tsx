import Link from "next/link";
import { Cloud, HardDrive, PlusCircle, Server, ShieldCheck } from "lucide-react";
import CustomerPortalEmptyState from "./CustomerPortalEmptyState";
import CustomerPortalPageShell from "./CustomerPortalPageShell";

const SERVICE_TYPES = [
  { icon: Cloud, label: "ענן ושרתים", text: "מצב השירות ופרטי הסביבה" },
  { icon: HardDrive, label: "גיבוי ושחזור", text: "כיסוי, תדירות ונקודת שחזור" },
  { icon: ShieldCheck, label: "אבטחה וניטור", text: "הגנות פעילות והתראות שירות" },
];

export default function CustomerServicesGrid() {
  return (
    <CustomerPortalPageShell
      title="השירותים שלי"
      description="תמונת מצב מרוכזת של שירותי הענן, הגיבוי, האבטחה והתשתיות שלך."
      eyebrow="קטלוג שירות אישי"
      icon={Server}
      tone="cyan"
      badge="לפי החשבון שלך"
      actions={
        <Link
          href="/portal/contact"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-cyan-700"
        >
          <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
          בירור שירות
        </Link>
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <CustomerPortalEmptyState
          icon={Server}
          title="אין שירותים פעילים להצגה כרגע"
          description="לאחר הפעלת שירות אצל AMK הוא יופיע כאן עם סטטוס, פרטים ופעולות רלוונטיות."
          action={{ label: "יצירת קשר בנושא שירות", href: "/portal/contact" }}
        />

        <aside className="rounded-[20px] border border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">מפת השירות</p>
          <h2 className="mt-2 text-sm font-black">מה יוצג בכרטיס שירות?</h2>
          <div className="mt-4 space-y-4">
            {SERVICE_TYPES.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.label} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-black">{service.label}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{service.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/portal/new-request" className="mt-5 inline-flex text-[11px] font-black text-cyan-300 hover:text-cyan-200">
            פתיחת פנייה טכנית לשירות קיים
          </Link>
        </aside>
      </div>
    </CustomerPortalPageShell>
  );
}

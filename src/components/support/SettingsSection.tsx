"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Settings, Bell, Monitor } from "lucide-react";
import TechnicianStatusSelector, { type TechnicianStatusValue } from "./TechnicianStatusSelector";
import { updateEmailNotifications } from "@/lib/actions/note-actions";

export default function SettingsSection({
  status,
  onStatusChange,
  initialEmailNotifications,
}: {
  status: TechnicianStatusValue;
  onStatusChange: (value: TechnicianStatusValue) => void;
  initialEmailNotifications: boolean;
}) {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !emailNotifications;
    setEmailNotifications(next);
    startTransition(async () => {
      const result = await updateEmailNotifications(next);
      if (!result.ok) {
        setEmailNotifications(!next);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-center gap-2">
        <Settings className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">הגדרות</h2>
      </div>

      <div className="flex flex-col divide-y divide-[#E2E8F0]">
        <div className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-bold text-[#0F172A]">מצב טכנאי</p>
            <p className="mt-0.5 text-xs text-[#64748B]">הסטטוס מוצג בראש המסך ובתפריט הצד.</p>
          </div>
          <TechnicianStatusSelector value={status} onChange={onStatusChange} />
        </div>

        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-2.5">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-[#0F172A]">התראות במייל</p>
              <p className="mt-0.5 text-xs text-[#64748B]">קבלת עדכונים על משימות חדשות בדוא&quot;ל.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailNotifications}
            disabled={isPending}
            onClick={handleToggle}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
              emailNotifications ? "bg-[#2563EB]" : "bg-[#E2E8F0]"
            } disabled:opacity-60`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                emailNotifications ? "right-0.5" : "right-5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-2.5">
            <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-[#0F172A]">תצוגה</p>
              <p className="mt-0.5 text-xs text-[#64748B]">בחירת ערכת נושא לממשק העבודה.</p>
            </div>
          </div>
          <span className="rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#94A3B8]">
            יתווסף בהמשך
          </span>
        </div>
      </div>
    </section>
  );
}

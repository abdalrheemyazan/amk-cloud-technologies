import { ShieldCheck } from "lucide-react";

export default function SlaCompactCard() {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">מעקב SLA</h2>
      </div>

      <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5">
        <p className="text-sm font-semibold text-[#0F172A]">אין חריגות SLA כרגע</p>
        <p className="mt-1 text-xs text-[#94A3B8]">כל הקריאות נמצאות בטווח הטיפול התקין.</p>
      </div>
    </section>
  );
}

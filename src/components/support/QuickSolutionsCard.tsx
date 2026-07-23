import { Lightbulb } from "lucide-react";

const TOPICS = ["איפוס סיסמה", "תקלות VPN", "גישה מרחוק", "שרת לא מגיב", "גיבוי נכשל", "בעיות התחברות"];

export default function QuickSolutionsCard() {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-1 flex items-center gap-2">
        <Lightbulb className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">פתרונות מהירים</h2>
      </div>
      <p className="mb-3 text-xs text-[#64748B]">גישה מהירה לפתרונות נפוצים עבור הטיפול השוטף.</p>

      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#334155]"
          >
            {topic}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[11px] font-medium text-[#94A3B8]">יתווסף בהמשך</p>
    </section>
  );
}

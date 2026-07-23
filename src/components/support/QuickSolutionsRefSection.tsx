"use client";

import { CHATBOT_CATEGORIES } from "@/lib/chatbot-categories";

export default function QuickSolutionsRefSection() {
  return (
    <div>
      <p className="text-sm text-[#64748B] font-semibold mb-5">
        פתרונות כלליים ומהירים לפי תחום, זהים לתשובות שהצ׳אט החכם מציע ללקוחות — שימושי כרקע לפני מתן מענה אישי.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHATBOT_CATEGORIES.map((category) => (
          <div key={category.key} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-black text-blue-600 mb-1.5">{category.label}</p>
            <p className="text-sm text-[#334155] font-medium leading-relaxed">{category.reply}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

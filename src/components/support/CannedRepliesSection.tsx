"use client";

import { getPersonalSupportReplies, type SupportAgentProfile } from "@/lib/support-profile";
import { CANNED_REPLIES } from "@/lib/canned-replies";

export default function CannedRepliesSection({
  agentName,
  profile,
}: {
  agentName: string | null;
  profile?: SupportAgentProfile;
}) {
  const replies = profile
    ? getPersonalSupportReplies(profile, agentName)
    : CANNED_REPLIES.map((reply) => ({
        key: reply.key,
        label: reply.label,
        text: reply.getText(agentName),
      }));

  return (
    <div>
      <p className="text-sm text-[#64748B] font-semibold mb-5">
        רשימת תגובות מוכנות לעיון. ניתן להשתמש בהן ישירות מתוך חלון השיחה הפעילה — לחיצה על תגובה תכניס אותה
        לתיבת ההודעה, ותוכל לערוך או לשלוח אותה משם.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {replies.map((reply) => (
          <div key={reply.key} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-black text-blue-600 mb-1.5">{reply.label}</p>
            <p className="text-sm text-[#334155] font-medium leading-relaxed">{reply.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

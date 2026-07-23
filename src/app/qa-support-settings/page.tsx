"use client";

import PersonalAgentSettingsSection from "@/components/support/PersonalAgentSettingsSection";
import type { SupportAgentProfile } from "@/lib/support-profile";

const profile: SupportAgentProfile = {
  name: "נועה לוי",
  displayName: "נועה מצוות התמיכה",
  email: "support@amk.systems",
  role: "SUPPORT_AGENT",
  roleLabel: "נציגת תמיכה",
  phone: "03-5551234",
  department: "Service Desk",
  specialty: "Microsoft 365, רשתות ו־VPN",
  supportLanguages: ["עברית", "אנגלית"],
  openingMessage: "שלום, כאן {agentName} מצוות התמיכה של AMK Cloud Technologies. אשמח לעזור לך.",
  detailsRequest: "כדי שנוכל לבדוק את התקלה, אשמח לקבל צילום מסך ותיאור קצר.",
  waitingMessage: "אני בודקת את הנושא כעת. אעדכן אותך בעוד מספר רגעים.",
  closingMessage: "שמחתי לעזור. אם הבעיה חוזרת, ניתן לפנות אלינו שוב בכל עת.",
  maxActiveChats: 3,
  defaultAvailabilityStatus: "AVAILABLE",
  autoAwayMinutes: 30,
  newRequestNotifications: true,
  profileImageUrl: null,
};

export default function QualityAssurancePreview() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F4F7FB] p-6">
      <div className="mx-auto max-w-[1400px]">
        <PersonalAgentSettingsSection
          profile={profile}
          currentStatus="AVAILABLE"
          onProfileUpdated={() => undefined}
        />
      </div>
    </main>
  );
}

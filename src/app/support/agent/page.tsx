import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import TeamSupportAgentWorkspace from "@/components/support/TeamSupportAgentWorkspace";
import { getSupportProfileById } from "@/lib/support-profile-data";
import { ROLE_LABELS } from "@/lib/support-labels";
import { SUPPORT_TEMPLATE_DEFAULTS, type SupportAgentProfile } from "@/lib/support-profile";

export const metadata: Metadata = {
  title: "עמדת נציג תמיכה | AMK Cloud Technologies",
  description: "ניהול בקשות צ׳אט, שיחות פעילות ומתן מענה ללקוחות בזמן אמת.",
};

export default async function SupportAgentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!isStaffRole(session.user.role)) {
    redirect("/portal");
  }

  const supportProfile = await getSupportProfileById(session.user.id as string);
  const fallbackProfile: SupportAgentProfile = {
    name: session.user.name ?? "",
    displayName: session.user.name ?? "",
    email: session.user.email ?? "",
    role: session.user.role ?? "SUPPORT_AGENT",
    roleLabel: ROLE_LABELS[session.user.role ?? "SUPPORT_AGENT"] ?? "נציג תמיכה",
    phone: "",
    department: "",
    specialty: "",
    supportLanguages: [],
    openingMessage: SUPPORT_TEMPLATE_DEFAULTS.openingMessage,
    detailsRequest: SUPPORT_TEMPLATE_DEFAULTS.detailsRequest,
    waitingMessage: SUPPORT_TEMPLATE_DEFAULTS.waitingMessage,
    closingMessage: SUPPORT_TEMPLATE_DEFAULTS.closingMessage,
    maxActiveChats: 3,
    defaultAvailabilityStatus: "AVAILABLE",
    autoAwayMinutes: 30,
    newRequestNotifications: true,
    profileImageUrl: null,
  };

  return (
    <TeamSupportAgentWorkspace
      agentName={session.user.name ?? null}
      userRole={session.user.role ?? null}
      initialProfile={supportProfile ?? fallbackProfile}
    />
  );
}

import type { AgentStatus } from "@/lib/support-types";

export const SUPPORT_LANGUAGE_OPTIONS = ["עברית", "אנגלית", "ערבית", "רוסית"] as const;

export const SUPPORT_TEMPLATE_DEFAULTS = {
  openingMessage:
    "שלום, כאן {agentName} מצוות התמיכה של AMK Cloud Technologies. אשמח לעזור לך.",
  detailsRequest:
    "כדי שנוכל לבדוק את התקלה, אשמח לקבל צילום מסך ותיאור קצר של הפעולה שביצעת לפני הופעת הבעיה.",
  waitingMessage: "אני בודק את הנושא כעת. אעדכן אותך בעוד מספר רגעים.",
  closingMessage:
    "שמחתי לעזור. אם הבעיה חוזרת, ניתן לפנות אלינו שוב בכל עת. המשך יום נעים.",
} as const;

export type SupportAgentProfile = {
  name: string;
  displayName: string;
  email: string;
  role: string;
  roleLabel: string;
  phone: string;
  department: string;
  specialty: string;
  supportLanguages: string[];
  openingMessage: string;
  detailsRequest: string;
  waitingMessage: string;
  closingMessage: string;
  maxActiveChats: number;
  defaultAvailabilityStatus: AgentStatus;
  autoAwayMinutes: number | null;
  newRequestNotifications: boolean;
  profileImageUrl: string | null;
};

export type SupportAgentProfileInput = Omit<
  SupportAgentProfile,
  "email" | "role" | "roleLabel" | "profileImageUrl"
> & {
  removeProfileImage: boolean;
  profileImageDataUrl?: string | null;
};

export function applyAgentName(template: string, agentName: string | null | undefined) {
  return template.replaceAll("{agentName}", agentName?.trim() || "נציג/ת תמיכה");
}

export type SupportReplyOption = { key: string; label: string; text: string };

export function getPersonalSupportReplies(
  profile: Pick<
    SupportAgentProfile,
    "openingMessage" | "detailsRequest" | "waitingMessage" | "closingMessage"
  >,
  agentName: string | null | undefined,
): SupportReplyOption[] {
  return [
    { key: "greeting", label: "ברכת פתיחה", text: applyAgentName(profile.openingMessage, agentName) },
    { key: "more-details", label: "בקשת פרטים נוספים", text: applyAgentName(profile.detailsRequest, agentName) },
    { key: "please-wait", label: "בקשת המתנה", text: applyAgentName(profile.waitingMessage, agentName) },
    { key: "closing", label: "סיכום וסגירת שיחה", text: applyAgentName(profile.closingMessage, agentName) },
  ];
}

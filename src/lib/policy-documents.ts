export type PolicyDocumentKey = "privacy" | "terms" | "cancellation-policy" | "refund-policy";

export type PolicyDocumentTone = "privacy" | "terms" | "cancellation" | "refund";

export type PolicyDocumentDefinition = {
  key: PolicyDocumentKey;
  title: string;
  shortTitle: string;
  description: string;
  eyebrow: string;
  publicHref: string;
  portalHref: string;
  tone: PolicyDocumentTone;
  updatedAt: string;
  toc: { id: string; label: string }[];
};

export const POLICY_DOCUMENT_ORDER: PolicyDocumentKey[] = [
  "privacy",
  "terms",
  "cancellation-policy",
  "refund-policy",
];

export const POLICY_DOCUMENTS: Record<PolicyDocumentKey, PolicyDocumentDefinition> = {
  privacy: {
    key: "privacy",
    title: "מדיניות פרטיות",
    shortTitle: "פרטיות",
    description:
      "כיצד AMK Cloud Technologies אוספת, משתמשת ושומרת מידע אישי במסגרת האתר ומערכת התמיכה.",
    eyebrow: "פרטיות ואבטחת מידע",
    publicHref: "/privacy",
    portalHref: "/portal/documents?policy=privacy",
    tone: "privacy",
    updatedAt: "23 ביולי 2026",
    toc: [
      { id: "collected-info", label: "מידע שאנו אוספים" },
      { id: "purposes", label: "מטרות השימוש במידע" },
      { id: "retention", label: "שמירת שיחות תמיכה" },
      { id: "third-parties", label: "שיתוף מידע" },
      { id: "cookies", label: "Cookies" },
      { id: "security", label: "אבטחת מידע" },
      { id: "rights", label: "זכויות המשתמש" },
      { id: "contact", label: "יצירת קשר" },
    ],
  },
  terms: {
    key: "terms",
    title: "תנאי שימוש",
    shortTitle: "תנאי שימוש",
    description: "התנאים המסדירים את השימוש באתר, במערכת התמיכה ובשירותי AMK Cloud Technologies.",
    eyebrow: "כללי שימוש ושירות",
    publicHref: "/terms",
    portalHref: "/portal/documents?policy=terms",
    tone: "terms",
    updatedAt: "23 ביולי 2026",
    toc: [
      { id: "acceptance", label: "קבלת התנאים" },
      { id: "service-description", label: "תיאור השירות" },
      { id: "permitted-use", label: "שימוש מותר" },
      { id: "chatbot-disclaimer", label: "סיוע חכם" },
      { id: "human-support", label: "תמיכה אנושית" },
      { id: "user-responsibility", label: "אחריות המשתמש" },
      { id: "liability", label: "הגבלת אחריות" },
      { id: "changes", label: "שינויים בשירות" },
      { id: "governing-law", label: "דין וסמכות" },
    ],
  },
  "cancellation-policy": {
    key: "cancellation-policy",
    title: "מדיניות ביטולים",
    shortTitle: "ביטולים",
    description:
      "עקרונות לביטול שירותים, בכפוף לסוג השירות, להסכם ההתקשרות ולהוראות הדין.",
    eyebrow: "ביטול והפסקת שירות",
    publicHref: "/cancellation-policy",
    portalHref: "/portal/documents?policy=cancellation-policy",
    tone: "cancellation",
    updatedAt: "23 ביולי 2026",
    toc: [
      { id: "scope", label: "תחולת המדיניות" },
      { id: "request", label: "הגשת בקשת ביטול" },
      { id: "timeline", label: "מועד כניסת הביטול" },
      { id: "exceptions", label: "חריגים ומגבלות" },
      { id: "service-terms", label: "תנאי השירות והדין" },
      { id: "clarification", label: "בירור לפני ביטול" },
    ],
  },
  "refund-policy": {
    key: "refund-policy",
    title: "מדיניות החזרים",
    shortTitle: "החזרים",
    description:
      "עקרונות לבחינת החזרים וזיכויים בהתאם לשירות שנרכש, לתנאי העסקה ולהוראות הדין.",
    eyebrow: "זיכויים והחזרים",
    publicHref: "/refund-policy",
    portalHref: "/portal/documents?policy=refund-policy",
    tone: "refund",
    updatedAt: "23 ביולי 2026",
    toc: [
      { id: "eligibility", label: "בחינת זכאות" },
      { id: "non-refundable", label: "מקרים שאינם מזכים" },
      { id: "delivered-service", label: "שירות שכבר סופק" },
      { id: "review", label: "תהליך אישור" },
      { id: "method", label: "אופן ומועד ההחזר" },
      { id: "clarification", label: "בירור בנושא החזר" },
    ],
  },
};

export function isPolicyDocumentKey(value: string | null | undefined): value is PolicyDocumentKey {
  return !!value && Object.prototype.hasOwnProperty.call(POLICY_DOCUMENTS, value);
}

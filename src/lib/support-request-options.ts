export const RELATED_SERVICE_OPTIONS = [
  "VPS ושרתים",
  "שירותי ענן",
  "VPN וגישה מאובטחת",
  "גיבוי ושחזור מידע",
  "תמיכה מרחוק",
  "דוא״ל אלקטרוני",
  "אבטחת מידע",
  "אתרים ואחסון",
] as const;

export type RequestUrgency = "LOW" | "MEDIUM" | "HIGH";

export const URGENCY_OPTIONS: { value: RequestUrgency; label: string }[] = [
  { value: "LOW", label: "נמוכה" },
  { value: "MEDIUM", label: "בינונית" },
  { value: "HIGH", label: "גבוהה" },
];

export const URGENCY_LABELS: Record<RequestUrgency, string> = {
  LOW: "נמוכה",
  MEDIUM: "בינונית",
  HIGH: "גבוהה",
};

export function isRequestUrgency(value: string): value is RequestUrgency {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH";
}

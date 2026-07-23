export const STATUS_LABELS: Record<string, string> = {
  OPEN: "חדש",
  IN_PROGRESS: "בטיפול",
  WAITING_CUSTOMER: "ממתינה ללקוח",
  RESOLVED: "הושלם",
  CLOSED: "נסגר",
  CANCELLED: "בוטל",
};

export const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-100",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-100",
  WAITING_CUSTOMER: "bg-slate-100 text-slate-600 border-slate-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-100",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "נמוכה",
  MEDIUM: "בינונית",
  HIGH: "גבוהה",
  URGENT: "דחוף ביותר",
};

export const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-100",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
  HIGH: "bg-red-50 text-red-700 border-red-100",
  URGENT: "bg-red-100 text-red-800 border-red-200",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATOR: "מנהל מערכת",
  SUPPORT_AGENT: "נציג תמיכה",
  TECHNICIAN: "טכנאי",
  TEAM_LEADER: "ראש צוות",
  CLOUD_ENGINEER: "מהנדס ענן",
  CUSTOMER: "לקוח",
};

export function ticketDisplayId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function relativeTimeFromNow(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "עכשיו";
  if (diffMin < 60) return `לפני ${diffMin} דקות`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `לפני ${diffHours} שעות`;

  const diffDays = Math.floor(diffHours / 24);
  return `לפני ${diffDays} ימים`;
}

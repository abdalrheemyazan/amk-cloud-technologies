export function getTicketStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    OPEN: "פתוחה",
    IN_PROGRESS: "בטיפול",
    RESOLVED: "נפתרה",
    CLOSED: "סגורה",
    CANCELLED: "בוטלה",
  };
  return statusMap[status] || status;
}

export function getTicketStatusBadgeClass(status: string): string {
  const colorMap: Record<string, string> = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-50 text-slate-600 border-slate-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return colorMap[status] || "bg-slate-100 text-slate-700 border-slate-200";
}

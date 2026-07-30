import "server-only";

// Deterministic, server-side priority classifier for customer support requests.
//
// It judges *technical/business impact*, never the customer's urgency wording:
// words like "דחוף", "בהול", "חשוב מאוד", "מיד" are deliberately NOT signals.
// Pure and synchronous — no I/O, no Gemini — so submission stays fast and never
// depends on it. The caller still wraps it and falls back to MEDIUM on any error.

export type ClassifiedPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PriorityClassification = {
  priority: ClassifiedPriority;
  confidence: number;
  reasons: string[];
};

export type ClassifyPriorityInput = {
  title?: string | null;
  description?: string | null;
  category?: string | null;
  os?: string | null;
  browser?: string | null;
  device?: string | null;
  attachmentsCount?: number;
};

// --- CRITICAL: broad outage / security / data loss -------------------------
const ALL_SCOPE =
  /(כל ה?שרת|כל השרתים|שרתי החברה|כל המשתמשים|כל העובדים|אף עובד|אף אחד לא|כל החברה|לכל החברה|לכל העובדים|כל המערכ|all users|entire company|company[- ]?wide)/i;
const OUTAGE =
  /(לא עובד|לא עובדים|לא עובדת|נפל|נפלו|מושבת|מושבתת|קרס|קרסו|אין גישה|לא זמין|לא מגיב|down|offline|outage)/i;
const TOTAL_SHUTDOWN =
  /(מושבת(?:ת)? לחלוטין|השבתה מלאה|הכל מושבת|completely down|total(?:ly)? (?:down|unavailable))/i;
const SECURITY =
  /(פריצה|נפרצנו|נפרץ|נפרצה|חדירה|גישה לא מורשית|גישה בלתי מורשית|דלף מידע|דליפת מידע|הודלף|hacked|breach|unauthorized access)/i;
const RANSOMWARE =
  /(כופר(?:ה)?|ransomware|קבצים מוצפנים|הצפנת (?:ה)?קבצים|נעל(?:ו)? את הקבצים)/i;
const DATA_LOSS =
  /(מידע נמחק|נמחקו הנתונים|נמחק המידע|נמחקו הקבצים|אובדן מידע|נעלמו הנתונים|data loss|deleted data)/i;
const BACKUP_FAILURE =
  /(שחזור נכשל|גיבוי נכשל|כשל בשחזור|כשל בגיבוי|failed (?:backup|restore)|backup failure)/i;

// --- HIGH: key service blocked / multiple users / repeated failures --------
const KEY_SERVICE =
  /(vpn|אימייל|דוא["״'`]?ל|מייל|email|שרת|server|אחסון|hosting|מארח|remote|גישה מרחוק)/i;
const ACCESS_BLOCKED =
  /(לא מצליח להתחבר|לא ניתן להתחבר|לא מתחבר|אין גישה|חסום|חסומה|נחסם|blocked|לא עובד|נפל|down)/i;
const MULTI_USER =
  /(כמה משתמשים|מספר משתמשים|כמה עובדים|צוות שלם|כל הצוות|מחלקה שלמה|several users|multiple users)/i;
const REPEATED_FAILURE =
  /(לא ניתן לעבוד|משבש את העבודה|חוזר שוב ושוב|כל הזמן נופל|שוב ושוב|repeatedly|keeps? failing)/i;

// --- LOW: questions / info / feature / minor visual ------------------------
const QUESTION =
  /(איך |כיצד|רוצה לדעת|אשמח לדעת|שאלה|האם אפשר|האם ניתן|מה זה|מהו|how (?:to|do i)|question)/i;
const FEATURE =
  /(בקשת פיצ["׳']?ר|פיצ["׳']?ר|feature request|הצעה לשיפור|אשמח אם|would be nice)/i;
const MINOR_VISUAL =
  /(תמונת פרופיל|אווטאר|avatar|צבע|עיצוב|פונט|font|theme|לוגו|כותרת|cosmetic)/i;

// --- MEDIUM: degraded / partial / configuration ----------------------------
const PERFORMANCE =
  /(איט(?:י|ית|יות)|לאט|תקוע|נתקע|slow|lag|מדי פעם|לפעמים|קצת)/i;
const PARTIAL =
  /(עובד חלקית|לא תמיד עובד|לסירוגין|חלק מהזמן|partially)/i;
const CONFIG =
  /(הגדר(?:ה|ות)|להגדיר|config|קונפיגור|עזרה בהתקנה|להתקין|התקנה|עדכון גרסה|setup)/i;

function test(re: RegExp, text: string): boolean {
  return re.test(text);
}

export function classifyRequestPriority(input: ClassifyPriorityInput): PriorityClassification {
  const text = [input.title, input.description, input.category, input.os, input.browser, input.device]
    .filter(Boolean)
    .join(" \n ")
    .toLocaleLowerCase("he");

  // 1) CRITICAL — real broad impact, security, or data loss (impact, not wording).
  const criticalReasons: string[] = [];
  if ((test(ALL_SCOPE, text) && test(OUTAGE, text)) || test(TOTAL_SHUTDOWN, text)) {
    criticalReasons.push("השבתה רחבת היקף המשפיעה על כלל המשתמשים/החברה");
  }
  if (test(SECURITY, text)) criticalReasons.push("חשד לאירוע אבטחה / גישה לא מורשית");
  if (test(RANSOMWARE, text)) criticalReasons.push("חשד לכופרה או להצפנת קבצים");
  if (test(DATA_LOSS, text)) criticalReasons.push("אובדן מידע פעיל");
  if (test(BACKUP_FAILURE, text)) criticalReasons.push("כשל בגיבוי/שחזור");
  if (criticalReasons.length > 0) {
    return { priority: "CRITICAL", confidence: 0.85, reasons: criticalReasons };
  }

  // 2) HIGH — key service blocked, several users, or work-blocking repeats.
  const highReasons: string[] = [];
  if (test(KEY_SERVICE, text) && test(ACCESS_BLOCKED, text)) {
    highReasons.push("חסימת גישה לשירות מרכזי (VPN/דוא\"ל/שרת/אחסון)");
  }
  if (test(MULTI_USER, text)) highReasons.push("פגיעה במספר משתמשים / צוות");
  if (test(REPEATED_FAILURE, text)) highReasons.push("תקלה חוזרת המשבשת את העבודה");
  if (highReasons.length > 0) {
    return { priority: "HIGH", confidence: 0.78, reasons: highReasons };
  }

  // 3) LOW — questions, feature requests, minor visual/settings (before MEDIUM).
  const lowReasons: string[] = [];
  if (test(QUESTION, text)) lowReasons.push("שאלה או בקשת מידע");
  if (test(FEATURE, text)) lowReasons.push("בקשת פיצ'ר או הצעה לשיפור");
  if (test(MINOR_VISUAL, text)) lowReasons.push("שינוי חזותי/הגדרה מינורית שאינה דחופה");
  if (lowReasons.length > 0) {
    return { priority: "LOW", confidence: 0.8, reasons: lowReasons };
  }

  // 4) MEDIUM — degraded performance, partial function, or config assistance.
  const mediumReasons: string[] = [];
  if (test(PERFORMANCE, text)) mediumReasons.push("ביצועים איטיים / שירות מדורדר");
  if (test(PARTIAL, text)) mediumReasons.push("תפקוד חלקי של השירות");
  if (test(CONFIG, text)) mediumReasons.push("סיוע בהגדרה או התקנה");
  if (mediumReasons.length > 0) {
    return { priority: "MEDIUM", confidence: 0.7, reasons: mediumReasons };
  }

  // 5) Default — single-user technical issue, no broad impact.
  return {
    priority: "MEDIUM",
    confidence: 0.45,
    reasons: ["תקלה טכנית של משתמש בודד ללא השבתה רחבה"],
  };
}

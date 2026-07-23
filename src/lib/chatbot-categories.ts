export type ChatbotCategory = {
  key: string;
  label: string;
  keywords: string[];
  reply: string;
};

export const CHATBOT_WELCOME_MESSAGE =
  "שלום, אני כאן כדי לעזור בנושאי הענן, הגישה המאובטחת והתמיכה הטכנית של AMK. תאר את הבעיה שלך או בחר תחום מהרשימה.";

// The smart intake assistant shown at /portal — quick category chips plus a
// short set of guided follow-up questions per category, so the customer's
// first message to a human agent already has useful context attached.
export const CHATBOT_SMART_WELCOME_MESSAGE =
  "שלום, אני העוזר החכם של AMK.\nאפשר לתאר את הבעיה, לבחור תחום שירות, או לצרף צילום מסך כדי שאוכל לעזור מהר יותר.";

export type ChatQuickCategory = {
  key: string;
  label: string;
  questions: string[];
};

export const CHAT_QUICK_CATEGORIES: ChatQuickCategory[] = [
  {
    key: "vps",
    label: "VPS ושרתים",
    questions: ["האם השרת לא מגיב?", "האם יש שגיאת התחברות?", "האם מדובר באיטיות, נפילה או בעיית גישה?"],
  },
  {
    key: "vpn",
    label: "VPN וגישה מאובטחת",
    questions: ["האם אתה מקבל הודעת שגיאה?", "האם האינטרנט עובד מחוץ ל-VPN?", "האם ניסית להתחבר מחדש?"],
  },
  {
    key: "email",
    label: "דואר אלקטרוני",
    questions: ["האם הבעיה בשליחה או בקבלה?", "האם מופיעה הודעת שגיאה?", "האם זה קורה בכל המכשירים או רק במכשיר מסוים?"],
  },
  {
    key: "backup",
    label: "גיבוי ושחזור מידע",
    questions: ["איזה מידע צריך לשחזר?", "מתי בוצע הגיבוי האחרון הידוע?", "האם מדובר בקובץ ספציפי או בשרת שלם?"],
  },
  {
    key: "security",
    label: "אבטחת מידע",
    questions: ["האם קיבלת התראה או הודעה חשודה?", "האם יש חשד לגישה לא מורשית?", "האם בוצע שינוי שלא ביצעת?"],
  },
  {
    key: "hosting",
    label: "אתרים ואחסון",
    questions: ["האם האתר לא נטען כלל?", "האם מופיעה הודעת שגיאה בדפדפן?", "האם בוצע שינוי לאחרונה באתר או בדומיין?"],
  },
  {
    key: "remote-support",
    label: "תמיכה מרחוק",
    questions: ["מהו סוג המכשיר שדורש טיפול?", "האם ניתן להתקין תוכנת תמיכה מרחוק?", "מהי השעה הנוחה לחיבור מרחוק?"],
  },
  {
    key: "other",
    label: "בעיה אחרת",
    questions: [],
  },
];

export const CHATBOT_FALLBACK_MESSAGE =
  "לא מצאתי פתרון ודאי לבעיה הזו. ניתן לפנות לנציג תמיכה להמשך טיפול.";

export const CHATBOT_CATEGORIES: ChatbotCategory[] = [
  {
    key: "cloud",
    label: "שירותי ענן",
    keywords: ["ענן", "cloud", "תשתית", "אחסון ענן"],
    reply:
      "שירותי הענן שלנו כוללים פריסה, ניהול וניטור תשתיות מותאמות לעסק שלך. תוכל לפרט את סוג הבעיה או הבקשה שלך בתחום זה?",
  },
  {
    key: "vps",
    label: "VPS ושרתים",
    keywords: ["vps", "שרת", "שרתים", "server"],
    reply:
      "לבעיות בשרתים או ב-VPS מומלץ לבדוק תחילה את מצב השרת בלוח הבקרה. אם התקלה נמשכת, ניתן להעביר את הבקשה לנציג תמיכה.",
  },
  {
    key: "vpn",
    label: "VPN וגישה מאובטחת",
    keywords: ["vpn", "גישה מרחוק", "התחברות מרחוק"],
    reply:
      "לבעיות חיבור VPN, ודא שהאפליקציה מעודכנת ושפרטי ההתחברות תקינים. אם הבעיה נמשכת, נציג תמיכה יכול לבדוק את החיבור מרחוק.",
  },
  {
    key: "backup",
    label: "גיבוי ושחזור מידע",
    keywords: ["גיבוי", "שחזור", "backup"],
    reply:
      "אנו מבצעים גיבויים אוטומטיים באופן שוטף. אם אתה זקוק לשחזור מידע ספציפי, נציג תמיכה יוכל לסייע באיתור הגיבוי המתאים.",
  },
  {
    key: "remote-support",
    label: "תמיכה מרחוק",
    keywords: ["תמיכה מרחוק", "remote", "טכנאי"],
    reply:
      "ניתן לקבל תמיכה מרחוק על ידי טכנאי מוסמך. תאר בקצרה את התקלה כדי שנוכל להעביר אותה לנציג המתאים.",
  },
  {
    key: "email",
    label: "דואר אלקטרוני",
    keywords: ["מייל", "דואר", "email", "אימייל"],
    reply:
      "לבעיות בדואר האלקטרוני, בדוק תחילה את הגדרות השרת (IMAP/SMTP) ואת פרטי ההתחברות. אם הבעיה נמשכת, נשמח להעביר את הפנייה לנציג תמיכה.",
  },
  {
    key: "login",
    label: "בעיות התחברות",
    keywords: ["התחברות", "login", "כניסה למערכת"],
    reply:
      "אם אינך מצליח להתחבר, ודא שהאימייל והסיסמה נכונים. אם החשבון עדיין ממתין לאישור, יש להמתין לאישור מנהל המערכת.",
  },
  {
    key: "password",
    label: "איפוס סיסמה",
    keywords: ["סיסמה", "איפוס", "password"],
    reply:
      "ניתן לאפס סיסמה דרך מסך ההתחברות באמצעות הקישור \"שכחת סיסמה?\". אם אינך מקבל את המייל, נציג תמיכה יכול לסייע.",
  },
  {
    key: "security",
    label: "אבטחת מידע",
    keywords: ["אבטחה", "אבטחת מידע", "security"],
    reply:
      "אנו שומרים על סטנדרטים מחמירים של אבטחת מידע והצפנה. אם יש לך חשש אבטחתי ספציפי, מומלץ להעביר את הפנייה לנציג תמיכה בהקדם.",
  },
  {
    key: "hosting",
    label: "אתרים ואחסון",
    keywords: ["אתר", "אחסון", "hosting", "דומיין"],
    reply:
      "לבעיות באתר או באחסון, בדוק תחילה את מצב הדומיין וההרשאות. אם הבעיה נמשכת, נציג תמיכה יוכל לבדוק את השרת מולך.",
  },
];

export function findCategoryReply(text: string): string | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  const match = CHATBOT_CATEGORIES.find((category) =>
    category.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );

  return match?.reply ?? null;
}

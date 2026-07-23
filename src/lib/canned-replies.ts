export type CannedReply = {
  key: string;
  label: string;
  getText: (agentName: string | null) => string;
};

export const CANNED_REPLIES: CannedReply[] = [
  {
    key: "greeting",
    label: "תחייה פתיחה",
    getText: (agentName) =>
      `שלום, כאן ${agentName ?? "נציג"} מצוות התמיכה של AMK Cloud Technologies. אשמח לעזור לך.`,
  },
  {
    key: "more-details",
    label: "בקשת פרטים נוספים",
    getText: () =>
      "כדי שנוכל לבדוק את התקלה, אשמח לקבל צילום מסך ותיאור קצר של הפעולה שביצעת לפני הופעת הבעיה.",
  },
  {
    key: "please-wait",
    label: "בקשת המתנה",
    getText: () => "אני בודק את הנושא כעת. אעדכן אותך בעוד מספר רגעים.",
  },
  {
    key: "vpn-issue",
    label: "בעיית VPN",
    getText: () =>
      "אנא בדוק שה־VPN מחובר, שהאינטרנט פעיל, ונסה להתחבר מחדש. אם מופיעה הודעת שגיאה, שלח צילום מסך.",
  },
  {
    key: "password-issue",
    label: "בעיית סיסמה",
    getText: () =>
      "ניתן לבצע איפוס סיסמה דרך עמוד ההתחברות. אם אינך מקבל קישור איפוס, נבדוק זאת עבורך.",
  },
  {
    key: "closing",
    label: "סיום שיחה",
    getText: () =>
      "שמחתי לעזור. אם הבעיה חוזרת, ניתן לפתוח פנייה נוספת בכל עת. המשך יום נעים.",
  },
  {
    key: "closing-followup",
    label: "סגירה עם מעקב",
    getText: () =>
      "הנושא טופל בשלב זה. השיחה תיסגר, וההיסטוריה תישמר למשך 7 ימים לצורך מעקב.",
  },
];

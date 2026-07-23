export type ChatIntent =
  | "GREETING"
  | "THANKS"
  | "BOT_CAPABILITIES"
  | "AMK_SUPPORT_QUESTION"
  | "OFF_TOPIC"
  | "SENSITIVE_OR_SECRET"
  | "UNKNOWN";

export type ChatLanguage = "he" | "ar";

const HEBREW_RE = /[֐-׿]/;
const ARABIC_RE = /[؀-ۿ]/;

export function detectMessageLanguage(message: string): ChatLanguage {
  return ARABIC_RE.test(message) && !HEBREW_RE.test(message) ? "ar" : "he";
}

function normalize(message: string) {
  return message.trim().toLowerCase().replace(/[?!.,،؟]/g, " ");
}

// Hebrew/Arabic prepositions and articles (ה-, ב-, ל-, ו-...) attach directly to the
// next word with no separator ("הסיסמה", "בדואר"), so those terms must stay plain
// substring matches. ASCII terms ("vpn", "hi") don't have that problem but DO risk
// matching inside unrelated words ("hi" inside "this"), so those use a word boundary.
const ASCII_TERM_RE = /^[a-z0-9 ]+$/;

function containsAny(normalized: string, terms: string[]) {
  return terms.some((term) => {
    if (ASCII_TERM_RE.test(term)) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`).test(normalized);
    }
    return normalized.includes(term);
  });
}

const CARD_NUMBER_RE = /\b(?:\d[ -]?){13,19}\b/;
const CARD_WORDS = ["כרטיס אשראי", "بطاقة ائتمان", "بطاقة الائتمان", "credit card"];
const SECRET_KEYWORDS = ["סיסמה", "סיסמא", "كلمة السر", "كلمة المرور", "password", "api key", "מפתח api", "מפתח ה-api"];
const POSSESSIVE_MARKERS = ["שלי", "שלנו", "تبعي", "الخاص بي", "خاصتي", "my "];
const ASSIGNMENT_MARKERS = ["היא", "הוא", "هي", "هو", " is ", ":", "="];

function looksLikeSecretReveal(message: string) {
  if (CARD_NUMBER_RE.test(message)) return true;
  const normalized = normalize(message);
  if (containsAny(normalized, CARD_WORDS)) return true;

  const hasSecretKeyword = containsAny(normalized, SECRET_KEYWORDS);
  if (!hasSecretKeyword) return false;

  // "how do I reset my password" is a legitimate support question; only
  // treat it as a leaked secret when the customer is stating the value
  // ("my password is ...") rather than asking about the process.
  const hasPossessive = containsAny(normalized, POSSESSIVE_MARKERS);
  const hasAssignment = containsAny(` ${normalized} `, ASSIGNMENT_MARKERS);
  return hasPossessive || hasAssignment;
}

const AMK_KEYWORDS = [
  "vpn",
  "vps",
  "שרת",
  "سيرفر",
  "خادم",
  "דואר",
  "email",
  "אימייל",
  "بريد",
  "גיבוי",
  "backup",
  "نسخ احتياطي",
  "אבטחה",
  "security",
  "أمن",
  "أمان",
  "אתר",
  "hosting",
  "אחסון",
  "استضافة",
  "موقع",
  "תמיכה מרחוק",
  "remote",
  "دعم عن بعد",
  "התחברות",
  "login",
  "تسجيل الدخول",
  "סיסמה",
  "סיסמא",
  "كلمة المرور",
  "كلمة السر",
  "תקלה",
  "مشكلة",
  "عطل",
  "כרטיס",
  "חשבונית",
  "فاتورة",
  "ענן",
  "cloud",
  "سحابة",
  "טכנאי",
  "فني",
];

const GREETING_WORDS = [
  "שלום",
  "היי",
  "בוקר טוב",
  "ערב טוב",
  "צהריים טובים",
  "מה שלומך",
  "مرحبا",
  "اهلا",
  "أهلا",
  "أهلين",
  "السلام عليكم",
  "صباح الخير",
  "مساء الخير",
  "كيفك",
  "كيف حالك",
  "hello",
  "hi",
  "hey",
];

const THANKS_WORDS = [
  "תודה",
  "תודה רבה",
  "מעריך",
  "شكرا",
  "شكراً",
  "مشكور",
  "يعطيك العافية",
  "thanks",
  "thank you",
];

const CAPABILITY_PHRASES = [
  "מה אתה יכול",
  "במה אתה יכול",
  "מה אתה עושה",
  "מי אתה",
  "איך אתה יכול לעזור",
  "شو بتقدر",
  "ماذا تستطيع",
  "بماذا تساعد",
  "مين انت",
  "شو انت",
  "what can you do",
  "who are you",
  "what do you do",
];

const OFF_TOPIC_WORDS = [
  "מזג אוויר",
  "מזג האוויר",
  "طقس",
  "الطقس",
  "כדורגל",
  "كرة القدم",
  "لاعب",
  "שחקן",
  "مباراة",
  "פוליטיקה",
  "سياسة",
  "חדשות",
  "أخبار",
  "בדיחה",
  "نكتة",
];

// Short-message gate for conversational intents so a compound sentence like
// "שלום, יש לי בעיה עם ה-VPN" doesn't get swallowed by the greeting check —
// AMK keyword detection runs first anyway, but this is a second safety net.
const SHORT_MESSAGE_WORD_LIMIT = 8;

export function classifyChatIntent(rawMessage: string): ChatIntent {
  const message = rawMessage.trim();
  if (!message) return "UNKNOWN";

  if (looksLikeSecretReveal(message)) return "SENSITIVE_OR_SECRET";

  const normalized = normalize(message);
  if (containsAny(normalized, AMK_KEYWORDS)) return "AMK_SUPPORT_QUESTION";
  if (containsAny(normalized, OFF_TOPIC_WORDS)) return "OFF_TOPIC";

  const isShort = message.split(/\s+/).filter(Boolean).length <= SHORT_MESSAGE_WORD_LIMIT;
  if (isShort && containsAny(normalized, GREETING_WORDS)) return "GREETING";
  if (isShort && containsAny(normalized, THANKS_WORDS)) return "THANKS";
  if (containsAny(normalized, CAPABILITY_PHRASES)) return "BOT_CAPABILITIES";

  return "UNKNOWN";
}

const RESPONSES: Record<Exclude<ChatIntent, "AMK_SUPPORT_QUESTION">, Record<ChatLanguage, string>> = {
  GREETING: {
    he: "שלום! אני העוזר החכם של AMK. אפשר לתאר את הבעיה, לבחור תחום שירות או לצרף צילום מסך כדי שאוכל לעזור.",
    ar: "أهلاً! أنا المساعد الذكي الخاص بـ AMK. يمكنك وصف المشكلة أو اختيار نوع الخدمة أو إرفاق صورة شاشة حتى أساعدك بشكل أسرع.",
  },
  THANKS: {
    he: "בשמחה! אם יש לך בעיה טכנית או שאלה על שירותי AMK, אני כאן לעזור.",
    ar: "على الرحب والسعة! إذا عندك مشكلة تقنية أو سؤال عن خدمات AMK، أنا جاهز أساعدك.",
  },
  BOT_CAPABILITIES: {
    he: "אני יכול לעזור בנושאים הקשורים לשירותי AMK: VPS ושרתים, VPN וגישה מאובטחת, דואר אלקטרוני, גיבוי ושחזור מידע, אבטחת מידע, אתרים ואחסון ותמיכה מרחוק.",
    ar: "أقدر أساعدك بمواضيع خدمات AMK مثل: VPS وسيرفرات، VPN، البريد الإلكتروني، النسخ الاحتياطي، أمن المعلومات، المواقع والاستضافة، والدعم عن بُعد.",
  },
  OFF_TOPIC: {
    he: "אני יכול לעזור רק בנושאים הקשורים לשירותי AMK ולתמיכה הטכנית. אפשר לבחור תחום שירות או לתאר בעיה טכנית.",
    ar: "أقدر أساعد فقط في المواضيع المتعلقة بخدمات AMK والدعم التقني. يمكنك اختيار نوع الخدمة أو وصف مشكلة تقنية.",
  },
  SENSITIVE_OR_SECRET: {
    he: "מטעמי אבטחה, אין לשלוח סיסמאות, פרטי אשראי, API keys או מידע רגיש בצ׳אט.",
    ar: "لأسباب أمنية، لا ترسل كلمات مرور أو بيانات بطاقة ائتمان أو API keys أو معلومات حساسة داخل الشات.",
  },
  UNKNOWN: {
    he: "כדי שאוכל לעזור, אפשר לתאר באיזה שירות מדובר? למשל VPS, VPN, דואר אלקטרוני, גיבוי או אבטחת מידע.",
    ar: "حتى أقدر أساعدك، ممكن توضح في أي خدمة المشكلة؟ مثل VPS، VPN، البريد الإلكتروني، النسخ الاحتياطي أو أمن المعلومات.",
  },
};

export function buildIntentReply(intent: ChatIntent, language: ChatLanguage): string | null {
  if (intent === "AMK_SUPPORT_QUESTION") return null;
  return RESPONSES[intent][language];
}

export function buildNoKnowledgeMatchAnswer(language: ChatLanguage): string {
  return language === "ar"
    ? "لم أجد معلومات مناسبة في قاعدة معرفة AMK حول هذا السؤال. يمكنك فتح طلب دعم ليفحصه أحد ممثلي الدعم."
    : "לא מצאתי מידע מתאים במאגר הידע של AMK עבור השאלה הזו. אפשר לפתוח פנייה לנציג תמיכה כדי שנבדוק את הנושא עבורך.";
}

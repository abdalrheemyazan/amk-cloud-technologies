import { SUPPORT_CONTACT_CONFIG } from "@/lib/contact-config";

export type ChatIntent =
  | "GENERAL_SUPPORT_QUESTION"
  | "COMPANY_INFORMATION"
  | "WORKING_HOURS"
  | "CONTACT_INFORMATION"
  | "TICKET_STATUS"
  | "CREATE_TICKET"
  | "HUMAN_HANDOFF"
  | "SERVICE_INFORMATION"
  | "GREETING"
  | "THANKS"
  | "BOT_CAPABILITIES"
  | "OFF_TOPIC"
  | "SENSITIVE_OR_SECRET"
  | "UNKNOWN";

export type ChatLanguage = "he" | "ar" | "en";

const HEBREW_RE = /[֐-׿]/;
const ARABIC_RE = /[؀-ۿ]/;
const LATIN_RE = /[a-zA-Z]/;

export function detectMessageLanguage(message: string): ChatLanguage {
  const hasHebrew = HEBREW_RE.test(message);
  const hasArabic = ARABIC_RE.test(message);
  const hasLatin = LATIN_RE.test(message);

  if (hasArabic && !hasHebrew) return "ar";
  if (hasHebrew) return "he";
  if (hasLatin) return "en";
  return "he";
}

function normalize(message: string) {
  return message.trim().toLowerCase().replace(/[?!.,،؟:;]/g, " ");
}

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
const SECRET_KEYWORDS = [
  "סיסמה",
  "סיסמא",
  "كلمة السر",
  "كلمة المرور",
  "password",
  "api key",
  "מפתח api",
  "מפתח ה-api",
  "bearer",
  "token",
];
const POSSESSIVE_MARKERS = ["שלי", "שלנו", "تبعي", "الخاص بي", "خاصتي", "my "];
const ASSIGNMENT_MARKERS = ["היא", "הוא", "هي", "هو", " is ", ":", "="];

function looksLikeSecretReveal(message: string) {
  if (CARD_NUMBER_RE.test(message)) return true;
  const normalized = normalize(message);
  if (containsAny(normalized, CARD_WORDS)) return true;

  const hasSecretKeyword = containsAny(normalized, SECRET_KEYWORDS);
  if (!hasSecretKeyword) return false;

  const hasPossessive = containsAny(normalized, POSSESSIVE_MARKERS);
  const hasAssignment = containsAny(` ${normalized} `, ASSIGNMENT_MARKERS);
  return hasPossessive || hasAssignment;
}

const WORKING_HOURS_WORDS = [
  "שעות פעילות",
  "שעות הפעילות",
  "שעות עבודה",
  "שעות העבודה",
  "זמני פעילות",
  "זמני הפעילות",
  "שעות פתיחה",
  "שעות הפתיחה",
  "מתי פתוח",
  "מתי אתם עובדים",
  "זמני קבלת קהל",
  "שעות מענה",
  "שעות המענה",
  "סגורים",
  "פתוחים",
  "ساعات العمل",
  "أوقات العمل",
  "متى تفتحون",
  "working hours",
  "opening hours",
  "support hours",
  "business hours",
];

const CONTACT_INFO_WORDS = [
  "מספר טלפון",
  "מספר הטלפון",
  "מה הטלפון",
  "מה מספר הטלפון",
  "טלפון שלכם",
  "טלפון של התמיכה",
  "מוקד טלפוני",
  "איך להתקשר",
  "איך יוצרים קשר טלפוני",
  "כתובת מייל",
  "כתובת אימייל",
  "מה המייל שלכם",
  "מה האימייל שלכם",
  "מייל של התמיכה",
  "אימייל של התמיכה",
  "דואל של התמיכה",
  "צור קשר",
  "יצירת קשר",
  "איך ליצור קשר",
  "איך יוצרים קשר",
  "דרכי התקשרות",
  "דרכי יצירת קשר",
  "מספר שלכם",
  "رقم الهاتف",
  "ما هو رقمكم",
  "كيف اتصل بكم",
  "بريد الدعم",
  "اتصل بنا",
  "تواصل معنا",
  "phone number",
  "contact us",
  "support email",
  "how to contact",
  "call support",
];

const CHECK_TICKETS_WORDS = [
  "מה מצב הפנייה",
  "מה מצב פנייה",
  "מצב הפנייה",
  "מצב פנייה",
  "מצב הפנייה שלי",
  "סטטוס פנייה",
  "סטטוס הפנייה",
  "הפניות שלי",
  "פניות שלי",
  "בדיקת סטטוס",
  "בדיקת פנייה",
  "מה קורה עם הפנייה",
  "איפה הפנייה",
  "סטטוס הקריאה",
  "קריאות פתוחות",
  "פניות פתוחות",
  "קריאה שלי",
  "פנייה שלי",
  "חפש פנייה",
  "חפש קריאה",
  "חפש טיקט",
  "حالة الطلب",
  "طلباتي",
  "فحص الطلب",
  "تذكرتي",
  "تذاكري",
  "check ticket",
  "ticket status",
  "my tickets",
  "request status",
];

const OPEN_TICKET_WORDS = [
  "פתח פנייה",
  "פתחי פנייה",
  "פתיחת פנייה",
  "פתיחת פניות",
  "לפתוח פנייה",
  "פנייה חדשה",
  "פתח קריאה",
  "פתיחת קריאה",
  "לפתוח קריאה",
  "קריאה חדשה",
  "פתח טיקט",
  "فتح طلب",
  "طلب جديد",
  "فتح تذكرة",
  "open ticket",
  "new ticket",
  "create request",
  "open request",
];

const TALK_TO_AGENT_WORDS = [
  "דבר עם נציג",
  "דברי עם נציג",
  "לדבר עם נציג",
  "נציג אנושי",
  "העבר לנציג",
  "להעביר לנציג",
  "העבירו לנציג",
  "רוצה נציג",
  "רוצה לדבר עם נציג",
  "שיחה עם נציג",
  "מענה אנושי",
  "תעביר אותי לנציג",
  "תעבירו אותי לנציג",
  "חבר אותי לנציג",
  "בן אדם",
  "תחבר אותי לנציג",
  "تحدث مع فني",
  "تحدث مع ممثل",
  "ممثل الدعم",
  "محادثة مع موظف",
  "اريد ممثل",
  "talk to agent",
  "human agent",
  "live agent",
  "speak with human",
  "transfer to agent",
];

const GREETING_WORDS = [
  "שלום",
  "היי",
  "בוקר טוב",
  "ערב טוב",
  "צהריים טובים",
  "מה שלומך",
  "מה נשמע",
  "مرحبا",
  "اهلا",
  "أهلا",
  "صباح الخير",
  "مساء الخير",
  "hello",
  "hi",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
];

const THANKS_WORDS = [
  "תודה",
  "תודה רבה",
  "מעריך",
  "מעריכה",
  "עזרת לי מאוד",
  "شكرا",
  "شكراً",
  "يعطيك العافية",
  "thanks",
  "thank you",
  "appreciate it",
];

const CAPABILITY_PHRASES = [
  "מה אתה יכול",
  "במה אתה יכול לעזור",
  "מה אתה עושה",
  "מי אתה",
  "איך אתה יכול לעזור",
  "מה התפקיד שלך",
  "ماذا يمكنك ان تفعل",
  "كيف تساعدني",
  "من انت",
  "what can you do",
  "who are you",
  "how can you help",
];

const OFF_TOPIC_WORDS = [
  "מזג אוויר",
  "כדורגל",
  "פוליטיקה",
  "חדשות",
  "בדיחה",
  "מתכון",
  "סרט",
  "שיר",
  "הורוסקופ",
  "الطقس",
  "كرة قدم",
  "نكتة",
  "طبخة",
  "weather forecast",
  "football match",
  "tell me a joke",
];

const SHORT_MESSAGE_WORD_LIMIT = 5;

export function classifyChatIntent(rawMessage: string): ChatIntent {
  const message = rawMessage.trim();
  if (!message) return "GENERAL_SUPPORT_QUESTION";

  if (looksLikeSecretReveal(message)) return "SENSITIVE_OR_SECRET";

  const normalized = normalize(message);
  const words = message.split(/\s+/).filter(Boolean);
  const isShort = words.length <= SHORT_MESSAGE_WORD_LIMIT;

  // 1. Explicit functional triggers
  if (containsAny(normalized, TALK_TO_AGENT_WORDS)) return "HUMAN_HANDOFF";
  if (containsAny(normalized, CHECK_TICKETS_WORDS)) return "TICKET_STATUS";
  if (containsAny(normalized, OPEN_TICKET_WORDS)) return "CREATE_TICKET";
  if (containsAny(normalized, WORKING_HOURS_WORDS)) return "WORKING_HOURS";
  if (containsAny(normalized, CONTACT_INFO_WORDS)) return "CONTACT_INFORMATION";

  // 2. Pure small talk (only if short and standalone)
  if (isShort && containsAny(normalized, GREETING_WORDS)) return "GREETING";
  if (isShort && containsAny(normalized, THANKS_WORDS)) return "THANKS";
  if (containsAny(normalized, CAPABILITY_PHRASES)) return "BOT_CAPABILITIES";
  if (containsAny(normalized, OFF_TOPIC_WORDS)) return "OFF_TOPIC";

  // 3. ALL OTHER questions (general questions, troubleshooting, VPN, VPS, mail, hardware, network, software, etc.)
  // are routed to RAG + Gemini.
  return "GENERAL_SUPPORT_QUESTION";
}

export function buildIntentReply(intent: ChatIntent, language: ChatLanguage): string | null {
  // Queries requiring live DB data or RAG + Gemini return null so the backend processes them dynamically.
  if (
    intent === "GENERAL_SUPPORT_QUESTION" ||
    intent === "SERVICE_INFORMATION" ||
    intent === "COMPANY_INFORMATION" ||
    intent === "TICKET_STATUS" ||
    intent === "UNKNOWN"
  ) {
    return null;
  }

  switch (intent) {
    case "WORKING_HOURS":
      if (language === "ar") {
        return `ساعات عمل فريق دعم AMK هي: ${SUPPORT_CONTACT_CONFIG.workingHours}.\nالهاتف المباشر: ${SUPPORT_CONTACT_CONFIG.phoneDisplay}\nالبريد الإلكتروني: ${SUPPORT_CONTACT_CONFIG.email}`;
      }
      if (language === "en") {
        return `AMK Support operating hours are:\n📅 ${SUPPORT_CONTACT_CONFIG.workingHours}\n📞 Phone: ${SUPPORT_CONTACT_CONFIG.phoneDisplay}\n✉️ Email: ${SUPPORT_CONTACT_CONFIG.email}\nYou can also open a support ticket through the customer portal at any time.`;
      }
      return `שעות הפעילות של צוות התמיכה ב-AMK הן:\n📅 ${SUPPORT_CONTACT_CONFIG.workingHours}\n📞 מוקד טלפוני: ${SUPPORT_CONTACT_CONFIG.phoneDisplay}\n✉️ אימייל: ${SUPPORT_CONTACT_CONFIG.email}\nניתן גם לפתוח פנייה ישירות מאזור הלקוח בכל עת.`;

    case "CONTACT_INFORMATION":
      if (language === "ar") {
        return `يمكنك التواصل مع فريق AMK عبر:\n📞 الهاتف: ${SUPPORT_CONTACT_CONFIG.phoneDisplay}\n✉️ البريد الإلكتروني: ${SUPPORT_CONTACT_CONFIG.email}\nساعات العمل: ${SUPPORT_CONTACT_CONFIG.workingHours}`;
      }
      if (language === "en") {
        return `You can contact AMK Cloud Technologies via:\n📞 Phone: ${SUPPORT_CONTACT_CONFIG.phoneDisplay}\n✉️ Email: ${SUPPORT_CONTACT_CONFIG.email}\nHours: ${SUPPORT_CONTACT_CONFIG.workingHours}`;
      }
      return `דרכי יצירת הקשר עם AMK Cloud Technologies:\n📞 טלפון: ${SUPPORT_CONTACT_CONFIG.phoneDisplay}\n✉️ אימייל: ${SUPPORT_CONTACT_CONFIG.email}\nשעות פעילות: ${SUPPORT_CONTACT_CONFIG.workingHours}`;

    case "CREATE_TICKET":
      if (language === "ar") {
        return "يمكنك فتح طلب دعم جديد من خلال الضغط على 'פתיחת פנייה חדשה' أو التوجه إلى تبويب 'פתיחת פנייה' في البوابة.";
      }
      if (language === "en") {
        return "You can easily open a new support request by clicking 'New Request' or navigating to the requests section in the portal.";
      }
      return "באפשרותך לפתוח פנייה חדשה בקלות דרך לשונית 'פתיחת פנייה' באזור הלקוח, או בלחיצה על כפתור 'פתיחת פנייה חדשה'.";

    case "HUMAN_HANDOFF":
      if (language === "ar") {
        return "للتحدث مع ممثل دعم بشري، يمكنك الضغط על 'דבר עם נציג' وسنقوم بنقل المحادثة فوراً إلى طاقم الدعم الفني.";
      }
      if (language === "en") {
        return "To speak with a live support agent, click 'Talk to Agent' and your conversation will be routed directly to our support queue.";
      }
      return "להעברת השיחה לנציג תמיכה אנושי, לחץ על כפתור 'דבר עם נציג' והפנייה תועבר ישירות לתור נציגי התמיכה.";

    case "GREETING":
      if (language === "ar") {
        return "أهلاً بك! أنا המساعد الذكي لـ AMK Cloud Technologies. كيف يمكنني مساعدتك اليوم؟ يمكنك وصف أي مشكلة تقنية أو الاستفسار عن خدماتنا.";
      }
      if (language === "en") {
        return "Hello! I am the AMK Cloud Technologies support assistant. How can I help you today? Feel free to describe any technical issue or ask about our cloud services.";
      }
      return "שלום! אני העוזר החכם של AMK Cloud Technologies. כיצד אוכל לעזור לך היום? תוכל לתאר כל תקלה, לשאול על שירותי הענן או לבקש העברה לנציג.";

    case "THANKS":
      if (language === "ar") {
        return "على الرحب والسعة! إذا كان لديك أي استفسار إضافي أو תקלה טכנית, אני כאן תמיד לשירותך.";
      }
      if (language === "en") {
        return "You're very welcome! If you have any further questions or technical issues, I'm always here to help.";
      }
      return "בשמחה רבה! אם יש לך שאלה נוספת או צורך בעזרה טכנית, אני כאן תמיד לשירותך.";

    case "BOT_CAPABILITIES":
      if (language === "ar") {
        return "أنا متخصص في تقديم الدعم لخدمات AMK: خوادم VPS والسحابة، اتصالات VPN، البريد الإلكتروني وMicrosoft 365، النسخ الاحتياطي وأمن المعلومات. كما يمكنني فحص حالة طلباتك או تحويلك לפנייה לנציג.";
      }
      if (language === "en") {
        return "I specialize in AMK services: Cloud VPS, VPN & secure access, Hosted Mail & Microsoft 365, Data Backup, Cybersecurity, and IT diagnostics. I can also check your ticket status or transfer you to a human agent.";
      }
      return "אני מתמחה בשירותי AMK: שרתי VPS וענן, חיבורי VPN, דואר אלקטרוני ו-Microsoft, גיבויים ואבטחת מידע. אוכל לספק מענה מבוסס ידע, לבצע אבחון תקלות, לבדוק את סטטוס הפניות שלך או להעבירך לנציג.";

    case "OFF_TOPIC":
      if (language === "ar") {
        return "أنا مساعد الدعم الفني الخاص بشركة AMK Cloud Technologies وأقدم المساعدة في خدمات وحلول الشركة والأنظمة التقنية فقط. كيف يمكنني مساعدتك؟";
      }
      if (language === "en") {
        return "I am the technical support assistant for AMK Cloud Technologies, focused on our cloud and IT solutions. How can I assist you with your AMK services?";
      }
      return "אני עוזר התמיכה הטכנית של AMK ומספק סיוע בנושאי שירותי החברה, הענן והתשתיות הטכנולוגיות. כיצד אוכל לעזור לך בנושאים אלו?";

    case "SENSITIVE_OR_SECRET":
      if (language === "ar") {
        return "מטעמי אבטחה ופרטיות, يرجى عدم إرسال كلمات مرور أو رموز سرية أو بيانات بطاقات ائتمان عبر المحادثة.";
      }
      if (language === "en") {
        return "For security and privacy reasons, please never share passwords, access tokens, API keys, or credit card details in the chat.";
      }
      return "מטעמי אבטחה ופרטיות, אין לשלוח סיסמאות, מפתחות גישה (Tokens/Keys) או פרטי אשראי בצ׳אט.";

    default:
      return null;
  }
}

export function buildNoKnowledgeMatchAnswer(language: ChatLanguage): string {
  if (language === "ar") {
    return "لم أجد في قاعدة معرفة AMK معلومات كافية لتحديد الإجراء المناسب بدقة.\nيمكنك فتح طلب جديد או التحدث مباشرة مع ممثل دعم بشري.";
  }
  if (language === "en") {
    return "I could not find sufficient information in the AMK Knowledge Base to resolve this issue.\nYou can open a support request or request to speak with a human support technician.";
  }
  return "לא מצאתי במאגר הידע של AMK מידע מספיק כדי לקבוע בוודאות מה גורם לבעיה.\nאפשר לפתוח פנייה חדשה או להעביר את השיחה לנציג תמיכה.";
}

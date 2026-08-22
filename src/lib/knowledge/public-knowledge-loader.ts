import publicKnowledgeBase from "@/data/knowledge/AMK_Public_Knowledge_Base_v1_1.json";
import { type ChatLanguage } from "@/lib/ai/chat-intent";

export type PublicKnowledgeBaseType = typeof publicKnowledgeBase;

// 1. In-memory cached singleton
let cachedKnowledgeBase: PublicKnowledgeBaseType | null = null;

export function getPublicKnowledgeBase(): PublicKnowledgeBaseType {
  if (!cachedKnowledgeBase) {
    cachedKnowledgeBase = publicKnowledgeBase;
  }
  return cachedKnowledgeBase;
}

function normalize(message: string): string {
  return message
    .trim()
    .toLowerCase()
    .replace(/[?!.,،؟:;*#\-_]/g, " ")
    .replace(/\s+/g, " ");
}

function containsAny(normalized: string, patterns: string[]): boolean {
  return patterns.some((p) => {
    const cleanPattern = p.toLowerCase().trim();
    return normalized.includes(cleanPattern);
  });
}

// 2. Deterministic fast intent definitions matching canonical JSON v1.1
const FAST_INTENT_PATTERNS = {
  WORKING_HOURS: {
    he: [
      "מתי אתם עובדים",
      "מה שעות הפעילות",
      "שעות פעילות",
      "שעות הפעילות",
      "שעות עבודה",
      "שעות העבודה",
      "שעות פתיחה",
      "שעות הפתיחה",
      "עד איזה שעה אתם עובדים",
      "מתי פתוח",
      "זמני פעילות",
    ],
    ar: [
      "ساعات العمل",
      "أوقات العمل",
      "شو ساعات العمل",
      "ما هي ساعات العمل",
      "متى تفتحون",
      "اوقات الدوام",
      "ساعات الدوام",
      "متى بتشتغلو",
    ],
    en: [
      "working hours",
      "opening hours",
      "support hours",
      "business hours",
      "what are your hours",
      "when are you open",
    ],
  },
  CONTACT_INFORMATION: {
    he: [
      "מה הטלפון שלכם",
      "מה הטלפון",
      "מספר טלפון",
      "מספר הטלפון",
      "חיוג מקוצר",
      "טלפון שלכם",
      "איך להתקשר",
      "איך אפשר לדבר עם נציג בטלפון",
      "דרכי התקשרות",
      "צור קשר",
      "יצירת קשר",
      "טלפון של התמיכה",
      "8433",
    ],
    ar: [
      "شو رقم التلفون",
      "ما هو رقم الهاتف",
      "رقم التلفون",
      "رقم الهاتف",
      "كيف اتصل بكم",
      "الاتصال بكم",
      "رقم الدعم",
      "الرقم المختصر",
      "تلفونكم",
    ],
    en: [
      "what is your phone number",
      "phone number",
      "support phone",
      "short dial",
      "how to call",
      "contact number",
    ],
  },
  CREATE_SUPPORT_REQUEST: {
    he: [
      "איך פותחים קריאת שירות",
      "איך אני פותח קריאת שירות",
      "איך מדווחים על תקלה",
      "פתיחת פנייה",
      "פתיחת קריאה",
      "פתיחת תקלה",
      "איך פותחים פנייה",
      "לפתוח פנייה",
      "לפתוח קריאה",
      "לפתוח טיקט",
    ],
    ar: [
      "كيف أفتح طلب دعم",
      "كيف افتح طلب دعم",
      "كيف افتح تذكرة",
      "كيفية فتح طلب",
      "فتح طلب دعم",
      "فتح تذكرة",
      "التبليغ عن عطل",
      "كيف اقدم شكوى",
    ],
    en: [
      "how to open a ticket",
      "how do i open a support request",
      "how to open a support request",
      "open a ticket",
      "create support request",
      "how to report an issue",
    ],
  },
  ABOUT_COMPANY: {
    he: [
      "מה חברת amk עושה",
      "מה חברת amk cloud עושה",
      "מה החברה עושה",
      "מה אתם עושים",
      "מי אתם",
      "אילו שירותים אתם מספקים",
      "שירותי החברה",
      "מה הפעילות שלכם",
      "על החברה",
      "איזה שירותים יש לכם",
    ],
    ar: [
      "شو بتعمل شركة amk",
      "شو بتعمل شركه amk",
      "ماذا تفعل شركة amk",
      "من انتم",
      "ما هي خدماتكم",
      "ماذا تقدم الشركة",
      "عن الشركة",
      "ما هي خدمات amk",
    ],
    en: [
      "what does amk do",
      "what does amk cloud do",
      "who are you",
      "what services do you provide",
      "about amk",
      "company services",
    ],
  },
  TARGET_CUSTOMERS: {
    he: [
      "למי השירותים שלכם מתאימים",
      "למי מתאימים השירותים",
      "מי הלקוחות שלכם",
      "קהל יעד",
      "למי זה מתאים",
    ],
    ar: [
      "لمن تناسب خدماتكم",
      "مين زباينكم",
      "من هم عملاؤكم",
      "لمن هذه الخدمات",
      "مين بستفيد من خدماتكم",
    ],
    en: [
      "who are your target customers",
      "who are your clients",
      "who is this for",
      "who do you serve",
    ],
  },
  SECURITY: {
    he: [
      "האם השרתים מאובטחים",
      "האם המידע שלי מאובטח",
      "אבטחת מידע",
      "רמת האבטחה",
      "האם השרת מאובטח",
      "הגנת סייבר",
    ],
    ar: [
      "هل السيرفرات آمنة",
      "هل السيرفرات امنة",
      "هل بياناتي آمنة",
      "أمان المعلومات",
      "امان المعلومات",
      "حماية الخوادم",
    ],
    en: [
      "are your servers secure",
      "is my data secure",
      "information security",
      "cyber security",
      "how secure are the servers",
    ],
  },
  WHY_AMK: {
    he: [
      "למה לבחור ב-amk",
      "למה לבחור ב amk",
      "למה לבחור בכם",
      "למה amk",
      "מה היתרון שלכם",
      "יתרונות החברה",
      "למה כדאי לבחור בכם",
      "מה המיוחד בכם",
    ],
    ar: [
      "لماذا نختار amk",
      "ليش نختار amk",
      "ما هي ميزاتكم",
      "لماذا اختاركم",
      "مميزات الشركة",
      "شو ميزتكم",
    ],
    en: [
      "why choose amk",
      "why amk",
      "what are your advantages",
      "why choose you",
      "amk benefits",
    ],
  },
};

export type FastIntentKey = keyof typeof FAST_INTENT_PATTERNS;

/**
 * 3. Match Fast Intent directly from memory without database or Gemini.
 */
export function matchFastKnowledgeIntent(
  rawMessage: string,
  language: ChatLanguage
): { matched: boolean; intent?: FastIntentKey; answer?: string } {
  const kb = getPublicKnowledgeBase();
  const normalized = normalize(rawMessage);

  for (const [intentKey, patternObj] of Object.entries(FAST_INTENT_PATTERNS) as [FastIntentKey, typeof FAST_INTENT_PATTERNS[FastIntentKey]][]) {
    const allPatterns = [
      ...(patternObj.he || []),
      ...(patternObj.ar || []),
      ...(patternObj.en || []),
    ];

    if (containsAny(normalized, allPatterns)) {
      const answer = buildDeterministicAnswer(intentKey, language, kb);
      return { matched: true, intent: intentKey, answer };
    }
  }

  return { matched: false };
}

function buildDeterministicAnswer(
  intent: FastIntentKey,
  language: ChatLanguage,
  kb: PublicKnowledgeBaseType
): string {
  switch (intent) {
    case "WORKING_HOURS":
      if (language === "ar") {
        return `ساعات عمل مركز الدعم الفني لـ AMK هي من يوم ${kb.contact.support_hours.days_he === "ראשון עד חמישי" ? "الأحد إلى الخميس" : kb.contact.support_hours.days_he}، بين الساعة ${kb.contact.support_hours.from} و ${kb.contact.support_hours.to}.\n(ملاحظة: مراقبة البنية التحتية والشبكة تعمل على مدار الساعة 24/7).`;
      }
      if (language === "en") {
        return `Our support center operating hours are Sunday through Thursday, ${kb.contact.support_hours.from} to ${kb.contact.support_hours.to}.\n(Please note: Infrastructure and network monitoring operates 24/7).`;
      }
      return `${kb.contact.support_hours.answer_he}\n(ניטור ובקרת התשתיות פועלים 24/7).`;

    case "CONTACT_INFORMATION":
      if (language === "ar") {
        return `يمكنك التواصل مع مركز الدعم الفني لـ AMK عبر الهاتف: ${kb.contact.phone.display} أو عبر الرقم المختصر ${kb.contact.phone.short_dial}.\nالبريد الإلكتروني: support@amk-cloud.com`;
      }
      if (language === "en") {
        return `You can reach our support center by phone at ${kb.contact.phone.display} or via short dial ${kb.contact.phone.short_dial}.\nEmail: support@amk-cloud.com`;
      }
      return `${kb.contact.phone.answer_he}\nדוא"ל: support@amk-cloud.com`;

    case "CREATE_SUPPORT_REQUEST":
      if (language === "ar") {
        return "السبيل الأسرع والأفضل لفتح طلب خدمة هو عبر البوابة الشخصية في موقعنا الرسمي (من خلال تبويب 'פתיחת פנייה'). سيتولى فريق الدعم معالجته فوراً.";
      }
      if (language === "en") {
        return "The fastest and best way to open a support ticket is through your personal customer portal on our official website (under the 'New Request' tab). Our team will attend to it promptly.";
      }
      return kb.contact.support_request.answer_he;

    case "ABOUT_COMPANY":
      if (language === "ar") {
        return "تقدم شركة AMK Cloud Technologies LTD خدمات سحابية متقدمة، خوادم VPS، استضافة مواقع، بنى تحتية افتراضية، حلول أمن معلومات، إدارة خوادم وخدمات DevOps، مع تخصيص الحلول بدقة وفق متطلبات العميل.";
      }
      if (language === "en") {
        return "AMK Cloud Technologies LTD provides advanced cloud services, VPS servers, web hosting, virtual infrastructure, cybersecurity solutions, server management, and DevOps services tailored precisely to customer needs.";
      }
      return kb.company.description_he;

    case "TARGET_CUSTOMERS":
      if (language === "ar") {
        return "نقدم حلولنا لمجموعة واسعة من العملاء: الشركات الصغيرة والمتوسطة، الشركات الناشئة (Start-ups)، مطوري المواقع، مزودي خدمات IT، والعملاء الأفراد الباحثين عن بنية تحتية سحابية موثوقة ومستقرة.";
      }
      if (language === "en") {
        return "We provide solutions for a wide range of clients: small and medium businesses, startups, web developers, IT service providers, and individual clients requiring reliable, stable cloud infrastructure.";
      }
      return kb.company.target_customers_he;

    case "SECURITY":
      if (language === "ar") {
        return "بالتأكيد. نعمل وفق معايير أمن معلومات صارمة ونقدم حلولاً متقدمة تشمل جدران الحماية (Firewall)، إدارة دقيقة للصلاحيات، ومراقبة للشبكة على مدار الساعة 24/7 لضمان حماية بياناتك دائماً.";
      }
      if (language === "en") {
        return "Absolutely. We operate under strict cybersecurity standards and offer advanced solutions including Firewalls, strict permission management, and 24/7 network monitoring to ensure your data is always secure.";
      }
      return kb.security.answer_he;

    case "WHY_AMK":
      if (language === "ar") {
        return "هدفنا هو تقديم خدمات سحابية مستقرة، آمنة واقتصادية مع جاهزية خوادم عالية جداً (High Availability). وخلافاً للمزودين الكبار في الخارج، نقدم دعماً شخصياً، تشخيصاً وحلاً سريعاً للأعطال، وتخصيصاً كاملاً للبنية التحتية وفق حجم أعمالك.";
      }
      if (language === "en") {
        return "Our goal is to deliver stable, secure, and cost-effective cloud services with High Availability. Unlike large foreign providers, we offer personalized support, rapid troubleshooting, and tailored infrastructure customized to your business needs.";
      }
      return kb.company.advantages_he;

    default:
      return kb.company.description_he;
  }
}

/**
 * 4. Generates customer-visible knowledge context for RAG + Gemini fallback.
 */
export function getCustomerFacingKnowledgeSummary(): string {
  const kb = getPublicKnowledgeBase();
  return [
    `Company: ${kb.company.brand_name} (${kb.company.legal_name})`,
    `Description: ${kb.company.description_he}`,
    `Support Phone: ${kb.contact.phone.display} (Short Dial: ${kb.contact.phone.short_dial})`,
    `Support Hours: ${kb.contact.support_hours.days_he}, ${kb.contact.support_hours.from} - ${kb.contact.support_hours.to}`,
    `Infrastructure Monitoring: 24/7 network & server supervision`,
    `Services: ${kb.services.map((s) => s.name_he).join(", ")}`,
    `Security Standards: ${kb.security.capabilities.join(", ")}`,
  ].join("\n");
}

type KnowledgeArticleRecord = {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  severity: string;
  audience: string;
  symptoms: string | null;
  diagnosisSteps: string | null;
  resolutionSteps: string | null;
  escalationCriteria: string | null;
  customerReplyTemplate: string | null;
  isPublished: boolean;
  updatedAt: Date;
};

export type CategoryKey =
  | "all"
  | "vpn"
  | "internet-network"
  | "email"
  | "security"
  | "backup"
  | "remote-support"
  | "user-account";

export type CustomerKnowledgeArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  categoryKey: CategoryKey;
  categoryLabel: string;
  tags: string[];
  severity: string;
  severityLabel: string;
  severityTone: string;
  readingTime: number;
  symptoms: string[];
  diagnosisSteps: string[];
  resolutionSteps: string[];
  escalationSteps: string[];
  customerReplyTemplate: string | null;
  updatedAt: string;
};

export const categoryFilters: Array<{ key: CategoryKey; label: string }> = [
  { key: "all", label: "הכל" },
  { key: "vpn", label: "VPN" },
  { key: "internet-network", label: "אינטרנט ורשת" },
  { key: "email", label: "אימייל" },
  { key: "security", label: "אבטחה" },
  { key: "backup", label: "גיבוי" },
  { key: "remote-support", label: "תמיכה מרחוק" },
  { key: "user-account", label: "חשבון משתמש" },
];

const customerSafeCategoryMap: Record<string, Exclude<CategoryKey, "all">> = {
  VPN: "vpn",
  Network: "internet-network",
  DNS: "internet-network",
  Email: "email",
  Security: "security",
  Backup: "backup",
  "Remote Support": "remote-support",
  Windows: "remote-support",
  Printer: "remote-support",
  Authentication: "user-account",
  "User Account": "user-account",
};

const categoryLabelMap: Record<Exclude<CategoryKey, "all">, string> = {
  vpn: "VPN",
  "internet-network": "אינטרנט ורשת",
  email: "אימייל",
  security: "אבטחה",
  backup: "גיבוי",
  "remote-support": "תמיכה מרחוק",
  "user-account": "חשבון משתמש",
};

const severityMap: Record<string, { label: string; tone: string }> = {
  LOW: {
    label: "פתרון מהיר",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  MEDIUM: {
    label: "נפוץ אצל לקוחות",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
  },
  HIGH: {
    label: "דורש תשומת לב",
    tone: "bg-rose-50 text-rose-700 border-rose-200",
  },
  CRITICAL: {
    label: "פנה לתמיכה בהקדם",
    tone: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
};

export function isCustomerSafeArticle(
  article: Pick<KnowledgeArticleRecord, "audience" | "isPublished" | "category">,
) {
  return (
    article.audience === "CUSTOMER" &&
    article.isPublished &&
    article.category in customerSafeCategoryMap
  );
}

export function mapCustomerArticle(
  article: KnowledgeArticleRecord,
): CustomerKnowledgeArticle {
  const categoryKey = customerSafeCategoryMap[article.category];
  const categoryLabel = categoryLabelMap[categoryKey];
  const severity = severityMap[article.severity] ?? severityMap.LOW;
  const markdownSections = parseMarkdownSections(article.content);
  const symptoms = extractList(article.symptoms) || markdownSections["תסמינים"] || [];
  const diagnosisSteps =
    extractList(article.diagnosisSteps) || markdownSections["שלבי אבחון"] || [];
  const resolutionSteps =
    extractList(article.resolutionSteps) || markdownSections["שלבי פתרון"] || [];
  const escalationSteps =
    extractList(article.escalationCriteria) ||
    markdownSections["קריטריונים להסלמה"] ||
    [];

  const summary =
    createSummary({
      title: article.title,
      resolutionSteps,
      diagnosisSteps,
      symptoms,
      fallback: article.content,
    }) || "מדריך קצר וברור לפתרון הבעיה ולצעדים הבאים מול צוות התמיכה.";

  const readingTime = estimateReadingTime(
    [
      article.title,
      summary,
      symptoms.join(" "),
      diagnosisSteps.join(" "),
      resolutionSteps.join(" "),
      escalationSteps.join(" "),
    ].join(" "),
  );

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary,
    category: article.category,
    categoryKey,
    categoryLabel,
    tags: article.tags,
    severity: article.severity,
    severityLabel: severity.label,
    severityTone: severity.tone,
    readingTime,
    symptoms,
    diagnosisSteps,
    resolutionSteps,
    escalationSteps,
    customerReplyTemplate: cleanInlineMarkdown(article.customerReplyTemplate),
    updatedAt: new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(article.updatedAt),
  };
}

function createSummary({
  title,
  resolutionSteps,
  diagnosisSteps,
  symptoms,
  fallback,
}: {
  title: string;
  resolutionSteps: string[];
  diagnosisSteps: string[];
  symptoms: string[];
  fallback: string;
}) {
  const firstResolution = resolutionSteps[0];
  const firstDiagnosis = diagnosisSteps[0];
  const firstSymptom = symptoms[0];

  if (firstResolution && firstDiagnosis) {
    return `המדריך מסביר כיצד ${firstDiagnosis.replace(/\.$/, "")} ולאחר מכן ${firstResolution.replace(/\.$/, "")}.`;
  }

  if (firstResolution) {
    return `המדריך מסביר כיצד ${firstResolution.replace(/\.$/, "")} ולחזור לעבודה במהירות.`;
  }

  if (firstSymptom) {
    return `אם ${firstSymptom.replace(/\.$/, "")}, המדריך יעזור לך להבין מה לבדוק ומה לעשות בשלב הבא.`;
  }

  const plainFallback = cleanInlineMarkdown(fallback);

  if (!plainFallback) {
    return "";
  }

  return truncateText(plainFallback.replace(title, "").trim(), 150);
}

function estimateReadingTime(text: string) {
  const words = cleanInlineMarkdown(text).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 110));
}

function truncateText(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, length).trimEnd()}...`;
}

export function cleanInlineMarkdown(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return normalizeCustomerText(
    value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim(),
  );
}

function extractList(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const items = value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => normalizeCustomerText(line.replace(/^[-*]\s*/, "").trim()))
    .filter(Boolean);

  return items.length > 0 ? items : null;
}

function parseMarkdownSections(markdown: string) {
  const sections: Record<string, string[]> = {};
  let currentSection = "";

  for (const rawLine of markdown.replace(/\r/g, "").split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const headingMatch = line.match(/^\*\*(.+?):\*\*$/);
    if (headingMatch) {
      currentSection = headingMatch[1];
      sections[currentSection] = [];
      continue;
    }

    if (currentSection) {
      sections[currentSection].push(
        normalizeCustomerText(line.replace(/^[-*]\s*/, "")),
      );
    }
  }

  return sections;
}

function normalizeCustomerText(text: string) {
  return text
    .replace(/\bagent\b/gi, "כלי התמיכה")
    .replace(/\bRDP\b/g, "שולחן עבודה מרוחק")
    .replace(/\bVPN client\b/gi, "יישום ה-VPN")
    .replace(/\bSafe Mode\b/gi, "מצב בטוח")
    .replace(/\bCPU\/RAM\/Disk\b/g, "עומס על משאבי המחשב")
    .replace(/\bevent logs\b/gi, "יומני המערכת")
    .replace(/\bMX records\b/gi, "רשומות קבלת הדואר")
    .replace(/\bSMTP\b/g, "הגדרות שליחת הדואר")
    .replace(/\bNTFS\/share permissions\b/gi, "הרשאות הגישה לקובץ")
    .replace(/\bWindows Update service\b/gi, "שירות העדכונים של Windows")
    .replace(/\bKnowledge Base\b/gi, "מאגר הידע")
    .replace(/\bfailed login attempts\b/gi, "ניסיונות התחברות שגויים")
    .replace(/\bMFA\b/g, "אימות דו-שלבי")
    .replace(/\bmalware\b/gi, "נוזקה")
    .replace(/\bDNS\b/g, "DNS")
    .replace(/\s{2,}/g, " ")
    .trim();
}

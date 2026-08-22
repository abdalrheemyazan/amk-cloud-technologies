"use server";

import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import type { Content } from "@google/genai";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import { GeminiNotConfiguredError, generateGeminiText } from "@/lib/ai/gemini";
import { embedText } from "@/lib/ai/embeddings";
import { matchKnowledgeChunks } from "@/lib/knowledge/vector-search";
import { maskSecrets } from "@/lib/ai/mask-secrets";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const MIN_CHUNK_SIMILARITY = 0.55;
const KNOWLEDGE_LIMIT = 5;
const MESSAGE_WINDOW = 25;
const MAX_MESSAGE_CHARS = 1000;
const MAX_NOTE_CHARS = 500;
const NOTE_WINDOW = 10;
const MAX_AGENT_INPUT = 2000;

const NO_KNOWLEDGE_LINE = "לא נמצא מידע מספיק במאגר הידע הפנימי.";
const GENERIC_ERROR = "לא ניתן להשלים את הניתוח כרגע. נסו שוב בעוד מספר רגעים.";
const MISSING_KEY_ERROR = "עוזר ה-AI אינו זמין כרגע. ניתן להמשיך בטיפול בפנייה באופן רגיל.";

export type SupportAiAction =
  | "diagnose"
  | "summary"
  | "already_tried"
  | "checks"
  | "solution"
  | "reply"
  | "followup_questions"
  | "missing_info"
  | "root_cause"
  | "custom";

export type SupportAiSource = {
  title: string;
  pageNumber: number | null;
  similarity: number;
};

export type SupportAiResult = {
  action: SupportAiAction;
  text: string;
  sources: SupportAiSource[];
  hasKnowledge: boolean;
};

export type AnalyzeSupportRequestInput = {
  sessionId: string;
  action: SupportAiAction;
  agentInput?: string;
};

const SYSTEM_INSTRUCTION = `אתה "עוזר AI טכני" פנימי בכיר של צוות התמיכה וההנדסה של AMK Cloud Technologies.
אתה מסייע לנציג/ת התמיכה ולטכנאים לנתח פניות, להבין היסטוריית שיחה, לזהות מה כבר נוסה, להציע בדיקות ופתרונות, ולנסח טיוטות תשובה.

כללי בטיחות ותפעול קריטיים:
1. ענה תמיד בעברית מקצועית, מדויקת, תמציתית ומובנית.
2. אתה כלי עזר מייעץ לנציג בלבד. אינך מבצע פעולות, אינך מפעיל שרתים מחדש, ואינך שולח הודעות ללקוח. הנציג האנושי בודק, עורך ומאשר.
3. סדר את הצעדים תמיד מהבטוח ביותר ועד לצעדים מתקדמים/מסוכנים.
4. לכל פעולה שעלולה לגרום לניתוק, אובדן מידע, שינוי אבטחה או השבתה – הוסף שורה בולטת: "⚠️ אזהרה: [תיאור הסיכון וההמלצה לגיבוי]".
5. התבסס אך ורק על פרטי הפנייה ועל "ידע פנימי רלוונטי" שסופק. אל תמציא נהלים, מחירים או מדיניות של AMK שלא מופיעים במקורות.
6. אם אין ידע פנימי מספיק במסמכים שצורפו, ציין במפורש בסעיף "מקורות": "${NO_KNOWLEDGE_LINE}".
7. "תגובה מוצעת ללקוח": חייבת להיות מנוסחת בנימוס, בבהירות, ללא שימוש בז'רגון פנימי של הצוות וללא הנחות שווא. לעולם אל תבקש סיסמאות או מפתחות אבטחה.

בכל תשובה החזר את הסעיפים הרלוונטיים בצורה ברורה עם הכותרות הבאות (כל כותרת בשורה חדשה ומודגשת):
**תקציר הפנייה**
**אבחון אפשרי וסיבת שורש**
**מה כבר נוסה ונבדק**
**מידע חסר הדורש בירור**
**בדיקות מומלצות**
**פתרון מוצע**
**רמת סיכון**
**שאלות המשך ללקוח**
**תגובה מוצעת ללקוח**
**מקורות**
**רמת ודאות** (גבוהה / בינונית / נמוכה)`;

const ACTION_FOCUS: Record<SupportAiAction, string> = {
  diagnose: "נתח את התקלה לעומק: מהי התקלה, מה הגורם הסביר ביותר, ומה מידת ההשפעה.",
  summary: "סכם את השיחה וההתקדמות עד כה בצורה מתומצתת וברורה עבור הנציג.",
  already_tried: "סקור את ההיסטוריה ורשום במדויק מה כבר נוסה על ידי הלקוח או הנציג, מה עבד ומה נכשל.",
  checks: "הצע רשימת בדיקות מומלצות ומדורגות שהנציג יכול לבצע או לבקש מהלקוח לבדוק.",
  solution: "הצע פתרון מעשי שלב-אחר-שלב לפתרון התקלה, כולל אזהרות בטיחות והנחיות גיבוי.",
  reply: "נסח טיוטת מענה מקצועית וברורה ללקוח בסעיף 'תגובה מוצעת ללקוח' שתעזור לקדם את הפתרון.",
  followup_questions: "הצע 2-4 שאלות ממוקדות שיעזרו לנציג לקבל מידע חיוני מהלקוח להמשך האבחון.",
  missing_info: "זהה איזה מידע טכני או לוגי חסר כרגע כדי לאבחן את הבעיה באופן חד-משמעי.",
  root_cause: "הערך מהי סיבת השורש (Root Cause) הסבירה לתקלה על בסיס הסימפטומים ומאגר הידע.",
  custom: "התייחס לשאלת הנציג או למידע הנוסף שסיפק, ועדכן את הניתוח הטכני בהתאם.",
};

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !STAFF_ROLES.includes(session.user.role as Role)) return null;
  return { id: session.user.id as string, role: session.user.role as Role };
}

function senderLabel(role: string): string {
  if (role === "CUSTOMER") return "לקוח";
  if (
    role === "SUPPORT_AGENT" ||
    role === "TECHNICIAN" ||
    role === "TEAM_LEADER" ||
    role === "CLOUD_ENGINEER" ||
    role === "ADMINISTRATOR"
  ) {
    return "נציג תמיכה";
  }
  return "מערכת";
}

export async function analyzeSupportRequest(
  input: AnalyzeSupportRequestInput,
): Promise<ActionResult<SupportAiResult>> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "UNAUTHORIZED" };

  const sessionId = typeof input.sessionId === "string" ? input.sessionId.trim() : "";
  if (!sessionId || sessionId.length > 100) return { ok: false, error: "NOT_FOUND" };

  const action: SupportAiAction = input.action in ACTION_FOCUS ? input.action : "diagnose";
  const agentInput = maskSecrets(
    typeof input.agentInput === "string" ? input.agentInput.trim().slice(0, MAX_AGENT_INPUT) : "",
  );

  try {
    const session = await prisma.supportSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        status: true,
        subject: true,
        category: true,
        summary: true,
        technicianId: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            phone: true,
            requestedService: true,
            businessField: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          take: MESSAGE_WINDOW,
          where: { deletedAt: null },
          select: {
            senderRole: true,
            message: true,
            createdAt: true,
            files: { select: { fileName: true, fileType: true, fileSize: true } },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: NOTE_WINDOW,
          select: { content: true, createdAt: true },
        },
        transfers: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            note: true,
            fromAgent: { select: { name: true } },
            toAgent: { select: { name: true } },
          },
        },
      },
    });

    if (!session) return { ok: false, error: "NOT_FOUND" };

    const canAccess =
      session.technicianId === staff.id ||
      session.technicianId === null ||
      staff.role === "ADMINISTRATOR" ||
      staff.role === "TEAM_LEADER" ||
      staff.role === "CLOUD_ENGINEER" ||
      staff.role === "TECHNICIAN";

    if (!canAccess) return { ok: false, error: "NOT_FOUND" };

    // ---- Build masked context ------------------------------------------
    const conversation = session.messages
      .map((m) => {
        const timeStr = m.createdAt.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
        const text = maskSecrets(m.message).slice(0, MAX_MESSAGE_CHARS);
        const filesStr = m.files.length > 0
          ? ` [קבצים מצורפים: ${m.files.map((f) => f.fileName).join(", ")}]`
          : "";
        return `[${timeStr}] ${senderLabel(m.senderRole)}: ${text}${filesStr}`;
      })
      .join("\n");

    const notes = session.notes
      .map((n) => `- ${maskSecrets(n.content).slice(0, MAX_NOTE_CHARS)}`)
      .join("\n");

    const transfers = session.transfers
      .map(
        (t) =>
          `- הועבר מ-${t.fromAgent?.name || "נציג"} ל-${t.toAgent?.name || "נציג"}${t.note ? `: ${t.note}` : ""}`,
      )
      .join("\n");

    const customerInfo = session.customer
      ? [
          session.customer.name ? `שם: ${session.customer.name}` : null,
          session.customer.companyName ? `חברה: ${session.customer.companyName}` : null,
          session.customer.requestedService ? `שירות מבוקש: ${session.customer.requestedService}` : null,
          session.customer.businessField ? `תחום פעילות: ${session.customer.businessField}` : null,
        ]
          .filter(Boolean)
          .join(" | ")
      : "לקוח ללא פרטי פרופיל נוספים";

    // ---- Knowledge Base Search with RBAC --------------------------------
    const knowledgeAudiences =
      staff.role === "SUPPORT_AGENT"
        ? ["CUSTOMER_VISIBLE", "SUPPORT_INTERNAL"]
        : ["CUSTOMER_VISIBLE", "SUPPORT_INTERNAL", "TECHNICIAN_ONLY"];

    const knowledgeQuery = maskSecrets(
      [
        session.subject,
        session.category,
        session.summary,
        agentInput,
        session.messages.find((m) => m.senderRole === "CUSTOMER")?.message,
      ]
        .filter(Boolean)
        .join(" ")
        .slice(0, 1500),
    );

    const sources: SupportAiSource[] = [];
    let knowledgeText = "";
    let hasKnowledge = false;

    try {
      if (knowledgeQuery.trim()) {
        const queryEmbedding = await embedText(knowledgeQuery, "RETRIEVAL_QUERY");
        const chunks = await matchKnowledgeChunks({
          queryEmbedding,
          audience: knowledgeAudiences,
          limit: KNOWLEDGE_LIMIT,
          minSimilarity: MIN_CHUNK_SIMILARITY,
        });
        hasKnowledge = chunks.length > 0;
        knowledgeText = chunks
          .map((chunk, index) =>
            [
              `מקור ${index + 1}: ${chunk.title ?? "מאגר הידע של AMK"}${chunk.pageNumber ? ` (עמוד ${chunk.pageNumber})` : ""}`,
              chunk.content,
            ].join("\n"),
          )
          .join("\n---\n");

        const seen = new Set<string>();
        for (const chunk of chunks) {
          const title = chunk.title ?? "מאגר הידע של AMK";
          const key = `${title}#${chunk.pageNumber ?? ""}`;
          if (seen.has(key)) continue;
          seen.add(key);
          sources.push({
            title,
            pageNumber: chunk.pageNumber,
            similarity: Math.round(chunk.similarity * 100) / 100,
          });
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("support AI knowledge retrieval failed:", error);
      }
    }

    // ---- Compose Prompt -------------------------------------------------
    const promptSections = [
      `פרטי פנייה #${session.id.slice(-6).toUpperCase()}:`,
      `כותרת / נושא: ${maskSecrets(session.subject) || "ללא כותרת"}`,
      `שירות / קטגוריה: ${session.category || "תמיכה כללית"}`,
      `סטטוס טיפול: ${session.status}`,
      `תקציר ראשוני: ${maskSecrets(session.summary) || "אין תקציר"}`,
      `פרטי לקוח: ${customerInfo}`,
      transfers ? `היסטוריית העברות:\n${transfers}` : null,
      notes ? `הערות פנימיות של הצוות:\n${notes}` : null,
      conversation ? `תמליל השיחה המלא:\n${conversation}` : "אין הודעות בשיחה עדיין.",
      agentInput ? `מידע או שאלה שהנציג הוסיף ידנית:\n${agentInput}` : null,
      hasKnowledge
        ? `ידע פנימי רלוונטי ממאגר הידע:\n${knowledgeText}`
        : `ידע פנימי: לא נמצאו מסמכים תואמים. ציין בסעיף מקורות: "${NO_KNOWLEDGE_LINE}".`,
      `מיקוד המשימה הנדרשת: ${ACTION_FOCUS[action]}`,
    ].filter(Boolean);

    const contents: Content[] = [{ role: "user", parts: [{ text: promptSections.join("\n\n") }] }];

    let text: string;
    try {
      text = await generateGeminiText({
        systemInstruction: SYSTEM_INSTRUCTION,
        contents,
        maxOutputTokens: 1600,
        timeoutMs: 20_000,
      });
    } catch (error) {
      if (error instanceof GeminiNotConfiguredError) {
        return { ok: false, error: MISSING_KEY_ERROR };
      }
      const correlationId = randomUUID().slice(0, 8).toUpperCase();
      console.error(`[ERR-${correlationId}] Support AI generation failed:`, error);
      return { ok: false, error: `${GENERIC_ERROR} (קוד: ERR-${correlationId})` };
    }

    return { ok: true, data: { action, text, sources, hasKnowledge } };
  } catch (error) {
    const correlationId = randomUUID().slice(0, 8).toUpperCase();
    console.error(`[ERR-${correlationId}] analyzeSupportRequest failed:`, error);
    return { ok: false, error: `${GENERIC_ERROR} (קוד: ERR-${correlationId})` };
  }
}

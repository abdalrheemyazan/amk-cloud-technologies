"use server";

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

// Support agents may read customer-facing AND internal support knowledge; the
// customer chatbot stays restricted to CUSTOMER_VISIBLE elsewhere.
const SUPPORT_KNOWLEDGE_AUDIENCES = ["CUSTOMER_VISIBLE", "SUPPORT_INTERNAL", "TECHNICIAN_ONLY"];
const MIN_CHUNK_SIMILARITY = 0.6;
const KNOWLEDGE_LIMIT = 5;
const MESSAGE_WINDOW = 14;
const MAX_MESSAGE_CHARS = 800;
const MAX_NOTE_CHARS = 400;
const NOTE_WINDOW = 5;
const MAX_AGENT_INPUT = 2000;

const NO_KNOWLEDGE_LINE = "לא נמצא מידע מספיק במאגר הידע הפנימי.";
const GENERIC_ERROR = "לא ניתן להשלים את הניתוח כרגע. נסה שוב.";
const MISSING_KEY_ERROR = "העוזר החכם אינו זמין כרגע.";

export type SupportAiAction =
  | "diagnose"
  | "checks"
  | "solution"
  | "reply"
  | "summary"
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

const SYSTEM_INSTRUCTION = `אתה "עוזר AI טכני" פנימי של צוות התמיכה של AMK Cloud Technologies.
אתה מסייע לנציג/ת התמיכה בלבד — לא ללקוח, ולא באופן אוטומטי.

כללי ליבה:
- ענה תמיד בעברית, בקצרה, בצורה מעשית ומקצועית.
- אתה מציע צעדים בלבד. אינך מבצע פעולות ואינך שולח דבר ללקוח.
- לעולם אל תטען שביצעת פעולה (הפעלה מחדש של שרת, פקודות מערכת, שינוי סיסמאות, חומת אש, פורטים, מחיקת מידע, סגירת/שיוך פנייה).
- סדר את הצעדים מהבטוח ביותר להמשך ועד המסוכן.
- לכל פעולה מסוכנת הוסף אזהרה ברורה בשורה נפרדת עם הקידומת "⚠️ אזהרה:".
- בסס את התשובה על "ידע פנימי רלוונטי" שסופק בלבד. אל תמציא נהלים, מחירים או מדיניות של AMK.
- אם אין ידע פנימי מספיק, כתוב בסעיף "מקורות" את המשפט: "${NO_KNOWLEDGE_LINE}".
- אל תכלול הערות פנימיות בתוך "תגובה מוצעת ללקוח". התשובה ללקוח חייבת להיות מנוסחת, מנומסת ובלי מונחים פנימיים.
- אל תבקש מהלקוח סיסמאות, טוקנים, מפתחות API או פרטי אשראי.

בכל תשובה החזר בדיוק את הסעיפים הבאים, כל אחד בשורה חדשה עם הכותרת המדויקת:
סיכום התקלה
אבחון אפשרי
בדיקות מומלצות
פתרון מוצע
רמת סיכון
שאלות נוספות ללקוח
תגובה מוצעת ללקוח
מקורות
רמת ודאות

תחת "מקורות" ציין את שמות מסמכי הידע שהתבססת עליהם, או את משפט חוסר הידע. תחת "רמת ודאות" כתוב: גבוהה / בינונית / נמוכה.`;

const ACTION_FOCUS: Record<SupportAiAction, string> = {
  diagnose: "התמקד באבחון התקלה: מה הגורם הסביר ביותר ומדוע.",
  checks: "התמקד בבדיקות המומלצות שהנציג יכול לבצע או לבקש מהלקוח, מהבטוח ביותר ועד המתקדם.",
  solution: "התמקד בפתרון המוצע, שלב אחר שלב, תוך ציון סיכונים.",
  reply: "התמקד בניסוח 'תגובה מוצעת ללקוח' — ברורה, אדיבה ומקצועית. שאר הסעיפים יכולים להיות תמציתיים.",
  summary: "התמקד ב'סיכום התקלה' ובמצב הנוכחי של הטיפול. שאר הסעיפים תמציתיים.",
  custom: "התייחס למידע/לשאלה שהנציג הוסיף, ועדכן את הניתוח בהתאם.",
};

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !STAFF_ROLES.includes(session.user.role as Role)) return null;
  return { id: session.user.id as string, role: session.user.role as Role };
}

function senderLabel(role: string): string {
  if (role === "CUSTOMER") return "לקוח";
  if (role === "SUPPORT_AGENT" || role === "TECHNICIAN" || role === "TEAM_LEADER" || role === "CLOUD_ENGINEER" || role === "ADMINISTRATOR") {
    return "נציג";
  }
  return "עוזר";
}

export async function analyzeSupportRequest(
  input: AnalyzeSupportRequestInput,
): Promise<ActionResult<SupportAiResult>> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "UNAUTHORIZED" };

  const sessionId = typeof input.sessionId === "string" ? input.sessionId : "";
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
        customer: { select: { name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
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
          select: { content: true },
        },
      },
    });

    if (!session) return { ok: false, error: "NOT_FOUND" };

    // Access: the owning agent, an unassigned/pending request, or a lead/admin.
    const canAccess =
      session.technicianId === staff.id ||
      session.technicianId === null ||
      staff.role === "ADMINISTRATOR" ||
      staff.role === "TEAM_LEADER";
    if (!canAccess) return { ok: false, error: "NOT_FOUND" };

    // ---- Build masked context ------------------------------------------
    const conversation = session.messages
      .slice()
      .reverse()
      .map((m) => `${senderLabel(m.senderRole)}: ${maskSecrets(m.message).slice(0, MAX_MESSAGE_CHARS)}`)
      .join("\n");

    const attachmentMeta = session.messages
      .flatMap((m) => m.files.map((f) => `${f.fileName} (${f.fileType}, ${f.fileSize} bytes)`))
      .slice(0, 8)
      .join(", ");

    const notes = session.notes
      .map((n) => `- ${maskSecrets(n.content).slice(0, MAX_NOTE_CHARS)}`)
      .join("\n");

    // ---- Retrieve internal knowledge (masked query) --------------------
    const knowledgeQuery = maskSecrets(
      [session.subject, session.category, session.summary, agentInput, session.messages.find((m) => m.senderRole === "CUSTOMER")?.message]
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
          audience: SUPPORT_KNOWLEDGE_AUDIENCES,
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
          sources.push({ title, pageNumber: chunk.pageNumber, similarity: Math.round(chunk.similarity * 100) / 100 });
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("support AI knowledge retrieval failed:", error);
      }
      // Continue without knowledge — the model is instructed to say so.
    }

    // ---- Compose prompt -------------------------------------------------
    const promptSections = [
      `כותרת הפנייה: ${maskSecrets(session.subject) || "—"}`,
      `שירות / תחום: ${session.category || "—"}`,
      `סטטוס: ${session.status}`,
      `תקציר: ${maskSecrets(session.summary) || "—"}`,
      `לקוח: ${session.customer?.name || "—"}`,
      attachmentMeta ? `קבצים מצורפים (מטא-דאטה בלבד): ${attachmentMeta}` : null,
      conversation ? `שיחה אחרונה:\n${conversation}` : "שיחה אחרונה: אין הודעות.",
      notes ? `הערות פנימיות של הנציג (לא לשילוב בתגובה ללקוח):\n${notes}` : null,
      agentInput ? `מידע/שאלה שהנציג הוסיף:\n${agentInput}` : null,
      hasKnowledge
        ? `ידע פנימי רלוונטי:\n${knowledgeText}`
        : `ידע פנימי רלוונטי: לא נמצא. כתוב בסעיף מקורות: "${NO_KNOWLEDGE_LINE}" ואל תמציא נהלים.`,
      `מיקוד המשימה: ${ACTION_FOCUS[action]}`,
    ].filter(Boolean);

    const contents: Content[] = [{ role: "user", parts: [{ text: promptSections.join("\n\n") }] }];

    let text: string;
    try {
      text = await generateGeminiText({
        systemInstruction: SYSTEM_INSTRUCTION,
        contents,
        maxOutputTokens: 1400,
        timeoutMs: 20_000,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development" && !(error instanceof GeminiNotConfiguredError)) {
        console.error("support AI generate failed:", error);
      }
      return {
        ok: false,
        error: error instanceof GeminiNotConfiguredError ? MISSING_KEY_ERROR : GENERIC_ERROR,
      };
    }

    return { ok: true, data: { action, text, sources, hasKnowledge } };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("analyzeSupportRequest failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

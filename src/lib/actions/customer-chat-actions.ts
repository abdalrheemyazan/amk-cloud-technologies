"use server";

import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import type { Content } from "@google/genai";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  GeminiNotConfiguredError,
  generateGeminiText,
} from "@/lib/ai/gemini";
import {
  buildIntentReply,
  classifyChatIntent,
  detectMessageLanguage,
} from "@/lib/ai/chat-intent";
import {
  matchFastKnowledgeIntent,
  getCustomerFacingKnowledgeSummary,
} from "@/lib/knowledge/public-knowledge-loader";
import {
  discardStagedSupportAttachments,
  stageSupportAttachments,
  storedSupportAttachmentView,
  supportAttachmentCreateData,
  supportAttachmentExpiry,
  validateSupportAttachments,
  type SupportAttachmentUpload,
  type SupportAttachmentView,
} from "@/lib/support-attachments";
import { removeSupportAttachmentObjects } from "@/lib/support-attachment-storage";
import { embedText } from "@/lib/ai/embeddings";
import { matchKnowledgeChunks } from "@/lib/knowledge/vector-search";

const CUSTOMER_KNOWLEDGE_AUDIENCE = "CUSTOMER_VISIBLE";
// Calibrated against this project's real content: genuine semantic matches on
// the seeded AMK knowledge articles score ~0.67-0.72, while off-topic queries
// (e.g. "what's the weather today?") top out around ~0.58. 0.65 keeps clear
// separation from the off-topic ceiling without filtering out real matches.
const MIN_CHUNK_SIMILARITY = 0.65;

const AI_STATUS = "AI_CHAT";
const AI_SENDER_ID = "gemini-amk-support";
const MAX_MESSAGE_LENGTH = 3000;
const COOLDOWN_MS = 1500;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GENERIC_AI_ERROR =
  "לא ניתן לקבל תשובה מהעוזר החכם כרגע. אפשר לנסות שוב או להעביר את הפנייה לנציג תמיכה.";
const MISSING_KEY_ERROR = "העוזר החכם אינו זמין כרגע.";
const GENERIC_ACTION_ERROR = "לא ניתן לבצע את הפעולה כרגע. נסה שוב בעוד מספר רגעים.";
const DELETED_MESSAGE_PLACEHOLDER = "הודעה נמחקה";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; conversationId?: string };

export type CustomerAiChatMessage = {
  id: string;
  from: "bot" | "user";
  text: string;
  createdAt: string;
  attachments: SupportAttachmentView[];
  deletable: boolean;
  deleted: boolean;
};

export type CustomerAiConversationView = {
  conversationId: string;
  category: string | null;
  messages: CustomerAiChatMessage[];
};

export type SendCustomerChatInput = {
  conversationId?: string | null;
  message: string;
  category?: string | null;
  attachments?: SupportAttachmentUpload[];
};

async function requireCustomer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "CUSTOMER") return null;
  return { id: session.user.id as string };
}

function expiresAt() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function messageView(message: {
  id: string;
  senderRole: string;
  message: string;
  createdAt: Date;
  deletedAt: Date | null;
  files: Array<{ id: string; fileName: string; fileSize: number; fileType: string }>;
}): CustomerAiChatMessage {
  const isDeleted = !!message.deletedAt;
  const isCustomerMessage = message.senderRole === "CUSTOMER";
  return {
    id: message.id,
    from: isCustomerMessage ? "user" : "bot",
    text: isDeleted ? DELETED_MESSAGE_PLACEHOLDER : message.message,
    createdAt: message.createdAt.toISOString(),
    attachments: isDeleted ? [] : message.files.map(storedSupportAttachmentView),
    deletable: isCustomerMessage && !isDeleted,
    deleted: isDeleted,
  };
}

function compactSnippet(value: string | null, maxLength = 900) {
  return value?.replace(/\s+/g, " ").trim().slice(0, maxLength) || "";
}

function searchTerms(message: string, category: string | null) {
  return Array.from(
    new Set(
      `${category || ""} ${message}`
        .toLocaleLowerCase("he")
        .split(/[^\p{L}\p{N}]+/u)
        .filter((term) => term.length >= 3)
        .slice(0, 6),
    ),
  );
}

// Legacy keyword search over KnowledgeArticle — kept only as a fallback for
// when semantic search finds nothing (e.g. embeddings API hiccup, or content
// that hasn't been synced into the vector index yet). Not the primary path.
async function keywordFallbackSearch(message: string, category: string | null) {
  const terms = searchTerms(message, category);
  const categoryFilter = category
    ? [{ category: { contains: category.slice(0, 80), mode: "insensitive" as const } }]
    : [];
  const termFilters = terms.flatMap((term) => [
    { title: { contains: term, mode: "insensitive" as const } },
    { content: { contains: term, mode: "insensitive" as const } },
    { category: { contains: term, mode: "insensitive" as const } },
    { tags: { has: term } },
  ]);

  // With no category and no usable search terms (e.g. a very short message),
  // there's no real signal to ground on — matching every published article
  // regardless of relevance would hand Gemini unrelated context, so bail out.
  if (categoryFilter.length === 0 && termFilters.length === 0) {
    return { hasMatch: false, text: "" };
  }

  const articles = await prisma.knowledgeArticle.findMany({
    where: {
      isPublished: true,
      audience: "CUSTOMER",
      OR: [...categoryFilter, ...termFilters],
    },
    select: {
      title: true,
      category: true,
      content: true,
      symptoms: true,
      resolutionSteps: true,
      customerReplyTemplate: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  const text = articles
    .map((article) =>
      [
        `Title: ${article.title}`,
        `Category: ${article.category}`,
        compactSnippet(article.content),
        compactSnippet(article.symptoms, 400),
        compactSnippet(article.resolutionSteps, 700),
        compactSnippet(article.customerReplyTemplate, 500),
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n---\n\n");

  return { hasMatch: articles.length > 0, text };
}

// Primary grounding path: embed the customer's question and search the
// pgvector index by meaning, not exact words. Only chunks above the
// similarity threshold are used — anything weaker is treated as no match at
// all, same as if nothing had been found.
async function semanticSearchKnowledge(message: string) {
  const queryEmbedding = await embedText(message, "RETRIEVAL_QUERY");
  const chunks = await matchKnowledgeChunks({
    queryEmbedding,
    audience: CUSTOMER_KNOWLEDGE_AUDIENCE,
    limit: 5,
    minSimilarity: MIN_CHUNK_SIMILARITY,
  });

  if (chunks.length === 0) return { hasMatch: false, text: "" };

  const text = chunks
    .map((chunk, index) =>
      [
        `Source ${index + 1}:`,
        `Document: ${chunk.title ?? "AMK Knowledge Base"}`,
        chunk.pageNumber ? `Page: ${chunk.pageNumber}` : null,
        `Content:\n${chunk.content}`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n---\n");

  return { hasMatch: true, text };
}

async function retrieveKnowledgeContext(message: string, category: string | null) {
  try {
    const semantic = await semanticSearchKnowledge(message);
    if (semantic.hasMatch) return semantic;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Semantic knowledge search failed, falling back to keyword search:", error);
    }
  }

  return keywordFallbackSearch(message, category);
}

async function saveUserMessage({
  attachments,
  conversationId,
  message,
  userId,
}: {
  attachments: ReturnType<typeof validateSupportAttachments> & { ok: true };
  conversationId: string;
  message: string;
  userId: string;
}) {
  const messageId = randomUUID();
  const staged = await stageSupportAttachments({
    attachments: attachments.attachments,
    messageId,
    scope: conversationId,
  });

  try {
    return await prisma.sessionMessage.create({
      data: {
        id: messageId,
        sessionId: conversationId,
        senderId: userId,
        senderRole: "CUSTOMER",
        message,
        files:
          staged.length > 0
            ? {
                create: staged.map((attachment) =>
                  supportAttachmentCreateData(attachment, {
                    expiresAt: supportAttachmentExpiry(),
                    sessionId: conversationId,
                    uploadedById: userId,
                  }),
                ),
              }
            : undefined,
      },
      include: { files: true },
    });
  } catch (error) {
    await discardStagedSupportAttachments(staged).catch((cleanupError) => {
      console.error("Failed to roll back customer AI attachments:", cleanupError);
    });
    throw error;
  }
}

export async function getCustomerAiConversation(
  conversationId: string,
): Promise<ActionResult<CustomerAiConversationView>> {
  const customer = await requireCustomer();
  if (!customer) return { ok: false, error: "UNAUTHORIZED" };
  if (!conversationId || conversationId.length > 100) return { ok: false, error: "NOT_FOUND" };

  try {
    const conversation = await prisma.supportSession.findFirst({
      where: {
        id: conversationId,
        customerId: customer.id,
        status: AI_STATUS,
        customerDeletedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        category: true,
        messages: {
          orderBy: { createdAt: "asc" },
          take: 40,
          include: { files: true },
        },
      },
    });
    if (!conversation) return { ok: false, error: "NOT_FOUND" };

    return {
      ok: true,
      data: {
        conversationId: conversation.id,
        category: conversation.category,
        messages: conversation.messages.map(messageView),
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("getCustomerAiConversation failed:", error);
    return { ok: false, error: GENERIC_AI_ERROR };
  }
}

export async function sendCustomerChatMessage(
  input: SendCustomerChatInput,
): Promise<ActionResult<{ conversationId: string; userMessage: CustomerAiChatMessage; reply: CustomerAiChatMessage }>> {
  const customer = await requireCustomer();
  if (!customer) return { ok: false, error: "UNAUTHORIZED" };

  const message = typeof input.message === "string" ? input.message.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim().slice(0, 80) || null : null;
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "ניתן לשלוח עד 3,000 תווים בכל הודעה." };
  }

  const validatedAttachments = validateSupportAttachments(input.attachments);
  if (!validatedAttachments.ok) return { ok: false, error: validatedAttachments.error };
  if (!message && validatedAttachments.attachments.length === 0) {
    return { ok: false, error: "יש לכתוב הודעה או לצרף תמונה לפני השליחה." };
  }
  const persistedMessage = message || "צורפה תמונה לבדיקה.";

  const startedAt = performance.now();
  let conversationId: string | undefined;
  try {
    const existing = input.conversationId
      ? await prisma.supportSession.findFirst({
          where: { id: input.conversationId, customerId: customer.id, status: AI_STATUS, customerDeletedAt: null },
          select: { id: true, category: true, expiresAt: true },
        })
      : null;

    if (input.conversationId && (!existing || (existing.expiresAt && existing.expiresAt <= new Date()))) {
      return { ok: false, error: "השיחה אינה זמינה עוד. אפשר להתחיל שיחה חדשה." };
    }

    const conversation =
      existing ??
      (await prisma.supportSession.create({
        data: {
          customerId: customer.id,
          status: AI_STATUS,
          isAiOnly: true,
          category,
          subject: generateConversationTitle(persistedMessage, category),
          summary: persistedMessage.slice(0, 1000),
          expiresAt: expiresAt(),
        },
        select: { id: true, category: true, expiresAt: true },
      }));
    conversationId = conversation.id;

    const previousMessages = await prisma.sessionMessage.findMany({
      where: { sessionId: conversation.id, deletedAt: null },
      select: { senderRole: true, message: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    const latestCustomerMessage = previousMessages.find((entry) => entry.senderRole === "CUSTOMER");
    if (latestCustomerMessage && Date.now() - latestCustomerMessage.createdAt.getTime() < COOLDOWN_MS) {
      return { ok: false, error: "יש להמתין רגע קצר לפני שליחת הודעה נוספת.", conversationId };
    }

    const savedUserMessage = await saveUserMessage({
      attachments: validatedAttachments,
      conversationId: conversation.id,
      message: persistedMessage,
      userId: customer.id,
    });

function maskSensitiveData(text: string): string {
  return text
    .replace(/(?:bearer\s+)[a-zA-Z0-9_\-\.]{20,}/gi, "Bearer [MASKED_TOKEN]")
    .replace(/(?:api[_-]?key[:=]\s*)[a-zA-Z0-9_\-]{16,}/gi, "api_key=[MASKED_KEY]")
    .replace(/(?:password[:=]\s*)[^\s]{4,}/gi, "password=[MASKED_PASSWORD]")
    .replace(/\b[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g, (match) => {
      if (match.length > 40 && match.includes(".")) return "[MASKED_JWT]";
      return match;
    });
}

function generateConversationTitle(message: string, category?: string | null): string {
  const norm = message.toLowerCase();
  if (norm.includes("vpn")) return "בעיית חיבור VPN";
  if (norm.includes("vps") || norm.includes("שרת")) return "תקלה בשרת VPS";
  if (norm.includes("דואר") || norm.includes("אימייל") || norm.includes("outlook")) return "בעיה בדואר אלקטרוני";
  if (norm.includes("שעות") || norm.includes("טלפון") || norm.includes("קשר")) return "בירור שעות פעילות וקשר";
  if (norm.includes("גיבוי") || norm.includes("backup")) return "שחזור וגיבוי נתונים";
  if (norm.includes("אבטחה") || norm.includes("security")) return "אבטחת מידע וגישה";
  if (category) return `פנייה בנושא ${category}`;
  const clean = message.trim().slice(0, 35);
  return clean ? `${clean}...` : "שיחת תמיכה עם העוזר";
}

    const selectedCategory = category || conversation.category;
    const language = detectMessageLanguage(message || persistedMessage);

    const intent = validatedAttachments.attachments.length > 0 && !message
      ? "GENERAL_SUPPORT_QUESTION"
      : classifyChatIntent(message);

    const cannedReply = buildIntentReply(intent, language);

    let replyText: string;
    let responseSource = "canned";
    let ragMatchCount = 0;

    // 1. Dynamic database queries (never static)
    if (intent === "TICKET_STATUS") {
      responseSource = "database_tickets";
      const myTickets = await prisma.supportSession.findMany({
        where: {
          customerId: customer.id,
          status: { in: ["PENDING", "ACTIVE", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_CUSTOMER", "RESOLVED"] },
          customerDeletedAt: null,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          subject: true,
          category: true,
          status: true,
          updatedAt: true,
        },
      });

      if (myTickets.length === 0) {
        replyText =
          language === "ar"
            ? "لا توجد لديك طلبات مفتوحة حالياً. يمكنك فتح طلب جديد عبر زر 'פתיחת פנייה חדשה'."
            : language === "en"
            ? "You currently have no open support requests. You can open a new request using the 'New Request' button."
            : "לא נמצאו פניות פתוחות בחשבונך כרגע. באפשרותך לפתוח פנייה חדשה בלחיצה על 'פתיחת פנייה חדשה'.";
      } else {
        const lines = myTickets.map((t) => {
          const displayId = `#REQ-${t.id.slice(-6).toUpperCase()}`;
          const statusName =
            t.status === "PENDING"
              ? "ממתין לנציג"
              : ["ACTIVE", "IN_PROGRESS"].includes(t.status)
              ? "בטיפול פעיל"
              : ["WAITING_FOR_CUSTOMER", "WAITING_CUSTOMER"].includes(t.status)
              ? "ממתין לתשובתך"
              : "נפתר";
          return `• ${displayId} | ${t.subject || t.category || "פניית שירות"} (${statusName})`;
        });
        replyText =
          language === "ar"
            ? `إليك طلبات الدعم النشطة في حسابك:\n${lines.join("\n")}\n\nلعرض التفاصيل الكاملة والمراسلة، توجه إلى تبويب 'הפניות שלי'.`
            : language === "en"
            ? `Here are your active support requests in AMK:\n${lines.join("\n")}\n\nTo view full details or reply, navigate to 'My Requests'.`
            : `הנה הפניות הפעילות שלך במערכת AMK:\n${lines.join("\n")}\n\nלצפייה בפרטים המלאים והתכתבות, היכנס ללשונית 'הפניות שלי'.`;
      }
    } else {
      // 2. Check Fast Intents from canonical JSON Knowledge Base (bypasses Gemini)
      const fastMatch = matchFastKnowledgeIntent(persistedMessage, language);

      if (fastMatch.matched && fastMatch.answer) {
        responseSource = "fast_intent_json";
        replyText = fastMatch.answer;
      } else if (cannedReply) {
        // 3. Small talk & system actions (greetings, thanks, handoff trigger)
        responseSource = "canned_intent";
        replyText = cannedReply;
      } else {
        // 4. Free-form technical questions or complex inquiries -> Grounded RAG + Gemini
        responseSource = "rag_gemini";
        const sanitizedQuery = maskSensitiveData(persistedMessage);
        const knowledge = await retrieveKnowledgeContext(sanitizedQuery, selectedCategory);
        if (knowledge.hasMatch) ragMatchCount = 1;

        const attachmentMetadata = validatedAttachments.attachments.length
          ? validatedAttachments.attachments
              .map((attachment) => `${attachment.fileName} (${attachment.fileType}, ${attachment.fileSize} bytes)`)
              .join(", ")
          : "None";

        const targetLangName = language === "ar" ? "Arabic" : language === "en" ? "English" : "Hebrew";
        const publicKnowledgeSummary = getCustomerFacingKnowledgeSummary();

        const currentPrompt = [
          `Customer message (HIGHEST PRIORITY): "${sanitizedQuery}"`,
          `Customer selected category: ${selectedCategory || "General / None"}`,
          `Screenshot attachments metadata: ${attachmentMetadata}`,
          `Canonical AMK Public Company Info:\n${publicKnowledgeSummary}`,
          `Relevant Knowledge Base Articles:\n${
            knowledge.hasMatch
              ? knowledge.text
              : "No specific article matched. Provide standard IT diagnostic questions, step-by-step guidance, and offer ticket creation / human agent handoff."
          }`,
          `Instruction: Respond directly to the customer in ${targetLangName}. Be professional, step-by-step, and concise. Never invent internal passwords or secrets.`,
        ].join("\n\n");

        const contents: Content[] = [
          ...previousMessages
            .slice(-4)
            .reverse()
            .map((entry) => ({
              role: entry.senderRole === "CUSTOMER" ? ("user" as const) : ("model" as const),
              parts: [{ text: maskSensitiveData(entry.message).slice(0, MAX_MESSAGE_LENGTH) }],
            })),
          { role: "user" as const, parts: [{ text: currentPrompt }] },
        ];

        try {
          replyText = await generateGeminiText({ contents });
        } catch (error) {
          if (process.env.NODE_ENV === "development" && !(error instanceof GeminiNotConfiguredError)) {
            console.error("Gemini customer chat failed:", error);
          }
          return {
            ok: false,
            error: error instanceof GeminiNotConfiguredError ? MISSING_KEY_ERROR : GENERIC_AI_ERROR,
            conversationId,
          };
        }
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.info(
        `[customer-chat] conv=${conversation.id} intent=${intent} lang=${language} ragMatch=${ragMatchCount > 0} source=${responseSource}`
      );
    }

    const assistantMessage = await prisma.sessionMessage.create({
      data: {
        sessionId: conversation.id,
        senderId: AI_SENDER_ID,
        senderRole: "SUPPORT_AGENT",
        type: "AI_ASSISTANT",
        message: replyText.slice(0, 5000),
      },
      include: { files: true },
    });
    await prisma.supportSession.update({
      where: { id: conversation.id },
      data: {
        category: selectedCategory,
        summary: persistedMessage.slice(0, 1000),
        expiresAt: expiresAt(),
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.info(`[perf] customer-ai-message ${Math.round(performance.now() - startedAt)}ms`);
    }

    return {
      ok: true,
      data: {
        conversationId: conversation.id,
        userMessage: messageView(savedUserMessage),
        reply: messageView(assistantMessage),
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("sendCustomerChatMessage failed:", error);
    return { ok: false, error: GENERIC_AI_ERROR, conversationId };
  }
}

export async function handoffCustomerAiConversation({
  conversationId,
  category,
  attachments,
}: {
  conversationId: string;
  category?: string | null;
  attachments?: SupportAttachmentUpload[];
}): Promise<ActionResult<{ sessionId: string; agentAvailable: boolean }>> {
  const customer = await requireCustomer();
  if (!customer) return { ok: false, error: "UNAUTHORIZED" };

  const validatedAttachments = validateSupportAttachments(attachments);
  if (!validatedAttachments.ok) return { ok: false, error: validatedAttachments.error };

  try {
    const conversation = await prisma.supportSession.findFirst({
      where: { id: conversationId, customerId: customer.id, status: AI_STATUS, customerDeletedAt: null },
      select: {
        id: true,
        category: true,
        messages: {
          orderBy: { createdAt: "asc" },
          take: 40,
          where: { deletedAt: null },
          select: { senderRole: true, message: true },
        },
      },
    });
    if (!conversation) return { ok: false, error: "השיחה אינה זמינה עוד." };

    if (validatedAttachments.attachments.length > 0) {
      await saveUserMessage({
        attachments: validatedAttachments,
        conversationId: conversation.id,
        message: "צורפו צילומי מסך להעברה לנציג התמיכה.",
        userId: customer.id,
      });
    }

    const transcript = conversation.messages
      .map((entry) => `${entry.senderRole === "CUSTOMER" ? "לקוח" : "עוזר חכם"}: ${entry.message}`)
      .join("\n")
      .slice(0, 12_000);
    let summary = transcript.slice(0, 1800);
    try {
      summary = await generateGeminiText({
        systemInstruction:
          "Summarize this AMK customer support conversation for a human support agent. Write concise Hebrew. Include the problem, category, troubleshooting already suggested, and unresolved issue. Never add facts.",
        contents: [{ role: "user", parts: [{ text: transcript }] }],
        timeoutMs: 8_000,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development" && !(error instanceof GeminiNotConfiguredError)) {
        console.error("Gemini handoff summary failed:", error);
      }
    }

    const selectedCategory = category?.trim().slice(0, 80) || conversation.category || "תמיכה כללית";
    const [availableAgent] = await Promise.all([
      prisma.technicianPresence.findFirst({ where: { status: "AVAILABLE" }, select: { id: true } }),
      prisma.supportSession.update({
        where: { id: conversation.id },
        data: {
          status: "PENDING",
          isAiOnly: false,
          category: selectedCategory,
          subject: `פנייה מהצ׳אט — ${selectedCategory}`,
          summary: `סיכום AI לנציג:\n${summary}`.slice(0, 2000),
          expiresAt: expiresAt(),
          publicActivities: {
            create: { type: "REQUEST_RECEIVED", message: "הבקשה שלך התקבלה" },
          },
        },
      }),
    ]);

    revalidatePath("/support/agent");
    revalidatePath("/portal");
    return { ok: true, data: { sessionId: conversation.id, agentAvailable: Boolean(availableAgent) } };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("handoffCustomerAiConversation failed:", error);
    return { ok: false, error: "לא ניתן להעביר את השיחה לנציג כרגע. נסה שוב בעוד מספר רגעים." };
  }
}

// Only ever closes the AI-only side of a conversation — a session that was
// escalated to a human (PENDING/ACTIVE/...) has its own cancel/close paths
// that a support agent or the existing cancelSupportRequest action own.
export async function closeCustomerChatSession(sessionId: string): Promise<ActionResult<undefined>> {
  const customer = await requireCustomer();
  if (!customer) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const result = await prisma.supportSession.updateMany({
      where: { id: sessionId, customerId: customer.id, status: AI_STATUS },
      data: { status: "CLOSED", closedAt: new Date() },
    });
    if (result.count === 0) return { ok: false, error: GENERIC_ACTION_ERROR };

    return { ok: true, data: undefined };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("closeCustomerChatSession failed:", error);
    return { ok: false, error: GENERIC_ACTION_ERROR };
  }
}

// AI-only conversations (never escalated) are hard-deleted outright. Anything
// that was ever handed off to a human keeps its row for the support/audit
// record — the customer only stops seeing it (customerDeletedAt).
export async function deleteCustomerChatSession(sessionId: string): Promise<ActionResult<undefined>> {
  const customer = await requireCustomer();
  if (!customer) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const session = await prisma.supportSession.findFirst({
      where: { id: sessionId, customerId: customer.id },
      select: { id: true, isAiOnly: true },
    });
    if (!session) return { ok: false, error: GENERIC_ACTION_ERROR };

    if (session.isAiOnly) {
      const attachments = await prisma.supportAttachment.findMany({
        where: { sessionId: session.id },
        select: { storageProvider: true, storagePath: true },
      });
      await removeSupportAttachmentObjects(attachments).catch((error) => {
        console.error("Failed to remove attachments for deleted AI chat:", error);
      });
      await prisma.supportSession.delete({ where: { id: session.id } });
    } else {
      await prisma.supportSession.update({
        where: { id: session.id },
        data: { customerDeletedAt: new Date() },
      });
    }

    return { ok: true, data: undefined };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("deleteCustomerChatSession failed:", error);
    return { ok: false, error: GENERIC_ACTION_ERROR };
  }
}

// Soft delete only — the customer can hide their own messages, but the row stays
// so staff-side history and prior AI context stay intact for anyone who already
// saw it. Only the message's author (the customer themselves) can delete it.
export async function deleteCustomerChatMessage(messageId: string): Promise<ActionResult<undefined>> {
  const customer = await requireCustomer();
  if (!customer) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const message = await prisma.sessionMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        senderRole: true,
        deletedAt: true,
        session: { select: { customerId: true } },
      },
    });

    if (
      !message ||
      message.deletedAt ||
      message.session.customerId !== customer.id ||
      message.senderId !== customer.id ||
      message.senderRole !== "CUSTOMER"
    ) {
      return { ok: false, error: GENERIC_ACTION_ERROR };
    }

    await prisma.sessionMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), deletedById: customer.id },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("deleteCustomerChatMessage failed:", error);
    return { ok: false, error: GENERIC_ACTION_ERROR };
  }
}

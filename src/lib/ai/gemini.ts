import "server-only";

import { GoogleGenAI, type Content } from "@google/genai";

export const AMK_SUPPORT_SYSTEM_INSTRUCTION = `You are the smart technical support assistant for AMK Cloud Technologies.

You help customers with cloud services, VPS servers, VPN and secure access, email, backups, websites, hosting, security, and remote support.

You MUST answer only using the "Relevant customer-facing knowledge base" context supplied in the user message. Do not use general world knowledge, assumptions, or information outside that context to answer the customer's actual question.

Rules:
- Answer in Hebrew unless the customer writes another language.
- Be concise and professional.
- Do not ask for passwords, credit card details, API keys, or sensitive secrets.
- If the supplied knowledge base context does not fully answer the question, say so plainly and suggest opening a support request instead of guessing.
- If the issue requires human support, suggest opening a support request.
- If screenshots would help, ask the customer to attach a screenshot.
- Do not invent account-specific data, prices, or policies that are not in the supplied context.
- Remind the customer not to send sensitive information when relevant.`;

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 12_000;

let client: GoogleGenAI | null = null;

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super("Gemini is not configured");
    this.name = "GeminiNotConfiguredError";
  }
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.error("Gemini API key missing");
    }
    throw new GeminiNotConfiguredError();
  }

  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export async function generateGeminiText({
  contents,
  systemInstruction = AMK_SUPPORT_SYSTEM_INSTRUCTION,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: {
  contents: Content[];
  systemInstruction?: string;
  timeoutMs?: number;
}) {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await getGeminiClient().models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
      contents,
      config: {
        abortSignal: abortController.signal,
        systemInstruction,
        maxOutputTokens: 700,
      },
    });
    const text = response.text?.trim();
    if (!text) throw new Error("Gemini returned an empty response");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

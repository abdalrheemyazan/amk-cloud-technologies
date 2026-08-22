import "server-only";

import { GoogleGenAI, type Content } from "@google/genai";

export const AMK_SUPPORT_SYSTEM_INSTRUCTION = `You are the smart technical support assistant for AMK Cloud Technologies (a professional cloud, infrastructure, and IT services provider).

Your goal is to assist customers politely, professionally, and effectively with their technical inquiries, cloud services (VPS, VPN, Microsoft 365 / Email, Cloud Backup, Cybersecurity, Networking, Remote Support, and General IT troubleshooting).

Guidelines:
1. Language: Always reply in the same language as the customer's latest message (Hebrew, Arabic, or English). Technical terms (VPN, VPS, DNS, IP, Windows, Outlook, CPU, RAM) may remain in English where appropriate.
2. Grounding: When relevant AMK Knowledge Base articles are provided in the prompt, base your answer directly and accurately on those procedures.
3. Troubleshooting & Follow-up: For general technical inquiries (e.g., slow performance, connection failure, email issues, password troubles), provide helpful initial diagnostic questions and safe, standard troubleshooting steps (e.g., checking cable/Wi-Fi, restarting router/service, checking credentials, error codes).
4. Insufficient Knowledge: If a specific AMK procedure, internal policy, or private customer configuration is needed and not available in the provided context, clearly inform the customer and offer them to open a support ticket or transfer the chat to a live support representative.
5. Security & Safety: Never ask for or store passwords, credit card numbers, or secret API keys. Remind customers to keep credentials secure.
6. Tone: Friendly, concise, structured, and helpful. Use clear bullet points and step-by-step instructions.`;

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
  maxOutputTokens = 700,
}: {
  contents: Content[];
  systemInstruction?: string;
  timeoutMs?: number;
  maxOutputTokens?: number;
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
        maxOutputTokens,
      },
    });
    const text = response.text?.trim();
    if (!text) throw new Error("Gemini returned an empty response");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

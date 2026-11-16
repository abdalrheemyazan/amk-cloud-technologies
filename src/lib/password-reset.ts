import "server-only";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 200;

const RESEND_COOLDOWN_MS = 60 * 1000;

export function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function identifierFor(email: string) {
  return `password-reset:${email}`;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Users who registered before emails were normalized may be stored with
 * mixed case, so fall back to a case-insensitive match.
 */
export async function findUserByEmail(email: string) {
  const select = { id: true, email: true, status: true, name: true, displayName: true } as const;
  return (
    (await prisma.user.findUnique({ where: { email }, select })) ??
    (await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select }))
  );
}

/**
 * Creates a single-use reset token. Only a SHA-256 hash is stored, so a
 * database leak doesn't expose usable links. Returns null when a link was
 * sent less than a minute ago (prevents mail flooding).
 */
export async function createPasswordResetToken(email: string) {
  const identifier = identifierFor(email);
  const now = Date.now();

  const recent = await prisma.verificationToken.findFirst({
    where: { identifier, expires: { gt: new Date(now + RESET_TOKEN_TTL_MS - RESEND_COOLDOWN_MS) } },
    select: { token: true },
  });
  if (recent) return null;

  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({
      data: { identifier, token: hashToken(token), expires: new Date(now + RESET_TOKEN_TTL_MS) },
    }),
  ]);
  return token;
}

/** Validates and consumes the token. Returns true when it was valid. */
export async function consumePasswordResetToken(email: string, token: string) {
  if (!email || !token || token.length > 200) return false;
  const identifier = identifierFor(email);
  const hashed = hashToken(token);

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token: hashed } },
  });
  if (!record) return false;

  // Single use: remove every reset token for this email, valid or not.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  return record.expires.getTime() > Date.now();
}

export function validateNewPassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return "הסיסמה ארוכה מדי.";
  }
  return null;
}

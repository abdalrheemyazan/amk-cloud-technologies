import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing email over SMTP (works with Microsoft 365, Google Workspace or any
 * mail host). Configure with these environment variables:
 *
 *   SMTP_HOST       e.g. smtp.office365.com
 *   SMTP_PORT       587 (STARTTLS, default) or 465 (implicit TLS)
 *   SMTP_USER       the mailbox login
 *   SMTP_PASSWORD   the mailbox password / app password
 *   MAIL_FROM       optional, defaults to SMTP_USER  (e.g. "AMK Cloud <info@amk.systems>")
 *   CONTACT_INBOX   optional, where contact-form messages go, defaults to MAIL_FROM / SMTP_USER
 */

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("SMTP is not configured");
    this.name = "EmailNotConfiguredError";
  }
}

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
};

function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  if (!host || !user || !password) return null;

  const port = Number(process.env.SMTP_PORT?.trim() || 587);
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    user,
    password,
    from: process.env.MAIL_FROM?.trim() || user,
  };
}

export function isEmailConfigured() {
  return readSmtpConfig() !== null;
}

export function getContactInbox() {
  return process.env.CONTACT_INBOX?.trim() || readSmtpConfig()?.from || null;
}

let transporter: Transporter | null = null;

function getTransporter(config: SmtpConfig) {
  transporter ??= nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
  });
  return transporter;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const config = readSmtpConfig();
  if (!config) throw new EmailNotConfiguredError();

  await getTransporter(config).sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
    replyTo,
  });
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Small in-memory limiter to slow down form spam. It is per server instance
 * (serverless instances don't share it), so it's a speed bump, not a guarantee.
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-nf-client-connection-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

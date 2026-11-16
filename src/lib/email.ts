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

export { clientIp, isRateLimited } from "./rate-limit";

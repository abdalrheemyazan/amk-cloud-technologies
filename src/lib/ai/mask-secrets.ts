import "server-only";

// Best-effort redaction of secrets before any text is sent to Gemini. This is a
// defensive net for the internal support assistant — agents may paste logs,
// config, or credentials into the request thread, and none of that should leave
// our server in clear text. It intentionally errs toward over-masking.

const REDACTED = "[הוסתר]";

const PATTERNS: { label: string; regex: RegExp }[] = [
  // key: value / key = value where the key names a secret (Hebrew + English).
  {
    label: "labeled-secret",
    regex:
      /\b(password|passwd|pwd|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|authorization|auth|bearer|credential|סיסמה|סיסמא|סיסמת|טוקן|מפתח|מפתח[- ]?api|קוד[- ]?גישה)\b\s*[:=]\s*\S+/gi,
  },
  // Bearer tokens in headers.
  { label: "bearer", regex: /\bBearer\s+[A-Za-z0-9._\-]+/gi },
  // JWTs.
  { label: "jwt", regex: /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g },
  // Common cloud/provider key shapes (AWS, Google, generic long secrets, sk- keys).
  { label: "aws-key", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { label: "google-key", regex: /\bAIza[0-9A-Za-z_\-]{20,}\b/g },
  { label: "sk-key", regex: /\bsk-[A-Za-z0-9]{16,}\b/g },
  // Credit-card-like sequences (13-16 digits, optionally spaced/dashed).
  { label: "card", regex: /\b(?:\d[ -]?){13,16}\b/g },
];

export function maskSecrets(input: string | null | undefined): string {
  if (!input) return "";
  let output = input;
  for (const { regex } of PATTERNS) {
    output = output.replace(regex, (match) => {
      // Preserve a "key:" prefix so the AI still knows a credential was present,
      // just not its value.
      const keyColon = match.match(/^([^:=]+[:=]\s*)/);
      return keyColon ? `${keyColon[1]}${REDACTED}` : REDACTED;
    });
  }
  return output;
}

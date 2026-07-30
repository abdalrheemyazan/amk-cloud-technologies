// Operational priority scoring for the support-agent dashboard.
//
// SupportSession has no stored priority / SLA / escalation / urgency column,
// so importance is derived here from the signals we DO have:
//   - how long the item has been waiting,
//   - whether it is still unassigned,
//   - whether the customer sent the last message (staff turn to reply),
//   - whether it has already been transferred/escalated.
//
// Keep this a pure function: it runs on the server inside the dashboard loader
// and is trivially unit-testable. No Prisma / no I/O here.

export type RequestPriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type RequestSlaRisk = "BREACHED" | "AT_RISK" | "NEEDS_RESPONSE" | "OK";

export type PriorityInput = {
  /** Raw SupportSession.status (e.g. "PENDING", "ACTIVE"). */
  status: string;
  /** When the request entered the system. */
  createdAt: Date;
  /** Timestamp of the most recent message, if any. */
  lastMessageAt: Date | null;
  /** True when the most recent message came from the customer (awaiting a staff reply). */
  lastMessageFromCustomer: boolean;
  /** True when a technician already owns the session. */
  isAssigned: boolean;
  /** Number of ownership transfers — used as an escalation proxy. */
  transferCount?: number;
  /** Injectable clock for deterministic tests. Defaults to now. */
  now?: Date;
};

export type PriorityResult = {
  score: number;
  level: RequestPriorityLevel;
  slaRisk: RequestSlaRisk;
  /** Minutes since the moment that matters (last activity, falling back to creation). */
  waitingMinutes: number;
};

// Waiting-time buckets (minutes) → score contribution.
const WAIT_OVER_60 = 20;
const WAIT_OVER_30 = 14;
const WAIT_OVER_15 = 8;

const UNASSIGNED_WEIGHT = 10;
const CUSTOMER_WAITING_WEIGHT = 12;
const ESCALATION_WEIGHT = 15;

// SLA thresholds (minutes). No stored SLA target exists, so these are the
// operational defaults; adjust here if the business defines real SLAs later.
const SLA_BREACH_MINUTES = 90;
const SLA_AT_RISK_MINUTES = 45;
const SLA_BREACH_WEIGHT = 35;
const SLA_AT_RISK_WEIGHT = 20;

// Total-score → level thresholds.
const LEVEL_CRITICAL = 55;
const LEVEL_HIGH = 35;
const LEVEL_MEDIUM = 18;

function minutesBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60_000));
}

export function calculateRequestPriority(input: PriorityInput): PriorityResult {
  const now = input.now ?? new Date();

  // The reference point is the last activity; for a brand-new request that is
  // effectively its creation time.
  const referenceAt = input.lastMessageAt ?? input.createdAt;
  const waitingMinutes = minutesBetween(referenceAt, now);
  const isAwaitingStaff = input.lastMessageFromCustomer || !input.isAssigned;

  let score = 0;

  // Waiting time.
  if (waitingMinutes > 60) score += WAIT_OVER_60;
  else if (waitingMinutes > 30) score += WAIT_OVER_30;
  else if (waitingMinutes > 15) score += WAIT_OVER_15;

  // Unassigned work is nobody's yet — surface it.
  if (!input.isAssigned) score += UNASSIGNED_WEIGHT;

  // Customer sent the last message and is waiting on us.
  if (input.lastMessageFromCustomer) score += CUSTOMER_WAITING_WEIGHT;

  // Already escalated / handed off.
  if ((input.transferCount ?? 0) > 0) score += ESCALATION_WEIGHT;

  // SLA risk is a function of how long the customer has been left waiting.
  let slaRisk: RequestSlaRisk;
  if (isAwaitingStaff && waitingMinutes >= SLA_BREACH_MINUTES) {
    slaRisk = "BREACHED";
    score += SLA_BREACH_WEIGHT;
  } else if (isAwaitingStaff && waitingMinutes >= SLA_AT_RISK_MINUTES) {
    slaRisk = "AT_RISK";
    score += SLA_AT_RISK_WEIGHT;
  } else if (input.lastMessageFromCustomer) {
    slaRisk = "NEEDS_RESPONSE";
  } else {
    slaRisk = "OK";
  }

  let level: RequestPriorityLevel;
  if (score >= LEVEL_CRITICAL) level = "CRITICAL";
  else if (score >= LEVEL_HIGH) level = "HIGH";
  else if (score >= LEVEL_MEDIUM) level = "MEDIUM";
  else level = "LOW";

  return { score, level, slaRisk, waitingMinutes };
}

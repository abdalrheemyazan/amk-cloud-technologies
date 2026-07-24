import "server-only";

// Development-only diagnostics for the auth/portal performance investigation.
// Tracks Prisma queries issued during the current request so we can report
// "how many queries + which was slowest" alongside the [perf] timing logs.
// Not request-isolated (shared mutable state) — fine for single-developer
// local profiling, never enabled outside development.
//
// State lives on globalThis, same trick prisma.ts uses for its client
// singleton: Next.js dev (Turbopack) can instantiate a "server-only" module
// more than once across different parts of the module graph, so a plain
// module-level `let` here would let the Prisma extension's closure write into
// a different instance than the one loadCustomerPortalData reads from.

const enabled = process.env.NODE_ENV === "development";

type QueryRecord = { query: string; durationMs: number };

const globalForDevPerf = globalThis as unknown as { __devPerfQueries?: QueryRecord[] };
const getQueries = () => (globalForDevPerf.__devPerfQueries ??= []);

export function devPerfReset() {
  if (!enabled) return;
  globalForDevPerf.__devPerfQueries = [];
}

export function devPerfRecordQuery(query: string, durationMs: number) {
  if (!enabled) return;
  getQueries().push({ query, durationMs });
}

export function devPerfSummary() {
  if (!enabled) return null;
  const queries = getQueries();
  const count = queries.length;
  const slowest = queries.reduce<QueryRecord | null>(
    (slowestSoFar, current) =>
      !slowestSoFar || current.durationMs > slowestSoFar.durationMs ? current : slowestSoFar,
    null,
  );
  return {
    count,
    slowest: slowest
      ? { query: slowest.query.slice(0, 90), durationMs: Math.round(slowest.durationMs) }
      : null,
  };
}

export function devLog(label: string, ...rest: unknown[]) {
  if (!enabled) return;
  console.info(`[perf] ${label}`, ...rest);
}

export async function devTimed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!enabled) return fn();
  const start = performance.now();
  const result = await fn();
  devLog(`${label} ${Math.round(performance.now() - start)}ms`);
  return result;
}

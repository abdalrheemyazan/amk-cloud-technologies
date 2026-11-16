import "server-only";

/**
 * Small in-memory limiter. It is per server instance (serverless instances
 * don't share it), so it's a speed bump, not a guarantee — pair it with a
 * database-backed check where the limit really matters.
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

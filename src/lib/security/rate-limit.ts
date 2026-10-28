import "server-only";

/**
 * Basit kayan pencere sınırlayıcı (bellek içi).
 * Not: sunucusuz ortamda her örnek ayrı sayar; kalıcı kilit için ayrıca
 * users.failed_attempts / locked_until kullanılır (bkz. auth actions).
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return { ok: true, retryAfterSec: 0 };
}

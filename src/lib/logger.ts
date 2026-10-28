import "server-only";

/**
 * Güvenli loglama: hassas alanlar maskelenir, stack yalnızca sunucuda tutulur.
 * İstemciye ASLA hata ayrıntısı gönderilmez (bkz. app/error.tsx, actions).
 */
const SENSITIVE = /(pass|secret|token|authorization|cookie|key|hash|smtp)/i;

function scrub(obj: Record<string, unknown> | undefined) {
  if (!obj) return undefined;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, SENSITIVE.test(k) ? "[redacted]" : v]),
  );
}

export function logError(scope: string, err: unknown, ctx?: Record<string, unknown>) {
  const e = err instanceof Error ? err : new Error(String(err));
  console.error(
    JSON.stringify({ level: "error", scope, message: e.message, ctx: scrub(ctx), ts: new Date().toISOString() }),
  );
}

export function logInfo(scope: string, ctx?: Record<string, unknown>) {
  console.info(JSON.stringify({ level: "info", scope, ctx: scrub(ctx), ts: new Date().toISOString() }));
}

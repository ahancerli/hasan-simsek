import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyWebhook } from "@/lib/security/webhook";
import { CONTENT_TAG } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * İmzalı webhook: dış sistem (ör. D1'i doğrudan güncelleyen bir iş) içerik önbelleğini yeniletebilir.
 *   POST /api/webhooks/revalidate
 *   X-Signature: t=<unix>,v1=<hmac-sha256(WEBHOOK_SECRET, `${t}.${body}`)>
 *   body: {"paths":["/","/proje-listesi"]}   (isteğe bağlı)
 */
const MAX_BODY = 10_000;
const PATH = /^\/[a-z0-9\-/]*$/;

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: "too_large" }, { status: 413 });
  if (!verifyWebhook(raw, req.headers.get("x-signature"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 }); // neden olduğunu söylemeyiz
  }
  let paths: string[] = [];
  try {
    const body = raw ? JSON.parse(raw) : {};
    if (Array.isArray(body.paths)) paths = body.paths.filter((p: unknown): p is string => typeof p === "string" && PATH.test(p)).slice(0, 20);
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  revalidateTag(CONTENT_TAG);
  for (const p of paths) revalidatePath(p);
  return NextResponse.json({ ok: true });
}

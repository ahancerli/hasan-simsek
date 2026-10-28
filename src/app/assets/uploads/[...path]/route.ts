import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Çalışma anında yüklenen dosyaların servisi (`next start` build sonrası public/'e eklenenleri sunmaz).
 * Build'de var olan dosyaları Next kendi servis eder; bu rota yalnızca onların dışındakileri karşılar.
 * Güvenlik: path traversal engeli, uzantı beyaz listesi, nosniff, belge türleri indirmeye zorlanır.
 */
const TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  pdf: "application/pdf", txt: "text/plain; charset=utf-8", zip: "application/zip",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};
const INLINE = new Set(["jpg", "jpeg", "png", "webp"]);
const SEG = /^[A-Za-z0-9._\-]+$/;

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segs } = await ctx.params;
  if (!segs.length || segs.length > 6 || !segs.every((s) => SEG.test(s) && s !== "." && s !== "..")) return new Response("Not found", { status: 404 });
  const ext = segs[segs.length - 1].split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext];
  if (!type) return new Response("Not found", { status: 404 });

  const root = path.resolve(process.cwd(), env().UPLOAD_DIR);
  const abs = path.resolve(root, ...segs);
  if (!abs.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });

  try {
    const buf = await fs.readFile(abs);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(INLINE.has(ext) ? {} : { "Content-Disposition": `attachment; filename="${segs[segs.length - 1]}"` }),
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

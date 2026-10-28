import "server-only";
import { z } from "zod";
import { cleanRichText, safeUrl, stripHtml } from "@/lib/security/sanitize";
import { portfolioCategories } from "@/lib/db/tables";
import type { Field } from "./types";

/**
 * Girdi doğrulama + temizleme (tek yer). Kural: istemciye güvenme.
 * - metin: HTML söküldü, uzunluk sınırlı
 * - zengin metin: beyaz liste ile temizlendi
 * - url: yalnızca http(s)/site içi
 * - select: yalnızca izinli değerler (kategori kimliği DB'de doğrulanır)
 */
export type Parsed = { data: Record<string, unknown>; errors: Record<string, string> };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const emailSchema = z.string().email().max(254);

export async function parseFields(fields: Field[], fd: FormData, mode: "create" | "update"): Promise<Parsed> {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  let categoryIds: Set<string> | null = null;

  for (const f of fields) {
    if (f.type === "image") continue; // görseller ayrı işlenir
    if (f.createOnly && mode === "update") continue;

    const raw = fd.get(f.name);
    const str = typeof raw === "string" ? raw : "";
    let v: string | number = "";

    switch (f.type) {
      case "switch":
        data[f.name] = str === "1" || str === "on" ? 1 : 0;
        continue;
      case "richtext":
        v = cleanRichText(str);
        if (v.length > 100_000) errors[f.name] = "İçerik çok uzun";
        break;
      case "textarea":
        v = f.secret ? str : stripHtml(str);
        break;
      case "email": {
        v = str.trim().toLowerCase();
        if (v && !emailSchema.safeParse(v).success) errors[f.name] = "Geçerli bir e-posta girin";
        break;
      }
      case "url": {
        v = safeUrl(str);
        if (str.trim() && !v) errors[f.name] = "Geçerli bir bağlantı girin (http/https veya /yol)";
        break;
      }
      case "date": {
        v = str.trim();
        if (v && (!DATE.test(v) || isNaN(Date.parse(v)))) errors[f.name] = "Geçerli bir tarih girin";
        break;
      }
      case "number": {
        const n = Number(str);
        if (str.trim() && !Number.isFinite(n)) errors[f.name] = "Geçerli bir sayı girin";
        v = str.trim() ? n : "";
        break;
      }
      case "select": {
        v = str.trim();
        if (f.options === "portfolio_categories") {
          categoryIds ??= new Set((await portfolioCategories.list({ isActive: 1 })).map((c) => String(c.id)));
          if (v && !categoryIds.has(v)) errors[f.name] = "Geçersiz seçim";
          else if (v) v = Number(v);
        } else if (v && !(f.options ?? []).some((o) => o.value === v)) {
          errors[f.name] = "Geçersiz seçim";
        }
        break;
      }
      default:
        v = f.secret ? str : stripHtml(str);
        if (!f.secret) v = String(v).trim();
    }

    if (typeof v === "string" && f.max && v.length > f.max) errors[f.name] = `En fazla ${f.max} karakter`;
    if (f.required && (v === "" || v === null || v === undefined) && !(f.secret && mode === "update")) {
      errors[f.name] ??= `${f.label} zorunludur`;
    }
    data[f.name] = v;
  }
  return { data, errors };
}

export const SEO_FIELDS = {
  title: { max: 70 },
  description: { max: 300 },
  keywords: { max: 400 },
  canonical: { max: 300 },
};

export function parseSeo(fd: FormData): { data: Record<string, unknown>; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = stripHtml(fd.get("seo_title")).slice(0, SEO_FIELDS.title.max);
  const description = stripHtml(fd.get("seo_description")).slice(0, SEO_FIELDS.description.max);
  const keywords = stripHtml(fd.get("seo_keywords")).slice(0, SEO_FIELDS.keywords.max);
  const canonRaw = String(fd.get("seo_canonical") ?? "").trim();
  const canonical = canonRaw ? safeUrl(canonRaw) : "";
  if (canonRaw && !canonical) errors.seo_canonical = "Geçerli bir URL girin";
  const noindex = fd.get("seo_noindex") === "1" ? 1 : 0;
  return { data: { title, description, keywords, canonical, noindex }, errors };
}

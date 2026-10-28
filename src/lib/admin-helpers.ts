import "server-only";
import { portfolioCategories, seoMeta } from "@/lib/db/tables";
import { uploadUrl } from "@/lib/assets";
import type { ModuleDef } from "@/modules/types";
import type { FormField, SeoValues } from "@/components/admin/EntityForm";
import type { Row } from "@/lib/db/repo";

/** Registry alanlarını client'a güvenle aktarılabilir forma çevirir (select seçenekleri çözülür). */
export async function formFields(m: ModuleDef): Promise<FormField[]> {
  const cats = m.fields.some((f) => f.options === "portfolio_categories")
    ? (await portfolioCategories.list({ isActive: 1 })).map((c) => ({ value: String(c.id), label: String(c.title) }))
    : [];
  return m.fields.map((f) => ({ ...f, options: f.options === "portfolio_categories" ? cats : f.options }));
}

export function imageUrlsFor(m: ModuleDef, row: Row | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!row) return out;
  for (const f of m.fields) if (f.type === "image" && row[f.name]) out[f.name] = uploadUrl(f.folder!, row[f.name], f.resolutions?.[0] ? `${f.resolutions[0].w}x${f.resolutions[0].h}` : undefined);
  return out;
}

export async function seoFor(m: ModuleDef, id: number | null): Promise<SeoValues | null> {
  if (!m.seo) return null;
  const s = id ? await seoMeta.get({ scope: m.key, ref: String(id) }) : null;
  return { title: String(s?.title ?? ""), description: String(s?.description ?? ""), keywords: String(s?.keywords ?? ""), canonical: String(s?.canonical ?? ""), noindex: Number(s?.noindex ?? 0) };
}

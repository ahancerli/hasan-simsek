import Link from "next/link";
import { Pencil } from "lucide-react";
import { requirePermission } from "@/lib/security/session";
import { seoMeta } from "@/lib/db/tables";
import { SEO_PAGES } from "@/lib/seo";

export default async function SeoList() {
  await requirePermission("system", "read");
  const rows = await seoMeta.list({ scope: "page" }).catch(() => []);
  const map = new Map(rows.map((r) => [String(r.ref), r]));
  return (
    <>
      <h1 className="mb-2 text-2xl font-extrabold">SEO Yönetimi</h1>
      <p className="mb-6 text-sm text-ink-500">Her sayfa için başlık, açıklama, anahtar kelime, canonical ve paylaşım görseli. Proje SEO alanları proje düzenleme sayfasındadır.</p>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-100 text-xs uppercase text-ink-500"><tr><th className="px-4 py-3">Sayfa</th><th className="px-4 py-3">SEO Başlığı</th><th className="px-4 py-3">Durum</th><th className="px-4 py-3" /></tr></thead>
          <tbody className="divide-y divide-ink-100">
            {SEO_PAGES.map((p) => {
              const r = map.get(p.ref);
              return (
                <tr key={p.ref}>
                  <td className="px-4 py-3 font-semibold">{p.label}<span className="block text-xs font-normal text-ink-500">{p.path}</span></td>
                  <td className="px-4 py-3">{String(r?.title || "—")}</td>
                  <td className="px-4 py-3">{r?.description ? <span className="text-green-700">Özel SEO</span> : <span className="text-ink-500">Varsayılan</span>}</td>
                  <td className="px-4 py-3 text-right"><Link href={`/admin/seo/${p.ref}`} className="inline-flex items-center gap-1 rounded p-1.5 hover:bg-ink-100"><Pencil size={15} />Düzenle</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

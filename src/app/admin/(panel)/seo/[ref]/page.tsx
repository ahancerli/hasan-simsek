import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/security/session";
import { seoMeta } from "@/lib/db/tables";
import { SEO_PAGES } from "@/lib/seo";
import { uploadUrl } from "@/lib/assets";
import { SeoPageForm } from "@/components/admin/SeoPageForm";

export default async function SeoEdit({ params }: { params: Promise<{ ref: string }> }) {
  await requirePermission("system", "update");
  const { ref } = await params;
  const page = SEO_PAGES.find((p) => p.ref === ref);
  if (!page) notFound();
  const r = await seoMeta.get({ scope: "page", ref }).catch(() => null);
  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">SEO: {page.label}</h1>
      <SeoPageForm refKey={ref} values={{ title: String(r?.title ?? ""), description: String(r?.description ?? ""), keywords: String(r?.keywords ?? ""), canonical: String(r?.canonical ?? ""), noindex: Number(r?.noindex ?? 0) }} ogUrl={r?.og_image ? uploadUrl("seo_v", r.og_image) : ""} />
    </>
  );
}

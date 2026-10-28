import type { Metadata } from "next";
import { PageTitle } from "@/components/site/PageTitle";
import { Lightbox } from "@/components/site/Lightbox";
import { getReferences } from "@/lib/data";
import { uploadUrl } from "@/lib/assets";
import { buildMetadata } from "@/lib/seo";
import { stripHtml } from "@/lib/security/sanitize";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "references", path: "/referanslar", fallbackTitle: "Grup Şirketlerimiz" });

export default async function ReferencesPage() {
  const refs = await getReferences();
  return (
    <>
      <PageTitle title="Grup Şirketlerimiz" crumbs={[{ label: "Grup Şirketlerimiz" }]} />
      <section className="py-16 md:py-24"><div className="container">
        <Lightbox images={refs.map((r) => ({ src: uploadUrl("references_v", r.img_url), alt: stripHtml(r.title) }))} />
      </div></section>
    </>
  );
}

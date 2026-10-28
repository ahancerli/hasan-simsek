import type { Metadata } from "next";
import { PageTitle } from "@/components/site/PageTitle";
import { Lightbox } from "@/components/site/Lightbox";
import { getGalleryImages, getSettings } from "@/lib/data";
import { legacyPathUrl } from "@/lib/assets";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "image-gallery", path: "/resim-galerimiz", fallbackTitle: "Resim Galerimiz" });

export default async function ImageGalleryPage() {
  const [imgs, s] = await Promise.all([getGalleryImages(), getSettings()]);
  const alt = String(s?.company_name ?? "Galeri");
  return (
    <>
      <PageTitle title="Resim Galerimiz" crumbs={[{ label: "Resim Galerisi" }]} />
      <section className="py-16 md:py-24"><div className="container">
        <Lightbox images={imgs.map((i, n) => ({ src: legacyPathUrl(i.url), alt: `${alt} – ${n + 1}` }))} />
      </div></section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { PageTitle } from "@/components/site/PageTitle";
import { getBrands } from "@/lib/data";
import { uploadUrl } from "@/lib/assets";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "brands", path: "/markalar", fallbackTitle: "Markalar" });

export default async function BrandsPage() {
  const brands = await getBrands();
  return (
    <>
      <PageTitle title="Markalarımız" crumbs={[{ label: "Markalar" }]} />
      <section className="py-16 md:py-24"><div className="container">
        {brands.length ? (
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {brands.map((b) => (
              <li key={b.id} className="grid aspect-[3/2] place-items-center rounded-xl bg-white p-6 shadow-card ring-1 ring-black/5">
                <Image src={uploadUrl("brands_v", b.img_url)} alt={String(b.title)} width={220} height={140} className="max-h-24 w-auto object-contain grayscale transition hover:grayscale-0" />
              </li>
            ))}
          </ul>
        ) : <p className="text-center text-ink-500">Henüz marka eklenmemiş.</p>}
      </div></section>
    </>
  );
}

import Link from "next/link";
import Image from "next/image";
import { PageTitle } from "./PageTitle";
import { RichText } from "./RichText";
import { siteImage } from "@/lib/assets";

export function CorporatePage({ title, heading, html, image = "resource/about-2.jpg", alt }: { title: string; heading: string; html: unknown; image?: string; alt: string }) {
  return (
    <>
      <PageTitle title={title} crumbs={[{ label: title }]} />
      <section className="py-16 md:py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="section-title">{heading}</h2>
            <RichText html={html} />
            <Link href="/iletisim" className="btn btn-brand mt-8">İletişime Geç</Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
            <Image src={siteImage(image)} alt={alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute -bottom-6 -right-6 -z-10 size-40 rounded-2xl bg-brand" aria-hidden />
          </div>
        </div>
      </section>
    </>
  );
}

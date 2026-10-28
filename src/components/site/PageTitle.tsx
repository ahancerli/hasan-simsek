import Link from "next/link";
import Image from "next/image";
import { siteImage } from "@/lib/assets";

export function PageTitle({ title, crumbs = [] }: { title: string; crumbs?: { label: string; href?: string }[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 text-white md:py-28">
      <Image src={siteImage("background/3.jpg")} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/60 to-transparent" />
      <div className="container">
        <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl">{title}</h1>
        <nav aria-label="Sayfa yolu" className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/80">
          <Link href="/" className="hover:text-brand">Anasayfa</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-2">
              <span aria-hidden>/</span>
              {c.href ? <Link href={c.href} className="hover:text-brand">{c.label}</Link> : <span className="text-brand">{c.label}</span>}
            </span>
          ))}
        </nav>
        <div className="mt-6 h-1 w-20 rounded bg-brand" />
      </div>
    </section>
  );
}

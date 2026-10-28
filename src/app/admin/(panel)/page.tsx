import Link from "next/link";
import { Building2, Layers, Images, Video, Handshake, Inbox } from "lucide-react";
import { requireUser } from "@/lib/security/session";
import { dashboardCounts } from "@/lib/stats";
import { FlashBanner } from "@/components/admin/FlashBanner";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const [user, sp, c] = await Promise.all([requireUser(), searchParams, dashboardCounts()]);
  const cards = [
    { t: "Projeler", n: c.portfolios, I: Building2, href: "/admin/portfolio" },
    { t: "Slaytlar", n: c.slides, I: Layers, href: "/admin/slides" },
    { t: "Galeri Resimleri", n: c.images, I: Images, href: "/admin/galleries" },
    { t: "Videolar", n: c.videos, I: Video, href: "/admin/galleries" },
    { t: "Grup Şirketleri", n: c.references, I: Handshake, href: "/admin/references" },
    { t: "Gelen Mesajlar", n: c.contact_messages, I: Inbox, href: "/admin/mesajlar" },
  ];
  return (
    <>
      <FlashBanner param={sp.f} />
      <h1 className="mb-1 text-2xl font-extrabold">Hoş geldiniz, {user.name}</h1>
      <p className="mb-8 text-ink-500">Sitenizin içeriklerini buradan yönetebilirsiniz.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ t, n, I, href }) => (
          <Link key={t} href={href} className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="grid size-12 place-items-center rounded-lg bg-brand/25 text-brand-700"><I /></span>
            <span><span className="block text-2xl font-extrabold text-ink">{n}</span><span className="text-sm text-ink-500">{t}</span></span>
          </Link>
        ))}
      </div>
    </>
  );
}

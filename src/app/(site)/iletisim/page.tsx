import type { Metadata } from "next";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { PageTitle } from "@/components/site/PageTitle";
import { ContactForm } from "@/components/site/ContactForm";
import { PopupSlot } from "@/components/site/PopupSlot";
import { getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "contact", path: "/iletisim", fallbackTitle: "İletişim" });

export default async function ContactPage() {
  const s = await getSettings();
  const address = String(s?.address ?? "");
  const rows = [
    { Icon: MapPin, label: "Adres", value: address },
    { Icon: Mail, label: "E-posta Adresi", value: String(s?.email ?? ""), href: `mailto:${s?.email}` },
    { Icon: Phone, label: "Telefon Numarası", value: String(s?.phone_1 ?? ""), href: `tel:${String(s?.phone_1 ?? "").replace(/\s/g, "")}` },
    { Icon: Clock, label: "Çalışma Saatleri", value: String(s?.working_hours ?? "") },
  ].filter((r) => r.value);

  return (
    <>
      <PageTitle title="İletişim" crumbs={[{ label: "İletişim" }]} />
      <section className="py-16 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="section-title">Bize Ulaşın</h2>
            <ul className="space-y-5">
              {rows.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/20 text-brand-700"><Icon size={22} /></span>
                  <div><p className="font-bold text-ink">{label}</p>{href ? <a href={href} className="hover:text-brand-700">{value}</a> : <p>{value}</p>}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5 md:p-8 lg:col-span-3">
            <h2 className="mb-6 text-2xl font-extrabold">İletişim Formu</h2>
            <ContactForm />
          </div>
        </div>
      </section>
      {address && (
        <section aria-label="Harita" className="h-96 w-full bg-ink-100">
          <iframe title="Konum" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full border-0"
            src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`} />
        </section>
      )}
      <PopupSlot page="contact_v" />
    </>
  );
}

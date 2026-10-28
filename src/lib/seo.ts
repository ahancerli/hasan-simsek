import type { Metadata } from "next";
import { getSettings, getSeo } from "@/lib/data";
import { env } from "@/lib/env";
import { truncate } from "@/lib/utils";
import { stripHtml } from "@/lib/security/sanitize";
import { uploadUrl } from "@/lib/assets";

/**
 * Dinamik SEO: öncelik sırası
 *   1) seo_meta (admin → SEO Yönetimi / kayıt bazlı SEO alanları)
 *   2) çağıranın verdiği varsayılan (örn. proje başlığı/özeti)
 *   3) settings.meta_description / meta_keywords (site geneli)
 */
export type PageSeoInput = {
  scope: string; // "page" | "portfolio" ...
  ref: string; // "home" | "about" | <id>
  path: string; // canonical için: "/hakkimizda"
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
};

export async function buildMetadata(i: PageSeoInput): Promise<Metadata> {
  const [s, seo] = await Promise.all([getSettings(), getSeo(i.scope, i.ref)]);
  const site = s?.company_name ? String(s.company_name) : "Hasan Şimşek İnşaat";
  const title = String(seo?.title || i.fallbackTitle || site);
  const description = truncate(
    stripHtml(seo?.description || i.fallbackDescription || s?.meta_description || ""),
    160,
  );
  const keywords = String(seo?.keywords || s?.meta_keywords || "");
  const base = new URL(env().APP_URL);
  const canonical = String(seo?.canonical || new URL(i.path, base).toString());
  const ogImage =
    (seo?.og_image ? uploadUrl("seo_v", seo.og_image) : "") ||
    i.fallbackImage ||
    (s?.logo ? uploadUrl("settings_v", s.logo) : "");
  const noindex = Number(seo?.noindex ?? 0) === 1;

  return {
    metadataBase: base,
    title: title === site ? { absolute: site } : { absolute: `${title} | ${site}` },
    description: description || undefined,
    keywords: keywords || undefined,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: site,
      title,
      description: description || undefined,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: description || undefined, images: ogImage ? [ogImage] : undefined },
  };
}

/** Statik sayfaların admin'de yönetilebilen SEO kayıtları. */
export const SEO_PAGES: { ref: string; label: string; path: string }[] = [
  { ref: "home", label: "Anasayfa", path: "/" },
  { ref: "about", label: "Hakkımızda", path: "/hakkimizda" },
  { ref: "vision", label: "Vizyonumuz", path: "/vizyon" },
  { ref: "mission", label: "Misyonumuz", path: "/misyon" },
  { ref: "projects", label: "Proje Listesi", path: "/proje-listesi" },
  { ref: "projects-ongoing", label: "Devam Eden Projeler", path: "/devam-eden-projeler" },
  { ref: "projects-completed", label: "Tamamlanan Projeler", path: "/tamamlanan-projeler" },
  { ref: "projects-planned", label: "Planlanan Projeler", path: "/planlanan-projeler" },
  { ref: "image-gallery", label: "Resim Galerisi", path: "/resim-galerimiz" },
  { ref: "video-gallery", label: "Video Galerisi", path: "/video-galerimiz" },
  { ref: "references", label: "Grup Şirketlerimiz", path: "/referanslar" },
  { ref: "brands", label: "Markalar", path: "/markalar" },
  { ref: "contact", label: "İletişim", path: "/iletisim" },
];

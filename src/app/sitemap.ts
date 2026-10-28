import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getPortfolios } from "@/lib/data";
import { SEO_PAGES } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env().APP_URL;
  const projects = await getPortfolios().catch(() => []);
  return [
    ...SEO_PAGES.map((p) => ({ url: `${base}${p.path}`, changeFrequency: "weekly" as const, priority: p.path === "/" ? 1 : 0.7 })),
    ...projects.map((p) => ({ url: `${base}/proje-detay/${p.url}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}

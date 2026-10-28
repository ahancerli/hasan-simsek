import type { Metadata } from "next";
import { CorporatePage } from "@/components/site/CorporatePage";
import { getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "vision", path: "/vizyon", fallbackTitle: "Vizyonumuz" });

export default async function VisionPage() {
  const s = await getSettings();
  return <CorporatePage title="Vizyonumuz" heading="Şirketimizin Vizyonu" html={s?.vision} alt={String(s?.company_name ?? "")} />;
}

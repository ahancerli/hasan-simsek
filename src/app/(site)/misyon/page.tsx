import type { Metadata } from "next";
import { CorporatePage } from "@/components/site/CorporatePage";
import { getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "mission", path: "/misyon", fallbackTitle: "Misyonumuz" });

export default async function MissionPage() {
  const s = await getSettings();
  return <CorporatePage title="Misyonumuz" heading="Şirketimizin Misyonu" html={s?.mission} alt={String(s?.company_name ?? "")} />;
}

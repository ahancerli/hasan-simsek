import type { Metadata } from "next";
import { CorporatePage } from "@/components/site/CorporatePage";
import { PopupSlot } from "@/components/site/PopupSlot";
import { getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "about", path: "/hakkimizda", fallbackTitle: "Hakkımızda" });

export default async function AboutPage() {
  const s = await getSettings();
  return (<><CorporatePage title="Hakkımızda" heading="Şirketimiz Hakkında" html={s?.about_us} alt={String(s?.company_name ?? "")} /><PopupSlot page="about_v" /></>);
}

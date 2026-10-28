import type { Metadata } from "next";
import { StatusPage } from "@/components/site/StatusPage";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "projects-planned", path: "/planlanan-projeler", fallbackTitle: "Planlanan Projeler" });
export default function Page() { return <StatusPage status="planned" />; }

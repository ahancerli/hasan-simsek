import type { Metadata } from "next";
import { StatusPage } from "@/components/site/StatusPage";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "projects", path: "/proje-listesi", fallbackTitle: "Projelerimiz" });
export default function Page() { return <StatusPage  />; }

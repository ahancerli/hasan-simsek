import { PageTitle } from "./PageTitle";
import { ProjectList } from "./ProjectList";
import { PROJECT_STATUS, type ProjectStatus } from "@/lib/site-config";

export function StatusPage({ status }: { status?: ProjectStatus }) {
  const cfg = status ? PROJECT_STATUS[status] : null;
  const title = cfg ? cfg.label : "Projelerimiz";
  return (
    <>
      <PageTitle title={title} crumbs={cfg ? [{ label: "Projelerimiz", href: "/proje-listesi" }, { label: cfg.label }] : [{ label: "Projelerimiz" }]} />
      <section className="py-16 md:py-24"><div className="container"><ProjectList categoryId={cfg?.categoryId} /></div></section>
    </>
  );
}

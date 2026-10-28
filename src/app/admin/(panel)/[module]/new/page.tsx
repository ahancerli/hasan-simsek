import { loadModule } from "@/lib/admin-guard";
import { EntityForm } from "@/components/admin/EntityForm";
import { formFields, seoFor } from "@/lib/admin-helpers";

export default async function NewEntity({ params }: { params: Promise<{ module: string }> }) {
  const { module: key } = await params;
  const { m } = await loadModule(key, "create");
  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Yeni {m.singular}</h1>
      <EntityForm moduleKey={m.key} id={null} fields={await formFields(m)} values={{}} imageUrls={{}} seo={await seoFor(m, null)} backHref={`/admin/${m.key}`} />
    </>
  );
}

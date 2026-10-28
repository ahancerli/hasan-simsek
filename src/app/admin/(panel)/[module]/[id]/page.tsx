import Link from "next/link";
import { notFound } from "next/navigation";
import { Images } from "lucide-react";
import { loadModule } from "@/lib/admin-guard";
import { EntityForm } from "@/components/admin/EntityForm";
import { formFields, imageUrlsFor, seoFor } from "@/lib/admin-helpers";

export default async function EditEntity({ params }: { params: Promise<{ module: string; id: string }> }) {
  const { module: key, id: rawId } = await params;
  const { m } = await loadModule(key, "update");
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const row = await m.repo.get({ id });
  if (!row) notFound();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">{m.singular} Düzenle</h1>
        <div className="flex gap-2">
          {m.children?.filter((c) => !c.onlyForType || c.onlyForType === String(row.gallery_type)).map((c) => (
            <Link key={c.key} href={`/admin/${m.key}/${id}/${c.key}`} className="btn bg-white text-ink ring-1 ring-ink-300 hover:bg-brand/20 !py-2"><Images size={16} />{c.label}</Link>
          ))}
        </div>
      </div>
      <EntityForm moduleKey={m.key} id={id} fields={await formFields(m)} values={row} imageUrls={imageUrlsFor(m, row)} seo={await seoFor(m, id)} backHref={`/admin/${m.key}`} />
    </>
  );
}

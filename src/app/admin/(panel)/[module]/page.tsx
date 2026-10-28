import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Images } from "lucide-react"
import { loadModule } from "@/lib/admin-guard"
import { can, ROLE_LABEL, isRole } from "@/lib/security/roles"
import { portfolioCategories } from "@/lib/db/tables"
import { uploadUrl } from "@/lib/assets"
import { formatDate, stripParagraphTags } from "@/lib/utils"
import { deleteAction, moveAction, toggleActiveAction } from "@/app/admin/actions"
import { FlashBanner } from "@/components/admin/FlashBanner"
import { ConfirmButton } from "@/components/admin/ConfirmButton"
import type { Field } from "@/modules/types"

export default async function ModuleList({
	params,
	searchParams,
}: {
	params: Promise<{ module: string }>
	searchParams: Promise<{ f?: string }>
}) {
	const { module: key } = await params
	const sp = await searchParams
	const { m, user } = await loadModule(key)

	let rows = await m.repo.list({}, m.sortable ? "rank ASC" : "id DESC")
	if (m.singleton) redirect(rows[0] ? `/admin/${m.key}/${rows[0].id}` : `/admin/${m.key}/new`)

	const cats = m.fields.some((f) => f.options === "portfolio_categories")
		? new Map((await portfolioCategories.list()).map((c) => [String(c.id), String(c.title)]))
		: null
	const cols = m.listColumns
		.map((n) => m.fields.find((f) => f.name === n)!)
		.filter(Boolean) as Field[]
	const canWrite = can(user.role, m.scope, "update")

	const cell = (f: Field, v: unknown) => {
		if (f.type === "image")
			return (
				<Image
					src={uploadUrl(
						f.folder!,
						v,
						f.resolutions?.[1] ? `${f.resolutions[1].w}x${f.resolutions[1].h}` : undefined,
					)}
					alt=""
					width={64}
					height={44}
					unoptimized
					className="h-11 w-16 rounded border bg-white object-contain"
				/>
			)
		if (f.type === "date") return formatDate(v)
		if (f.name === "role") return isRole(v) ? ROLE_LABEL[v] : "—"
		if (f.options === "portfolio_categories") return cats?.get(String(v)) ?? "—"
		if (Array.isArray(f.options))
			return f.options.find((o) => o.value === String(v))?.label ?? stripParagraphTags(v)
		return stripParagraphTags(v)
	}

	return (
		<>
			<FlashBanner param={sp.f} />
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-extrabold">{m.title}</h1>
				{can(user.role, m.scope, "create") && (
					<Link href={`/admin/${m.key}/new`} className="btn btn-brand">
						<Plus size={16} />
						Yeni {m.singular}
					</Link>
				)}
			</div>

			<div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
				<table className="w-full text-left text-sm">
					<thead className="bg-ink-100 text-xs uppercase text-ink-500">
						<tr>
							{cols.map((c) => (
								<th key={c.name} className="px-4 py-3">
									{c.type === "image" ? "Görsel" : c.label}
								</th>
							))}
							{m.toggleActive && <th className="px-4 py-3">Durum</th>}
							<th className="px-4 py-3 text-right">İşlemler</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-ink-100">
						{rows.length === 0 && (
							<tr>
								<td colSpan={cols.length + 2} className="px-4 py-10 text-center text-ink-500">
									Henüz kayıt yok.
								</td>
							</tr>
						)}
						{rows.map((r, i) => (
							<tr key={r.id} className="hover:bg-ink-100/40">
								{cols.map((c) => (
									<td key={c.name} className="px-4 py-3">
										{cell(c, r[c.name])}
									</td>
								))}
								{m.toggleActive && (
									<td className="px-4 py-3">
										<form action={toggleActiveAction.bind(null, m.key, r.id)}>
											<button
												type="submit"
												disabled={!canWrite}
												className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${Number(r.isActive) === 1 ? "bg-green-100 text-green-800" : "bg-ink-100 text-ink-600"}`}
											>
												{Number(r.isActive) === 1 ? (
													<>
														<Eye size={13} />
														Aktif
													</>
												) : (
													<>
														<EyeOff size={13} />
														Pasif
													</>
												)}
											</button>
										</form>
									</td>
								)}
								<td className="px-4 py-3">
									<div className="flex items-center justify-end gap-1">
										{m.sortable && canWrite && (
											<>
												<form action={moveAction.bind(null, m.key, r.id, "up")}>
													<button
														type="submit"
														disabled={i === 0}
														title="Yukarı"
														aria-label="Yukarı taşı"
														className="rounded p-1.5 hover:bg-ink-100 disabled:opacity-30"
													>
														<ArrowUp size={16} />
													</button>
												</form>
												<form action={moveAction.bind(null, m.key, r.id, "down")}>
													<button
														type="submit"
														disabled={i === rows.length - 1}
														title="Aşağı"
														aria-label="Aşağı taşı"
														className="rounded p-1.5 hover:bg-ink-100 disabled:opacity-30"
													>
														<ArrowDown size={16} />
													</button>
												</form>
											</>
										)}
										{m.children
											?.filter((c) => !c.onlyForType || c.onlyForType === String(r.gallery_type))
											.map((c) => (
												<Link
													key={c.key}
													href={`/admin/${m.key}/${r.id}/${c.key}`}
													title={c.label}
													className="rounded p-1.5 text-brand-700 hover:bg-brand/20"
												>
													<Images size={16} />
												</Link>
											))}
										{canWrite && (
											<Link
												href={`/admin/${m.key}/${r.id}`}
												title="Düzenle"
												aria-label="Düzenle"
												className="rounded p-1.5 hover:bg-ink-100"
											>
												<Pencil size={16} />
											</Link>
										)}
										{can(user.role, m.scope, "delete") && (
											<form action={deleteAction.bind(null, m.key, r.id)}>
												<ConfirmButton
													message="Bu kaydı silmek istediğinize emin misiniz? Geri alınamaz."
													className="rounded p-1.5 text-red-600 hover:bg-red-50"
												>
													<Trash2 size={16} />
												</ConfirmButton>
											</form>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	)
}

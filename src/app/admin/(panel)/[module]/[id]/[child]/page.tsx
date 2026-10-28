import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
	ArrowLeft,
	ArrowUp,
	ArrowDown,
	Eye,
	EyeOff,
	Star,
	Trash2,
	FileText,
	Upload,
} from "lucide-react"
import { loadModule } from "@/lib/admin-guard"
import {
	portfolioImages,
	productImages,
	galleryImages,
	galleryFiles,
	galleryVideos,
} from "@/lib/db/tables"
import { uploadUrl, legacyPathUrl } from "@/lib/assets"
import { parseVideo } from "@/lib/video"
import {
	childUploadAction,
	childDeleteAction,
	childToggleAction,
	childMoveAction,
	childCoverAction,
} from "@/app/admin/child-actions"
import { FlashBanner } from "@/components/admin/FlashBanner"
import { ConfirmButton } from "@/components/admin/ConfirmButton"

const REPOS = {
	portfolio_images: portfolioImages,
	product_images: productImages,
	images: galleryImages,
	files: galleryFiles,
	videos: galleryVideos,
} as const

export default async function ChildManager({
	params,
	searchParams,
}: {
	params: Promise<{ module: string; id: string; child: string }>
	searchParams: Promise<{ f?: string }>
}) {
	const { module: key, id: rawId, child: ck } = await params
	const sp = await searchParams
	const { m } = await loadModule(key, "update")
	const c = m.children?.find((x) => x.key === ck)
	const id = Number(rawId)
	if (!c || !Number.isInteger(id) || id <= 0) notFound()
	const parent = await m.repo.get({ id })
	if (!parent) notFound()

	const items = await REPOS[c.table].list({ [c.parentField]: id }, "rank ASC")
	const res = c.resolutions?.[1] ? `${c.resolutions[1].w}x${c.resolutions[1].h}` : undefined
	const thumb = (r: Record<string, unknown>) =>
		c.urlMode === "path" ? legacyPathUrl(r[c.urlField]) : uploadUrl(c.folder, r[c.urlField], res)
	const upload = childUploadAction.bind(null, m.key, id, c.key)

	return (
		<>
			<FlashBanner param={sp.f} />
			<Link
				href={`/admin/${m.key}/${id}`}
				className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink"
			>
				<ArrowLeft size={14} />
				{m.singular}e dön
			</Link>
			<h1 className="mb-6 text-2xl font-extrabold">
				{String(parent.title ?? m.singular)} – {c.label}
			</h1>

			<form
				action={upload}
				className="mb-8 flex flex-wrap items-end gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5"
			>
				{c.kind === "video" ? (
					<div className="min-w-72 flex-1">
						<label htmlFor="url" className="mb-1 block text-sm font-semibold">
							YouTube / Vimeo bağlantısı
						</label>
						<input
							id="url"
							name="url"
							required
							placeholder="https://www.youtube.com/watch?v=…"
							className="input"
						/>
					</div>
				) : (
					<div className="flex-1">
						<label htmlFor="files" className="mb-1 block text-sm font-semibold">
							{c.kind === "image"
								? "Görseller (JPG/PNG/WEBP, en fazla 5 MB)"
								: "Dosyalar (PDF, Office, ZIP – en fazla 12 MB)"}
						</label>
						<input
							id="files"
							name="files"
							type="file"
							multiple
							required
							accept={c.kind === "image" ? "image/jpeg,image/png,image/webp" : undefined}
							className="text-sm file:mr-3 file:rounded file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold"
						/>
					</div>
				)}
				<button type="submit" className="btn btn-brand">
					<Upload size={16} />
					Yükle
				</button>
			</form>

			{items.length === 0 ? (
				<p className="rounded-xl bg-white p-10 text-center text-ink-500">Henüz öğe yok.</p>
			) : (
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{items.map((r, i) => (
						<li
							key={r.id}
							className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
						>
							<div className="relative grid aspect-[4/3] place-items-center bg-ink-100">
								{c.kind === "image" && (
									<Image src={thumb(r)} alt="" fill unoptimized className="object-cover" />
								)}
								{c.kind === "file" && (
									<span className="flex flex-col items-center gap-2 p-3 text-center text-xs">
										<FileText size={32} />
										{String(r.url).split("/").pop()}
									</span>
								)}
								{c.kind === "video" && (
									<span className="break-all p-3 text-center text-xs">
										{parseVideo(r.url)?.src ?? "Geçersiz video"}
									</span>
								)}
								{Number(r.isCover) === 1 && (
									<span className="absolute left-2 top-2 rounded bg-brand px-2 py-0.5 text-xs font-bold">
										Kapak
									</span>
								)}
							</div>
							<div className="flex items-center justify-between gap-1 p-2">
								<div className="flex">
									<form action={childMoveAction.bind(null, m.key, id, c.key, r.id, "up")}>
										<button
											type="submit"
											disabled={i === 0}
											aria-label="Yukarı"
											className="rounded p-1.5 hover:bg-ink-100 disabled:opacity-30"
										>
											<ArrowUp size={15} />
										</button>
									</form>
									<form action={childMoveAction.bind(null, m.key, id, c.key, r.id, "down")}>
										<button
											type="submit"
											disabled={i === items.length - 1}
											aria-label="Aşağı"
											className="rounded p-1.5 hover:bg-ink-100 disabled:opacity-30"
										>
											<ArrowDown size={15} />
										</button>
									</form>
								</div>
								<div className="flex">
									{c.cover && (
										<form action={childCoverAction.bind(null, m.key, id, c.key, r.id)}>
											<button
												title="Kapak yap"
												aria-label="Kapak yap"
												className="rounded p-1.5 text-brand-700 hover:bg-brand/20"
											>
												<Star size={15} />
											</button>
										</form>
									)}
									<form action={childToggleAction.bind(null, m.key, id, c.key, r.id)}>
										<button
											type="submit"
											title="Aktif/Pasif"
											aria-label="Aktif/Pasif"
											className="rounded p-1.5 hover:bg-ink-100"
										>
											{Number(r.isActive) === 1 ? (
												<Eye size={15} />
											) : (
												<EyeOff size={15} className="text-ink-500" />
											)}
											type="submit"
										</button>
									</form>
									<form action={childDeleteAction.bind(null, m.key, id, c.key, r.id)}>
										<ConfirmButton
											message="Silinsin mi?"
											className="rounded p-1.5 text-red-600 hover:bg-red-50"
										>
											<Trash2 size={15} />
										</ConfirmButton>
									</form>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</>
	)
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { useActionState, useState, type ChangeEvent } from "react"
import { Loader2, Save } from "lucide-react"
import { saveAction, type FormState } from "@/app/admin/actions"
import { RichEditor } from "./RichEditor"
import type { Field, Option } from "@/modules/types"

export type FormField = Omit<Field, "options"> & { options?: Option[] }
export type SeoValues = {
	title?: string
	description?: string
	keywords?: string
	canonical?: string
	noindex?: number
}

type Props = {
	moduleKey: string
	id: number | null
	fields: FormField[]
	values: Record<string, unknown>
	imageUrls: Record<string, string>
	seo?: SeoValues | null
	backHref: string
}

const initial: FormState = { ok: false }
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function EntityForm({ moduleKey, id, fields, values, imageUrls, seo, backHref }: Props) {
	const [state, action, pending] = useActionState(saveAction.bind(null, moduleKey, id), initial)
	const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
	const err = (n: string) => state.errors?.[n]
	const v = (n: string) => String(values[n] ?? "")

	const onImagePick = (name: string, label: string, e: ChangeEvent<HTMLInputElement>) => {
		const file = e.currentTarget.files?.[0]
		if (!file) {
			setLocalErrors((prev) => {
				const next = { ...prev }
				delete next[name]
				return next
			})
			return
		}
		if (file.size > MAX_IMAGE_BYTES) {
			e.currentTarget.value = ""
			setLocalErrors((prev) => ({ ...prev, [name]: `${label} en fazla 5 MB olabilir.` }))
			return
		}
		setLocalErrors((prev) => {
			const next = { ...prev }
			delete next[name]
			return next
		})
	}

	return (
		<form action={action} className="space-y-6" noValidate>
			{state.message && !state.ok && (
				<p
					role="alert"
					className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
				>
					{state.message}
				</p>
			)}

			<div className="grid gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:grid-cols-2">
				{fields
					.filter((f) => !(f.createOnly && id))
					.map((f) => (
						<div
							key={f.name}
							className={
								f.type === "richtext" || f.type === "textarea" || f.type === "image"
									? "md:col-span-2"
									: ""
							}
						>
							<label htmlFor={f.name} className="mb-1 block text-sm font-semibold text-ink">
								{f.label}
								{f.required && <span className="text-red-500"> *</span>}
							</label>

							{f.type === "richtext" ? (
								<RichEditor name={f.name} defaultValue={v(f.name)} label={f.label} />
							) : f.type === "textarea" ? (
								<textarea
									id={f.name}
									name={f.name}
									rows={4}
									defaultValue={v(f.name)}
									maxLength={f.max}
									className="input"
								/>
							) : f.type === "select" ? (
								<select id={f.name} name={f.name} defaultValue={v(f.name)} className="input">
									<option value="">Seçiniz…</option>
									{(f.options ?? []).map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
							) : f.type === "switch" ? (
								<label className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										name={f.name}
										value="1"
										defaultChecked={Number(values[f.name] ?? 1) === 1}
										className="size-4 accent-brand-600"
									/>
									Evet
								</label>
							) : f.type === "image" ? (
								<div className="flex items-center gap-4">
									{imageUrls[f.name] && (
										<Image
											src={imageUrls[f.name]}
											alt=""
											width={96}
											height={64}
											unoptimized
											className="h-16 w-24 rounded border object-contain"
										/>
									)}
									<input
										id={f.name}
										name={f.name}
										type="file"
										accept="image/jpeg,image/png,image/webp"
										onChange={(e) => onImagePick(f.name, f.label, e)}
										className="text-sm file:mr-3 file:rounded file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold"
									/>
								</div>
							) : (
								<input
									id={f.name}
									name={f.name}
									defaultValue={f.secret ? "" : v(f.name)}
									maxLength={f.max}
									type={
										f.secret
											? "password"
											: f.type === "date"
												? "date"
												: f.type === "email"
													? "email"
													: f.type === "number"
														? "number"
														: "text"
									}
									autoComplete={f.secret ? "new-password" : "off"}
									placeholder={f.placeholder}
									className="input"
									aria-invalid={!!err(f.name)}
								/>
							)}
							{f.type === "image" && (
								<p className="mt-1 text-xs text-ink-500">
									İzin verilen türler: JPG, PNG, WEBP · Maksimum dosya boyutu: 5 MB.
								</p>
							)}
							{f.help && <p className="mt-1 text-xs text-ink-500">{f.help}</p>}
							{localErrors[f.name] && (
								<p className="mt-1 text-sm text-red-600">{localErrors[f.name]}</p>
							)}
							{err(f.name) && <p className="mt-1 text-sm text-red-600">{err(f.name)}</p>}
						</div>
					))}
			</div>

			{seo !== undefined && seo !== null && (
				<fieldset className="grid gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
					<legend className="px-2 text-sm font-bold">SEO (arama motoru)</legend>
					<SeoInput
						name="seo_title"
						label="SEO Başlığı"
						max={70}
						value={seo.title}
						help="Boşsa kayıt başlığı kullanılır (≤60 karakter ideal)."
					/>
					<div>
						<label htmlFor="seo_description" className="mb-1 block text-sm font-semibold">
							Meta Açıklama
						</label>
						<textarea
							id="seo_description"
							name="seo_description"
							rows={3}
							maxLength={300}
							defaultValue={seo.description}
							className="input"
						/>
						<p className="mt-1 text-xs text-ink-500">
							≈155 karakter ideal. Boşsa içerikten üretilir.
						</p>
					</div>
					<SeoInput name="seo_keywords" label="Anahtar Kelimeler" max={400} value={seo.keywords} />
					<SeoInput
						name="seo_canonical"
						label="Canonical URL (isteğe bağlı)"
						max={300}
						value={seo.canonical}
						error={err("seo_canonical")}
					/>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							name="seo_noindex"
							value="1"
							defaultChecked={Number(seo.noindex) === 1}
							className="size-4 accent-brand-600"
						/>
						Arama motorlarından gizle (noindex)
					</label>
				</fieldset>
			)}

			<div className="flex gap-3">
				<button disabled={pending} className="btn btn-brand">
					{pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
					{pending ? "Kaydediliyor…" : "Kaydet"}
				</button>
				<Link
					href={backHref}
					className="btn bg-white text-ink ring-1 ring-ink-300 hover:bg-ink-100"
				>
					Vazgeç
				</Link>
			</div>
		</form>
	)
}

function SeoInput({
	name,
	label,
	max,
	value,
	help,
	error,
}: {
	name: string
	label: string
	max: number
	value?: string
	help?: string
	error?: string
}) {
	return (
		<div>
			<label htmlFor={name} className="mb-1 block text-sm font-semibold">
				{label}
			</label>
			<input id={name} name={name} maxLength={max} defaultValue={value} className="input" />
			{help && <p className="mt-1 text-xs text-ink-500">{help}</p>}
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	)
}

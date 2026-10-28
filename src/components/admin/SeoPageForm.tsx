"use client"

import Image from "next/image"
import Link from "next/link"
import { useActionState, useState, type ChangeEvent } from "react"
import { Loader2, Save } from "lucide-react"
import { saveSeoPageAction, type FormState } from "@/app/admin/actions"

type V = {
	title: string
	description: string
	keywords: string
	canonical: string
	noindex: number
}
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function SeoPageForm({
	refKey,
	values,
	ogUrl,
}: {
	refKey: string
	values: V
	ogUrl: string
}) {
	const [s, action, pending] = useActionState<FormState, FormData>(
		saveSeoPageAction.bind(null, refKey),
		{ ok: false },
	)
	const [fileError, setFileError] = useState("")

	const onImagePick = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.currentTarget.files?.[0]
		if (!file) {
			setFileError("")
			return
		}
		if (file.size > MAX_IMAGE_BYTES) {
			e.currentTarget.value = ""
			setFileError("OG görseli en fazla 5 MB olabilir.")
			return
		}
		setFileError("")
	}

	return (
		<form
			action={action}
			className="space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5"
		>
			{s.message && (
				<p
					role={s.ok ? "status" : "alert"}
					className={`rounded-lg border p-3 text-sm ${s.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
				>
					{s.message}
				</p>
			)}
			<div>
				<label htmlFor="seo_title" className="mb-1 block text-sm font-semibold">
					SEO Başlığı
				</label>
				<input
					id="seo_title"
					name="seo_title"
					maxLength={70}
					defaultValue={values.title}
					className="input"
				/>
			</div>
			<div>
				<label htmlFor="seo_description" className="mb-1 block text-sm font-semibold">
					Meta Açıklama
				</label>
				<textarea
					id="seo_description"
					name="seo_description"
					rows={3}
					maxLength={300}
					defaultValue={values.description}
					className="input"
				/>
			</div>
			<div>
				<label htmlFor="seo_keywords" className="mb-1 block text-sm font-semibold">
					Anahtar Kelimeler
				</label>
				<input
					id="seo_keywords"
					name="seo_keywords"
					maxLength={400}
					defaultValue={values.keywords}
					className="input"
				/>
			</div>
			<div>
				<label htmlFor="seo_canonical" className="mb-1 block text-sm font-semibold">
					Canonical URL
				</label>
				<input
					id="seo_canonical"
					name="seo_canonical"
					maxLength={300}
					defaultValue={values.canonical}
					className="input"
				/>
				{s.errors?.seo_canonical && (
					<p className="mt-1 text-sm text-red-600">{s.errors.seo_canonical}</p>
				)}
			</div>
			<div className="flex items-center gap-4">
				<label htmlFor="og_image" className="text-sm font-semibold">
					Paylaşım görseli (OG)
				</label>
				{ogUrl && (
					<Image
						src={ogUrl}
						alt=""
						width={96}
						height={64}
						unoptimized
						className="h-14 w-24 rounded border object-cover"
					/>
				)}
				<input
					id="og_image"
					name="og_image"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={onImagePick}
					className="text-sm file:mr-3 file:rounded file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold"
				/>
			</div>
			<p className="-mt-2 text-xs text-ink-500">
				İzin verilen türler: JPG, PNG, WEBP · Maksimum dosya boyutu: 5 MB.
			</p>
			{fileError && <p className="-mt-2 text-sm text-red-600">{fileError}</p>}
			<label className="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					name="seo_noindex"
					value="1"
					defaultChecked={values.noindex === 1}
					className="size-4 accent-brand-600"
				/>
				Arama motorlarından gizle (noindex)
			</label>
			<div className="flex gap-3">
				<button disabled={pending} className="btn btn-brand">
					{pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
					{pending ? "Kaydediliyor…" : "Kaydet"}
				</button>
				<Link href="/admin/seo" className="btn bg-white text-ink ring-1 ring-ink-300">
					Geri
				</Link>
			</div>
		</form>
	)
}

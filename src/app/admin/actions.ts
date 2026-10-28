"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { getModule } from "@/modules/registry"
import { parseFields, parseSeo } from "@/modules/validate"
import { requirePermission, ForbiddenError } from "@/lib/security/session"
import { audit } from "@/lib/security/audit"
import { flashUrl } from "@/lib/flash"
import { CONTENT_TAG } from "@/lib/site-config"
import { seoMeta } from "@/lib/db/tables"
import { slugify } from "@/lib/utils"
import { logError } from "@/lib/logger"
import type { ModuleDef } from "@/modules/types"
import type { Row } from "@/lib/db/repo"

export type FormState = { ok: boolean; message?: string; errors?: Record<string, string> }

function asUploadErrorMessage(e: unknown): string | null {
	return e instanceof Error && e.name === "UploadError" ? e.message : null
}

function mod(key: string): ModuleDef {
	const m = getModule(key)
	if (!m) throw new Error("not-found")
	return m
}

function refresh(key: string) {
	revalidateTag(CONTENT_TAG)
	revalidatePath(`/admin/${key}`)
	revalidatePath("/", "layout")
}

async function uniqueSlug(m: ModuleDef, base: string, selfId?: number): Promise<string> {
	const col = m.slug!.to
	let slug = slugify(base) || "kayit"
	for (let i = 0; i < 30; i++) {
		const candidate = i === 0 ? slug : `${slug}-${i + 1}`
		const found = await m.repo.get({ [col]: candidate })
		if (!found || found.id === selfId) return candidate
	}
	return `${slug}-${Date.now().toString(36)}`
}

/* ───────────── Oluştur / Güncelle ───────────── */
export async function saveAction(
	moduleKey: string,
	id: number | null,
	_prev: FormState,
	fd: FormData,
): Promise<FormState> {
	let redirectTo: string | null = null
	try {
		const { saveImage, removeUpload } = await import("@/lib/storage")
		const m = mod(moduleKey)
		const user = await requirePermission(m.scope, id ? "update" : "create")

		const mode = id ? "update" : "create"
		const existing: Row | null = id ? await m.repo.get({ id }) : null
		if (id && !existing) return { ok: false, message: "Kayıt bulunamadı." }

		const { data, errors } = await parseFields(m.fields, fd, mode)
		const seo = m.seo ? parseSeo(fd) : null
		if (seo) Object.assign(errors, seo.errors)

		// görseller
		const imageFields = m.fields.filter((f) => f.type === "image")
		const newImages: Record<string, File> = {}
		for (const f of imageFields) {
			const file = fd.get(f.name)
			if (file instanceof File && file.size > 0) newImages[f.name] = file
			else if (f.required && !existing?.[f.name]) errors[f.name] = `${f.label} zorunludur`
		}
		if (Object.keys(errors).length)
			return { ok: false, errors, message: "Lütfen işaretli alanları düzeltin." }

		let finalData: Record<string, unknown> = { ...data }
		if (m.slug)
			finalData[m.slug.to] = await uniqueSlug(m, String(data[m.slug.from] ?? ""), id ?? undefined)

		if (m.beforeSave) {
			const r = await m.beforeSave(finalData, { id: id ?? undefined, existing })
			if ("error" in r) return { ok: false, message: r.error }
			finalData = r.data
		}

		// görselleri kaydet (doğrulama geçtikten sonra)
		const replaced: { folder: string; name: unknown; res: string[] }[] = []
		for (const f of imageFields) {
			const file = newImages[f.name]
			if (!file) continue
			const name = await saveImage(f.folder!, file, { resolutions: f.resolutions })
			finalData[f.name] = name
			if (existing?.[f.name])
				replaced.push({
					folder: f.folder!,
					name: existing[f.name],
					res: (f.resolutions ?? []).map((r) => `${r.w}x${r.h}`),
				})
		}

		let entityId = id
		if (id) {
			await m.repo.update(id, finalData)
		} else {
			entityId = await m.repo.insert({
				...finalData,
				...(m.defaults?.() ?? {}),
				...(m.sortable ? { rank: 0 } : {}),
				...(m.toggleActive ? { isActive: 1 } : {}),
				createdAt: new Date().toISOString(),
			})
		}
		for (const r of replaced) await removeUpload(r.folder, r.name, r.res)

		if (seo && entityId) {
			const cur = await seoMeta.get({ scope: m.key, ref: String(entityId) })
			const payload = { ...seo.data, updatedAt: new Date().toISOString() }
			if (cur) await seoMeta.update(cur.id, payload)
			else await seoMeta.insert({ scope: m.key, ref: String(entityId), ...payload })
		}

		await audit(user.uid, id ? "update" : "create", m.key, entityId)
		refresh(m.key)
		redirectTo = flashUrl(m.singleton ? `/admin/${m.key}` : `/admin/${m.key}`, {
			type: "success",
			text: id ? "Kayıt güncellendi." : "Kayıt eklendi.",
		})
	} catch (e) {
		const uploadMsg = asUploadErrorMessage(e)
		if (uploadMsg) return { ok: false, message: uploadMsg }
		if (e instanceof ForbiddenError) return { ok: false, message: e.message }
		logError("admin.save", e, { moduleKey })
		return { ok: false, message: "İşlem sırasında bir hata oluştu." }
	}
	redirect(redirectTo!)
}

/* ───────────── Sil / Aktif-Pasif / Sırala ───────────── */
export async function deleteAction(moduleKey: string, id: number) {
	const { removeUpload } = await import("@/lib/storage")
	const m = mod(moduleKey)
	const user = await requirePermission(m.scope, "delete")
	const row = await m.repo.get({ id })
	if (!row) redirect(flashUrl(`/admin/${m.key}`, { type: "error", text: "Kayıt bulunamadı." }))

	const blocked = await m.canDelete?.(row, user.uid)
	if (blocked) redirect(flashUrl(`/admin/${m.key}`, { type: "error", text: blocked }))

	await m.beforeDelete?.(row)
	for (const f of m.fields.filter((x) => x.type === "image")) {
		await removeUpload(
			f.folder!,
			row[f.name],
			(f.resolutions ?? []).map((r) => `${r.w}x${r.h}`),
		)
	}
	if (m.seo) {
		const s = await seoMeta.get({ scope: m.key, ref: String(id) })
		if (s) await seoMeta.remove(s.id)
	}
	await m.repo.remove(id)
	await audit(user.uid, "delete", m.key, id)
	refresh(m.key)
	redirect(flashUrl(`/admin/${m.key}`, { type: "success", text: "Kayıt silindi." }))
}

export async function toggleActiveAction(moduleKey: string, id: number) {
	const m = mod(moduleKey)
	const user = await requirePermission(m.scope, "update")
	if (!m.toggleActive) return
	const row = await m.repo.get({ id })
	if (!row) return
	if (m.key === "users" && row.id === user.uid) return // kendini pasifleştirme
	await m.repo.update(id, { isActive: Number(row.isActive) === 1 ? 0 : 1 })
	await audit(user.uid, "toggle", m.key, id)
	refresh(m.key)
}

export async function moveAction(moduleKey: string, id: number, dir: "up" | "down") {
	const m = mod(moduleKey)
	const user = await requirePermission(m.scope, "update")
	if (!m.sortable) return
	const rows = await m.repo.list({}, "rank ASC")
	rows.sort((a, b) => Number(a.rank) - Number(b.rank) || a.id - b.id)
	const i = rows.findIndex((r) => r.id === id)
	const j = dir === "up" ? i - 1 : i + 1
	if (i < 0 || j < 0 || j >= rows.length) return
	;[rows[i], rows[j]] = [rows[j], rows[i]]
	await m.repo.setRanks(rows.map((r) => r.id))
	await audit(user.uid, "reorder", m.key, id)
	refresh(m.key)
}

/* ───────────── SEO (statik sayfalar) ───────────── */
export async function saveSeoPageAction(
	ref: string,
	_prev: FormState,
	fd: FormData,
): Promise<FormState> {
	try {
		const { saveImage, removeUpload } = await import("@/lib/storage")
		const user = await requirePermission("system", "update")
		const { SEO_PAGES } = await import("@/lib/seo")
		if (!SEO_PAGES.some((p) => p.ref === ref)) return { ok: false, message: "Geçersiz sayfa." }
		const seo = parseSeo(fd)
		if (Object.keys(seo.errors).length)
			return { ok: false, errors: seo.errors, message: "Lütfen alanları düzeltin." }

		let og = ""
		const cur = await seoMeta.get({ scope: "page", ref })
		og = String(cur?.og_image ?? "")
		const file = fd.get("og_image")
		if (file instanceof File && file.size > 0) {
			const name = await saveImage("seo_v", file)
			if (og) await removeUpload("seo_v", og)
			og = name
		}
		const payload = { ...seo.data, og_image: og, updatedAt: new Date().toISOString() }
		if (cur) await seoMeta.update(cur.id, payload)
		else await seoMeta.insert({ scope: "page", ref, ...payload })
		await audit(user.uid, "update", "seo", ref)
		revalidateTag(CONTENT_TAG)
		revalidatePath("/", "layout")
		return { ok: true, message: "SEO ayarları kaydedildi." }
	} catch (e) {
		const uploadMsg = asUploadErrorMessage(e)
		if (uploadMsg) return { ok: false, message: uploadMsg }
		if (e instanceof ForbiddenError) return { ok: false, message: e.message }
		logError("admin.seo", e)
		return { ok: false, message: "İşlem sırasında bir hata oluştu." }
	}
}

/* ───────── E-posta testi (ayarlar .env'den; panelde şifre gösterilmez/saklanmaz) ───────── */
export async function sendTestMailAction(_prev: FormState): Promise<FormState> {
	try {
		const user = await requirePermission("system", "update")
		const { sendMail, mailConfigured } = await import("@/lib/mail")
		const { rateLimit } = await import("@/lib/security/rate-limit")
		if (!mailConfigured()) return { ok: false, message: "SMTP ayarları .env içinde eksik." }
		if (!rateLimit(`testmail:${user.uid}`, 3, 10 * 60_000).ok)
			return { ok: false, message: "Çok sık deneme yaptınız." }
		const ok = await sendMail({
			subject: "Test e-postası",
			html: "<p>SMTP yapılandırması çalışıyor.</p>",
		})
		await audit(user.uid, "test-mail", "mail", null)
		return ok
			? { ok: true, message: "Test e-postası gönderildi." }
			: { ok: false, message: "Gönderilemedi. Sunucu loglarına bakın." }
	} catch (e) {
		if (e instanceof ForbiddenError) return { ok: false, message: e.message }
		logError("admin.testmail", e)
		return { ok: false, message: "İşlem sırasında bir hata oluştu." }
	}
}

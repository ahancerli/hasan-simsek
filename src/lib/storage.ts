import "server-only"
import { promises as fs } from "node:fs"
import path from "node:path"
import { randomBytes } from "node:crypto"
import sharp from "sharp"
import { env } from "@/lib/env"
import { slugify } from "@/lib/utils"

/**
 * Yükleme güvenliği:
 *  - uzantıya/MIME'a değil, DOSYA İÇERİĞİNE (sharp ile gerçek görsel çözümleme) bakılır
 *  - dosya adı sunucuda üretilir (path traversal yok), orijinal ad yalnızca slug olarak eklenir
 *  - EXIF/GPS metadata silinir, boyut sınırlanır
 *  - yükleme dizini public/assets/uploads (DB'deki adlarla birebir)
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_FILE_BYTES = 12 * 1024 * 1024
const IMAGE_FORMATS = new Set(["jpeg", "png", "webp"])
const DOC_EXT = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip"])

export class UploadError extends Error {}

const root = () => path.resolve(process.cwd(), env().UPLOAD_DIR)
const FOLDER = /^[A-Za-z0-9_\-\/]+$/

function dirFor(folder: string, sub?: string) {
	if (!FOLDER.test(folder) || folder.includes("..")) throw new UploadError("Geçersiz klasör")
	const dir = path.resolve(root(), folder, sub ?? "")
	if (!dir.startsWith(root())) throw new UploadError("Geçersiz yol")
	return dir
}

const uniq = () => randomBytes(6).toString("hex")

export async function saveImage(
	folder: string,
	file: File,
	opts: { resolutions?: { w: number; h: number }[]; subdir?: string } = {},
): Promise<string> {
	if (!file || file.size === 0) throw new UploadError("Dosya seçilmedi")
	if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Görsel 5 MB'ı aşamaz")
	const buf = Buffer.from(await file.arrayBuffer())

	let meta: sharp.Metadata
	try {
		meta = await sharp(buf, { limitInputPixels: 50_000_000 }).metadata()
	} catch {
		throw new UploadError("Geçerli bir görsel değil")
	}
	if (!meta.format || !IMAGE_FORMATS.has(meta.format))
		throw new UploadError("Yalnızca JPG, PNG veya WEBP yüklenebilir")

	const ext = meta.format === "jpeg" ? "jpg" : meta.format
	const base = slugify(file.name.replace(/\.[^.]+$/, ""), 60) || "gorsel"
	const name = `${uniq()}${base}.${ext}`

	const dir = dirFor(folder, opts.subdir)
	await fs.mkdir(dir, { recursive: true })

	const pipeline = () =>
		sharp(buf)
			.rotate()
			.resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
	const encode = (p: sharp.Sharp) =>
		ext === "png"
			? p.png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
			: ext === "webp"
				? p.webp({ quality: 78, effort: 6 })
				: p.jpeg({ quality: 78, mozjpeg: true, progressive: true })

	await fs.writeFile(path.join(dir, name), await encode(pipeline()).toBuffer())

	for (const r of opts.resolutions ?? []) {
		const rdir = dirFor(folder, `${r.w}x${r.h}`)
		await fs.mkdir(rdir, { recursive: true })
		await fs.writeFile(
			path.join(rdir, name),
			await encode(
				sharp(buf).rotate().resize(r.w, r.h, { fit: "cover", position: "centre" }),
			).toBuffer(),
		)
	}
	return name
}

export async function saveDocument(folder: string, file: File, subdir: string): Promise<string> {
	if (!file || file.size === 0) throw new UploadError("Dosya seçilmedi")
	if (file.size > MAX_FILE_BYTES) throw new UploadError("Dosya 12 MB'ı aşamaz")
	const ext = (file.name.split(".").pop() ?? "").toLowerCase()
	if (!DOC_EXT.has(ext)) throw new UploadError("Bu dosya türüne izin verilmiyor")
	const name = `${uniq()}${slugify(file.name.replace(/\.[^.]+$/, ""), 60) || "dosya"}.${ext}`
	const dir = dirFor(folder, subdir)
	await fs.mkdir(dir, { recursive: true })
	await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))
	return name
}

export async function removeUpload(
	folder: string,
	name: unknown,
	resolutions: string[] = [],
	subdir?: string,
) {
	const n = String(name ?? "")
	if (!n || n.includes("/") || n.includes("..")) return
	const targets = [dirFor(folder, subdir), ...resolutions.map((r) => dirFor(folder, r))]
	await Promise.all(targets.map((d) => fs.rm(path.join(d, n), { force: true })))
}

/** Galeri kayıtları "uploads/..." göreli yolu tutar; güvenli silme. */
export async function removeLegacyPath(p: unknown) {
	const s = String(p ?? "").replace(/^\/+/, "")
	if (!s.startsWith("uploads/") || s.includes("..")) return
	const abs = path.resolve(root(), s.slice("uploads/".length))
	if (abs.startsWith(root())) await fs.rm(abs, { force: true })
}

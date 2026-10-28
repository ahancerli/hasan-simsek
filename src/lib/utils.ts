import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

const TR: Record<string, string> = {
	ç: "c",
	ğ: "g",
	ı: "i",
	ö: "o",
	ş: "s",
	ü: "u",
	Ç: "c",
	Ğ: "g",
	İ: "i",
	I: "i",
	Ö: "o",
	Ş: "s",
	Ü: "u",
}

/** Eski PHP `Seo()` yardımcısının karşılığı – URL slug üretir. */
export function slugify(input: string, limit = 120): string {
	return String(input ?? "")
		.replace(/[çğıöşüÇĞİIÖŞÜ]/g, (c) => TR[c] ?? c)
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, limit)
}

export function formatDate(v: unknown): string {
	if (!v) return ""
	const s = String(v).replace(/^(\d{4}-\d{2}-\d{2}) (\d{2})-(\d{2})-(\d{2})$/, "$1T$2:$3:$4") // eski "H-i-s" biçimi
	const d = new Date(s.length === 10 ? `${s}T00:00:00` : s)
	return isNaN(d.getTime())
		? ""
		: d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
}

export function truncate(text: string, max: number): string {
	const t = text.replace(/\s+/g, " ").trim()
	return t.length <= max ? t : t.slice(0, max).replace(/\s+\S*$/, "") + "…"
}

/** Eski içeriklerden kalan <p>/<br> etiketlerini düz metne çevirir. */
export function stripParagraphTags(v: unknown): string {
	return String(v ?? "")
		.replace(/<\/p>\s*<p[^>]*>/gi, "\n")
		.replace(/<br\s*\/?\s*>/gi, "\n")
		.replace(/<\/?p\b[^>]*>/gi, "")
		.trim()
}

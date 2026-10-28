import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { requireEnvString } from "@/lib/env"

/**
 * Bildirim mesajları URL'de taşınır ama İMZALIDIR → saldırgan sahte mesaj (phishing) enjekte edemez.
 */
export type Flash = { type: "success" | "error"; text: string }

const sign = (payload: string) =>
	createHmac("sha256", requireEnvString("SESSION_SECRET", 32))
		.update(`flash:${payload}`)
		.digest("base64url")

export function flashUrl(path: string, f: Flash): string {
	const payload = Buffer.from(JSON.stringify(f)).toString("base64url")
	const sep = path.includes("?") ? "&" : "?"
	return `${path}${sep}f=${payload}.${sign(payload)}`
}

export function readFlash(v: string | string[] | undefined): Flash | null {
	const s = Array.isArray(v) ? v[0] : v
	if (!s) return null
	const [payload, sig] = s.split(".")
	if (!payload || !sig) return null
	const expected = Buffer.from(sign(payload))
	const given = Buffer.from(sig)
	if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
	try {
		const f = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Flash
		return f && (f.type === "success" || f.type === "error") && typeof f.text === "string"
			? { type: f.type, text: f.text.slice(0, 300) }
			: null
	} catch {
		return null
	}
}

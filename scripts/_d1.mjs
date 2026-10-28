// Ortak: .env.local oku + D1 REST çağrısı
import { existsSync, readFileSync } from "node:fs"

function loadEnvCompat(file) {
	if (typeof process.loadEnvFile === "function") {
		process.loadEnvFile(file)
		return
	}
	// Node < 20.12 fallback: simple .env parser for KEY=VALUE lines.
	const raw = readFileSync(file, "utf8")
	for (const line of raw.split(/\r?\n/)) {
		const t = line.trim()
		if (!t || t.startsWith("#")) continue
		const eq = t.indexOf("=")
		if (eq <= 0) continue
		const key = t.slice(0, eq).trim()
		let value = t.slice(eq + 1).trim()
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1)
		}
		if (!(key in process.env)) process.env[key] = value
	}
}

for (const f of [".env.local", ".env"]) if (existsSync(f)) loadEnvCompat(f)

const need = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_D1_DATABASE_ID", "CLOUDFLARE_API_TOKEN"]
const missing = need.filter((k) => !process.env[k])
if (missing.length) {
	console.error(`Eksik ortam değişkenleri: ${missing.join(", ")} (.env.local dosyasını doldurun)`)
	process.exit(1)
}

export async function d1(sql, params = []) {
	const {
		CLOUDFLARE_ACCOUNT_ID: a,
		CLOUDFLARE_D1_DATABASE_ID: d,
		CLOUDFLARE_API_TOKEN: t,
	} = process.env
	const res = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${a}/d1/database/${d}/query`,
		{
			method: "POST",
			headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
			body: JSON.stringify({ sql, params }),
		},
	)
	const j = await res.json()
	if (!res.ok || !j.success)
		throw new Error(j.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`)
	return j.result[0].results ?? []
}

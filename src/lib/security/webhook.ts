import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { requireEnvString } from "@/lib/env"

/**
 * Webhook imzası:  X-Signature: t=<unix>,v1=<hex hmac-sha256(secret, `${t}.${rawBody}`)>
 * - zaman damgası 5 dk dışındaysa reddedilir (replay koruması)
 * - karşılaştırma sabit zamanlı
 */
const TOLERANCE_SEC = 300
const webhookSecret = () => requireEnvString("WEBHOOK_SECRET", 32)

export function signWebhook(
	rawBody: string,
	t = Math.floor(Date.now() / 1000),
	secret = webhookSecret(),
) {
	const v1 = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex")
	return `t=${t},v1=${v1}`
}

export function verifyWebhook(rawBody: string, header: string | null): boolean {
	if (!header) return false
	const parts = Object.fromEntries(
		header.split(",").map((p) => p.trim().split("=") as [string, string]),
	)
	const t = Number(parts.t)
	const sig = parts.v1
	if (!Number.isFinite(t) || !sig || !/^[a-f0-9]{64}$/.test(sig)) return false
	if (Math.abs(Math.floor(Date.now() / 1000) - t) > TOLERANCE_SEC) return false
	const expected = createHmac("sha256", webhookSecret()).update(`${t}.${rawBody}`).digest()
	return timingSafeEqual(expected, Buffer.from(sig, "hex"))
}

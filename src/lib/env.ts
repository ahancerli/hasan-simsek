import "server-only"
import { z } from "zod"

/**
 * Tüm ortam değişkenleri burada doğrulanır. Eksik/zayıf değer varsa
 * uygulama ilk kullanımda NET bir hata ile durur (sızıntısız mesaj).
 */
const schema = z.object({
	APP_URL: z.string().url().default("http://localhost:3000"),
	// Build sırasında robots/sitemap gibi rotalar tüm gizli değerleri kullanmaz.
	// Bu yüzden burada toleranslı parse eder, kritik alanları kullanım noktasında zorunlu kılarız.
	CLOUDFLARE_ACCOUNT_ID: z.string().default(""),
	CLOUDFLARE_D1_DATABASE_ID: z.string().default(""),
	CLOUDFLARE_API_TOKEN: z.string().default(""),
	SESSION_SECRET: z.string().default(""),
	WEBHOOK_SECRET: z.string().default(""),
	SMTP_HOST: z.string().optional().default(""),
	SMTP_PORT: z.coerce.number().default(587),
	SMTP_SECURE: z.enum(["true", "false"]).default("false"),
	SMTP_USER: z.string().optional().default(""),
	SMTP_PASSWORD: z.string().optional().default(""),
	MAIL_FROM_NAME: z.string().default("Web Sitesi"),
	MAIL_FROM: z.string().optional().default(""),
	MAIL_TO: z.string().optional().default(""),
	UPLOAD_DIR: z.string().default("public/assets/uploads"),
})

export type Env = z.infer<typeof schema>

let cached: Env | null = null
export function env(): Env {
	if (cached) return cached
	const parsed = schema.safeParse(process.env)
	if (!parsed.success) {
		const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ")
		// Değerleri ASLA loglamayız, yalnızca anahtar adlarını.
		throw new Error(`Geçersiz/eksik ortam değişkenleri: ${keys}`)
	}
	cached = parsed.data
	return cached
}

export function requireEnvString(key: keyof Env, min = 1): string {
	const value = env()[key]
	if (typeof value !== "string" || value.length < min) {
		throw new Error(`Geçersiz/eksik ortam değişkeni: ${String(key)}`)
	}
	return value
}

export const isProd = process.env.NODE_ENV === "production"

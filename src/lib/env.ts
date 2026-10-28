import "server-only";
import { z } from "zod";

/**
 * Tüm ortam değişkenleri burada doğrulanır. Eksik/zayıf değer varsa
 * uygulama ilk kullanımda NET bir hata ile durur (sızıntısız mesaj).
 */
const schema = z.object({
  APP_URL: z.string().url().default("http://localhost:3000"),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_D1_DATABASE_ID: z.string().min(1),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET en az 32 karakter olmalı"),
  WEBHOOK_SECRET: z.string().min(32, "WEBHOOK_SECRET en az 32 karakter olmalı"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.enum(["true", "false"]).default("false"),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  MAIL_FROM_NAME: z.string().default("Web Sitesi"),
  MAIL_FROM: z.string().optional().default(""),
  MAIL_TO: z.string().optional().default(""),
  UPLOAD_DIR: z.string().default("public/assets/uploads"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    // Değerleri ASLA loglamayız, yalnızca anahtar adlarını.
    throw new Error(`Geçersiz/eksik ortam değişkenleri: ${keys}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProd = process.env.NODE_ENV === "production";

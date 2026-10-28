import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { logError } from "@/lib/logger";
import { stripHtml } from "@/lib/security/sanitize";

/**
 * SMTP ayarları .env'den okunur (eski sistemde DB'de açık metin tutuluyordu).
 * Başlık enjeksiyonuna karşı konu/adres alanları tek satıra indirgenir.
 */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim().slice(0, 200);
const esc = (s: string) => stripHtml(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let transporter: nodemailer.Transporter | null = null;
function tx() {
  if (transporter) return transporter;
  const e = env();
  transporter = nodemailer.createTransport({
    host: e.SMTP_HOST,
    port: e.SMTP_PORT,
    secure: e.SMTP_SECURE === "true",
    requireTLS: e.SMTP_SECURE !== "true", // STARTTLS zorunlu
    auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASSWORD } : undefined,
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

export function mailConfigured() {
  const e = env();
  return Boolean(e.SMTP_HOST && e.MAIL_FROM && e.MAIL_TO);
}

export async function sendMail(opts: { to?: string; subject: string; html: string; replyTo?: string }): Promise<boolean> {
  const e = env();
  if (!mailConfigured()) return false;
  try {
    await tx().sendMail({
      from: { name: oneLine(e.MAIL_FROM_NAME), address: e.MAIL_FROM },
      to: opts.to ?? e.MAIL_TO,
      replyTo: opts.replyTo ? oneLine(opts.replyTo) : undefined,
      subject: oneLine(opts.subject),
      html: opts.html,
    });
    return true;
  } catch (err) {
    logError("mail.send", err);
    return false;
  }
}

export function contactMailHtml(m: { name: string; email: string; phone: string; subject: string; message: string }) {
  return `<h3>Site İletişim Mesajı</h3>
<p><b>Ad Soyad:</b> ${esc(m.name)}</p>
<p><b>E-posta:</b> ${esc(m.email)}</p>
<p><b>Telefon:</b> ${esc(m.phone)}</p>
<p><b>Konu:</b> ${esc(m.subject)}</p>
<p><b>Mesaj:</b><br>${esc(m.message).replace(/\n/g, "<br>")}</p>`;
}

export { esc as escapeHtml };

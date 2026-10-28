"use server";

import { z } from "zod";
import { contactMessages } from "@/lib/db/tables";
import { contactMailHtml, sendMail } from "@/lib/mail";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";
import { stripHtml } from "@/lib/security/sanitize";
import { logError } from "@/lib/logger";

export type ContactState = { ok: boolean; message?: string; errors?: Record<string, string> };

const schema = z.object({
  name: z.string().trim().min(2, "Adınızı girin").max(100),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(254),
  phone: z.string().trim().max(30).regex(/^[0-9+()\-\s]*$/, "Geçerli bir telefon girin").optional().default(""),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10, "Mesajınız en az 10 karakter olmalı").max(3000),
});

/** İletişim formu: honeypot + rate limit + doğrulama + DB kaydı (mail başarısız olsa da mesaj kaybolmaz). */
export async function sendContactMessage(_prev: ContactState, fd: FormData): Promise<ContactState> {
  if (String(fd.get("website") ?? "") !== "") return { ok: true, message: "Mesajınız iletildi." }; // bot: sessizce yut

  const ip = await clientIp();
  if (!rateLimit(`contact:${ip}`, 3, 10 * 60_000).ok) return { ok: false, message: "Çok sık mesaj gönderdiniz. Lütfen biraz bekleyin." };

  const parsed = schema.safeParse({
    name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone") ?? "", subject: fd.get("subject") ?? "", message: fd.get("message"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, errors, message: "Lütfen formu kontrol edin." };
  }
  const d = { ...parsed.data, name: stripHtml(parsed.data.name), subject: stripHtml(parsed.data.subject), message: stripHtml(parsed.data.message), phone: stripHtml(parsed.data.phone) };

  try {
    const sent = await sendMail({
      subject: `Site İletişim Mesajı || ${d.subject || "Konusuz"}`,
      html: contactMailHtml(d),
      replyTo: d.email,
    });
    await contactMessages.insert({ ...d, ip, mail_sent: sent ? 1 : 0, createdAt: new Date().toISOString() });
    return { ok: true, message: "Mesajınız başarıyla iletildi. En kısa sürede dönüş yapacağız." };
  } catch (e) {
    logError("contact.send", e);
    return { ok: false, message: "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin." };
  }
}

/** "Bir daha gösterme" – eski cookie mantığı; yalnızca doğrulanmış, kısa bir kimlik kabul edilir. */
export async function dismissPopup(popupId: string) {
  const { cookies } = await import("next/headers");
  if (!/^[a-f0-9]{8,32}$/i.test(popupId)) return;
  (await cookies()).set(`popup_${popupId}`, "1", {
    maxAge: 60 * 60 * 24 * 360, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", httpOnly: true,
  });
}

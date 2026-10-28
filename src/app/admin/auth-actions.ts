"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { query } from "@/lib/db/d1";
import { users, passwordResets } from "@/lib/db/tables";
import { createSession, destroySession, getUser, requireUser } from "@/lib/security/session";
import { hashPassword, verifyPassword, PASSWORD_MAX } from "@/lib/security/password";
import { passwordSchema } from "@/lib/security/policy";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";
import { isRole } from "@/lib/security/roles";
import { audit } from "@/lib/security/audit";
import { sendMail, escapeHtml } from "@/lib/mail";
import { env } from "@/lib/env";
import { flashUrl } from "@/lib/flash";
import { logError } from "@/lib/logger";

export type AuthState = { ok: boolean; message?: string };

const GENERIC_FAIL = "E-posta veya şifre hatalı.";
const MAX_FAILS = 5;
const LOCK_MIN = 15;

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(PASSWORD_MAX),
});

/* ───────── Giriş ───────── */
export async function loginAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, message: GENERIC_FAIL };
  const { email, password } = parsed.data;

  const ip = await clientIp();
  const rl = rateLimit(`login:ip:${ip}`, 10, 15 * 60_000);
  const rl2 = rateLimit(`login:email:${email}`, 8, 15 * 60_000);
  if (!rl.ok || !rl2.ok) return { ok: false, message: "Çok fazla deneme. Lütfen biraz sonra tekrar deneyin." };

  try {
    const u = await users.get({ email });
    const locked = u?.locked_until && new Date(String(u.locked_until)).getTime() > Date.now();

    // Kullanıcı yoksa/kilitliyse de hash doğrulaması çalışır → zamanlama sızıntısı yok.
    const v = await verifyPassword(password, u ? String(u.password ?? "") : null);

    if (!u || locked || Number(u.isActive) !== 1 || !v.ok || !isRole(u.role)) {
      if (u && !locked && !v.ok) {
        const fails = Number(u.failed_attempts ?? 0) + 1;
        await users.update(u.id, {
          failed_attempts: fails >= MAX_FAILS ? 0 : fails,
          locked_until: fails >= MAX_FAILS ? new Date(Date.now() + LOCK_MIN * 60_000).toISOString() : null,
        });
      }
      await audit(u?.id ?? null, "login-failed", "auth", null);
      return { ok: false, message: locked ? "Hesap geçici olarak kilitlendi. Daha sonra tekrar deneyin." : GENERIC_FAIL };
    }

    const patch: Record<string, unknown> = { failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() };
    if (v.needsRehash) patch.password = await hashPassword(password); // md5 → bcrypt sessiz geçiş
    await users.update(u.id, patch);

    await createSession({ uid: u.id, role: u.role, name: String(u.full_name ?? "") });
    await audit(u.id, "login", "auth", u.id);
  } catch (e) {
    logError("auth.login", e);
    return { ok: false, message: "Şu anda giriş yapılamıyor. Lütfen daha sonra deneyin." };
  }
  redirect("/admin");
}

export async function logoutAction() {
  const u = await getUser();
  await destroySession();
  if (u) await audit(u.uid, "logout", "auth", u.uid);
  redirect("/admin/login");
}

/* ───────── Şifremi unuttum (tek kullanımlık, süreli token) ───────── */
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function forgotPasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const SAME = { ok: true, message: "Bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi." };
  const email = z.string().trim().toLowerCase().email().max(254).safeParse(fd.get("email"));
  if (!email.success) return SAME;

  const ip = await clientIp();
  if (!rateLimit(`forgot:ip:${ip}`, 5, 60 * 60_000).ok || !rateLimit(`forgot:e:${email.data}`, 3, 60 * 60_000).ok) return SAME;

  try {
    const u = await users.get({ email: email.data, isActive: 1 });
    if (u) {
      const token = randomBytes(32).toString("hex");
      await query(`UPDATE "password_resets" SET "used" = 1 WHERE "user_id" = ? AND "used" = 0`, [u.id]);
      await passwordResets.insert({
        user_id: u.id,
        token_hash: sha256(token),
        expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
        used: 0,
        createdAt: new Date().toISOString(),
      });
      const link = `${env().APP_URL}/admin/sifre-sifirla?token=${token}`;
      await sendMail({
        to: String(u.email),
        subject: "Şifre sıfırlama",
        html: `<p>Merhaba ${escapeHtml(String(u.full_name ?? ""))},</p><p>Şifrenizi sıfırlamak için 30 dakika geçerli bağlantı: <a href="${link}">${link}</a></p><p>Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>`,
      });
    }
  } catch (e) {
    logError("auth.forgot", e);
  }
  return SAME;
}

export async function resetPasswordAction(token: string, _prev: AuthState, fd: FormData): Promise<AuthState> {
  const pw = passwordSchema.safeParse(fd.get("password"));
  if (!pw.success) return { ok: false, message: pw.error.issues[0].message };
  if (fd.get("password") !== fd.get("password2")) return { ok: false, message: "Şifreler eşleşmiyor." };
  if (!/^[a-f0-9]{64}$/.test(token)) return { ok: false, message: "Bağlantı geçersiz veya süresi dolmuş." };

  const rec = await passwordResets.get({ token_hash: sha256(token), used: 0 });
  if (!rec || new Date(String(rec.expires_at)).getTime() < Date.now()) return { ok: false, message: "Bağlantı geçersiz veya süresi dolmuş." };

  await users.update(Number(rec.user_id), { password: await hashPassword(pw.data), failed_attempts: 0, locked_until: null });
  await passwordResets.update(rec.id, { used: 1 });
  await audit(Number(rec.user_id), "password-reset", "auth", rec.user_id as number);
  redirect(flashUrl("/admin/login", { type: "success", text: "Şifreniz güncellendi. Giriş yapabilirsiniz." }));
}

/* ───────── Profil: kendi şifresini değiştir ───────── */
export async function changeOwnPasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const me = await requireUser();
  const pw = passwordSchema.safeParse(fd.get("password"));
  if (!pw.success) return { ok: false, message: pw.error.issues[0].message };
  if (fd.get("password") !== fd.get("password2")) return { ok: false, message: "Şifreler eşleşmiyor." };

  const u = await users.get({ id: me.uid });
  const v = await verifyPassword(String(fd.get("current") ?? ""), u ? String(u.password ?? "") : null);
  if (!v.ok) return { ok: false, message: "Mevcut şifre hatalı." };

  await users.update(me.uid, { password: await hashPassword(pw.data) });
  await audit(me.uid, "password-change", "auth", me.uid);
  return { ok: true, message: "Şifreniz güncellendi." };
}

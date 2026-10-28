"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, forgotPasswordAction, resetPasswordAction, type AuthState } from "@/app/admin/auth-actions";

const init: AuthState = { ok: false };
const Msg = ({ s }: { s: AuthState }) => s.message ? <p role={s.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${s.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{s.message}</p> : null;

export function LoginForm() {
  const [s, action, pending] = useActionState(loginAction, init);
  return (
    <form action={action} className="space-y-4">
      <Msg s={s} />
      <div><label htmlFor="email" className="mb-1 block text-sm font-semibold">E-posta</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={254} className="input" /></div>
      <div><label htmlFor="password" className="mb-1 block text-sm font-semibold">Şifre</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={128} className="input" /></div>
      <button disabled={pending} className="btn btn-brand w-full">{pending ? "Giriş yapılıyor…" : "Giriş Yap"}</button>
      <p className="text-center text-sm"><Link href="/admin/sifre-unuttum" className="text-ink-500 hover:text-ink">Şifremi unuttum</Link></p>
    </form>
  );
}

export function ForgotForm() {
  const [s, action, pending] = useActionState(forgotPasswordAction, init);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-ink-500">E-posta adresinizi girin; kayıtlıysa sıfırlama bağlantısı gönderelim.</p>
      <Msg s={s} />
      <div><label htmlFor="email" className="mb-1 block text-sm font-semibold">E-posta</label><input id="email" name="email" type="email" required maxLength={254} className="input" /></div>
      <button disabled={pending} className="btn btn-brand w-full">{pending ? "Gönderiliyor…" : "Bağlantı Gönder"}</button>
      <p className="text-center text-sm"><Link href="/admin/login" className="text-ink-500 hover:text-ink">Girişe dön</Link></p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [s, action, pending] = useActionState<AuthState, FormData>(resetPasswordAction.bind(null, token), init);
  return (
    <form action={action} className="space-y-4">
      <Msg s={s} />
      <div><label htmlFor="password" className="mb-1 block text-sm font-semibold">Yeni şifre</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} className="input" /><p className="mt-1 text-xs text-ink-500">En az 10 karakter, harf ve rakam.</p></div>
      <div><label htmlFor="password2" className="mb-1 block text-sm font-semibold">Tekrar</label><input id="password2" name="password2" type="password" autoComplete="new-password" required className="input" /></div>
      <button disabled={pending} className="btn btn-brand w-full">{pending ? "Kaydediliyor…" : "Şifreyi Sıfırla"}</button>
    </form>
  );
}

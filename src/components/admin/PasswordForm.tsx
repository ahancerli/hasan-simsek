"use client";

import { useActionState } from "react";
import { changeOwnPasswordAction, type AuthState } from "@/app/admin/auth-actions";

export function PasswordForm() {
  const [s, action, pending] = useActionState<AuthState, FormData>(changeOwnPasswordAction, { ok: false });
  return (
    <form action={action} className="max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="text-lg font-bold">Şifre Değiştir</h2>
      {s.message && <p role={s.ok ? "status" : "alert"} className={`text-sm ${s.ok ? "text-green-700" : "text-red-600"}`}>{s.message}</p>}
      <div><label htmlFor="current" className="mb-1 block text-sm font-semibold">Mevcut şifre</label><input id="current" name="current" type="password" autoComplete="current-password" required className="input" /></div>
      <div><label htmlFor="password" className="mb-1 block text-sm font-semibold">Yeni şifre</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} className="input" /><p className="mt-1 text-xs text-ink-500">En az 10 karakter, harf ve rakam içermeli.</p></div>
      <div><label htmlFor="password2" className="mb-1 block text-sm font-semibold">Yeni şifre (tekrar)</label><input id="password2" name="password2" type="password" autoComplete="new-password" required className="input" /></div>
      <button disabled={pending} className="btn btn-brand">{pending ? "Kaydediliyor…" : "Şifreyi Güncelle"}</button>
    </form>
  );
}

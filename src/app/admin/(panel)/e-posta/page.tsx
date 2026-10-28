import { requirePermission } from "@/lib/security/session";
import { env } from "@/lib/env";
import { mailConfigured } from "@/lib/mail";
import { TestMailButton } from "@/components/admin/TestMailButton";

export default async function MailStatus() {
  await requirePermission("system", "read");
  const e = env();
  const rows = [["Sunucu", e.SMTP_HOST || "—"], ["Port", String(e.SMTP_PORT)], ["Kullanıcı", e.SMTP_USER ? e.SMTP_USER.replace(/^(.).*(@.*)$/, "$1***$2") : "—"], ["Gönderen", e.MAIL_FROM || "—"], ["Alıcı", e.MAIL_TO || "—"]];
  return (
    <>
      <h1 className="mb-2 text-2xl font-extrabold">E-posta Durumu</h1>
      <p className="mb-6 text-sm text-ink-500">SMTP ayarları artık veritabanında değil, <code>.env</code> dosyasındadır. Şifre panelde asla gösterilmez.</p>
      <div className="max-w-xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <p className={`mb-4 text-sm font-semibold ${mailConfigured() ? "text-green-700" : "text-red-600"}`}>{mailConfigured() ? "Yapılandırılmış" : "Eksik yapılandırma"}</p>
        <dl className="divide-y divide-ink-100 text-sm">{rows.map(([k, v]) => <div key={k} className="flex justify-between py-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
        <div className="mt-6"><TestMailButton /></div>
      </div>
    </>
  );
}

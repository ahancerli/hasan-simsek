# Hasan Şimşek İnşaat – Next.js

CodeIgniter (PHP) projesinin **Next.js 15 (App Router) + TypeScript + Tailwind CSS** karşılığı.
Site + `/admin` paneli tek uygulamada; veritabanı **Cloudflare D1**, local ve prod **aynı DB**.

## Hızlı başlangıç
```bash
npm install
cp .env.example .env.local        # (hazır .env.local da var) Cloudflare bilgilerini doldurun
npm run db:migrate                # yeni tablolar + users güvenlik sütunları (idempotent)
npm run db:verify                 # canlı D1 şemasını uygulamayla karşılaştırır
ADMIN_EMAIL=siz@ornek.com ADMIN_PASSWORD='GucluSifre123' npm run db:admin   # (isteğe bağlı) yönetici oluştur / sıfırla
npm run typecheck && npm run dev  # http://localhost:3000  ·  panel: /admin
```
Eski kullanıcıların md5 şifreleri **ilk girişte otomatik bcrypt'e** yükseltilir; sıfırlama gerekmez.

## Ortam (tek env, test/prod ayrımı yok)
`.env.local` (git'e girmez). Prod'da aynı anahtarları hosting panelinden girin. Bkz. `.env.example`.
`CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_D1_DATABASE_ID / CLOUDFLARE_API_TOKEN` → D1 REST API; local ve prod aynı DB'ye gider.

## Rotalar (eski site ile birebir)
`/` · `/hakkimizda` · `/vizyon` · `/misyon` · `/markalar` · `/referanslar` · `/iletisim` · `/proje-listesi` ·
`/proje-detay/[slug]` · `/planlanan-projeler` · `/devam-eden-projeler` · `/tamamlanan-projeler` · `/resim-galerimiz` · `/video-galerimiz`
Admin: `/admin` (eski `/panel` yerine) → `/admin/<modül>`, `/admin/<modül>/new`, `/admin/<modül>/<id>`, `/admin/<modül>/<id>/<alt-koleksiyon>`

## Görseller
`public/assets/uploads/<modül_v>/<dosya>` — DB'deki adlarla **birebir** aynı (66 dosya taşındı). Site görselleri `public/assets/images`.
Çalışma anında yüklenenler `UPLOAD_DIR`'e yazılır ve `/assets/uploads/[...path]` rotasıyla güvenle servis edilir.
> Sunucusuz (Vercel/Workers) ortamda disk kalıcı değildir → kalıcı VPS/Docker kullanın ya da `src/lib/storage.ts`'i Cloudflare R2'ye taşıyın.

Ayrıntılar: `docs/ARCHITECTURE.md`, `docs/SECURITY.md`.

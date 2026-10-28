# Mimari

```
src/
├─ middleware.ts              HTTPS zorunlu · nonce'lı CSP · /admin ön kapısı
├─ app/
│  ├─ (site)/…                Herkese açık sayfalar (eski Turkish slug'lar)
│  ├─ admin/(auth)/…          login · şifre-unuttum · şifre-sıfırla
│  ├─ admin/(panel)/…         dashboard · [module] CRUD · SEO · mesajlar · profil · e-posta
│  ├─ admin/actions.ts        GENERIC CRUD server action'ları (kaydet/sil/aktif/sırala/SEO)
│  ├─ admin/child-actions.ts  Alt koleksiyonlar (proje/ürün/galeri görsel-dosya-video)
│  ├─ api/webhooks/revalidate İmzalı (HMAC) webhook · api/health
│  └─ assets/uploads/[...]    Çalışma anı yüklemeleri için güvenli servis
├─ modules/
│  ├─ registry.ts             ★ Admin modüllerinin TEK tanım yeri (alanlar, yetki kapsamı, slug, SEO, çocuklar)
│  ├─ validate.ts             Girdi doğrulama + temizleme
│  └─ types.ts
├─ lib/
│  ├─ db/ d1.ts · repo.ts · tables.ts   D1 REST istemcisi, parametreli repository, tablo beyaz listesi
│  ├─ security/               roles(RBAC) · session(JWT cookie) · password(bcrypt+md5 geçişi) · sanitize · rate-limit · webhook · audit
│  ├─ data.ts                 Site okumaları (etiketli cache, yalnızca isActive=1)
│  ├─ seo.ts                  Dinamik metadata (seo_meta → fallback → settings)
│  ├─ storage.ts              Güvenli görsel/dosya yükleme (sharp)
│  └─ mail.ts · env.ts · logger.ts · flash.ts · video.ts · assets.ts
└─ components/{site,admin,ui}
```

**Yeni modül eklemek** = `registry.ts`'e bir kayıt. Liste, ekle, düzenle, sil, aktif/pasif, sıralama, yetki, denetim kaydı,
önbellek yenileme, görsel yükleme ve (isteğe bağlı) SEO alanları hazır gelir.

**Veri akışı:** sayfa → `lib/data.ts` (cache, tag=`content`) → `repo` → D1. Admin yazınca `revalidateTag("content")`
ile site anında güncellenir. Dış sistemler için `POST /api/webhooks/revalidate` (imzalı).

**Eski → yeni eşleşme:** `Home` controller → `(site)` sayfaları · `panel/*` controller'ları → `/admin/[module]` ·
`Userop` → `admin/auth-actions.ts` · `tools_helper.php` → `lib/{assets,utils,mail,data}` · kategori sabitleri (4/1/2) → `lib/site-config.ts`.

**Eski modüller:** slides, portfolio(+kategori,+görseller), galleries(resim/dosya/video), references, brands, services, product(+görseller),
news, courses, testimonials, popups, users, settings. `emailsettings` → `.env` (panelde yalnızca durum + test maili).
Yeni: SEO yönetimi, gelen mesajlar, denetim kayıtları.

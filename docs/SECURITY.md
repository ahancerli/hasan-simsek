# Güvenlik

## Eski projede bulunan açıklar (saldırgan gözüyle) → çözüm
| # | Bulgu (PHP) | Risk | Yeni durum |
|---|---|---|---|
| 1 | Galeri yüklemede `allowed_types = "*"`, orijinal uzantı korunuyor, dosya web kökünde | **RCE** (php shell yükleme) | İçerik doğrulama (sharp), uzantı/tür beyaz listesi, sunucu üretimli ad, belge servisinde `attachment`+`nosniff`+`sandbox` CSP |
| 2 | Kimlik bilgileri kodda (`database.php`, `Userop.php`) | Sızıntı | `.env` + zod doğrulama, repoda yok; **eski şifreleri döndürün** |
| 3 | `md5` parola, 6–8 karakter sınırı | Kırılabilir | bcrypt(12), 10–128 karakter + harf/rakam; md5 → ilk girişte otomatik yükseltme |
| 4 | Şifre sıfırlama: yeni şifre e-postayla düz metin | Hesap ele geçirme | Tek kullanımlık, 30 dk, SHA-256 hash'li token; jenerik yanıt |
| 5 | Panelde `csrf_protection = FALSE`, silme/aktif GET-tabanlı | CSRF | Server Action (Origin doğrulama) + SameSite=Lax |
| 6 | Çıktılar kaçırılmıyor (`<?= $x ?>`), video HTML'i ham basılıyor | **Stored XSS** | React otomatik kaçış, zengin metin sanitize-html beyaz liste, video yalnızca YouTube/Vimeo ID'den üretilir, CSP |
| 7 | `Userop/send_email` kimlik doğrulamasız, hata ayrıntısı basıyor | Mail kötüye kullanım / bilgi sızıntısı | Kaldırıldı; test maili yalnızca admin + rate limit |
| 8 | `bir-daha-gosterme`: POST'tan gelen ada çerez yazıyor | Çerez enjeksiyonu | Kimlik regex'i ile doğrulanır, `popup_` öneki, httpOnly |
| 9 | Rol yok: giriş yapan herkes kullanıcı yönetebilir | Yetki yükseltme | RBAC admin/editor/viewer, her action sunucuda kontrol, IDOR (alt kayıt-ebeveyn) kontrolü |
| 10 | `ENVIRONMENT=development` varsayılan, hata/SQL ekranda | Bilgi sızıntısı | İstemciye jenerik hata, ayrıntı yalnızca sunucu logunda (gizli alanlar maskeli) |
| 11 | Çerez `secure/httponly = FALSE`, http | Oturum çalma | `HttpOnly; Secure; SameSite=Lax`, prod'da `__Host-` öneki, HTTPS 301 + HSTS |
| 12 | Brute-force koruması yok | Parola tahmini | IP+e-posta rate limit, 5 hatada 15 dk kilit, zamanlama eşitleme |
| 13 | Güvenlik başlıkları yok | Clickjacking vb. | CSP(nonce), X-Frame-Options, nosniff, Referrer/Permissions-Policy, COOP |

## İstenen kontrol listesi
anahtarları çıkar ✔ `.env` · .env geçmişten sil ✔ temiz git geçmişi + `.gitignore` · izin kuralları ✔ `lib/security/roles.ts` ·
hata mesajı kıs ✔ · logları temizle ✔ (eski `logs/` boş; yeni logger hassas alanları maskeler) · sorguyu parametrele ✔ `repo.ts` ·
XSS ✔ · webhook imzası ✔ HMAC-SHA256 + zaman damgası · admin rol ✔ · paket denetimi ✔ `npm run audit` · çerezler ✔ · şifre hash ✔ ·
HTTPS ✔ · girdi doğrulama ✔ zod/validate.ts · saldırgan testi ✔ yukarıdaki tablo.

## Sizin yapmanız gerekenler (kod çözemez)
1. **Sızan kimlik bilgilerini döndürün:** MySQL şifresi (`u9105298_hasan`), SMTP şifresi (`akman@akmanhancerli.com`) — zip'te açık metindi.
2. Cloudflare API token'ı **yalnızca bu D1 için `D1:Edit`** izniyle oluşturun.
3. Eski sunucudaki `.env`/yedek/`application/` dosyalarını kaldırın; eski kodun yayında kalmadığından emin olun.
4. Sunucusuz ortamda yüklemeler için R2 (bkz. README).
5. Rate limit bellek içidir (tek süreç). Çok örnekli çalışıyorsanız Redis/D1 tabanlı yapın; hesap kilidi zaten DB'de.

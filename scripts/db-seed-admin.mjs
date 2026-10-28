// Yönetici oluştur / şifre sıfırla:  ADMIN_EMAIL=a@b.com ADMIN_PASSWORD='…' npm run db:admin
import bcrypt from "bcryptjs";
import { d1 } from "./_d1.mjs";

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const pw = process.env.ADMIN_PASSWORD ?? "";
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { console.error("ADMIN_EMAIL geçersiz"); process.exit(1); }
if (pw.length < 10 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) { console.error("ADMIN_PASSWORD: en az 10 karakter, harf+rakam"); process.exit(1); }

const hash = await bcrypt.hash(pw, 12);
const ex = await d1(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
if (ex.length) {
  await d1(`UPDATE users SET password=?, role='admin', isActive=1, failed_attempts=0, locked_until=NULL WHERE id=?`, [hash, ex[0].id]);
  console.log("✓ Mevcut kullanıcının şifresi güncellendi, rol=admin.");
} else {
  await d1(`INSERT INTO users (user_name, full_name, email, password, role, isActive, createdAt) VALUES (?,?,?,?,?,?,?)`,
    [email.split("@")[0], "Yönetici", email, hash, "admin", 1, new Date().toISOString()]);
  console.log("✓ Yönetici oluşturuldu.");
}

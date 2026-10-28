import { readFileSync } from "node:fs";
import { d1 } from "./_d1.mjs";

// 1) yeni tablolar + indeksler
const sql = readFileSync(new URL("../migrations/0001_security_seo.sql", import.meta.url), "utf8")
  .replace(/^--.*$/gm, "");
for (const stmt of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
  await d1(stmt);
  console.log("✓", stmt.split("\n")[0].slice(0, 70));
}

// 2) users tablosuna güvenlik sütunları (yoksa ekle)
const cols = new Set((await d1(`PRAGMA table_info(users)`)).map((c) => c.name));
const add = [
  ["role", `TEXT NOT NULL DEFAULT 'admin'`], // eski tüm kullanıcılar zaten tam yetkiliydi
  ["failed_attempts", `INTEGER NOT NULL DEFAULT 0`],
  ["locked_until", `TEXT`],
  ["last_login_at", `TEXT`],
];
for (const [name, def] of add) {
  if (cols.has(name)) { console.log("• users." + name + " zaten var"); continue; }
  await d1(`ALTER TABLE users ADD COLUMN ${name} ${def}`);
  console.log("✓ users." + name + " eklendi");
}
console.log("\nMigration tamam. Eski md5 şifreler ilk girişte otomatik bcrypt'e yükseltilir.");

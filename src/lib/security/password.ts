import "server-only";
import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "node:crypto";

const COST = 12;
// Kullanıcı yokken de bcrypt çalıştırıp zamanlama farkından kullanıcı tespitini engelleriz.
let dummy: string | null = null;
const getDummy = () => (dummy ??= bcrypt.hashSync("zamanlama-korumasi", COST));

export { PASSWORD_MIN, PASSWORD_MAX } from "./policy";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

const isLegacyMd5 = (h: string) => /^[a-f0-9]{32}$/i.test(h);

export type VerifyResult = { ok: boolean; needsRehash: boolean };

/**
 * Hem bcrypt hem eski PHP md5 hash'lerini doğrular.
 * Eski md5 ile giriş başarılıysa `needsRehash` döner → çağıran bcrypt ile yeniden yazar
 * (kullanıcıları tek tek şifre sıfırlatmadan güvenli geçiş).
 */
export async function verifyPassword(plain: string, stored: string | null | undefined): Promise<VerifyResult> {
  if (!stored) {
    await bcrypt.compare(plain, getDummy());
    return { ok: false, needsRehash: false };
  }
  if (isLegacyMd5(stored)) {
    const a = Buffer.from(createHash("md5").update(plain).digest("hex"));
    const b = Buffer.from(stored.toLowerCase());
    const ok = a.length === b.length && timingSafeEqual(a, b);
    return { ok, needsRehash: ok };
  }
  const ok = await bcrypt.compare(plain, stored);
  return { ok, needsRehash: ok && bcrypt.getRounds(stored) < COST };
}

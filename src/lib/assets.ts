/**
 * Görsel çözümleme. Tüm görseller /public/assets altında, DB'deki dosya adlarıyla birebir durur:
 *   /assets/uploads/<modül_v>/<dosya>[ /<çözünürlük>/<dosya> ]
 * Eski PHP'deki get_picture() karşılığıdır.
 */
export const ASSET_BASE = "/assets";
export const NO_PHOTO = `${ASSET_BASE}/images/no-photo.png`;

const SAFE = /^[A-Za-z0-9._\-\/]+$/;

export function uploadUrl(folder: string, file?: unknown, resolution?: string): string {
  const f = String(file ?? "");
  if (!f || !SAFE.test(f) || f.includes("..")) return NO_PHOTO;
  return `${ASSET_BASE}/uploads/${folder}/${resolution ? `${resolution}/` : ""}${f}`;
}

/** Galeri kayıtları DB'de "uploads/galleries_v/images/klasor/dosya.jpg" olarak tutuluyor. */
export function legacyPathUrl(p?: unknown): string {
  const s = String(p ?? "").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
  if (!s.startsWith("uploads/") || !SAFE.test(s) || s.includes("..")) return NO_PHOTO;
  return `${ASSET_BASE}/${s}`;
}

export const siteImage = (p: string) => `${ASSET_BASE}/images/${p}`;

import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * XSS savunması – iki katman:
 *  1) Düz metin alanları React tarafından otomatik kaçırılır ({value}); asla dangerouslySetInnerHTML kullanılmaz.
 *  2) Zengin metin (about_us, description…) KAYDEDERKEN ve GÖSTERİRKEN burada beyaz liste ile temizlenir.
 */
const RICH: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote",
    "h2", "h3", "h4", "a", "img", "table", "thead", "tbody", "tr", "th", "td", "hr", "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    "*": [],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer nofollow", ...(attribs.target ? { target: "_blank" } : {}) },
    }),
  },
  disallowedTagsMode: "discard",
};

export function cleanRichText(html: unknown): string {
  return sanitizeHtml(String(html ?? ""), RICH);
}

/** Tüm HTML'i söker (başlık, kısa metin vb. alanlar için). */
export function stripHtml(v: unknown): string {
  return sanitizeHtml(String(v ?? ""), { allowedTags: [], allowedAttributes: {} }).trim();
}

/** Yalnızca http(s) ve site içi göreli URL'lere izin verir (javascript: vb. engellenir). */
export function safeUrl(v: unknown): string {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

/**
 * Eski sitede videolar DB'den ham HTML (iframe) olarak basılıyordu → stored XSS riski.
 * Artık yalnızca URL/iframe içinden YouTube/Vimeo kimliği çıkarılır ve kendi güvenli iframe'imiz üretilir.
 */
export type VideoEmbed = { src: string; provider: "youtube" | "vimeo" } | null;

export function parseVideo(raw: unknown): VideoEmbed {
  const s = String(raw ?? "");
  const src = s.match(/src=["']([^"']+)["']/i)?.[1] ?? s.trim();
  let u: URL;
  try {
    u = new URL(src.startsWith("//") ? `https:${src}` : src);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return yt(u.pathname.slice(1));
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    if (u.pathname.startsWith("/embed/")) return yt(u.pathname.split("/")[2]);
    return yt(u.searchParams.get("v") ?? "");
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean).pop() ?? "";
    return /^\d+$/.test(id) ? { src: `https://player.vimeo.com/video/${id}`, provider: "vimeo" } : null;
  }
  return null;
}

function yt(id: string): VideoEmbed {
  return /^[A-Za-z0-9_-]{6,15}$/.test(id)
    ? { src: `https://www.youtube-nocookie.com/embed/${id}`, provider: "youtube" }
    : null;
}

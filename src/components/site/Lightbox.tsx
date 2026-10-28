"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

export type LightboxImage = { src: string; alt: string };

/** Bağımlılıksız, klavye/ekran okuyucu uyumlu galeri + lightbox. */
export function Lightbox({ images, columns = "sm:grid-cols-2 lg:grid-cols-3" }: { images: LightboxImage[]; columns?: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const n = images.length;
  const step = useCallback((d: number) => setIdx((v) => (v === null ? v : (v + d + n) % n)), [n]);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [idx, step]);

  if (!n) return <p className="rounded-lg bg-ink-100 p-8 text-center text-ink-500">Henüz görsel eklenmemiş.</p>;

  return (
    <>
      <ul className={`grid gap-4 ${columns}`}>
        {images.map((im, k) => (
          <li key={im.src + k}>
            <button type="button" onClick={() => setIdx(k)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink-100" aria-label={`${im.alt} – büyüt`}>
              <Image src={im.src} alt={im.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 grid place-items-center bg-ink/50 opacity-0 transition group-hover:opacity-100"><Expand className="text-brand" /></span>
            </button>
          </li>
        ))}
      </ul>

      {idx !== null && (
        <div role="dialog" aria-modal="true" aria-label="Görsel önizleme" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setIdx(null)}>
          <button ref={closeRef} type="button" aria-label="Kapat" onClick={() => setIdx(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-brand hover:text-ink"><X /></button>
          {n > 1 && <button type="button" aria-label="Önceki" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-brand hover:text-ink"><ChevronLeft /></button>}
          <div className="relative h-[85vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[idx].src} alt={images[idx].alt} fill sizes="100vw" className="object-contain" priority />
          </div>
          {n > 1 && <button type="button" aria-label="Sonraki" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-brand hover:text-ink"><ChevronRight /></button>}
          <p className="absolute bottom-4 text-sm text-white/70">{idx + 1} / {n}</p>
        </div>
      )}
    </>
  );
}

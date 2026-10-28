"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type SlideItem = { id: number; image: string; title: string; text: string; buttonText: string; buttonUrl: string };

export function HeroSlider({ slides }: { slides: SlideItem[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [n, paused, go]);

  if (!n) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Öne çıkanlar"
      className="relative h-[70vh] min-h-[460px] w-full overflow-hidden bg-ink md:h-[78vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, idx) => (
        <div key={s.id} aria-hidden={idx !== i} className={cn("absolute inset-0 transition-opacity duration-1000", idx === i ? "opacity-100" : "pointer-events-none opacity-0")}>
          <Image src={s.image} alt="" fill priority={idx === 0} sizes="100vw" className={cn("object-cover", idx === i && "animate-[kenburns_9s_ease-out_forwards]")} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-transparent" />
          <div className="container relative flex h-full items-center">
            <div className="max-w-2xl text-white">
              <span className="mb-4 inline-block h-1 w-16 rounded bg-brand" />
              <h2 className="font-display text-4xl font-extrabold leading-tight text-white md:text-6xl">{s.title}</h2>
              {s.text && <p className="mt-5 text-lg text-white/85 md:text-xl">{s.text}</p>}
              {s.buttonText && s.buttonUrl && (
                <Link href={s.buttonUrl} className="btn btn-brand mt-8" tabIndex={idx === i ? 0 : -1}>{s.buttonText}</Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {n > 1 && (
        <>
          <button type="button" aria-label="Önceki" onClick={() => go(-1)} className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur transition hover:bg-brand hover:text-ink md:block"><ChevronLeft /></button>
          <button type="button" aria-label="Sonraki" onClick={() => go(1)} className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur transition hover:bg-brand hover:text-ink md:block"><ChevronRight /></button>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Slayt seçimi">
            {slides.map((s, idx) => (
              <button key={s.id} type="button" role="tab" aria-selected={idx === i} aria-label={`${idx + 1}. slayt`} onClick={() => setI(idx)} className={cn("h-2 rounded-full transition-all", idx === i ? "w-8 bg-brand" : "w-2 bg-white/60")} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

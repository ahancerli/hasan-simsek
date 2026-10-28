"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { dismissPopup } from "@/app/actions";

/** İçerik sunucuda sanitize edilip `html` olarak gelir; burada yalnızca gösterim/kapatma var. */
export function PopupModal({ id, title, html }: { id: string; title: string; html: string }) {
  const [open, setOpen] = useState(true);
  const [, start] = useTransition();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="popup-title" className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
          <h2 id="popup-title" className="text-lg font-bold text-white">{title}</h2>
          <button ref={ref} type="button" aria-label="Kapat" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <div className="rich max-h-[60vh] overflow-y-auto p-5" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="flex justify-end gap-3 border-t p-4">
          <button type="button" className="btn btn-dark !py-2" onClick={() => setOpen(false)}>Kapat</button>
          <button type="button" className="btn btn-brand !py-2" onClick={() => { start(() => dismissPopup(id)); setOpen(false); }}>Bir daha gösterme</button>
        </div>
      </div>
    </div>
  );
}

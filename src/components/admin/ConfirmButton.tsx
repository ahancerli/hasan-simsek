"use client";

/** Silme gibi geri alınamaz işlemler için onaylı gönder butonu (form içinde kullanılır). */
export function ConfirmButton({ message, children, className }: { message: string; children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

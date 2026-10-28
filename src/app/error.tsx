"use client";

/** Hata ayrıntısı İSTEMCİYE gösterilmez (stack/SQL sızıntısı yok); yalnızca sunucu loguna gider. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-bold">Bir sorun oluştu</h1>
        <p className="mt-2 text-ink-500">İşleminiz tamamlanamadı. Lütfen tekrar deneyin.</p>
        <button onClick={reset} className="btn btn-brand mt-8">Tekrar dene</button>
      </div>
    </main>
  );
}

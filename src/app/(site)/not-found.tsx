import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <p className="font-display text-8xl font-extrabold text-brand">404</p>
        <h1 className="mt-4 text-3xl font-bold">Sayfa bulunamadı</h1>
        <p className="mt-2 text-ink-500">Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p>
        <Link href="/" className="btn btn-brand mt-8">Anasayfaya dön</Link>
      </div>
    </main>
  );
}

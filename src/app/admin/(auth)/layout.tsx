import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "Yönetici Girişi" }, robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <span className="mx-auto mb-3 grid size-14 place-items-center rounded-xl bg-brand text-xl font-black text-ink">HŞ</span>
          <h1 className="text-2xl font-extrabold text-white">Yönetim Paneli</h1>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-2xl">{children}</div>
      </div>
    </div>
  );
}

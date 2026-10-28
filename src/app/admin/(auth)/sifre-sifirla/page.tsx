import Link from "next/link";
import { ResetForm } from "@/components/admin/AuthForms";

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return <p className="text-sm">Bağlantı geçersiz. <Link href="/admin/sifre-unuttum" className="font-semibold underline">Yeni bağlantı isteyin</Link>.</p>;
  return <ResetForm token={token} />;
}

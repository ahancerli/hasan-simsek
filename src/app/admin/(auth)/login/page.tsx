import { redirect } from "next/navigation";
import { getUser } from "@/lib/security/session";
import { FlashBanner } from "@/components/admin/FlashBanner";
import { LoginForm } from "@/components/admin/AuthForms";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  if (await getUser()) redirect("/admin");
  const sp = await searchParams;
  return (<><FlashBanner param={sp.f} /><LoginForm /></>);
}

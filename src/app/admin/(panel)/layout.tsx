import type { Metadata } from "next";
import { requireUser } from "@/lib/security/session";
import { can, ROLE_LABEL } from "@/lib/security/roles";
import { MODULES } from "@/modules/registry";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata: Metadata = { title: { absolute: "Yönetim Paneli" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(); // oturum + DB'den aktiflik/rol doğrulaması
  const nav = MODULES.filter((m) => can(user.role, m.scope, "read")).map((m) => ({ key: m.key, title: m.title, icon: m.icon, group: m.group }));
  return (
    <div className="min-h-screen bg-ink-100">
      <Sidebar modules={nav} user={{ name: user.name, role: ROLE_LABEL[user.role] }} canSystem={can(user.role, "system", "read")} />
      <div className="lg:pl-64"><div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div></div>
    </div>
  );
}

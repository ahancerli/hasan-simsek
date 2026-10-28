"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Search, Mail, UserCircle, LogOut, ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/auth-actions";

export type NavModule = { key: string; title: string; icon: string; group: string };

export function Sidebar({ modules, user, canSystem }: { modules: NavModule[]; user: { name: string; role: string }; canSystem: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const groups = ["İçerik", "Medya", "Sistem"].map((g) => ({ g, items: modules.filter((m) => m.group === g) })).filter((x) => x.items.length);

  const link = (href: string, label: string, icon: React.ReactNode, exact = false) => {
    const active = exact ? path === href : path === href || path.startsWith(href + "/");
    return (
      <Link key={href} href={href} onClick={() => setOpen(false)}
        className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition", active ? "bg-brand text-ink" : "text-white/75 hover:bg-white/10 hover:text-white")}>
        {icon}{label}
      </Link>
    );
  };

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 text-white lg:hidden">
        <b>Yönetim Paneli</b>
        <button aria-label="Menü" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      <aside className={cn("fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-ink p-4 pt-16 transition lg:translate-x-0 lg:pt-4", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-6 hidden items-center gap-2 px-2 text-white lg:flex">
          <span className="grid size-9 place-items-center rounded-lg bg-brand font-black text-ink">HŞ</span>
          <div className="leading-tight"><b className="block">Yönetim Paneli</b><span className="text-xs text-white/50">Hasan Şimşek İnşaat</span></div>
        </div>
        <nav className="space-y-5" aria-label="Yönetim menüsü">
          <div>{link("/admin", "Anasayfa", <LayoutDashboard size={18} />, true)}</div>
          {groups.map(({ g, items }) => (
            <div key={g}>
              <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">{g}</p>
              <div className="space-y-0.5">
                {items.map((m) => link(`/admin/${m.key}`, m.title, <Icon name={m.icon} size={18} />))}
                {g === "Sistem" && canSystem && (<>
                  {link("/admin/seo", "SEO Yönetimi", <Search size={18} />)}
                  {link("/admin/e-posta", "E-posta Durumu", <Mail size={18} />)}
                </>)}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-8 space-y-1 border-t border-white/10 pt-4">
          {link("/admin/profil", `${user.name} (${user.role})`, <UserCircle size={18} />)}
          <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10"><ExternalLink size={18} />Siteyi Gör</a>
          <form action={logoutAction}><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-red-500/20 hover:text-red-300"><LogOut size={18} />Çıkış</button></form>
        </div>
      </aside>
    </>
  );
}

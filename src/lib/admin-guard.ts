import "server-only";
import { notFound, redirect } from "next/navigation";
import { getModule } from "@/modules/registry";
import { requireUser } from "@/lib/security/session";
import { can, type Action } from "@/lib/security/roles";
import { flashUrl } from "@/lib/flash";

/** Modülü çözer ve yetkiyi SUNUCUDA doğrular. Bilinmeyen modül → 404, yetkisiz → panele geri. */
export async function loadModule(key: string, action: Action = "read") {
  const m = getModule(key);
  if (!m) notFound();
  const user = await requireUser();
  if (!can(user.role, m.scope, action)) redirect(flashUrl("/admin", { type: "error", text: "Bu bölüm için yetkiniz yok." }));
  return { m, user };
}

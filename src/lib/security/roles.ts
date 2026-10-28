/**
 * Rol tabanlı yetkilendirme (RBAC).
 *   admin  → her şey (kullanıcılar, ayarlar, e-posta, SEO dahil)
 *   editor → içerik modüllerinde oluştur/düzenle/sil; sistem modüllerine erişemez
 *   viewer → yalnızca okuma
 * Yetki KONTROLÜ her server action ve her admin sayfasında sunucuda yapılır;
 * menüde gizlemek tek başına güvenlik sayılmaz.
 */
export const ROLES = ["admin", "editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];
export type Action = "read" | "create" | "update" | "delete";
export type Scope = "content" | "system";

export const ROLE_LABEL: Record<Role, string> = { admin: "Yönetici", editor: "Editör", viewer: "İzleyici" };

const MATRIX: Record<Role, Record<Scope, readonly Action[]>> = {
  admin: { content: ["read", "create", "update", "delete"], system: ["read", "create", "update", "delete"] },
  editor: { content: ["read", "create", "update", "delete"], system: [] },
  viewer: { content: ["read"], system: [] },
};

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

export function can(role: Role | undefined, scope: Scope, action: Action): boolean {
  if (!role) return false;
  return MATRIX[role][scope].includes(action);
}

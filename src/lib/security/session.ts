import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { env, isProd, requireEnvString } from "@/lib/env"
import { users } from "@/lib/db/tables"
import {
	SESSION_COOKIE,
	SESSION_TTL_SEC,
	signSession,
	verifySession,
	type SessionPayload,
} from "./token"
import { can, isRole, type Action, type Scope } from "./roles"

export type AuthUser = SessionPayload & { email: string }

const sessionSecret = () => requireEnvString("SESSION_SECRET", 32)

export async function createSession(p: SessionPayload) {
	const token = await signSession(p, sessionSecret())
	;(await cookies()).set(SESSION_COOKIE, token, {
		httpOnly: true, // JS erişemez (XSS ile çalınamaz)
		secure: isProd, // yalnızca HTTPS
		sameSite: "lax", // CSRF'e karşı
		path: "/",
		maxAge: SESSION_TTL_SEC,
	})
}

export async function destroySession() {
	;(await cookies()).set(SESSION_COOKIE, "", {
		httpOnly: true,
		secure: isProd,
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	})
}

/**
 * Oturumu çözer ve kullanıcıyı DB'den yeniden doğrular:
 * pasife alınan / silinen / rolü değişen kullanıcının oturumu anında geçersiz olur.
 */
export async function getUser(): Promise<AuthUser | null> {
	const token = (await cookies()).get(SESSION_COOKIE)?.value
	const s = await verifySession(token, sessionSecret())
	if (!s) return null
	const u = await users.get({ id: s.uid, isActive: 1 })
	if (!u || !isRole(u.role)) return null
	return { uid: u.id, role: u.role, name: String(u.full_name ?? ""), email: String(u.email ?? "") }
}

export async function requireUser(): Promise<AuthUser> {
	const u = await getUser()
	if (!u) redirect("/admin/login")
	return u
}

/** Server action / sayfa koruması: yetki yoksa istisna fırlatır. */
export async function requirePermission(scope: Scope, action: Action): Promise<AuthUser> {
	const u = await requireUser()
	if (!can(u.role, scope, action)) throw new ForbiddenError()
	return u
}

export class ForbiddenError extends Error {
	constructor() {
		super("Bu işlem için yetkiniz yok")
		this.name = "ForbiddenError"
	}
}

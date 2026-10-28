import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./roles";

/** Edge (middleware) + Node'da çalışır; env/server-only içermez. */
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-hs_session" : "hs_session";
export const SESSION_TTL_SEC = 60 * 60 * 8; // 8 saat

export type SessionPayload = { uid: number; role: Role; name: string };

const key = (secret: string) => new TextEncoder().encode(secret);

export async function signSession(p: SessionPayload, secret: string) {
  return new SignJWT({ role: p.role, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(p.uid))
    .setIssuedAt()
    .setIssuer("hs-insaat")
    .setAudience("hs-admin")
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(key(secret));
}

export async function verifySession(token: string | undefined, secret: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      algorithms: ["HS256"],
      issuer: "hs-insaat",
      audience: "hs-admin",
    });
    const uid = Number(payload.sub);
    if (!Number.isInteger(uid) || uid <= 0) return null;
    return { uid, role: payload.role as Role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}

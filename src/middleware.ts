import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/security/token";

/**
 * Tek giriş noktası güvenlik katmanı:
 *  1) Prod'da HTTPS zorunlu (301) + HSTS
 *  2) Nonce'lı sıkı CSP (inline script yok → XSS etkisiz)
 *  3) /admin/** için oturum ön kapısı (asıl yetki kontrolü sunucuda ayrıca yapılır)
 */
const isProd = process.env.NODE_ENV === "production";

function csp(nonce: string) {
  const script = isProd
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`;
  return [
    "default-src 'self'",
    script,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) HTTPS zorunlu (reverse proxy arkasında x-forwarded-proto)
  if (isProd && req.headers.get("x-forwarded-proto") === "http") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // 3) Admin ön kapısı
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicAdmin = pathname === "/admin/login" || pathname.startsWith("/admin/sifre-");
  if (isAdminArea && !isPublicAdmin) {
    const s = await verifySession(req.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET ?? "");
    if (!s) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // 2) CSP nonce
  const nonce = btoa(crypto.randomUUID());
  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp(nonce));

  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp(nonce));
  if (isAdminArea) {
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image|assets/|favicon.ico|robots.txt|sitemap.xml).*)" }],
};

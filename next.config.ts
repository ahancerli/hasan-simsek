import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // X-Powered-By sızıntısını kapat
  reactStrictMode: true,
  serverExternalPackages: ["sharp", "bcryptjs", "nodemailer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb", // admin görsel yükleme
      allowedOrigins: process.env.APP_URL ? [new URL(process.env.APP_URL).host] : undefined,
    },
  },
  images: {
    // Görseller /assets altından yerel servis edilir; uzak kaynak yok.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    // CSP (nonce'lı) middleware'de; burada nonce gerektirmeyen başlıklar.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;

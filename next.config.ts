import type { NextConfig } from "next";
import legacyRedirects from "./src/content/redirects.json";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Sunucu yazılımı başlıkta duyurulmaz
  poweredByHeader: false,

  // Eski WordPress sitesindeki gibi tüm adresler "/" ile biter (SEO için adresler değişmez)
  trailingSlash: true,

  // Eski kısa adresler, eski 301'ler, ekip/yazar sayfaları ve WordPress site haritaları kalıcı yönlendirilir
  async redirects() {
    return (legacyRedirects as { source: string; destination: string }[]).map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));
  },

  /* Turbopack Configuration */
  turbopack: {
    root: process.cwd(),
  },
  
  /* Image Optimization - 4K Support */
  images: {
    // 4K ve üzeri çözünürlük desteği
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640],
    // Görsel kalitesi - 100 (max) ve 75 (varsayılan)
    qualities: [100, 90, 75],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wawainteriors.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.wawainteriors.com",
        pathname: "/**",
      },
    ],
  },
  
  /* Security Headers */
  async headers() {
    const noindex = { key: "X-Robots-Tag", value: "noindex, nofollow" };
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // preload listesine başvurmadan önce tüm alt alan adlarının HTTPS'i desteklediği doğrulanmalı
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-eval' yalnızca geliştirmede gerekir (React hata ayıklama); canlıda kapalı.
              // challenges.cloudflare.com: formlardaki bot doğrulaması (Turnstile)
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Dış görseller: YouTube kapakları ve Vercel Blob
              "img-src 'self' data: blob: https://i.ytimg.com https://*.public.blob.vercel-storage.com https://wawainteriors.com https://www.wawainteriors.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
              // Panelden MP4 yükleme: tarayıcı dosyayı doğrudan Vercel Blob'a gönderir
              "connect-src 'self' https://vercel.com https://*.blob.vercel-storage.com",
              "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Yönetim paneli ve API arama motorlarında görünmez
      { source: "/yonetimpanel/:path*", headers: [noindex, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: [noindex] },
      // Yüklenen SVG'ler doğrudan açılırsa betik çalıştıramaz
      { source: "/wp-content/uploads/:path*.svg", headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" }] },
    ];
  },
};

export default nextConfig;

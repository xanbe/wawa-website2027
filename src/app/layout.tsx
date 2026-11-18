import type { Metadata } from "next";
// Yazı tipi projeyle birlikte paketlenir; derleme sırasında Google Fonts'a bağlı kalmaz
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource/vujahday-script/400.css";
import "@fontsource/michroma/400.css";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { OrganizationJsonLd, LocalBusinessJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://wawainteriors.com"),
  title: "WAWA Interiors | İç Mimarlık ve Fuar Standı — Anahtar Teslim",
  description:
    "WAWA Interiors; iç mimarlık ve fuar standı projelerinde tasarım, üretim ve kurulumu anahtar teslim yönetir. Teklif alın, projeyi başlatın.",
  keywords: [
    "iç mimar",
    "iç mimarlık",
    "fuar standı",
    "fuar stand tasarımı",
    "stand kurulum",
    "İstanbul iç mimar",
    "ofis tasarımı",
    "mağaza tasarımı",
    "interior design",
    "exhibition stand",
  ],
  authors: [{ name: "Wawa Design Studio" }],
  creator: "Wawa",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://wawainteriors.com/",
    siteName: "WAWA Interiors",
    title: "İç Mimarlık ve Fuar Standı — Anahtar Teslim | WAWA Interiors",
    description:
      "Tasarım, üretim, lojistik ve kurulum tek ekipte. İç mimarlık ve fuar standı projelerinde anahtar teslim hizmet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WAWA Interiors | Anahtar Teslim İç Mimarlık & Fuar Standı",
    description:
      "İç mimarlık ve fuar standı projelerinde tasarım + üretim + kurulum. Net takvim, şeffaf süreç.",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Optional: mirrors <meta http-equiv="content-language" content="tr" />
  other: {
    "content-language": "tr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="apple-touch-icon" href="/icons/icon-01.png" />
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
      </head>
      <body className="font-sans antialiased">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

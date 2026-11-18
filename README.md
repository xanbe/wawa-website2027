# WAWA - İç Mimarlık & Fuar Standı

WAWA Interiors web sitesi. Next.js 16, React 19, TypeScript ve Tailwind CSS ile geliştirilmiştir.

Eski WordPress sitesindeki tüm içerik (blog, projeler, hizmetler, sayfalar; TR/EN/DE) taşınmıştır. Adresler eski siteyle birebir aynıdır ve sonda `/` ile biter.

## Kurulum

```bash
npm install
npm run dev
```

Site [http://localhost:3000](http://localhost:3000) adresinde açılır. Ortam değişkenleri için `.env.example` dosyasına bakın.

## Proje yapısı

```
src/
├── app/
│   ├── page.tsx            # TR anasayfa
│   ├── [...slug]/page.tsx  # Eski sitedeki tüm diğer adresler (blog, projeler, hizmetler, sayfalar, EN/DE)
│   ├── butce-planlama/     # Tasarım bütçesi hesaplayıcı
│   ├── api/                # İletişim/teklif formu ve telefon doğrulaması
│   └── sitemap.ts          # Site haritası
├── content/                # Eski siteden taşınan içerik (JSON) ve yönlendirmeler
├── components/
│   ├── layout/             # Header, Footer, dil seçici, menü verisi
│   ├── sections/           # Anasayfa bölümleri
│   ├── templates/          # Blog, proje, hizmet, hakkımızda, iletişim şablonları
│   ├── seo/                # JSON-LD
│   └── ui/                 # Button, Sheet
└── lib/
    ├── content.ts          # İçerik erişimi
    ├── routes.ts           # Adres → şablon eşlemesi
    ├── i18n.ts             # Dil adresleri ve arayüz metinleri
    ├── fee.ts              # Bütçe hesabı
    └── phone-otp.ts        # Telefon doğrulaması
public/
├── wp-content/uploads/     # Eski siteden taşınan görseller (adresleri aynı)
└── images/                 # Yeni tasarımın görselleri
```

## İçerik ve adresler

- İçerik `src/content/*.json` dosyalarındadır. Yeni bir yazı ya da proje bu dosyalara eklenir.
- Eski kısa adresler ve WordPress'e özgü sayfalar `src/content/redirects.json` ile kalıcı olarak yönlendirilir.
- Liste sayfaları eski sitedeki gibi sayfa başına 9 kayıt gösterir; `page/N/` adresleri korunur.

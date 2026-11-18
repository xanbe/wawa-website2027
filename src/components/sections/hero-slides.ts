export interface HeroSlide {
  sector: string;
  project: string;
  image: string;
  alt: string;
  href: string;
}

// Her slayt bir sektör. Görseller public/images/hero altında.
// Yatay (16:9) ve en az 1920px genişliğinde görseller en iyi sonucu verir.
export const heroSlides: HeroSlide[] = [
  {
    sector: "Klinik",
    project: "Halide Akıncı Klinik",
    image: "/images/hero/halide-akinci-klinik.webp",
    alt: "Halide Akıncı klinik bekleme alanı ve resepsiyon tasarımı",
    href: "/portfolio/halide-akinci-klinik-tasarim/",
  },
  {
    sector: "Villa",
    project: "Acarkent Villa",
    image: "/images/hero/acarkent-villa.webp",
    alt: "Acarkent villa dış cephe ve havuz tasarımı",
    href: "/portfolio/acarkent-villa-tasarimi/",
  },
  {
    sector: "Muayene",
    project: "Fulya Klinik",
    image: "/images/hero/fulya-klinik.webp",
    alt: "Fulya klinik muayene odası tasarımı",
    href: "/portfolio/fulya-klinik-tasarim/",
  },
  {
    sector: "Konut",
    project: "Caddebostan Konut",
    image: "/images/hero/caddebostan-konut.webp",
    alt: "Caddebostan konut projesi salon ve mutfak tasarımı",
    href: "/portfolio/caddebostan-konut-projesi/",
  },
  {
    sector: "Mağaza",
    project: "Instreet · İstanbul Havalimanı",
    image: "/images/hero/instreet-havalimani.webp",
    alt: "Instreet İstanbul Havalimanı mağaza tasarımı",
    href: "/service/magaza-tasarimi/",
  },
];

export const heroRegions = ["Avrupa", "Amerika", "Birleşik Krallık", "Ortadoğu"];

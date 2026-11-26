// Türkçe anasayfanın içerikleri (slaytlar, seçilmiş projeler, markalar, basın, yorumlar, SSS, süreç) home.json'da durur.
// Yönetim paneli bu dosyayı düzenleyip commit eder; bileşenler veriyi buradan HOME olarak okur.
import data from "./home.json";

export interface HomeSlide {
  sector: string;
  project: string;
  image: string;
  alt: string;
  href: string;
}

// filter: anasayfadaki proje sekmesi (Konut & Villa / Ticari Mekânlar / Fuar Standı)
export interface HomeFeatured {
  path: string;
  title: string;
  location: string | null;
  image: string;
  category: string;
  filter: "residential" | "commercial" | "stand";
}

export interface HomeBrand {
  name: string;
  src: string;
}

export interface HomePress {
  source: string;
  date: string;
  title: string;
  href: string;
  logo: { src: string; w: number; h: number; cls: string };
}

export interface HomeReview {
  author: string;
  /** Örn. "8 ay önce" */
  when: string;
  /** Yorumun metni, Google'daki hâliyle */
  text: string;
}

export interface HomeFaq {
  q: string;
  a: string;
}

export interface HomeStep {
  title: string;
  text: string;
  points: string[];
  image: string;
  position: string;
  alt: string;
}

export interface HomeContent {
  slides: HomeSlide[];
  featured: HomeFeatured[];
  brands: HomeBrand[];
  press: HomePress[];
  reviews: { rating: number; count: number; url: string; items: HomeReview[] };
  faq: HomeFaq[];
  process: HomeStep[];
}

export const HOME = data as HomeContent;

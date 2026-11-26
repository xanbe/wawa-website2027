// Ek hizmet sayfaları: İnşaat Taahhüt ve Mobilya Üretim (key construction / furniture), sektörel iç mimari
// sayfaları (key sector) ve fuar standı grubuna eklenen sayfalar (key stand); Türkçe, İngilizce ve Almanca.
// Metinler eski sitedeki ifadelere dayanır: kendi mobilya atölyesi, inşaat ve müteahhitlik hizmeti,
// ruhsat hariç anahtar teslim yönetim. Sayı ve iddia uydurulmaz.
// Tüm sayfalar extra-pages.json içinde tek listede durur; yönetim paneli bu dosyayı düzenleyip commit eder.
// sector-pages.ts ve stand-pages.ts aynı listeyi key alanına göre süzer.
import type { Lang } from "@/lib/i18n";
import data from "./extra-pages.json";

export type ExtraPage = {
  key: "construction" | "furniture" | "sector" | "stand";
  path: string;
  lang: Lang;
  title: string;
  lead: string;
  image: string;
  sections: { h: string; p: string }[];
  points: string[];
  projectCategories?: string[]; // TR proje kategori adresleri (ilgili projeler için)
  projectPaths?: string[]; // doğrudan ilgili projeler
  faq?: { q: string; a: string }[];
  seo: { title: string; description: string };
  group?: string; // sektör ve stand sayfalarında dil sürümlerini bağlayan anahtar: Türkçe sayfanın adresi
};

// JSON'daki tüm sayfalar (sıra: construction/furniture, sektör sayfaları, stand sayfaları)
const ALL = data as ExtraPage[];

const ALT = {
  construction: { tr: "/insaat-taahhut/", en: "/en/construction-contracting/", de: "/de/bauausfuehrung/" },
  furniture: { tr: "/mobilya-uretim/", en: "/en/furniture-production/", de: "/de/moebelproduktion/" },
} as const;

export const extraAlternates = (page: ExtraPage): Partial<Record<Lang, string>> => {
  if (page.key !== "sector" && page.key !== "stand") return { ...ALT[page.key] };
  const group = page.group ?? page.path;
  const out: Partial<Record<Lang, string>> = {};
  for (const x of ALL) if ((x.key === "sector" || x.key === "stand") && (x.group ?? x.path) === group) out[x.lang] = x.path;
  if (out.en) {
    out.it = out.en;
    out.fr = out.en;
  }
  return out;
};

export const extraPages: ExtraPage[] = ALL.filter((p) => p.key === "construction" || p.key === "furniture");

export const getExtraPage = (path: string) => extraPages.find((p) => p.path === path);

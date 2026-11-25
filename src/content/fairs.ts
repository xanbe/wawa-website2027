// Yaklaşan fuarlar (wawa fuar sitesindeki listeden). Tarihler kesin değildir; sayfalarda "tarihler kesin değil" notuyla
// gösterilir. Geçmiş fuarlar takvimden otomatik gizlenir. Her fuarın /fuar-takvimi/<slug>/ adresinde kendi sayfası vardır.
export type FairRegion = "tr" | "eu" | "me";
export type Fair = { slug: string; name: string; city: string; country: string; venue?: string; region: FairRegion; start: string; end: string; sector: string; match: string[] };

export const FAIRS = [
  { slug: "big-5-global", name: "Big 5 Global", city: "Dubai", country: "BAE", venue: "Dubai World Trade Centre", region: "me", start: "2026-11-23", end: "2026-11-26", sector: "İnşaat ve yapı", match: ["big 5"] },
  { slug: "plast-eurasia", name: "Plast Eurasia", city: "İstanbul", country: "Türkiye", venue: "Tüyap Fuar ve Kongre Merkezi", region: "tr", start: "2026-12-02", end: "2026-12-05", sector: "Plastik", match: ["plast eurasia"] },
  { slug: "gulfood", name: "Gulfood", city: "Dubai", country: "BAE", region: "me", start: "2027-02-15", end: "2027-02-19", sector: "Gıda ve içecek", match: ["gulfood"] },
  { slug: "ish", name: "ISH", city: "Frankfurt", country: "Almanya", venue: "Messe Frankfurt", region: "eu", start: "2027-03-15", end: "2027-03-19", sector: "Tesisat, ısıtma ve iklimlendirme", match: ["ish"] },
  { slug: "win-eurasia", name: "WIN Eurasia", city: "İstanbul", country: "Türkiye", venue: "Tüyap Fuar ve Kongre Merkezi", region: "tr", start: "2027-03-24", end: "2027-03-27", sector: "Endüstri ve otomasyon", match: ["win eurasia"] },
  { slug: "salone-del-mobile", name: "Salone del Mobile", city: "Milano", country: "İtalya", venue: "Fiera Milano Rho", region: "eu", start: "2027-04-13", end: "2027-04-18", sector: "Mobilya ve tasarım", match: ["salone del mobile"] },
  { slug: "solarex", name: "Solarex", city: "İstanbul", country: "Türkiye", venue: "İstanbul Fuar Merkezi", region: "tr", start: "2027-04-22", end: "2027-04-24", sector: "Güneş enerjisi", match: ["solarex"] },
  { slug: "interzum", name: "Interzum", city: "Köln", country: "Almanya", venue: "Koelnmesse", region: "eu", start: "2027-05-18", end: "2027-05-21", sector: "Mobilya üretimi ve iç donanım", match: ["interzum"] },
] as const satisfies readonly Fair[];

export const getFair = (slug: string): Fair | undefined => (FAIRS as readonly Fair[]).find((f) => f.slug === slug);

export const fairPath = (slug: string) => `/fuar-takvimi/${slug}/`;
export const FAIRS_PATH = "/fuar-takvimi/";

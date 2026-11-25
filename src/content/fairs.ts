import data from "./fairs.json";

// Fuar listesi (Türkiye, Avrupa, İngiltere, Orta Doğu, Amerika). Veri fairs.json dosyasındadır; tarihler organizatörlerin
// resmî sayfalarından alınmıştır (verified: false olanlar yalnızca fuar takvim sitelerinde görülebilmiştir).
// Geçmiş fuarlar listelerde tarayıcıda gizlenir. Her fuarın /fuar-takvimi/<slug>/ adresinde kendi sayfası vardır.
export type FairRegion = "tr" | "eu" | "uk" | "me" | "am";
export type Fair = {
  slug: string;
  name: string;
  city: string;
  country: string;
  venue?: string;
  region: FairRegion;
  start: string;
  end: string;
  sector: string;
  url?: string;
  verified?: boolean;
  match: string[];
};

export const REGION_LABEL: Record<FairRegion, string> = { tr: "Türkiye", eu: "Avrupa", uk: "İngiltere", me: "Orta Doğu", am: "Amerika" };
export const REGIONS = Object.keys(REGION_LABEL) as FairRegion[];

export const FAIRS: Fair[] = [...(data as Fair[])].sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name, "tr"));

export const getFair = (slug: string): Fair | undefined => FAIRS.find((f) => f.slug === slug);

// Listeler ve seçim kutuları için hafif kopya (sayfa içine gömülen veri küçük kalsın)
export type FairLite = Pick<Fair, "slug" | "name" | "city" | "country" | "region" | "start" | "end" | "sector">;
export const FAIRS_LITE: FairLite[] = FAIRS.map(({ slug, name, city, country, region, start, end, sector }) => ({ slug, name, city, country, region, start, end, sector }));

// Fuar seçim kutuları için tekrarsız "Ad · Şehir" listesi (aynı fuarın iki baskısı tek satır)
export const FAIR_OPTIONS: string[] = [...new Set(FAIRS.map((f) => `${f.name} · ${f.city}`))];

export const fairPath = (slug: string) => `/fuar-takvimi/${slug}/`;
export const FAIRS_PATH = "/fuar-takvimi/";

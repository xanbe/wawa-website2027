import data from "./fairs.json";
import { sectorGroup, type Fair, type FairLite } from "./fair-meta";

// Ortak türler ve etiketler fair-meta.ts içindedir
export * from "./fair-meta";

// Fuar listesi (Türkiye, Avrupa, İngiltere, Orta Doğu, Amerika). Veri fairs.json dosyasındadır; tarihler organizatörlerin
// resmî sayfalarından alınmıştır (verified: false olanlar yalnızca fuar takvim sitelerinde görülebilmiştir).
// Geçmiş fuarlar listelerde tarayıcıda gizlenir. Her fuarın /fuar-takvimi/<slug>/ adresinde kendi sayfası vardır.
export const FAIRS: Fair[] = [...(data as Fair[])].sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name, "tr"));

export const getFair = (slug: string): Fair | undefined => FAIRS.find((f) => f.slug === slug);

// Listeler ve seçim kutuları için hafif kopya (sayfa içine gömülen veri küçük kalsın)
export const FAIRS_LITE: FairLite[] = FAIRS.map(({ slug, name, city, country, region, start, end, sector }) => ({ slug, name, city, country, region, start, end, sector, group: sectorGroup({ sector, name }) }));

export const fairPath = (slug: string) => `/fuar-takvimi/${slug}/`;
export const FAIRS_PATH = "/fuar-takvimi/";

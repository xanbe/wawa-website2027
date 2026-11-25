// Fuar takvimi ve fiyat rehberlerinin dillere göre adresleri ve fuar verisinin çevirileri.
// Fuar verisi (fairs.json) Türkçedir: şehir ve ülke adları burada çevrilir, serbest sektör metni yerine
// diğer dillerde sektör grubunun adı gösterilir. IT ve FR, hizmet sayfalarında olduğu gibi İngilizce sayfalara bağlanır.
import type { Lang } from "@/lib/i18n";
import { FAIRS } from "./fairs";
import { SECTOR_LABELS, pageLang, sectorGroup, type Fair, type FairLite, type FairPick, type PageLang } from "./fair-meta";

export * from "./fair-meta";

// [İngilizce, Almanca]
const COUNTRY: Record<string, [string, string]> = {
  ABD: ["United States", "USA"],
  Almanya: ["Germany", "Deutschland"],
  Arjantin: ["Argentina", "Argentinien"],
  Avusturya: ["Austria", "Österreich"],
  BAE: ["UAE", "VAE"],
  Bahreyn: ["Bahrain", "Bahrain"],
  Belçika: ["Belgium", "Belgien"],
  "Bosna-Hersek": ["Bosnia and Herzegovina", "Bosnien und Herzegowina"],
  Brezilya: ["Brazil", "Brasilien"],
  Bulgaristan: ["Bulgaria", "Bulgarien"],
  Cezayir: ["Algeria", "Algerien"],
  Danimarka: ["Denmark", "Dänemark"],
  Finlandiya: ["Finland", "Finnland"],
  Fransa: ["France", "Frankreich"],
  Hollanda: ["Netherlands", "Niederlande"],
  Irak: ["Iraq", "Irak"],
  Kanada: ["Canada", "Kanada"],
  Katar: ["Qatar", "Katar"],
  Kolombiya: ["Colombia", "Kolumbien"],
  Kuveyt: ["Kuwait", "Kuwait"],
  Lübnan: ["Lebanon", "Libanon"],
  Macaristan: ["Hungary", "Ungarn"],
  Meksika: ["Mexico", "Mexiko"],
  Mısır: ["Egypt", "Ägypten"],
  Norveç: ["Norway", "Norwegen"],
  Peru: ["Peru", "Peru"],
  Polonya: ["Poland", "Polen"],
  Portekiz: ["Portugal", "Portugal"],
  Romanya: ["Romania", "Rumänien"],
  Rusya: ["Russia", "Russland"],
  Slovakya: ["Slovakia", "Slowakei"],
  Slovenya: ["Slovenia", "Slowenien"],
  Suriye: ["Syria", "Syrien"],
  "Suudi Arabistan": ["Saudi Arabia", "Saudi-Arabien"],
  Sırbistan: ["Serbia", "Serbien"],
  Türkiye: ["Türkiye", "Türkei"],
  Umman: ["Oman", "Oman"],
  Yunanistan: ["Greece", "Griechenland"],
  Çekya: ["Czechia", "Tschechien"],
  Ürdün: ["Jordan", "Jordanien"],
  İngiltere: ["United Kingdom", "Großbritannien"],
  İran: ["Iran", "Iran"],
  İspanya: ["Spain", "Spanien"],
  İsveç: ["Sweden", "Schweden"],
  İsviçre: ["Switzerland", "Schweiz"],
  İtalya: ["Italy", "Italien"],
  Şili: ["Chile", "Chile"],
};

// Türkçe yazılışı farklı olan şehirler [İngilizce, Almanca]; listede olmayanlar olduğu gibi kalır
const CITY: Record<string, [string, string]> = {
  "Abu Dabi": ["Abu Dhabi", "Abu Dhabi"],
  Anvers: ["Antwerp", "Antwerpen"],
  Atina: ["Athens", "Athen"],
  Barselona: ["Barcelona", "Barcelona"],
  Bağdat: ["Baghdad", "Bagdad"],
  Belgrad: ["Belgrade", "Belgrad"],
  Beyrut: ["Beirut", "Beirut"],
  Brüksel: ["Brussels", "Brüssel"],
  Budapeşte: ["Budapest", "Budapest"],
  Bükreş: ["Bucharest", "Bukarest"],
  Cenevre: ["Geneva", "Genf"],
  Cezayir: ["Algiers", "Algier"],
  Cidde: ["Jeddah", "Dschidda"],
  "El Ayn": ["Al Ain", "Al Ain"],
  Floransa: ["Florence", "Florenz"],
  Gdansk: ["Gdańsk", "Danzig"],
  Göteborg: ["Gothenburg", "Göteborg"],
  Kahire: ["Cairo", "Kairo"],
  Kopenhag: ["Copenhagen", "Kopenhagen"],
  Kuveyt: ["Kuwait City", "Kuwait-Stadt"],
  Köln: ["Cologne", "Köln"],
  Lizbon: ["Lisbon", "Lissabon"],
  Lodz: ["Łódź", "Łódź"],
  Londra: ["London", "London"],
  Maskat: ["Muscat", "Maskat"],
  Meksiko: ["Mexico City", "Mexiko-Stadt"],
  Milano: ["Milan", "Mailand"],
  Moskova: ["Moscow", "Moskau"],
  Münih: ["Munich", "München"],
  Nürnberg: ["Nuremberg", "Nürnberg"],
  Poznan: ["Poznań", "Posen"],
  Prag: ["Prague", "Prag"],
  Riyad: ["Riyadh", "Riad"],
  Selanik: ["Thessaloniki", "Thessaloniki"],
  Sofya: ["Sofia", "Sofia"],
  Stokholm: ["Stockholm", "Stockholm"],
  Tahran: ["Tehran", "Teheran"],
  Varşova: ["Warsaw", "Warschau"],
  Viyana: ["Vienna", "Wien"],
  Şam: ["Damascus", "Damaskus"],
  Şarika: ["Sharjah", "Schardscha"],
  Şikago: ["Chicago", "Chicago"],
  İstanbul: ["Istanbul", "Istanbul"],
  İzmir: ["Izmir", "Izmir"],
};

const pick = (map: Record<string, [string, string]>, v: string, lang: PageLang) => (lang === "tr" ? v : (map[v]?.[lang === "en" ? 0 : 1] ?? v));
export const cityL = (city: string, lang: PageLang) => pick(CITY, city, lang);
export const countryL = (country: string, lang: PageLang) => pick(COUNTRY, country, lang);
export const sectorL = (f: Pick<Fair, "sector" | "name">, lang: PageLang) => (lang === "tr" ? f.sector : SECTOR_LABELS[lang][sectorGroup(f)]);

// Takvim listesi için dile göre hafif kopya
export function fairsLite(lang: Lang): FairLite[] {
  const l = pageLang(lang);
  return FAIRS.map((f) => ({
    slug: f.slug,
    name: f.name,
    city: cityL(f.city, l),
    country: countryL(f.country, l),
    region: f.region,
    start: f.start,
    end: f.end,
    sector: sectorL(f, l),
    group: sectorGroup(f),
  }));
}

// Teklif formlarındaki fuar seçimi için dile göre liste
export function fairPicks(lang: Lang): FairPick[] {
  const l = pageLang(lang);
  const seen = new Set<string>();
  const out: FairPick[] = [];
  for (const f of FAIRS) {
    const v = `${f.name} · ${cityL(f.city, l)}`;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push({ v, c: `${cityL(f.city, l)}, ${countryL(f.country, l)}`, d: f.start, s: sectorL(f, l), r: f.region });
  }
  return out;
}

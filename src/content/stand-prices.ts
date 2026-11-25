// Fuar standı fiyat aralıkları (€/m², KDV hariç). Teklif formu, yapay zeka stüdyosu, fiyat rehberi ve fuar sayfaları
// bu tek kaynağı kullanır. Aralıklar WAWA'nın kendi rakamlarıdır (Kasım 2026).

export type StandSystem = "ahsap" | "maxima";
export type PriceRegion = "tr" | "abroad";

export const PRICE_YEAR = 2026;

// [en düşük, en yüksek] €/m²
export const STAND_PRICES: Record<StandSystem, Record<PriceRegion, [number, number]>> = {
  ahsap: { tr: [200, 500], abroad: [400, 750] },
  maxima: { tr: [80, 200], abroad: [150, 300] },
};

export const SYSTEM_LABEL: Record<StandSystem, string> = {
  ahsap: "Ahşap (özel tasarım)",
  maxima: "Maxima (modüler)",
};

const round100 = (n: number) => Math.round(n / 100) * 100;

// m² aralığı ya da tek m² için bütçe aralığı (€, KDV hariç, yüze yuvarlanmış)
export function estimate(system: StandSystem, region: PriceRegion, minArea: number, maxArea = minArea): [number, number] | null {
  if (!(minArea > 0) || !(maxArea >= minArea)) return null;
  const [lo, hi] = STAND_PRICES[system][region];
  return [round100(minArea * lo), round100(maxArea * hi)];
}

export const euro = (n: number) => `€${n.toLocaleString("tr-TR")}`;
export const euroRange = ([a, b]: [number, number]) => `${euro(a)} – ${euro(b)}`;

// Bütçeyi etkileyen başlıca kalemler (fiyat rehberi ve fuar sayfalarında)
export const PRICE_FACTORS = [
  { title: "Metrekare ve stand tipi", text: "Sıra, köşe, yarımada ya da ada; açık cephe sayısı arttıkça işçilik ve malzeme artar." },
  { title: "Sistem ve malzeme", text: "Atölyede sıfırdan üretilen ahşap stand ile tekrar kullanılan Maxima modüler sistem arasında belirgin fark vardır." },
  { title: "Teknoloji ve aydınlatma", text: "LED ekran, özel aydınlatma ve etkileşimli üniteler bütçeyi artırır." },
  { title: "Lojistik ve kurulum", text: "Yurt dışı fuarlarda nakliye, ekip konaklaması ve kurulum süresi önemli bir kalemdir." },
  { title: "Takvim", text: "Fuara az süre kala verilen siparişlerde üretim fazla mesaiyle yürür." },
];

// Diğer diller (İngilizce, Almanca); IT ve FR İngilizce sayfaları kullanır
export type PriceLang = "tr" | "en" | "de";
export const SYSTEM_LABELS: Record<PriceLang, Record<StandSystem, string>> = {
  tr: SYSTEM_LABEL,
  en: { ahsap: "Timber (custom design)", maxima: "Maxima (modular)" },
  de: { ahsap: "Holz (individuelles Design)", maxima: "Maxima (modular)" },
};
const EURO_LOCALE: Record<PriceLang, string> = { tr: "tr-TR", en: "en-GB", de: "de-DE" };
export const euroL = (n: number, lang: PriceLang) => (lang === "de" ? `${n.toLocaleString("de-DE")} €` : `€${n.toLocaleString(EURO_LOCALE[lang])}`);
export const euroRangeL = ([a, b]: [number, number], lang: PriceLang) => `${euroL(a, lang)} – ${euroL(b, lang)}`;
export const PRICE_FACTORS_L: Record<PriceLang, { title: string; text: string }[]> = {
  tr: PRICE_FACTORS,
  en: [
    { title: "Area and stand type", text: "Row, corner, peninsula or island; the more open sides, the more labour and material." },
    { title: "System and materials", text: "A timber stand built from scratch in our workshop and the reusable Maxima modular system differ clearly in cost." },
    { title: "Technology and lighting", text: "LED walls, custom lighting and interactive units raise the budget." },
    { title: "Logistics and installation", text: "For fairs abroad, shipping, crew accommodation and build-up time are a major item." },
    { title: "Timing", text: "Orders placed close to the fair need overtime in production." },
  ],
  de: [
    { title: "Fläche und Standtyp", text: "Reihen-, Eck-, Kopf- oder Inselstand: Je mehr offene Seiten, desto mehr Arbeit und Material." },
    { title: "System und Material", text: "Ein in unserer Werkstatt gefertigter Holzstand und das wiederverwendbare Maxima-System unterscheiden sich deutlich im Preis." },
    { title: "Technik und Beleuchtung", text: "LED-Wände, individuelle Beleuchtung und interaktive Elemente erhöhen das Budget." },
    { title: "Logistik und Aufbau", text: "Bei Messen im Ausland sind Transport, Unterkunft des Teams und Aufbauzeit ein wichtiger Posten." },
    { title: "Zeitplan", text: "Kurzfristige Aufträge erfordern Überstunden in der Fertigung." },
  ],
};

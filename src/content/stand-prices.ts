// Fuar standı fiyat aralıkları (€/m², KDV hariç). Teklif formu, yapay zeka stüdyosu, fiyat rehberi ve fuar sayfaları
// bu tek kaynağı kullanır. Aralıklar WAWA'nın kendi rakamlarıdır (Kasım 2026).
// Rakamlar, sistem adları ve bütçe kalemleri stand-prices.json içinde; yönetim paneli bu dosyayı düzenleyip commit eder.
import data from "./stand-prices.json";

export type StandSystem = "ahsap" | "maxima";
export type PriceRegion = "tr" | "abroad";
// Diğer diller (İngilizce, Almanca); IT ve FR İngilizce sayfaları kullanır
export type PriceLang = "tr" | "en" | "de";

const D = data as {
  year: number;
  ranges: Record<StandSystem, Record<PriceRegion, [number, number]>>;
  systemLabels: Record<PriceLang, Record<StandSystem, string>>;
  factors: Record<PriceLang, { title: string; text: string }[]>;
};

export const PRICE_YEAR: number = D.year;

// [en düşük, en yüksek] €/m²
export const STAND_PRICES: Record<StandSystem, Record<PriceRegion, [number, number]>> = D.ranges;

export const SYSTEM_LABEL: Record<StandSystem, string> = D.systemLabels.tr;

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
export const PRICE_FACTORS: { title: string; text: string }[] = D.factors.tr;

export const SYSTEM_LABELS: Record<PriceLang, Record<StandSystem, string>> = D.systemLabels;
const EURO_LOCALE: Record<PriceLang, string> = { tr: "tr-TR", en: "en-GB", de: "de-DE" };
export const euroL = (n: number, lang: PriceLang) => (lang === "de" ? `${n.toLocaleString("de-DE")} €` : `€${n.toLocaleString(EURO_LOCALE[lang])}`);
export const euroRangeL = ([a, b]: [number, number], lang: PriceLang) => `${euroL(a, lang)} – ${euroL(b, lang)}`;
export const PRICE_FACTORS_L: Record<PriceLang, { title: string; text: string }[]> = D.factors;

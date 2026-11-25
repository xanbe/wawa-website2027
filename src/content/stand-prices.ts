// Fuar standı fiyat aralıkları (€/m², KDV hariç). Teklif formu, yapay zeka stüdyosu, fiyat rehberi ve fuar sayfaları
// bu tek kaynağı kullanır. Şimdilik 2026 piyasa aralıkları kullanılıyor; WAWA'nın kendi rakamları gelince yalnızca
// buradaki sayılar güncellenir.

export type StandSystem = "ahsap" | "maxima" | "kongre";
export type PriceRegion = "tr" | "abroad";

export const PRICE_YEAR = 2026;

// [en düşük, en yüksek] €/m²
export const STAND_PRICES: Record<StandSystem, Record<PriceRegion, [number, number]>> = {
  ahsap: { tr: [150, 400], abroad: [300, 500] },
  maxima: { tr: [100, 150], abroad: [100, 150] },
  kongre: { tr: [400, 550], abroad: [400, 550] },
};

export const SYSTEM_LABEL: Record<StandSystem, string> = {
  ahsap: "Ahşap (özel tasarım)",
  maxima: "Maxima (modüler)",
  kongre: "Kongre standı",
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

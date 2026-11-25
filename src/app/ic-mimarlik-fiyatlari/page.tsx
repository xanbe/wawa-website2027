import { InteriorPricesPage, interiorPricesMetadata } from "@/components/templates/InteriorPricesPage";

export const metadata = interiorPricesMetadata("tr");

// İç mimarlık fiyat rehberi: bütçenin yapısı, fiyatı belirleyen kalemler, teklif öncesi hazırlık

export default function Page() {
  return <InteriorPricesPage lang="tr" />;
}

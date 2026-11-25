import { StandPricesPage, standPricesMetadata } from "@/components/templates/StandPricesPage";

export const metadata = standPricesMetadata("tr");

// Fuar standı fiyat rehberi: aralık tablosu, hızlı hesap, örnek bütçeler, fiyatı etkileyen kalemler
export default function Page() {
  return <StandPricesPage lang="tr" />;
}

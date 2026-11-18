import type { Metadata } from "next";
import { FeeCalculator } from "@/components/sections/FeeCalculator";

export const metadata: Metadata = {
  title: "Bütçe Planlama | WAWA Interiors",
  description: "Mekânınızın türüne ve alanına göre iç mimari tasarım bütçenizi önceden planlayın.",
};

// Anasayfadaki bütçe adımları ?tur=…&alan=… ile gelir; hesaplayıcı bu değerlerle dolu açılır
export default async function BudgetPlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ tur?: string | string[]; alan?: string | string[] }>;
}) {
  const { tur, alan } = await searchParams;
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  return <FeeCalculator initialType={first(tur)} initialArea={first(alan)} />;
}

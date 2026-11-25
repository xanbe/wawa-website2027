import { StandPricesPage, standPricesMetadata } from "@/components/templates/StandPricesPage";

export const metadata = standPricesMetadata("de");

export default function Page() {
  return <StandPricesPage lang="de" />;
}

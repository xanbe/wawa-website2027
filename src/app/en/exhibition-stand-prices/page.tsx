import { StandPricesPage, standPricesMetadata } from "@/components/templates/StandPricesPage";

export const metadata = standPricesMetadata("en");

export default function Page() {
  return <StandPricesPage lang="en" />;
}

import { InteriorPricesPage, interiorPricesMetadata } from "@/components/templates/InteriorPricesPage";

export const metadata = interiorPricesMetadata("en");

export default function Page() {
  return <InteriorPricesPage lang="en" />;
}

import { InteriorPricesPage, interiorPricesMetadata } from "@/components/templates/InteriorPricesPage";

export const metadata = interiorPricesMetadata("de");

export default function Page() {
  return <InteriorPricesPage lang="de" />;
}

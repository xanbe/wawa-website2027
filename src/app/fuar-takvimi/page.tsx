import { FairCalendarPage, fairCalendarMetadata } from "@/components/templates/FairCalendarPage";

export const metadata = fairCalendarMetadata("tr");

// Fuar takvimi: bölge, sektör ve arama ile süzülür; her satır fuarın kendi sayfasına gider
export default function Page() {
  return <FairCalendarPage lang="tr" />;
}

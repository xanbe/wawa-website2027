import { FairCalendarPage, fairCalendarMetadata } from "@/components/templates/FairCalendarPage";

export const metadata = fairCalendarMetadata("de");

export default function Page() {
  return <FairCalendarPage lang="de" />;
}

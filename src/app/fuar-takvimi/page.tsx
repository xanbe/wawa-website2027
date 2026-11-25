import type { Metadata } from "next";
import { FAIRS_LITE, FAIRS_PATH } from "@/content/fairs";
import { PageIntro } from "@/components/templates/parts";
import { FairCalendar } from "@/components/templates/FairCalendar";

export const metadata: Metadata = {
  title: { absolute: "Fuar Takvimi 2027 | Türkiye, Avrupa, Orta Doğu ve Amerika | WAWA Interiors" },
  description: `Türkiye, Avrupa, İngiltere, Orta Doğu ve Amerika'da ${FAIRS_LITE.length} fuar: tarihler, şehirler, sektörler. Fuarınızı seçin, stand bütçesini ve kurduğumuz standları görün.`,
  alternates: { canonical: FAIRS_PATH },
};

// Fuar takvimi: bölge, ay ve arama ile süzülür; her satır fuarın kendi sayfasına gider
export default function FairCalendarPage() {
  return (
    <>
      <PageIntro lang="tr" title="Fuar takvimi" lead="Türkiye, Avrupa, İngiltere, Orta Doğu ve Amerika'daki fuarlar. Fuara basın; tarihleri, bütçeyi ve o fuardaki işlerimizi görün." />
      <section className="bg-white" lang="tr">
        <div className="container-wide pb-16">
          <FairCalendar fairs={FAIRS_LITE} />
          <p className="mt-8 text-[12px] tracking-[0.1em] text-wawa-charcoal/45 uppercase">Tarihler organizatörlerin duyurularından alınmıştır; katılım öncesinde fuarın resmî sitesinden doğrulayın.</p>
        </div>
      </section>
    </>
  );
}

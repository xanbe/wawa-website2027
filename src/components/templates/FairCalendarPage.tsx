// Fuar takvimi sayfası (her dilde ortak): başlık, açıklama ve süzülebilir liste
import type { Metadata } from "next";
import { CALENDAR_PATH, fairsLite, type PageLang } from "@/content/fairs-i18n";
import { PageIntro } from "@/components/templates/parts";
import { SetAlternates } from "@/components/layout/alternates";
import { switchTargets } from "@/content/fair-meta";
import { FairCalendar } from "@/components/templates/FairCalendar";

const T = {
  tr: {
    title: "Fuar takvimi",
    lead: "Türkiye, Avrupa, İngiltere, Orta Doğu ve Amerika'daki fuarlar. Fuara basın; tarihleri, bütçeyi ve o fuardaki işlerimizi görün.",
    note: "Tarihler organizatörlerin duyurularından alınmıştır; katılım öncesinde fuarın resmî sitesinden doğrulayın.",
    metaTitle: "Fuar Takvimi 2027 | Türkiye, Avrupa, Orta Doğu ve Amerika | WAWA Interiors",
    metaDesc: (n: number) => `Türkiye, Avrupa, İngiltere, Orta Doğu ve Amerika'da ${n} fuar: tarihler, şehirler, sektörler. Fuarınızı seçin, stand bütçesini ve kurduğumuz standları görün.`,
  },
  en: {
    title: "Trade fair calendar",
    lead: "Trade fairs in Türkiye, Europe, the UK, the Middle East and the Americas. Open a fair to see its dates, a stand budget and our work there.",
    note: "Dates are taken from the organisers' announcements; please confirm on the fair's official site before you plan.",
    metaTitle: "Trade Fair Calendar 2027 | Europe, Middle East, Americas, Türkiye | WAWA Interiors",
    metaDesc: (n: number) => `${n} trade fairs in Türkiye, Europe, the UK, the Middle East and the Americas: dates, cities and sectors. Pick your fair to see a stand budget and our stands.`,
  },
  de: {
    title: "Messekalender",
    lead: "Messen in der Türkei, Europa, Großbritannien, dem Nahen Osten und Amerika. Messe öffnen: Termine, Standbudget und unsere Projekte dort.",
    note: "Termine laut Veranstalter; bitte vor der Planung auf der offiziellen Messe-Website prüfen.",
    metaTitle: "Messekalender 2027 | Europa, Naher Osten, Amerika, Türkei | WAWA Interiors",
    metaDesc: (n: number) => `${n} Messen in der Türkei, Europa, Großbritannien, dem Nahen Osten und Amerika: Termine, Städte und Branchen. Messe wählen, Standbudget und unsere Stände ansehen.`,
  },
};

export function fairCalendarMetadata(lang: PageLang): Metadata {
  const t = T[lang];
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDesc(fairsLite(lang).length),
    alternates: { canonical: CALENDAR_PATH[lang], languages: { tr: CALENDAR_PATH.tr, en: CALENDAR_PATH.en, de: CALENDAR_PATH.de } },
  };
}

export function FairCalendarPage({ lang }: { lang: PageLang }) {
  const t = T[lang];
  return (
    <>
      <SetAlternates lang={lang} alternates={switchTargets(CALENDAR_PATH)} />
      <PageIntro lang={lang} title={t.title} lead={t.lead} />
      <section className="bg-white" lang={lang}>
        <div className="container-wide pb-16">
          <FairCalendar fairs={fairsLite(lang)} lang={lang} />
          <p className="mt-8 text-[12px] tracking-[0.1em] text-wawa-charcoal/45 uppercase">{t.note}</p>
        </div>
      </section>
    </>
  );
}

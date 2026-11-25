// Fuar standı fiyat rehberi (her dilde ortak): hızlı hesap, m² aralıkları, örnek bütçeler, fiyatı belirleyen kalemler
import type { Metadata } from "next";
import Link from "next/link";
import { PRICE_FACTORS_L, PRICE_YEAR, STAND_PRICES, SYSTEM_LABELS, estimate, euroRangeL, type StandSystem } from "@/content/stand-prices";
import { CALENDAR_PATH, STAND_PRICES_PATH, type PageLang } from "@/content/fair-meta";
import { ROUTES } from "@/lib/i18n";
import { PageIntro } from "@/components/templates/parts";
import { SetAlternates } from "@/components/layout/alternates";
import { switchTargets } from "@/content/fair-meta";
import { PriceCalculator } from "@/components/templates/PriceCalculator";

const EXAMPLES = [18, 36, 54];

const T = {
  tr: {
    metaTitle: `Fuar Standı Fiyatları ${PRICE_YEAR}: m² Başına Maliyet | WAWA Interiors`,
    metaDesc: `Ahşap ve Maxima fuar standı için ${PRICE_YEAR} metrekare fiyat aralıkları; Türkiye ve yurt dışı, örnek stand bütçeleri ve fiyatı etkileyen kalemler.`,
    title: `Fuar standı fiyatları ${PRICE_YEAR}`,
    lead: "Metrekare başına yaklaşık aralıklar, KDV hariç. Kesin fiyat; tasarım, malzeme, teknoloji ve lojistiğe göre teklifle netleşir.",
    ranges: "m² başına aralıklar",
    system: "Sistem",
    trCol: "Türkiye (€/m²)",
    abroadCol: "Yurt dışı (€/m²)",
    when: "Ne zaman tercih edilir",
    text: {
      ahsap: "Sıfırdan tasarlanır ve atölyemizde üretilir. Markaya özel biçim, malzeme ve detay isteyen katılımlar için.",
      maxima: "Hızlı kurulan, tekrar kullanılan modüler sistem. Satın alınabilir ya da kiralanabilir; sık fuara katılan markalar için ekonomik.",
    },
    examples: "Örnek stand bütçeleri",
    area: "Alan",
    exCols: ["Ahşap, Türkiye", "Ahşap, yurt dışı", "Maxima"],
    factors: "Fiyatı neler belirler?",
    end: (cal: string, offer: string) => (
      <>
        Katılacağınız fuarı <Link href={cal} className="underline underline-offset-4">fuar takviminde</Link> bulabilir ya da{" "}
        <Link href={offer} className="underline underline-offset-4">
          doğrudan teklif alabilirsiniz
        </Link>
        .
      </>
    ),
  },
  en: {
    metaTitle: `Exhibition Stand Prices ${PRICE_YEAR}: Cost per m² | WAWA Interiors`,
    metaDesc: `${PRICE_YEAR} price ranges per square metre for timber and Maxima exhibition stands, in Türkiye and abroad, with example budgets and the main cost drivers.`,
    title: `Exhibition stand prices ${PRICE_YEAR}`,
    lead: "Approximate ranges per square metre, excluding VAT. The exact price follows from design, materials, technology and logistics in our offer.",
    ranges: "Ranges per m²",
    system: "System",
    trCol: "Türkiye (€/m²)",
    abroadCol: "Abroad (€/m²)",
    when: "When to choose it",
    text: {
      ahsap: "Designed from scratch and built in our workshop. For brands that want their own shape, materials and details.",
      maxima: "A fast, reusable modular system. Available to buy or to rent; economical for brands that exhibit often.",
    },
    examples: "Example stand budgets",
    area: "Area",
    exCols: ["Timber, Türkiye", "Timber, abroad", "Maxima"],
    factors: "What drives the price?",
    end: (cal: string, offer: string) => (
      <>
        Find your fair in the <Link href={cal} className="underline underline-offset-4">trade fair calendar</Link> or{" "}
        <Link href={offer} className="underline underline-offset-4">
          ask for an offer directly
        </Link>
        .
      </>
    ),
  },
  de: {
    metaTitle: `Messestand Preise ${PRICE_YEAR}: Kosten pro m² | WAWA Interiors`,
    metaDesc: `Preisspannen ${PRICE_YEAR} pro Quadratmeter für Holz- und Maxima-Messestände in der Türkei und im Ausland, mit Beispielbudgets und den wichtigsten Kostenfaktoren.`,
    title: `Messestand Preise ${PRICE_YEAR}`,
    lead: "Ungefähre Spannen pro Quadratmeter, zzgl. MwSt. Der genaue Preis ergibt sich aus Design, Material, Technik und Logistik im Angebot.",
    ranges: "Spannen pro m²",
    system: "System",
    trCol: "Türkei (€/m²)",
    abroadCol: "Ausland (€/m²)",
    when: "Wann sinnvoll",
    text: {
      ahsap: "Von Grund auf entworfen und in unserer Werkstatt gefertigt. Für Marken, die eigene Form, Materialien und Details wollen.",
      maxima: "Schnell aufgebautes, wiederverwendbares Modulsystem. Kauf oder Miete; wirtschaftlich für Marken, die oft ausstellen.",
    },
    examples: "Beispielbudgets",
    area: "Fläche",
    exCols: ["Holz, Türkei", "Holz, Ausland", "Maxima"],
    factors: "Was bestimmt den Preis?",
    end: (cal: string, offer: string) => (
      <>
        Finden Sie Ihre Messe im <Link href={cal} className="underline underline-offset-4">Messekalender</Link> oder{" "}
        <Link href={offer} className="underline underline-offset-4">
          fragen Sie direkt ein Angebot an
        </Link>
        .
      </>
    ),
  },
};

export function standPricesMetadata(lang: PageLang): Metadata {
  const t = T[lang];
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDesc,
    alternates: { canonical: STAND_PRICES_PATH[lang], languages: { tr: STAND_PRICES_PATH.tr, en: STAND_PRICES_PATH.en, de: STAND_PRICES_PATH.de } },
    openGraph: { title: t.metaTitle, description: t.metaDesc },
  };
}

export function StandPricesPage({ lang }: { lang: PageLang }) {
  const t = T[lang];
  const th = "py-3 pr-4 font-normal";
  return (
    <>
      <SetAlternates lang={lang} alternates={switchTargets(STAND_PRICES_PATH)} />
      <PageIntro lang={lang} title={t.title} lead={t.lead} />
      <section className="bg-white" lang={lang}>
        <div className="container-wide grid gap-14 pb-16">
          <PriceCalculator lang={lang} />

          <div>
            <h2 className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">{t.ranges}</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-wawa-charcoal text-left text-[12px] tracking-[0.1em] text-wawa-charcoal/55 uppercase">
                    <th className={th}>{t.system}</th>
                    <th className={th}>{t.trCol}</th>
                    <th className={th}>{t.abroadCol}</th>
                    <th className="py-3 font-normal">{t.when}</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(STAND_PRICES) as StandSystem[]).map((s) => (
                    <tr key={s} className="border-b border-wawa-charcoal/15 align-top">
                      <td className="py-4 pr-4 font-medium text-wawa-charcoal">{SYSTEM_LABELS[lang][s]}</td>
                      <td className="py-4 pr-4 tabular-nums">{STAND_PRICES[s].tr.join("–")}</td>
                      <td className="py-4 pr-4 tabular-nums">{STAND_PRICES[s].abroad.join("–")}</td>
                      <td className="py-4 text-wawa-charcoal/75">{t.text[s]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">{t.examples}</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-wawa-charcoal text-left text-[12px] tracking-[0.1em] text-wawa-charcoal/55 uppercase">
                    <th className={th}>{t.area}</th>
                    <th className={th}>{t.exCols[0]}</th>
                    <th className={th}>{t.exCols[1]}</th>
                    <th className="py-3 font-normal">{t.exCols[2]}</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLES.map((m) => (
                    <tr key={m} className="border-b border-wawa-charcoal/15">
                      <td className="py-4 pr-4 font-medium tabular-nums text-wawa-charcoal">{m} m²</td>
                      <td className="py-4 pr-4 tabular-nums">{euroRangeL(estimate("ahsap", "tr", m)!, lang)}</td>
                      <td className="py-4 pr-4 tabular-nums">{euroRangeL(estimate("ahsap", "abroad", m)!, lang)}</td>
                      <td className="py-4 tabular-nums">{euroRangeL(estimate("maxima", "tr", m)!, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <h2 className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:col-span-4 lg:text-[30px]">{t.factors}</h2>
            <ul className="grid border-t border-wawa-charcoal/15 lg:col-span-8">
              {PRICE_FACTORS_L[lang].map((f) => (
                <li key={f.title} className="grid gap-1 border-b border-wawa-charcoal/15 py-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                  <span className="font-medium text-wawa-charcoal">{f.title}</span>
                  <span className="text-wawa-charcoal/75">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[15px] text-wawa-charcoal/75">{t.end(CALENDAR_PATH[lang], `${ROUTES[lang].offer}?tur=stand`)}</p>
        </div>
      </section>
    </>
  );
}

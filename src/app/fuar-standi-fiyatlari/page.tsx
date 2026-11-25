import type { Metadata } from "next";
import Link from "next/link";
import { PRICE_FACTORS, PRICE_YEAR, STAND_PRICES, SYSTEM_LABEL, euroRange, estimate, type StandSystem } from "@/content/stand-prices";
import { FAIRS_PATH } from "@/content/fairs";
import { PageIntro } from "@/components/templates/parts";
import { PriceCalculator } from "@/components/templates/PriceCalculator";

const title = `Fuar Standı Fiyatları ${PRICE_YEAR}: m² Başına Maliyet | WAWA Interiors`;
const description = `Ahşap, Maxima ve kongre standı için ${PRICE_YEAR} metrekare fiyat aralıkları; Türkiye ve yurt dışı, örnek stand bütçeleri ve fiyatı etkileyen kalemler.`;
export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: "/fuar-standi-fiyatlari/" }, openGraph: { title, description } };

const SYSTEM_TEXT: Record<StandSystem, string> = {
  ahsap: "Sıfırdan tasarlanır ve atölyemizde üretilir. Markaya özel biçim, malzeme ve detay isteyen katılımlar için.",
  maxima: "Hızlı kurulan, tekrar kullanılan modüler sistem. Satın alınabilir ya da kiralanabilir; sık fuara katılan markalar için ekonomik.",
  kongre: "Tıp, ilaç ve finans gibi alanlarda küçük metrekarede yoğun ve prestijli sunum için.",
};
const EXAMPLES = [18, 36, 54];

// Fuar standı fiyat rehberi: aralık tablosu, hızlı hesap, örnek bütçeler, fiyatı etkileyen kalemler
export default function StandPricesPage() {
  return (
    <>
      <PageIntro
        lang="tr"
        title={`Fuar standı fiyatları ${PRICE_YEAR}`}
        lead="Metrekare başına yaklaşık aralıklar, KDV hariç. Kesin fiyat; tasarım, malzeme, teknoloji ve lojistiğe göre teklifle netleşir."
      />
      <section className="bg-white" lang="tr">
        <div className="container-wide grid gap-14 pb-16">
          <PriceCalculator />

          <div>
            <h2 className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">m² başına aralıklar</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-wawa-charcoal text-left text-[12px] tracking-[0.1em] text-wawa-charcoal/55 uppercase">
                    <th className="py-3 pr-4 font-normal">Sistem</th>
                    <th className="py-3 pr-4 font-normal">Türkiye (€/m²)</th>
                    <th className="py-3 pr-4 font-normal">Yurt dışı (€/m²)</th>
                    <th className="py-3 font-normal">Ne zaman tercih edilir</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(STAND_PRICES) as StandSystem[]).map((s) => (
                    <tr key={s} className="border-b border-wawa-charcoal/15 align-top">
                      <td className="py-4 pr-4 font-medium text-wawa-charcoal">{SYSTEM_LABEL[s]}</td>
                      <td className="py-4 pr-4 tabular-nums">{STAND_PRICES[s].tr.join("–")}</td>
                      <td className="py-4 pr-4 tabular-nums">{STAND_PRICES[s].abroad.join("–")}</td>
                      <td className="py-4 text-wawa-charcoal/75">{SYSTEM_TEXT[s]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">Örnek stand bütçeleri</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-wawa-charcoal text-left text-[12px] tracking-[0.1em] text-wawa-charcoal/55 uppercase">
                    <th className="py-3 pr-4 font-normal">Alan</th>
                    <th className="py-3 pr-4 font-normal">Ahşap, Türkiye</th>
                    <th className="py-3 pr-4 font-normal">Ahşap, yurt dışı</th>
                    <th className="py-3 font-normal">Maxima</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLES.map((m) => (
                    <tr key={m} className="border-b border-wawa-charcoal/15">
                      <td className="py-4 pr-4 font-medium tabular-nums text-wawa-charcoal">{m} m²</td>
                      <td className="py-4 pr-4 tabular-nums">{euroRange(estimate("ahsap", "tr", m)!)}</td>
                      <td className="py-4 pr-4 tabular-nums">{euroRange(estimate("ahsap", "abroad", m)!)}</td>
                      <td className="py-4 tabular-nums">{euroRange(estimate("maxima", "tr", m)!)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <h2 className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:col-span-4 lg:text-[30px]">Fiyatı neler belirler?</h2>
            <ul className="grid border-t border-wawa-charcoal/15 lg:col-span-8">
              {PRICE_FACTORS.map((f) => (
                <li key={f.title} className="grid gap-1 border-b border-wawa-charcoal/15 py-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                  <span className="font-medium text-wawa-charcoal">{f.title}</span>
                  <span className="text-wawa-charcoal/75">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[15px] text-wawa-charcoal/75">
            Katılacağınız fuarı <Link href={FAIRS_PATH} className="underline underline-offset-4">fuar takviminde</Link> bulabilir ya da{" "}
            <Link href="/teklif-al/?tur=stand" className="underline underline-offset-4">
              doğrudan teklif alabilirsiniz
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}

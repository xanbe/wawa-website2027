import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import {
  COST_PARTS,
  INTERIOR_PRICES_PATH,
  INTERIOR_PRICE_FACTORS,
  INTERIOR_PRICE_FAQ,
  INTERIOR_PRICE_YEAR,
  PREPARE,
  SPACE_COSTS,
  WORK_MODES,
} from "@/content/interior-prices";
import { PageIntro } from "@/components/templates/parts";
import { FAQJsonLd } from "@/components/seo/JsonLd";

const title = `İç Mimarlık Fiyatları ${INTERIOR_PRICE_YEAR}: Bütçe Neye Göre Belirlenir? | WAWA Interiors`;
const description =
  "İç mimarlık ve anahtar teslim uygulama bütçesi nasıl oluşur? Tasarım ve uygulama bedeli, fiyatı belirleyen kalemler, mekân türüne göre maliyetler ve teklif öncesi hazırlık.";
export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: INTERIOR_PRICES_PATH }, openGraph: { title, description } };

const H2 = "font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]";
const LINE = "border-wawa-charcoal/15";

// İç mimarlık fiyat rehberi: rakam vermeden bütçenin yapısını anlatır, tasarım bedeli aracına ve teklife yönlendirir
export default function InteriorPricesPage() {
  return (
    <>
      <PageIntro
        lang="tr"
        title={`İç mimarlık fiyatları ${INTERIOR_PRICE_YEAR}`}
        lead="Her mekânın bütçesi kendi kapsamıyla oluşur. Bu rehber, fiyatın hangi kalemlerden oluştuğunu ve neye göre değiştiğini anlatır; kesin rakam keşif ve projeyle yazılı teklifte netleşir."
      />
      <section className="bg-white" lang="tr">
        <div className="container-wide grid gap-16 pb-16 lg:gap-20">
          {/* Bütçenin iki kalemi */}
          <div>
            <h2 className={H2}>Bütçe iki kalemden oluşur</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {COST_PARTS.map((c, i) => (
                <div key={c.title} className="flex flex-col bg-[#F3F2EF] p-6 sm:p-8">
                  <span className="grid h-9 w-9 place-items-center bg-wawa-accent text-[13px] font-medium tabular-nums text-wawa-charcoal">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-6 text-[22px] tracking-tight text-wawa-charcoal">{c.title}</p>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-wawa-charcoal/75">{c.text}</p>
                  <Link
                    href={c.cta.href}
                    className="group mt-6 inline-flex items-center gap-2 self-start border border-wawa-charcoal px-5 py-3 text-[15px] text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white"
                  >
                    {c.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Çalışma biçimleri */}
          <div>
            <h2 className={H2}>Üç çalışma biçimi</h2>
            <div className={`mt-8 grid border-t border-l md:grid-cols-3 ${LINE}`}>
              {WORK_MODES.map((m) => (
                <div key={m.title} className={`border-r border-b p-6 sm:p-8 ${LINE}`}>
                  <p className="text-[20px] tracking-tight text-wawa-charcoal">{m.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-wawa-charcoal/75">{m.text}</p>
                  <ul className={`mt-6 border-t ${LINE}`}>
                    {m.items.map((it) => (
                      <li key={it} className={`flex items-center gap-3 border-b py-3 text-[15px] text-wawa-charcoal ${LINE}`}>
                        <Check className="h-4 w-4 shrink-0 text-wawa-charcoal/60" aria-hidden />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Fiyatı belirleyen kalemler */}
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <h2 className={`${H2} lg:col-span-4`}>Fiyatı neler belirler?</h2>
            <ul className={`grid border-t lg:col-span-8 ${LINE}`}>
              {INTERIOR_PRICE_FACTORS.map((f) => (
                <li key={f.title} className={`grid gap-1 border-b py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6 ${LINE}`}>
                  <span className="font-medium text-wawa-charcoal">{f.title}</span>
                  <span className="text-wawa-charcoal/75">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mekân türüne göre öne çıkan kalemler */}
          <div>
            <h2 className={H2}>Mekân türüne göre öne çıkan kalemler</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {SPACE_COSTS.map((s) => (
                <Link key={s.href} href={s.href} className={`group flex flex-col border p-5 transition-colors hover:border-wawa-charcoal ${LINE}`}>
                  <span className="flex items-center justify-between gap-3 text-[17px] tracking-tight text-wawa-charcoal">
                    {s.title}
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-wawa-charcoal/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <ul className="mt-4 grid gap-2">
                    {s.items.map((it) => (
                      <li key={it} className="flex gap-2 text-[14px] leading-snug text-wawa-charcoal/75">
                        <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-wawa-accent outline outline-1 outline-wawa-charcoal" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          </div>

          {/* Teklif öncesi hazırlık ve SSS */}
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <h2 className={H2}>Teklif için neler hazırlanmalı?</h2>
              <ol className={`mt-8 border-t ${LINE}`}>
                {PREPARE.map((p, i) => (
                  <li key={p} className={`flex items-baseline gap-4 border-b py-3 text-[15px] text-wawa-charcoal ${LINE}`}>
                    <span className="text-[13px] tabular-nums text-wawa-charcoal/50">{String(i + 1).padStart(2, "0")}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <h2 className={H2}>Sık sorulanlar</h2>
              <div className={`mt-8 border-t ${LINE}`}>
                {INTERIOR_PRICE_FAQ.map((f) => (
                  <details key={f.q} className={`group border-b py-4 ${LINE}`}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] text-wawa-charcoal [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <span aria-hidden className="text-[20px] leading-none text-wawa-charcoal/50 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-[15px] leading-relaxed text-wawa-charcoal/75">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Teklif */}
          <div className="flex flex-col gap-6 bg-wawa-charcoal p-8 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-heading text-[24px] leading-[1.25] lg:text-[30px]">Mekânınızın bütçesini birlikte çıkaralım.</p>
              <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-white/75">Mekân türünü, alanı ve beklentilerinizi paylaşın; kapsamı netleştirip ücretsiz, yazılı teklif hazırlayalım.</p>
            </div>
            <Link href="/teklif-al/?tur=ic-mimarlik" className="group inline-flex shrink-0 items-center gap-3 self-start bg-wawa-accent px-6 py-4 text-[15px] font-medium text-wawa-charcoal lg:self-auto">
              Teklif alın
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
      <FAQJsonLd faqs={INTERIOR_PRICE_FAQ.map((f) => ({ question: f.q, answer: f.a }))} />
    </>
  );
}

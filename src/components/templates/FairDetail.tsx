// Fuar sayfası (her dilde ortak): tarih ve salon, WAWA'nın o fuardaki projeleri, bütçe aralığı, fuar adı dolu teklif bağlantısı.
// Türkçe /fuar-takvimi/<slug>/, İngilizce /en/trade-fair-calendar/<slug>/, Almanca /de/messekalender/<slug>/.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { FAIRS, sectorGroup, type Fair } from "@/content/fairs";
import { SECTOR_TIPS } from "@/content/fair-sector-tips";
import { getFairGuide } from "@/content/fair-guides";
import { CALENDAR_PATH, REGION_LABELS, STAND_PRICES_PATH, cityL, countryL, fairPathL, sectorL, type PageLang } from "@/content/fairs-i18n";
import { PRICE_YEAR, STAND_PRICES, SYSTEM_LABELS, estimate, euroRangeL } from "@/content/stand-prices";
import { ROUTES } from "@/lib/i18n";
import { isStandProject, projectCategory, projectsIn, type Project } from "@/lib/content";
import { ProjectCard } from "@/components/templates/parts";
import { SetAlternates } from "@/components/layout/alternates";
import { FairCountdown } from "@/components/templates/FairLive";

const LOCALE: Record<PageLang, string> = { tr: "tr-TR", en: "en-GB", de: "de-DE" };

const T = {
  tr: {
    crumb: "Fuar takvimi",
    h1: (n: string) => `${n} fuar standı`,
    lead: (n: string, city: string, local: boolean) => `${n} için standınızı İstanbul'daki atölyemizde üretiyor, ${local ? "fuar alanında" : "fuar şehrine taşıyıp"} kurulumunu ve sökümünü yapıyoruz.`,
    cta: (n: string) => `${n} için teklif alın`,
    date: "Tarih",
    city: "Şehir",
    venue: "Fuar alanı",
    sector: "Sektör",
    region: "Bölge",
    official: "Resmî site",
    source: "Kaynak",
    status: "Durum",
    unverified: "Tarihler henüz organizatörün sitesinde doğrulanamadı; katılım öncesinde teyit edin.",
    verified: "Tarihler organizatörün duyurusundan alınmıştır; katılım öncesinde resmî siteden teyit edin.",
    exact: (n: string) => `${n} fuarında kurduğumuz standlar`,
    latest: "Son fuar standı projelerimiz",
    allStands: "Tüm fuar standları",
    budget: "Yaklaşık bütçe",
    budgetText: (tr: boolean) => `${tr ? "Türkiye'deki" : "Yurt dışındaki"} fuarlar için m² başına aralıklar, KDV hariç. Planlama tahminidir; kesin fiyat tasarım ve kapsama göre teklifle netleşir.`,
    guide: "Fiyat rehberi",
    system: "Sistem",
    maxima: "Maxima (modüler, kiralık da olur)",
    others: "Diğer fuarlar",
    sameSector: "Bu sektördeki yaklaşan fuarlar",
    about: (n: string) => `${n} hakkında`,
    sources: "Kaynak",
    guideTitle: (n: string, y: string) => `${n} ${y}: Tarihler, Fuar Alanı ve Stand Rehberi | WAWA Interiors`,
    faq: "Sık sorulan sorular",
    qWhen: (n: string) => `${n} ne zaman?`,
    aWhen: (n: string, d: string, ok: boolean) => `${n}, ${d} tarihlerinde düzenleniyor. ${ok ? "Tarihler organizatörün duyurusundan alınmıştır; katılım öncesinde resmî siteden teyit edin." : "Tarihler henüz organizatörün sitesinde doğrulanmadı; katılım öncesinde teyit edin."}`,
    qWhere: (n: string) => `${n} nerede yapılıyor?`,
    aWhere: (n: string, place: string) => `${n} ${place} adresinde yapılıyor.`,
    qCost: (n: string) => `${n} için fuar standı ne kadar tutar?`,
    aCost: (tr: boolean, a: string, m: string) => `${tr ? "Türkiye'deki" : "Yurt dışındaki"} fuarlar için özel tasarım ahşap stand m² başına ${a} €, Maxima modüler stand ${m} € aralığındadır (KDV hariç, ${PRICE_YEAR} planlama tahmini). Kesin fiyat stand alanı, tasarım ve kapsama göre teklifle netleşir.`,
    metaTitle: (n: string, y: string) => `${n} ${y} Fuar Standı | WAWA Interiors`,
    metaDesc: (n: string, city: string, d: string) => `${n} (${city}, ${d}) için fuar standı tasarımı, üretimi ve kurulumu. Bütçe aralığı ve bu fuarda yaptığımız standlar.`,
  },
  en: {
    crumb: "Trade fair calendar",
    h1: (n: string) => `${n} exhibition stand`,
    lead: (n: string, city: string, local: boolean) => `We build your stand for ${n} in our Istanbul workshop, ${local ? "and install and dismantle it at the venue" : `ship it to ${city} and handle installation and dismantling`}.`,
    cta: (n: string) => `Get an offer for ${n}`,
    date: "Dates",
    city: "City",
    venue: "Venue",
    sector: "Sector",
    region: "Region",
    official: "Official site",
    source: "Source",
    status: "Status",
    unverified: "Dates could not yet be confirmed on the organiser's site; please check before you plan.",
    verified: "Dates are taken from the organiser's announcement; please confirm on the official site before you plan.",
    exact: (n: string) => `Our stands at ${n}`,
    latest: "Our latest exhibition stands",
    allStands: "All projects",
    budget: "Approximate budget",
    budgetText: (tr: boolean) => `Ranges per m² for fairs ${tr ? "in Türkiye" : "outside Türkiye"}, excluding VAT. A planning estimate; the exact price follows from the design and scope in our offer.`,
    guide: "Price guide",
    system: "System",
    maxima: "Maxima (modular, also for rent)",
    others: "Other fairs",
    sameSector: "Upcoming fairs in this sector",
    about: (n: string) => `About ${n}`,
    sources: "Sources",
    guideTitle: (n: string, y: string) => `${n} ${y}: Dates, Venue and Exhibitor Guide | WAWA Interiors`,
    faq: "Frequently asked questions",
    qWhen: (n: string) => `When is ${n}?`,
    aWhen: (n: string, d: string, ok: boolean) => `${n} takes place on ${d}. ${ok ? "Dates are taken from the organiser's announcement; please confirm on the official site before you plan." : "Dates have not yet been confirmed on the organiser's site; please check before you plan."}`,
    qWhere: (n: string) => `Where is ${n} held?`,
    aWhere: (n: string, place: string) => `${n} is held at ${place}.`,
    qCost: (n: string) => `How much does an exhibition stand for ${n} cost?`,
    aCost: (tr: boolean, a: string, m: string) => `For fairs ${tr ? "in Türkiye" : "outside Türkiye"}, a custom-built wooden stand costs €${a} per m² and a Maxima modular stand €${m} per m² (excluding VAT, ${PRICE_YEAR} planning estimate). The exact price follows from stand size, design and scope in our offer.`,
    metaTitle: (n: string, y: string) => `${n} ${y} Exhibition Stand | WAWA Interiors`,
    metaDesc: (n: string, city: string, d: string) => `Exhibition stand design, production and installation for ${n} (${city}, ${d}). Budget range and our stands at this fair.`,
  },
  de: {
    crumb: "Messekalender",
    h1: (n: string) => `${n} Messestand`,
    lead: (n: string, city: string, local: boolean) => `Wir fertigen Ihren Stand für ${n} in unserer Werkstatt in Istanbul, ${local ? "bauen ihn auf dem Messegelände auf und wieder ab" : `transportieren ihn nach ${city} und übernehmen Auf- und Abbau`}.`,
    cta: (n: string) => `Angebot für ${n} anfragen`,
    date: "Termin",
    city: "Stadt",
    venue: "Gelände",
    sector: "Branche",
    region: "Region",
    official: "Offizielle Website",
    source: "Quelle",
    status: "Status",
    unverified: "Die Termine sind auf der Website des Veranstalters noch nicht bestätigt; bitte vor der Planung prüfen.",
    verified: "Termine laut Veranstalter; bitte vor der Planung auf der offiziellen Website prüfen.",
    exact: (n: string) => `Unsere Stände auf der ${n}`,
    latest: "Unsere neuesten Messestände",
    allStands: "Alle Projekte",
    budget: "Ungefähres Budget",
    budgetText: (tr: boolean) => `Spannen pro m² für Messen ${tr ? "in der Türkei" : "außerhalb der Türkei"}, zzgl. MwSt. Eine Planungsschätzung; der genaue Preis ergibt sich aus Design und Umfang im Angebot.`,
    guide: "Preisübersicht",
    system: "System",
    maxima: "Maxima (modular, auch zur Miete)",
    others: "Weitere Messen",
    sameSector: "Kommende Messen dieser Branche",
    about: (n: string) => `Über ${n}`,
    sources: "Quellen",
    guideTitle: (n: string, y: string) => `${n} ${y}: Termine, Gelände und Aussteller-Leitfaden | WAWA Interiors`,
    faq: "Häufige Fragen",
    qWhen: (n: string) => `Wann findet ${n} statt?`,
    aWhen: (n: string, d: string, ok: boolean) => `${n} findet am ${d} statt. ${ok ? "Termine laut Veranstalter; bitte vor der Planung auf der offiziellen Website prüfen." : "Die Termine sind auf der Website des Veranstalters noch nicht bestätigt; bitte vor der Planung prüfen."}`,
    qWhere: (n: string) => `Wo findet ${n} statt?`,
    aWhere: (n: string, place: string) => `${n} findet in ${place} statt.`,
    qCost: (n: string) => `Was kostet ein Messestand für ${n}?`,
    aCost: (tr: boolean, a: string, m: string) => `Für Messen ${tr ? "in der Türkei" : "außerhalb der Türkei"} kostet ein individueller Holzstand ${a} € pro m², ein modularer Maxima-Stand ${m} € pro m² (zzgl. MwSt., Planungsschätzung ${PRICE_YEAR}). Der genaue Preis ergibt sich aus Standfläche, Design und Umfang im Angebot.`,
    metaTitle: (n: string, y: string) => `${n} ${y} Messestand | WAWA Interiors`,
    metaDesc: (n: string, city: string, d: string) => `Messestand-Design, Fertigung und Aufbau für ${n} (${city}, ${d}). Budgetrahmen und unsere Stände auf dieser Messe.`,
  },
};

export function fairDateRange(f: Pick<Fair, "start" | "end">, lang: PageLang) {
  const s = new Date(`${f.start}T12:00:00Z`);
  const e = new Date(`${f.end}T12:00:00Z`);
  const month = (d: Date) => d.toLocaleDateString(LOCALE[lang], { month: "long", timeZone: "UTC" });
  const day = (d: Date) => `${d.getUTCDate()}${lang === "de" ? "." : ""}`;
  if (s.getUTCFullYear() !== e.getUTCFullYear()) return `${day(s)} ${month(s)} ${s.getUTCFullYear()} – ${day(e)} ${month(e)} ${e.getUTCFullYear()}`;
  return s.getUTCMonth() === e.getUTCMonth()
    ? `${day(s)}–${day(e)} ${month(e)} ${e.getUTCFullYear()}`
    : `${day(s)} ${month(s)} – ${day(e)} ${month(e)} ${e.getUTCFullYear()}`;
}

const norm = (s: string) => ` ${s.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]+/g, " ")} `;
// Başlığında fuarın adı geçen projeler; yoksa son fuar standı projeleri
function fairProjects(fair: Fair, lang: PageLang): { list: Project[]; exact: boolean } {
  const all = projectsIn(lang);
  const exact = all.filter((p) => fair.match.some((m) => norm(p.title).includes(norm(m))));
  if (exact.length) return { list: exact.slice(0, 6), exact: true };
  return { list: all.filter(isStandProject).slice(0, 3), exact: false };
}

export function fairMetadata(fair: Fair | undefined, lang: PageLang): Metadata {
  if (!fair) return {};
  const t = T[lang];
  const guide = getFairGuide(fair.slug);
  const title = guide ? t.guideTitle(guide.name, fair.start.slice(0, 4)) : t.metaTitle(fair.name, fair.start.slice(0, 4));
  const description = t.metaDesc(fair.name, cityL(fair.city, lang), fairDateRange(fair, lang));
  const url = fairPathL(lang, fair.slug);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: { tr: fairPathL("tr", fair.slug), en: fairPathL("en", fair.slug), de: fairPathL("de", fair.slug) } },
    openGraph: { title, description, url },
  };
}

export function FairDetail({ fair, lang }: { fair: Fair; lang: PageLang }) {
  const t = T[lang];
  const { list, exact } = fairProjects(fair, lang);
  const region = fair.region === "tr" ? "tr" : "abroad";
  const city = cityL(fair.city, lang);
  const offerHref = `${ROUTES[lang].offer}?tur=stand&fuar=${encodeURIComponent(`${fair.name} · ${city}`)}`;
  // Bu fuardan sonraki fuarlar: önce aynı sektör grubundakiler, sonra aynı bölgedekiler, sonra diğerleri
  const guide = getFairGuide(fair.slug);
  const guideText = guide?.[lang];
  const group = sectorGroup(fair);
  const tip = SECTOR_TIPS[lang][group];
  const later = FAIRS.filter((f) => f.slug !== fair.slug && f.start >= fair.start);
  const sameSector = later.filter((f) => sectorGroup(f) === group);
  const rest = later.filter((f) => sectorGroup(f) !== group);
  const others = [...sameSector, ...rest.filter((f) => f.region === fair.region), ...rest.filter((f) => f.region !== fair.region)].slice(0, 6);
  // Sık sorulan sorular: yalnız fuarın kendi verisinden (tarih, yer) ve sitedeki fiyat aralıklarından
  const place = [fair.venue, `${city}, ${countryL(fair.country, lang)}`].filter(Boolean).join(", ");
  const priceRegion = fair.region === "tr" ? "tr" : "abroad";
  const faqs = [
    { q: t.qWhen(fair.name), a: t.aWhen(fair.name, fairDateRange(fair, lang), fair.verified !== false) },
    { q: t.qWhere(fair.name), a: t.aWhere(fair.name, place) },
    { q: t.qCost(fair.name), a: t.aCost(fair.region === "tr", STAND_PRICES.ahsap[priceRegion].join("–"), STAND_PRICES.maxima[priceRegion].join("–")) },
  ];
  // Google etkinlik işaretlemesi: yalnız tarihi organizatörden doğrulanmış fuarlar
  const eventLd =
    fair.verified === false
      ? null
      : {
          "@context": "https://schema.org",
          "@type": "ExhibitionEvent",
          name: fair.name,
          startDate: fair.start,
          endDate: fair.end,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: fair.venue ?? city,
            address: { "@type": "PostalAddress", addressLocality: city, addressCountry: countryL(fair.country, lang) },
          },
          ...(fair.url ? { url: fair.url } : {}),
          description: t.metaDesc(fair.name, city, fairDateRange(fair, lang)),
        };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const ld = (o: object) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });
  const host = fair.url ? new URL(fair.url).hostname.replace(/^www\./, "") : null;
  const examples = [18, 36, 54];
  const allStandsHref = lang === "tr" ? "/portfolio-category/fuar-stand-tasarimi/" : ROUTES[lang].projects;
  const row = "grid grid-cols-[110px_minmax(0,1fr)] gap-3";

  return (
    <article className="bg-white" lang={lang}>
      <SetAlternates lang={lang} alternates={{ tr: fairPathL("tr", fair.slug), en: fairPathL("en", fair.slug), de: fairPathL("de", fair.slug), it: fairPathL("en", fair.slug), fr: fairPathL("en", fair.slug) }} />
      {/* Açılış */}
      <header className="container-wide pt-32 pb-10 lg:pt-44 lg:pb-14">
        <Link href={CALENDAR_PATH[lang]} className="text-[13px] tracking-[0.12em] text-wawa-charcoal/60 uppercase underline-offset-4 hover:underline">
          {t.crumb}
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <h1 className="font-heading text-[30px] leading-[1.15] font-normal tracking-[-0.01em] text-balance text-wawa-charcoal sm:text-[42px] lg:text-[56px]">{t.h1(fair.name)}</h1>
            <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-wawa-charcoal/75">{t.lead(fair.name, city, fair.city === "İstanbul")}</p>
            <Link href={offerHref} className="group mt-8 inline-flex min-h-14 items-center gap-4 bg-wawa-accent px-7 py-3 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white">
              {t.cta(fair.name)}
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          <dl className="grid content-start gap-4 border-t border-wawa-charcoal pt-5 text-[15px] lg:col-span-4">
            {[
              [t.date, fairDateRange(fair, lang)],
              [t.city, `${city}, ${countryL(fair.country, lang)}`],
              ...(fair.venue ? [[t.venue, fair.venue]] : []),
              [t.sector, sectorL(fair, lang)],
              [t.region, REGION_LABELS[lang][fair.region]],
            ].map(([k, v]) => (
              <div key={k} className={row}>
                <dt className="text-wawa-charcoal/55">{k}</dt>
                <dd className="text-wawa-charcoal">{v}</dd>
              </div>
            ))}
            {host && (
              <div className={row}>
                <dt className="text-wawa-charcoal/55">{fair.verified === false || /tobb\.org\.tr$/.test(host) ? t.source : t.official}</dt>
                <dd>
                  <a href={fair.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 break-all text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-4 hover:decoration-wawa-charcoal">
                    {host} <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </a>
                </dd>
              </div>
            )}
            <div className={row}>
              <dt className="text-wawa-charcoal/55">{t.status}</dt>
              <dd className="text-wawa-charcoal">
                <FairCountdown start={fair.start} end={fair.end} lang={lang} />
              </dd>
            </div>
          </dl>
        </div>
        <p className="mt-6 text-[12px] tracking-[0.1em] text-wawa-charcoal/45 uppercase">{fair.verified === false ? t.unverified : t.verified}</p>
      </header>
      {eventLd && <script type="application/ld+json" dangerouslySetInnerHTML={ld(eventLd)} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqLd)} />

      {/* Fuar rehberi: fuarın resmî sitesinden araştırılmış özgün metin */}
      {guide && guideText && (
        <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-about">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <h2 id="fair-about" className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:col-span-4 lg:text-[30px]">
              {t.about(guide.name)}
            </h2>
            <div className="max-w-[68ch] space-y-6 lg:col-span-8">
              <p className="text-[18px] leading-relaxed text-wawa-charcoal">{guideText.intro}</p>
              {guideText.sections.map((sec) => (
                <div key={sec.h}>
                  <h3 className="text-[19px] font-medium text-wawa-charcoal">{sec.h}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-wawa-charcoal/80">{sec.p}</p>
                </div>
              ))}
              <p className="text-[12px] leading-relaxed text-wawa-charcoal/50">
                {t.sources}:{" "}
                {[...new Set(guide.sources.map((u) => new URL(u).hostname.replace(/^www\./, "")))].join(", ")} · {guide.updated}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Sektöre göre stand notu */}
      <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-sector">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <h2 id="fair-sector" className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:col-span-4 lg:text-[30px]">
            {tip.title}
          </h2>
          <p className="max-w-[68ch] text-[17px] leading-relaxed text-wawa-charcoal/80 lg:col-span-8">{tip.text}</p>
        </div>
      </section>

      {/* Bu fuardaki işlerimiz */}
      {list.length > 0 && (
        <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-projects">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="fair-projects" className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">
              {exact ? t.exact(fair.name) : t.latest}
            </h2>
            <Link href={allStandsHref} className="text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] hover:decoration-wawa-charcoal">
              {t.allStands}
            </Link>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProjectCard key={p.path} project={p} category={projectCategory(p)?.name} />
            ))}
          </div>
        </section>
      )}

      {/* Bütçe */}
      <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-budget">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="fair-budget" className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">
              {t.budget}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-wawa-charcoal/70">{t.budgetText(fair.region === "tr")}</p>
            <Link href={STAND_PRICES_PATH[lang]} className="mt-4 inline-flex items-center gap-2 text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] hover:decoration-wawa-charcoal">
              {t.guide} <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="overflow-x-auto lg:col-span-8">
            <table className="w-full min-w-[520px] border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-wawa-charcoal text-left text-[12px] tracking-[0.1em] text-wawa-charcoal/55 uppercase">
                  <th className="py-3 pr-4 font-normal">{t.system}</th>
                  <th className="py-3 pr-4 font-normal">€/m²</th>
                  {examples.map((m) => (
                    <th key={m} className="py-3 pr-4 font-normal">
                      {m} m²
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["ahsap", "maxima"] as const).map((sys) => (
                  <tr key={sys} className="border-b border-wawa-charcoal/15 align-top">
                    <td className="py-3 pr-4 font-medium text-wawa-charcoal">{sys === "ahsap" ? SYSTEM_LABELS[lang].ahsap : t.maxima}</td>
                    <td className="py-3 pr-4 tabular-nums text-wawa-charcoal">{STAND_PRICES[sys][region].join("–")}</td>
                    {examples.map((m) => (
                      <td key={m} className="py-3 pr-4 tabular-nums text-wawa-charcoal/80">
                        {euroRangeL(estimate(sys, region, m)!, lang)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Diğer fuarlar */}
      <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-others">
        <h2 id="fair-others" className="font-heading text-[22px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[26px]">
          {sameSector.length >= 3 ? t.sameSector : t.others}
        </h2>
        <ul className="mt-6 grid border-t border-wawa-charcoal/15 sm:grid-cols-2">
          {others.map((f) => (
            <li key={f.slug} className="border-b border-wawa-charcoal/15">
              <Link href={fairPathL(lang, f.slug)} className="group flex items-baseline justify-between gap-4 py-4 pr-4">
                <span>
                  <span className="text-[16px] font-medium text-wawa-charcoal group-hover:underline">{f.name}</span>
                  <span className="ml-2 text-[13px] text-wawa-charcoal/55">
                    {cityL(f.city, lang)} · {REGION_LABELS[lang][f.region]}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] tabular-nums text-wawa-charcoal/60">{fairDateRange(f, lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Sık sorulan sorular */}
      <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-faq">
        <h2 id="fair-faq" className="font-heading text-[22px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[26px]">
          {t.faq}
        </h2>
        <dl className="mt-6 grid gap-6 border-t border-wawa-charcoal/15 pt-6 lg:grid-cols-3 lg:gap-10">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="text-[17px] font-medium text-wawa-charcoal">{f.q}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-wawa-charcoal/75">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}

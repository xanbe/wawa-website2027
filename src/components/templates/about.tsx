import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { ROUTES, type Lang } from "@/lib/i18n";
import { getLegacyPage, type LegacyPage } from "@/lib/content";
import { NAV } from "@/components/layout/navigation";
import { GlobalBrands } from "@/components/sections/GlobalBrands";
import { SectionHeader, SectionLead } from "@/components/sections/SectionHeading";
import { CtaBand, LINE, Prose } from "./parts";

// Hakkımızda: eski Vercel sürümündeki kurgu (giriş + rakamlar, hikâye, atölye, hizmet alanları, markalar), yeni temada

// Rakamlar WAWA'nın önceki sitesinden alınmıştır
const STATS = [
  { value: "67+", label: { tr: "Marka ortağı", en: "Brand partners", de: "Markenpartner", it: "Marchi partner", fr: "Marques partenaires" } },
  { value: "248", label: { tr: "Proje", en: "Projects", de: "Projekte", it: "Progetti", fr: "Projets" } },
  { value: "38", label: { tr: "Ülke ve şehir", en: "Countries & cities", de: "Länder & Städte", it: "Paesi e città", fr: "Pays et villes" } },
  { value: "22.680", label: { tr: "Metrekare", en: "Square metres", de: "Quadratmeter", it: "Metri quadrati", fr: "Mètres carrés" } },
];

const COPY: Record<
  Lang,
  {
    title: string;
    lead: string;
    start: string;
    projects: string;
    badge: string;
    badgeText: string;
    storyTitle: string;
    workshopTitle: string;
    workshopText: string;
    values: string[];
    servicesTitle: string;
    servicesLead: string;
    brands: string;
  }
> = {
  tr: {
    title: "Tasarım, üretim ve kurulum tek ekipte.",
    lead: "İç mimarlık ve fuar standı projelerinde 30 yılı aşkın deneyimle anahtar teslim hizmet sunuyoruz. Konseptten sahaya kadar tüm süreci planlı ilerletir, zamanında teslim ederiz.",
    start: "Proje başlat",
    projects: "Projelerimiz",
    badge: "Anahtar teslim",
    badgeText: "Tasarım · Üretim · Kurulum",
    storyTitle: "Yaşam alanlarınıza değer katıyoruz.",
    workshopTitle: "Tasarımdan teslime tam kontrol.",
    workshopText:
      "Tüm üretim süreçlerini Zeytinburnu'ndaki kendi atölyemizde gerçekleştiriyoruz. Bu sayede kalite kontrolü, maliyet yönetimi ve teslimat süresini tam kontrol altında tutarak size en iyi sonucu sunuyoruz.",
    values: ["Hız", "Kalite", "Güven"],
    servicesTitle: "Neler yapıyoruz?",
    servicesLead: "Markanızın ihtiyacına göre özelleştirilmiş, anahtar teslim tasarım ve uygulama çözümleri.",
    brands: "Birlikte çalıştığımız markalar",
  },
  en: {
    title: "Design, production and installation in one team.",
    lead: "With more than 30 years of experience, we deliver turnkey interior architecture and exhibition stand projects. We plan every step from concept to site and hand over on time.",
    start: "Start a project",
    projects: "Our projects",
    badge: "Turnkey",
    badgeText: "Design · Production · Installation",
    storyTitle: "We add value to the spaces you live in.",
    workshopTitle: "Full control from design to handover.",
    workshopText:
      "All production takes place in our own workshop in Zeytinburnu, Istanbul. This keeps quality, cost and delivery time under our control and gives you the best result.",
    values: ["Speed", "Quality", "Trust"],
    servicesTitle: "What we do",
    servicesLead: "Turnkey design and build solutions tailored to what your brand needs.",
    brands: "Brands we work with",
  },
  de: {
    title: "Planung, Produktion und Aufbau in einem Team.",
    lead: "Mit über 30 Jahren Erfahrung realisieren wir Innenarchitektur- und Messestandprojekte schlüsselfertig. Vom Konzept bis zur Baustelle planen wir jeden Schritt und übergeben pünktlich.",
    start: "Projekt starten",
    projects: "Unsere Projekte",
    badge: "Schlüsselfertig",
    badgeText: "Planung · Produktion · Aufbau",
    storyTitle: "Wir geben Ihren Räumen einen Mehrwert.",
    workshopTitle: "Volle Kontrolle von der Planung bis zur Übergabe.",
    workshopText:
      "Die gesamte Fertigung findet in unserer eigenen Werkstatt in Zeytinburnu, Istanbul, statt. So behalten wir Qualität, Kosten und Lieferzeit im Griff und liefern Ihnen das beste Ergebnis.",
    values: ["Tempo", "Qualität", "Vertrauen"],
    servicesTitle: "Was wir tun",
    servicesLead: "Schlüsselfertige Planungs- und Umsetzungslösungen, zugeschnitten auf Ihre Marke.",
    brands: "Marken, mit denen wir arbeiten",
  },
  it: {
    title: "Progettazione, produzione e montaggio in un unico team.",
    lead: "Con oltre 30 anni di esperienza realizziamo chiavi in mano progetti di architettura d'interni e stand fieristici. Pianifichiamo ogni fase dal concept al cantiere e consegniamo nei tempi.",
    start: "Avvia un progetto",
    projects: "I nostri progetti",
    badge: "Chiavi in mano",
    badgeText: "Progettazione · Produzione · Montaggio",
    storyTitle: "Diamo valore agli spazi che vivete.",
    workshopTitle: "Pieno controllo dal progetto alla consegna.",
    workshopText:
      "Tutta la produzione avviene nel nostro laboratorio di Zeytinburnu, a Istanbul. Così teniamo sotto controllo qualità, costi e tempi di consegna e vi offriamo il miglior risultato.",
    values: ["Rapidità", "Qualità", "Fiducia"],
    servicesTitle: "Cosa facciamo",
    servicesLead: "Soluzioni chiavi in mano di progettazione e realizzazione, su misura per il vostro marchio.",
    brands: "I marchi con cui lavoriamo",
  },
  fr: {
    title: "Conception, production et montage dans une seule équipe.",
    lead: "Forts de plus de 30 ans d'expérience, nous réalisons clés en main des projets d'architecture intérieure et de stands d'exposition. Nous planifions chaque étape du concept au chantier et livrons dans les délais.",
    start: "Lancer un projet",
    projects: "Nos projets",
    badge: "Clés en main",
    badgeText: "Conception · Production · Montage",
    storyTitle: "Nous donnons de la valeur à vos espaces.",
    workshopTitle: "Une maîtrise totale, de la conception à la livraison.",
    workshopText:
      "Toute la production est réalisée dans notre propre atelier à Zeytinburnu, Istanbul. Nous maîtrisons ainsi la qualité, les coûts et les délais pour vous offrir le meilleur résultat.",
    values: ["Rapidité", "Qualité", "Confiance"],
    servicesTitle: "Nos services",
    servicesLead: "Des solutions clés en main de conception et de réalisation, adaptées aux besoins de votre marque.",
    brands: "Les marques avec lesquelles nous travaillons",
  },
};

// Hikâye metni: TR için önceki sitedeki üç paragraf; diğer dillerde eski sayfanın metni ya da çevirisi
const STORY_TR = [
  "Wawa iç mimarlık ofisi; yaşam alanı tasarlarken o mekâna ait duyguları, içerisinde yaşayan bireylerin hareketlerini ve kullanım amacını projenin önceliği haline getirir. Wawa iç mimarlık ofisi; tasarımın farklı bir yetisi olduğuna inanan, işlevselliği ve mekân içerisindeki etkileşimi önemseyen İstanbul konumlu iç mimarlık ofisidir.",
  "İç mimarlık ofisimiz bir yaşam alanının hedef kitle analizi ile başlayıp, mekân içerisindeki işlev tasarımına, bireyler arasındaki etkileşim tasarımı gibi nüansların planlamasıyla devam eder. Bu planlama ile birlikte o hedef kitlenin taleplerine karşılık veren proje tasarım aşamasına ilerler. Proje tasarımında mekânda kullanılan her detay belirlenir. Konsept tasarımı ile başlayan süreç proje tasarımı, proje uygulaması ve kontrollük ile devam eder.",
  "Wawa İç Mimarlık olarak; sizin beklentilerinizi, zevklerinizi ve yaşam tarzınızı tasarım ve üretim ekibimiz ile buluşturup, yaşam alanınıza ve mekânınıza renk vererek ruhunuza dokunuyoruz. Estetik ve fonksiyonelliği ön planda tutarak sadece yaşam alanlarınızı tasarlamıyoruz, aynı zamanda ticari alanlarınızı ve sosyal yaşam alanlarınızı da benzerlerinden farklı kılarak tasarlıyoruz. Fikir üretme adımını attığımız her projemizde, yenilikleri ve işlevselliği keyifli bir şekilde kullanarak özgün ve ilham verici tasarımlar ile sizleri buluşturuyoruz.",
];

const STORY: Partial<Record<Lang, string>> = {
  it: "<p>Lo studio di architettura d'interni Wawa mette al centro del progetto le emozioni legate allo spazio, i movimenti delle persone che lo vivono e il suo scopo. Wawa è uno studio con sede a Istanbul, convinto che il design sia un talento a sé, attento alla funzionalità e all'interazione all'interno dello spazio.</p><p>Ogni progetto inizia con l'analisi del pubblico e prosegue con la progettazione delle funzioni e delle interazioni tra le persone. Il processo parte dal concept e continua con il progetto esecutivo, la realizzazione e la direzione lavori.</p><p>Progettiamo non solo abitazioni ma anche spazi commerciali e sociali, mettendo in primo piano estetica e funzionalità, con soluzioni originali e fonte d'ispirazione.</p>",
  fr: "<p>Le bureau d'architecture intérieure Wawa place au cœur du projet les émotions liées à l'espace, les mouvements de ceux qui l'habitent et son usage. Wawa est un bureau basé à Istanbul, convaincu que le design est un talent à part entière, attentif à la fonctionnalité et aux interactions dans l'espace.</p><p>Chaque projet commence par l'analyse du public visé et se poursuit par la conception des fonctions et des interactions entre les personnes. Le processus part du concept et se poursuit par le projet d'exécution, la réalisation et le suivi de chantier.</p><p>Nous concevons des logements mais aussi des espaces commerciaux et sociaux, en privilégiant l'esthétique et la fonctionnalité, avec des créations originales et inspirantes.</p>",
};

// Eski sayfanın paragrafları (EN/DE)
function legacyBody(page?: LegacyPage) {
  if (!page) return "";
  return page.html
    .split("\n")
    .filter((l) => /^<(p|ul|ol)/.test(l))
    .join("\n");
}

export function AboutTemplate({ lang, path }: { lang: Lang; path: string }) {
  const C = COPY[lang];
  const nav = NAV[lang];
  const page = getLegacyPage(path);
  const source = page ?? getLegacyPage(ROUTES.tr.about);
  const logos = (source?.images ?? []).filter((i) => /logo/i.test(i.src));
  const storyHtml = lang === "tr" ? STORY_TR.map((p) => `<p>${p}</p>`).join("") : (STORY[lang] ?? legacyBody(page));
  const areas = [
    ...nav.serviceGroups,
    ...nav.singleServices.map((s) => ({ ...s, items: [] as { name: string; href: string }[] })),
  ];

  return (
    <div lang={lang}>
      {/* 1. Giriş: başlık, açıklama, rakamlar ve ekip fotoğrafı */}
      <section className="bg-white">
        <div className="container-wide grid gap-12 pt-32 pb-14 lg:grid-cols-12 lg:gap-10 lg:pt-44 lg:pb-16">
          <div className="lg:col-span-6">
            <h1 className="font-heading text-[30px] leading-[1.2] font-normal tracking-[-0.01em] text-balance text-wawa-charcoal sm:text-[40px] lg:text-[48px]">
              {C.title}
            </h1>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-wawa-charcoal lg:mt-8">{C.lead}</p>
            <dl className={`mt-10 grid grid-cols-2 border-t sm:grid-cols-4 lg:mt-12 ${LINE}`}>
              {STATS.map((s, i) => (
                <div key={s.value} className={`flex flex-col py-5 pr-4 ${i > 0 ? `sm:border-l sm:pl-5 ${LINE}` : ""} ${i % 2 === 1 ? `border-l pl-5 ${LINE}` : ""}`}>
                  <dt className="order-2 mt-3 text-[13px] text-wawa-charcoal/60">{s.label[lang]}</dt>
                  <dd className="order-1 font-heading text-[24px] leading-none text-wawa-charcoal lg:text-[28px]">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className={`flex flex-wrap gap-3 border-t pt-8 ${LINE}`}>
              <Link
                href={ROUTES[lang].contact}
                className="group inline-flex items-center gap-4 bg-wawa-accent px-7 py-4 text-[15px] font-medium text-wawa-charcoal transition-colors duration-300 hover:bg-wawa-charcoal hover:text-white"
              >
                {C.start}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href={ROUTES[lang].projects}
                className="group inline-flex items-center gap-4 border border-wawa-charcoal/25 px-7 py-4 text-[15px] text-wawa-charcoal transition-colors duration-300 hover:border-wawa-charcoal hover:bg-wawa-charcoal hover:text-white"
              >
                {C.projects}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="group relative aspect-[4/5] overflow-hidden bg-[#F3F2EF]">
              <Image
                src="/images/about/ekip.webp"
                alt="WAWA Interiors ekibi"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 bg-white px-5 py-4 sm:inset-x-6 sm:bottom-6">
                <div>
                  <p className="text-[16px] text-wawa-charcoal">{C.badge}</p>
                  <p className="mt-0.5 text-[13px] text-wawa-charcoal/60">{C.badgeText}</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center bg-wawa-accent text-wawa-charcoal">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hikâye */}
      {storyHtml && (
        <section className="bg-white">
          <div className={`container-wide border-t pt-14 pb-14 lg:pt-16 lg:pb-16 ${LINE}`}>
            <SectionHeader id="about-story" title={C.storyTitle} />
            <Prose html={storyHtml} className="mt-10 max-w-none gap-10 lg:mt-12 lg:columns-2 [&_p]:break-inside-avoid" />
          </div>
        </section>
      )}

      {/* 3. Kendi atölyemiz */}
      <section className="bg-white">
        <div className="container-wide pb-14 lg:pb-16">
          <div className="grid overflow-hidden bg-wawa-accent lg:grid-cols-12">
            <div className="p-8 sm:p-10 lg:col-span-7 lg:p-14">
              <h2 className="max-w-[20ch] font-heading text-[24px] leading-[1.25] font-normal text-balance text-wawa-charcoal lg:text-[34px]">{C.workshopTitle}</h2>
              <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-wawa-charcoal">{C.workshopText}</p>
              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                {C.values.map((v) => (
                  <li key={v} className="flex items-center gap-2.5 text-[15px] font-medium text-wawa-charcoal">
                    <span aria-hidden className="h-2 w-2 bg-wawa-charcoal" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[300px] lg:col-span-5">
              <Image src="/images/about/atolye.webp" alt="WAWA Interiors atölyesi, Zeytinburnu" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Hizmet alanları: menüdeki dört ana başlık ve alt hizmetleri */}
      <section className="bg-white">
        <div className={`container-wide border-t pt-14 pb-14 lg:pt-16 lg:pb-16 ${LINE}`}>
          <SectionHeader id="about-services" title={C.servicesTitle}>
            <SectionLead>{C.servicesLead}</SectionLead>
          </SectionHeader>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14">
            {areas.map((a) => (
              <div key={a.number} className="group/card flex flex-col border border-wawa-charcoal/15 p-6 transition-colors hover:border-wawa-charcoal sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center bg-wawa-accent text-[15px] font-medium tabular-nums text-wawa-charcoal">{a.number}</span>
                  <div className="min-w-0">
                    <Link href={a.href} className="group inline-flex items-center gap-2 text-[22px] tracking-tight text-wawa-charcoal">
                      <span className="underline decoration-transparent decoration-2 underline-offset-[6px] transition-[text-decoration-color] group-hover:decoration-wawa-accent">{a.title}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-wawa-charcoal/60" />
                    </Link>
                    <p className="mt-1 text-[15px] leading-relaxed text-wawa-charcoal/65">{a.description}</p>
                  </div>
                </div>
                {a.items.length > 0 && (
                  <ul className={`mt-6 border-t ${LINE}`}>
                    {a.items.map((it) => (
                      <li key={it.href} className={`border-b ${LINE}`}>
                        <Link href={it.href} className="group flex items-center justify-between gap-4 py-3 text-[16px] text-wawa-charcoal/80 transition-colors hover:text-wawa-charcoal">
                          <span className="flex items-center gap-3">
                            <span aria-hidden className="h-1.5 w-1.5 bg-wawa-charcoal/30 transition-colors group-hover:bg-wawa-accent" />
                            {it.name}
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Markalar: TR'de anasayfadaki akan logolar, diğer dillerde logo ızgarası */}
      {lang === "tr" ? (
        <div className={`border-t ${LINE}`}>
          <GlobalBrands />
        </div>
      ) : (
        logos.length > 0 && (
          <section className="bg-white">
            <div className={`container-wide border-t pt-12 pb-14 lg:pt-14 lg:pb-16 ${LINE}`}>
              <h2 className="font-heading text-[24px] font-normal text-wawa-charcoal lg:text-[30px]">{C.brands}</h2>
              <ul className="mt-10 grid grid-cols-2 border-t border-l border-wawa-charcoal/10 sm:grid-cols-3 lg:grid-cols-6">
                {logos.map((l) => (
                  <li key={l.src} className="flex h-24 items-center justify-center border-r border-b border-wawa-charcoal/10 px-6">
                    <Image src={l.src} alt={l.alt || ""} width={160} height={60} className="h-auto max-h-10 w-auto object-contain grayscale" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )
      )}
      <CtaBand lang={lang} />
    </div>
  );
}

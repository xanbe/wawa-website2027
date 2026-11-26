import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { getCategory, getLegacyPage, getProject, getService, projectCategory, projectsInCategory, type Project } from "@/lib/content";
import { landings, type Landing } from "@/content/landings";
import { extraPages } from "@/content/extra-pages";
import { standPages } from "@/content/stand-pages";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { SectionHeader, SectionLead } from "@/components/sections/SectionHeading";
import { LINE } from "./parts";
import { AiTeaser, BrandMarquee, FaqSplit, LeadHero, QuoteSection, ServiceTicker, TwoPaths, svcLang } from "./service-sections";
import { CountStats, FairTimeline, ProjectGrid, ProjectRail, VideoPlaylist } from "./ServiceClient";
import { TypeShowcase } from "./TypeShowcase";
import { IntroBento } from "./IntroBento";
import { StandHero } from "./StandHero";
import { HERO_VIDEO, VIDEOS } from "@/content/videos";
import { fairPicks, fairsLite } from "@/content/fairs-i18n";
import { INTERIOR_HUB, NAV, parentService } from "@/components/layout/navigation";
import { sectorPages } from "@/content/sector-pages";
import { FAQJsonLd } from "@/components/seo/JsonLd";

const STONE = "bg-[#F3F2EF]";

const VIEW = { tr: "İnceleyin", en: "View", de: "Ansehen" };
const VIDEO_T = {
  tr: { title: "Projelerimizden videolar", count: (n: number) => `${n} video` },
  en: { title: "Videos from our projects", count: (n: number) => `${n} videos` },
  de: { title: "Videos aus unseren Projekten", count: (n: number) => `${n} Videos` },
};
// Rakamlar WAWA'nın önceki sitesinden (hakkımızda sayfasıyla aynı)
const STATS = [
  { value: 67, suffix: "+", label: { tr: "Marka ortağı", en: "Brand partners", de: "Markenpartner" } },
  { value: 248, label: { tr: "Proje", en: "Projects", de: "Projekte" } },
  { value: 38, label: { tr: "Ülke ve şehir", en: "Countries & cities", de: "Länder & Städte" } },
  { value: 22680, unit: "m²", label: { tr: "Metrekare", en: "Square metres", de: "Quadratmeter" } },
];

// Eski sayfanın SEO metni: giriş paragrafları + her h2 bir akordeon maddesi. YouTube yer tutucuları
// metinden çıkarılır ve ayrı video bölümünde gösterilir. İçeriği boş kalan başlıklar atlanır.
const slug = (text: string) =>
  "b-" +
  text
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

function splitDetails(html: string) {
  const videoIds: string[] = [];
  const clean = html.replace(/<div data-youtube="([\w-]{11})"><\/div>/g, (_m, id: string) => {
    videoIds.push(id);
    return "";
  });
  const parts = clean.split(/<h2>([\s\S]*?)<\/h2>/);
  const items: { id: string; q: string; html: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const q = parts[i].replace(/<[^>]+>/g, "").trim();
    const body = (parts[i + 1] ?? "").trim();
    if (q && body.replace(/<[^>]+>/g, "").trim()) items.push({ id: slug(q), q, html: body });
  }
  return { intro: parts[0] ?? "", items, videoIds };
}

export function relatedProjects(lang: Lang, categories: string[] = [], paths: string[] = [], limit = 6): Project[] {
  const list: Project[] = [];
  const add = (p?: Project) => p && !list.some((x) => x.path === p.path) && list.push(p);
  for (const trPath of paths) {
    const tr = getProject(trPath);
    add(lang === "tr" ? tr : tr?.alternates[lang] ? getProject(tr.alternates[lang]!) : undefined);
  }
  const byCategory: Project[][] = [];
  for (const trPath of categories) {
    const tr = getCategory(trPath);
    const cat = lang === "tr" ? tr : tr?.alternates[lang] ? getCategory(tr.alternates[lang]!) : undefined;
    if (cat) byCategory.push(projectsInCategory(cat));
  }
  // Birden çok kategori varsa projeler sırayla alınır; tek kategoride sıra değişmez
  for (let i = 0; byCategory.some((c) => i < c.length); i++) byCategory.forEach((c) => add(c[i]));
  return list.slice(0, limit);
}

const MORE_PROJECTS: Record<string, string> = { tr: "Daha fazla görüntüle", en: "Show more", de: "Mehr anzeigen", it: "Mostra altri", fr: "Afficher plus" };

const TEXT = {
  tr: {
    offer: "Teklif alın",
    projects: "Projeleri inceleyin",
    ourProjects: "Projelerimizden",
    details: "Detaylı bilgi",
    contents: "İçindekiler",
    formTitle: "Projenizi anlatın.",
    formLead: "Fuar, mekân ya da proje bilgilerinizi paylaşın; kapsamı netleştirip size teklifle dönelim.",
    reach: "Yurt içi ve yurt dışı",
  },
  en: {
    offer: "Get an offer",
    projects: "See projects",
    ourProjects: "From our projects",
    details: "In detail",
    contents: "Contents",
    formTitle: "Tell us about your project.",
    formLead: "Share your fair, space or project details; we will clarify the scope and come back with an offer.",
    reach: "At home and abroad",
  },
  de: {
    offer: "Angebot erhalten",
    projects: "Projekte ansehen",
    ourProjects: "Aus unseren Projekten",
    details: "Im Detail",
    contents: "Inhalt",
    formTitle: "Erzählen Sie uns von Ihrem Projekt.",
    formLead: "Teilen Sie Messe-, Raum- oder Projektdaten mit; wir klären den Umfang und senden Ihnen ein Angebot.",
    reach: "Im In- und Ausland",
  },
  it: {
    offer: "Richiedi un preventivo",
    projects: "Vedi i progetti",
    ourProjects: "Dai nostri progetti",
    details: "Nel dettaglio",
    contents: "Indice",
    formTitle: "Raccontaci il tuo progetto.",
    formLead: "Condividi i dati della fiera, dello spazio o del progetto; definiamo il perimetro e ti inviamo un preventivo.",
    reach: "In Turchia e all'estero",
  },
  fr: {
    offer: "Demander un devis",
    projects: "Voir les projets",
    ourProjects: "Nos projets",
    details: "En détail",
    contents: "Sommaire",
    formTitle: "Parlez-nous de votre projet.",
    formLead: "Partagez les informations du salon, de l'espace ou du projet ; nous précisons le périmètre et vous envoyons un devis.",
    reach: "En Turquie et à l'international",
  },
} as const;

export type LandingProps = {
  lang: Lang;
  path: string;
  title: string; // h1 (eski sayfadaki anahtar kelimeli başlık)
  lead: string;
  heroImages: string[];
  breadcrumb: { label: string; href: string };
  landing?: Landing;
  projects: Project[];
  projectsHref?: string;
  detailsHtml?: string;
  faq?: { q: string; a: string }[];
};

// Sayfanın kardeşleri: menüdeki aynı gruptaki hizmetler, sektör sayfaları ya da dört ana hizmet alanı
function siblings(lang: Lang, path: string): { kind: "group" | "sector" | "areas"; items: { name: string; href: string }[] } {
  const nav = NAV[lang];
  const parent = parentService(lang, path)?.href;
  const group = nav.serviceGroups.find((g) => g.href === path || g.items.some((i) => i.href === path || i.href === parent));
  // Grup hizmetleri, alt hizmetleri (sektör sayfaları) üst hizmetin hemen altında olacak şekilde
  // Grubun ana sayfasında (ör. İç Mimarlık) yalnızca ana türler listelenir; alt sektör sayfaları kendi üst hizmetinde görünür
  if (group && group.href === path) return { kind: "group", items: group.items };
  // Alt sektör sayfaları (kuyumcu, eczane vb.) listeye girmez; her sayfada menüdeki ana başlıklar görünür
  if (group) return { kind: "group", items: group.items };
  const sector = sectorPages.find((p) => p.path === path);
  if (sector) return { kind: "sector", items: sectorPages.filter((p) => p.lang === lang).map((p) => ({ name: p.title, href: p.path })) };
  return {
    kind: "areas",
    items: [...nav.serviceGroups.map((g) => ({ name: g.title, href: g.href })), ...nav.singleServices.map((g) => ({ name: g.title, href: g.href }))],
  };
}

const TYPES_TITLE = {
  group: { tr: "Proje türleri", en: "Project types", de: "Projektarten", it: "Tipologie di progetto", fr: "Types de projets" },
  sector: { tr: "Sektörel iç mimari", en: "By sector", de: "Nach Branche", it: "Per settore", fr: "Par secteur" },
  areas: { tr: "Hizmet alanlarımız", en: "What we do", de: "Was wir tun", it: "Cosa facciamo", fr: "Nos services" },
};
const SERVICES_TITLE = { tr: "Hizmet kapsamı", en: "What is included", de: "Leistungsumfang", it: "Cosa comprende", fr: "Ce qui est inclus" };

// Tür vitrini için her sayfanın görseli: açılış tanımı, hizmet kapağı, yeni sayfa görseli ya da eski sayfanın ilk görseli
function pageImage(path: string): string | null {
  return (
    landings[path]?.heroImages[0] ??
    getService(path)?.featuredImage ??
    [...extraPages, ...sectorPages, ...standPages].find((x) => x.path === path)?.image ??
    getLegacyPage(path)?.images.find((i) => !/logo/i.test(i.src))?.src ??
    null
  );
}
// Hizmetler ana sayfası gibi görseli olmayan adresler için: gruptaki ilk sayfanın görseli
function typeItems(lang: Lang, path: string) {
  const nav = NAV[lang];
  const { kind, items } = siblings(lang, path);
  return {
    kind,
    items: items.map((it) => ({
      name: it.name,
      href: it.href,
      current: it.href === path,
      image: pageImage(it.href) ?? pageImage(nav.serviceGroups.find((g) => g.href === it.href)?.items[0]?.href ?? ""),
    })),
  };
}

// Hizmet ve sektör sayfalarının ortak kurgusu (wawa fuar sitesinin bölüm sırası, WAWA teması ile):
// açılış, markalar, proje türleri, tanıtım, projeler, rakamlar, iki yol, kapsam, süreç, yapay zeka, fuarlar, detay ve SSS, teklif
export function LandingTemplate(props: LandingProps) {
  const { lang, path, title, lead, heroImages, breadcrumb, landing, projectsHref, detailsHtml, faq = [] } = props;
  // Görseller ve kayan şerit ilk 6 projeyi kullanır; stand sayfalarındaki ızgara tüm listeyi (24'e kadar) gösterir
  const allProjects = props.projects;
  const projects = allProjects.slice(0, 6);
  const T = TEXT[lang];
  const D = t(lang);
  const details = splitDetails(detailsHtml ?? "");
  let section = 0;
  const no = () => String(++section).padStart(2, "0");

  // Görseller: sayfanın kendi görselleri, ardından ilgili projelerin kapak görselleri
  const images: { src: string; alt: string }[] = [];
  const addImage = (src: string | null, alt: string) => {
    if (src && !images.some((x) => x.src === src)) images.push({ src, alt });
  };
  heroImages.forEach((src) => addImage(src, title));
  projects.forEach((p) => addImage(p.featuredImage, p.title));
  const k = svcLang(lang);
  const isStand = NAV[lang].serviceGroups[1]?.items.some((i) => i.href === path) ?? false;
  // İç mimarlık ana sayfası ve alt sayfaları (Konut, Mağaza, Klinik, Cafe, Ofis ve sektör sayfaları) fuar standı
  // sayfasının kurgusunu kullanır: fotoğraflı açılış, hızlı teklif, proje ızgarası
  const interiorItems = NAV[lang].serviceGroups[0]?.items ?? [];
  const parentHref = parentService(lang, path)?.href;
  const spaceIndex = interiorItems.findIndex((i) => i.href === path || i.href === parentHref);
  const isInterior = path === INTERIOR_HUB || spaceIndex >= 0;
  const hub = isStand || isInterior;
  const types = typeItems(lang, path);
  // Tanıtım mozaiği: açılıştaki kapak görselinden farklı görseller
  const introImages = [...images.slice(1), ...images.slice(0, 1)].slice(0, 2);
  const videos = isStand
    ? [...VIDEOS].sort((x, y) => Number(details.videoIds.includes(y.id)) - Number(details.videoIds.includes(x.id)))
    : VIDEOS.filter((v) => details.videoIds.includes(v.id));
  const rail = (hub ? allProjects : projects)
    .filter((p) => p.featuredImage)
    .map((p) => ({ href: p.path, src: p.featuredImage!, title: p.title, kicker: projectCategory(p)?.name ?? null, meta: p.meta?.["Marka"] ?? null }));

  return (
    <div lang={lang}>
      {/* 1. Açılış: stand sayfalarında video ve aşamalı hızlı teklif; diğerlerinde kayan bulanık görseller */}
      {isStand ? (
        <StandHero
          lang={lang}
          title={title}
          lead={lead}
          breadcrumb={breadcrumb}
          videoId={landing?.heroVideo ?? HERO_VIDEO}
          poster={images[0]?.src}
          fairs={fairPicks(lang)}
          hasProjects={rail.length > 0}
        />
      ) : isInterior ? (
        <StandHero
          lang={lang}
          title={title}
          lead={lead}
          breadcrumb={breadcrumb}
          images={images.slice(0, 5).map((i) => i.src)}
          variant="interior"
          space={spaceIndex}
          hasProjects={rail.length > 0}
        />
      ) : (
        <LeadHero lang={lang} title={title} lead={lead} breadcrumb={breadcrumb} images={images.slice(0, 6).map((i) => i.src)} hasProjects={rail.length > 0} />
      )}

      <ServiceTicker items={siblings(lang, path).items.map((i) => i.name)} />

      {/* 2. Markalar */}
      <BrandMarquee lang={lang} stand={isStand} />

      {/* 3. Türler: büyük adlar ve ada göre değişen görsel */}
      <TypeShowcase title={TYPES_TITLE[types.kind][lang]} items={types.items} viewLabel={VIEW[k]} />

      {/* 4. Tanıtım: metin, fotoğraf ve dört ana başlıktan oluşan mozaik */}
      {landing && <IntroBento images={introImages} title={landing.intro.title} text={landing.intro.text} items={landing.highlights} offer={T.offer} />}

      {/* 5. Projeler: yatay kayan kartlar */}
      {rail.length > 0 &&
        (hub ? (
          <ProjectGrid title={T.ourProjects} items={rail} allLabel={D.cta.allProjects} allHref={projectsHref} moreLabel={MORE_PROJECTS[lang] ?? MORE_PROJECTS.en} />
        ) : (
          <ProjectRail title={T.ourProjects} items={rail} allLabel={D.cta.allProjects} allHref={projectsHref} />
        ))}

      {/* 6. Rakamlar ve yurt dışı (küre, TR) */}
      <CountStats lang={k} stats={STATS.map((st) => ({ ...st, label: st.label[k] }))} />
      {landing?.showReach && lang === "tr" && <GlobalReach />}

      {/* 7. İki yol */}
      <TwoPaths lang={lang} stand={isStand} images={images.slice(1).map((i) => i.src)} />

      {/* 5. Hizmet kapsamı */}
      {!isStand && landing?.offerings && (
        <section className={STONE}>
          <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
            <SectionHeader id={`l-${no()}`} title={landing.offeringsTitle ?? SERVICES_TITLE[lang]} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
              {landing.offerings.map((o, i) => {
                const inner = (
                  <>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#E9E8E4]">
                      <Image src={o.image} alt={o.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    </div>
                    <div className="p-6">
                      <span className="grid h-9 w-9 place-items-center bg-wawa-accent text-[13px] font-medium tabular-nums text-wawa-charcoal">{String(i + 1).padStart(2, "0")}</span>
                      <p className="mt-5 flex items-center justify-between gap-3 text-[18px] tracking-tight text-wawa-charcoal">
                        {o.title}
                        {o.href && <ArrowUpRight className="h-4 w-4 shrink-0 text-wawa-charcoal/60" />}
                      </p>
                      <p className="mt-2 text-[15px] leading-relaxed text-wawa-charcoal/70">{o.text}</p>
                    </div>
                  </>
                );
                const cls = "group block bg-white outline outline-1 -outline-offset-1 outline-transparent transition-[outline-color] hover:outline-wawa-charcoal";
                return o.href ? (
                  <Link key={o.title} href={o.href} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <div key={o.title} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5b. Hizmet kapsamı (görselsiz kartlar) */}
      {landing?.scope && !landing.offerings && (
        <section className={STONE}>
          <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
            <SectionHeader id={`l-${no()}`} title={SERVICES_TITLE[lang]} />
            <div className="mt-10 grid gap-6 md:grid-cols-3 lg:mt-14">
              {landing.scope.map((c, i) => (
                <div key={c.title} className="bg-white p-6 outline outline-1 -outline-offset-1 outline-transparent transition-[outline-color] hover:outline-wawa-charcoal sm:p-8">
                  <span className="grid h-9 w-9 place-items-center bg-wawa-accent text-[13px] font-medium tabular-nums text-wawa-charcoal">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-6 text-[20px] tracking-tight text-wawa-charcoal">{c.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-wawa-charcoal/70">{c.text}</p>
                  <ul className={`mt-6 border-t ${LINE}`}>
                    {c.features.map((f) => (
                      <li key={f} className={`flex items-center gap-3 border-b py-3 text-[15px] text-wawa-charcoal ${LINE}`}>
                        <Check className="h-4 w-4 shrink-0 text-wawa-charcoal/60" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Süreç */}
      {landing && landing.process.length > 0 && (
        <section className={landing.offerings || landing.scope ? "bg-white" : STONE}>
          <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
            <SectionHeader id={`l-${no()}`} title={landing.processTitle ?? (lang === "tr" ? "Süreç nasıl ilerler?" : lang === "de" ? "So läuft es ab" : "How it works")} />
            <ol className={`mt-10 grid border-t sm:grid-cols-2 lg:mt-14 ${landing.process.length > 5 ? "lg:grid-cols-3" : "lg:grid-cols-5"} ${LINE}`}>
              {landing.process.map((s, i) => (
                <li key={s.title} className={`border-b py-6 pr-6 ${LINE}`}>
                  <span className="text-[13px] tabular-nums text-wawa-charcoal/50">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2 text-[18px] tracking-tight text-wawa-charcoal">{s.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-wawa-charcoal/70">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 7. Ek bilgi blokları (sektörler, maliyet etkenleri vb.) */}
      {landing?.blocks?.map((b) => (
        <section key={b.title} className="bg-white">
          <div className={`container-wide border-t pt-14 pb-14 lg:pt-16 lg:pb-16 ${LINE}`}>
            <SectionHeader id={`l-${no()}`} title={b.title}>
              {b.lead && <SectionLead>{b.lead}</SectionLead>}
            </SectionHeader>
            <ul className={`mt-10 grid border-t border-l sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 ${LINE}`}>
              {b.items.map((it) => (
                <li key={it.title} className={`border-r border-b p-6 ${LINE}`}>
                  <span aria-hidden className="block h-2 w-2 bg-wawa-accent outline outline-1 outline-wawa-charcoal" />
                  <p className="mt-4 text-[17px] tracking-tight text-wawa-charcoal">{it.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-wawa-charcoal/70">{it.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* 7b. Videolar */}
      {videos.length > 0 && <VideoPlaylist title={VIDEO_T[k].title} count={VIDEO_T[k].count(videos.length)} videos={videos} />}

      {/* 8. Yapay zeka */}
      <AiTeaser lang={lang} stand={isStand} />

      {/* 9. Yaklaşan fuarlar (stand sayfaları) */}
      {isStand && <FairTimeline lang={k} fairs={fairsLite(lang)} />}

      {/* 10. Merak edilenler: eski SEO metni ve SSS tek akordeonda */}
      <FaqSplit
        lang={lang}
        intro={details.intro}
        hasDetails={details.items.length > 0}
        image={(images[2] ?? images[0])?.src}
        items={[...details.items, ...faq.map((f, i) => ({ id: `sss-${i + 1}`, q: f.q, html: `<p>${f.a}</p>` }))]}
      />
      {/* Soru biçimindeki SSS maddeleri arama motorlarına FAQPage olarak da verilir (eski sitedeki SSS'ler) */}
      {faq.some((f) => f.q.trim().endsWith("?")) && (
        <FAQJsonLd faqs={faq.filter((f) => f.q.trim().endsWith("?")).map((f) => ({ question: f.q, answer: f.a }))} />
      )}

      {/* 11. Teklif: koyu form */}
      <QuoteSection lang={lang} stand={isStand} />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { t, ROUTES, contentLang, type Lang } from "@/lib/i18n";
import { excerpt, getCategory, getService, servicesIn, type Service } from "@/lib/content";
import { landings } from "@/content/landings";
import { extraPages } from "@/content/extra-pages";
import { sectorPages } from "@/content/sector-pages";
import { standPages } from "@/content/stand-pages";
import { LandingTemplate, relatedProjects } from "./landing";
import { CtaBand, LINE, PageIntro } from "./parts";

// TR hizmet adresleri → grup ve ilgili proje kategorisi (EN/DE hizmetleri TR karşılığı üzerinden eşlenir)
const SERVICE_INFO: Record<string, { group: "interior" | "stand"; category?: string; order: number }> = {
  "/konut-villa-tasarim/": { group: "interior", category: "/portfolio-category/konut-villa/", order: 1 },
  "/service/magaza-tasarimi/": { group: "interior", category: "/portfolio-category/magaza-tasarim/", order: 2 },
  "/service/klinik-tasarimi/": { group: "interior", category: "/portfolio-category/klinik-tasarim/", order: 3 },
  "/cafe-dekorasyon/": { group: "interior", category: "/portfolio-category/cafe-restoran-tasarim/", order: 4 },
  "/ofis-tasarimi-ve-uygulama/": { group: "interior", category: "/portfolio-category/ofis-tasarimi/", order: 5 },
  "/fuar-standi/": { group: "stand", category: "/portfolio-category/fuar-stand-tasarimi/", order: 6 },
  "/service/kongre-stand-tasarimi/": { group: "stand", category: "/portfolio-category/fuar-stand-tasarimi/", order: 7 },
  "/de/service/maxima-stand/": { group: "stand", category: "/portfolio-category/maxima-stand/", order: 8 },
};

function trKey(s: Service) {
  if (SERVICE_INFO[s.path]) return s.path;
  const tr = s.alternates.tr;
  if (tr && SERVICE_INFO[tr]) return tr;
  const de = s.alternates.de;
  if (de && SERVICE_INFO[de]) return de;
  return null;
}

// IT ve FR'de hizmet sayfaları İngilizcedir; listelerde adları bu dillerde gösterilir
const SERVICE_TITLES: Record<string, Partial<Record<Lang, string>>> = {
  "/en/service/housing-villa-design/": { it: "Progettazione residenze e ville", fr: "Conception de logements et villas" },
  "/en/service/store-design-and-implementation/": { it: "Progettazione negozi", fr: "Conception de boutiques" },
  "/en/service/clinic-design-and-implementation/": { it: "Progettazione cliniche", fr: "Conception de cliniques" },
  "/en/service/cafe-restaurant-design-and-implementation/": { it: "Progettazione caffè e ristoranti", fr: "Conception de cafés et restaurants" },
  "/en/service/office-design-and-implementation/": { it: "Progettazione uffici", fr: "Conception de bureaux" },
  "/en/service/expo-design/": { it: "Stand fieristici", fr: "Stands d'exposition" },
  "/en/service/congress-stand-design/": { it: "Stand per congressi", fr: "Stands de congrès" },
  "/en/service/maxima-stand/": { it: "Stand modulare Maxima", fr: "Stand modulaire Maxima" },
};
export const serviceTitle = (path: string, lang: Lang) => SERVICE_TITLES[path]?.[lang];

export const serviceInfo = (s: Service) => {
  const k = trKey(s);
  return k ? SERVICE_INFO[k] : null;
};

const GROUP_NAMES = {
  tr: { interior: "İç Mimarlık", stand: "Fuar Standı", build: "İnşaat ve üretim", sector: "Sektörler" },
  en: { interior: "Interior Architecture", stand: "Exhibition Stands", build: "Construction & production", sector: "Sectors" },
  de: { interior: "Innenarchitektur", stand: "Messestände", build: "Bau & Produktion", sector: "Branchen" },
  it: { interior: "Architettura d'interni", stand: "Stand fieristici", build: "Costruzione e produzione", sector: "Settori" },
  fr: { interior: "Architecture intérieure", stand: "Stands d'exposition", build: "Construction et production", sector: "Secteurs" },
};

const INTRO = {
  tr: { title: "Neler yapıyoruz?", lead: "Konut, ticari mekân ve fuar standı projelerinde tasarımdan teslime tek ekip." },
  en: { title: "What we do", lead: "One team from design to handover for residential, commercial and exhibition stand projects." },
  de: { title: "Was wir tun", lead: "Ein Team von der Planung bis zur Übergabe für Wohn-, Gewerbe- und Messestandprojekte." },
  it: { title: "Cosa facciamo", lead: "Un unico team dal progetto alla consegna per residenze, spazi commerciali e stand fieristici." },
  fr: { title: "Nos services", lead: "Une seule équipe, de la conception à la livraison, pour l'habitat, les espaces commerciaux et les stands." },
};

export function ServicesIndexTemplate({ lang }: { lang: Lang }) {
  const src = contentLang(lang);
  const list = servicesIn(src)
    .filter((s) => serviceInfo(s))
    .sort((a, b) => serviceInfo(a)!.order - serviceInfo(b)!.order);
  const BUILD_TITLES: Record<string, Partial<Record<Lang, string>>> = {
    "/en/construction-contracting/": { it: "Costruzione", fr: "Construction" },
    "/en/furniture-production/": { it: "Arredi su misura", fr: "Mobilier sur mesure" },
  };
  // TR'de Maxima Stand hizmeti eski sitede ayrı bir sayfadaydı
  const maximaTr = lang === "tr" ? { path: "/maxima-stand/", title: "Maxima Stand", featuredImage: getService("/de/service/maxima-stand/")?.featuredImage ?? null } : null;
  const groups = [
    ...(["interior", "stand"] as const).map((g) => ({
      key: g,
      name: GROUP_NAMES[lang][g],
      items: [
        ...list.filter((s) => serviceInfo(s)!.group === g).map((s) => ({ path: s.path, title: serviceTitle(s.path, lang) ?? s.title, featuredImage: s.featuredImage })),
        ...(g === "stand" && maximaTr ? [maximaTr] : []),
        ...(g === "stand" ? standPages.filter((p) => p.lang === lang).map((p) => ({ path: p.path, title: p.title, featuredImage: p.image })) : []),
      ],
    })),
    // Yeni hizmetler (inşaat, mobilya) ve sektör sayfaları
    {
      key: "build",
      name: GROUP_NAMES[lang].build,
      items: extraPages.filter((p) => p.lang === src).map((p) => ({ path: p.path, title: BUILD_TITLES[p.path]?.[lang] ?? p.title, featuredImage: p.image })),
    },
    {
      key: "sector",
      name: GROUP_NAMES[lang].sector,
      items: sectorPages.filter((p) => p.lang === lang).map((p) => ({ path: p.path, title: p.title, featuredImage: p.image })),
    },
  ].filter((g) => g.items.length > 0);
  const intro = INTRO[lang];
  return (
    <>
      <PageIntro lang={lang} title={intro.title} lead={intro.lead} />
      <section className="bg-white" lang={lang}>
        <div className="container-wide pb-14 lg:pb-16">
          {groups.map((g) => (
            <div key={g.key} className={`border-t pt-10 pb-12 lg:pt-12 ${LINE}`}>
              <h2 className="font-heading text-[22px] font-normal text-wawa-charcoal lg:text-[28px]">{g.name}</h2>
              <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((s) => (
                  <Link key={s.path} href={s.path} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F3F2EF]">
                      {s.featuredImage && (
                        <Image
                          src={s.featuredImage}
                          alt={s.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <h3 className="text-[19px] tracking-tight text-wawa-charcoal">{s.title}</h3>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-wawa-charcoal/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <CtaBand lang={lang} />
    </>
  );
}

// Hizmet sayfası: ayrı bir sitenin açılışı kadar detaylı kurgu (landing.tsx). Eski SEO metni "Detaylı bilgi"de korunur.
export function ServiceTemplate({ service, landingKey }: { service: Service; landingKey?: string }) {
  const lang = service.lang;
  const info = serviceInfo(service);
  const landing = landings[landingKey ?? service.path];
  const details = service.html
    .split("\n")
    .filter((l) => !l.startsWith("<img"))
    .join("\n");
  const firstParagraph = excerpt(details, 220);
  const heroImages = landing?.heroImages ?? [service.featuredImage, ...service.images.map((i) => i.src)].filter((x): x is string => Boolean(x)).slice(0, 4);
  const categories = landing?.projectCategories ?? (info?.category ? [info.category] : []);
  const trCat = categories[0] ? getCategory(categories[0]) : undefined;
  const cat = trCat && (lang === "tr" ? trCat : trCat.alternates[lang] ? getCategory(trCat.alternates[lang]!) : undefined);
  return (
    <LandingTemplate
      lang={lang}
      path={service.path}
      title={landing?.h1 ?? service.title}
      lead={landing?.lead ?? firstParagraph}
      heroImages={[...new Set(heroImages)]}
      breadcrumb={{ label: t(lang).nav.services, href: ROUTES[lang].services }}
      landing={landing}
      projects={relatedProjects(lang, categories, landing?.projectPaths, 27)}
      projectsHref={cat?.path ?? ROUTES[lang].projects}
      detailsHtml={details}
      faq={service.faq}
    />
  );
}

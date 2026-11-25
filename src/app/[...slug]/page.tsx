import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ROUTES, OG_LOCALE, t, type Lang } from "@/lib/i18n";
import { allPaths, canonicalOf, resolve, type Resolved } from "@/lib/routes";
import { excerpt, getLegacyPage, type Seo } from "@/lib/content";
import { BlogListTemplate, PostTemplate } from "@/components/templates/blog";
import { ProjectListTemplate, ProjectTemplate } from "@/components/templates/projects";
import { ServiceTemplate, ServicesIndexTemplate } from "@/components/templates/services";
import { AboutTemplate } from "@/components/templates/about";
import { ContactTemplate, ContentPageTemplate, LocalizedHome, OfferTemplate } from "@/components/templates/pages";
import { SetAlternates } from "@/components/layout/alternates";
import { ExtraServiceTemplate } from "@/components/templates/extra";
import { extraAlternates } from "@/content/extra-pages";
import { LegalTemplate } from "@/components/templates/legal";

// Tüm adresler derlemede üretilir; listede olmayan adres 404 olur
export const dynamicParams = false;

export function generateStaticParams() {
  return allPaths().map((p) => ({ slug: p.split("/").filter(Boolean).map(decodeURIComponent) }));
}

const decoded = (slug: string[]) => `/${slug.map((s) => decodeURIComponent(s)).join("/")}/`;

function langOf(r: Resolved): Lang {
  switch (r.type) {
    case "post":
      return r.post.lang;
    case "project":
      return r.project.lang;
    case "service":
      return r.service.lang;
    case "page":
    case "extra":
    case "legal":
      return r.page.lang;
    default:
      return r.lang;
  }
}

function alternatesOf(r: Resolved, path: string): Partial<Record<Lang, string>> {
  switch (r.type) {
    case "post":
      return r.post.alternates;
    case "project":
      return r.project.alternates;
    case "service":
      return r.service.alternates;
    case "page":
      return r.page.alternates;
    case "extra":
      return extraAlternates(r.page);
    case "legal":
      return r.page.alternates;
    case "projectCategory":
      return r.page === 1 ? r.category.alternates : {};
    case "home":
      return { tr: ROUTES.tr.home, en: ROUTES.en.home, de: ROUTES.de.home, it: ROUTES.it.home, fr: ROUTES.fr.home };
    case "about":
    case "contact":
    case "offer":
    case "services":
    case "projects":
    case "blog": {
      if ((r.type === "projects" || r.type === "blog") && r.page > 1) return {};
      if (r.type === "blog" && path !== ROUTES[r.lang].blog) return {};
      const key = r.type === "blog" ? "blog" : r.type;
      const base = { tr: ROUTES.tr[key], en: ROUTES.en[key], de: ROUTES.de[key] };
      // IT/FR blogu İngilizce bloga gider; ayrı dil sürümü sayılmaz
      return key === "blog" ? base : { ...base, it: ROUTES.it[key], fr: ROUTES.fr[key] };
    }
  }
}

function seoOf(r: Resolved, path: string): Seo | null {
  switch (r.type) {
    case "post":
      return r.post.seo;
    case "project":
      return r.project.seo;
    case "service":
      return r.service.seo;
    case "page":
      return r.page.seo;
    case "extra":
      return { title: r.page.title, fullTitle: r.page.seo.title, description: r.page.seo.description, ogImage: r.page.image };
    case "legal":
      return { title: r.page.title, fullTitle: r.page.seo.title, description: r.page.seo.description, ogImage: null };
    case "projectCategory":
      return r.category.seo;
    default:
      return getLegacyPage(r.type === "home" ? ROUTES[r.lang].home : path)?.seo ?? null;
  }
}

// Eski sitede açıklaması olmayan sayfalar (proje, proje kategorisi, sayfalı listeler, IT/FR sayfaları) için açıklama:
// önce sayfanın kendi metninden özet, yoksa sayfa türüne göre kısa bir cümle. WordPress'ten kalan kısa kod (ör. {"cpt":"blog"…}) açıklama sayılmaz.
const FALLBACK_DESC: Record<string, Record<Lang, string>> = {
  home: { tr: "", en: "Interior architecture and exhibition stand design, production and installation from Istanbul — turnkey projects in Türkiye and abroad.", de: "Innenarchitektur sowie Messestand-Design, Produktion und Aufbau aus Istanbul — schlüsselfertige Projekte in der Türkei und im Ausland.", it: "Architettura d'interni e stand fieristici da Istanbul: progettazione, produzione e allestimento chiavi in mano, in Turchia e all'estero.", fr: "Architecture intérieure et stands d'exposition depuis Istanbul : conception, fabrication et montage clés en main, en Turquie et à l'étranger." },
  projects: { tr: "Wawa Interiors projeleri: iç mimarlık ve fuar standı tasarım ve uygulama örnekleri.", en: "Wawa Interiors projects: interior architecture and exhibition stand design and build examples.", de: "Projekte von Wawa Interiors: Beispiele für Innenarchitektur und Messestände, geplant und umgesetzt.", it: "Progetti di Wawa Interiors: esempi di architettura d'interni e stand fieristici, progettati e realizzati.", fr: "Projets de Wawa Interiors : exemples d'architecture intérieure et de stands d'exposition, conçus et réalisés." },
  blog: { tr: "Wawa Interiors blogu: iç mimarlık, fuar standı, malzeme ve proje süreçleri üzerine rehber yazılar.", en: "Wawa Interiors blog: guides on interior architecture, exhibition stands, materials and project processes.", de: "Wawa Interiors Blog: Ratgeber zu Innenarchitektur, Messeständen, Materialien und Projektabläufen.", it: "Blog di Wawa Interiors: guide su architettura d'interni, stand fieristici e processi di progetto.", fr: "Blog de Wawa Interiors : guides sur l'architecture intérieure, les stands d'exposition et les projets." },
  services: { tr: "Wawa Interiors hizmetleri: iç mimarlık, fuar standı, inşaat taahhüt ve mobilya üretimi tek ekipte.", en: "Wawa Interiors services: interior architecture, exhibition stands, construction and furniture production in one team.", de: "Leistungen von Wawa Interiors: Innenarchitektur, Messestände, Bauausführung und Möbelproduktion aus einer Hand.", it: "Servizi di Wawa Interiors: architettura d'interni, stand fieristici, costruzione e produzione di arredi in un unico team.", fr: "Services de Wawa Interiors : architecture intérieure, stands d'exposition, construction et fabrication de mobilier." },
  about: { tr: "Wawa Interiors hakkında: İstanbul merkezli iç mimarlık ve fuar standı ekibi; tasarım, üretim ve uygulama aynı çatı altında.", en: "About Wawa Interiors: an Istanbul-based interior architecture and exhibition stand team — design, production and installation under one roof.", de: "Über Wawa Interiors: Innenarchitektur- und Messebau-Team aus Istanbul — Design, Produktion und Aufbau unter einem Dach.", it: "Chi siamo: team di Istanbul per architettura d'interni e stand fieristici — progettazione, produzione e allestimento.", fr: "À propos de Wawa Interiors : équipe d'architecture intérieure et de stands basée à Istanbul — conception, fabrication et montage." },
  contact: { tr: "Wawa Interiors iletişim: İstanbul Zeytinburnu ofisimiz, telefon ve e-posta; projenizi konuşalım.", en: "Contact Wawa Interiors: our office in Zeytinburnu, Istanbul, phone and e-mail — let's talk about your project.", de: "Kontakt zu Wawa Interiors: unser Büro in Zeytinburnu, Istanbul, Telefon und E-Mail.", it: "Contatti Wawa Interiors: il nostro ufficio a Zeytinburnu, Istanbul, telefono ed e-mail.", fr: "Contacter Wawa Interiors : notre bureau à Zeytinburnu, Istanbul, téléphone et e-mail." },
  offer: { tr: "İç mimarlık ya da fuar standı projeniz için Wawa Interiors'tan teklif alın.", en: "Request a quote from Wawa Interiors for your interior or exhibition stand project.", de: "Fordern Sie ein Angebot von Wawa Interiors für Ihr Innenarchitektur- oder Messestandprojekt an.", it: "Richiedi un preventivo a Wawa Interiors per il tuo progetto d'interni o stand fieristico.", fr: "Demandez un devis à Wawa Interiors pour votre projet d'intérieur ou de stand." },
};
const CATEGORY_DESC: Record<Lang, (name: string) => string> = {
  tr: (n) => `${n}: Wawa Interiors'ın tasarlayıp uyguladığı projeler.`,
  en: (n) => `${n}: projects designed and built by Wawa Interiors.`,
  de: (n) => `${n}: von Wawa Interiors geplante und umgesetzte Projekte.`,
  it: (n) => `${n}: progetti ideati e realizzati da Wawa Interiors.`,
  fr: (n) => `${n} : projets conçus et réalisés par Wawa Interiors.`,
};
function descriptionOf(r: Resolved, seo: Seo | null, lang: Lang): string | undefined {
  const own = seo?.description?.trim();
  if (own && !own.startsWith("{")) return own;
  const fromHtml =
    r.type === "post" ? excerpt(r.post.html, 155) : r.type === "project" ? excerpt(r.project.html, 155) : r.type === "page" ? excerpt(r.page.html, 155) : "";
  if (fromHtml.length > 60) return fromHtml;
  if (r.type === "project") return CATEGORY_DESC[lang](r.project.title);
  if (r.type === "projectCategory") return CATEGORY_DESC[lang](r.category.name);
  return FALLBACK_DESC[r.type]?.[lang] || undefined;
}

const FALLBACK_TITLE: Record<string, Record<Lang, string>> = {
  home: { tr: "WAWA Interiors", en: "Interior Architecture & Exhibition Stands | WAWA Interiors", de: "Innenarchitektur & Messestände | WAWA Interiors", it: "Architettura d'interni e stand fieristici | WAWA Interiors", fr: "Architecture intérieure et stands d'exposition | WAWA Interiors" },
  projects: { tr: "Projelerimiz | WAWA Interiors", en: "Our Projects | WAWA Interiors", de: "Unsere Projekte | WAWA Interiors", it: "Progetti | WAWA Interiors", fr: "Nos projets | WAWA Interiors" },
  blog: { tr: "Blog | WAWA Interiors", en: "Blog | WAWA Interiors", de: "Blog | WAWA Interiors", it: "Blog | WAWA Interiors", fr: "Blog | WAWA Interiors" },
  services: { tr: "Hizmetler | WAWA Interiors", en: "What We Do | WAWA Interiors", de: "Was wir tun | WAWA Interiors", it: "Cosa facciamo | WAWA Interiors", fr: "Nos services | WAWA Interiors" },
  about: { tr: "Hakkımızda | WAWA Interiors", en: "About Us | WAWA Interiors", de: "Über uns | WAWA Interiors", it: "Chi siamo | WAWA Interiors", fr: "À propos | WAWA Interiors" },
  contact: { tr: "İletişim | WAWA Interiors", en: "Contact | WAWA Interiors", de: "Kontakt | WAWA Interiors", it: "Contatti | WAWA Interiors", fr: "Contact | WAWA Interiors" },
  offer: { tr: "Teklif Al | WAWA Interiors", en: "Get a Quote | WAWA Interiors", de: "Angebot anfordern | WAWA Interiors", it: "Richiedi un preventivo | WAWA Interiors", fr: "Demande de devis | WAWA Interiors" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = decoded(slug);
  const r = resolve(path);
  if (!r) return {};
  const lang = langOf(r);
  const seo = seoOf(r, path);
  const pageNo = "page" in r && typeof r.page === "number" && r.page > 1 ? ` – ${t(lang).labels.page} ${r.page}` : "";
  // EN/DE anasayfalarının eski başlığı ("Homepage - İç Mimar …") karışıktı; onlar için yeni başlık kullanılır
  const title =
    (seo?.fullTitle && r.type !== "home" && !/^(Blog|Portfolio)\b/.test(seo.fullTitle) ? seo.fullTitle : null) ??
    (r.type === "projectCategory" ? `${r.category.name} | WAWA Interiors` : null) ??
    (r.type === "blog" && r.title ? `${r.title} | WAWA Interiors` : null) ??
    FALLBACK_TITLE[r.type]?.[lang] ??
    "WAWA Interiors";
  const alts = alternatesOf(r, path);
  const languages: Record<string, string> = {};
  for (const [l, p] of Object.entries(alts)) if (p) languages[l] = p;
  if (languages.tr) languages["x-default"] = languages.tr;
  // Paylaşım görseli: sayfanın kendi görseli; yoksa sitenin genel paylaşım görseli (/opengraph-image)
  const image =
    seo?.ogImage ??
    (r.type === "post" ? r.post.featuredImage : r.type === "project" ? r.project.featuredImage : r.type === "service" ? r.service.featuredImage : null) ??
    "/opengraph-image";
  const description = descriptionOf(r, seo, lang);
  return {
    title: { absolute: title + pageNo },
    description: description ? description + (pageNo && description.length < 140 ? pageNo : "") : undefined,
    alternates: { canonical: encodeURI(canonicalOf(path, r)), languages },
    openGraph: {
      type: r.type === "post" ? "article" : "website",
      locale: OG_LOCALE[lang],
      url: encodeURI(path),
      title,
      description,
      images: [{ url: encodeURI(image) }],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = decoded(slug);
  const r = resolve(path);
  if (!r) notFound();
  const lang = langOf(r);
  return (
    <>
      <SetAlternates lang={lang} alternates={alternatesOf(r, path)} />
      {render(r, path)}
    </>
  );
}

function render(r: Resolved, path: string) {
  switch (r.type) {
    case "home":
      return <LocalizedHome lang={r.lang} />;
    case "about":
      return <AboutTemplate lang={r.lang} path={path} />;
    case "contact":
      return <ContactTemplate lang={r.lang} />;
    case "offer":
      return <OfferTemplate lang={r.lang} />;
    case "services":
      return <ServicesIndexTemplate lang={r.lang} />;
    case "projects":
      return <ProjectListTemplate lang={r.lang} projects={r.items} page={r.page} pages={r.pages} base={r.base} />;
    case "projectCategory":
      return <ProjectListTemplate lang={r.lang} projects={r.items} page={r.page} pages={r.pages} base={r.base} category={r.category} />;
    case "blog":
      return <BlogListTemplate lang={r.lang} posts={r.items} page={r.page} pages={r.pages} base={r.base} title={r.title} />;
    case "post":
      return <PostTemplate post={r.post} />;
    case "project":
      return <ProjectTemplate project={r.project} />;
    case "service":
      return <ServiceTemplate service={r.service} />;
    case "page":
      return <ContentPageTemplate page={r.page} />;
    case "extra":
      return <ExtraServiceTemplate page={r.page} />;
    case "legal":
      return <LegalTemplate page={r.page} />;
  }
}


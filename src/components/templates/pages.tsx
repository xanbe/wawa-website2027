import Image from "next/image";
import { OfferWizard } from "./OfferWizard";
import { FAIR_OPTIONS } from "@/content/fairs";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ROUTES, contentLang, t, type Lang } from "@/lib/i18n";
import { contactInfo } from "@/components/layout/navigation";
import { projectsIn, servicesIn, type LegacyPage } from "@/lib/content";
import { CtaBand, LINE, PageIntro, ProjectCard, Prose } from "./parts";
import { ContactForm } from "./ContactForm";
import { landings } from "@/content/landings";
import { AiStudio } from "@/components/ai/AiStudio";
import { AI_REFERENCES } from "@/lib/ai-references";
import { kvkkPath, privacyPath } from "@/content/legal";
import { LandingTemplate, relatedProjects } from "./landing";
import { serviceInfo, serviceTitle } from "./services";

const MAP_EMBED =
  "https://www.google.com/maps?q=Wawa%20%C4%B0%C3%A7mimarl%C4%B1k%20Fuar%20Stand%C4%B1%20Zeytinburnu%20%C4%B0stanbul&z=15&output=embed";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Wawa%20%C4%B0%C3%A7mimarl%C4%B1k%20Fuar%20Stand%C4%B1%20Zeytinburnu%20%C4%B0stanbul";
const ADDRESS = "Maltepe Mh. Eski Çırpıcı Yolu, Nef12 D:22, Zeytinburnu, İstanbul";

// ---------------------------------------------------------------- İletişim ve teklif
function ContactInfo({ lang }: { lang: Lang }) {
  const L = t(lang).labels;
  const rows = [
    { icon: Phone, label: L.phone, value: contactInfo.phoneDisplay, href: contactInfo.phoneHref },
    { icon: Mail, label: L.email, value: contactInfo.email, href: `mailto:${contactInfo.email}` },
    { icon: MessageCircle, label: "WhatsApp", value: contactInfo.phoneDisplay, href: contactInfo.whatsappHref, external: true },
    { icon: MapPin, label: L.address, value: ADDRESS, href: MAPS_URL, external: true },
  ];
  return (
    <ul className={`border-t ${LINE}`}>
      {rows.map((r) => (
        <li key={r.label} className={`border-b ${LINE}`}>
          <a
            href={r.href}
            {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group flex items-center gap-4 py-4 transition-colors hover:bg-[#F3F2EF]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center bg-wawa-accent text-wawa-charcoal">
              <r.icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] text-wawa-charcoal/55">{r.label}</span>
              <span className="block text-[16px] text-wawa-charcoal">{r.value}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ContactTemplate({ lang }: { lang: Lang }) {
  const intro = {
    tr: { title: "İletişim", lead: "Projenizi konuşmak için bize yazın ya da arayın. Ofisimiz ve atölyemiz İstanbul'da." },
    en: { title: "Contact", lead: "Write or call us to talk about your project. Our office and workshop are in Istanbul." },
    de: { title: "Kontakt", lead: "Schreiben oder rufen Sie uns an. Unser Büro und unsere Werkstatt sind in Istanbul." },
    it: { title: "Contatti", lead: "Scrivici o chiamaci per parlare del tuo progetto. Il nostro studio e il nostro laboratorio sono a Istanbul." },
    fr: { title: "Contact", lead: "Écrivez-nous ou appelez-nous pour parler de votre projet. Notre bureau et notre atelier sont à Istanbul." },
  }[lang];
  return (
    <>
      <PageIntro lang={lang} title={intro.title} lead={intro.lead} />
      <section className="bg-white" lang={lang}>
        <div className={`container-wide grid gap-12 border-t pt-10 pb-14 lg:grid-cols-12 lg:gap-10 lg:pt-14 lg:pb-16 ${LINE}`}>
          <div className="lg:col-span-5">
            <ContactInfo lang={lang} />
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Maps"
              className="group relative mt-8 block aspect-[4/3] overflow-hidden bg-[#F3F2EF]"
            >
              <iframe
                src={MAP_EMBED}
                title="WAWA Interiors"
                loading="lazy"
                tabIndex={-1}
                className="pointer-events-none absolute inset-x-0 -top-[180px] bottom-0 h-[calc(100%+180px)] w-full border-0 [filter:grayscale(1)_contrast(1.08)]"
              />
            </a>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ContactForm lang={lang} kind="contact" />
          </div>
        </div>
      </section>
    </>
  );
}

export function OfferTemplate({ lang }: { lang: Lang }) {
  const intro = {
    tr: { title: "Teklif alın", lead: "Projenizin türünü, alanını ve tarihini paylaşın; kapsamı netleştirip size teklifle dönelim." },
    en: { title: "Get an offer", lead: "Share your project type, area and date; we will clarify the scope and come back with an offer." },
    de: { title: "Angebot erhalten", lead: "Teilen Sie Projektart, Fläche und Termin mit; wir klären den Umfang und senden Ihnen ein Angebot." },
    it: { title: "Richiedi un preventivo", lead: "Indica tipo di progetto, superficie e date; definiamo il perimetro e ti inviamo un preventivo." },
    fr: { title: "Demander un devis", lead: "Indiquez le type de projet, la surface et les dates ; nous précisons le périmètre et vous envoyons un devis." },
  }[lang];
  const budget = {
    tr: "Önce tasarım bütçenizi görmek ister misiniz?",
    en: "Want to see an estimated design budget first?",
    de: "Möchten Sie zuerst ein geschätztes Planungsbudget sehen?",
    it: "",
    fr: "",
  }[lang];
  return (
    <>
      <PageIntro lang={lang} title={intro.title} lead={intro.lead} />
      <section className="bg-white" lang={lang}>
        <div className={`container-wide grid gap-12 border-t pt-10 pb-14 lg:grid-cols-12 lg:gap-10 lg:pt-14 lg:pb-12 ${LINE}`}>
          {/* Yönlendirmeli teklif formu: solda adımlar, sağda canlı özet ve hızlı iletişim */}
          <OfferWizard lang={lang} fairs={FAIR_OPTIONS} privacyHref={lang === "tr" ? kvkkPath : privacyPath(lang)} />
        </div>
        {lang === "tr" && (
          <div className="container-wide pb-14 lg:pb-16">
            <Link href={ROUTES.tr.budget} className="group flex max-w-[720px] items-center justify-between gap-4 bg-[#F3F2EF] p-5 text-[15px] text-wawa-charcoal hover:bg-wawa-accent">
              {budget}
              <ArrowUpRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------- Eski içerik sayfaları (şehir, yapay zeka vb.)
// Yapay zeka sayfaları: eski adresler korunur; sayfa, ölçüye göre 3D taslak çizen ve görsel üreten stüdyodur
const AI_PATHS = ["/yapay-zeka/", "/en/design-with-ai/", "/de/messestand-mit-ki/"];
const AI_COPY = {
  tr: {
    title: "Yapay zeka ile fuar standı ve iç mekân tasarlayın",
    steps: [
      { title: "Ölçüleri girin", text: "İç mimari ya da fuar standı; alanınızın gerçek ölçülerini ve ihtiyaçlarınızı seçin." },
      { title: "3D taslak", text: "Girdiğiniz ölçülerle alan anında 3D olarak çizilir; her açıdan inceleyebilirsiniz." },
      { title: "Gerçekçi görsel ve teklif", text: "Taslak ve ölçüler yapay zekaya verilir; görsel hazırlanır, ekibimiz projenizi teklife dönüştürür." },
    ],
  },
  en: {
    title: "Design with AI",
    steps: [
      { title: "Enter the size", text: "Interior or exhibition stand; choose your real dimensions and what you need." },
      { title: "3D draft", text: "Your space is drawn in 3D instantly from the dimensions; view it from every angle." },
      { title: "Realistic image and offer", text: "The draft and dimensions go to the AI; the image is created and our team turns it into an offer." },
    ],
  },
  de: {
    title: "Mit KI gestalten",
    steps: [
      { title: "Maße eingeben", text: "Innenraum oder Messestand; wählen Sie Ihre echten Maße und Anforderungen." },
      { title: "3D-Entwurf", text: "Aus den Maßen entsteht sofort ein 3D-Entwurf, den Sie von allen Seiten ansehen." },
      { title: "Realistisches Bild und Angebot", text: "Entwurf und Maße gehen an die KI; das Bild entsteht und unser Team erstellt ein Angebot." },
    ],
  },
};

function AiTemplate({ page }: { page: LegacyPage }) {
  const lang = page.lang;
  const studioLang = lang === "tr" || lang === "de" ? lang : "en";
  const copy = AI_COPY[studioLang];
  return (
    <>
      <AiStudio lang={studioLang} title={copy.title} references={AI_REFERENCES} privacyHref={lang === "tr" ? kvkkPath : privacyPath(lang)} offerHref={ROUTES[lang].offer} />
      <section className="bg-white" lang={lang}>
        <ol className={`container-wide grid border-t pt-4 pb-14 sm:grid-cols-3 sm:gap-8 lg:pb-16 ${LINE}`}>
          {copy.steps.map((s, i) => (
            <li key={s.title} className={`py-6 ${i > 0 ? `border-t sm:border-t-0 ${LINE}` : ""}`}>
              <span className="grid h-9 w-9 place-items-center bg-wawa-accent text-[13px] font-medium tabular-nums text-wawa-charcoal">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-5 text-[18px] tracking-tight text-wawa-charcoal">{s.title}</p>
              <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-wawa-charcoal/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

export function ContentPageTemplate({ page }: { page: LegacyPage }) {
  const lang = page.lang;
  const html = page.html;
  if (AI_PATHS.includes(page.path)) return <AiTemplate page={page} />;
  // Maxima Stand gibi hizmet niteliğindeki eski sayfalar hizmet açılış kurgusuyla gösterilir
  const landing = landings[page.path];
  if (landing) {
    return (
      <LandingTemplate
        lang={lang}
        path={page.path}
        title={page.title}
        lead={landing.lead}
        heroImages={landing.heroImages}
        breadcrumb={{ label: t(lang).nav.services, href: ROUTES[lang].services }}
        landing={landing}
        projects={relatedProjects(lang, landing.projectCategories, landing.projectPaths, 24)}
        projectsHref={ROUTES[lang].projects}
        detailsHtml={html.split("\n").filter((l) => !l.startsWith("<img")).join("\n")}
      />
    );
  }
  return (
    <>
      <PageIntro lang={lang} title={page.title || page.seo.title || ""} />
      <section className="bg-white" lang={lang}>
        <div className={`container-wide grid gap-10 border-t pt-10 pb-14 lg:grid-cols-12 lg:pt-14 lg:pb-16 ${LINE}`}>
          <div className="lg:col-span-8 lg:col-start-3">
            <Prose html={html} />
          </div>
        </div>
      </section>
      <CtaBand lang={lang} />
    </>
  );
}

// ---------------------------------------------------------------- EN / DE anasayfa
export function LocalizedHome({ lang }: { lang: Exclude<Lang, "tr"> }) {
  const copy = {
    en: {
      title: "Interior architecture that gives spaces an identity.",
      lead: "Interior design and implementation for residential, office and commercial spaces, and exhibition stands worldwide. One team from concept to custom furniture.",
      projects: "Selected projects",
      services: "What we do",
    },
    de: {
      title: "Innenarchitektur, die Räumen Identität verleiht.",
      lead: "Innenarchitektur und Umsetzung für Wohn-, Büro- und Gewerberäume sowie Messestände weltweit. Ein Team vom Konzept bis zum Sondermöbel.",
      projects: "Ausgewählte Projekte",
      services: "Was wir tun",
    },
    it: {
      title: "Architettura d'interni che dà identità agli spazi.",
      lead: "Progettazione e realizzazione di interni per residenze, uffici e spazi commerciali, e stand fieristici in tutto il mondo. Un unico team dal concept agli arredi su misura.",
      projects: "Progetti selezionati",
      services: "Cosa facciamo",
    },
    fr: {
      title: "Une architecture intérieure qui donne une identité aux espaces.",
      lead: "Conception et réalisation d'intérieurs pour l'habitat, les bureaux et les espaces commerciaux, et stands d'exposition dans le monde entier. Une seule équipe du concept au mobilier sur mesure.",
      projects: "Projets sélectionnés",
      services: "Nos services",
    },
  }[lang];
  const D = t(lang);
  // IT/FR'de içerik İngilizce kaynaktan gelir; hizmet adları çevrilir
  const featured = projectsIn(contentLang(lang)).slice(0, 6);
  const svc = servicesIn(contentLang(lang))
    .filter((s) => serviceInfo(s))
    .sort((a, b) => serviceInfo(a)!.order - serviceInfo(b)!.order)
    .map((s) => ({ ...s, title: serviceTitle(s.path, lang) ?? s.title }));
  return (
    <div lang={lang}>
      <section className="relative isolate overflow-hidden bg-wawa-charcoal">
        <Image src="/images/hero/acarkent-villa.webp" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-60" />
        <div className="container-wide flex min-h-[78vh] flex-col justify-end pt-40 pb-14 lg:pb-20">
          <h1 className="max-w-4xl font-heading text-[30px] leading-[1.15] font-normal tracking-[-0.01em] text-balance text-white sm:text-[44px] lg:text-[60px]">
            {copy.title}
          </h1>
          <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[52ch] text-lg leading-relaxed text-white">{copy.lead}</p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href={ROUTES[lang].contact}
                className="group inline-flex items-center gap-4 bg-wawa-accent px-7 py-4 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-white"
              >
                {D.cta.talk}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={ROUTES[lang].projects}
                className="inline-flex items-center border border-white/50 px-7 py-4 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-wawa-charcoal"
              >
                {D.nav.projects}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-wide pt-14 pb-8 lg:pt-16 lg:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-heading text-[28px] font-normal text-wawa-charcoal sm:text-[36px] lg:text-[44px]">{copy.projects}</h2>
            <Link href={ROUTES[lang].projects} className="text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] hover:decoration-wawa-charcoal">
              {D.cta.allProjects}
            </Link>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.path} project={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className={`container-wide border-t pt-10 pb-14 lg:pt-14 lg:pb-16 ${LINE}`}>
          <h2 className="font-heading text-[28px] font-normal text-wawa-charcoal sm:text-[36px] lg:text-[44px]">{copy.services}</h2>
          <ul className={`mt-10 border-t ${LINE}`}>
            {svc.map((s) => (
              <li key={s.path} className={`border-b ${LINE}`}>
                <Link href={s.path} className="group flex items-center justify-between gap-6 py-5 text-[18px] text-wawa-charcoal hover:bg-[#F3F2EF] lg:text-[22px]">
                  {s.title}
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand lang={lang} />
    </div>
  );
}

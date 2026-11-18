// Hizmet sayfalarının bölümleri (wawa fuar sitesinin kurgusu, WAWA teması ile):
// kayan bulanık görselli açılış, marka şeridi, iki yol kartları, yapay zeka tanıtımı, koyu teklif bölümü.
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { ROUTES, type Lang } from "@/lib/i18n";
import { contactInfo } from "@/components/layout/navigation";
import { BRANDS } from "@/components/sections/brands-data";
import { ContactForm } from "./ContactForm";
import { Prose } from "./parts";

export type SvcLang = "tr" | "en" | "de";
export const svcLang = (lang: Lang): SvcLang => (lang === "tr" || lang === "de" ? lang : "en");

export const AI_HREF: Record<SvcLang, string> = { tr: "/yapay-zeka/", en: "/en/design-with-ai/", de: "/de/messestand-mit-ki/" };

const T = {
  tr: {
    offerFree: "Ücretsiz tasarım teklifi al",
    projects: "Projeleri inceleyin",
    brandsStand: "Bu markaların fuar standlarını biz kurduk.",
    brands: "Birlikte çalıştığımız markalar.",
    pathsStand: "Bütçenize göre üç yol.",
    paths: "İhtiyacınıza göre iki yol.",
    design: "Tasarım",
    scope: "Kapsam",
    forWho: "Kimin için",
    aiKicker: "Yapay zeka ile",
    aiStand: "Standınızı yapay zeka ile görün.",
    aiRoom: "Mekânınızı yapay zeka ile görün.",
    aiLead: "Ölçülerinizi girin; alan anında 3D çizilsin, yapay zeka gerçekçi bir görsele dönüştürsün.",
    aiCta: "Hemen deneyin",
    quoteStand: "Bir sonraki fuarınız hangisi?",
    quoteRoom: "Projenizi anlatın.",
    quoteLead: "Formu doldurun, aynı gün dönelim. Ya da doğrudan yazın:",
  },
  en: {
    offerFree: "Get a free design offer",
    projects: "See projects",
    brandsStand: "We built the stands of these brands.",
    brands: "Brands we work with.",
    pathsStand: "Three ways, depending on your budget.",
    paths: "Two ways, depending on your needs.",
    design: "Design",
    scope: "Scope",
    forWho: "For",
    aiKicker: "With AI",
    aiStand: "See your stand with AI.",
    aiRoom: "See your space with AI.",
    aiLead: "Enter your dimensions; the space is drawn in 3D instantly and the AI turns it into a realistic image.",
    aiCta: "Try it now",
    quoteStand: "Which fair is next for you?",
    quoteRoom: "Tell us about your project.",
    quoteLead: "Fill in the form and we will get back to you the same day. Or write to us directly:",
  },
  de: {
    offerFree: "Kostenloses Designangebot",
    projects: "Projekte ansehen",
    brandsStand: "Die Messestände dieser Marken haben wir gebaut.",
    brands: "Marken, mit denen wir arbeiten.",
    pathsStand: "Drei Wege, je nach Budget.",
    paths: "Zwei Wege, je nach Bedarf.",
    design: "Gestaltung",
    scope: "Umfang",
    forWho: "Für wen",
    aiKicker: "Mit KI",
    aiStand: "Sehen Sie Ihren Stand mit KI.",
    aiRoom: "Sehen Sie Ihren Raum mit KI.",
    aiLead: "Geben Sie Ihre Maße ein; der Raum entsteht sofort in 3D und die KI macht daraus ein realistisches Bild.",
    aiCta: "Jetzt ausprobieren",
    quoteStand: "Welche Messe steht als Nächstes an?",
    quoteRoom: "Erzählen Sie uns von Ihrem Projekt.",
    quoteLead: "Füllen Sie das Formular aus, wir melden uns am selben Tag. Oder schreiben Sie direkt:",
  },
};

// ---------------------------------------------------------------- Açılış
export function LeadHero({
  lang,
  title,
  lead,
  breadcrumb,
  images,
  hasProjects,
}: {
  lang: Lang;
  title: string;
  lead: string;
  breadcrumb: { label: string; href: string };
  images: string[];
  hasProjects: boolean;
}) {
  const t = T[svcLang(lang)];
  const words = title.trim().split(/\s+/);
  const last = words.pop() ?? "";
  const track = images.length ? [...images, ...images] : [];
  return (
    <section className="relative isolate overflow-hidden bg-[#F3F2EF] pt-20 lg:pt-[116px]">
      {/* Arka planda yavaşça kayan, bulanık proje görselleri */}
      {track.length > 0 && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="svc-marquee flex h-full w-max scale-110 blur-xl" style={{ "--svc-dur": "100s" } as CSSProperties}>
            {track.map((src, i) => (
              <div key={`${src}-${i}`} className="relative h-full w-[55vw] max-w-[820px] shrink-0">
                <Image src={src} alt="" fill sizes="240px" quality={40} className="object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-[#F3F2EF]/72" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#F3F2EF] to-transparent" />
        </div>
      )}
      <div className="container-wide flex min-h-[64svh] flex-col justify-end pt-14 pb-10 lg:min-h-[70svh] lg:pb-14">
        <Link href={breadcrumb.href} className="text-[13px] tracking-[0.12em] text-wawa-charcoal/60 uppercase underline-offset-4 hover:text-wawa-charcoal hover:underline">
          {breadcrumb.label}
        </Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <h1 className="font-heading text-[32px] leading-[1.12] font-normal tracking-[-0.01em] text-balance text-wawa-charcoal sm:text-[48px] lg:text-[64px]">
              <span className="sr-only">{title}</span>
              <span aria-hidden>
                {words.join(" ")}{" "}
                <span className="svc-build whitespace-nowrap">
                  {[...last].map((ch, i) => (
                    <span key={i} className="p" style={{ animationDelay: `${0.35 + i * 0.05}s`, "--r": `${(i % 2 ? 1 : -1) * (6 + ((i * 7) % 10))}deg` } as CSSProperties}>
                      {ch}
                    </span>
                  ))}
                </span>
              </span>
            </h1>
            <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-wawa-charcoal lg:mt-8">{lead}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <a
              href="#teklif"
              className="group inline-flex items-center gap-4 bg-wawa-charcoal px-6 py-4 text-[15px] text-white transition-colors hover:bg-black"
            >
              {t.offerFree}
              <ArrowUpRight className="h-4 w-4 text-wawa-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
            {hasProjects && (
              <a href="#projeler" className="inline-flex items-center gap-3 border border-wawa-charcoal/20 bg-white px-6 py-4 text-[15px] text-wawa-charcoal transition-colors hover:border-wawa-charcoal">
                {t.projects}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Marka şeridi
export function BrandMarquee({ lang, stand }: { lang: Lang; stand: boolean }) {
  const t = T[svcLang(lang)];
  const list = [...BRANDS, ...BRANDS];
  return (
    <section className="bg-white" aria-labelledby="svc-brands">
      <div className="container-wide border-t border-wawa-charcoal pt-6 pb-6 lg:pt-8">
        <h2 id="svc-brands" className="font-heading text-[20px] leading-[1.3] font-normal text-wawa-charcoal lg:text-[26px]">
          {stand ? t.brandsStand : t.brands}
        </h2>
      </div>
      <div className="overflow-hidden border-y border-wawa-charcoal/10">
        <ul className="svc-marquee flex w-max" style={{ "--svc-dur": "90s" } as CSSProperties}>
          {list.map((b, i) => (
            <li key={`${b.name}-${i}`} aria-hidden={i >= BRANDS.length} className="flex h-28 w-48 shrink-0 items-center justify-center border-r border-wawa-charcoal/10 px-5 lg:h-32 lg:w-60">
              <Image src={b.src} alt={i < BRANDS.length ? b.name : ""} width={190} height={72} className="h-auto max-h-12 w-auto max-w-full object-contain opacity-70 grayscale lg:max-h-14" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Yollar (stand: ahşap, Maxima, Plus; iç mimari: proje, anahtar teslim)
type Path = { no: string; kicker: string; title: string; text: string; design: string; who: string; cta: string; href: string; image: string };
type Paths = { items: Path[]; strip: { bold: string; text: string; cta: string; href: string } };

const STAND_PATHS: Record<SvcLang, Paths> = {
  tr: {
    items: [
      { no: "01", kicker: "Özel tasarım", title: "Ahşap stand", text: "Sıfırdan tasarlanır, atölyemizde üretilir. Markanıza özel, tek seferlik bir yapı.", design: "Tamamen serbest", who: "İmaj odaklı katılımlar, büyük metrekareler", cta: "Ahşap stand için teklif al", href: "#teklif", image: "/wp-content/uploads/2025/07/koluman-plastikfuar-fuarstandi-1.jpg" },
      { no: "02", kicker: "Modüler sistem", title: "Maxima stand", text: "Alüminyum profil sistemle kurulur. Hızlıdır, sökülüp bir sonraki fuarda yeniden kullanılır.", design: "Modüler", who: "İlk fuar, sık fuar, sınırlı bütçe", cta: "Maxima stand için teklif al", href: "/maxima-stand/", image: "/wp-content/uploads/2024/08/tatko-maximastand-1.webp" },
      { no: "03", kicker: "Büyük ölçekli modüler", title: "Plus stand", text: "Maxima sistemin büyük ölçekli sürümü. Geniş metrekarelerde modüler sistemin pratikliğini özel tasarım etkisiyle birleştirir.", design: "Modüler + özel üretim", who: "Büyük metrekare, sık fuar", cta: "Plus stand için teklif al", href: "/plus-stand/", image: "/wp-content/uploads/2024/08/daly-maximastand-1.webp" },
    ],
    strip: { bold: "İkisini birleştirebiliriz:", text: "Maxima iskelet, ahşap kaplama. Orta bütçede özel görünüm.", cta: "Hibrit için teklif al", href: "#teklif" },
  },
  en: {
    items: [
      { no: "01", kicker: "Custom design", title: "Wooden stand", text: "Designed from scratch and built in our workshop. A one-off structure made for your brand.", design: "Completely free", who: "Image-driven participation, large stands", cta: "Get an offer for a wooden stand", href: "#teklif", image: "/wp-content/uploads/2025/07/koluman-plastikfuar-fuarstandi-1.jpg" },
      { no: "02", kicker: "Modular system", title: "Maxima stand", text: "Built with an aluminium profile system. Quick to set up, dismantled and reused at the next fair.", design: "Modular", who: "First fair, frequent fairs, limited budget", cta: "Get an offer for a Maxima stand", href: "/en/service/maxima-stand/", image: "/wp-content/uploads/2024/08/tatko-maximastand-1.webp" },
      { no: "03", kicker: "Large-scale modular", title: "Plus stand", text: "The large-scale version of the Maxima system. Combines modular practicality with the impact of a custom design on large stands.", design: "Modular + custom-built", who: "Large stands, frequent fairs", cta: "Get an offer for a Plus stand", href: "#teklif", image: "/wp-content/uploads/2024/08/daly-maximastand-1.webp" },
    ],
    strip: { bold: "We can combine both:", text: "a Maxima frame with wooden cladding. A custom look on a mid-range budget.", cta: "Get an offer for a hybrid", href: "#teklif" },
  },
  de: {
    items: [
      { no: "01", kicker: "Individuelles Design", title: "Holzstand", text: "Von Grund auf entworfen und in unserer Werkstatt gefertigt. Ein Unikat für Ihre Marke.", design: "Völlig frei", who: "Imageorientierte Auftritte, große Flächen", cta: "Angebot für einen Holzstand", href: "#teklif", image: "/wp-content/uploads/2025/07/koluman-plastikfuar-fuarstandi-1.jpg" },
      { no: "02", kicker: "Modulsystem", title: "Maxima-Stand", text: "Mit einem Aluminiumprofilsystem aufgebaut. Schnell, demontierbar und auf der nächsten Messe wiederverwendbar.", design: "Modular", who: "Erste Messe, häufige Messen, begrenztes Budget", cta: "Angebot für einen Maxima-Stand", href: "/de/service/maxima-stand/", image: "/wp-content/uploads/2024/08/tatko-maximastand-1.webp" },
      { no: "03", kicker: "Großformatig modular", title: "Plus-Stand", text: "Die großformatige Version des Maxima-Systems. Verbindet modulare Praktikabilität mit der Wirkung eines individuellen Designs auf großen Flächen.", design: "Modular + Sonderbau", who: "Große Flächen, häufige Messen", cta: "Angebot für einen Plus-Stand", href: "#teklif", image: "/wp-content/uploads/2024/08/daly-maximastand-1.webp" },
    ],
    strip: { bold: "Beides lässt sich kombinieren:", text: "Maxima-Rahmen mit Holzverkleidung. Individueller Look bei mittlerem Budget.", cta: "Angebot für eine Hybridlösung", href: "#teklif" },
  },
};

const ROOM_PATHS: Record<SvcLang, Omit<Paths, "items"> & { items: [Omit<Path, "image">, Omit<Path, "image">] }> = {
  tr: {
    items: [
      { no: "01", kicker: "Proje", title: "Tasarım ve teknik proje", text: "Konsept, 3D görseller ve uygulamaya hazır teknik çizimler. Uygulamayı kendi ekibinizle yaptırırsınız.", design: "Tasarım", who: "Kendi uygulama ekibi olanlar", cta: "Tasarım bütçenizi planlayın", href: "/butce-planlama/" },
      { no: "02", kicker: "Anahtar teslim", title: "Tasarım ve uygulama", text: "Tasarım, üretim, inşaat ve montaj tek ekipte; mobilyalar kendi atölyemizde üretilir.", design: "Uçtan uca", who: "Tek muhatap isteyenler", cta: "Anahtar teslim teklif al", href: "#teklif" },
    ],
    strip: { bold: "Mobilyayı da biz üretelim:", text: "projeye özel mobilyalar kendi atölyemizde, ölçüsüne göre.", cta: "Mobilya üretimi", href: "/mobilya-uretim/" },
  },
  en: {
    items: [
      { no: "01", kicker: "Project", title: "Design and technical drawings", text: "Concept, 3D visuals and construction-ready drawings. You carry out the build with your own team.", design: "Design", who: "Clients with their own build team", cta: "Get an offer", href: "#teklif" },
      { no: "02", kicker: "Turnkey", title: "Design and build", text: "Design, production, construction and installation in one team; furniture is made in our own workshop.", design: "End to end", who: "Clients who want one point of contact", cta: "Get a turnkey offer", href: "#teklif" },
    ],
    strip: { bold: "We make the furniture too:", text: "custom furniture built to size in our own workshop.", cta: "Furniture production", href: "/en/furniture-production/" },
  },
  de: {
    items: [
      { no: "01", kicker: "Projekt", title: "Entwurf und Ausführungsplanung", text: "Konzept, 3D-Visualisierungen und baureife Pläne. Die Umsetzung übernimmt Ihr eigenes Team.", design: "Entwurf", who: "Kunden mit eigenem Ausführungsteam", cta: "Angebot erhalten", href: "#teklif" },
      { no: "02", kicker: "Schlüsselfertig", title: "Planung und Umsetzung", text: "Planung, Fertigung, Bau und Montage aus einer Hand; Möbel aus unserer eigenen Werkstatt.", design: "Komplett", who: "Kunden, die einen Ansprechpartner wünschen", cta: "Schlüsselfertiges Angebot", href: "#teklif" },
    ],
    strip: { bold: "Auch die Möbel fertigen wir:", text: "maßgefertigte Möbel aus unserer eigenen Werkstatt.", cta: "Möbelproduktion", href: "/de/moebelproduktion/" },
  },
};

export function TwoPaths({ lang, stand, images }: { lang: Lang; stand: boolean; images: string[] }) {
  const k = svcLang(lang);
  const t = T[k];
  const data: Paths = stand
    ? STAND_PATHS[k]
    : { ...ROOM_PATHS[k], items: ROOM_PATHS[k].items.map((p, i) => ({ ...p, image: images[i % Math.max(1, images.length)] ?? "" })) };
  return (
    <section className="bg-white" aria-labelledby="svc-paths">
      <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
        <h2 id="svc-paths" className="border-t border-wawa-charcoal pt-6 font-heading text-[26px] leading-[1.2] font-normal text-wawa-charcoal lg:pt-8 lg:text-[38px]">
          {stand ? t.pathsStand : t.paths}
        </h2>
        <div className={`mt-8 grid gap-8 md:grid-cols-2 lg:mt-10 lg:gap-6 ${data.items.length > 2 ? "lg:grid-cols-3" : ""}`}>
          {data.items.map((p) => (
            <article key={p.no} className="group flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F3F2EF]">
                {p.image && <Image src={p.image} alt={p.title} fill sizes={data.items.length > 2 ? "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
              </div>
              <p className="mt-6 text-[12px] tracking-[0.14em] text-wawa-charcoal/55 uppercase">
                {p.no} · {p.kicker}
              </p>
              <h3 className="mt-2 font-heading text-[24px] font-normal text-wawa-charcoal lg:text-[30px]">{p.title}</h3>
              <p className="mt-3 max-w-[50ch] flex-1 text-[16px] leading-relaxed text-wawa-charcoal/70">{p.text}</p>
              <dl className="mt-6 border-t border-wawa-charcoal/15">
                <div className="flex items-center justify-between gap-4 border-b border-wawa-charcoal/15 py-3 text-[13px]">
                  <dt className="tracking-[0.12em] text-wawa-charcoal/55 uppercase">{stand ? t.design : t.scope}</dt>
                  <dd className="tracking-[0.12em] text-wawa-charcoal uppercase">{p.design}</dd>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2 py-3 text-[14px]">
                  <dt className="text-wawa-charcoal/55">{t.forWho}:</dt>
                  <dd className="text-wawa-charcoal">{p.who}</dd>
                </div>
              </dl>
              <Link
                href={p.href}
                className="group/cta mt-3 inline-flex w-fit items-center gap-3 bg-wawa-charcoal px-5 py-3 text-[14px] text-white transition-colors hover:bg-black"
              >
                {p.cta}
                <ArrowUpRight className="h-4 w-4 text-wawa-accent transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-4 border border-dashed border-wawa-charcoal/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:mt-10">
          <p className="text-[15px] text-wawa-charcoal">
            <b className="font-medium">{data.strip.bold}</b> {data.strip.text}
          </p>
          <Link href={data.strip.href} className="inline-flex shrink-0 items-center gap-2 border border-wawa-charcoal/20 bg-white px-4 py-2.5 text-[14px] text-wawa-charcoal hover:border-wawa-charcoal">
            {data.strip.cta}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Yapay zeka tanıtımı
// Stüdyonun küçük bir penceresi: adımlar sırayla yanar, gerçek 3D taslağın üzerinden tarama çizgisi geçer
const AI_STEPS = {
  tr: { tabs: ["Ölçüler", "İçerik", "Stil", "Üret"], steps: ["Ölçülerinizi girin", "3D taslak anında çizilir", "Yapay zeka gerçekçi görsele dönüştürür"], window: "Yapay zeka stüdyosu", generate: "Görseli üret", stand: "6 × 4 m · 24 m² · Köşe stand", room: "Salon · 5 × 6 m · 30 m²" },
  en: { tabs: ["Size", "Content", "Style", "Create"], steps: ["Enter your dimensions", "A 3D draft is drawn instantly", "AI turns it into a realistic image"], window: "AI studio", generate: "Create image", stand: "6 × 4 m · 24 m² · Corner stand", room: "Living room · 5 × 6 m · 30 m²" },
  de: { tabs: ["Maße", "Inhalt", "Stil", "Erstellen"], steps: ["Maße eingeben", "Der 3D-Entwurf entsteht sofort", "Die KI macht daraus ein realistisches Bild"], window: "KI-Studio", generate: "Bild erstellen", stand: "6 × 4 m · 24 m² · Eckstand", room: "Wohnzimmer · 5 × 6 m · 30 m²" },
};

export function AiTeaser({ lang, stand }: { lang: Lang; stand: boolean }) {
  const k = svcLang(lang);
  const t = T[k];
  const s = AI_STEPS[k];
  return (
    <section className="bg-wawa-charcoal text-white" aria-labelledby="svc-ai">
      <div className="container-wide grid gap-12 py-16 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-20">
        <div className="lg:col-span-5">
          <p className="flex items-center gap-2 text-[12px] tracking-[0.14em] text-wawa-accent uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t.aiKicker}
          </p>
          <h2 id="svc-ai" className="mt-4 font-heading text-[28px] leading-[1.2] font-normal text-balance lg:text-[40px]">
            {stand ? t.aiStand : t.aiRoom}
          </h2>
          <ol className="mt-8 border-t border-white/10">
            {s.steps.map((step, i) => (
              <li key={step} className="svc-row flex items-center gap-4 border-b border-white/10 py-4" style={{ animationDelay: `${i * 2}s` } as CSSProperties}>
                <span className="svc-row-no grid h-8 w-8 shrink-0 place-items-center border border-white/20 text-[12px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[16px]">{step}</span>
              </li>
            ))}
          </ol>
          <Link href={AI_HREF[k]} className="group mt-8 inline-flex items-center gap-4 bg-wawa-accent px-6 py-4 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-white">
            {t.aiCta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        {/* Stüdyo penceresi */}
        <Link href={AI_HREF[k]} aria-label={t.aiCta} className="group block lg:col-span-7 lg:col-start-6">
          <div className="border border-white/10 bg-[#ECEAE5] shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:-translate-y-1">
            <div className="flex items-center justify-between gap-4 bg-[#222] px-4 py-2.5">
              <span className="truncate text-[12px] tracking-[0.12em] text-white/60 uppercase">WAWA · {s.window}</span>
              <span className="flex gap-1">
                {s.tabs.map((tab, i) => (
                  <span key={tab} className="svc-tab px-2.5 py-1 text-[11px] text-white/55" style={{ animationDelay: `${i * 2}s` } as CSSProperties}>
                    {tab}
                  </span>
                ))}
              </span>
            </div>
            <div className="relative aspect-[10/7] overflow-hidden">
              <Image src={stand ? "/images/ai/stand-3d.webp" : "/images/ai/room-3d.webp"} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              {/* Tarama çizgisi */}
              <div aria-hidden className="svc-scan pointer-events-none absolute inset-0">
                <span className="absolute inset-y-0 left-0 w-px bg-wawa-accent shadow-[0_0_24px_6px_rgba(231,232,100,0.45)]" />
              </div>
              <span className="absolute top-3 left-3 bg-white px-3 py-1.5 text-[12px] tabular-nums text-wawa-charcoal shadow-sm">{stand ? s.stand : s.room}</span>
              <span className="absolute right-3 bottom-3 inline-flex items-center gap-2 bg-wawa-accent px-4 py-2.5 text-[13px] font-medium text-wawa-charcoal">
                <span className="svc-pulse h-2 w-2 bg-wawa-charcoal" aria-hidden />
                {s.generate}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Teklif
export function QuoteSection({ lang, stand }: { lang: Lang; stand: boolean }) {
  const t = T[svcLang(lang)];
  return (
    <section id="teklif" className="scroll-mt-24 lg:scroll-mt-32 bg-[#141414] text-white">
      <div className="container-wide grid gap-12 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
        <div className="lg:col-span-4">
          <h2 className="font-heading text-[32px] leading-[1.12] font-normal text-balance lg:text-[48px]">{stand ? t.quoteStand : t.quoteRoom}</h2>
          <p className="mt-6 max-w-[36ch] text-[16px] leading-relaxed text-white/65">
            {t.quoteLead}{" "}
            <a href={contactInfo.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4 hover:text-wawa-accent">
              WhatsApp
            </a>{" "}
            ·{" "}
            <a href={`mailto:${contactInfo.email}`} className="text-white underline underline-offset-4 hover:text-wawa-accent">
              {contactInfo.email}
            </a>
          </p>
          {lang === "tr" && !stand && (
            <Link href={ROUTES.tr.budget} className="group mt-8 inline-flex items-center gap-2 text-[15px] text-white underline decoration-white/30 underline-offset-[6px] hover:decoration-white">
              Tasarım bütçenizi planlayın
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          )}
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <ContactForm lang={lang} kind="offer" tone="dark" />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Hizmet adları şeridi
export function ServiceTicker({ items }: { items: string[] }) {
  if (items.length < 2) return null;
  const row = [...items, ...items, ...items, ...items];
  return (
    <div aria-hidden className="overflow-hidden border-b border-wawa-charcoal/10 bg-white py-4">
      <ul className="svc-marquee flex w-max items-center" style={{ "--svc-dur": "60s" } as CSSProperties}>
        {[...row, ...row].map((name, i) => (
          <li key={i} className="flex shrink-0 items-center gap-6 pr-6 font-heading text-[13px] tracking-[0.06em] whitespace-nowrap text-wawa-charcoal uppercase lg:text-[14px]">
            {name}
            <span className="h-1.5 w-1.5 bg-wawa-accent outline outline-1 outline-wawa-charcoal" />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- Merak edilenler ve SSS
// Uzun SEO metni akordeona katlanır (metin sayfada kalır); solda görsel ve iletişim kutusu
const FAQ_T = {
  tr: { title: "Merak edilenler", faqTitle: "Sıkça sorulan sorular", boxTitle: "Sorularınıza yanıt bulamadınız mı?", box: "Bizimle iletişime geçin", more: "Devamını okuyun", all: "Tüm konuları göster" },
  en: { title: "Good to know", faqTitle: "Frequently asked questions", boxTitle: "Didn't find your answer?", box: "Get in touch", more: "Read more", all: "Show all topics" },
  de: { title: "Wissenswertes", faqTitle: "Häufige Fragen", boxTitle: "Keine Antwort gefunden?", box: "Kontakt aufnehmen", more: "Weiterlesen", all: "Alle Themen anzeigen" },
};

const FAQ_VISIBLE = 6;
const plainLength = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/s+/g, " ").trim().length;

export function FaqSplit({ lang, intro, items, image, hasDetails }: { lang: Lang; intro: string; items: { id: string; q: string; html: string }[]; image?: string; hasDetails: boolean }) {
  const t = FAQ_T[svcLang(lang)];
  // Yalnızca başlıktan ibaret, içeriği olmayan maddeler (eski siteden kalan boş başlıklar) listelenmez
  const list = items.filter((it) => plainLength(it.html) >= 40);
  if (!list.length && !intro.trim()) return null;
  // Giriş metninin ilk paragrafı görünür, kalanı "Devamını okuyun" altında (metin sayfada kalır)
  const cut = intro.indexOf("</p>");
  const introHead = cut > -1 ? intro.slice(0, cut + 4) : intro;
  const introRest = cut > -1 ? intro.slice(cut + 4) : "";
  const extra = list.length - FAQ_VISIBLE;
  return (
    <section className="bg-white" aria-labelledby="svc-faq">
      <div className="container-wide grid gap-10 border-t border-wawa-charcoal/15 pt-14 pb-14 lg:grid-cols-12 lg:gap-10 lg:pt-16 lg:pb-16">
        <div className="lg:col-span-5">
          <div className="relative lg:sticky lg:top-32">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F3F2EF] lg:aspect-[4/5]">
              {image && <Image src={image} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />}
            </div>
            <div className="absolute right-0 bottom-0 w-[78%] bg-wawa-accent p-6 sm:w-[62%] lg:p-7">
              <p className="font-heading text-[17px] leading-[1.35] text-wawa-charcoal lg:text-[19px]">{t.boxTitle}</p>
              <a href="#teklif" className="group mt-5 inline-flex items-center gap-3 bg-white px-4 py-3 text-[14px] text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white">
                {t.box}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <h2 id="svc-faq" className="font-heading text-[26px] leading-[1.2] font-normal text-wawa-charcoal lg:text-[38px]">
            {hasDetails ? t.title : t.faqTitle}
          </h2>
          {introHead.trim() && <Prose html={introHead} className="mt-6 text-[16px]" />}
          {plainLength(introRest) > 0 && (
            <details className="group/intro mt-3">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[14px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] hover:decoration-wawa-charcoal group-open/intro:hidden [&::-webkit-details-marker]:hidden">
                {t.more}
                <span aria-hidden>+</span>
              </summary>
              <Prose html={introRest} className="text-[16px]" />
            </details>
          )}
          {/* İlk 6 konu görünür; kalanı kutucuk işaretlenince açılır (JS gerektirmez, metin sayfada kalır) */}
          <input type="checkbox" id="svc-faq-all" className="peer sr-only" />
          <div className="mt-8 border-t border-wawa-charcoal/15 [&>details:nth-child(n+7)]:hidden [&>details:target]:block peer-checked:[&>details:nth-child(n+7)]:block">
            {list.map((it, i) => (
              <details key={it.id} id={it.id} name="svc-faq" open={i === 0} className="group scroll-mt-28 lg:scroll-mt-32 border-b border-wawa-charcoal/15">
                <summary className="flex cursor-pointer list-none items-center gap-4 py-5 transition-colors hover:bg-[#F7F6F3] [&::-webkit-details-marker]:hidden">
                  <span className="w-6 shrink-0 pl-1 text-[12px] tabular-nums text-wawa-charcoal/50">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="flex-1 text-[17px] leading-snug font-normal text-wawa-charcoal group-open:font-medium lg:text-[19px]">{it.q}</h3>
                  <span aria-hidden className="mr-1 grid h-8 w-8 shrink-0 place-items-center border border-wawa-charcoal/15 text-lg transition-colors group-open:border-wawa-accent group-open:bg-wawa-accent">
                    <span className="transition-transform duration-300 group-open:rotate-45">+</span>
                  </span>
                </summary>
                <Prose html={it.html} className="pr-4 pb-7 pl-11 text-[15px] lg:pr-14" />
              </details>
            ))}
          </div>
          {extra > 0 && (
            <label
              htmlFor="svc-faq-all"
              className="mt-6 inline-flex cursor-pointer items-center gap-3 border border-wawa-charcoal/20 px-5 py-3 text-[14px] text-wawa-charcoal transition-colors hover:border-wawa-charcoal hover:bg-wawa-charcoal hover:text-white peer-checked:hidden peer-focus-visible:outline peer-focus-visible:outline-2"
            >
              {t.all}
              <span className="text-[12px] tabular-nums opacity-60">+{extra}</span>
            </label>
          )}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ROUTES, t, type Lang } from "@/lib/i18n";
import { cleanHtml } from "@/lib/sanitize";
import { excerpt, type Post, type Project } from "@/lib/content";

const LINE = "border-wawa-charcoal/15";

// Alt sayfaların üst kısmı: sabit menünün altında başlar; başlık solda, açıklama 9. sütundan ve üstten hizalı
export function PageIntro({ title, lead, children, lang }: { title: string; lead?: ReactNode; children?: ReactNode; lang?: Lang }) {
  return (
    <section className="bg-white" lang={lang}>
      <div className="container-wide pt-32 pb-10 lg:pt-44 lg:pb-14">
        <div className="grid gap-5 lg:grid-cols-12 lg:gap-10">
          <h1 className="font-heading text-[30px] leading-[1.2] font-normal tracking-[-0.01em] text-balance text-wawa-charcoal sm:text-[40px] lg:col-span-8 lg:text-[52px]">
            {title}
          </h1>
          {lead && <div className="max-w-[40ch] text-[17px] leading-relaxed text-wawa-charcoal lg:col-span-4 lg:pt-2">{lead}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

// Eski siteden taşınan ve panelden girilen HTML: önce izin listesiyle temizlenir (derleme anında, sunucuda),
// sonra YouTube yer tutucuları gömülü videoya, görseller tembel yüklemeye çevrilir
function enhance(html: string) {
  return cleanHtml(html)
    .replace(
      /<div data-youtube="([\w-]{11})"><\/div>/g,
      (_m, id) =>
        `<div class="wawa-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
    )
    .replace(/<img (?![^>]*\sloading=)/g, '<img loading="lazy" decoding="async" ');
}

export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`wawa-prose ${className}`} dangerouslySetInnerHTML={{ __html: enhance(html) }} />;
}

export function Pagination({ base, page, pages, lang }: { base: string; page: number; pages: number; lang: Lang }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}page/${n}/`);
  const L = t(lang).labels;
  return (
    <nav aria-label={L.page} className={`mt-14 flex flex-wrap items-center gap-2 border-t pt-8 ${LINE}`}>
      {page > 1 && (
        <Link href={href(page - 1)} className="mr-2 inline-flex h-11 items-center px-4 text-[15px] text-wawa-charcoal hover:bg-[#F3F2EF]">
          {L.prev}
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`grid h-11 w-11 place-items-center text-[15px] tabular-nums transition-colors ${
            n === page ? "bg-wawa-charcoal text-white" : "bg-[#F3F2EF] text-wawa-charcoal hover:bg-wawa-charcoal/10"
          }`}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className="ml-2 inline-flex h-11 items-center px-4 text-[15px] text-wawa-charcoal hover:bg-[#F3F2EF]">
          {L.next}
        </Link>
      )}
    </nav>
  );
}

function formatDate(iso: string | null, lang: Lang) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PostCard({ post, lang }: { post: Post; lang: Lang }) {
  return (
    <Link href={post.path} className="group block">
      <div className="relative aspect-[3/2] overflow-hidden bg-[#F3F2EF]">
        {post.featuredImage && (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <p className="mt-4 text-[13px] text-wawa-charcoal/55">{formatDate(post.date, lang)}</p>
      <h3 className="mt-1.5 text-[19px] leading-snug tracking-tight text-wawa-charcoal">
        <span className="underline decoration-transparent decoration-2 underline-offset-[5px] transition-[text-decoration-color] group-hover:decoration-wawa-accent">
          {post.title}
        </span>
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-wawa-charcoal/65">{excerpt(post.html, 140)}</p>
    </Link>
  );
}

export function ProjectCard({ project, category }: { project: Project; category?: string | null }) {
  const brand = project.meta?.["Marka"];
  return (
    <Link href={project.path} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3F2EF]">
        {project.featuredImage && (
          <Image
            src={project.featuredImage}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-[19px] leading-snug tracking-tight text-wawa-charcoal">
          <span className="underline decoration-transparent decoration-2 underline-offset-[5px] transition-[text-decoration-color] group-hover:decoration-wawa-accent">
            {project.title}
          </span>
        </h3>
        {(category || brand) && <p className="shrink-0 text-[13px] text-wawa-charcoal/55">{category || brand}</p>}
      </div>
    </Link>
  );
}

export function FaqList({ items, lang }: { items: { q: string; a: string }[]; lang: Lang }) {
  if (!items.length) return null;
  return (
    <section className="mt-16 lg:mt-20">
      <h2 className="font-heading text-[24px] leading-[1.2] font-normal text-wawa-charcoal lg:text-[30px]">{t(lang).labels.faq}</h2>
      <div className={`mt-8 border-t ${LINE}`}>
        {items.map((f) => (
          <details key={f.q} className={`group border-b ${LINE}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] text-wawa-charcoal lg:text-lg [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center text-xl transition-transform group-open:rotate-45 group-open:bg-wawa-accent">
                +
              </span>
            </summary>
            <div className="wawa-prose pb-6 text-[16px]" dangerouslySetInnerHTML={{ __html: `<p>${f.a}</p>` }} />
          </details>
        ))}
      </div>
    </section>
  );
}

// Sayfa sonu kapanış bandı: teklif ve iletişim
export function CtaBand({ lang }: { lang: Lang }) {
  const D = t(lang);
  const text = {
    tr: "Projenizi anlatın, size en kısa sürede dönelim.",
    en: "Tell us about your project and we will get back to you shortly.",
    de: "Erzählen Sie uns von Ihrem Projekt, wir melden uns zeitnah.",
    it: "Raccontaci il tuo progetto, ti risponderemo a breve.",
    fr: "Parlez-nous de votre projet, nous vous répondrons rapidement.",
  }[lang];
  return (
    <section className="bg-[#F3F2EF]" lang={lang}>
      <div className="container-wide flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        <p className="max-w-[24ch] font-heading text-[24px] leading-[1.25] text-balance text-wawa-charcoal lg:text-[32px]">{text}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={ROUTES[lang].offer}
            className="group inline-flex items-center gap-4 bg-wawa-accent px-7 py-4 text-[15px] font-medium text-wawa-charcoal transition-colors duration-300 hover:bg-wawa-charcoal hover:text-white"
          >
            {D.cta.offer}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href={ROUTES[lang].contact}
            className="group inline-flex items-center gap-4 bg-white px-7 py-4 text-[15px] text-wawa-charcoal transition-colors duration-300 hover:bg-wawa-charcoal hover:text-white"
          >
            {D.nav.contact}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export { formatDate, LINE };

// Stand sayfalarının açılışı: arkada sessiz YouTube videosu, solda başlık, sağda aşamalı hızlı teklif.
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowDown } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { kvkkPath, privacyPath } from "@/content/legal";
import { svcLang } from "./service-sections";
import { VideoBackdrop } from "./VideoBackdrop";
import { QuoteWizard } from "./QuoteWizard";

const PROJECTS = { tr: "Projeleri inceleyin", en: "See projects", de: "Projekte ansehen" };

export function StandHero({
  lang,
  title,
  lead,
  breadcrumb,
  videoId,
  poster,
  images,
  fairs = [],
  variant = "stand",
  hasProjects,
}: {
  lang: Lang;
  title: string;
  lead: string;
  breadcrumb: { label: string; href: string };
  videoId?: string;
  poster?: string;
  images?: string[]; // video yoksa arkada sırayla geçen fotoğraflar
  fairs?: string[];
  variant?: "stand" | "interior";
  hasProjects: boolean;
}) {
  const k = svcLang(lang);
  const words = title.trim().split(/\s+/);
  const last = words.pop() ?? "";
  // Kısa başlıklar (örn. "Fuar Standı") büyük, uzun başlıklar daha küçük yazılır
  const size = title.length <= 14 ? "text-[40px] sm:text-[60px] lg:text-[72px] xl:text-[80px]" : "text-[30px] sm:text-[42px] lg:text-[50px]";
  return (
    <section className="relative isolate overflow-hidden bg-wawa-charcoal pt-20 text-white lg:pt-[116px]">
      <VideoBackdrop id={videoId} poster={poster} images={images} />
      <div className="container-wide grid gap-10 py-10 lg:min-h-[calc(100svh-116px)] lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-14">
        <div className="lg:col-span-6">
          <Link href={breadcrumb.href} className="text-[13px] tracking-[0.12em] text-white/70 uppercase underline-offset-4 hover:text-white hover:underline">
            {breadcrumb.label}
          </Link>
          <h1 className={`mt-4 font-heading leading-[1.06] font-normal tracking-[-0.01em] text-balance text-white ${size}`}>
            <span className="sr-only">{title}</span>
            <span aria-hidden>
              {words.join(" ")}{" "}
              {/* Koyu zeminde sarı şerit harflerin arkasında değil, altında ince bir çizgi olur */}
              <span className="svc-build whitespace-nowrap after:!-bottom-[0.14em] after:!h-[0.08em]">
                {[...last].map((ch, i) => (
                  <span key={i} className="p" style={{ animationDelay: `${0.35 + i * 0.05}s`, "--r": `${(i % 2 ? 1 : -1) * (6 + ((i * 7) % 10))}deg` } as CSSProperties}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-white/85 lg:mt-8">{lead}</p>
          {hasProjects && (
            <a href="#projeler" className="group mt-8 inline-flex items-center gap-3 border border-white/40 px-5 py-3.5 text-[15px] text-white transition-colors hover:border-white hover:bg-white hover:text-wawa-charcoal">
              {PROJECTS[k]}
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
            </a>
          )}
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <QuoteWizard lang={lang} k={k} service={title} fairs={fairs} variant={variant} privacyHref={lang === "tr" ? kvkkPath : privacyPath(lang)} />
        </div>
      </div>
    </section>
  );
}

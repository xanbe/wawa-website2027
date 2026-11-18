"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { heroSlides } from "./hero-slides";

const SLIDE_DURATION = 7000; // ms — her sektörün ekranda kalma süresi
const WIPE_DURATION = 1.4; // s — cetvel çizgisinin ekranı geçme süresi
const EASE_LUX = [0.83, 0, 0.17, 1] as const;

export function HeroSlider() {
  const reduceMotion = !!useReducedMotion();
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);

  const count = heroSlides.length;
  const slide = heroSlides[index];
  const isPaused = isHovered || isUserPaused;
  const isWiping = prevIndex !== null && !reduceMotion;

  const goTo = (next: number) => {
    if (next === index) return;
    setPrevIndex(index);
    setIndex(next);
  };
  const goNext = () => goTo((index + 1) % count);
  const goPrev = () => goTo((index - 1 + count) % count);

  return (
    <>
      <section
        aria-roledescription="carousel"
        aria-label="Sektörlere göre projeler"
        className="pt-20 lg:pt-[116px]"
      >
        <motion.div
          className="relative h-[calc(100svh-80px)] min-h-[600px] max-h-[1000px] overflow-hidden bg-wawa-charcoal lg:h-[calc(100svh-116px)]"
          style={{ touchAction: "pan-y" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onPanEnd={(_, info) => {
            if (info.offset.x < -60) goNext();
            else if (info.offset.x > 60) goPrev();
          }}
        >
          {/* Tüm görseller hep yüklü kalır; geçişte siyah ekran olmasın diye sadece katman sırası değişir.
              Aktif görsel üstte, cetvel çizgisinin arkasından açılır; önceki görsel altında bekler. */}
          {heroSlides.map((s, i) => {
            const isCurrent = i === index;
            const isPrev = i === prevIndex;
            return (
              <motion.div
                key={s.image}
                className="absolute inset-0 overflow-hidden"
                style={{ zIndex: isCurrent ? 2 : isPrev ? 1 : 0, visibility: isCurrent || isPrev ? "visible" : "hidden" }}
                // İlk görsel sunucudan doğrudan görünür gelir (JS yüklenmeden siyah ekran olmasın)
                initial={false}
                animate={{
                  clipPath: isCurrent && isWiping ? ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] : "inset(0 0% 0 0)",
                }}
                transition={{ duration: isCurrent && isWiping ? WIPE_DURATION : 0, ease: EASE_LUX }}
                onAnimationComplete={() => {
                  if (isCurrent) setPrevIndex(null);
                }}
              >
                {/* Aktif görsel slayt boyunca yavaşça uzaklaşır */}
                <div
                  className="absolute inset-0"
                  style={{
                    animation:
                      isCurrent && !reduceMotion
                        ? `hero-kenburns ${WIPE_DURATION * 1000 + SLIDE_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`
                        : "none",
                  }}
                >
                  <Image
                    src={s.image}
                    alt={isCurrent ? s.alt : ""}
                    fill
                    priority={i === 0}
                    loading="eager"
                    sizes="100vw"
                    quality={90}
                    className="object-cover"
                  />
                </div>
              </motion.div>
            );
          })}

          {/* Mimarın cetveli gibi ekranı geçen ince çizgi */}
          {isWiping && (
            <motion.div
              key={`line-${index}`}
              className="pointer-events-none absolute inset-y-0 z-[5] w-px bg-white"
              initial={{ left: "0%", opacity: 1 }}
              animate={{ left: "100%", opacity: [1, 1, 0] }}
              transition={{ duration: WIPE_DURATION, ease: EASE_LUX, opacity: { duration: WIPE_DURATION, times: [0, 0.85, 1] } }}
            />
          )}

          {/* Okunabilirlik için karartma */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-black/45" />

          <div className="absolute inset-0 z-20 flex flex-col justify-end">
            <div className="container-wide w-full pb-8 lg:pb-12">
              <h1 className="max-w-4xl font-heading text-[30px] leading-[1.15] font-normal tracking-[-0.01em] text-balance text-white sm:text-[44px] lg:text-[60px]">
                Mekâna kimlik kazandıran iç mimar ekibi.
              </h1>
              <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:items-end lg:justify-between">
                <p className="max-w-[52ch] text-lg leading-relaxed text-white">
                  Konut, ofis ve ticari mekânlar için iç mimari tasarım ve uygulama. Konseptten özel üretim mobilyaya, tüm süreci tek ekiple
                  yönetiyoruz.
                </p>
                <div className="flex shrink-0 flex-wrap gap-3">
                  {/* Asıl hedef görüşme: sarı ana buton iletişime, ikincil buton projelere gider */}
                  <Link
                    href="/iletisim/"
                    className="group inline-flex items-center gap-4 bg-wawa-accent px-7 py-4 text-[15px] font-medium text-wawa-charcoal transition-colors duration-300 hover:bg-white"
                  >
                    Projenizi Konuşalım
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/projelerimiz/"
                    className="inline-flex items-center border border-white/50 px-7 py-4 text-[15px] font-medium text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-wawa-charcoal"
                  >
                    Projeleri İnceleyin
                  </Link>
                </div>
              </div>

              {/* Sektör sekmeleri */}
              <div className="mt-10 flex items-end justify-between gap-3 sm:gap-6 lg:mt-14">
                {/* Sekmeler ekran genişliği ne olursa olsun tek satırda, slayt sayısı kadar eşit sütunda durur */}
                <div
                  className="grid min-w-0 flex-1 gap-x-2 sm:gap-x-6 lg:max-w-4xl"
                  style={{ gridTemplateColumns: `repeat(${heroSlides.length}, minmax(0, 1fr))` }}
                >
                  {heroSlides.map((s, i) => {
                    const isActive = i === index;
                    return (
                      <button
                        key={s.sector}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={isActive}
                        aria-label={`${s.sector} projelerini göster`}
                        className="group cursor-pointer text-left"
                      >
                        <span className="relative block h-[2px] w-full overflow-hidden bg-white/25">
                          {isActive && (
                            <span
                              key={index}
                              className="absolute inset-0 origin-left bg-white"
                              style={{
                                animation: `hero-progress ${SLIDE_DURATION}ms linear forwards`,
                                animationPlayState: isPaused ? "paused" : "running",
                              }}
                              onAnimationEnd={goNext}
                            />
                          )}
                        </span>
                        <span
                          title={s.sector}
                          className={`mt-3 block truncate text-[11px] tracking-tight transition-colors sm:text-[15px] sm:tracking-normal ${
                            isActive ? "text-white" : "text-white/70 group-hover:text-white"
                          }`}
                        >
                          {s.sector}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <Link
                  href={slide.href}
                  className="group/project hidden items-center gap-2 pb-1 text-sm whitespace-nowrap text-white lg:flex"
                >
                  {slide.project}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/project:-translate-y-0.5 group-hover/project:translate-x-0.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsUserPaused((paused) => !paused)}
                  aria-label={isUserPaused ? "Slaytları oynat" : "Slaytları durdur"}
                  className="mb-0.5 grid h-9 w-9 shrink-0 cursor-pointer place-items-center border border-white/30 sm:h-10 sm:w-10 text-white transition-colors hover:bg-white hover:text-wawa-charcoal"
                >
                  {isUserPaused ? (
                    <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
                  ) : (
                    <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="sr-only" aria-live={isPaused ? "polite" : "off"}>
            {`${slide.sector}: ${slide.project}`}
          </p>
        </motion.div>
      </section>
    </>
  );
}

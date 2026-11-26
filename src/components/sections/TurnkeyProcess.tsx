"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { SectionHeader, SectionLead } from "./SectionHeading";
import { HOME } from "@/content/home";

// Süreç adımları yönetim panelinden (src/content/home.json) düzenlenir
const STEPS = HOME.process;

const INTERVAL = 5000;

export function TurnkeyProcess() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const reduceMotion = useReducedMotion();
  // Adımlar, aktif adımın süre çubuğu dolunca ilerler. Bölüm ekran dışındayken ya da adım başlıklarının
  // üzerine gelindiğinde çubuk olduğu yerde bekler, sonra kaldığı yerden devam eder.
  const auto = !reduceMotion;
  const playing = inView && !paused;
  const next = () => setActive((i) => (i + 1) % STEPS.length);

  const step = STEPS[active];

  return (
    <section ref={sectionRef} aria-labelledby="process-title" className="bg-[#F3F2EF]">
      <div className="container-wide pt-14 lg:pt-16 pb-8 lg:pb-10">
        <SectionHeader id="process-title" title="Tasarımdan teslime, şeffaf bir süreç.">
          <SectionLead>Keşiften anahtar teslime üç aşama; her karar ve revizyon kayıtlı, her adım tek ekipte.</SectionLead>
        </SectionHeader>

        <div>
          {/* Zaman çizelgesi: üç adım tek satırda */}
          <ol
            className="mt-10 grid grid-cols-3 gap-3 lg:mt-14 lg:gap-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {STEPS.map((s, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    aria-pressed={isActive}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <span className="relative block h-[3px] bg-wawa-charcoal/10">
                      {(isActive || isDone) && (
                        <span
                          key={isActive ? `active-${active}` : "done"}
                          className="absolute inset-0 origin-left bg-wawa-charcoal"
                          style={
                            isActive && auto
                              ? {
                                  animation: `hero-progress ${INTERVAL}ms linear forwards`,
                                  animationPlayState: playing ? "running" : "paused",
                                }
                              : undefined
                          }
                          onAnimationEnd={isActive && auto ? next : undefined}
                        />
                      )}
                    </span>
                    <span className="mt-4 block text-sm tabular-nums text-wawa-charcoal/65">{i + 1}</span>
                    <span
                      className={`mt-1 block text-sm leading-snug tracking-tight transition-colors duration-300 sm:text-lg lg:text-2xl ${
                        isActive ? "text-wawa-charcoal" : "text-wawa-charcoal/50 group-hover:text-wawa-charcoal"
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Seçili adımın görseli ve detayı */}
          <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-12">
            <div className="relative aspect-[4/3] overflow-hidden bg-wawa-charcoal/10 lg:col-span-7 lg:aspect-[16/10]">
              {STEPS.map((s, i) => (
                <Image
                  key={s.image}
                  src={s.image}
                  alt={i === active ? s.alt : ""}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  quality={90}
                  className={`object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                  }`}
                  style={{ objectPosition: s.position }}
                />
              ))}
            </div>

            <div key={active} className="flex animate-fade-in flex-col justify-between gap-8 lg:col-span-5">
              <div>
                <h3 className="font-heading text-[24px] font-normal leading-[1.2] tracking-[-0.01em] text-balance text-wawa-charcoal lg:text-[30px]">{step.title}</h3>
                <p className="mt-5 text-lg leading-relaxed text-wawa-charcoal">{step.text}</p>
                <ul className="mt-7 space-y-3">
                  {step.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-[17px] text-wawa-charcoal">
                      <span className="h-2 w-2 shrink-0 bg-wawa-accent" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

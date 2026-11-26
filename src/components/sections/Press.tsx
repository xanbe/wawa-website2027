"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { HOME } from "@/content/home";

// Basından: WAWA hakkında çıkan haberler (önceki sitedeki "Basında Biz" sayfasından; bağlantılar yayınların kendi sayfalarıdır).
// Koyu, dar bir bant: solda seçili haberin başlığı, sağda yayın logoları. Kendiliğinden dönmez; logoya gelince değişir.
const PRESS = HOME.press;

export function Press() {
  const [active, setActive] = useState(0);
  const item = PRESS[active];

  return (
    <section aria-labelledby="press-title" className="bg-[#141414] text-white">
      <div className="container-wide grid gap-8 py-12 lg:grid-cols-12 lg:gap-10 lg:py-14">
        {/* Seçili haber */}
        <div className="flex flex-col lg:col-span-5">
          <SectionHeading id="press-title" size="compact" className="!text-white">
            Basından.
          </SectionHeading>
          <div key={active} className="mt-6 flex min-h-[132px] flex-1 flex-col lg:mt-8" style={{ animation: "fadeIn .45s ease" }} aria-live="polite">
            <p className="flex items-center gap-2.5 text-[12px] tracking-[0.14em] text-white/55 uppercase">
              <span aria-hidden className="h-1.5 w-1.5 bg-wawa-accent" />
              {item.source} · {item.date}
            </p>
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="group mt-3 block">
              <span className="block text-[19px] leading-[1.4] text-balance text-white lg:text-[22px]">“{item.title}”</span>
              <span className="mt-4 inline-flex items-center gap-2 text-[14px] text-white/70 underline decoration-white/25 underline-offset-[6px] transition-colors group-hover:text-wawa-accent group-hover:decoration-wawa-accent">
                Haberi okuyun
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
            </a>
          </div>
        </div>

        {/* Yayınlar */}
        <ul className="grid grid-cols-3 self-start border-t border-l border-white/12 lg:col-span-6 lg:col-start-7">
          {PRESS.map((p, i) => {
            const on = i === active;
            return (
              <li key={p.source} className="border-r border-b border-white/12">
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${p.source}: ${p.title}`}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`relative grid h-[76px] w-full cursor-pointer place-items-center px-4 transition-colors duration-300 sm:h-[92px] sm:px-6 ${on ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"}`}
                >
                  <span aria-hidden className={`absolute inset-x-0 top-0 h-[2px] origin-left bg-wawa-accent transition-transform duration-300 ${on ? "scale-x-100" : "scale-x-0"}`} />
                  <Image
                    src={p.logo.src}
                    alt=""
                    width={p.logo.w}
                    height={p.logo.h}
                    sizes="150px"
                    className={`h-auto w-auto max-w-full object-contain transition-opacity duration-300 sm:max-w-[150px] ${p.logo.cls} ${on ? "opacity-100" : "opacity-45"}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

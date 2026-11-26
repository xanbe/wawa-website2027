"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useDragMarquee } from "./useDragMarquee";
import { HOME } from "@/content/home";

const BRANDS = HOME.brands;



function BrandRow({ hidden = false, rowRef }: { hidden?: boolean; rowRef?: React.Ref<HTMLUListElement> }) {
  return (
    <ul ref={rowRef} className="flex shrink-0" aria-hidden={hidden || undefined}>
      {BRANDS.map((brand) => (
        // Çerçeveli hücre: 1px boşluktan görünen zemin çerçeveyi oluşturur; üzerine gelince fareyi izleyen yeşil kontür belirir
        <li
          key={brand.name}
          className="group/logo relative -ml-px shrink-0 bg-black/10 p-px hover:z-10"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
          }}
        >
          {/* Kartın arkasından taşan yumuşak yeşil hale */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 opacity-0 blur-lg transition-opacity duration-300 group-hover/logo:opacity-70"
            style={{ background: "radial-gradient(160px circle at calc(var(--x, 50%) + 12px) calc(var(--y, 50%) + 12px), #E7E864, transparent 75%)" }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100"
            style={{ background: "radial-gradient(200px circle at var(--x, 50%) var(--y, 50%), #D9DA3F 0%, #E7E864 35%, transparent 80%)" }}
          />
          {/* Hücrenin içi düz beyaz kalır; ışık yalnızca arkadaki çerçevede parlar, logoya dokunmaz */}
          <div className="relative flex h-24 w-[180px] items-center justify-center bg-white px-7 lg:h-28 lg:w-[220px] lg:px-9">
            <Image
              src={brand.src}
              alt={hidden ? "" : brand.name}
              width={300}
              height={113}
              sizes="160px"
              draggable={false}
              className="pointer-events-none h-auto max-h-12 w-full object-contain transition duration-500 [filter:url(#brand-ink)] group-hover/logo:[filter:none]"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Kendiliğinden kayan, fare/parmakla sürüklenebilen sonsuz logo şeridi
function BrandMarquee() {
  const { x, rowRef, containerProps } = useDragMarquee({ speed: 0.035, maxFling: 1.6 });

  return (
    <div
      className="mt-6 cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing lg:mt-8"
      // Kenarlarda yumuşakça kaybolur; şerit sayfanın içinden akıyor gibi durur
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
      }}
      {...containerProps}
    >
      <motion.div className="flex w-max" style={{ x }}>
        <BrandRow rowRef={rowRef} />
        <BrandRow hidden />
      </motion.div>
    </div>
  );
}

// Hero'nun hemen altı: referans logoları
export function GlobalBrands() {
  return (
    <section aria-labelledby="brands-title" className="bg-white pt-8 lg:pt-10 pb-8 lg:pb-10">
      {/* Logolar beyaz zeminli ve çoğu açık gri: gri tona çevirip orta tonları koyulaştırır, beyaz zemin beyaz kalır */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="brand-ink" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude="1" exponent="2.4" offset="0" />
            <feFuncG type="gamma" amplitude="1" exponent="2.4" offset="0" />
            <feFuncB type="gamma" amplitude="1" exponent="2.4" offset="0" />
          </feComponentTransfer>
        </filter>
      </svg>

      <div className="container-wide">
        <h2 id="brands-title" className="mx-auto max-w-[68ch] text-center text-[17px] leading-relaxed font-normal text-wawa-charcoal/70">
          <strong className="font-semibold text-wawa-charcoal">Uluslararası markalar</strong> ve{" "}
          <strong className="font-semibold text-wawa-charcoal">Borsa İstanbul</strong>’da işlem gören şirketler için ofisten
          mağazaya, showroom’dan fuar standına uzanan mekânlar tasarlıyor ve hayata geçiriyoruz.
        </h2>
      </div>

      <BrandMarquee />
    </section>
  );
}

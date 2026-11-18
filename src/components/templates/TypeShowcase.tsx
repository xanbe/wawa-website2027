"use client";

// Tür vitrini: solda büyük, numaralı tür adları; sağda büyük görsel. Ada gelince görsel o türe geçer.
// Mobilde görselli kartlar yan yana kayar.
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type TypeItem = { name: string; href: string; image: string | null; current: boolean };

const two = (n: number) => String(n).padStart(2, "0");

export function TypeShowcase({ title, items, viewLabel }: { title: string; items: TypeItem[]; viewLabel: string }) {
  const start = Math.max(0, items.findIndex((i) => i.current));
  const [active, setActive] = useState(start);
  if (items.length < 2) return null;
  const fallback = items.find((i) => i.image)?.image ?? null;
  const cur = items[active];

  return (
    <section className="bg-white" aria-labelledby="svc-types">
      <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
        <div className="flex items-end justify-between gap-6 border-t border-wawa-charcoal pt-6 lg:pt-8">
          <h2 id="svc-types" className="font-heading text-[26px] leading-[1.2] font-normal text-wawa-charcoal lg:text-[38px]">
            {title}
          </h2>
          <span className="hidden font-heading text-[15px] tabular-nums text-wawa-charcoal/40 lg:block">
            {two(active + 1)} / {two(items.length)}
          </span>
        </div>

        {/* Masaüstü: liste + büyük görsel */}
        <div className="mt-10 hidden gap-10 lg:grid lg:grid-cols-12">
          <ol className="self-center lg:col-span-5" onMouseLeave={() => setActive(start)}>
            {items.map((it, i) => {
              const on = i === active;
              return (
                <li key={it.href} className="border-b border-wawa-charcoal/12 first:border-t">
                  <Link
                    href={it.href}
                    aria-current={it.current ? "page" : undefined}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex items-center gap-5 py-5"
                  >
                    <span className={`w-7 text-[12px] tabular-nums transition-colors ${on ? "text-wawa-charcoal" : "text-wawa-charcoal/35"}`}>{two(i + 1)}</span>
                    <span
                      className={`flex-1 font-heading text-[24px] leading-[1.15] transition-[color,transform] duration-300 xl:text-[30px] ${
                        on ? "translate-x-2 text-wawa-charcoal" : "text-wawa-charcoal/30"
                      }`}
                    >
                      {it.name}
                    </span>
                    {it.current && <span aria-hidden className="h-2.5 w-2.5 shrink-0 bg-wawa-accent outline outline-1 outline-wawa-charcoal" />}
                    <ArrowUpRight className={`h-5 w-5 shrink-0 transition-[opacity,transform] duration-300 ${on ? "opacity-100" : "-translate-x-2 opacity-0"}`} aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="lg:col-span-7">
            <Link href={cur.href} tabIndex={-1} aria-hidden className="group relative block aspect-[4/3] overflow-hidden bg-[#F3F2EF]">
              {items.map((it, i) => {
                const src = it.image ?? fallback;
                return src ? (
                  <Image
                    key={it.href}
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className={`object-cover transition-[opacity,transform] duration-700 ease-out ${i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"}`}
                  />
                ) : null;
              })}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              {/* Sarı köşe: sıra numarası */}
              <span className="absolute top-0 left-0 grid h-20 w-20 place-items-center bg-wawa-accent font-heading text-[22px] tabular-nums text-wawa-charcoal">{two(active + 1)}</span>
              <span className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4">
                <span key={active} className="font-heading text-[26px] leading-[1.15] text-white xl:text-[34px]" style={{ animation: "fadeIn .4s ease" }}>
                  {cur.name}
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 bg-white px-4 py-2.5 text-[14px] text-wawa-charcoal transition-colors group-hover:bg-wawa-accent">
                  {viewLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* Mobil: görselli kartlar */}
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {items.map((it, i) => {
            const src = it.image ?? fallback;
            return (
              <li key={it.href} className="w-[72%] shrink-0 snap-start sm:w-[44%]">
                <Link href={it.href} aria-current={it.current ? "page" : undefined} className="relative block aspect-[4/5] overflow-hidden bg-[#F3F2EF]">
                  {src && <Image src={src} alt="" fill sizes="(min-width: 640px) 44vw, 72vw" className="object-cover" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className={`absolute top-0 left-0 grid h-12 w-12 place-items-center font-heading text-[15px] tabular-nums text-wawa-charcoal ${it.current ? "bg-wawa-accent" : "bg-white"}`}>
                    {two(i + 1)}
                  </span>
                  <span className="absolute right-4 bottom-4 left-4 font-heading text-[20px] leading-[1.2] text-white">{it.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

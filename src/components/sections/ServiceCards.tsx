"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeader, SectionLead } from "./SectionHeading";

const SERVICES = [
  {
    title: "İç Mimarlık",
    caption: "Konseptten anahtar teslime",
    items: ["Konut & Villa", "Klinik", "Mağaza & Restoran", "Ofis"],
    href: "/hizmetler/",
    image: "/images/projects/halide-akinci-klinik-tasarim.webp",
    position: "80% 50%",
    alt: "Halide Akıncı klinik bekleme salonu",
  },
  {
    title: "Fuar Standı",
    caption: "Dünya fuarlarında WAWA imzası",
    items: ["Fuar Standı", "Kongre Standı", "Plus Stand"],
    href: "/fuar-standi/",
    image: "/images/projects/dila-exclusive.jpg",
    position: "50% 50%",
    alt: "Dila Exclusive kuyum fuarı standı",
  },
  {
    title: "İnşaat Taahhüt",
    caption: "Planlı, denetimli, zamanında",
    items: ["Kaba İnşaat", "İnce İşçilik", "Proje Yönetimi"],
    href: "/insaat-taahhut/",
    image: "/images/projects/acarkent-villa-tasarimi.webp",
    position: "42% 50%",
    alt: "Acarkent villa inşaat projesi",
  },
  {
    title: "Mobilya Üretim",
    caption: "Ölçüye özel, atölyeden",
    items: ["Özel Tasarım", "Atölye Üretimi", "Montaj"],
    href: "/mobilya-uretim/",
    image: "/images/projects/fulya-klinik-tasarim.webp",
    position: "90% 50%",
    alt: "Projeye özel üretilmiş lounge koltuk",
  },
];

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export function ServiceCards() {
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="services-title" className="bg-white">
      <div className="container-wide pt-8 lg:pt-10 pb-8 lg:pb-10">
        <SectionHeader id="services-title" title="Dört uzmanlık, tek ekip.">
          <SectionLead>Tasarımı, standı, inşaatı ve mobilya üretimini aynı çatı altında, tek takvimle yönetiyoruz.</SectionLead>
            <Link
              href="/hizmetler/"
              className="group inline-flex items-center gap-2 text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] transition-colors hover:decoration-wawa-charcoal"
            >
              Tüm hizmetler
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
        </SectionHeader>

        {/* Genişleyen paneller: üzerine gelinen alan açılır, diğerleri ince sütunlara çekilir */}
        <div className="mt-12 flex flex-col gap-3 lg:mt-16 lg:h-[640px] lg:flex-row">
          {SERVICES.map((service, i) => {
            const isActive = i === active;
            return (
              <article
                key={service.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`group/panel relative overflow-hidden bg-wawa-charcoal transition-[flex-grow,height] duration-[900ms] ${EASE} lg:h-auto lg:basis-0 ${
                  isActive ? "h-[440px] sm:h-[500px]" : "h-[88px]"
                }`}
                style={{ flexGrow: isActive ? 3.6 : 1 }}
              >
                <Image
                  src={service.image}
                  alt={isActive ? service.alt : ""}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  quality={90}
                  className={`object-cover transition-[filter,transform] duration-[1200ms] ${EASE} ${
                    isActive
                      ? "scale-100"
                      : "scale-[1.08] grayscale sepia-[0.15] contrast-[1.06] brightness-[0.95]"
                  }`}
                  style={{ objectPosition: service.position }}
                />

                {/* Okunabilirlik için yumuşak karartma */}
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                    isActive ? "bg-black/40" : "bg-black/35 group-hover/panel:bg-black/25"
                  }`}
                />

                {/* Kapalı panel: mobilde yatay, masaüstünde dikey başlık */}
                <span
                  aria-hidden
                  className={`absolute z-10 text-xl tracking-tight text-white transition-opacity duration-300 max-lg:top-1/2 max-lg:right-6 max-lg:-translate-y-1/2 lg:bottom-7 lg:left-1/2 lg:-translate-x-1/2 lg:rotate-180 lg:text-2xl lg:whitespace-nowrap lg:[writing-mode:vertical-rl] ${
                    isActive ? "opacity-0" : "opacity-100 delay-300"
                  }`}
                >
                  {service.title}
                </span>

                {/* Açık panel içeriği; panel genişlerken satır kırılmasın diye sabit genişlikte */}
                <div
                  className={`absolute inset-x-5 bottom-5 z-10 transition-[opacity,translate] duration-700 sm:inset-x-7 sm:bottom-7 lg:right-auto lg:w-[520px] ${EASE} ${
                    isActive ? "visible translate-y-0 opacity-100 delay-300" : "pointer-events-none invisible translate-y-4 opacity-0"
                  }`}
                >
                  <h3 className="font-heading text-[30px] font-normal leading-[1.1] tracking-[-0.01em] text-white sm:text-[38px] lg:text-[44px]">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-lg text-white">{service.caption}</p>
                  <p className="mt-2 text-[15px] text-white/80">{service.items.join(" · ")}</p>
                </div>

                {/* Açık panelde sağ üstte yeşil yön oku */}
                <span
                  aria-hidden
                  className={`absolute top-4 right-4 z-10 grid h-12 w-12 place-items-center bg-wawa-accent text-wawa-charcoal transition-[opacity,scale] duration-500 lg:top-5 lg:right-5 lg:h-14 lg:w-14 ${
                    isActive ? "scale-100 opacity-100 delay-300" : "scale-50 opacity-0"
                  }`}
                >
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover/panel:rotate-45" />
                </span>

                {/* Kapalıyken dokununca açar, açıkken sayfaya götürür */}
                {isActive ? (
                  <Link href={service.href} aria-label={`${service.title} sayfasına git`} className="absolute inset-0 z-20" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${service.title} alanını göster`}
                    className="absolute inset-0 z-20 cursor-pointer"
                  />
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

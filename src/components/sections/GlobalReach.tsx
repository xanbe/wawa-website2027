"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { useInView, useReducedMotion } from "motion/react";
import { REGION_DOTS } from "./globe-region-dots";
import { SectionHeading } from "./SectionHeading";

type City = { id: string; name: string; location: [number, number] };

const HUB: City = { id: "istanbul", name: "İstanbul", location: [41.01, 28.98] };

// Her bölgenin listede görünen şehir/ülkeleri (yaylar başkent ya da şehre uzanır) ve kürenin o bölgeye döndüğünde bakacağı nokta
const REGIONS: { key: string; name: string; focus: [number, number]; zoom: number; cities: City[] }[] = [
  {
    key: "avrupa",
    name: "Avrupa",
    focus: [47, 18],
    zoom: 1.7,
    cities: [
      { id: "almanya", name: "Almanya", location: [52.52, 13.4] },
      { id: "fransa", name: "Fransa", location: [48.86, 2.35] },
      { id: "italya", name: "İtalya", location: [41.9, 12.5] },
      { id: "ispanya", name: "İspanya", location: [40.42, -3.7] },
      { id: "hollanda", name: "Hollanda", location: [52.37, 4.9] },
      { id: "belcika", name: "Belçika", location: [50.85, 4.35] },
      { id: "isvec", name: "İsveç", location: [59.33, 18.07] },
      { id: "polonya", name: "Polonya", location: [52.23, 21.01] },
      { id: "romanya", name: "Romanya", location: [44.43, 26.1] },
      { id: "rusya", name: "Rusya", location: [55.76, 37.62] },
    ],
  },
  {
    key: "birlesik-krallik",
    name: "Birleşik Krallık",
    focus: [48, 14],
    zoom: 1.6,
    cities: [
      { id: "londra", name: "Londra", location: [51.51, -0.13] },
      { id: "birmingham", name: "Birmingham", location: [52.49, -1.89] },
    ],
  },
  {
    key: "amerika",
    name: "Amerika",
    focus: [40, -60],
    zoom: 0.9,
    cities: [
      { id: "new-york", name: "New York", location: [40.71, -74.01] },
      { id: "miami", name: "Miami", location: [25.76, -80.19] },
      { id: "los-angeles", name: "Los Angeles", location: [34.05, -118.24] },
    ],
  },
  {
    key: "ortadogu",
    name: "Ortadoğu & Afrika",
    focus: [24, 22],
    zoom: 1.15,
    cities: [
      { id: "irak", name: "Irak", location: [33.31, 44.36] },
      { id: "suriye", name: "Suriye", location: [33.51, 36.29] },
      { id: "suudi-arabistan", name: "Suudi Arabistan", location: [24.71, 46.68] },
      { id: "fildisi-sahili", name: "Fildişi Sahili", location: [5.36, -4.01] },
      { id: "dubai", name: "Dubai", location: [25.2, 55.27] },
    ],
  },
];

const INTERVAL = 4500;
const LIME: [number, number, number] = [0.906, 0.91, 0.392];
const INK: [number, number, number] = [0.12, 0.12, 0.12];
const ARC: [number, number, number] = [0.55, 0.55, 0.55];
const TAU = Math.PI * 2;

// Bir enlem/boylamı kürenin ortasına getiren dönüş açıları
const toAngles = ([lat, lng]: [number, number]) => [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180 * 0.85];

function globeData(active: number) {
  const region = REGIONS[active];
  // Bölgenin ülkeleri kürenin kendi noktalarıyla yeşile boyanır; şehirlere yalnızca ince yaylar uzanır
  const markers = [
    ...REGION_DOTS[region.key].map((location) => ({ location, size: 0.012, color: LIME })),
    { location: HUB.location, size: 0.03, color: INK, id: HUB.id },
  ];
  const arcs = region.cities.map((c) => ({ from: HUB.location, to: c.location }));
  return { markers, arcs };
}

function Globe({ active }: { active: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const focusRef = useRef(toAngles(REGIONS[active].focus));
  const zoomRef = useRef(REGIONS[active].zoom);
  const dragRef = useRef<{ x: number; offset: number } | null>(null);
  const offsetRef = useRef(0);
  const reduceMotion = useReducedMotion();

  // Küre bir kez kurulur; kendi döngüsünde seçili bölgeye yumuşakça döner
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;opacity:0;transition:opacity 1s ease";
    host.append(canvas);

    let [phi, theta] = focusRef.current;
    let scale = zoomRef.current;
    let size = host.clientWidth;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi,
      theta,
      scale,
      dark: 0,
      diffuse: 2,
      // REGION_DOTS bu ızgaraya göre üretildi
      mapSamples: 24000,
      mapBrightness: 0.4,
      mapBaseBrightness: 0,
      baseColor: [1, 1, 1],
      markerColor: LIME,
      glowColor: [0.953, 0.949, 0.937],
      arcColor: ARC,
      arcWidth: 0.12,
      arcHeight: 0.18,
      markerElevation: 0.01,
      ...globeData(active),
    });
    globeRef.current = globe;
    requestAnimationFrame(() => (canvas.style.opacity = "1"));

    const ro = new ResizeObserver(() => {
      size = host.clientWidth;
      globe.update({ width: size * dpr, height: size * dpr });
    });
    ro.observe(host);

    let raf = 0;
    const tick = () => {
      const [fPhi, fTheta] = focusRef.current;
      const target = fPhi + offsetRef.current;
      // En kısa yönden dön
      const ahead = (target - phi + TAU * 4) % TAU;
      const behind = (phi - target + TAU * 4) % TAU;
      const ease = reduceMotion ? 1 : 0.06;
      phi += ahead < behind ? ahead * ease : -behind * ease;
      theta += (fTheta - theta) * ease;
      scale += (zoomRef.current - scale) * ease;
      // Bırakılınca elle çevrilen açı yavaşça bölgeye geri döner
      if (!dragRef.current) offsetRef.current *= 0.97;
      globe.update({ phi, theta, scale });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      globe.destroy();
      globeRef.current = null;
      host.replaceChildren();
    };
    // Kurulum yalnızca bir kez; bölge değişimi aşağıdaki efektle iletilir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    focusRef.current = toAngles(REGIONS[active].focus);
    zoomRef.current = REGIONS[active].zoom;
    offsetRef.current = 0;
    globeRef.current?.update(globeData(active));
  }, [active]);

  const region = REGIONS[active];

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[760px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        dragRef.current = { x: e.clientX, offset: offsetRef.current };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragRef.current) return;
        offsetRef.current = dragRef.current.offset + (e.clientX - dragRef.current.x) / 180;
      }}
      onPointerUp={() => (dragRef.current = null)}
      onPointerCancel={() => (dragRef.current = null)}
      role="img"
      aria-label={`İstanbul'dan ${region.name} bölgesine uzanan proje rotaları: ${region.cities.map((c) => c.name).join(", ")}`}
    >
      {/* Yakınlaşan küre kenarlarda beyaza karışır */}
      <div
        ref={hostRef}
        className="absolute inset-0"
        style={{
          maskImage: "radial-gradient(circle at 50% 50%, #000 52%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 52%, transparent 70%)",
        }}
      />

      {/* Merkez: W işareti, kürenin önündeyken görünür */}
      <span
        aria-hidden
        className="pointer-events-none absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center bg-wawa-charcoal text-base font-bold tracking-tight text-white transition-opacity duration-300 lg:h-9 lg:w-9 lg:text-lg"
        style={
          {
            positionAnchor: `--cobe-${HUB.id}`,
            left: "anchor(center)",
            top: "anchor(center)",
            opacity: `var(--cobe-visible-${HUB.id}, 0)`,
          } as React.CSSProperties
        }
      >
        W
      </span>

    </div>
  );
}

export function GlobalReach() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Bölüm ekrandayken bölgeler sırayla gezilir; listenin ya da kürenin üzerine gelince durur
  useEffect(() => {
    if (!inView || paused || reduceMotion) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % REGIONS.length), INTERVAL);
    return () => clearTimeout(t);
  }, [active, inView, paused, reduceMotion]);

  return (
    <section ref={sectionRef} aria-labelledby="reach-title" className="overflow-hidden bg-white text-wawa-charcoal">
      <div className="container-wide pt-8 lg:pt-10 pb-8 lg:pb-10">
        <div
          className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="lg:col-span-5">
            <SectionHeading id="reach-title">{"İstanbul'dan dünyaya."}</SectionHeading>
            <p className="mt-5 max-w-[38ch] text-lg leading-relaxed">
              İstanbul&apos;da tasarlar ve üretir, ekibimizle sahaya gidip kurarız.
            </p>

            <ul className="mt-12 space-y-1">
              {REGIONS.map((r, i) => {
                const isActive = i === active;
                return (
                  <li key={r.key}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      aria-pressed={isActive}
                      className="group flex w-full cursor-pointer items-center gap-4 py-2 text-left"
                    >
                      <span
                        aria-hidden
                        className={`h-2.5 w-2.5 shrink-0 transition-colors duration-300 ${
                          isActive ? "bg-wawa-accent outline outline-wawa-charcoal" : "bg-wawa-charcoal/15"
                        }`}
                      />
                      <span
                        className={`text-2xl tracking-[-0.02em] transition-colors duration-300 lg:text-[28px] ${
                          isActive ? "text-wawa-charcoal" : "text-wawa-charcoal/40 group-hover:text-wawa-charcoal"
                        }`}
                      >
                        {r.name}
                      </span>
                    </button>
                    {/* Seçili bölgenin şehirleri */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ${
                        isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <p className="overflow-hidden pl-[26px] text-base leading-relaxed text-wawa-charcoal/70">
                        <span className="block max-w-[44ch] pt-1 pb-3">{r.cities.map((c) => c.name).join(" · ")}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

          </div>

          <div className="lg:col-span-7">
            <Globe active={active} />
          </div>
        </div>
      </div>
    </section>
  );
}

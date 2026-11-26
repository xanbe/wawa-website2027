"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectionHeader, SectionLead } from "./SectionHeading";
import { HOME, type HomeFeatured } from "@/content/home";

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  category: string | null;
  category_slug: string | null;
  parent_category_slug: string | null;
  featured_image_url: string | null;
}

// Ziyaretçi kendi segmentini seçer: konut sahibi ile kurumsal müşteri aynı şeridi görmek zorunda kalmaz
type FilterType = "all" | "residential" | "commercial" | "stand";

// Anasayfadaki seçilmiş projeler yönetim panelinden (src/content/home.json) düzenlenir.
// Sekme (filter) değeri, aşağıdaki filtrelemenin beklediği kategori alanlarına çevrilir.
const FILTER_SLUGS: Record<HomeFeatured["filter"], { category_slug: string | null; parent_category_slug: string }> = {
  residential: { category_slug: "konut", parent_category_slug: "ic-mimarlik" },
  commercial: { category_slug: null, parent_category_slug: "ic-mimarlik" },
  stand: { category_slug: "fuar", parent_category_slug: "fuar-standi" },
};

const fallbackProjects: ProjectItem[] = HOME.featured.map((p, i) => ({
  id: String(i + 1),
  title: p.title,
  slug: p.path.replace(/^\/portfolio\//, "").replace(/\/$/, ""),
  location: p.location,
  category: p.category,
  ...FILTER_SLUGS[p.filter],
  featured_image_url: p.image,
}));

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "residential", label: "Konut & Villa" },
  { value: "commercial", label: "Ticari Mekânlar" },
  { value: "stand", label: "Fuar Standı" },
];

// Kart genişlikleri sırayla değişir: geniş, dar, geniş… şerit tekdüze durmasın
const WIDTHS = ["w-[84vw] sm:w-[60vw] lg:w-[46vw]", "w-[84vw] sm:w-[44vw] lg:w-[30vw]"];

// Şeridin kendiliğinden akış hızı (px/sn) ve elle müdahaleden sonra bekleme süresi
const SPEED = 60;
const HOLD = 4000;

function holdFor(ref: { current: number }, ms: number) {
  ref.current = performance.now() + ms;
}

interface ProjectsGalleryProps {
  projects?: ProjectItem[];
  showFilters?: boolean;
  parentFilter?: "ic-mimarlik" | "fuar-standi" | null;
  title?: string;
}

export function ProjectsGallery({
  projects: externalProjects,
  showFilters = true,
  parentFilter = null,
  title = "Projelerimiz",
}: ProjectsGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  // İlerleme çubuğu doğrudan DOM'dan güncellenir; her karede React yeniden çizim yapmasın diye state tutulmaz
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const holdUntil = useRef(0);
  const hold = () => holdFor(holdUntil, HOLD);
  // İkinci kopyanın ilk kartı; iki kopya arasındaki mesafe döngü uzunluğudur
  const loopRef = useRef<HTMLAnchorElement>(null);

  const loopWidth = () => {
    const el = trackRef.current;
    const mark = loopRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    return mark && first ? mark.offsetLeft - first.offsetLeft : 0;
  };

  // Bölüm ekrandayken şerit kesintisiz sola akar; kartlar iki kez dizildiği için sona varınca fark edilmeden başa sarar.
  // Yalnızca sürüklerken ve oklara/tekerleğe dokunulduktan sonra kısa süre durur.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !inView) return;
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    // Tarayıcı scrollLeft'i piksele yuvarlar; konum kesirli tutulur, son okunan değer ayrı izlenir
    let seen = pos;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      // Kullanıcı kaydırdıysa akış oradan devam eder
      if (Math.abs(el.scrollLeft - seen) > 1) pos = el.scrollLeft;
      if (now >= holdUntil.current && !drag.current) {
        pos += (SPEED * dt) / 1000;
        const loop = loopWidth();
        if (loop > 0 && pos >= loop) pos -= loop;
        el.scrollLeft = pos;
      }
      seen = el.scrollLeft;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const allProjects = externalProjects || fallbackProjects;
  const baseProjects = parentFilter ? allProjects.filter((p) => p.parent_category_slug === parentFilter) : allProjects;
  const projects = baseProjects.filter((p) => {
    const isStand = p.parent_category_slug === "fuar-standi";
    const isResidential = !isStand && (p.category_slug === "konut" || p.category_slug === "villa");
    if (activeFilter === "residential") return isResidential;
    // Mağaza, ofis, klinik, restoran: konut ve fuar dışındaki iç mimarlık projeleri
    if (activeFilter === "commercial") return !isStand && !isResidential;
    if (activeFilter === "stand") return isStand;
    return true;
  });

  const updateProgress = () => {
    const el = trackRef.current;
    const loop = loopWidth();
    if (!el || loop <= 0) return;
    if (barRef.current) barRef.current.style.width = `${Math.max(8, ((el.scrollLeft % loop) / loop) * 100)}%`;
  };

  // Filtre değişince şerit başa döner
  const chooseFilter = (value: FilterType) => {
    hold();
    setActiveFilter(value);
    trackRef.current?.scrollTo({ left: 0 });
  };

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    hold();
    const amount = el.clientWidth * 0.6;
    const loop = loopWidth();
    // Döngünün başında geri basılırsa ikinci kopyaya geçip oradan geri kayar
    if (dir < 0 && loop > 0 && el.scrollLeft < amount) el.scrollLeft += loop;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} aria-labelledby="projects-title" className="overflow-hidden bg-white pt-8 lg:pt-10 pb-8 lg:pb-10">
      <div className="container-wide">
        <SectionHeader id="projects-title" title={title}>
          <SectionLead>Tasarlayıp kendi ekibimizle uyguladığımız mekânlardan bir seçki.</SectionLead>
        </SectionHeader>

        {/* Segment sekmeleri solda, oklar sağda; ikisi aynı satırda ve aynı yükseklikte */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 lg:mt-10">
            {showFilters && !parentFilter && (
              <div
                className="-mx-4 flex max-w-[calc(100%+2rem)] overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:max-w-none sm:px-0 [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label="Proje türü"
              >
                {/* Kare sekmeler; aralarındaki ince çizgiler footer ve logo ızgarasıyla aynı dilde */}
                <div className="flex shrink-0 border border-wawa-charcoal/15">
                  {filters.map((filter, i) => {
                    const isActive = activeFilter === filter.value;
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => chooseFilter(filter.value)}
                        className={`cursor-pointer px-4 py-3 text-[14px] whitespace-nowrap transition-colors duration-300 sm:px-5 ${
                          i > 0 ? "border-l border-wawa-charcoal/15" : ""
                        } ${isActive ? "bg-wawa-charcoal text-white" : "text-wawa-charcoal hover:bg-[#F3F2EF]"}`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Önceki projeler"
                className="grid h-11 w-11 cursor-pointer place-items-center bg-[#F3F2EF] text-wawa-charcoal transition-colors duration-300 hover:bg-wawa-charcoal hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:bg-[#F3F2EF] disabled:hover:text-wawa-charcoal"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Sonraki projeler"
                className="grid h-11 w-11 cursor-pointer place-items-center bg-wawa-charcoal text-white transition-colors duration-300 hover:bg-black disabled:cursor-default disabled:opacity-30"
              >
                <ArrowRight className="h-4 w-4 text-wawa-accent" />
              </button>
            </div>
        </div>
      </div>

      {/* Yatay şerit: kendiliğinden akar, kaydırılır, fareyle sürüklenir, oklarla ilerler. Sol kenar sayfa hizasında başlar.
          Akış piksel piksel ilerlediği için şeritte yapışma (snap) ve yumuşak kaydırma sınıfı yok. */}
      <div
        ref={trackRef}
        onScroll={updateProgress}
        // Sayfayı dikey kaydırırken şerit durmaz; yalnızca yatay kaydırma (touchpad, shift+tekerlek) akışı bekletir
        onWheel={(e) => {
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) hold();
        }}
        onTouchStart={() => hold()}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !trackRef.current) return;
          drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = trackRef.current;
          if (!d || !el) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 5) d.moved = true;
          el.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => {
          drag.current = null;
        }}
        onClickCapture={(e) => {
          if (drag.current?.moved) e.preventDefault();
        }}
        className="mt-10 flex cursor-grab gap-4 overflow-x-auto px-4 [scrollbar-width:none] select-none active:cursor-grabbing sm:px-6 lg:mt-14 lg:gap-6 lg:px-[max(32px,calc((100%-1280px)/2+32px))] [&::-webkit-scrollbar]:hidden"
      >
        {/* Üç kopya: proje sayısı az olan segmentlerde de şerit döngüyü tamamlayacak kadar uzun kalır */}
        {[0, 1, 2].map((copy) => [
        ...projects.map((project, i) => {
          const meta = [project.category, project.location].filter(Boolean).join(" · ");
          // Döngü için eklenen 2. ve 3. kopyalar başlık sayılmaz (sayfada aynı proje başlığı 3 kez H3 olmasın)
          const Title = copy === 0 ? "h3" : "p";
          return (
            <Link
              key={`${copy}-${activeFilter}-${project.id}`}
              ref={copy === 1 && i === 0 ? loopRef : undefined}
              href={project.slug === "instreet-istanbul-havalimani-dis-hatlar" ? "/service/magaza-tasarimi/" : `/portfolio/${project.slug}/`}
              draggable={false}
              aria-hidden={copy > 0 || undefined}
              tabIndex={copy > 0 ? -1 : undefined}
              className={`group shrink-0 ${WIDTHS[i % WIDTHS.length]}`}
            >
              <div className="relative h-[60vh] max-h-[620px] min-h-[380px] overflow-hidden bg-wawa-charcoal/5">
                <Image
                  src={project.featured_image_url || "/images/showcase-1.jpg"}
                  alt={project.title}
                  fill
                  draggable={false}
                  sizes="(min-width: 1024px) 46vw, 84vw"
                  quality={90}
                  className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <Title className="text-2xl tracking-[-0.02em] text-wawa-charcoal lg:text-[28px]">
                  <span className="underline decoration-transparent decoration-[5px] underline-offset-[6px] transition-[text-decoration-color] duration-300 group-hover:decoration-wawa-accent">
                    {project.title}
                  </span>
                </Title>
                {meta && <p className="shrink-0 text-[15px] text-wawa-charcoal/65">{meta}</p>}
              </div>
            </Link>
          );
        }),

        /* Her turun sonunda tüm projeler kartı */
        <Link
          key={`${copy}-all`}
          href="/projelerimiz/"
          draggable={false}
          aria-hidden={copy > 0 || undefined}
          tabIndex={copy > 0 ? -1 : undefined}
          className="group flex h-[60vh] max-h-[620px] min-h-[380px] w-[70vw] shrink-0 flex-col justify-between bg-[#F3F2EF] p-8 transition-colors duration-500 hover:bg-wawa-accent sm:w-[36vw] lg:w-[24vw] lg:p-10"
        >
          <span className="text-3xl leading-tight tracking-[-0.02em] text-wawa-charcoal lg:text-4xl">
            Tüm projeleri görün
          </span>
          <ArrowRight className="h-8 w-8 text-wawa-charcoal transition-transform duration-500 group-hover:translate-x-2" />
        </Link>,
        ])}
      </div>

      {/* İlerleme çubuğu */}
      <div className="container-wide mt-10 lg:mt-14">
        <div className="relative h-[2px] bg-wawa-charcoal/10">
          <div
            className="absolute inset-y-0 left-0 bg-wawa-charcoal transition-[width] duration-200"
            ref={barRef}
            style={{ width: "8%" }}
          />
        </div>
      </div>
    </section>
  );
}

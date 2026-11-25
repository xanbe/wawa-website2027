"use client";

// Hizmet sayfalarının etkileşimli bölümleri: kart destesi + akordeon, kayan projeler, sayan rakamlar, fuar takvimi
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { SvcLang } from "./service-sections";

// ---------------------------------------------------------------- Kayan projeler
export function ProjectRail({
  title,
  items,
  allLabel,
  allHref,
  wide = false,
}: {
  title: string;
  items: { href: string; src: string; title: string; kicker?: string | null; meta?: string | null }[];
  allLabel: string;
  allHref?: string;
  /** Yatay 16:9 kartlar (fuar standı fotoğrafları genelde yatay çekilir); masaüstünde 3 kart görünür */
  wide?: boolean;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const move = (dir: number) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 24), behavior: "smooth" });
  };
  return (
    <section id="projeler" className="scroll-mt-24 lg:scroll-mt-32 bg-white" aria-labelledby="svc-rail">
      <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
        <div className="flex items-end justify-between gap-6 border-t border-wawa-charcoal pt-6 lg:pt-8">
          <h2 id="svc-rail" className="font-heading text-[26px] leading-[1.2] font-normal text-wawa-charcoal lg:text-[38px]">
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            {allHref && (
              <Link href={allHref} className="mr-3 hidden text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] hover:decoration-wawa-charcoal sm:inline">
                {allLabel}
              </Link>
            )}
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => move(d)}
                aria-label={d < 0 ? "←" : "→"}
                className="grid h-10 w-10 cursor-pointer place-items-center border border-wawa-charcoal/20 text-wawa-charcoal transition-colors hover:border-wawa-charcoal hover:bg-wawa-charcoal hover:text-white"
              >
                {d < 0 ? <ArrowLeft className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
        <ul ref={rail} className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] lg:mt-10 [&::-webkit-scrollbar]:hidden">
          {items.map((p) => (
            <li
              key={p.href}
              className={`shrink-0 snap-start ${wide ? "w-[86%] sm:w-[60%] lg:w-[calc((100%-48px)/3)]" : "w-[78%] sm:w-[44%] lg:w-[calc((100%-72px)/4)]"}`}
            >
              <Link href={p.href} className="group block">
                <div className={`relative overflow-hidden bg-[#F3F2EF] ${wide ? "aspect-video" : "aspect-[3/4]"}`}>
                  <Image
                    src={p.src}
                    alt={p.title}
                    fill
                    sizes={wide ? "(min-width: 1024px) 33vw, (min-width: 640px) 60vw, 86vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 44vw, 78vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-4 border-b border-wawa-charcoal/15 pb-4">
                  {p.kicker && <p className="text-[11px] tracking-[0.14em] text-wawa-charcoal/55 uppercase">{p.kicker}</p>}
                  <p className="mt-1.5 flex items-start justify-between gap-3 text-[16px] font-medium leading-snug text-wawa-charcoal">
                    {p.title}
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </p>
                  {p.meta && <p className="mt-1 text-[12px] tracking-[0.1em] text-wawa-charcoal/50 uppercase">{p.meta}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Proje ızgarası (stand sayfaları)
// 3 sütun, 16:9 kartlar. İlk 6 proje görünür; sıradaki satır bulanık bir önizleme olarak durur ve düğmeyle aşağı doğru açılır.
type RailItem = { href: string; src: string; title: string; kicker?: string | null; meta?: string | null };

function ProjectCard({ p }: { p: RailItem }) {
  return (
    <Link href={p.href} className="group block">
      <div className="relative aspect-video overflow-hidden bg-[#F3F2EF]">
        <Image src={p.src} alt={p.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="mt-4 border-b border-wawa-charcoal/15 pb-4">
        {p.kicker && <p className="text-[11px] tracking-[0.14em] text-wawa-charcoal/55 uppercase">{p.kicker}</p>}
        <p className="mt-1.5 flex items-start justify-between gap-3 text-[16px] font-medium leading-snug text-wawa-charcoal">
          {p.title}
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
        </p>
        {p.meta && <p className="mt-1 text-[12px] tracking-[0.1em] text-wawa-charcoal/50 uppercase">{p.meta}</p>}
      </div>
    </Link>
  );
}

export function ProjectGrid({ title, items, allLabel, allHref, moreLabel, step = 6 }: { title: string; items: RailItem[]; allLabel: string; allHref?: string; moreLabel: string; step?: number }) {
  const [shown, setShown] = useState(step);
  const visible = items.slice(0, shown);
  const peek = items.slice(shown, shown + 3);
  const GRID = "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <section id="projeler" className="scroll-mt-24 bg-white lg:scroll-mt-32" aria-labelledby="svc-rail">
      <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
        <div className="flex items-end justify-between gap-6 border-t border-wawa-charcoal pt-6 lg:pt-8">
          <h2 id="svc-rail" className="font-heading text-[26px] leading-[1.2] font-normal text-wawa-charcoal lg:text-[38px]">
            {title}
          </h2>
          {allHref && (
            <Link href={allHref} className="shrink-0 text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] hover:decoration-wawa-charcoal">
              {allLabel}
            </Link>
          )}
        </div>
        <ul className={`mt-8 lg:mt-10 ${GRID}`}>
          {visible.map((p, i) => (
            <li key={p.href} className={shown > step && i >= shown - step ? "svc-grid-in" : undefined}>
              <ProjectCard p={p} />
            </li>
          ))}
        </ul>
        {peek.length > 0 && (
          <div className="relative mt-10">
            {/* Sıradaki satırın bulanık önizlemesi: tıklanamaz, yalnızca devamı olduğunu gösterir */}
            <ul aria-hidden inert className={`pointer-events-none max-h-[150px] overflow-hidden opacity-80 blur-[3px] select-none lg:max-h-[190px] ${GRID}`}>
              {peek.map((p, i) => (
                <li key={p.href} className={i === 1 ? "hidden sm:block" : i === 2 ? "hidden lg:block" : undefined}>
                  <ProjectCard p={p} />
                </li>
              ))}
            </ul>
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/70 to-white" />
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + step)}
                className="group inline-flex cursor-pointer items-center gap-3 bg-wawa-charcoal px-6 py-3.5 text-[14px] text-white transition-colors hover:bg-wawa-accent hover:text-wawa-charcoal"
              >
                {moreLabel}
                <span className="text-[12px] tabular-nums opacity-60">+{items.length - shown}</span>
                <ArrowRight className="h-4 w-4 rotate-90 transition-transform group-hover:translate-y-0.5" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Sayan rakamlar
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function Counter({ value, run, locale }: { value: number; run: boolean; locale: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setN(value));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);
  return <>{n.toLocaleString(locale)}</>;
}

export function CountStats({ lang, stats }: { lang: SvcLang; stats: { value: number; suffix?: string; unit?: string; label: string }[] }) {
  const [ref, seen] = useInView<HTMLDListElement>();
  const locale = lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-GB";
  return (
    <section className="bg-white">
      <div className="container-wide pb-14 lg:pb-16">
        <dl ref={ref} className="grid grid-cols-2 border-t border-wawa-charcoal/15 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex flex-col pt-6 pr-4 pb-2 ${i % 2 ? "pl-5 lg:pl-6" : ""} ${i === 2 ? "lg:pl-6" : ""}`}>
              <dt className="order-2 mt-3 text-[12px] tracking-[0.14em] text-wawa-charcoal/55 uppercase">{s.label}</dt>
              <dd className="order-1 font-heading text-[30px] leading-none whitespace-nowrap text-wawa-charcoal tabular-nums sm:text-[42px] xl:text-[52px]">
                <Counter value={s.value} run={seen} locale={locale} />
                {s.suffix}
                {s.unit && <small className="ml-1 align-top text-[0.4em]">{s.unit}</small>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Yaklaşan fuarlar
type Fair = { name: string; city: string; region: "tr" | "eu" | "me"; start: string; end: string; slug?: string };

const FAIR_TEXT = {
  tr: { title: "Yaklaşan fuarlar", note: "Örnek liste · tarihler kesin değil", next: "En yakın", opens: "açılışa", d: "gün", h: "sa", m: "dk", days: "gün", today: "Bugün", filters: { all: "Tümü", tr: "Türkiye", eu: "Avrupa", me: "Orta Doğu" }, cta: "Fuar adına basın; son sipariş tarihlerini ve o fuardaki işlerimizi görün." },
  en: { title: "Upcoming fairs", note: "Sample list · dates not confirmed", next: "Next", opens: "until opening", d: "days", h: "h", m: "min", days: "days", today: "Today", filters: { all: "All", tr: "Türkiye", eu: "Europe", me: "Middle East" }, cta: "Click a fair to go to the offer form." },
  de: { title: "Kommende Messen", note: "Beispielliste · Termine ohne Gewähr", next: "Nächste", opens: "bis zur Eröffnung", d: "Tage", h: "Std", m: "Min", days: "Tage", today: "Heute", filters: { all: "Alle", tr: "Türkei", eu: "Europa", me: "Nahost" }, cta: "Messe anklicken und zum Angebotsformular wechseln." },
};

// Dakikada bir yenilenen saat; sunucuda 0 döner (tarihler yalnızca tarayıcıda hesaplanır)
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
};
const nowMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

export function FairTimeline({ lang, fairs }: { lang: SvcLang; fairs: Fair[] }) {
  const t = FAIR_TEXT[lang];
  const now = useSyncExternalStore(subscribe, nowMinute, () => 0);
  const [region, setRegion] = useState<"all" | Fair["region"]>("all");
  const locale = lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-GB";
  const DAY = 86_400_000;

  const upcoming = now ? fairs.filter((f) => new Date(f.end).getTime() + DAY > now) : [];
  const list = upcoming.filter((f) => region === "all" || f.region === region);
  const t0 = now ? new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime() : 0;
  const t1 = t0 + 7 * 30.5 * DAY;
  const x = (ms: number) => Math.min(100, Math.max(0, ((ms - t0) / (t1 - t0)) * 100));
  const months = now ? Array.from({ length: 7 }, (_, i) => new Date(new Date(t0).getFullYear(), new Date(t0).getMonth() + i, 1)) : [];
  const nextFair = upcoming[0];
  const diff = nextFair ? Math.max(0, new Date(nextFair.start).getTime() - now) : 0;

  return (
    <section className="bg-white" aria-labelledby="svc-fairs">
      <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-wawa-charcoal pt-6 lg:pt-8">
          <h2 id="svc-fairs" className="font-heading text-[26px] leading-[1.2] font-normal text-wawa-charcoal lg:text-[38px]">
            {t.title}
          </h2>
          <span className="text-[12px] tracking-[0.12em] text-wawa-charcoal/55 uppercase">{t.note}</span>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {nextFair ? (
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-wawa-charcoal">
              <span className="text-[12px] tracking-[0.12em] text-wawa-charcoal/55 uppercase">{t.next}</span>
              <b className="text-[18px] font-medium">{nextFair.name}</b>
              <span className="text-[12px] tracking-[0.12em] text-wawa-charcoal/55 uppercase">· {t.opens}</span>
              <span className="font-heading text-[22px] tabular-nums">{Math.floor(diff / DAY)}</span>
              <small className="text-[11px] uppercase">{t.d}</small>
              <span className="font-heading text-[22px] tabular-nums">{Math.floor((diff % DAY) / 3_600_000)}</span>
              <small className="text-[11px] uppercase">{t.h}</small>
              <span className="font-heading text-[22px] tabular-nums">{Math.floor((diff % 3_600_000) / 60_000)}</span>
              <small className="text-[11px] uppercase">{t.m}</small>
            </p>
          ) : (
            <span />
          )}
          <div className="flex" role="group">
            {(["all", "tr", "eu", "me"] as const).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={region === r}
                onClick={() => setRegion(r)}
                className={`-ml-px cursor-pointer border px-3.5 py-2 text-[12px] tracking-[0.08em] uppercase first:ml-0 ${
                  region === r ? "relative z-10 border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 text-wawa-charcoal hover:bg-[#F3F2EF]"
                }`}
              >
                {t.filters[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Zaman çizelgesi: aylar, bugün çizgisi ve fuarlar */}
        <div className="relative mt-8 overflow-hidden border-t border-wawa-charcoal/15">
          <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
            {months.map((m, i) => (
              <div key={m.getTime()} className={`border-l border-wawa-charcoal/10 ${i % 2 ? "bg-[#F6F5F2]" : ""}`}>
                <span className="block px-2 pt-2 text-[11px] tracking-[0.12em] text-wawa-charcoal/55 uppercase">
                  {m.toLocaleDateString(locale, { month: "short" })}
                  {m.getMonth() === 0 ? ` ${String(m.getFullYear()).slice(2)}` : ""}
                </span>
              </div>
            ))}
          </div>
          {now > 0 && (
            <div className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-wawa-accent" style={{ left: `${x(now)}%` }}>
              <span className="svc-pulse absolute top-0 left-0 bg-wawa-charcoal px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-white uppercase">{t.today}</span>
            </div>
          )}
          <ul className="relative pt-10 pb-4">
            {list.map((f) => {
              const s = new Date(f.start).getTime();
              const e = new Date(f.end).getTime() + DAY;
              const left = x(s);
              const right = left > 62;
              const days = Math.max(0, Math.ceil((s - now) / DAY));
              return (
                <li key={f.name + f.start} className="relative h-9">
                  {/* Sağ yarıdaki fuarlarda yazı çubuğun soluna geçer; çubuk her zaman tarihinde durur */}
                  <a href={lang === "tr" && f.slug ? `/fuar-takvimi/${f.slug}/` : "#teklif"} className="group absolute top-1/2 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap" style={right ? { right: `${100 - x(e)}%` } : { left: `${left}%` }}>
                    {!right && <span className="h-3.5 w-6 shrink-0 bg-wawa-charcoal transition-colors group-hover:bg-wawa-accent" />}
                    <span className="text-[14px] font-medium text-wawa-charcoal group-hover:underline">{f.name}</span>
                    <span className="text-[12px] text-wawa-charcoal/55">{f.city}</span>
                    <span className="text-[12px] text-wawa-charcoal/70">· {days} {t.days}</span>
                    {right && <span className="h-3.5 w-6 shrink-0 bg-wawa-charcoal transition-colors group-hover:bg-wawa-accent" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-3 text-[12px] tracking-[0.1em] text-wawa-charcoal/50 uppercase">{t.cta}</p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Video listesi
// Solda liste, sağda oynatıcı. YouTube yalnızca oynat'a basılınca yüklenir (önce kapak görseli).
export function VideoPlaylist({ title, count, videos }: { title: string; count: string; videos: { id: string; title: string; duration?: string }[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const v = videos[active];
  if (!v) return null;
  return (
    <section className="bg-white" aria-labelledby="svc-videos">
      <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
        <div className="flex items-end justify-between gap-4 border-t border-wawa-charcoal pt-6 lg:pt-8">
          <h2 id="svc-videos" className="font-heading text-[26px] leading-[1.2] font-normal text-wawa-charcoal lg:text-[38px]">
            {title}
          </h2>
          <span className="shrink-0 text-[12px] tracking-[0.12em] text-wawa-charcoal/55 uppercase">{count}</span>
        </div>
        <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-12 lg:gap-6">
          <div className="relative aspect-video overflow-hidden bg-wawa-charcoal lg:order-2 lg:col-span-8">
            {playing ? (
              <iframe
                key={v.id}
                src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                title={v.title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 cursor-pointer" aria-label={v.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" className="h-full w-full scale-[1.34] object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                <span className="absolute top-4 left-4 right-4 text-left text-[17px] font-medium text-white lg:text-[20px]">{v.title}</span>
                <span className="absolute top-1/2 left-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center bg-wawa-accent text-wawa-charcoal transition-transform group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden>
                    <path d="M7 5v14l12-7z" />
                  </svg>
                </span>
              </button>
            )}
          </div>
          {/* Liste masaüstünde video yüksekliğini aşmaz, kendi içinde kayar */}
          <div className="relative lg:order-1 lg:col-span-4">
          <ol className="max-h-[420px] overflow-y-auto overscroll-contain border-t border-wawa-charcoal/15 [scrollbar-color:rgb(0_0_0/0.25)_transparent] [scrollbar-width:thin] lg:absolute lg:inset-0 lg:max-h-none">
            {videos.map((item, i) => (
              <li key={item.id} className="border-b border-wawa-charcoal/15">
                <button
                  type="button"
                  aria-current={i === active}
                  onClick={() => {
                    setActive(i);
                    setPlaying(true);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 py-2.5 pr-2 text-left transition-colors ${i === active ? "bg-[#F3F2EF]" : "hover:bg-[#F7F6F3]"}`}
                >
                  <span className="relative aspect-video w-24 shrink-0 overflow-hidden bg-wawa-charcoal">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                    {i === active && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-wawa-accent" />}
                  </span>
                  <span className={`flex-1 text-[14px] leading-snug ${i === active ? "text-wawa-charcoal" : "text-wawa-charcoal/75"}`}>{item.title}</span>
                  {item.duration && <span className="shrink-0 pr-1 text-[12px] tabular-nums text-wawa-charcoal/50">{item.duration}</span>}
                </button>
              </li>
            ))}
          </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

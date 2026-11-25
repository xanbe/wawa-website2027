import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { FAIRS, FAIRS_PATH, fairPath, getFair, orderDeadlines, type Fair } from "@/content/fairs";
import { STAND_PRICES, euroRange, estimate } from "@/content/stand-prices";
import { isStandProject, projectCategory, projectsIn, type Project } from "@/lib/content";
import { ProjectCard } from "@/components/templates/parts";
import { FairCountdown, FairDeadlines } from "@/components/templates/FairLive";

// Fuar sayfası: tarih ve salon, son sipariş tarihleri, WAWA'nın o fuardaki projeleri, fuar adı dolu teklif bağlantısı
export const dynamicParams = false;
export const generateStaticParams = () => FAIRS.map((f) => ({ slug: f.slug }));

const REGION = { tr: "Türkiye", eu: "Avrupa", me: "Orta Doğu" } as const;
const dateRange = (f: Fair) => {
  const s = new Date(`${f.start}T12:00:00Z`);
  const e = new Date(`${f.end}T12:00:00Z`);
  const month = (d: Date) => d.toLocaleDateString("tr-TR", { month: "long", timeZone: "UTC" });
  return s.getUTCMonth() === e.getUTCMonth()
    ? `${s.getUTCDate()}–${e.getUTCDate()} ${month(e)} ${e.getUTCFullYear()}`
    : `${s.getUTCDate()} ${month(s)} – ${e.getUTCDate()} ${month(e)} ${e.getUTCFullYear()}`;
};

const norm = (s: string) => ` ${s.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]+/g, " ")} `;
// Başlığında fuarın adı geçen projeler; yoksa son fuar standı projeleri
function fairProjects(fair: Fair): { list: Project[]; exact: boolean } {
  const all = projectsIn("tr");
  const exact = all.filter((p) => fair.match.some((m) => norm(p.title).includes(norm(m))));
  if (exact.length) return { list: exact.slice(0, 6), exact: true };
  return { list: all.filter(isStandProject).slice(0, 3), exact: false };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const fair = getFair((await params).slug);
  if (!fair) return {};
  const title = `${fair.name} ${fair.start.slice(0, 4)} Fuar Standı | WAWA Interiors`;
  const description = `${fair.name} (${fair.city}, ${dateRange(fair)}) için fuar standı tasarımı, üretimi ve kurulumu. Son sipariş tarihleri, bütçe aralığı ve bu fuarda yaptığımız standlar.`;
  return { title: { absolute: title }, description, alternates: { canonical: fairPath(fair.slug) }, openGraph: { title, description, url: fairPath(fair.slug) } };
}

export default async function FairPage({ params }: { params: Promise<{ slug: string }> }) {
  const fair = getFair((await params).slug);
  if (!fair) notFound();
  const deadlines = orderDeadlines(fair);
  const { list, exact } = fairProjects(fair);
  const region = fair.region === "tr" ? "tr" : "abroad";
  const offerHref = `/teklif-al/?tur=stand&fuar=${encodeURIComponent(`${fair.name} · ${fair.city}`)}`;
  const others = FAIRS.filter((f) => f.slug !== fair.slug).slice(0, 4);
  const examples = [18, 36, 54];

  return (
    <article className="bg-white" lang="tr">
      {/* Açılış */}
      <header className="container-wide pt-32 pb-10 lg:pt-44 lg:pb-14">
        <Link href={FAIRS_PATH} className="text-[13px] tracking-[0.12em] text-wawa-charcoal/60 uppercase underline-offset-4 hover:underline">
          Fuar takvimi
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <h1 className="font-heading text-[30px] leading-[1.15] font-normal tracking-[-0.01em] text-balance text-wawa-charcoal sm:text-[42px] lg:text-[56px]">{fair.name} fuar standı</h1>
            <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-wawa-charcoal/75">
              {fair.name} için standınızı İstanbul&apos;daki atölyemizde üretiyor, {fair.city === "İstanbul" ? "fuar alanında" : `${fair.city}'ya taşıyıp`} kurulumunu ve sökümünü yapıyoruz.
            </p>
          </div>
          <dl className="grid content-start gap-4 border-t border-wawa-charcoal pt-5 text-[15px] lg:col-span-4">
            {[
              ["Tarih", dateRange(fair)],
              ["Şehir", `${fair.city}, ${fair.country}`],
              ...(fair.venue ? [["Fuar alanı", fair.venue]] : []),
              ["Sektör", fair.sector],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
                <dt className="text-wawa-charcoal/55">{k}</dt>
                <dd className="text-wawa-charcoal">{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
              <dt className="text-wawa-charcoal/55">Durum</dt>
              <dd className="text-wawa-charcoal">
                <FairCountdown start={fair.start} end={fair.end} />
              </dd>
            </div>
          </dl>
        </div>
        <p className="mt-6 text-[12px] tracking-[0.1em] text-wawa-charcoal/45 uppercase">Tarihler kesin değildir; fuarın resmî sitesinden doğrulayın.</p>
      </header>

      {/* Son sipariş tarihleri */}
      <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-deadline">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="fair-deadline" className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">
              Ne zamana kadar sipariş vermeli?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-wawa-charcoal/70">
              Tasarım, üretim, {fair.region === "tr" ? "" : "nakliye, "}kurulum ve fuar onayları için önerdiğimiz son tarihler. Daha geç kaldıysanız da yazın; takvimi birlikte değerlendirelim.
            </p>
          </div>
          <div className="lg:col-span-8">
            <FairDeadlines ready={deadlines.ready.toISOString()} design={deadlines.design.toISOString()} />
            <Link href={offerHref} className="group mt-6 inline-flex h-14 items-center gap-4 bg-wawa-accent px-7 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white">
              {fair.name} için teklif alın
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Bu fuardaki işlerimiz */}
      <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-projects">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="fair-projects" className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">
            {exact ? `${fair.name}'da kurduğumuz standlar` : "Son fuar standı projelerimiz"}
          </h2>
          <Link href="/portfolio-category/fuar-stand-tasarimi/" className="text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] hover:decoration-wawa-charcoal">
            Tüm fuar standları
          </Link>
        </div>
        <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProjectCard key={p.path} project={p} category={projectCategory(p)?.name} />
          ))}
        </div>
      </section>

      {/* Bütçe */}
      <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-budget">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="fair-budget" className="font-heading text-[24px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">
              Yaklaşık bütçe
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-wawa-charcoal/70">
              {fair.region === "tr" ? "Türkiye'deki" : "Yurt dışındaki"} fuarlar için m² başına aralıklar, KDV hariç. Planlama tahminidir; kesin fiyat tasarım ve kapsama göre teklifle netleşir.
            </p>
            <Link href="/fuar-standi-fiyatlari/" className="mt-4 inline-flex items-center gap-2 text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] hover:decoration-wawa-charcoal">
              Fiyat rehberi <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="overflow-x-auto lg:col-span-8">
            <table className="w-full min-w-[520px] border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-wawa-charcoal text-left text-[12px] tracking-[0.1em] text-wawa-charcoal/55 uppercase">
                  <th className="py-3 pr-4 font-normal">Sistem</th>
                  <th className="py-3 pr-4 font-normal">€/m²</th>
                  {examples.map((m) => (
                    <th key={m} className="py-3 pr-4 font-normal">
                      {m} m²
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["ahsap", "maxima"] as const).map((sys) => (
                  <tr key={sys} className="border-b border-wawa-charcoal/15 align-top">
                    <td className="py-3 pr-4 font-medium text-wawa-charcoal">{sys === "ahsap" ? "Ahşap (özel tasarım)" : "Maxima (modüler, kiralık da olur)"}</td>
                    <td className="py-3 pr-4 tabular-nums text-wawa-charcoal">{STAND_PRICES[sys][region].join("–")}</td>
                    {examples.map((m) => (
                      <td key={m} className="py-3 pr-4 tabular-nums text-wawa-charcoal/80">
                        {euroRange(estimate(sys, region, m)!)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Diğer fuarlar */}
      <section className="container-wide border-t border-wawa-charcoal/15 py-12 lg:py-14" aria-labelledby="fair-others">
        <h2 id="fair-others" className="font-heading text-[22px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[26px]">
          Diğer fuarlar
        </h2>
        <ul className="mt-6 grid border-t border-wawa-charcoal/15 sm:grid-cols-2">
          {others.map((f) => (
            <li key={f.slug} className="border-b border-wawa-charcoal/15">
              <Link href={fairPath(f.slug)} className="group flex items-baseline justify-between gap-4 py-4 pr-4">
                <span>
                  <span className="text-[16px] font-medium text-wawa-charcoal group-hover:underline">{f.name}</span>
                  <span className="ml-2 text-[13px] text-wawa-charcoal/55">
                    {f.city} · {REGION[f.region]}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] tabular-nums text-wawa-charcoal/60">{dateRange(f)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

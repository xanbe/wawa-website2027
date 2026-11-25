import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FAIRS, FAIRS_PATH, fairPath } from "@/content/fairs";
import { PageIntro } from "@/components/templates/parts";
import { FairCountdown, UpcomingOnly } from "@/components/templates/FairLive";

export const metadata: Metadata = {
  title: { absolute: "Fuar Takvimi | Fuar Standı Son Sipariş Tarihleri | WAWA Interiors" },
  description: "Türkiye, Avrupa ve Orta Doğu'da yaklaşan fuarlar: tarihler, şehirler ve stand için önerilen son sipariş tarihleri.",
  alternates: { canonical: FAIRS_PATH },
};

const REGION = { tr: "Türkiye", eu: "Avrupa", me: "Orta Doğu" } as const;
const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Fuar takvimi: geçmiş fuarlar tarayıcıda gizlenir; her satır fuarın kendi sayfasına gider
export default function FairCalendarPage() {
  return (
    <>
      <PageIntro lang="tr" title="Fuar takvimi" lead="Stand yaptığımız fuarlar ve önerilen son sipariş tarihleri. Fuara basın; tarihleri, bütçeyi ve o fuardaki işlerimizi görün." />
      <section className="bg-white" lang="tr">
        <div className="container-wide pb-16">
          <ul className="border-t border-wawa-charcoal">
            {FAIRS.map((f) => (
              <UpcomingOnly key={f.slug} end={f.end}>
                <li className="border-b border-wawa-charcoal/15">
                  <Link href={fairPath(f.slug)} className="group grid items-baseline gap-2 py-5 sm:grid-cols-12 sm:gap-6">
                    <span className="text-[14px] tabular-nums text-wawa-charcoal/60 sm:col-span-3">
                      {fmt(f.start)}
                    </span>
                    <span className="sm:col-span-5">
                      <span className="font-heading text-[20px] text-wawa-charcoal group-hover:underline">{f.name}</span>
                      <span className="ml-3 text-[14px] text-wawa-charcoal/55">
                        {f.city} · {REGION[f.region]}
                      </span>
                    </span>
                    <span className="text-[14px] text-wawa-charcoal/70 sm:col-span-3">
                      <FairCountdown start={f.start} end={f.end} />
                    </span>
                    <ArrowUpRight className="hidden h-4 w-4 justify-self-end text-wawa-charcoal sm:col-span-1 sm:block" aria-hidden />
                  </Link>
                </li>
              </UpcomingOnly>
            ))}
          </ul>
          <p className="mt-4 text-[12px] tracking-[0.1em] text-wawa-charcoal/45 uppercase">Tarihler kesin değildir; fuarın resmî sitesinden doğrulayın.</p>
        </div>
      </section>
    </>
  );
}

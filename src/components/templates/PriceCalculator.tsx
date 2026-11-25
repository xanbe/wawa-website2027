"use client";

// Fiyat rehberindeki hızlı hesap: sistem, bölge ve m² → bütçe aralığı (iletişim bilgisi istemez)
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SYSTEM_LABEL, euroRange, estimate, type PriceRegion, type StandSystem } from "@/content/stand-prices";

const AREAS = [12, 18, 24, 36, 54, 100];

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 cursor-pointer border px-4 py-2.5 text-[14px] transition-colors ${on ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 text-wawa-charcoal hover:border-wawa-charcoal"}`}
    >
      {children}
    </button>
  );
}

export function PriceCalculator() {
  const [system, setSystem] = useState<StandSystem>("ahsap");
  const [region, setRegion] = useState<PriceRegion>("tr");
  const [area, setArea] = useState(36);
  const range = estimate(system, region, area);
  return (
    <div className="grid gap-8 bg-[#F3F2EF] p-6 sm:p-8 lg:grid-cols-12 lg:gap-10">
      <div className="grid gap-6 lg:col-span-7">
        <div>
          <p className="text-[14px] text-wawa-charcoal/70">Stand sistemi</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {(Object.keys(SYSTEM_LABEL) as StandSystem[]).map((s) => (
              <Choice key={s} on={system === s} onClick={() => setSystem(s)}>
                {SYSTEM_LABEL[s]}
              </Choice>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[14px] text-wawa-charcoal/70">Fuar nerede?</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Choice on={region === "tr"} onClick={() => setRegion("tr")}>
              Türkiye
            </Choice>
            <Choice on={region === "abroad"} onClick={() => setRegion("abroad")}>
              Yurt dışı
            </Choice>
          </div>
        </div>
        <div>
          <label htmlFor="price-area" className="text-[14px] text-wawa-charcoal/70">
            Stand alanı (m²)
          </label>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {AREAS.map((a) => (
              <Choice key={a} on={area === a} onClick={() => setArea(a)}>
                {a}
              </Choice>
            ))}
            <input
              id="price-area"
              inputMode="numeric"
              value={area}
              maxLength={4}
              onChange={(e) => setArea(Math.min(2000, Number(e.target.value.replace(/\D/g, "")) || 0))}
              className="h-11 w-24 border border-wawa-charcoal/20 bg-white px-3 text-[15px] tabular-nums text-wawa-charcoal outline-none focus:border-wawa-charcoal"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-6 border-t border-wawa-charcoal/15 pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
        <div aria-live="polite">
          <p className="text-[12px] tracking-[0.12em] text-wawa-charcoal/60 uppercase">Yaklaşık bütçe · KDV hariç</p>
          <p className="mt-3 font-heading text-[28px] leading-tight tabular-nums text-wawa-charcoal sm:text-[34px]">{range ? euroRange(range) : "-"}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-wawa-charcoal/65">
            {area} m² · {SYSTEM_LABEL[system]} · {region === "tr" ? "Türkiye" : "yurt dışı"}. Planlama tahminidir, teklif değildir.          </p>
        </div>
        <Link href={`/teklif-al/?tur=stand&alan=${area}`} className="group inline-flex h-12 items-center justify-center gap-3 bg-wawa-charcoal px-6 text-[15px] text-white transition-colors hover:bg-black">
          Bu stand için teklif alın
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

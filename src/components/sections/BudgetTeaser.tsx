"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AREA_MAX, AREA_MIN, PROJECT_TYPES } from "@/lib/fee";
import { SectionHeader, SectionLead } from "./SectionHeading";

const LINE = "border-wawa-charcoal/15";
// Üç sütunda da etiketler aynı satırda, kontroller (seçim, alan, buton) aynı yükseklikte ve aynı hizada durur
const stepLabel = "block text-[13px] leading-5 text-wawa-charcoal/55";
const CONTROL_H = "h-10";

// Anasayfada bütçe planlama: tam genişlikte üç adım (mekân türü → alan → bütçe).
// Seçimler bütçe planlama sayfasına taşınır; sonuç orada telefon doğrulamasıyla açılır.
export function BudgetTeaser() {
  const router = useRouter();
  const [typeId, setTypeId] = useState(PROJECT_TYPES[0].id);
  const [area, setArea] = useState("");
  const [error, setError] = useState("");

  const selected = PROJECT_TYPES.find((t) => t.id === typeId) ?? PROJECT_TYPES[0];
  const areaNum = Number(area.replace(",", "."));
  const ready = Number.isFinite(areaNum) && areaNum >= AREA_MIN && areaNum <= AREA_MAX;

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) {
      setError(`Alanı ${AREA_MIN}–${AREA_MAX.toLocaleString("tr-TR")} m² arasında girin.`);
      return;
    }
    router.push(`/butce-planlama/?tur=${encodeURIComponent(typeId)}&alan=${encodeURIComponent(String(areaNum))}`);
  };

  return (
    <section aria-labelledby="budget-title" className="bg-[#F3F2EF]">
      <div className="container-wide pt-8 pb-14 lg:pt-10 lg:pb-16">
        <SectionHeader id="budget-title" title="Tasarım bütçenizi planlayın.">
          <SectionLead>Mekânınızın türünü ve alanını seçin, iç mimari tasarım bütçenizi önceden görün.</SectionLead>
        </SectionHeader>

        {/* Üç adım tek satırda; aralarındaki ince çizgiler footer ve logo ızgarasıyla aynı dilde */}
        <form onSubmit={go} className={`mt-8 grid border bg-white lg:mt-10 lg:grid-cols-12 ${LINE}`}>
          <fieldset className={`border-b p-5 sm:p-6 lg:col-span-6 lg:border-r lg:border-b-0 ${LINE}`}>
            <legend className="sr-only">Mekân türü</legend>
            <p className={stepLabel}>1 · Mekân türü</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={t.id === typeId}
                  onClick={() => setTypeId(t.id)}
                  className={`${CONTROL_H} cursor-pointer px-3.5 text-[14px] transition-colors duration-200 ${
                    t.id === typeId ? "bg-wawa-charcoal text-white" : "bg-[#F3F2EF] text-wawa-charcoal hover:bg-wawa-charcoal/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className={`border-b p-5 sm:p-6 lg:col-span-3 lg:border-r lg:border-b-0 ${LINE}`}>
            <label htmlFor="budget-area" className={stepLabel}>
              2 · Alan
            </label>
            <div className="relative mt-3">
              <input
                id="budget-area"
                type="text"
                inputMode="decimal"
                placeholder="Örn. 180"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value.replace(/[^\d.,]/g, ""));
                  setError("");
                }}
                className={`${CONTROL_H} w-full min-w-0 border border-wawa-charcoal/20 bg-white px-4 pr-12 text-[15px] text-wawa-charcoal tabular-nums placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal focus:outline-none`}
              />
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[15px] text-wawa-charcoal/55">m²</span>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-[#B42318]">
                {error}
              </p>
            )}
          </div>

          <div className="p-5 sm:p-6 lg:col-span-3">
            <p className={stepLabel}>3 · Tahmini bütçe</p>
            <button
              type="submit"
              className={`${CONTROL_H} group mt-3 flex w-full cursor-pointer items-center justify-between gap-4 bg-wawa-accent px-5 text-[15px] font-medium whitespace-nowrap text-wawa-charcoal transition-colors duration-300 hover:bg-wawa-charcoal hover:text-white`}
            >
              Bütçemi göster
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            {/* Seçimlerin özeti: ziyaretçi neyin hesaplanacağını butonun altında görür */}
            <p className="mt-3 text-[14px] text-wawa-charcoal/65" aria-live="polite">
              {selected.label}
              {ready && <> · {areaNum.toLocaleString("tr-TR")} m²</>}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

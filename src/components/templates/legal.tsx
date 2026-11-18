import type { LegalPage } from "@/content/legal";
import { LINE, PageIntro } from "./parts";

const UPDATED = { tr: "Son güncelleme", en: "Last updated", de: "Zuletzt aktualisiert", it: "Ultimo aggiornamento", fr: "Dernière mise à jour" };

// Gizlilik, çerez ve KVKK metinleri: sade, okunaklı, ince çizgilerle ayrılmış bölümler
export function LegalTemplate({ page }: { page: LegalPage }) {
  const lang = page.lang;
  return (
    <>
      <PageIntro lang={lang} title={page.title} lead={`${UPDATED[lang]}: ${page.updated}`} />
      <section className="bg-white" lang={lang}>
        <div className={`container-wide grid border-t pt-4 pb-14 lg:grid-cols-12 lg:pb-16 ${LINE}`}>
          <div className="lg:col-span-8 lg:col-start-3">
            {page.sections.map((s, i) => (
              <div key={s.h} className={`grid gap-3 py-8 sm:grid-cols-[3rem_1fr] ${i > 0 ? `border-t ${LINE}` : ""}`}>
                <span className="text-[13px] tabular-nums text-wawa-charcoal/45">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="text-[19px] tracking-tight text-wawa-charcoal">{s.h}</h2>
                  {s.p.map((p) => (
                    <p key={p} className="mt-3 max-w-[70ch] text-[16px] leading-relaxed text-wawa-charcoal/75">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

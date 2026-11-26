"use client";

// Fiyatlar: fuar standı m² aralıkları ve fiyat etkenleri, iç mimarlık fiyat rehberinin metinleri, ortak süreç adımları (TR/EN/DE).
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { LINE, Label, ListEdit, Notice, PageHead, SaveBar, Section, call, errText, get, input, textarea } from "./ui";

type L3 = "tr" | "en" | "de";
const L3S: L3[] = ["tr", "en", "de"];
const LNAME: Record<L3, string> = { tr: "Türkçe", en: "İngilizce", de: "Almanca" };
type TT = { title: string; text: string };
type Range = [number, number];
type Interior = {
  metaTitle: string;
  metaDesc: string;
  title: string;
  lead: string;
  h: Record<"parts" | "modes" | "factors" | "spaces" | "prepare" | "faq", string>;
  parts: { title: string; text: string; cta: { label: string; href: string } }[];
  modes: { title: string; text: string; items: string[] }[];
  factors: TT[];
  spaces: { title: string; href: string; items: string[] }[];
  prepare: string[];
  faq: { q: string; a: string }[];
  end: { title: string; text: string; cta: string; href: string };
};
type Prices = {
  stand: { year: number; ranges: Record<"ahsap" | "maxima", Record<"tr" | "abroad", Range>>; systemLabels: Record<L3, Record<"ahsap" | "maxima", string>>; factors: Record<L3, TT[]> };
  interior: { year: number; content: Record<L3, Interior> };
};
type Steps = { standProcess: Record<L3, TT[]>; interiorProcess: Record<L3, TT[]>; interiorScope: Record<L3, { title: string; text: string; features: string[] }[]> };

const TTList = ({ items, onChange, add }: { items: TT[]; onChange: (v: TT[]) => void; add: string }) => (
  <ListEdit
    items={items}
    onChange={onChange}
    make={(): TT => ({ title: "", text: "" })}
    addLabel={add}
    max={16}
    render={(x, put) => (
      <div className="grid gap-2">
        <input value={x.title} maxLength={160} placeholder="Başlık" onChange={(e) => put({ ...x, title: e.target.value })} className={input} />
        <textarea value={x.text} maxLength={1200} rows={2} placeholder="Açıklama" onChange={(e) => put({ ...x, text: e.target.value })} className={textarea} />
      </div>
    )}
  />
);
const lines = (v: string[]) => v.join("\n");
const unlines = (s: string) => s.split("\n");

export function PricesPage() {
  const [p, setP] = useState<Prices | null>(null);
  const [steps, setSteps] = useState<Steps | null>(null);
  const [lang, setLang] = useState<L3>("tr");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    get<{ prices: Prices; process: Steps }>("prices=1")
      .then((r) => {
        setP(r.prices);
        setSteps(r.process);
      })
      .catch((e) => setError(errText(e)));
  }, []);
  if (!p || !steps) return <div><PageHead title="Fiyatlar" /><p className="flex items-center gap-2 text-[14px] text-wawa-charcoal/60">{error ?? <><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</>}</p></div>;
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await call({ op: "prices.save", prices: p, process: steps });
      setMsg("Fiyatlar kaydedildi. Teklif formu, fiyat rehberi, fuar sayfaları ve yapay zeka stüdyosu yeni aralıkları kullanır; sitede birkaç dakika içinde güncellenir.");
      document.getElementById("admin-scroll")?.scrollTo({ top: 0 });
    } catch (e) {
      setError(errText(e, "Kaydedilemedi."));
    }
    setBusy(false);
  };
  const range = (sys: "ahsap" | "maxima", reg: "tr" | "abroad", i: 0 | 1, val: string) => {
    const r = [...p.stand.ranges[sys][reg]] as Range;
    r[i] = Number(val) || 0;
    setP({ ...p, stand: { ...p.stand, ranges: { ...p.stand.ranges, [sys]: { ...p.stand.ranges[sys], [reg]: r } } } });
  };
  const ic = p.interior.content[lang];
  const setIc = (v: Interior) => setP({ ...p, interior: { ...p.interior, content: { ...p.interior.content, [lang]: v } } });
  return (
    <div>
      <PageHead title="Fiyatlar" lead="Fuar standı fiyat aralıkları (€/m², KDV hariç) her dilde aynıdır; metinler dile göre düzenlenir." />
      {msg && <Notice text={msg} onClose={() => setMsg(null)} />}

      <Section title="Fuar standı m² aralıkları" lead="Bu aralıklar fiyat rehberinde, fuar sayfalarında, teklif formundaki canlı tahminde ve yapay zeka stüdyosunda kullanılır.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-wawa-charcoal text-left text-[12px] tracking-[0.08em] text-wawa-charcoal/55 uppercase">
                <th className="py-2 pr-3 font-normal">Sistem</th>
                <th className="py-2 pr-3 font-normal">Türkiye (en az – en çok)</th>
                <th className="py-2 font-normal">Yurt dışı (en az – en çok)</th>
              </tr>
            </thead>
            <tbody>
              {(["ahsap", "maxima"] as const).map((sys) => (
                <tr key={sys} className={`border-b ${LINE}`}>
                  <td className="py-3 pr-3 text-wawa-charcoal">{p.stand.systemLabels.tr[sys]}</td>
                  {(["tr", "abroad"] as const).map((reg) => (
                    <td key={reg} className="py-3 pr-3">
                      <span className="flex items-center gap-2">
                        <input type="number" min={1} value={p.stand.ranges[sys][reg][0]} onChange={(e) => range(sys, reg, 0, e.target.value)} className={`${input} h-10 w-24`} />–
                        <input type="number" min={1} value={p.stand.ranges[sys][reg][1]} onChange={(e) => range(sys, reg, 1, e.target.value)} className={`${input} h-10 w-24`} /> €
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid max-w-[480px] gap-3 sm:grid-cols-2">
          <Label text="Fuar standı rehberi yılı">
            <input type="number" value={p.stand.year} onChange={(e) => setP({ ...p, stand: { ...p.stand, year: Number(e.target.value) } })} className={input} />
          </Label>
          <Label text="İç mimarlık rehberi yılı">
            <input type="number" value={p.interior.year} onChange={(e) => setP({ ...p, interior: { ...p.interior, year: Number(e.target.value) } })} className={input} />
          </Label>
        </div>
      </Section>

      <div className={`sticky top-16 z-10 -mx-4 mb-2 flex border-b bg-[#FAFAF8] px-4 sm:-mx-8 sm:px-8 ${LINE}`}>
        {L3S.map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)} className={`-mb-px cursor-pointer border-b-2 px-4 py-3 text-[14px] ${l === lang ? "border-wawa-charcoal text-wawa-charcoal" : "border-transparent text-wawa-charcoal/55 hover:text-wawa-charcoal"}`}>
            {LNAME[l]} metinler
          </button>
        ))}
      </div>

      <Section title={`Stand sistemi adları ve fiyat etkenleri (${LNAME[lang]})`}>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {(["ahsap", "maxima"] as const).map((sys) => (
            <Label key={sys} text={sys === "ahsap" ? "Ahşap sistem adı" : "Maxima sistem adı"}>
              <input value={p.stand.systemLabels[lang][sys]} maxLength={60} onChange={(e) => setP({ ...p, stand: { ...p.stand, systemLabels: { ...p.stand.systemLabels, [lang]: { ...p.stand.systemLabels[lang], [sys]: e.target.value } } } })} className={input} />
            </Label>
          ))}
        </div>
        <TTList items={p.stand.factors[lang]} onChange={(v) => setP({ ...p, stand: { ...p.stand, factors: { ...p.stand.factors, [lang]: v } } })} add="Etken ekle" />
      </Section>

      <Section title={`İç mimarlık fiyat rehberi (${LNAME[lang]})`} lead="Rehber şu an rakam vermiyor; bütçenin nasıl oluştuğunu anlatıyor.">
        <div className="grid gap-3">
          <Label text="Sayfa başlığı">
            <input value={ic.title} maxLength={120} onChange={(e) => setIc({ ...ic, title: e.target.value })} className={input} />
          </Label>
          <Label text="Giriş metni">
            <textarea value={ic.lead} maxLength={600} rows={3} onChange={(e) => setIc({ ...ic, lead: e.target.value })} className={textarea} />
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Label text="Google başlığı">
              <input value={ic.metaTitle} maxLength={160} onChange={(e) => setIc({ ...ic, metaTitle: e.target.value })} className={input} />
            </Label>
            <Label text="Google açıklaması">
              <input value={ic.metaDesc} maxLength={320} onChange={(e) => setIc({ ...ic, metaDesc: e.target.value })} className={input} />
            </Label>
          </div>
          <p className="mt-2 text-[13px] text-wawa-charcoal/65">Bölüm başlıkları</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(ic.h) as (keyof Interior["h"])[]).map((k) => (
              <input key={k} value={ic.h[k]} maxLength={120} onChange={(e) => setIc({ ...ic, h: { ...ic.h, [k]: e.target.value } })} className={input} />
            ))}
          </div>
        </div>
        <p className="mt-6 mb-2 text-[14px] font-medium text-wawa-charcoal">Bütçenin iki kalemi</p>
        <ListEdit
          items={ic.parts}
          onChange={(parts) => setIc({ ...ic, parts })}
          make={() => ({ title: "", text: "", cta: { label: "", href: "" } })}
          addLabel="Kalem ekle"
          max={4}
          render={(x, put) => (
            <div className="grid gap-2">
              <input value={x.title} placeholder="Başlık" onChange={(e) => put({ ...x, title: e.target.value })} className={input} />
              <textarea value={x.text} rows={2} placeholder="Açıklama" onChange={(e) => put({ ...x, text: e.target.value })} className={textarea} />
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={x.cta.label} placeholder="Düğme yazısı" onChange={(e) => put({ ...x, cta: { ...x.cta, label: e.target.value } })} className={input} />
                <input value={x.cta.href} placeholder="Düğme bağlantısı (/…)" onChange={(e) => put({ ...x, cta: { ...x.cta, href: e.target.value } })} className={input} />
              </div>
            </div>
          )}
        />
        <p className="mt-6 mb-2 text-[14px] font-medium text-wawa-charcoal">Çalışma biçimleri</p>
        <ListEdit
          items={ic.modes}
          onChange={(modes) => setIc({ ...ic, modes })}
          make={() => ({ title: "", text: "", items: [] as string[] })}
          addLabel="Biçim ekle"
          max={6}
          render={(x, put) => (
            <div className="grid gap-2">
              <input value={x.title} placeholder="Başlık" onChange={(e) => put({ ...x, title: e.target.value })} className={input} />
              <textarea value={x.text} rows={2} placeholder="Açıklama" onChange={(e) => put({ ...x, text: e.target.value })} className={textarea} />
              <textarea value={lines(x.items)} rows={3} placeholder="Maddeler (her satıra bir)" onChange={(e) => put({ ...x, items: unlines(e.target.value) })} className={textarea} />
            </div>
          )}
        />
        <p className="mt-6 mb-2 text-[14px] font-medium text-wawa-charcoal">Fiyatı belirleyen kalemler</p>
        <TTList items={ic.factors} onChange={(factors) => setIc({ ...ic, factors })} add="Kalem ekle" />
        <p className="mt-6 mb-2 text-[14px] font-medium text-wawa-charcoal">Mekân türüne göre kalemler</p>
        <ListEdit
          items={ic.spaces}
          onChange={(spaces) => setIc({ ...ic, spaces })}
          make={() => ({ title: "", href: "", items: [] as string[] })}
          addLabel="Mekân ekle"
          max={12}
          render={(x, put) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={x.title} placeholder="Mekân" onChange={(e) => put({ ...x, title: e.target.value })} className={input} />
              <input value={x.href} placeholder="Sayfa bağlantısı (/…)" onChange={(e) => put({ ...x, href: e.target.value })} className={input} />
              <textarea value={lines(x.items)} rows={3} placeholder="Maddeler (her satıra bir)" onChange={(e) => put({ ...x, items: unlines(e.target.value) })} className={`${textarea} sm:col-span-2`} />
            </div>
          )}
        />
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <Label text="Teklif öncesi hazırlık (her satıra bir madde)">
            <textarea value={lines(ic.prepare)} rows={6} onChange={(e) => setIc({ ...ic, prepare: unlines(e.target.value) })} className={textarea} />
          </Label>
          <div className="grid content-start gap-2">
            <p className="text-[13px] text-wawa-charcoal/65">Kapanış kutusu</p>
            <input value={ic.end.title} placeholder="Başlık" onChange={(e) => setIc({ ...ic, end: { ...ic.end, title: e.target.value } })} className={input} />
            <textarea value={ic.end.text} rows={2} placeholder="Metin" onChange={(e) => setIc({ ...ic, end: { ...ic.end, text: e.target.value } })} className={textarea} />
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={ic.end.cta} placeholder="Düğme yazısı" onChange={(e) => setIc({ ...ic, end: { ...ic.end, cta: e.target.value } })} className={input} />
              <input value={ic.end.href} placeholder="Düğme bağlantısı" onChange={(e) => setIc({ ...ic, end: { ...ic.end, href: e.target.value } })} className={input} />
            </div>
          </div>
        </div>
        <p className="mt-6 mb-2 text-[14px] font-medium text-wawa-charcoal">Sık sorulanlar</p>
        <ListEdit
          items={ic.faq}
          onChange={(faq) => setIc({ ...ic, faq })}
          make={() => ({ q: "", a: "" })}
          addLabel="Soru ekle"
          max={16}
          render={(x, put) => (
            <div className="grid gap-2">
              <input value={x.q} placeholder="Soru" onChange={(e) => put({ ...x, q: e.target.value })} className={input} />
              <textarea value={x.a} rows={3} placeholder="Cevap" onChange={(e) => put({ ...x, a: e.target.value })} className={textarea} />
            </div>
          )}
        />
      </Section>

      <Section title={`Ortak süreç adımları (${LNAME[lang]})`} lead="Sektör ve stand sayfalarında görünen süreç ve kapsam (hizmet sayfalarının kendi adımları Sayfalar bölümündedir).">
        <p className="mb-2 text-[14px] font-medium text-wawa-charcoal">Fuar standı süreci</p>
        <TTList items={steps.standProcess[lang]} onChange={(v) => setSteps({ ...steps, standProcess: { ...steps.standProcess, [lang]: v } })} add="Adım ekle" />
        <p className="mt-6 mb-2 text-[14px] font-medium text-wawa-charcoal">İç mimarlık süreci</p>
        <TTList items={steps.interiorProcess[lang]} onChange={(v) => setSteps({ ...steps, interiorProcess: { ...steps.interiorProcess, [lang]: v } })} add="Adım ekle" />
        <p className="mt-6 mb-2 text-[14px] font-medium text-wawa-charcoal">İç mimarlık hizmet kapsamı</p>
        <ListEdit
          items={steps.interiorScope[lang]}
          onChange={(v) => setSteps({ ...steps, interiorScope: { ...steps.interiorScope, [lang]: v } })}
          make={() => ({ title: "", text: "", features: [] as string[] })}
          addLabel="Kart ekle"
          max={6}
          render={(x, put) => (
            <div className="grid gap-2">
              <input value={x.title} placeholder="Başlık" onChange={(e) => put({ ...x, title: e.target.value })} className={input} />
              <textarea value={x.text} rows={2} placeholder="Açıklama" onChange={(e) => put({ ...x, text: e.target.value })} className={textarea} />
              <textarea value={lines(x.features)} rows={3} placeholder="Maddeler (her satıra bir)" onChange={(e) => put({ ...x, features: unlines(e.target.value) })} className={textarea} />
            </div>
          )}
        />
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} label="Fiyatları ve metinleri kaydet" />
    </div>
  );
}

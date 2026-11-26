"use client";

// Fuar takvimi: arama ve bölge süzgeciyle liste; fuar ekleme, düzenleme, silme. Fuar sayfasının adresi (slug) değişmez.
import { useEffect, useState } from "react";
import { EyeOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { LINE, Label, Notice, PageHead, SaveBar, btn, btnDark, call, errText, get, input } from "./ui";

type Fair = { slug: string; name: string; city: string; country: string; venue?: string; region: string; start: string; end: string; sector: string; url?: string; verified?: boolean; match: string[] };
const REGIONS: [string, string][] = [
  ["tr", "Türkiye"],
  ["eu", "Avrupa"],
  ["uk", "İngiltere"],
  ["me", "Orta Doğu"],
  ["am", "Amerika"],
];
const regionName = (r: string) => REGIONS.find(([k]) => k === r)?.[1] ?? r;
const blank = (): Fair => ({ slug: "", name: "", city: "", country: "", region: "tr", start: "", end: "", sector: "", verified: true, match: [] });
const norm = (s: string) => s.toLocaleLowerCase("tr-TR");

export function FairsPage() {
  const [fairs, setFairs] = useState<Fair[] | null>(null);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [past, setPast] = useState(false);
  const [edit, setEdit] = useState<Fair | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(100);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const load = () =>
    get<{ fairs: Fair[] }>("fairs=1")
      .then((r) => setFairs(r.fairs))
      .catch((e) => setError(errText(e)));
  useEffect(() => {
    load();
  }, []);
  if (edit)
    return (
      <FairForm
        fair={edit}
        onClose={() => setEdit(null)}
        onSaved={(m) => {
          setMsg(m);
          setEdit(null);
          load();
        }}
      />
    );
  const words = norm(q).split(/\s+/).filter(Boolean);
  const all = (fairs ?? []).filter((f) => (!region || f.region === region) && (past || f.end >= today) && words.every((w) => norm(`${f.name} ${f.city} ${f.country} ${f.sector}`).includes(w)));
  return (
    <div>
      <PageHead title="Fuar takvimi" lead={`${fairs?.length ?? "…"} fuar. Fuar sayfaları üç dilde otomatik oluşur; fuarın adresi (slug) değişmez.`}>
        <button type="button" onClick={() => setEdit(blank())} className={btnDark}>
          <Plus className="h-4 w-4" /> Yeni fuar
        </button>
      </PageHead>
      {msg && <Notice text={`${msg} Sitede birkaç dakika içinde güncellenir.`} onClose={() => setMsg(null)} />}
      {error && <p className="text-[14px] text-[#B42318]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <label className={`flex h-10 items-center gap-2 border bg-white px-3 ${LINE}`}>
          <Search className="h-4 w-4 text-wawa-charcoal/45" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Fuar, şehir, sektör" className="w-48 text-[14px] outline-none" />
        </label>
        {[["", "Tümü"], ...REGIONS].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setRegion(k)} className={`h-10 cursor-pointer border px-3 text-[13px] ${region === k ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 bg-white text-wawa-charcoal hover:border-wawa-charcoal"}`}>
            {l}
          </button>
        ))}
        <label className="ml-2 flex cursor-pointer items-center gap-2 text-[13px] text-wawa-charcoal">
          <input type="checkbox" checked={past} onChange={(e) => setPast(e.target.checked)} className="h-4 w-4 accent-[#1f1f1f]" /> Geçmiş fuarları da göster
        </label>
        <span className="text-[13px] text-wawa-charcoal/55">{all.length} sonuç</span>
      </div>
      {!fairs && !error && <p className="mt-6 flex items-center gap-2 text-[14px] text-wawa-charcoal/60"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</p>}
      <ul className={`mt-5 border-t ${LINE}`}>
        {all.slice(0, limit).map((f) => (
          <li key={f.slug} className={`grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-3 border-b py-2.5 ${LINE}`}>
            <span className="text-[13px] tabular-nums text-wawa-charcoal/70">
              {f.start}
              <span className="block text-[11px] text-wawa-charcoal/45">{f.end}</span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] text-wawa-charcoal">
                {f.name}
                {f.verified === false && (
                  <span title="Tarih organizatörün sitesinde doğrulanmadı" className="ml-2 inline-flex items-center gap-1 bg-[#FFF4E5] px-1.5 text-[11px] text-[#B54708]">
                    <EyeOff className="h-3 w-3" /> doğrulanmadı
                  </span>
                )}
              </span>
              <span className="text-[12px] text-wawa-charcoal/50">
                {f.city}, {f.country} · {regionName(f.region)} · {f.sector}
              </span>
            </span>
            <button type="button" onClick={() => setEdit(f)} className="inline-flex h-9 cursor-pointer items-center gap-2 px-3 text-[13px] text-wawa-charcoal hover:bg-[#F3F2EF]">
              <Pencil className="h-3.5 w-3.5" /> Düzenle
            </button>
          </li>
        ))}
      </ul>
      {all.length > limit && (
        <button type="button" onClick={() => setLimit((n) => n + 100)} className={`${btn} mt-4 border border-wawa-charcoal/20 bg-white text-wawa-charcoal`}>
          Daha fazla göster ({all.length - limit})
        </button>
      )}
    </div>
  );
}

function FairForm({ fair, onClose, onSaved }: { fair: Fair; onClose: () => void; onSaved: (m: string) => void }) {
  const [f, setF] = useState<Fair>(fair);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !fair.slug;
  const act = async (body: Record<string, unknown>, m: string) => {
    setBusy(true);
    setError(null);
    try {
      await call(body);
      onSaved(m);
    } catch (e) {
      setError(errText(e, "Kaydedilemedi."));
      setBusy(false);
    }
  };
  const set = <K extends keyof Fair>(k: K, v: Fair[K]) => setF({ ...f, [k]: v });
  return (
    <div>
      <PageHead title={isNew ? "Yeni fuar" : f.name} lead={isNew ? "Kaydedince fuarın Türkçe, İngilizce ve Almanca sayfası açılır." : `Adres: /fuar-takvimi/${f.slug}/`} back={{ label: "Fuar takvimine dön", onClick: onClose }} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label text="Fuar adı *">
            <input value={f.name} maxLength={140} onChange={(e) => set("name", e.target.value)} className={input} />
          </Label>
        </div>
        <Label text="Başlangıç *">
          <input type="date" value={f.start} onChange={(e) => set("start", e.target.value)} className={input} />
        </Label>
        <Label text="Bitiş *">
          <input type="date" value={f.end} onChange={(e) => set("end", e.target.value)} className={input} />
        </Label>
        <Label text="Şehir * (Türkçe yazımıyla: Münih, Köln…)">
          <input value={f.city} maxLength={60} onChange={(e) => set("city", e.target.value)} className={input} />
        </Label>
        <Label text="Ülke * (Türkçe: Almanya, BAE…)">
          <input value={f.country} maxLength={60} onChange={(e) => set("country", e.target.value)} className={input} />
        </Label>
        <Label text="Bölge *">
          <select value={f.region} onChange={(e) => set("region", e.target.value)} className={input}>
            {REGIONS.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Fuar alanı">
          <input value={f.venue ?? ""} maxLength={140} onChange={(e) => set("venue", e.target.value || undefined)} className={input} />
        </Label>
        <Label text="Sektör * (Türkçe; takvimdeki sektör grubu bundan bulunur)">
          <input value={f.sector} maxLength={120} onChange={(e) => set("sector", e.target.value)} className={input} />
        </Label>
        <Label text="Resmî site">
          <input value={f.url ?? ""} maxLength={300} placeholder="https://" onChange={(e) => set("url", e.target.value || undefined)} className={input} />
        </Label>
        <div className="sm:col-span-2">
          <Label text="Proje eşleştirme kelimeleri (virgülle)" hint="Proje başlığında bu kelimelerden biri geçerse proje fuar sayfasında gösterilir. Boşsa fuar adı kullanılır.">
            <input value={f.match.join(", ")} onChange={(e) => set("match", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} className={input} />
          </Label>
        </div>
      </div>
      <label className="mt-6 flex cursor-pointer items-center gap-3 text-[14px] text-wawa-charcoal">
        <input type="checkbox" checked={f.verified !== false} onChange={(e) => set("verified", e.target.checked)} className="h-4 w-4 accent-[#1f1f1f]" />
        Tarihler organizatörün resmî sitesinde doğrulandı
      </label>
      <SaveBar busy={busy} error={error} onSave={() => act({ op: "fair.save", slug: f.slug, fair: f }, isNew ? "Fuar eklendi." : "Fuar güncellendi.")}>
        {!isNew && (
          <button type="button" disabled={busy} onClick={() => window.confirm(`"${f.name}" silinsin mi? Üç dildeki fuar sayfası da kalkar. Geçmiş'ten geri alınabilir.`) && act({ op: "fair.delete", slug: f.slug }, "Fuar silindi.")} className={`${btn} text-[#B42318] hover:underline`}>
            <Trash2 className="h-4 w-4" /> Fuarı sil
          </button>
        )}
      </SaveBar>
    </div>
  );
}

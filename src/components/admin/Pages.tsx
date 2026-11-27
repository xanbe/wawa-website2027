"use client";

// Sayfalar: hizmet açılış sayfaları (iç mimarlık türleri, fuar standı, kongre, Maxima) ile sektör, stand, inşaat ve mobilya sayfaları.
// Her dil ayrı kayıttır; İngilizce ve Almanca sayfada "Türkçeden çevir" Türkçe sayfanın metnini aynı yapıda çevirip forma doldurur.
import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink, Languages, Loader2, Pencil } from "lucide-react";
import { ERR, LINE, ImageField, Label, ListEdit, Notice, PageHead, SaveBar, Section, btnLine, call, errText, get, input, show, textarea, type Blob } from "./ui";

type L3 = "tr" | "en" | "de";
const L3S: L3[] = ["tr", "en", "de"];
const LNAME: Record<L3, string> = { tr: "Türkçe", en: "İngilizce", de: "Almanca" };
type Row = { id: string; kind: string; title: string; langs: Partial<Record<L3, string | null>> };
type Cat = { path: string; name: string };
type TT = { title: string; text: string };
type Landing = {
  kicker: string;
  title: string;
  lead: string;
  h1?: string;
  heroImages: string[];
  heroVideo?: string;
  highlights: TT[];
  intro: TT;
  offerings?: { title: string; text: string; image: string; href?: string }[];
  offeringsTitle?: string;
  process: TT[];
  processTitle?: string;
  blocks?: { title: string; lead?: string; items: TT[] }[];
  projectCategories?: string[];
  projectPaths?: string[];
  scope?: { title: string; text: string; features: string[] }[];
  showReach?: boolean;
  showBrands?: boolean;
};
type Extra = {
  key: string;
  path: string;
  lang: L3;
  title: string;
  lead: string;
  image: string;
  sections: { h: string; p: string }[];
  points: string[];
  projectCategories?: string[];
  projectPaths?: string[];
  faq?: { q: string; a: string }[];
  seo: { title: string; description: string };
};
const KIND: Record<string, string> = { landing: "Hizmet", sector: "Sektör", stand: "Stand", construction: "İnşaat", furniture: "Mobilya" };

export function PagesPage() {
  const [data, setData] = useState<{ services: Row[]; pages: Row[]; translate: boolean; categories: Cat[] } | null>(null);
  const [edit, setEdit] = useState<{ kind: "landing" | "extra"; path: string; lang: L3; row: Row } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ver, setVer] = useState(0);
  useEffect(() => {
    get<NonNullable<typeof data>>("pages=1")
      .then(setData)
      .catch((e) => setError(errText(e)));
  }, [ver]);
  if (edit && data)
    return (
      <PageEditor
        key={`${edit.path}-${ver}`}
        {...edit}
        categories={data.categories}
        canTranslate={data.translate}
        onSwitch={(lang) => edit.row.langs[lang] && setEdit({ ...edit, lang, path: edit.row.langs[lang]! })}
        onClose={() => setEdit(null)}
        onSaved={(m) => {
          setMsg(m);
          setVer((v) => v + 1);
        }}
      />
    );
  const table = (rows: Row[], kind: "landing" | "extra") => (
    <ul className={`border-t ${LINE}`}>
      {rows.map((r) => (
        <li key={r.id} className={`flex flex-wrap items-center justify-between gap-3 border-b py-3 ${LINE}`}>
          <span className="min-w-0">
            <span className="block text-[15px] text-wawa-charcoal">{r.title || r.id}</span>
            <span className="text-[12px] text-wawa-charcoal/50">
              {KIND[r.kind] ?? r.kind} · {r.langs.tr ?? r.id}
            </span>
          </span>
          <span className="flex gap-1">
            {L3S.map((l) =>
              r.langs[l] ? (
                <button key={l} type="button" onClick={() => setEdit({ kind, path: r.langs[l]!, lang: l, row: r })} className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-wawa-charcoal/20 bg-white px-3 text-[13px] text-wawa-charcoal hover:border-wawa-charcoal">
                  <Pencil className="h-3 w-3" /> {l.toUpperCase()}
                </button>
              ) : (
                <span key={l} title={`${LNAME[l]} sürüm yok`} className="inline-flex h-9 items-center px-3 text-[13px] text-wawa-charcoal/30">
                  {l.toUpperCase()}
                </span>
              ),
            )}
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      <PageHead title="Sayfalar" lead="Hizmet, sektör ve stand sayfalarının metinleri, görselleri, süreç adımları ve SSS'leri. Her dil ayrı düzenlenir; adresler değişmez." />
      {msg && <Notice text={`${msg} Sitede birkaç dakika içinde güncellenir.`} onClose={() => setMsg(null)} />}
      {error && <p className={ERR}>{error}</p>}
      {!data && !error && <p className="flex items-center gap-2 text-[14px] text-wawa-charcoal/60"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</p>}
      {data && (
        <>
          <Section title="Hizmet sayfaları" lead="İç mimarlık türleri, fuar standı, kongre standı ve Maxima açılış sayfaları.">
            {table(data.services, "landing")}
          </Section>
          <Section title="Sektör, stand, inşaat ve mobilya sayfaları">{table(data.pages, "extra")}</Section>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ortak küçük düzenleyiciler
const TTList = ({ items, onChange, add, max = 12 }: { items: TT[]; onChange: (v: TT[]) => void; add: string; max?: number }) => (
  <ListEdit
    items={items}
    onChange={onChange}
    make={(): TT => ({ title: "", text: "" })}
    addLabel={add}
    max={max}
    render={(x, put) => (
      <div className="grid gap-2">
        <input value={x.title} maxLength={160} placeholder="Başlık" onChange={(e) => put({ ...x, title: e.target.value })} className={input} />
        <textarea value={x.text} maxLength={1200} rows={2} placeholder="Açıklama" onChange={(e) => put({ ...x, text: e.target.value })} className={textarea} />
      </div>
    )}
  />
);
const Lines = ({ value, onChange, rows = 4, hint }: { value: string[]; onChange: (v: string[]) => void; rows?: number; hint?: string }) => (
  <Label text="Her satıra bir madde" hint={hint}>
    <textarea value={value.join("\n")} rows={rows} onChange={(e) => onChange(e.target.value.split("\n"))} className={textarea} />
  </Label>
);
function CatPick({ value, onChange, categories }: { value: string[]; onChange: (v: string[]) => void; categories: Cat[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const on = value.includes(c.path);
        return (
          <button key={c.path} type="button" onClick={() => onChange(on ? value.filter((x) => x !== c.path) : [...value, c.path])} className={`h-9 cursor-pointer border px-3 text-[13px] ${on ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 bg-white text-wawa-charcoal hover:border-wawa-charcoal"}`}>
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
function ImagesEdit({ value, onChange, blobs }: { value: string[]; onChange: (v: string[]) => void; blobs: Blob[] }) {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((src, i) => (
          <li key={src + i} className={`relative aspect-video overflow-hidden border bg-[#F3F2EF] ${LINE}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={show(src)} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1 text-white">
              <button type="button" disabled={i === 0} onClick={() => onChange([src, ...value.filter((_, k) => k !== i)])} className="cursor-pointer px-2 text-[12px] disabled:opacity-40">
                {i === 0 ? "İlk" : "Başa al"}
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="cursor-pointer px-2 text-[12px]">
                Kaldır
              </button>
            </span>
          </li>
        ))}
        <li>
          <ImageField value="" onChange={(src) => src && onChange([...value, src])} blobs={blobs} ratio="aspect-video" />
        </li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- düzenleyici
function PageEditor({
  kind,
  path,
  lang,
  row,
  categories,
  canTranslate,
  onSwitch,
  onClose,
  onSaved,
}: {
  kind: "landing" | "extra";
  path: string;
  lang: L3;
  row: Row;
  categories: Cat[];
  canTranslate: boolean;
  onSwitch: (l: L3) => void;
  onClose: () => void;
  onSaved: (m: string) => void;
}) {
  const [item, setItem] = useState<Landing | Extra | null>(null);
  const [blobs] = useState<Blob[]>(() => []);
  const [busy, setBusy] = useState(false);
  const [tBusy, setTBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ver, setVer] = useState(0);
  useEffect(() => {
    get<{ item: Landing | Extra }>(`${kind}=${encodeURIComponent(path)}`)
      .then((r) => setItem(r.item))
      .catch((e) => setError(errText(e)));
  }, [kind, path]);
  const translate = async () => {
    if (!row.langs.tr || !item) return;
    setTBusy(true);
    setError(null);
    try {
      const tr = (await get<{ item: Landing | Extra }>(`${kind}=${encodeURIComponent(row.langs.tr)}`)).item;
      const r = await call<Record<"en" | "de", Landing | Extra>>({ op: "translate.page", item: tr });
      const t = r[lang as "en" | "de"] as Landing & Extra;
      // Adresler, görseller ve kimlikler bu dilin kendi değerleri kalır
      const cur = item as Landing & Extra;
      const merged = { ...t, ...(kind === "extra" ? { key: cur.key, path: cur.path, lang: cur.lang } : {}) } as Landing & Extra;
      if (kind === "landing" && merged.offerings) merged.offerings = merged.offerings.map((o, i) => ({ ...o, href: cur.offerings?.[i]?.href }));
      setItem(merged);
      setVer((v) => v + 1);
    } catch (e) {
      setError(errText(e));
    }
    setTBusy(false);
  };
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await call({ op: kind === "landing" ? "landing.save" : "extra.save", path, item, blobs });
      onSaved(`${LNAME[lang]} sayfa kaydedildi (${path}).`);
      onClose();
    } catch (e) {
      setError(errText(e, "Kaydedilemedi."));
      setBusy(false);
    }
  };
  const head = (
    <PageHead title={row.title || path} lead={`${LNAME[lang]} · ${path}`} back={{ label: "Sayfalara dön", onClick: onClose }}>
      <a href={path} target="_blank" rel="noopener noreferrer" className={btnLine}>
        <ExternalLink className="h-4 w-4" /> Sayfayı aç
      </a>
    </PageHead>
  );
  const tabs = (
    <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 border-b ${LINE}`}>
      <div className="flex">
        {L3S.map((l) => (
          <button key={l} type="button" disabled={!row.langs[l]} onClick={() => onSwitch(l)} className={`-mb-px cursor-pointer border-b-2 px-4 py-3 text-[14px] disabled:cursor-default disabled:opacity-30 ${l === lang ? "border-wawa-charcoal text-wawa-charcoal" : "border-transparent text-wawa-charcoal/55 hover:text-wawa-charcoal"}`}>
            {LNAME[l]}
          </button>
        ))}
      </div>
      {lang !== "tr" && row.langs.tr && (
        <button type="button" disabled={tBusy || !canTranslate} title={canTranslate ? "" : "Panelde otomatik çeviri kapalı; çeviriyi Claude'a yaptırın"} onClick={translate} className={`${btnLine} mb-2 h-9 px-3 text-[13px]`}>
          {tBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />} Türkçe sayfadan çevir
        </button>
      )}
    </div>
  );
  if (!item) return <div>{head}<p className="flex items-center gap-2 text-[14px] text-wawa-charcoal/60">{error ?? <><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</>}</p></div>;
  return (
    <div>
      {head}
      {tabs}
      {lang !== "tr" && <p className="mb-4 bg-[#F7F6F3] px-4 py-3 text-[13px] text-wawa-charcoal/75">Çeviri formu doldurur; kontrol edip Kaydet&apos;e basınca kaydedilir. Diller birbirinden bağımsızdır.</p>}
      <div key={ver}>{kind === "landing" ? <LandingForm v={item as Landing} set={(v) => setItem(v)} blobs={blobs} categories={categories} /> : <ExtraForm v={item as Extra} set={(v) => setItem(v)} blobs={blobs} categories={categories} />}</div>
      <SaveBar busy={busy} error={error} onSave={save} label={`${LNAME[lang]} sayfayı kaydet`} />
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <Label text={label} hint={hint}>
      {children}
    </Label>
  );
}

function LandingForm({ v, set, blobs, categories }: { v: Landing; set: (v: Landing) => void; blobs: Blob[]; categories: Cat[] }) {
  const up = <K extends keyof Landing>(k: K, x: Landing[K]) => set({ ...v, [k]: x });
  return (
    <div>
      <Section title="Açılış">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Üst etiket">
            <input value={v.kicker} maxLength={80} onChange={(e) => up("kicker", e.target.value)} className={input} />
          </Field>
          <Field label="Sayfa başlığı (H1, boşsa eski başlık)">
            <input value={v.h1 ?? ""} maxLength={120} onChange={(e) => up("h1", e.target.value || undefined)} className={input} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Tanıtım başlığı">
              <input value={v.title} maxLength={200} onChange={(e) => up("title", e.target.value)} className={input} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Açılış metni">
              <textarea value={v.lead} maxLength={600} rows={3} onChange={(e) => up("lead", e.target.value)} className={textarea} />
            </Field>
          </div>
          <Field label="Açılış videosu (isteğe bağlı)" hint="YouTube kimliği/bağlantısı ya da yüklenen MP4 adresi; fuar standı sayfalarında boşsa genel açılış videosu oynar.">
            <input value={v.heroVideo ?? ""} maxLength={400} onChange={(e) => up("heroVideo", e.target.value || undefined)} className={input} />
          </Field>
        </div>
        <p className="mt-5 mb-1.5 text-[13px] text-wawa-charcoal/65">Açılış görselleri (sırayla geçer)</p>
        <ImagesEdit value={v.heroImages} onChange={(x) => up("heroImages", x)} blobs={blobs} />
      </Section>
      <Section title="Tanıtım ve öne çıkanlar">
        <div className="grid gap-3">
          <input value={v.intro.title} maxLength={200} placeholder="Tanıtım başlığı" onChange={(e) => up("intro", { ...v.intro, title: e.target.value })} className={input} />
          <textarea value={v.intro.text} maxLength={2000} rows={4} placeholder="Tanıtım metni" onChange={(e) => up("intro", { ...v.intro, text: e.target.value })} className={textarea} />
        </div>
        <p className="mt-5 mb-2 text-[13px] text-wawa-charcoal/65">Öne çıkan dört başlık</p>
        <TTList items={v.highlights} onChange={(x) => up("highlights", x)} add="Başlık ekle" max={6} />
      </Section>
      {v.offerings && (
        <Section title="Hizmet kartları">
          <Field label="Bölüm başlığı">
            <input value={v.offeringsTitle ?? ""} maxLength={120} onChange={(e) => up("offeringsTitle", e.target.value || undefined)} className={input} />
          </Field>
          <div className="mt-4">
            <ListEdit
              items={v.offerings}
              onChange={(x) => up("offerings", x)}
              make={(): NonNullable<Landing["offerings"]>[number] => ({ title: "", text: "", image: "" })}
              addLabel="Kart ekle"
              max={12}
              render={(o, put) => (
                <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <ImageField value={o.image} onChange={(image) => put({ ...o, image })} blobs={blobs} ratio="aspect-[4/3]" />
                  <div className="grid gap-2">
                    <input value={o.title} maxLength={120} placeholder="Başlık" onChange={(e) => put({ ...o, title: e.target.value })} className={input} />
                    <textarea value={o.text} maxLength={600} rows={2} placeholder="Açıklama" onChange={(e) => put({ ...o, text: e.target.value })} className={textarea} />
                    <input value={o.href ?? ""} maxLength={300} placeholder="Bağlantı (isteğe bağlı, /… )" onChange={(e) => put({ ...o, href: e.target.value || undefined })} className={input} />
                  </div>
                </div>
              )}
            />
          </div>
        </Section>
      )}
      <Section title="Hizmet kapsamı" lead="Görselsiz kapsam kartları (ör. konsept, teknik proje, uygulama).">
        <ListEdit
          items={v.scope ?? []}
          onChange={(x) => up("scope", x.length ? x : undefined)}
          make={() => ({ title: "", text: "", features: [] })}
          addLabel="Kart ekle"
          max={6}
          render={(s, put) => (
            <div className="grid gap-2">
              <input value={s.title} maxLength={120} placeholder="Başlık" onChange={(e) => put({ ...s, title: e.target.value })} className={input} />
              <textarea value={s.text} maxLength={600} rows={2} placeholder="Açıklama" onChange={(e) => put({ ...s, text: e.target.value })} className={textarea} />
              <Lines value={s.features} onChange={(features) => put({ ...s, features })} rows={3} />
            </div>
          )}
        />
      </Section>
      <Section title="Süreç adımları">
        <Field label="Bölüm başlığı (boşsa “Süreç nasıl ilerler?”)">
          <input value={v.processTitle ?? ""} maxLength={120} onChange={(e) => up("processTitle", e.target.value || undefined)} className={input} />
        </Field>
        <div className="mt-4">
          <TTList items={v.process} onChange={(x) => up("process", x)} add="Adım ekle" />
        </div>
      </Section>
      <Section title="Ek bilgi blokları" lead="Örn. sektörler, bütçeyi etkileyen kalemler.">
        <ListEdit
          items={v.blocks ?? []}
          onChange={(x) => up("blocks", x.length ? x : undefined)}
          make={(): NonNullable<Landing["blocks"]>[number] => ({ title: "", items: [] })}
          addLabel="Blok ekle"
          max={8}
          render={(b, put) => (
            <div className="grid gap-3">
              <input value={b.title} maxLength={160} placeholder="Blok başlığı" onChange={(e) => put({ ...b, title: e.target.value })} className={input} />
              <textarea value={b.lead ?? ""} maxLength={600} rows={2} placeholder="Giriş (isteğe bağlı)" onChange={(e) => put({ ...b, lead: e.target.value || undefined })} className={textarea} />
              <TTList items={b.items} onChange={(items) => put({ ...b, items })} add="Madde ekle" max={16} />
            </div>
          )}
        />
      </Section>
      <Section title="Projeler" lead="Sayfada gösterilecek proje kategorileri.">
        <CatPick value={v.projectCategories ?? []} onChange={(x) => up("projectCategories", x.length ? x : undefined)} categories={categories} />
        <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px] text-wawa-charcoal">
          <input type="checkbox" checked={Boolean(v.showBrands)} onChange={(e) => up("showBrands", e.target.checked || undefined)} className="h-4 w-4 accent-[#1f1f1f]" /> Marka logolarını göster
        </label>
      </Section>
    </div>
  );
}

function ExtraForm({ v, set, blobs, categories }: { v: Extra; set: (v: Extra) => void; blobs: Blob[]; categories: Cat[] }) {
  const up = <K extends keyof Extra>(k: K, x: Extra[K]) => set({ ...v, [k]: x });
  return (
    <div>
      <Section title="Açılış">
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <ImageField value={v.image} onChange={(image) => up("image", image)} blobs={blobs} ratio="aspect-video" />
          <div className="grid gap-3">
            <Field label="Sayfa başlığı">
              <input value={v.title} maxLength={120} onChange={(e) => up("title", e.target.value)} className={input} />
            </Field>
            <Field label="Açılış metni">
              <textarea value={v.lead} maxLength={600} rows={3} onChange={(e) => up("lead", e.target.value)} className={textarea} />
            </Field>
          </div>
        </div>
        <div className="mt-4">
          <Lines value={v.points} onChange={(points) => up("points", points)} hint="Öne çıkan başlıklar (en fazla 8)." />
        </div>
      </Section>
      <Section title="Bölümler" lead="İlk bölüm tanıtım olarak, diğerleri “Neye dikkat ediyoruz?” altında görünür.">
        <ListEdit
          items={v.sections}
          onChange={(x) => up("sections", x)}
          make={() => ({ h: "", p: "" })}
          addLabel="Bölüm ekle"
          max={12}
          render={(s, put) => (
            <div className="grid gap-2">
              <input value={s.h} maxLength={160} placeholder="Başlık" onChange={(e) => put({ ...s, h: e.target.value })} className={input} />
              <textarea value={s.p} maxLength={2000} rows={3} placeholder="Metin" onChange={(e) => put({ ...s, p: e.target.value })} className={textarea} />
            </div>
          )}
        />
      </Section>
      <Section title="Sık sorulan sorular">
        <ListEdit
          items={v.faq ?? []}
          onChange={(x) => up("faq", x.length ? x : undefined)}
          make={() => ({ q: "", a: "" })}
          addLabel="Soru ekle"
          max={16}
          render={(f, put) => (
            <div className="grid gap-2">
              <input value={f.q} maxLength={240} placeholder="Soru" onChange={(e) => put({ ...f, q: e.target.value })} className={input} />
              <textarea value={f.a} maxLength={1500} rows={3} placeholder="Cevap" onChange={(e) => put({ ...f, a: e.target.value })} className={textarea} />
            </div>
          )}
        />
      </Section>
      <Section title="Projeler" lead="Sayfada gösterilecek proje kategorileri.">
        <CatPick value={v.projectCategories ?? []} onChange={(x) => up("projectCategories", x.length ? x : undefined)} categories={categories} />
      </Section>
      <Section title="Google görünümü">
        <div className="grid gap-3">
          <Field label="Arama sonucu başlığı">
            <input value={v.seo.title} maxLength={120} onChange={(e) => up("seo", { ...v.seo, title: e.target.value })} className={input} />
          </Field>
          <Field label="Arama sonucu açıklaması">
            <textarea value={v.seo.description} maxLength={300} rows={2} onChange={(e) => up("seo", { ...v.seo, description: e.target.value })} className={textarea} />
          </Field>
        </div>
      </Section>
    </div>
  );
}

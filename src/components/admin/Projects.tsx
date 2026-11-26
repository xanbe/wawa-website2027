"use client";

// Projeler: sürükle-bırak sıralama, ekleme/düzenleme (TR/EN/DE), taslak, video, fotoğraf dizilimi.
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, EyeOff, GripVertical, Loader2, Pencil, Plus, Search, Trash2, Video } from "lucide-react";
import { LINE, LangTabs, Label, PageHead, SaveBar, btn, btnAccent, btnDark, call, errText, get, input, reorder, show, textarea, GalleryEdit, RichText, ERR, type Blob, type Img, type Lang, type LangState, type Text } from "./ui";

export type ProjectRow = { path: string; title: string; featuredImage: string | null; category: string; draft: boolean; video: boolean };
type ProjectItem = { path: string; title: string; html: string; featuredImage: string | null; meta?: Record<string, string>; gallery: Img[]; seo: { description: string | null }; draft?: boolean; video?: string };

export function ProjectList({ rows, categories, onEdit, onSaved }: { rows: ProjectRow[]; categories: string[]; onEdit: (p: string | "new") => void; onSaved: (msg: string) => void }) {
  const [order, setOrder] = useState(rows);
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drag = useRef<string | null>(null);
  const shown = order.filter((p) => (!cat || p.category === cat) && (!q || p.title.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"))));
  // Süzülmüş görünümde yapılan sıralama, o projelerin genel listedeki yerlerine yazılır
  const move = (from: string, to: string) => {
    const a = order.findIndex((p) => p.path === from);
    const b = order.findIndex((p) => p.path === to);
    if (a < 0 || b < 0 || a === b) return;
    setOrder(reorder(order, a, b));
    setDirty(true);
  };
  const step = (i: number, dir: number) => shown[i + dir] && move(shown[i].path, shown[i + dir].path);
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await call({ op: "projects.order", paths: order.map((p) => p.path) });
      onSaved("Proje sırası kaydedildi (İngilizce ve Almanca sürümler de aynı sırada).");
    } catch (e) {
      setError(errText(e, "Kaydedilemedi."));
      setBusy(false);
    }
  };
  return (
    <div>
      <PageHead title="Projeler" lead={`${order.length} proje. Sıralamak için kartı sürükleyin ya da okları kullanın; sıra her dilde aynıdır.`}>
        {dirty && (
          <button type="button" disabled={busy} onClick={save} className={btnAccent}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sırayı kaydet
          </button>
        )}
        <button type="button" onClick={() => onEdit("new")} className={btnDark}>
          <Plus className="h-4 w-4" /> Yeni proje
        </button>
      </PageHead>
      {error && <p role="alert" className={`mb-3 ${ERR}`}>{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <label className={`flex h-10 items-center gap-2 border bg-white px-3 ${LINE}`}>
          <Search className="h-4 w-4 text-wawa-charcoal/45" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Proje ara" className="w-40 text-[14px] outline-none" />
        </label>
        {["", ...categories].map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className={`h-10 cursor-pointer border px-3.5 text-[13px] ${cat === c ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 bg-white text-wawa-charcoal hover:border-wawa-charcoal"}`}>
            {c || "Tümü"}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p, i) => (
          <li
            key={p.path}
            draggable
            onDragStart={() => (drag.current = p.path)}
            onDragOver={(e) => {
              e.preventDefault();
              if (drag.current && drag.current !== p.path) move(drag.current, p.path);
            }}
            onDragEnd={() => (drag.current = null)}
            className={`group cursor-grab border bg-white active:cursor-grabbing ${LINE}`}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#F3F2EF]">
              {p.featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={show(p.featuredImage)} alt="" loading="lazy" className={`pointer-events-none h-full w-full object-cover ${p.draft ? "opacity-50 grayscale" : ""}`} />
              )}
              <span className="absolute top-0 left-0 grid h-8 min-w-8 place-items-center bg-wawa-charcoal px-2 text-[12px] tabular-nums text-white">{order.indexOf(p) + 1}</span>
              <span className="absolute top-2 right-2 flex gap-1">
                {p.draft && <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 text-[11px] text-wawa-charcoal"><EyeOff className="h-3 w-3" /> Taslak</span>}
                {p.video && <span className="grid h-5 w-5 place-items-center bg-white text-wawa-charcoal" title="Videolu"><Video className="h-3 w-3" /></span>}
                <GripVertical className="h-5 w-5 text-white drop-shadow" aria-hidden />
              </span>
            </div>
            <div className="p-3">
              <p className="line-clamp-2 min-h-[40px] text-[14px] leading-snug text-wawa-charcoal">{p.title}</p>
              <p className="mt-1 text-[12px] text-wawa-charcoal/50">{p.category || "Kategorisiz"}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex">
                  <button type="button" aria-label="Öne al" disabled={i === 0} onClick={() => step(i, -1)} className="grid h-9 w-9 cursor-pointer place-items-center border border-wawa-charcoal/15 disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Arkaya al" disabled={i === shown.length - 1} onClick={() => step(i, 1)} className="-ml-px grid h-9 w-9 cursor-pointer place-items-center border border-wawa-charcoal/15 disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </span>
                <button type="button" onClick={() => onEdit(p.path)} className="inline-flex h-9 cursor-pointer items-center gap-2 px-3 text-[13px] text-wawa-charcoal hover:bg-[#F3F2EF]">
                  <Pencil className="h-3.5 w-3.5" /> Düzenle
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectForm({ path, categories, canTranslate, onClose, onSaved }: { path: string | null; categories: string[]; canTranslate: boolean; onClose: () => void; onSaved: (msg: string) => void }) {
  const [f, setF] = useState<{ title: string; category: string; brand: string; service: string; description: string; html: string; gallery: Img[]; video: string; draft: boolean } | null>(
    path ? null : { title: "", category: "", brand: "", service: "", description: "", html: "", gallery: [], video: "", draft: false },
  );
  const [langs, setLangs] = useState<LangState>({});
  const [dirty, setDirty] = useState<Partial<Record<Lang, boolean>>>({});
  const [auto, setAuto] = useState(true);
  const [blobs] = useState<Blob[]>(() => []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    get<{ item: ProjectItem; langs: LangState }>(`project=${encodeURIComponent(path)}`)
      .then(({ item, langs }) => {
        setF({
          title: item.title,
          category: item.meta?.["Kategori"] ?? "",
          brand: item.meta?.["Marka"] ?? "",
          service: item.meta?.["Verilen Hizmet"] ?? "",
          description: item.seo.description ?? "",
          html: item.html ?? "",
          gallery: item.gallery ?? [],
          video: item.video ?? "",
          draft: Boolean(item.draft),
        });
        setLangs(langs);
      })
      .catch((e) => setError(errText(e, "Proje açılamadı.")));
  }, [path]);
  const act = async (body: Record<string, unknown>, msg: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await call<{ note?: string }>(body);
      onSaved(r.note ? `${msg} ${r.note}` : msg);
    } catch (e) {
      setError(errText(e, "Kaydedilemedi."));
      setBusy(false);
    }
  };
  const back = { label: "Projelere dön", onClick: onClose };
  if (!f) return <div><PageHead title="Proje" back={back} /><p className="flex items-center gap-3 text-[15px] text-wawa-charcoal/70">{error ?? <><Loader2 className="h-4 w-4 animate-spin" /> Proje açılıyor…</>}</p></div>;
  const tr: Text = { title: f.title, description: f.description, html: f.html };
  const manual = Object.fromEntries(Object.entries(langs).filter(([l, t]) => dirty[l as Lang] && t)) as Record<Lang, Text>;
  return (
    <div>
      <PageHead title={path ? "Projeyi düzenle" : "Yeni proje"} lead={path ? `Adres: ${path}` : "Kaydedince İngilizce ve Almanca sayfaları da açılır."} back={back} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Kategori *">
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={input}>
            <option value="">Seçin…</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Label>
        <Label text="Marka">
          <input value={f.brand} maxLength={120} onChange={(e) => setF({ ...f, brand: e.target.value })} className={input} />
        </Label>
        <Label text="Verilen hizmet">
          <input value={f.service} maxLength={120} placeholder="Örn. Fuar Stand Tasarımı" onChange={(e) => setF({ ...f, service: e.target.value })} className={input} />
        </Label>
        <Label text="Video (isteğe bağlı)" hint="YouTube bağlantısı ya da Medya > Videolar'dan kopyaladığınız MP4 adresi. Proje sayfasında fotoğrafın altında oynar.">
          <input value={f.video} maxLength={400} placeholder="https://www.youtube.com/watch?v=…" onChange={(e) => setF({ ...f, video: e.target.value })} className={input} />
        </Label>
      </div>
      <p className="mt-8 text-[13px] text-wawa-charcoal/65">Fotoğraflar * (her dilde aynı)</p>
      <div className="mt-2">
        <GalleryEdit items={f.gallery} onChange={(gallery) => setF((x) => (x ? { ...x, gallery } : x))} blobs={blobs} title={f.title} />
      </div>
      <div className="mt-10">
        <LangTabs
          tr={tr}
          langs={langs}
          dirty={dirty}
          blobs={blobs}
          auto={auto}
          onAuto={setAuto}
          canTranslate={canTranslate}
          onLang={(l, t) => {
            setLangs((s) => ({ ...s, [l]: { ...s[l], ...t } }));
            setDirty((d) => ({ ...d, [l]: true }));
          }}
        >
          <div className="grid gap-5">
            <Label text="Proje adı *">
              <input value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} />
            </Label>
            <div>
              <p className="text-[13px] text-wawa-charcoal/65">Proje metni</p>
              <div className="mt-1.5">
                <RichText value={f.html} onChange={(html) => setF((x) => (x ? { ...x, html } : x))} blobs={blobs} />
              </div>
            </div>
            <Label text="Google'da görünecek kısa açıklama" hint="Boş bırakılırsa metnin başından alınır.">
              <textarea value={f.description} maxLength={300} rows={2} onChange={(e) => setF({ ...f, description: e.target.value })} className={textarea} />
            </Label>
          </div>
        </LangTabs>
      </div>
      <label className="mt-8 flex cursor-pointer items-center gap-3 text-[14px] text-wawa-charcoal">
        <input type="checkbox" checked={f.draft} onChange={(e) => setF({ ...f, draft: e.target.checked })} className="h-4 w-4 accent-[#1f1f1f]" />
        Taslak (sitede görünmesin)
      </label>
      <SaveBar busy={busy} error={error} onSave={() => act({ op: "project.save", path, data: f, langs: manual, translate: auto, blobs }, path ? "Proje güncellendi." : "Proje eklendi.")}>
        {path && (
          <button
            type="button"
            disabled={busy}
            onClick={() => window.confirm(`"${f.title}" silinsin mi? İngilizce ve Almanca sayfaları da kalkar. Gerekirse Geçmiş'ten geri alınabilir.`) && act({ op: "project.delete", path }, "Proje silindi.")}
            className={`${btn} text-[#B42318] hover:underline`}
          >
            <Trash2 className="h-4 w-4" /> Projeyi sil
          </button>
        )}
      </SaveBar>
    </div>
  );
}

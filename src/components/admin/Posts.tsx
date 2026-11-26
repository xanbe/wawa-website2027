"use client";

// Blog: yazı listesi, ekleme/düzenleme (TR; istenirse EN/DE sürümleri), taslak.
import { useEffect, useState } from "react";
import { EyeOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { LINE, LangTabs, Label, PageHead, SaveBar, btn, btnDark, call, errText, get, input, show, textarea, ImageField, RichText, type Blob, type Lang, type LangState, type Text } from "./ui";

export type PostRow = { path: string; title: string; date: string | null; featuredImage: string | null; draft: boolean; langs: Lang[] };
type PostItem = { path: string; title: string; html: string; featuredImage: string | null; seo: { description: string | null }; draft?: boolean };

export function PostList({ rows, onEdit }: { rows: PostRow[]; onEdit: (p: string | "new") => void }) {
  const [q, setQ] = useState("");
  const shown = rows.filter((p) => !q || p.title.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR")));
  return (
    <div>
      <PageHead title="Blog" lead={`${rows.length} yazı, en yeni en üstte.`}>
        <button type="button" onClick={() => onEdit("new")} className={btnDark}>
          <Plus className="h-4 w-4" /> Yeni yazı
        </button>
      </PageHead>
      <label className={`flex h-10 w-full max-w-[320px] items-center gap-2 border bg-white px-3 ${LINE}`}>
        <Search className="h-4 w-4 text-wawa-charcoal/45" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Yazı ara" className="flex-1 text-[14px] outline-none" />
      </label>
      <ul className={`mt-5 border-t ${LINE}`}>
        {shown.map((p) => (
          <li key={p.path} className={`flex items-center gap-4 border-b py-3 ${LINE}`}>
            <span className="h-14 w-20 shrink-0 overflow-hidden bg-[#F3F2EF]">
              {p.featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={show(p.featuredImage)} alt="" loading="lazy" className={`h-full w-full object-cover ${p.draft ? "opacity-50 grayscale" : ""}`} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] text-wawa-charcoal">{p.title}</span>
              <span className="flex flex-wrap items-center gap-2 text-[12px] text-wawa-charcoal/50">
                {p.date ? new Date(p.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : ""}
                {p.draft && <span className="inline-flex items-center gap-1 bg-[#F3F2EF] px-1.5 text-wawa-charcoal"><EyeOff className="h-3 w-3" /> Taslak</span>}
                {p.langs.map((l) => (
                  <span key={l} className="bg-[#F3F2EF] px-1.5 uppercase">{l}</span>
                ))}
              </span>
            </span>
            <button type="button" onClick={() => onEdit(p.path)} className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 px-3 text-[13px] text-wawa-charcoal hover:bg-[#F3F2EF]">
              <Pencil className="h-3.5 w-3.5" /> Düzenle
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PostForm({ path, canTranslate, onClose, onSaved }: { path: string | null; canTranslate: boolean; onClose: () => void; onSaved: (msg: string) => void }) {
  const [f, setF] = useState<{ title: string; description: string; html: string; featuredImage: string; draft: boolean } | null>(path ? null : { title: "", description: "", html: "", featuredImage: "", draft: false });
  const [langs, setLangs] = useState<LangState>({});
  const [dirty, setDirty] = useState<Partial<Record<Lang, boolean>>>({});
  const [auto, setAuto] = useState(true);
  const [createLangs, setCreateLangs] = useState(false);
  const [blobs] = useState<Blob[]>(() => []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    get<{ item: PostItem; langs: LangState }>(`post=${encodeURIComponent(path)}`)
      .then(({ item, langs }) => {
        setF({ title: item.title, description: item.seo.description ?? "", html: item.html, featuredImage: item.featuredImage ?? "", draft: Boolean(item.draft) });
        setLangs(langs);
      })
      .catch((e) => setError(errText(e, "Yazı açılamadı.")));
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
  const back = { label: "Yazılara dön", onClick: onClose };
  if (!f) return <div><PageHead title="Yazı" back={back} /><p className="flex items-center gap-3 text-[15px] text-wawa-charcoal/70">{error ?? <><Loader2 className="h-4 w-4 animate-spin" /> Yazı açılıyor…</>}</p></div>;
  const tr: Text = { title: f.title, description: f.description, html: f.html };
  const manual = Object.fromEntries(Object.entries(langs).filter(([l, t]) => dirty[l as Lang] && t)) as Record<Lang, Text>;
  const hasLangs = Object.values(langs).some(Boolean);
  return (
    <div>
      <PageHead title={path ? "Yazıyı düzenle" : "Yeni blog yazısı"} lead={path ? `Adres: ${path}` : undefined} back={back} />
      <div>
        <p className="text-[13px] text-wawa-charcoal/65">Kapak görseli (her dilde aynı)</p>
        <div className="mt-1.5">
          <ImageField value={f.featuredImage} onChange={(featuredImage) => setF((x) => (x ? { ...x, featuredImage } : x))} blobs={blobs} />
        </div>
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
          createNote="Aşağıdaki kutuyu işaretleyip kaydedince açılır."
          onLang={(l, t) => {
            setLangs((s) => ({ ...s, [l]: { ...s[l], ...t } }));
            setDirty((d) => ({ ...d, [l]: true }));
          }}
        >
          <div className="grid gap-5">
            <Label text="Başlık *">
              <input value={f.title} maxLength={180} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} />
            </Label>
            <div>
              <p className="text-[13px] text-wawa-charcoal/65">Yazı *</p>
              <div className="mt-1.5">
                <RichText value={f.html} onChange={(html) => setF((x) => (x ? { ...x, html } : x))} blobs={blobs} minH={360} />
              </div>
            </div>
            <Label text="Google'da görünecek kısa açıklama" hint="Boş bırakılırsa yazının başından alınır.">
              <textarea value={f.description} maxLength={300} rows={2} onChange={(e) => setF({ ...f, description: e.target.value })} className={textarea} />
            </Label>
          </div>
        </LangTabs>
      </div>
      <div className="mt-8 grid gap-3">
        {!hasLangs && (
          <label className="flex cursor-pointer items-center gap-3 text-[14px] text-wawa-charcoal">
            <input type="checkbox" checked={createLangs} onChange={(e) => setCreateLangs(e.target.checked)} className="h-4 w-4 accent-[#1f1f1f]" />
            İngilizce ve Almanca sürümlerini de aç (otomatik çeviriyle)
          </label>
        )}
        <label className="flex cursor-pointer items-center gap-3 text-[14px] text-wawa-charcoal">
          <input type="checkbox" checked={f.draft} onChange={(e) => setF({ ...f, draft: e.target.checked })} className="h-4 w-4 accent-[#1f1f1f]" />
          Taslak (sitede görünmesin)
        </label>
      </div>
      <SaveBar busy={busy} error={error} label={path ? "Kaydet" : f.draft ? "Taslak olarak kaydet" : "Yayınla"} onSave={() => act({ op: "post.save", path, data: f, langs: manual, translate: auto, createLangs, blobs }, path ? "Yazı güncellendi." : f.draft ? "Taslak kaydedildi." : "Yazı yayınlandı.")}>
        {path && (
          <button type="button" disabled={busy} onClick={() => window.confirm(`"${f.title}" silinsin mi? Dil sürümleri de kalkar. Gerekirse Geçmiş'ten geri alınabilir.`) && act({ op: "post.delete", path }, "Yazı silindi.")} className={`${btn} text-[#B42318] hover:underline`}>
            <Trash2 className="h-4 w-4" /> Yazıyı sil
          </button>
        )}
      </SaveBar>
    </div>
  );
}

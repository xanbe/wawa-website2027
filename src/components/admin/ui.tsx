"use client";

// Panelin ortak parçaları: istek, görsel yükleme, metin düzenleyici, fotoğraf dizilimi, görsel seçici, liste düzenleyici, dil sekmeleri.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Bold, Heading2, ImagePlus, Images, Italic, Languages, Link2, List, Loader2, Plus, Search, Trash2, X } from "lucide-react";

export type Img = { src: string; alt: string };
export type Blob = { path: string; sha: string };
export type Text = { title: string; description: string; html: string };
export type Lang = "en" | "de";
export const LANGS: Lang[] = ["en", "de"];
export const LANG_NAME: Record<"tr" | Lang, string> = { tr: "Türkçe", en: "İngilizce", de: "Almanca" };

export const LINE = "border-wawa-charcoal/15";
export const input = `h-12 w-full border bg-white px-4 text-[15px] text-wawa-charcoal outline-none placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal ${LINE}`;
export const textarea = `${input} h-auto resize-y py-3 leading-relaxed`;
export const btn = "inline-flex h-11 cursor-pointer items-center justify-center gap-2 px-5 text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const btnDark = `${btn} bg-wawa-charcoal text-white hover:bg-black`;
export const btnLine = `${btn} border border-wawa-charcoal/20 bg-white text-wawa-charcoal hover:border-wawa-charcoal`;
export const btnAccent = `${btn} bg-wawa-accent font-medium text-wawa-charcoal hover:bg-wawa-charcoal hover:text-white`;
export const iconBtn = "grid h-9 w-9 cursor-pointer place-items-center border border-wawa-charcoal/15 bg-white text-wawa-charcoal disabled:cursor-default disabled:opacity-30";
export const ERR = "text-[14px] text-[#B42318]";

export async function call<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/admin/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "İşlem başarısız.");
  return json;
}
export async function get<T>(query: string): Promise<T> {
  const res = await fetch(`/api/admin/?${query}`, { cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok || json.error) throw new Error(json.error ?? "Okunamadı.");
  return json;
}
// Panel kendi kaydırma alanında açılır (sayfanın değil); başa dönüş o alanda yapılır
export const toTop = () => document.getElementById("admin-scroll")?.scrollTo({ top: 0 });
export const errText = (e: unknown, fallback = "İşlem başarısız.") => (e instanceof Error ? e.message : fallback);

// Fotoğraf tarayıcıda küçültülür (uzun kenar 2000 px, JPEG; PNG logolar şeffaflık için PNG kalır): yükleme hızlı, site hafif
async function shrink(file: File): Promise<{ data: string; type: string }> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const url = c.toDataURL(type, 0.86);
  return { data: url.slice(url.indexOf(",") + 1), type };
}

// Yeni yüklenen görseller site yeniden derlenene kadar adresinden açılmaz; panelde yerel önizlemesi gösterilir
const previews = new Map<string, string>();
export const show = (src: string) => previews.get(src) ?? src;

export async function upload(file: File, blobs: Blob[]): Promise<string> {
  const img = await shrink(file);
  const r = await call<{ src: string; blob: Blob | null }>({ op: "upload", name: file.name, ...img });
  if (r.blob) blobs.push(r.blob);
  previews.set(r.src, URL.createObjectURL(file));
  return r.src;
}

export function reorder<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function Label({ text, hint, children }: { text: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] text-wawa-charcoal/65">{text}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[12px] text-wawa-charcoal/50">{hint}</span>}
    </label>
  );
}

export function Notice({ text, onClose, tone = "ok" }: { text: string; onClose: () => void; tone?: "ok" | "err" }) {
  return (
    <p className={`mb-6 flex items-start justify-between gap-4 px-4 py-3 text-[14px] ${tone === "ok" ? "bg-wawa-accent text-wawa-charcoal" : "bg-[#FDECEA] text-[#B42318]"}`}>
      <span>{text}</span>
      <button type="button" aria-label="Kapat" onClick={onClose} className="cursor-pointer">
        <X className="h-4 w-4" />
      </button>
    </p>
  );
}

export function PageHead({ title, lead, children, back }: { title: string; lead?: string; children?: ReactNode; back?: { label: string; onClick: () => void } }) {
  return (
    <div className="mb-7">
      {back && (
        <button type="button" onClick={back.onClick} className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[14px] text-wawa-charcoal hover:underline">
          <ArrowLeft className="h-4 w-4" /> {back.label}
        </button>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[26px] leading-tight text-wawa-charcoal">{title}</h1>
          {lead && <p className="mt-1.5 max-w-[70ch] text-[14px] text-wawa-charcoal/60">{lead}</p>}
        </div>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function Section({ title, lead, children, actions }: { title: string; lead?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className={`border-t py-7 ${LINE}`}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-medium text-wawa-charcoal">{title}</h2>
          {lead && <p className="mt-1 max-w-[70ch] text-[13px] text-wawa-charcoal/55">{lead}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------- Metin düzenleyici
export function RichText({ value, onChange, blobs, minH = 260 }: { value: string; onChange: (html: string) => void; blobs: Blob[]; minH?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  // İçerik yalnızca ilk açılışta yerleştirilir; yazarken imleç yerinde kalır (dışarıdan değişince bileşen yeniden kurulur)
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const emit = () => onChange((ref.current?.innerHTML ?? "").replace(/src="blob:[^"]*" data-src="([^"]*)"/g, 'src="$1"'));
  const run = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };
  const tools: [string, ReactNode][] = [
    ["Başlık", <Heading2 key="h" className="h-4 w-4" />],
    ["Paragraf", <span key="p" className="text-[13px] font-medium">P</span>],
    ["Kalın", <Bold key="b" className="h-4 w-4" />],
    ["İtalik", <Italic key="i" className="h-4 w-4" />],
    ["Liste", <List key="l" className="h-4 w-4" />],
    ["Bağlantı", <Link2 key="a" className="h-4 w-4" />],
    ["Görsel", busy ? <Loader2 key="g" className="h-4 w-4 animate-spin" /> : <ImagePlus key="g" className="h-4 w-4" />],
  ];
  const handle = (name: string) => {
    if (name === "Başlık") run("formatBlock", "h2");
    else if (name === "Paragraf") run("formatBlock", "p");
    else if (name === "Kalın") run("bold");
    else if (name === "İtalik") run("italic");
    else if (name === "Liste") run("insertUnorderedList");
    else if (name === "Bağlantı") {
      const url = window.prompt("Bağlantı adresi (https://…)");
      if (url && /^(https?:\/\/|\/)/.test(url)) run("createLink", url);
    } else file.current?.click();
  };
  return (
    <div className={`border bg-white ${LINE}`}>
      <div className={`sticky top-16 z-10 flex flex-wrap gap-1 border-b bg-[#F7F6F3] p-1.5 ${LINE}`}>
        {tools.map(([name, icon]) => (
          <button key={name} type="button" title={name} aria-label={name} onMouseDown={(e) => e.preventDefault()} onClick={() => handle(name)} className="grid h-9 w-9 cursor-pointer place-items-center text-wawa-charcoal hover:bg-white">
            {icon}
          </button>
        ))}
        <input
          ref={file}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setBusy(true);
            try {
              const src = await upload(f, blobs);
              run("insertHTML", `<p><img src="${show(src)}" data-src="${src}" alt=""></p>`);
            } catch (err) {
              window.alert(errText(err, "Görsel yüklenemedi."));
            }
            setBusy(false);
          }}
        />
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={emit} onBlur={emit} style={{ minHeight: minH }} className="wawa-prose px-4 py-4 text-[16px] outline-none [&_img]:max-w-full" />
    </div>
  );
}

// ---------------------------------------------------------------- Medya seçici (kütüphaneden görsel)
type MediaItem = { src: string; size: number; used: number; deletable: boolean };
let mediaCache: MediaItem[] | null = null;
export const dropMediaCache = () => (mediaCache = null);
export async function loadMedia(force = false) {
  if (!mediaCache || force) mediaCache = (await get<{ items: MediaItem[] }>("media=1")).items;
  return mediaCache;
}

export function MediaPicker({ onPick, onClose }: { onPick: (src: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadMedia()
      .then(setItems)
      .catch((e) => setError(errText(e)));
  }, []);
  const shown = (items ?? []).filter((m) => !q || m.src.toLowerCase().includes(q.toLowerCase())).slice(0, 240);
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="flex max-h-[86vh] w-full max-w-[1000px] flex-col bg-white" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center gap-3 border-b p-4 ${LINE}`}>
          <Search className="h-4 w-4 text-wawa-charcoal/50" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Dosya adında ara" className="h-10 flex-1 text-[15px] outline-none" />
          <button type="button" aria-label="Kapat" onClick={onClose} className="cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {error && <p className={ERR}>{error}</p>}
          {!items && !error && <p className="flex items-center gap-2 text-[14px] text-wawa-charcoal/60"><Loader2 className="h-4 w-4 animate-spin" /> Görseller yükleniyor…</p>}
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {shown.map((m) => (
              <li key={m.src}>
                <button type="button" onClick={() => onPick(m.src)} title={m.src} className="block aspect-square w-full cursor-pointer overflow-hidden bg-[#F3F2EF] outline-offset-2 hover:outline hover:outline-2 hover:outline-wawa-charcoal">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={show(m.src)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
          {items && shown.length === 0 && <p className="text-[14px] text-wawa-charcoal/60">Görsel bulunamadı.</p>}
        </div>
      </div>
    </div>
  );
}

// Tek görsel alanı: yükle ya da kütüphaneden seç
export function ImageField({ value, onChange, blobs, ratio = "aspect-[16/10]", contain }: { value: string; onChange: (src: string) => void; blobs: Blob[]; ratio?: string; contain?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <div className={`relative ${ratio} w-full max-w-[280px] overflow-hidden border bg-[#F3F2EF] ${LINE}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={show(value)} alt="" className={`h-full w-full ${contain ? "object-contain p-3" : "object-cover"}`} />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[12px] text-wawa-charcoal/45">Görsel yok</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <label className={`${btnLine} h-9 px-3 text-[13px]`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Yükle
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setBusy(true);
              setError(null);
              try {
                onChange(await upload(f, blobs));
              } catch (err) {
                setError(errText(err, "Görsel yüklenemedi."));
              }
              setBusy(false);
            }}
          />
        </label>
        <button type="button" onClick={() => setPick(true)} className={`${btnLine} h-9 px-3 text-[13px]`}>
          <Images className="h-4 w-4" /> Kütüphaneden
        </button>
      </div>
      {error && <p className={`mt-1 ${ERR}`}>{error}</p>}
      {pick && (
        <MediaPicker
          onClose={() => setPick(false)}
          onPick={(src) => {
            onChange(src);
            setPick(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Fotoğraf dizilimi
export function GalleryEdit({ items, onChange, blobs, title }: { items: Img[]; onChange: (g: Img[]) => void; blobs: Blob[]; title: string }) {
  const drag = useRef<number | null>(null);
  const [busy, setBusy] = useState(0);
  const [pick, setPick] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    let list = items;
    setBusy(files.length);
    for (const f of Array.from(files)) {
      try {
        list = [...list, { src: await upload(f, blobs), alt: title }];
        onChange(list);
      } catch (e) {
        setError(errText(e, "Görsel yüklenemedi."));
      }
      setBusy((n) => n - 1);
    }
  };
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((g, i) => (
          <li
            key={g.src}
            draggable
            onDragStart={() => (drag.current = i)}
            onDragOver={(e) => {
              e.preventDefault();
              if (drag.current !== null && drag.current !== i) {
                onChange(reorder(items, drag.current, i));
                drag.current = i;
              }
            }}
            onDragEnd={() => (drag.current = null)}
            className={`border bg-white ${LINE}`}
          >
            <div className="group relative aspect-[4/3] cursor-grab overflow-hidden bg-[#F3F2EF] active:cursor-grabbing">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={show(g.src)} alt="" loading="lazy" className="pointer-events-none h-full w-full object-cover" />
              {i === 0 && <span className="absolute top-0 left-0 bg-wawa-accent px-2 py-1 text-[11px] font-medium text-wawa-charcoal">Kapak</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1">
                <span className="flex">
                  <button type="button" aria-label="Öne al" disabled={i === 0} onClick={() => onChange(reorder(items, i, i - 1))} className="grid h-8 w-8 cursor-pointer place-items-center text-white disabled:opacity-30">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Arkaya al" disabled={i === items.length - 1} onClick={() => onChange(reorder(items, i, i + 1))} className="grid h-8 w-8 cursor-pointer place-items-center text-white disabled:opacity-30">
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </button>
                </span>
                <button type="button" aria-label="Fotoğrafı kaldır" onClick={() => onChange(items.filter((_, k) => k !== i))} className="grid h-8 w-8 cursor-pointer place-items-center text-white hover:text-[#FF9B8F]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <input
              value={g.alt}
              maxLength={200}
              placeholder="Görsel açıklaması (alt metin)"
              onChange={(e) => onChange(items.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))}
              className="h-9 w-full px-2 text-[12px] text-wawa-charcoal outline-none placeholder:text-wawa-charcoal/40"
            />
          </li>
        ))}
        <li className="grid gap-2">
          <label className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed text-[13px] text-wawa-charcoal hover:border-wawa-charcoal ${LINE}`}>
            {busy > 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {busy > 0 ? `${busy} fotoğraf yükleniyor…` : "Fotoğraf yükle"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
          </label>
          <button type="button" onClick={() => setPick(true)} className={`${btnLine} h-9 text-[13px]`}>
            <Images className="h-4 w-4" /> Kütüphaneden ekle
          </button>
        </li>
      </ul>
      <p className="mt-2 text-[12px] text-wawa-charcoal/55">Sürükleyerek ya da oklarla sıralayın. İlk fotoğraf kapak olur. Alt metin Google ve görme engelliler içindir; görselde ne olduğunu kısaca yazın.</p>
      {error && <p className={`mt-2 ${ERR}`}>{error}</p>}
      {pick && (
        <MediaPicker
          onClose={() => setPick(false)}
          onPick={(src) => {
            if (!items.some((x) => x.src === src)) onChange([...items, { src, alt: title }]);
            setPick(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Liste düzenleyici (ekle, sil, sırala)
export function ListEdit<T>({ items, onChange, make, render, addLabel, max = 50 }: { items: T[]; onChange: (v: T[]) => void; make: () => T; render: (item: T, set: (v: T) => void, i: number) => ReactNode; addLabel: string; max?: number }) {
  return (
    <div>
      <ol className="grid gap-3">
        {items.map((item, i) => (
          <li key={i} className={`flex gap-3 border bg-white p-4 ${LINE}`}>
            <span className="flex flex-col gap-1">
              <span className="grid h-9 w-9 place-items-center bg-[#F3F2EF] text-[13px] tabular-nums text-wawa-charcoal">{i + 1}</span>
              <button type="button" aria-label="Yukarı" disabled={i === 0} onClick={() => onChange(reorder(items, i, i - 1))} className={iconBtn}>
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Aşağı" disabled={i === items.length - 1} onClick={() => onChange(reorder(items, i, i + 1))} className={iconBtn}>
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Sil" onClick={() => onChange(items.filter((_, k) => k !== i))} className={`${iconBtn} hover:text-[#B42318]`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
            <div className="min-w-0 flex-1">{render(item, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}</div>
          </li>
        ))}
      </ol>
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, make()])} className={`${btnLine} mt-3`}>
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Dil sekmeleri (TR / EN / DE)
export type LangState = Partial<Record<Lang, (Text & { path?: string }) | null>>;
export function LangTabs({
  tr,
  langs,
  onLang,
  dirty,
  blobs,
  children,
  auto,
  onAuto,
  canTranslate,
  createNote,
}: {
  tr: Text;
  langs: LangState;
  onLang: (l: Lang, t: Text) => void;
  dirty: Partial<Record<Lang, boolean>>;
  blobs: Blob[];
  children: ReactNode;
  auto: boolean;
  onAuto: (v: boolean) => void;
  canTranslate: boolean;
  createNote?: string;
}) {
  const [tab, setTab] = useState<"tr" | Lang>("tr");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ver, setVer] = useState(0);
  const translate = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await call<Record<Lang, Text>>({ op: "translate", ...tr });
      for (const l of LANGS) onLang(l, r[l]);
      setVer((v) => v + 1);
    } catch (e) {
      setError(errText(e));
    }
    setBusy(false);
  };
  const cur = tab === "tr" ? null : langs[tab];
  return (
    <div>
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${LINE}`}>
        <div className="flex">
          {(["tr", ...LANGS] as const).map((l) => (
            <button key={l} type="button" onClick={() => setTab(l)} className={`-mb-px cursor-pointer border-b-2 px-4 py-3 text-[14px] ${tab === l ? "border-wawa-charcoal text-wawa-charcoal" : "border-transparent text-wawa-charcoal/55 hover:text-wawa-charcoal"}`}>
              {LANG_NAME[l]}
              {l !== "tr" && !langs[l] && <span className="ml-1.5 text-[11px] text-wawa-charcoal/45">(yok)</span>}
              {l !== "tr" && dirty[l] && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-wawa-charcoal align-middle" aria-label="değişti" />}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 pb-2 text-[13px] text-wawa-charcoal/75">
          <input type="checkbox" checked={auto} onChange={(e) => onAuto(e.target.checked)} className="h-4 w-4 accent-[#1f1f1f]" />
          Türkçe değişince diğer dilleri otomatik çevir
        </label>
      </div>
      <div className="pt-6">
        {tab === "tr" ? (
          children
        ) : (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F7F6F3] px-4 py-3 text-[13px] text-wawa-charcoal/75">
              <span>
                {cur ? `${LANG_NAME[tab]} sürüm${cur.path ? `: ${cur.path}` : ""}.` : `${LANG_NAME[tab]} sürüm henüz yok. ${createNote ?? "Kaydedince açılır."}`} Elle değiştirdiğiniz dil, otomatik çeviriyle ezilmez.
              </span>
              <button type="button" disabled={busy || !canTranslate} title={canTranslate ? "" : "GEMINI_API_KEY tanımlı değil"} onClick={translate} className={`${btnLine} h-9 px-3 text-[13px]`}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />} Türkçeden çevir (EN + DE)
              </button>
            </div>
            {error && <p className={ERR}>{error}</p>}
            <Label text="Başlık">
              <input value={cur?.title ?? ""} maxLength={180} onChange={(e) => onLang(tab, { ...(cur ?? tr), title: e.target.value })} className={input} />
            </Label>
            <div>
              <p className="text-[13px] text-wawa-charcoal/65">Metin</p>
              <div className="mt-1.5">
                <RichText key={`${tab}-${ver}`} value={cur?.html ?? ""} onChange={(html) => onLang(tab, { ...(cur ?? tr), html })} blobs={blobs} />
              </div>
            </div>
            <Label text="Google'da görünecek kısa açıklama">
              <textarea value={cur?.description ?? ""} maxLength={300} rows={2} onChange={(e) => onLang(tab, { ...(cur ?? tr), description: e.target.value })} className={textarea} />
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}

export function SaveBar({ busy, onSave, label = "Kaydet", error, children }: { busy: boolean; onSave: () => void; label?: string; error?: string | null; children?: ReactNode }) {
  return (
    <div className={`sticky bottom-0 z-10 -mx-4 mt-8 border-t bg-white/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8 ${LINE}`}>
      {error && <p role="alert" className={`mb-3 ${ERR}`}>{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" disabled={busy} onClick={onSave} className={btnDark}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {label}
        </button>
        {children}
      </div>
    </div>
  );
}

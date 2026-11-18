"use client";

// Yönetim paneli: projeleri sürükleyip sıralama, proje ve blog yazısı ekleme/düzenleme.
// Kaydedilen her değişiklik sitenin içerik dosyalarına yazılır; canlıda site birkaç dakika içinde yeniden derlenir.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Bold, GripVertical, Heading2, ImagePlus, Italic, Link2, List, Loader2, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";

type Img = { src: string; alt: string };
type Project = { path: string; title: string; featuredImage: string | null; meta?: Record<string, string>; gallery: Img[]; html?: string; seo: { description: string | null } };
type PostRow = { path: string; title: string; date: string | null; featuredImage: string | null };
type Post = PostRow & { html: string; seo: { description: string | null } };
type Blob = { path: string; sha: string };
type Data = { mode: string; categories: string[]; projects: Project[]; posts: PostRow[] };

const LINE = "border-wawa-charcoal/15";
const input = `h-12 w-full border px-4 text-[15px] text-wawa-charcoal outline-none placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal ${LINE}`;
const btn = "inline-flex h-11 cursor-pointer items-center justify-center gap-2 px-5 text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const btnDark = `${btn} bg-wawa-charcoal text-white hover:bg-black`;
const btnLine = `${btn} border border-wawa-charcoal/20 text-wawa-charcoal hover:border-wawa-charcoal`;

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/admin/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "İşlem başarısız.");
  return json;
}

// Fotoğraf tarayıcıda küçültülür (uzun kenar 2000 px, JPEG): yükleme hızlı olur, site hafif kalır
async function shrink(file: File): Promise<{ data: string; type: string }> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.86);
  return { data: url.slice(url.indexOf(",") + 1), type: "image/jpeg" };
}

// Yeni yüklenen görseller site yeniden derlenene kadar adresinden açılmaz; panelde yerel önizlemesi gösterilir
const previews = new Map<string, string>();
const show = (src: string) => previews.get(src) ?? src;

async function upload(file: File, blobs: Blob[]): Promise<string> {
  const img = await shrink(file);
  const r = await call<{ src: string; blob: Blob | null }>({ op: "upload", name: file.name, ...img });
  if (r.blob) blobs.push(r.blob);
  previews.set(r.src, URL.createObjectURL(file));
  return r.src;
}

function reorder<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] text-wawa-charcoal/60">{text}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

// ---------------------------------------------------------------- Metin düzenleyici
function RichText({ value, onChange, blobs }: { value: string; onChange: (html: string) => void; blobs: Blob[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  // İçerik yalnızca ilk açılışta yerleştirilir; yazarken imleç yerinde kalır
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
    <div className={`border ${LINE}`}>
      <div className={`sticky top-0 z-10 flex flex-wrap gap-1 border-b bg-[#F7F6F3] p-1.5 ${LINE}`}>
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
              window.alert(err instanceof Error ? err.message : "Görsel yüklenemedi.");
            }
            setBusy(false);
          }}
        />
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={emit} onBlur={emit} className="wawa-prose min-h-[260px] px-4 py-4 text-[16px] outline-none [&_img]:max-w-full" />
    </div>
  );
}

// ---------------------------------------------------------------- Fotoğraf dizilimi
function GalleryEdit({ items, onChange, blobs, title }: { items: Img[]; onChange: (g: Img[]) => void; blobs: Blob[]; title: string }) {
  const drag = useRef<number | null>(null);
  const [busy, setBusy] = useState(0);
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
        setError(e instanceof Error ? e.message : "Görsel yüklenemedi.");
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
            className="group relative aspect-[4/3] cursor-grab overflow-hidden bg-[#F3F2EF] active:cursor-grabbing"
          >
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
          </li>
        ))}
        <li>
          <label className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed text-[13px] text-wawa-charcoal hover:border-wawa-charcoal ${LINE}`}>
            {busy > 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {busy > 0 ? `${busy} fotoğraf yükleniyor…` : "Fotoğraf ekle"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
          </label>
        </li>
      </ul>
      <p className="mt-2 text-[12px] text-wawa-charcoal/55">Sürükleyerek ya da oklarla sıralayın. İlk fotoğraf kapak olur.</p>
      {error && <p className="mt-2 text-[13px] text-[#B42318]">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- Proje düzenleme
function ProjectForm({ project, categories, onClose, onSaved }: { project: Project | null; categories: string[]; onClose: () => void; onSaved: (msg: string) => void }) {
  const [f, setF] = useState({
    title: project?.title ?? "",
    category: project?.meta?.["Kategori"] ?? "",
    brand: project?.meta?.["Marka"] ?? "",
    service: project?.meta?.["Verilen Hizmet"] ?? "",
    description: project?.seo.description ?? "",
    html: project?.html ?? "",
    gallery: project?.gallery ?? [],
  });
  const [blobs] = useState<Blob[]>(() => []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const act = async (body: Record<string, unknown>, msg: string) => {
    setBusy(true);
    setError(null);
    try {
      await call(body);
      onSaved(msg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      setBusy(false);
    }
  };
  return (
    <div>
      <button type="button" onClick={onClose} className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-wawa-charcoal hover:underline">
        <ArrowLeft className="h-4 w-4" /> Projelere dön
      </button>
      <h2 className="mt-5 font-heading text-[24px] text-wawa-charcoal">{project ? "Projeyi düzenle" : "Yeni proje"}</h2>
      {project && <p className="mt-1 text-[13px] text-wawa-charcoal/55">Adres: {project.path}</p>}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label text="Proje adı *">
            <input value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} />
          </Label>
        </div>
        <Label text="Kategori *">
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={`${input} bg-white`}>
            <option value="">Seçin…</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Label>
        <Label text="Marka">
          <input value={f.brand} maxLength={120} onChange={(e) => setF({ ...f, brand: e.target.value })} className={input} />
        </Label>
        <div className="sm:col-span-2">
          <Label text="Verilen hizmet">
            <input value={f.service} maxLength={120} placeholder="Örn. Fuar Stand Tasarımı" onChange={(e) => setF({ ...f, service: e.target.value })} className={input} />
          </Label>
        </div>
      </div>
      <p className="mt-8 text-[13px] text-wawa-charcoal/60">Fotoğraflar *</p>
      <div className="mt-2">
        <GalleryEdit items={f.gallery} onChange={(gallery) => setF((x) => ({ ...x, gallery }))} blobs={blobs} title={f.title} />
      </div>
      <p className="mt-8 text-[13px] text-wawa-charcoal/60">Proje metni</p>
      <div className="mt-2">
        <RichText value={f.html} onChange={(html) => setF((x) => ({ ...x, html }))} blobs={blobs} />
      </div>
      <div className="mt-6">
        <Label text="Google'da görünecek kısa açıklama (boş bırakılırsa metnin başından alınır)">
          <textarea value={f.description} maxLength={300} rows={2} onChange={(e) => setF({ ...f, description: e.target.value })} className={`${input} h-auto resize-none py-3`} />
        </Label>
      </div>
      {error && <p role="alert" className="mt-5 text-[14px] text-[#B42318]">{error}</p>}
      <div className={`mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6 ${LINE}`}>
        <button type="button" disabled={busy} onClick={() => act({ op: "project.save", path: project?.path, data: f, blobs: blobs }, project ? "Proje güncellendi." : "Proje eklendi.")} className={btnDark}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Kaydet
        </button>
        {project && (
          <button
            type="button"
            disabled={busy}
            onClick={() => window.confirm(`"${project.title}" silinsin mi? Sayfası siteden kalkar; bu işlem panelden geri alınamaz.`) && act({ op: "project.delete", path: project.path }, "Proje silindi.")}
            className={`${btn} text-[#B42318] hover:underline`}
          >
            <Trash2 className="h-4 w-4" /> Projeyi sil
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Yazı düzenleme
function PostForm({ path, onClose, onSaved }: { path: string | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const [f, setF] = useState<{ title: string; description: string; html: string; featuredImage: string } | null>(path ? null : { title: "", description: "", html: "", featuredImage: "" });
  const [blobs] = useState<Blob[]>(() => []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    fetch(`/api/admin/?post=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((j: { post?: Post; error?: string }) => (j.post ? setF({ title: j.post.title, description: j.post.seo.description ?? "", html: j.post.html, featuredImage: j.post.featuredImage ?? "" }) : setError(j.error ?? "Yazı açılamadı.")))
      .catch(() => setError("Yazı açılamadı."));
  }, [path]);
  const act = async (body: Record<string, unknown>, msg: string) => {
    setBusy(true);
    setError(null);
    try {
      await call(body);
      onSaved(msg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      setBusy(false);
    }
  };
  return (
    <div>
      <button type="button" onClick={onClose} className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-wawa-charcoal hover:underline">
        <ArrowLeft className="h-4 w-4" /> Yazılara dön
      </button>
      <h2 className="mt-5 font-heading text-[24px] text-wawa-charcoal">{path ? "Yazıyı düzenle" : "Yeni blog yazısı"}</h2>
      {path && <p className="mt-1 text-[13px] text-wawa-charcoal/55">Adres: {path}</p>}
      {!f ? (
        <p className="mt-8 flex items-center gap-3 text-[15px] text-wawa-charcoal/70">{error ?? <><Loader2 className="h-4 w-4 animate-spin" /> Yazı açılıyor…</>}</p>
      ) : (
        <>
          <div className="mt-7 grid gap-5">
            <Label text="Başlık *">
              <input value={f.title} maxLength={180} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} />
            </Label>
            <div>
              <p className="text-[13px] text-wawa-charcoal/60">Kapak görseli</p>
              <div className="mt-1.5 flex items-center gap-4">
                {f.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={show(f.featuredImage)} alt="" className="h-24 w-40 bg-[#F3F2EF] object-cover" />
                )}
                <label className={btnLine}>
                  <ImagePlus className="h-4 w-4" /> {f.featuredImage ? "Değiştir" : "Görsel seç"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setBusy(true);
                      try {
                        const src = await upload(file, blobs);
                        setF((x) => (x ? { ...x, featuredImage: src } : x));
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Görsel yüklenemedi.");
                      }
                      setBusy(false);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <p className="mt-7 text-[13px] text-wawa-charcoal/60">Yazı *</p>
          <div className="mt-2">
            <RichText value={f.html} onChange={(html) => setF((x) => (x ? { ...x, html } : x))} blobs={blobs} />
          </div>
          <div className="mt-6">
            <Label text="Google'da görünecek kısa açıklama (boş bırakılırsa yazının başından alınır)">
              <textarea value={f.description} maxLength={300} rows={2} onChange={(e) => setF({ ...f, description: e.target.value })} className={`${input} h-auto resize-none py-3`} />
            </Label>
          </div>
          {error && <p role="alert" className="mt-5 text-[14px] text-[#B42318]">{error}</p>}
          <div className={`mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6 ${LINE}`}>
            <button type="button" disabled={busy} onClick={() => act({ op: "post.save", path, data: f, blobs: blobs }, path ? "Yazı güncellendi." : "Yazı yayınlandı.")} className={btnDark}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} {path ? "Kaydet" : "Yayınla"}
            </button>
            {path && (
              <button type="button" disabled={busy} onClick={() => window.confirm(`"${f.title}" silinsin mi? Bu işlem panelden geri alınamaz.`) && act({ op: "post.delete", path }, "Yazı silindi.")} className={`${btn} text-[#B42318] hover:underline`}>
                <Trash2 className="h-4 w-4" /> Yazıyı sil
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Proje listesi: sürükle bırak sıralama
function ProjectList({ data, onEdit, onSaved }: { data: Data; onEdit: (p: Project | "new") => void; onSaved: (msg: string) => void }) {
  const [order, setOrder] = useState(data.projects);
  const [cat, setCat] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drag = useRef<string | null>(null);
  const shown = cat ? order.filter((p) => p.meta?.["Kategori"] === cat) : order;
  // Kategori görünümünde yapılan sıralama, o projelerin genel listedeki yerlerine yazılır
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
      onSaved("Proje sırası kaydedildi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      setBusy(false);
    }
  };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-wawa-charcoal/70">{order.length} proje · sıralamak için kartı sürükleyin ya da okları kullanın</p>
        <div className="flex gap-2">
          {dirty && (
            <button type="button" disabled={busy} onClick={save} className={`${btn} bg-wawa-accent font-medium text-wawa-charcoal hover:bg-wawa-charcoal hover:text-white`}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sırayı kaydet
            </button>
          )}
          <button type="button" onClick={() => onEdit("new")} className={btnDark}>
            <Plus className="h-4 w-4" /> Yeni proje
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-[14px] text-[#B42318]">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {["", ...data.categories].map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className={`cursor-pointer border px-3.5 py-2 text-[13px] ${cat === c ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 text-wawa-charcoal hover:border-wawa-charcoal"}`}>
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
                <img src={show(p.featuredImage)} alt="" loading="lazy" className="pointer-events-none h-full w-full object-cover" />
              )}
              <span className="absolute top-0 left-0 grid h-8 min-w-8 place-items-center bg-wawa-charcoal px-2 text-[12px] tabular-nums text-white">{i + 1}</span>
              <GripVertical className="absolute top-2 right-2 h-5 w-5 text-white drop-shadow" aria-hidden />
            </div>
            <div className="p-3">
              <p className="line-clamp-2 min-h-[40px] text-[14px] leading-snug text-wawa-charcoal">{p.title}</p>
              <p className="mt-1 text-[12px] text-wawa-charcoal/50">{p.meta?.["Kategori"] ?? "Kategorisiz"}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex">
                  <button type="button" aria-label="Öne al" disabled={i === 0} onClick={() => step(i, -1)} className="grid h-9 w-9 cursor-pointer place-items-center border border-wawa-charcoal/15 disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Arkaya al" disabled={i === shown.length - 1} onClick={() => step(i, 1)} className="-ml-px grid h-9 w-9 cursor-pointer place-items-center border border-wawa-charcoal/15 disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </span>
                <button type="button" onClick={() => onEdit(p)} className="inline-flex h-9 cursor-pointer items-center gap-2 px-3 text-[13px] text-wawa-charcoal hover:bg-[#F3F2EF]">
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

// ---------------------------------------------------------------- Panel
export function AdminApp() {
  const [state, setState] = useState<"loading" | "off" | "login" | "ready">("loading");
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<"projects" | "posts">("projects");
  const [editProject, setEditProject] = useState<Project | "new" | null>(null);
  const [editPost, setEditPost] = useState<string | "new" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    const j = (await fetch("/api/admin/", { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => ({ error: "Bağlantı kurulamadı." }))) as Partial<Data> & { enabled?: boolean; authed?: boolean; error?: string };
    if (j.error) return setError(j.error), setState((s) => (s === "loading" ? "login" : s));
    if (!j.enabled) return setState("off");
    if (!j.authed) return setState("login");
    setData(j as Data);
    setVersion((v) => v + 1);
    setState("ready");
  }, []);
  useEffect(() => {
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  const saved = async (msg: string) => {
    await refresh();
    setEditProject(null);
    setEditPost(null);
    setNotice(msg);
    window.scrollTo(0, 0);
  };

  let body: ReactNode;
  if (state === "loading") body = <p className="flex items-center gap-3 text-[15px] text-wawa-charcoal/70"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</p>;
  else if (state === "off") body = <p className="max-w-[60ch] text-[15px] leading-relaxed text-wawa-charcoal/75">Panel kapalı. Açmak için sunucuda ADMIN_PASSWORD tanımlanmalı.</p>;
  else if (state === "login")
    body = (
      <form
        className="max-w-[380px]"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            await call({ op: "login", password });
            setPassword("");
            setState("loading");
            refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Giriş yapılamadı.");
          }
        }}
      >
        <Label text="Parola">
          <input type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        </Label>
        {error && <p role="alert" className="mt-3 text-[14px] text-[#B42318]">{error}</p>}
        <button type="submit" className={`${btnDark} mt-5 w-full`}>Giriş yap</button>
      </form>
    );
  else if (data && editProject) body = <ProjectForm key={editProject === "new" ? "new" : editProject.path} project={editProject === "new" ? null : editProject} categories={data.categories} onClose={() => setEditProject(null)} onSaved={saved} />;
  else if (data && editPost) body = <PostForm key={editPost} path={editPost === "new" ? null : editPost} onClose={() => setEditPost(null)} onSaved={saved} />;
  else if (data)
    body = (
      <>
        {notice && (
          <p className="mb-6 flex items-start justify-between gap-4 bg-wawa-accent px-4 py-3 text-[14px] text-wawa-charcoal">
            <span>
              {notice} {data.mode === "github" ? "Sitede görünmesi birkaç dakika sürer." : "(Yerel mod: dosyalara yazıldı.)"}
            </span>
            <button type="button" aria-label="Kapat" onClick={() => setNotice(null)} className="cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </p>
        )}
        <div className={`mb-7 flex gap-1 border-b ${LINE}`}>
          {(
            [
              ["projects", `Projeler (${data.projects.length})`],
              ["posts", `Blog (${data.posts.length})`],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`-mb-px cursor-pointer border-b-2 px-4 py-3 text-[15px] ${tab === k ? "border-wawa-charcoal text-wawa-charcoal" : "border-transparent text-wawa-charcoal/55 hover:text-wawa-charcoal"}`}>
              {label}
            </button>
          ))}
        </div>
        {tab === "projects" ? (
          <ProjectList key={version} data={data} onEdit={setEditProject} onSaved={saved} />
        ) : (
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] text-wawa-charcoal/70">{data.posts.length} yazı · en yeni en üstte</p>
              <button type="button" onClick={() => setEditPost("new")} className={btnDark}>
                <Plus className="h-4 w-4" /> Yeni yazı
              </button>
            </div>
            <ul className={`mt-5 border-t ${LINE}`}>
              {data.posts.map((p) => (
                <li key={p.path} className={`flex items-center gap-4 border-b py-3 ${LINE}`}>
                  <span className="h-14 w-20 shrink-0 overflow-hidden bg-[#F3F2EF]">
                    {p.featuredImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={show(p.featuredImage)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-wawa-charcoal">{p.title}</span>
                    <span className="text-[12px] text-wawa-charcoal/50">{p.date ? new Date(p.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : ""}</span>
                  </span>
                  <button type="button" onClick={() => setEditPost(p.path)} className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 px-3 text-[13px] text-wawa-charcoal hover:bg-[#F3F2EF]">
                    <Pencil className="h-3.5 w-3.5" /> Düzenle
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    );

  return (
    // Panel sitenin üst menüsünü ve alt bilgisini örter: tam ekran, kendi başlığıyla
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-white">
      <header className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-8 ${LINE}`}>
        <p className="font-heading text-[18px] text-wawa-charcoal">WAWA · Yönetim paneli</p>
        <span className="flex items-center gap-2">
          <Link href="/" className="hidden h-10 items-center px-3 text-[14px] text-wawa-charcoal hover:underline sm:inline-flex">
            Siteye git
          </Link>
          {state === "ready" && (
            <button
              type="button"
              onClick={async () => {
                await call({ op: "logout" }).catch(() => null);
                setData(null);
                setState("login");
              }}
              className="inline-flex h-10 cursor-pointer items-center gap-2 px-3 text-[14px] text-wawa-charcoal hover:underline"
            >
              <LogOut className="h-4 w-4" /> Çıkış
            </button>
          )}
        </span>
      </header>
      <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8">{body}</main>
    </div>
  );
}

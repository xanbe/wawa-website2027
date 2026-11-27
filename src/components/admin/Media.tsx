"use client";

// Medya: görsel kütüphanesi (yükle, ara, nerede kullanıldığını gör, kullanılmayanı sil) ve videolar
// (YouTube bağlantıları, kısa MP4 yüklemeleri, fuar standı açılış videosu).
import { useEffect, useState } from "react";
import { upload as blobUpload } from "@vercel/blob/client";
import { Check, Copy, ImagePlus, Loader2, Play, Plus, Search, Trash2, Upload } from "lucide-react";
import { LINE, ListEdit, Notice, PageHead, SaveBar, Section, btnDark, btnLine, call, dropMediaCache, errText, get, input, loadMedia, show, upload, type Blob } from "./ui";

type MediaItem = { src: string; size: number; used: number; deletable: boolean; legacy?: boolean };
type Yt = { id: string; title: string; duration: string };
type VFile = { src: string; title: string; size?: number };
type Videos = { youtube: Yt[]; files: VFile[]; standHero: string };

const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export function MediaPage({ blobEnabled }: { blobEnabled: boolean }) {
  const [tab, setTab] = useState<"images" | "videos">("images");
  return (
    <div>
      <PageHead title="Medya" lead={blobEnabled ? "Sitedeki görseller ve videolar. Görseller GitHub'da, kısa MP4 videolar Vercel Blob'da durur; uzun videolar için YouTube kullanın." : "Sitedeki görseller ve YouTube videoları."} />
      <div className={`mb-6 flex border-b ${LINE}`}>
        {(
          [
            ["images", "Görseller"],
            ["videos", "Videolar"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`-mb-px cursor-pointer border-b-2 px-4 py-3 text-[14px] ${tab === k ? "border-wawa-charcoal text-wawa-charcoal" : "border-transparent text-wawa-charcoal/55 hover:text-wawa-charcoal"}`}>
            {l}
          </button>
        ))}
      </div>
      {tab === "images" ? <Images /> : <VideosEdit blobEnabled={blobEnabled} />}
    </div>
  );
}

function Images() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState("");
  const [unused, setUnused] = useState(false);
  const [limit, setLimit] = useState(120);
  const [busy, setBusy] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "err" } | null>(null);
  const reload = (force = false) =>
    loadMedia(force)
      .then(setItems)
      .catch((e) => setMsg({ text: errText(e), tone: "err" }));
  useEffect(() => {
    reload();
  }, []);
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const blobs: Blob[] = [];
    const added: MediaItem[] = [];
    setBusy(files.length);
    try {
      for (const f of Array.from(files)) {
        added.push({ src: await upload(f, blobs), size: f.size, used: 0, deletable: true });
        setBusy((n) => n - 1);
      }
      await call({ op: "media.commit", blobs });
      dropMediaCache();
      setItems((x) => [...added, ...(x ?? [])]);
      setMsg({ text: `${added.length} görsel yüklendi. Sitede adresinden açılması birkaç dakika sürer.`, tone: "ok" });
    } catch (e) {
      setMsg({ text: errText(e, "Yüklenemedi."), tone: "err" });
    }
    setBusy(0);
  };
  const remove = async (m: MediaItem) => {
    const name = m.src.split("/").pop();
    // Eski (2026 öncesi) yüklemeler eski site metinlerinde ya da başka sitelerden bağlantılı olabilir: iki kez sorulur
    if (!window.confirm(`${name} silinsin mi? Geçmiş'ten geri alınabilir.`)) return;
    if (m.legacy && !window.confirm(`${name} eski siteden kalma bir görsel. İçeriklerde bulunamadı ama eski yazılarda ya da başka sitelerden bağlantıyla kullanılıyor olabilir. Yine de silinsin mi?`)) return;
    try {
      await call({ op: "media.delete", src: m.src });
      dropMediaCache();
      setItems((x) => (x ?? []).filter((y) => y.src !== m.src));
      setMsg({ text: "Görsel silindi.", tone: "ok" });
    } catch (e) {
      setMsg({ text: errText(e), tone: "err" });
    }
  };
  const all = (items ?? []).filter((m) => (!q || m.src.toLowerCase().includes(q.toLowerCase())) && (!unused || (m.used === 0 && m.deletable)));
  const shown = all.slice(0, limit);
  return (
    <div>
      {msg && <Notice text={msg.text} tone={msg.tone} onClose={() => setMsg(null)} />}
      <div className="flex flex-wrap items-center gap-3">
        <label className={btnDark}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} {busy ? `${busy} görsel yükleniyor…` : "Görsel yükle"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
        </label>
        <label className={`flex h-11 items-center gap-2 border bg-white px-3 ${LINE}`}>
          <Search className="h-4 w-4 text-wawa-charcoal/45" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Dosya adında ara" className="w-48 text-[14px] outline-none" />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[14px] text-wawa-charcoal">
          <input type="checkbox" checked={unused} onChange={(e) => setUnused(e.target.checked)} className="h-4 w-4 accent-[#1f1f1f]" /> Yalnız kullanılmayanlar
        </label>
        {items && <span className="text-[13px] text-wawa-charcoal/55">{all.length} görsel</span>}
      </div>
      <p className="mt-3 text-[12px] text-wawa-charcoal/55">
        &quot;Kullanılıyor&quot; sayısı projeler, blog ve anasayfadaki kullanımları gösterir; hizmet sayfalarındaki görseller sayılmaz, o yüzden emin olmadığınız görseli silmeyin.
      </p>
      {!items && !msg && <p className="mt-6 flex items-center gap-2 text-[14px] text-wawa-charcoal/60"><Loader2 className="h-4 w-4 animate-spin" /> Görseller yükleniyor…</p>}
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {shown.map((m) => (
          <li key={m.src} className={`border bg-white ${LINE}`}>
            <div className="aspect-square overflow-hidden bg-[#F3F2EF]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={show(m.src)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="p-2">
              <p className="truncate text-[11px] text-wawa-charcoal/70" title={m.src}>{m.src.split("/").pop()}</p>
              <p className="text-[11px] text-wawa-charcoal/45">{kb(m.size)} · {m.used ? `${m.used} yerde kullanılıyor` : m.legacy ? "kullanılmıyor görünüyor (eski)" : "kullanılmıyor"}</p>
              <div className="mt-1.5 flex gap-1">
                <button
                  type="button"
                  title="Adresi kopyala"
                  onClick={() => {
                    navigator.clipboard.writeText(m.src);
                    setCopied(m.src);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                  className="grid h-8 w-8 cursor-pointer place-items-center border border-wawa-charcoal/15 text-wawa-charcoal"
                >
                  {copied === m.src ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                {m.deletable && m.used === 0 && (
                  <button type="button" title="Sil" onClick={() => remove(m)} className="grid h-8 w-8 cursor-pointer place-items-center border border-wawa-charcoal/15 text-wawa-charcoal hover:text-[#B42318]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {all.length > limit && (
        <button type="button" onClick={() => setLimit((n) => n + 120)} className={`${btnLine} mt-6`}>
          Daha fazla göster ({all.length - limit})
        </button>
      )}
    </div>
  );
}

function VideosEdit({ blobEnabled }: { blobEnabled: boolean }) {
  const [v, setV] = useState<Videos | null>(null);
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [up, setUp] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    get<{ videos: Videos }>("videos=1")
      .then((r) => setV(r.videos))
      .catch((e) => setError(errText(e)));
  }, []);
  if (!v) return <p className="flex items-center gap-2 text-[14px] text-wawa-charcoal/60">{error ?? <><Loader2 className="h-4 w-4 animate-spin" /> Videolar yükleniyor…</>}</p>;
  const addYt = async () => {
    setAdding(true);
    setError(null);
    try {
      const r = await call<{ id: string; title: string }>({ op: "youtube.info", url });
      if (v.youtube.some((y) => y.id === r.id)) throw new Error("Bu video listede zaten var.");
      setV({ ...v, youtube: [{ id: r.id, title: r.title, duration: "" }, ...v.youtube] });
      setUrl("");
    } catch (e) {
      setError(errText(e));
    }
    setAdding(false);
  };
  const addFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > 30 * 1024 * 1024) return setError("Video en fazla 30 MB olabilir. Uzun videoları YouTube'a yükleyip bağlantısını ekleyin.");
    const base = file.name.replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "video";
    const ext = file.type === "video/webm" ? "webm" : "mp4";
    setUp(0);
    try {
      const r = await blobUpload(`videos/${base}.${ext}`, file, { access: "public", handleUploadUrl: "/api/admin/blob/", onUploadProgress: (p) => setUp(Math.round(p.percentage)) });
      setV({ ...v, files: [{ src: r.url, title: file.name.replace(/\.[a-z0-9]+$/i, ""), size: file.size }, ...v.files] });
      setMsg("Video yüklendi. Listeye girmesi için Kaydet'e basın.");
    } catch (e) {
      setError(errText(e, "Video yüklenemedi."));
    }
    setUp(null);
  };
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await call({ op: "videos.save", videos: v });
      setMsg("Videolar kaydedildi. Sitede birkaç dakika içinde güncellenir.");
    } catch (e) {
      setError(errText(e, "Kaydedilemedi."));
    }
    setBusy(false);
  };
  const heroOptions = [...v.youtube.map((y) => ({ value: y.id, label: `YouTube · ${y.title}` })), ...v.files.map((f) => ({ value: f.src, label: `MP4 · ${f.title}` }))];
  return (
    <div>
      {msg && <Notice text={msg} onClose={() => setMsg(null)} />}
      <Section title="Fuar standı açılış videosu" lead={blobEnabled ? "Fuar standı sayfalarının açılışında arkada sessiz dönen video. Kısa, sessiz bir MP4 en temiz sonucu verir (YouTube'da başında logo görünebilir)." : "Fuar standı sayfalarının açılışında arkada sessiz dönen YouTube videosu."}>
        <select value={v.standHero} onChange={(e) => setV({ ...v, standHero: e.target.value })} className={`${input} max-w-[560px]`}>
          {heroOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Section>
      {/* MP4 bölümü yalnızca Vercel Blob bağlıysa (ya da daha önce yüklenmiş video varsa) görünür; videolar YouTube ile eklenir */}
      {(blobEnabled || v.files.length > 0) && (
      <Section title="Yüklenen videolar (MP4)" lead="En fazla 30 MB; arka plan ve proje sayfaları için kısa, sessiz videolar. Adresi kopyalayıp projenin video alanına yapıştırabilirsiniz.">
        {blobEnabled ? (
          <label className={`${btnLine} mb-4`}>
            {up !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {up !== null ? `Yükleniyor… %${up}` : "MP4 yükle"}
            <input type="file" accept="video/mp4,video/webm" className="hidden" disabled={up !== null} onChange={(e) => (addFile(e.target.files?.[0]), (e.target.value = ""))} />
          </label>
        ) : (
          <p className="mb-4 bg-[#F7F6F3] px-4 py-3 text-[13px] text-wawa-charcoal/75">MP4 yüklemek için Vercel&apos;de Storage &gt; Blob açılmalı (BLOB_READ_WRITE_TOKEN). O zamana kadar YouTube bağlantıları kullanılabilir.</p>
        )}
        <ListEdit
          items={v.files}
          onChange={(files) => setV({ ...v, files })}
          make={(): VFile => ({ src: "", title: "" })}
          addLabel=""
          max={0}
          render={(f, set) => (
            <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
              <video src={f.src} muted preload="metadata" className="aspect-video w-full bg-black object-cover" />
              <div className="grid content-start gap-2">
                <input value={f.title} onChange={(e) => set({ ...f, title: e.target.value })} className={input} />
                <p className="truncate text-[12px] text-wawa-charcoal/55" title={f.src}>
                  {f.size ? `${kb(f.size)} · ` : ""}
                  {f.src}
                </p>
                <span className="flex gap-2">
                  <button type="button" onClick={() => navigator.clipboard.writeText(f.src)} className={`${btnLine} h-9 px-3 text-[13px]`}>
                    <Copy className="h-3.5 w-3.5" /> Adresi kopyala
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("Video depodan da silinsin mi? Bu geri alınamaz.")) return;
                      try {
                        await call({ op: "blob.delete", src: f.src });
                        setV({ ...v, files: v.files.filter((x) => x.src !== f.src) });
                        setMsg("Video depodan silindi. Listeden kalkması için Kaydet'e basın.");
                      } catch (e) {
                        setError(errText(e));
                      }
                    }}
                    className={`${btnLine} h-9 px-3 text-[13px] text-[#B42318]`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Depodan sil
                  </button>
                </span>
              </div>
            </div>
          )}
        />
        {!v.files.length && <p className="text-[13px] text-wawa-charcoal/55">Henüz yüklenen video yok.</p>}
      </Section>
      )}
      <Section title="YouTube videoları" lead="Hizmet sayfalarındaki video listesinde bu sırayla görünür. Bağlantıyı yapıştırın, başlık kendiliğinden gelir.">
        <div className="mb-4 flex flex-wrap gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=… ya da youtu.be/…" className={`${input} max-w-[460px]`} />
          <button type="button" disabled={adding || !url.trim()} onClick={addYt} className={btnDark}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Ekle
          </button>
        </div>
        <ListEdit
          items={v.youtube}
          onChange={(youtube) => setV({ ...v, youtube })}
          make={(): Yt => ({ id: "", title: "", duration: "" })}
          addLabel=""
          max={0}
          render={(y, set) => (
            <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_110px]">
              <a href={`https://www.youtube.com/watch?v=${y.id}`} target="_blank" rel="noopener noreferrer" className="relative block aspect-video overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.ytimg.com/vi/${y.id}/mqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-90" />
                <Play className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-white" />
              </a>
              <input value={y.title} onChange={(e) => set({ ...y, title: e.target.value })} className={input} />
              <input value={y.duration} placeholder="Süre 0:45" maxLength={8} onChange={(e) => set({ ...y, duration: e.target.value })} className={input} />
            </div>
          )}
        />
      </Section>
      <SaveBar busy={busy} error={error} onSave={save} />
    </div>
  );
}

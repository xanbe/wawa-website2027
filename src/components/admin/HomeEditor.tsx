"use client";

// Anasayfa (Türkçe): açılış slaytları, seçilmiş projeler, marka logoları, basın, Google yorumları, SSS ve süreç adımları.
// Kayıt src/content/home.json dosyasına yazılır. Diğer dillerin anasayfası proje sırasını izler.
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toTop, ImageField, Label, ListEdit, Notice, PageHead, SaveBar, Section, call, errText, get, input, textarea, type Blob } from "./ui";

type Slide = { sector: string; project: string; image: string; alt: string; href: string };
type Featured = { path: string; title: string; location: string | null; image: string; category: string; filter: "residential" | "commercial" | "stand" };
type Brand = { name: string; src: string };
type Press = { source: string; date: string; title: string; href: string; logo: { src: string; w: number; h: number; cls: string } };
type Review = { author: string; when: string; text: string };
type Step = { title: string; text: string; points: string[]; image: string; position: string; alt: string };
type Home = { slides: Slide[]; featured: Featured[]; brands: Brand[]; press: Press[]; reviews: { rating: number; count: number; url: string; items: Review[] }; faq: { q: string; a: string }[]; process: Step[] };
type Option = { path: string; title: string; image: string | null; category: string };

const FILTERS = [
  ["residential", "Konut"],
  ["commercial", "Ticari mekân"],
  ["stand", "Fuar standı"],
] as const;
// Kategoriye göre öneri: fuar ve kongre standları "stand", konut/villa "residential", diğerleri "commercial"
const guessFilter = (cat: string): Featured["filter"] => (/stand|fuar|kongre|maxima/i.test(cat) ? "stand" : /konut|villa/i.test(cat) ? "residential" : "commercial");

export function HomeEditor() {
  const [home, setHome] = useState<Home | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [blobs] = useState<Blob[]>(() => []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    get<{ home: Home; projects: Option[] }>("home=1")
      .then((r) => {
        setHome(r.home);
        setOptions(r.projects);
      })
      .catch((e) => setError(errText(e)));
  }, []);
  if (!home) return <div><PageHead title="Anasayfa" /><p className="flex items-center gap-2 text-[14px] text-wawa-charcoal/60">{error ?? <><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</>}</p></div>;
  const set = <K extends keyof Home>(k: K, v: Home[K]) => setHome({ ...home, [k]: v });
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await call({ op: "home.save", home, blobs });
      setMsg("Anasayfa kaydedildi. Sitede birkaç dakika içinde güncellenir.");
      toTop();
    } catch (e) {
      setError(errText(e, "Kaydedilemedi."));
    }
    setBusy(false);
  };
  const projectSelect = (value: string, onPick: (o: Option | null) => void) => (
    <select value={value} onChange={(e) => onPick(options.find((o) => o.path === e.target.value) ?? null)} className={input}>
      <option value="">Proje seçin…</option>
      {options.map((o) => (
        <option key={o.path} value={o.path}>
          {o.title}
        </option>
      ))}
    </select>
  );
  return (
    <div>
      <PageHead title="Anasayfa" lead="Türkçe anasayfanın bölümleri. İngilizce, Almanca, İtalyanca ve Fransızca anasayfalar Projeler'deki sırayı kullanır." />
      {msg && <Notice text={msg} onClose={() => setMsg(null)} />}

      <Section title="Açılış slaytları" lead="Her slayt bir sektörü gösterir; 16:9 ve en az 1920 px genişliğinde görsel en iyi sonucu verir.">
        <ListEdit
          items={home.slides}
          onChange={(v) => set("slides", v)}
          make={() => ({ sector: "", project: "", image: "", alt: "", href: "" })}
          addLabel="Slayt ekle"
          max={12}
          render={(s, put) => (
            <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
              <ImageField value={s.image} onChange={(image) => put({ ...s, image })} blobs={blobs} ratio="aspect-video" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Label text="Sektör (büyük yazı)">
                  <input value={s.sector} maxLength={40} onChange={(e) => put({ ...s, sector: e.target.value })} className={input} />
                </Label>
                <Label text="Bağlı proje">
                  {projectSelect(s.href, (o) => put({ ...s, href: o?.path ?? "", project: o ? s.project || o.title : s.project }))}
                </Label>
                <Label text="Proje adı (slaytta görünen)">
                  <input value={s.project} maxLength={80} onChange={(e) => put({ ...s, project: e.target.value })} className={input} />
                </Label>
                <Label text="Görsel açıklaması (alt metin)">
                  <input value={s.alt} maxLength={200} onChange={(e) => put({ ...s, alt: e.target.value })} className={input} />
                </Label>
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Seçilmiş projeler" lead="Anasayfadaki kayan proje şeridi. Proje seçince görsel ve ad kendiliğinden gelir; isterseniz kısaltabilirsiniz.">
        <ListEdit
          items={home.featured}
          onChange={(v) => set("featured", v)}
          make={(): Featured => ({ path: "", title: "", location: null, image: "", category: "", filter: "commercial" })}
          addLabel="Proje ekle"
          max={24}
          render={(f, put) => (
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <ImageField value={f.image} onChange={(image) => put({ ...f, image })} blobs={blobs} ratio="aspect-[4/3]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label text="Proje">
                    {projectSelect(f.path, (o) => put(o ? { ...f, path: o.path, title: f.title || o.title, image: f.image || o.image || "", category: f.category || o.category, filter: guessFilter(o.category) } : { ...f, path: "" }))}
                  </Label>
                </div>
                <Label text="Kartta görünen ad">
                  <input value={f.title} maxLength={80} onChange={(e) => put({ ...f, title: e.target.value })} className={input} />
                </Label>
                <Label text="Şehir">
                  <input value={f.location ?? ""} maxLength={60} onChange={(e) => put({ ...f, location: e.target.value || null })} className={input} />
                </Label>
                <Label text="Etiket">
                  <input value={f.category} maxLength={60} onChange={(e) => put({ ...f, category: e.target.value })} className={input} />
                </Label>
                <Label text="Süzgeç sekmesi">
                  <select value={f.filter} onChange={(e) => put({ ...f, filter: e.target.value as Featured["filter"] })} className={input}>
                    {FILTERS.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Label>
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Marka logoları" lead="Anasayfa ve hizmet sayfalarındaki logo şeridi. Şeffaf PNG ya da açık zeminli logo kullanın.">
        <ListEdit
          items={home.brands}
          onChange={(v) => set("brands", v)}
          make={() => ({ name: "", src: "" })}
          addLabel="Logo ekle"
          max={80}
          render={(b, put) => (
            <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
              <ImageField value={b.src} onChange={(src) => put({ ...b, src })} blobs={blobs} ratio="aspect-[300/113]" contain />
              <Label text="Marka adı">
                <input value={b.name} maxLength={60} onChange={(e) => put({ ...b, name: e.target.value })} className={input} />
              </Label>
            </div>
          )}
        />
      </Section>

      <Section title="Basında biz" lead="Haber sitelerinde çıkan yazılar.">
        <ListEdit
          items={home.press}
          onChange={(v) => set("press", v)}
          make={() => ({ source: "", date: "", title: "", href: "", logo: { src: "", w: 480, h: 160, cls: "max-h-8" } })}
          addLabel="Haber ekle"
          max={20}
          render={(p, put) => (
            <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
              <div>
                <p className="mb-1.5 text-[13px] text-wawa-charcoal/65">Logo (beyaz, koyu zemin için)</p>
                <div className="bg-wawa-charcoal p-2">
                  <ImageField value={p.logo.src} onChange={(src) => put({ ...p, logo: { ...p.logo, src } })} blobs={blobs} ratio="aspect-[3/1]" contain />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Label text="Yayın">
                  <input value={p.source} maxLength={60} onChange={(e) => put({ ...p, source: e.target.value })} className={input} />
                </Label>
                <Label text="Tarih">
                  <input value={p.date} maxLength={40} placeholder="8 Kasım 2024" onChange={(e) => put({ ...p, date: e.target.value })} className={input} />
                </Label>
                <div className="sm:col-span-2">
                  <Label text="Haber başlığı">
                    <input value={p.title} maxLength={200} onChange={(e) => put({ ...p, title: e.target.value })} className={input} />
                  </Label>
                </div>
                <div className="sm:col-span-2">
                  <Label text="Haber bağlantısı">
                    <input value={p.href} maxLength={400} placeholder="https://" onChange={(e) => put({ ...p, href: e.target.value })} className={input} />
                  </Label>
                </div>
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Google yorumları" lead="Puan, yorum sayısı ve gösterilecek yorumlar (anasayfada ilk 3 yorum görünür). Google'daki hâliyle yazın.">
        <div className="mb-5 grid gap-3 sm:grid-cols-[120px_120px_minmax(0,1fr)]">
          <Label text="Puan">
            <input type="number" step="0.1" min={1} max={5} value={home.reviews.rating} onChange={(e) => set("reviews", { ...home.reviews, rating: Number(e.target.value) })} className={input} />
          </Label>
          <Label text="Yorum sayısı">
            <input type="number" min={0} value={home.reviews.count} onChange={(e) => set("reviews", { ...home.reviews, count: Number(e.target.value) })} className={input} />
          </Label>
          <Label text="Tüm yorumlar bağlantısı">
            <input value={home.reviews.url} onChange={(e) => set("reviews", { ...home.reviews, url: e.target.value })} className={input} />
          </Label>
        </div>
        <ListEdit
          items={home.reviews.items}
          onChange={(items) => set("reviews", { ...home.reviews, items })}
          make={() => ({ author: "", when: "", text: "" })}
          addLabel="Yorum ekle"
          max={30}
          render={(r, put) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Label text="Yazan">
                <input value={r.author} maxLength={80} onChange={(e) => put({ ...r, author: e.target.value })} className={input} />
              </Label>
              <Label text="Ne zaman">
                <input value={r.when} maxLength={40} placeholder="8 ay önce" onChange={(e) => put({ ...r, when: e.target.value })} className={input} />
              </Label>
              <div className="sm:col-span-2">
                <Label text="Yorum">
                  <textarea value={r.text} maxLength={1500} rows={3} onChange={(e) => put({ ...r, text: e.target.value })} className={textarea} />
                </Label>
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Sık sorulan sorular" lead="Anasayfadaki sorular; Google'a da soru-cevap olarak bildirilir.">
        <ListEdit
          items={home.faq}
          onChange={(v) => set("faq", v)}
          make={() => ({ q: "", a: "" })}
          addLabel="Soru ekle"
          max={20}
          render={(f, put) => (
            <div className="grid gap-3">
              <input value={f.q} maxLength={200} placeholder="Soru" onChange={(e) => put({ ...f, q: e.target.value })} className={input} />
              <textarea value={f.a} maxLength={1500} rows={3} placeholder="Cevap" onChange={(e) => put({ ...f, a: e.target.value })} className={textarea} />
            </div>
          )}
        />
      </Section>

      <Section title="Süreç adımları" lead="&quot;Tasarımdan teslime&quot; bölümündeki adımlar.">
        <ListEdit
          items={home.process}
          onChange={(v) => set("process", v)}
          make={() => ({ title: "", text: "", points: [], image: "", position: "50% 50%", alt: "" })}
          addLabel="Adım ekle"
          max={6}
          render={(s, put) => (
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <ImageField value={s.image} onChange={(image) => put({ ...s, image })} blobs={blobs} ratio="aspect-[4/3]" />
              <div className="grid gap-3">
                <input value={s.title} maxLength={80} placeholder="Başlık" onChange={(e) => put({ ...s, title: e.target.value })} className={input} />
                <textarea value={s.text} maxLength={600} rows={3} placeholder="Açıklama" onChange={(e) => put({ ...s, text: e.target.value })} className={textarea} />
                <Label text="Maddeler (her satıra bir madde)">
                  <textarea value={s.points.join("\n")} rows={3} onChange={(e) => put({ ...s, points: e.target.value.split("\n").slice(0, 6) })} className={textarea} />
                </Label>
                <input value={s.alt} maxLength={200} placeholder="Görsel açıklaması (alt metin)" onChange={(e) => put({ ...s, alt: e.target.value })} className={input} />
              </div>
            </div>
          )}
        />
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} label="Anasayfayı kaydet" />
    </div>
  );
}

// Yönetim paneli Faz 2: hizmet açılış sayfaları, sektör/stand/inşaat/mobilya sayfaları, fiyatlar, süreç adımları ve fuar takvimi.
// Her içerik kendi JSON dosyasındadır; panel dosyayı okur, gelen veriyi şemaya göre temizler ve kaydeder.
// Metinler dillere göre ayrı kayıtlardır (TR, EN, DE); "Türkçeden çevir" yapılandırılmış içeriği aynı yapıda çevirir.
import { getLegacyPage, getService, categories } from "@/lib/content";
import { PANEL_PREFIX, UPLOAD_RE, readText, transact, type Change } from "./store";
import { checkBlobToken } from "./auth";
import { TRANSLATE_CONFIGURED } from "./translate";

export const LANDINGS_FILE = "src/content/landings.json";
export const EXTRA_FILE = "src/content/extra-pages.json";
export const STAND_FILE = "src/content/stand-prices.json";
export const INTERIOR_FILE = "src/content/interior-prices.json";
export const PROCESS_FILE = "src/content/process.json";
export const FAIRS_FILE = "src/content/fairs.json";
export const CONTENT_FILES = [LANDINGS_FILE, EXTRA_FILE, STAND_FILE, INTERIOR_FILE, PROCESS_FILE, FAIRS_FILE];

type Obj = Record<string, unknown>;
type Lang3 = "tr" | "en" | "de";
const LANGS3: Lang3[] = ["tr", "en", "de"];

export class OpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
const fail = (m: string, status = 400): never => {
  throw new OpError(status, m);
};

// ---------------------------------------------------------------- temizlik yardımcıları
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "");
const arr = (v: unknown) => (Array.isArray(v) ? (v as Obj[]) : []);
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const IMG = /^\/(wp-content\/uploads|images|logos)\/[\w\-./%]+\.(jpe?g|png|webp|svg)$/i;
const img = (v: unknown) => {
  const s = str(v, 300);
  return IMG.test(s) ? s : "";
};
// Bağlantı: site içi yol ("//" ile başlayan başka siteye giden adres değil) ya da https adresi
export const href = (v: unknown) => {
  const s = str(v, 300);
  return /^\/(?!\/)[\w\-./%#?=&]*$/.test(s) || /^https:\/\/[\w.-]+(\/[^\s"'<>]*)?$/.test(s) ? s : "";
};
// Video: YouTube kimliği ya da bu sitenin Vercel Blob deposundaki MP4/WebM
// Depo adresi BLOB_READ_WRITE_TOKEN'dan çıkarılır (vercel_blob_rw_<depo>_...); başka bir depoya bağlantı kabul edilmez
export function blobHost() {
  const id = (process.env.BLOB_READ_WRITE_TOKEN ?? "").match(/^vercel_blob_rw_([a-z0-9]+)_/i)?.[1];
  return id ? `${id.toLowerCase()}.public.blob.vercel-storage.com` : "";
}
export function videoUrl(s: string) {
  if (!/^https:\/\/[\w.-]+\.public\.blob\.vercel-storage\.com\/videos\/[\w\-./%]+\.(mp4|webm)$/i.test(s)) return "";
  const host = blobHost();
  return !host || new URL(s).hostname === host ? s : "";
}
// SSS cevapları düz metindir (etiket kabul edilmez)
const answer = (v: unknown) => str(v, 1500).replace(/<[^>]*>?/g, "").replace(/[<>]/g, "");
const strs = (v: unknown, max: number, n: number) => (Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, n) : []);
const tt = (v: unknown) => arr(v).map((x) => ({ title: str(x.title, 160), text: str(x.text, 1200) })).filter((x) => x.title).slice(0, 24);
const catPaths = new Set(categories.filter((c) => c.kind === "portfolio-category" && c.lang === "tr").map((c) => c.path));
const optional = <T,>(v: T[], key: string) => (v.length ? { [key]: v } : {});

// Biçim: satır sonu ve dosya sonundaki boş satır korunur
type Format = { crlf: boolean; nl: boolean };
const parse = <T,>(text: string) => ({ value: JSON.parse(text) as T, f: { crlf: text.includes("\r\n"), nl: /\n$/.test(text) } as Format });
const dump = (value: unknown, f: Format) => {
  const out = JSON.stringify(value, null, 1) + (f.nl ? "\n" : "");
  return f.crlf ? out.replace(/\n/g, "\r\n") : out;
};

// Temizlenen kayıt, dosyadaki alan sırasını korur (kayıt farkı yalnızca gerçekten değişen satırlar olsun)
const keepOrder = (clean: Obj, old: Obj): Obj => {
  const out: Obj = {};
  for (const k of Object.keys(old)) if (k in clean) out[k] = clean[k];
  for (const k of Object.keys(clean)) if (!(k in out)) out[k] = clean[k];
  return out;
};

// ---------------------------------------------------------------- şemalar
function landing(v: Obj) {
  const intro = obj(v.intro);
  const out: Obj = {
    kicker: str(v.kicker, 80),
    title: str(v.title, 200),
    lead: str(v.lead, 600),
    heroImages: (Array.isArray(v.heroImages) ? v.heroImages : []).map(img).filter(Boolean).slice(0, 8),
    highlights: tt(v.highlights),
    intro: { title: str(intro.title, 200), text: str(intro.text, 2000) },
    process: tt(v.process),
  };
  if (!out.title || !(out.heroImages as string[]).length) fail("Başlık ve en az bir açılış görseli gerekli.");
  if (str(v.h1, 120)) out.h1 = str(v.h1, 120);
  const video = str(v.heroVideo, 400);
  if (/^[\w-]{11}$/.test(video) || videoUrl(video)) out.heroVideo = video;
  const offerings = arr(v.offerings)
    .map((o) => ({ title: str(o.title, 120), text: str(o.text, 600), image: img(o.image), ...(href(o.href) ? { href: href(o.href) } : {}) }))
    .filter((o) => o.title && o.image)
    .slice(0, 12);
  Object.assign(out, optional(offerings, "offerings"));
  if (str(v.offeringsTitle, 120)) out.offeringsTitle = str(v.offeringsTitle, 120);
  if (str(v.processTitle, 120)) out.processTitle = str(v.processTitle, 120);
  const blocks = arr(v.blocks)
    .map((b) => ({ title: str(b.title, 160), ...(str(b.lead, 600) ? { lead: str(b.lead, 600) } : {}), items: tt(b.items) }))
    .filter((b) => b.title && b.items.length)
    .slice(0, 8);
  Object.assign(out, optional(blocks, "blocks"));
  Object.assign(out, optional(strs(v.projectCategories, 200, 10).filter((c) => catPaths.has(c)), "projectCategories"));
  Object.assign(out, optional(strs(v.projectPaths, 200, 24).filter((p) => /^\/portfolio\/[\w-]+\/$/.test(p)), "projectPaths"));
  const scope = arr(v.scope)
    .map((s) => ({ title: str(s.title, 120), text: str(s.text, 600), features: strs(s.features, 120, 8) }))
    .filter((s) => s.title)
    .slice(0, 6);
  Object.assign(out, optional(scope, "scope"));
  if (v.showReach === true) out.showReach = true;
  if (v.showBrands === true) out.showBrands = true;
  return out;
}

function extraPage(v: Obj, existing: Obj) {
  const seo = obj(v.seo);
  const out: Obj = {
    key: existing.key,
    ...(existing.group ? { group: existing.group } : {}),
    path: existing.path,
    lang: existing.lang,
    title: str(v.title, 120),
    lead: str(v.lead, 600),
    image: img(v.image),
    sections: arr(v.sections).map((s) => ({ h: str(s.h, 160), p: str(s.p, 2000) })).filter((s) => s.h && s.p).slice(0, 12),
    points: strs(v.points, 120, 8),
  };
  if (!out.title || !out.image || !(out.sections as unknown[]).length) fail("Başlık, görsel ve en az bir bölüm gerekli.");
  Object.assign(out, optional(strs(v.projectCategories, 200, 10).filter((c) => catPaths.has(c)), "projectCategories"));
  Object.assign(out, optional(strs(v.projectPaths, 200, 24).filter((p) => /^\/portfolio\/[\w-]+\/$/.test(p)), "projectPaths"));
  const faq = qa(v.faq);
  Object.assign(out, optional(faq, "faq"));
  out.seo = { title: str(seo.title, 120) || `${out.title} | WAWA Interiors`, description: str(seo.description, 300) };
  return out;
}

function qa(v: unknown) {
  return arr(v)
    .map((f) => ({ q: answer(f.q).slice(0, 240), a: answer(f.a) }))
    .filter((f) => f.q && f.a)
    .slice(0, 16);
}
function prices(v: Obj, old: Obj) {
  const stand = obj(v.stand);
  const ranges = obj(stand.ranges);
  const num = (x: unknown) => Math.max(0, Math.min(100000, Math.round(Number(x) || 0)));
  const out = JSON.parse(JSON.stringify(old)) as Obj;
  const os = obj(out.stand);
  os.year = Math.max(2024, Math.min(2100, Math.round(Number(stand.year) || Number(os.year))));
  for (const sys of ["ahsap", "maxima"]) {
    const r = obj(ranges[sys]);
    const pair = (k: string) => {
      const p = Array.isArray(r[k]) ? (r[k] as unknown[]) : [];
      const a = num(p[0]);
      const b = num(p[1]);
      if (!a || !b || a > b) fail("Fiyat aralıklarında en düşük değer en yüksekten küçük ve sıfırdan büyük olmalı.");
      return [a, b];
    };
    obj(os.ranges)[sys] = { tr: pair("tr"), abroad: pair("abroad") };
  }
  const labels = obj(stand.systemLabels);
  const factors = obj(stand.factors);
  for (const l of LANGS3) {
    const lab = obj(labels[l]);
    obj(os.systemLabels)[l] = { ahsap: str(lab.ahsap, 60) || "Ahşap", maxima: str(lab.maxima, 60) || "Maxima" };
    obj(os.factors)[l] = tt(factors[l]);
  }
  // İç mimarlık rehberi: dil başına aynı yapı
  const interior = obj(v.interior);
  const oi = obj(out.interior);
  oi.year = Math.max(2024, Math.min(2100, Math.round(Number(interior.year) || Number(oi.year))));
  const content = obj(interior.content);
  for (const l of LANGS3) {
    const c = obj(content[l]);
    const h = obj(c.h);
    const end = obj(c.end);
    obj(oi.content)[l] = {
      metaTitle: str(c.metaTitle, 160),
      metaDesc: str(c.metaDesc, 320),
      title: str(c.title, 120),
      lead: str(c.lead, 600),
      h: Object.fromEntries(["parts", "modes", "factors", "spaces", "prepare", "faq"].map((k) => [k, str(h[k], 120)])),
      parts: arr(c.parts).map((p) => ({ title: str(p.title, 120), text: str(p.text, 800), cta: { label: str(obj(p.cta).label, 80), href: href(obj(p.cta).href) } })).slice(0, 4),
      modes: arr(c.modes).map((m) => ({ title: str(m.title, 120), text: str(m.text, 600), items: strs(m.items, 120, 8) })).slice(0, 6),
      factors: tt(c.factors),
      spaces: arr(c.spaces).map((s) => ({ title: str(s.title, 80), href: href(s.href), items: strs(s.items, 120, 6) })).filter((s) => s.title).slice(0, 12),
      prepare: strs(c.prepare, 200, 10),
      faq: qa(c.faq),
      end: { title: str(end.title, 160), text: str(end.text, 600), cta: str(end.cta, 60), href: href(end.href) },
    };
  }
  return out;
}

function processSteps(v: Obj) {
  const out: Obj = {};
  for (const k of ["standProcess", "interiorProcess"]) out[k] = Object.fromEntries(LANGS3.map((l) => [l, tt(obj(v[k])[l])]));
  out.interiorScope = Object.fromEntries(LANGS3.map((l) => [l, arr(obj(v.interiorScope)[l]).map((s) => ({ title: str(s.title, 120), text: str(s.text, 600), features: strs(s.features, 120, 8) })).slice(0, 6)]));
  return out;
}

const REGIONS = ["tr", "eu", "uk", "me", "am"];
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const TRC: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
const slugify = (s: string) =>
  s
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TRC[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "fuar";
function fair(v: Obj) {
  const start = str(v.start, 10);
  const end = str(v.end, 10);
  if (!ISO.test(start) || !ISO.test(end) || end < start) fail("Başlangıç ve bitiş tarihini kontrol edin.");
  const region = str(v.region, 4);
  if (!REGIONS.includes(region)) fail("Bölge seçin.");
  const name = str(v.name, 140);
  const city = str(v.city, 60);
  if (!name || !city || !str(v.country, 60) || !str(v.sector, 120)) fail("Ad, şehir, ülke ve sektör gerekli.");
  const url = str(v.url, 300);
  return {
    name,
    city,
    country: str(v.country, 60),
    ...(str(v.venue, 140) ? { venue: str(v.venue, 140) } : {}),
    region,
    start,
    end,
    sector: str(v.sector, 120),
    ...(/^https?:\/\//.test(url) ? { url } : {}),
    verified: v.verified !== false,
    match: (strs(v.match, 80, 3).length ? strs(v.match, 80, 3) : [name]).map((m) => m.toLocaleLowerCase("tr-TR")),
  };
}

// ---------------------------------------------------------------- dil grupları
// Hizmet açılışları: Türkçe sayfanın dil karşılıkları (hizmet ve eski sayfa kayıtlarından)
const LANDING_ALT: Record<string, Partial<Record<Lang3, string>>> = { "/maxima-stand/": { en: "/en/service/maxima-stand/", de: "/de/service/maxima-stand/" } };
const altsOf = (trPath: string): Partial<Record<Lang3, string>> => ({ ...(getService(trPath)?.alternates ?? getLegacyPage(trPath)?.alternates ?? {}), ...LANDING_ALT[trPath], tr: trPath });

type Extra = Obj & { key: string; path: string; lang: Lang3; group?: string; title: string };
const extraGroup = (p: Extra) => (p.key === "construction" || p.key === "furniture" ? p.key : (p.group ?? p.path));

// ---------------------------------------------------------------- okuma
export async function contentGet(q: (k: string) => string | null) {
  if (q("pages")) {
    const [lt, et] = await Promise.all([readText(LANDINGS_FILE), readText(EXTRA_FILE)]);
    const landings = parse<Record<string, Obj>>(lt).value;
    const extras = parse<Extra[]>(et).value;
    const services = Object.keys(landings)
      .filter((k) => !/^\/(en|de)\//.test(k))
      .map((tr) => {
        const alts = altsOf(tr);
        return { id: tr, kind: "landing", title: str(landings[tr].kicker, 80) || str(landings[tr].title, 80), langs: Object.fromEntries(LANGS3.map((l) => [l, alts[l] && landings[alts[l]!] ? alts[l] : null])) };
      });
    const groups = new Map<string, { id: string; kind: string; title: string; langs: Partial<Record<Lang3, string | null>> }>();
    for (const p of extras) {
      const id = extraGroup(p);
      const g = groups.get(id) ?? { id, kind: p.key, title: "", langs: { tr: null, en: null, de: null } };
      g.langs[p.lang] = p.path;
      if (p.lang === "tr") g.title = p.title;
      groups.set(id, g);
    }
    return { services, pages: [...groups.values()], translate: TRANSLATE_CONFIGURED, categories: categories.filter((c) => c.kind === "portfolio-category" && c.lang === "tr").map((c) => ({ path: c.path, name: c.name })) };
  }
  const lp = q("landing");
  if (lp) {
    const landings = parse<Record<string, Obj>>(await readText(LANDINGS_FILE)).value;
    if (!Object.hasOwn(landings, lp)) fail("Sayfa bulunamadı.", 404);
    return { item: landings[lp], path: lp };
  }
  const ep = q("extra");
  if (ep) {
    const item = parse<Extra[]>(await readText(EXTRA_FILE)).value.find((p) => p.path === ep);
    if (!item) fail("Sayfa bulunamadı.", 404);
    return { item, path: ep };
  }
  // Fuar standı ve iç mimarlık fiyatları ayrı dosyalardadır (fuar standı verisi tarayıcıya da gider, rehber metni gitmez)
  if (q("prices")) return { prices: { stand: JSON.parse(await readText(STAND_FILE)), interior: JSON.parse(await readText(INTERIOR_FILE)) }, process: JSON.parse(await readText(PROCESS_FILE)) };
  if (q("fairs")) return { fairs: JSON.parse(await readText(FAIRS_FILE)) };
  return null;
}

// ---------------------------------------------------------------- kayıt
export async function contentPost(op: string, body: Obj): Promise<Obj | null> {
  if (op === "landing.save") {
    const path = str(body.path, 300);
    await transact([LANDINGS_FILE], (t) => {
      const { value, f } = parse<Record<string, Obj>>(t[LANDINGS_FILE]);
      if (!/^\/(en\/|de\/)?[\w\-/]+\/$/.test(path) || !Object.hasOwn(value, path)) fail("Sayfa bulunamadı.", 404);
      value[path] = keepOrder(landing(obj(body.item)), value[path]);
      return { changes: [{ path: LANDINGS_FILE, text: dump(value, f) }, ...blobChanges(body.blobs)], message: `${PANEL_PREFIX} hizmet sayfası güncellendi (${path})`, result: null };
    });
    return { ok: true };
  }
  if (op === "extra.save") {
    const path = str(body.path, 300);
    await transact([EXTRA_FILE], (t) => {
      const { value, f } = parse<Extra[]>(t[EXTRA_FILE]);
      const i = value.findIndex((p) => p.path === path);
      if (i < 0) fail("Sayfa bulunamadı.", 404);
      value[i] = keepOrder(extraPage(obj(body.item), value[i]), value[i]) as Extra;
      return { changes: [{ path: EXTRA_FILE, text: dump(value, f) }, ...blobChanges(body.blobs)], message: `${PANEL_PREFIX} sayfa güncellendi (${value[i].title})`, result: null };
    });
    return { ok: true };
  }
  if (op === "prices.save") {
    await transact([STAND_FILE, INTERIOR_FILE, PROCESS_FILE], (t) => {
      const st = parse<Obj>(t[STAND_FILE]);
      const it = parse<Obj>(t[INTERIOR_FILE]);
      const s = parse<Obj>(t[PROCESS_FILE]);
      const next = prices(obj(body.prices), { stand: st.value, interior: it.value });
      const changes = [
        { path: STAND_FILE, text: dump(next.stand, st.f) },
        { path: INTERIOR_FILE, text: dump(next.interior, it.f) },
      ];
      if (body.process) changes.push({ path: PROCESS_FILE, text: dump(processSteps(obj(body.process)), s.f) });
      return { changes, message: `${PANEL_PREFIX} fiyatlar ve süreç adımları güncellendi`, result: null };
    });
    return { ok: true };
  }
  if (op === "fair.save" || op === "fair.delete") {
    const slug = str(body.slug, 80);
    const result = await transact([FAIRS_FILE], (t) => {
      const { value, f } = parse<(Obj & { slug: string; name: string; start: string })[]>(t[FAIRS_FILE]);
      let message = "";
      let out = slug;
      const i = slug ? value.findIndex((x) => x.slug === slug) : -1;
      if (op === "fair.delete") {
        if (i < 0) fail("Fuar bulunamadı.", 404);
        message = `${PANEL_PREFIX} fuar silindi (${value[i].name})`;
        value.splice(i, 1);
      } else {
        const data = fair(obj(body.fair));
        if (i >= 0) {
          // Adres (slug) değişmez; fuar sayfasının bağlantıları kırılmasın
          value[i] = { slug: value[i].slug, ...data };
          message = `${PANEL_PREFIX} fuar güncellendi (${data.name})`;
        } else {
          const used = new Set(value.map((x) => x.slug));
          const cands = [slugify(data.name), slugify(`${data.name} ${data.start.slice(0, 4)}`), slugify(`${data.name} ${data.city}`), slugify(`${data.name} ${data.city} ${data.start.slice(0, 7)}`)];
          out = cands.find((c) => !used.has(c)) ?? `${cands[3]}-${value.length}`;
          value.push({ slug: out, ...data });
          message = `${PANEL_PREFIX} yeni fuar (${data.name})`;
        }
        value.sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name));
      }
      return { changes: [{ path: FAIRS_FILE, text: dump(value, f) }], message, result: out };
    });
    return { ok: true, slug: result };
  }
  return null;
}

// Yeni yüklenen görsellerin depo kayıtları: yalnızca bu panelin yükleme ucunun imzaladığı yol + içerik kimliği kabul edilir
export function blobChanges(v: unknown): Change[] {
  return arr(v)
    .slice(0, 200)
    .map((b) => ({ path: str(b.path, 300), sha: str(b.sha, 64), token: str(b.token, 100) }))
    .filter((b) => UPLOAD_RE.test(b.path) && /^[0-9a-f]{40}$/.test(b.sha) && checkBlobToken(b.path, b.sha, b.token))
    .map(({ path, sha }) => ({ path, sha }));
}

// ---------------------------------------------------------------- yapılandırılmış çeviri
// Çevrilmeyecek alanlar: adresler, görseller, kimlikler
const SKIP = new Set(["href", "image", "heroImages", "heroVideo", "projectCategories", "projectPaths", "path", "key", "lang", "group", "src", "slug"]);
// Bir çeviri isteğinde en fazla 400 metin / 80.000 karakter (model maliyeti sınırlı kalsın)
export const TEXT_LIMIT = { count: 400, chars: 80_000 };
export function collectText(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") {
    if (v.trim()) out.push(v.slice(0, 5000));
  } else if (Array.isArray(v)) v.forEach((x) => collectText(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) collectText(x, out);
  return out;
}
export function applyText<T>(v: T, list: string[], at = { i: 0 }): T {
  if (typeof v === "string") return (v.trim() ? (list[at.i++] ?? v) : v) as T;
  if (Array.isArray(v)) return v.map((x) => applyText(x, list, at)) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SKIP.has(k) ? x : applyText(x, list, at)])) as T;
  return v;
}

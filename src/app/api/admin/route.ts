import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminEnabled, blobToken, checkPassword, clearSession, isAdmin, isJson, renewSession, sameOrigin, setSession } from "@/lib/admin/auth";
import { DATA_FILES, HOME_FILE, PANEL_PREFIX, POSTS_FILE, PROJECTS_FILE, VIDEOS_FILE, canDelete, history, listMedia, putBinary, readText, revert, storeMode, transact } from "@/lib/admin/store";
import { clientIp } from "@/lib/phone-otp";
import { allow, hit, peek } from "@/lib/rate-limit";
import { cleanHtml } from "@/lib/sanitize";
import { categories, legacyPages, services } from "@/lib/content";
import { landings } from "@/content/landings";
import { extraPages } from "@/content/extra-pages";
import { sectorPages } from "@/content/sector-pages";
import { standPages } from "@/content/stand-pages";
import { INTERIOR_PRICES } from "@/content/interior-prices";
import { PROTECTED_MEDIA } from "@/lib/admin/protected-media";
import { resolve } from "@/lib/routes";
import { SYNC_LANGS, findAlt, needsTranslation, removeItem, syncItem, textOf, type ItemText, type SyncItem, type SyncKind, type SyncLang } from "@/lib/admin/sync";
import { TRANSLATE_CONFIGURED, translateList, translateProject } from "@/lib/admin/translate";
import { OpError, TEXT_LIMIT, applyText, blobChanges, collectText, contentGet, contentPost, href, videoUrl } from "@/lib/admin/content-ops";

// Yönetim paneli ucu: giriş, içerik okuma, görsel yükleme, proje/yazı/anasayfa/video kaydı, medya, geçmiş ve geri alma.
// Her işlem oturum ister; içerik her zaman depodan taze okunur (derlemedeki kopyadan değil).
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "");
const bool = (v: unknown) => v === true;

// --- dosya biçimi (girinti ve satır sonu korunur ki kayıt farkları küçük kalsın)
// Biçim: satır sonu (CRLF/LF) ve dosya sonundaki boş satır olduğu gibi korunur
type Format = { crlf: boolean; nl: boolean };
const parse = <T,>(text: string) => ({ value: JSON.parse(text) as T, crlf: { crlf: text.includes("\r\n"), nl: /\n$/.test(text) } as Format });
const dump = (value: unknown, f: Format) => {
  const out = JSON.stringify(value, null, 1) + (f.nl ? "\n" : "");
  return f.crlf ? out.replace(/\n/g, "\r\n") : out;
};

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
const slugify = (s: string) =>
  s
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TR_MAP[c])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "icerik";

// Panelden gelen metin izin listeli temizleyiciden geçer (src/lib/sanitize.ts)
const plain = (html: string, max: number) => {
  const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, t.lastIndexOf(" ", max)).trim();
};

const IMG = /^\/(wp-content\/uploads|images|logos)\/[\w\-./%]+\.(jpe?g|png|webp|svg)$/i;
const img = (v: unknown) => {
  const s = str(v, 300);
  return IMG.test(s) ? s : "";
};
type Gallery = { src: string; alt: string }[];
const gallery = (v: unknown, title: string): Gallery =>
  Array.isArray(v)
    ? v
        .map((g) => ({ src: img((g as { src?: unknown })?.src), alt: str((g as { alt?: unknown })?.alt, 200) || title }))
        .filter((g) => g.src)
        .slice(0, 60)
    : [];
// YouTube kimliği ya da Vercel Blob'a yüklenmiş video adresi
const video = (v: unknown) => {
  const s = str(v, 400);
  const yt = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? (/^[\w-]{11}$/.test(s) ? s : "");
  if (yt) return yt;
  return videoUrl(s);
};
// Yeni yüklenen görsellerin depo kayıtları (GitHub'da içerik kimliği; yerelde dosya zaten yazılıdır).
// Yalnızca yükleme ucunun imzaladığı kayıtlar geçer (content-ops.ts → blobChanges)
const blobs = blobChanges;
// İçeriğin sürüm özeti: düzenleyici açıldığından beri başkası değiştirdi mi?
const revOf = (item: unknown) => createHash("sha256").update(JSON.stringify(item)).digest("base64url").slice(0, 22);
const checkBase = (item: SyncItem, base: unknown) => {
  if (typeof base === "string" && base && base !== revOf(item)) throw new Error("409:Bu içerik siz düzenlerken başka bir oturumda değiştirildi. Değişikliklerinizi kopyalayıp sayfayı yenileyin.");
};
// Okunan HTML de temizlenerek döner (düzenleyicide innerHTML ile açılır)
const safeText = <T extends { html?: string | null }>(t: T): T => ({ ...t, html: cleanHtml(t.html ?? "") });
const HOUR = 60 * 60 * 1000;
// Dil sekmelerinden gelen metinler
const langTexts = (v: unknown): Partial<Record<SyncLang, ItemText>> => {
  const out: Partial<Record<SyncLang, ItemText>> = {};
  if (!v || typeof v !== "object") return out;
  for (const l of SYNC_LANGS) {
    const t = (v as Record<string, unknown>)[l] as Record<string, unknown> | undefined;
    if (!t) continue;
    const title = str(t.title, 180);
    const html = cleanHtml(str(t.html, 200_000));
    if (title) out[l] = { title, html, description: str(t.description, 300) || plain(html, 155) || title };
  }
  return out;
};

const projectCats = () => categories.filter((c) => c.kind === "portfolio-category" && c.lang === "tr").map((c) => c.name);
const now = () => new Date().toISOString().replace(/\.\d+Z$/, "+00:00");

// Aynı istek içinde (kayıt çakışıp yeniden denendiğinde) aynı metin ikinci kez çevrilmez
type Translated = Awaited<ReturnType<typeof translateProject>>;
const memoTranslate = () => {
  const cache = new Map<string, Promise<Translated>>();
  return (src: ItemText) => {
    const key = JSON.stringify(src);
    if (!cache.has(key)) cache.set(key, translateProject(src));
    return cache.get(key)!;
  };
};

// Çeviri: elle yazılan dil metinleri önce gelir; istenen diğer diller otomatik çevrilir
async function texts(kind: SyncKind, list: SyncItem[], tr: SyncItem, prev: ItemText | null, manual: Partial<Record<SyncLang, ItemText>>, auto: boolean, translate: (src: ItemText) => Promise<Translated>) {
  const missing = SYNC_LANGS.filter((l) => !manual[l]);
  let tx: Partial<Record<SyncLang, ItemText>> = { ...manual };
  let note = "";
  const want = auto && missing.length > 0 && (needsTranslation(tr, prev, list) || missing.some((l) => !findAlt(list, tr, l)));
  if (want) {
    const got = await translate(textOf(tr));
    if (got) {
      // Model çıktısı da temizleyiciden geçer
      for (const l of missing) tx[l] = { title: str(got[l].title, 180), description: str(got[l].description, 300), html: cleanHtml(str(got[l].html, 200_000)) };
      note = "İngilizce ve Almanca sürümler çevrildi.";
    } else
      note = TRANSLATE_CONFIGURED
        ? "Otomatik çeviri yapılamadı; çevrilmeyen dillerde metin eski hâliyle kaldı. Tekrar kaydederek yeniden deneyebilirsiniz."
        : "Diğer dillerde görseller güncellendi; metin çevirisi Claude ile yapılacak (Gösterge'deki çeviri bekleyenler listesinde).";
  }
  if (Object.keys(manual).length) note = `${note} Elle yazılan dil metinleri kaydedildi.`.trim();
  if (!Object.keys(tx).length) tx = {};
  return { tx, note: note || (kind === "project" ? "Diğer dillerde görseller güncellendi." : "") };
}

// İçerikte kullanılan görsel ve video adresleri (medya kütüphanesinde "kullanılıyor" işareti için)
// Panelin düzenlemediği, derlemeye gömülü içerik (hizmet ve eski sayfalar, açılış metinleri, stand/sektör sayfaları,
// fiyat rehberi) ve kodda adıyla geçen görseller de taranır; yalnızca panel dosyalarına bakmak yanlış "kullanılmıyor" verirdi
const BUILT = JSON.stringify([services, legacyPages, landings, extraPages, sectorPages, standPages, INTERIOR_PRICES, PROTECTED_MEDIA]);
async function usage(): Promise<Map<string, number>> {
  const all = [BUILT, ...(await Promise.all([PROJECTS_FILE, POSTS_FILE, HOME_FILE].map((f) => readText(f).catch(() => ""))))];
  const count = new Map<string, number>();
  for (const text of all) for (const m of text.matchAll(/\/(?:wp-content\/uploads|images|logos)\/[^"'\s)<>]+?\.(?:jpe?g|png|webp|svg|gif|avif)/gi)) count.set(m[0], (count.get(m[0]) ?? 0) + 1);
  return count;
}

export async function GET(req: Request) {
  if (!adminEnabled()) return NextResponse.json({ enabled: false });
  if (!(await isAdmin())) return NextResponse.json({ enabled: true, authed: false });
  const url = new URL(req.url);
  const q = (k: string) => url.searchParams.get(k);
  try {
    // Tek içerik: Türkçe ve dil sürümlerinin metni
    for (const [key, file] of [["project", PROJECTS_FILE], ["post", POSTS_FILE]] as const) {
      const path = q(key);
      if (!path) continue;
      const list = parse<SyncItem[]>(await readText(file)).value;
      const tr = list.find((p) => p.path === path && p.lang === "tr");
      if (!tr) return bad("İçerik bulunamadı.", 404);
      const langs = Object.fromEntries(SYNC_LANGS.map((l) => [l, findAlt(list, tr, l) ? { ...safeText(textOf(findAlt(list, tr, l)!)), path: findAlt(list, tr, l)!.path } : null]));
      return NextResponse.json({ item: safeText(tr), langs, rev: revOf(tr) });
    }
    if (q("home")) {
      const [home, projects] = await Promise.all([readText(HOME_FILE), readText(PROJECTS_FILE)]);
      const options = parse<SyncItem[]>(projects)
        .value.filter((p) => p.lang === "tr" && !p.draft)
        .map((p) => ({ path: p.path, title: p.title, image: p.featuredImage, category: p.meta?.["Kategori"] ?? "" }));
      return NextResponse.json({ home: JSON.parse(home), projects: options });
    }
    if (q("videos")) return NextResponse.json({ videos: JSON.parse(await readText(VIDEOS_FILE)), blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
    if (q("media")) {
      const [files, used] = await Promise.all([listMedia(), usage()]);
      const items = files.map((f) => {
        const src = f.path.replace(/^public/, "");
        // legacy: 2026 öncesi (eski WordPress) yüklemesi; silinmeden önce panel ayrıca uyarır
        const year = Number(src.match(/^\/wp-content\/uploads\/(\d{4})\//)?.[1] ?? 0);
        return { src, size: f.size, used: used.get(src) ?? 0, deletable: canDelete(f.path), legacy: year > 0 && year < 2026 };
      });
      // Önce panelden ve WordPress'ten yüklenenler (en yeni klasör üstte), sonra sitenin sabit görselleri
      const up = (x: { src: string }) => (x.src.startsWith("/wp-content/uploads/") ? 0 : 1);
      items.sort((a, b) => up(a) - up(b) || b.src.localeCompare(a.src));
      return NextResponse.json({ items });
    }
    if (q("history")) return NextResponse.json({ items: await history(), mode: storeMode() });

    // Faz 2 içerikleri (hizmet sayfaları, sektör sayfaları, fiyatlar, fuarlar)
    const c = await contentGet(q);
    if (c) return NextResponse.json(c);

    // Genel bakış: listeler ve gösterge
    const [pr, po] = await Promise.all([readText(PROJECTS_FILE), readText(POSTS_FILE)]);
    const projects = parse<SyncItem[]>(pr).value;
    const posts = parse<SyncItem[]>(po).value;
    const trProjects = projects.filter((p) => p.lang === "tr");
    const untranslated = trProjects.filter((p) => SYNC_LANGS.some((l) => !findAlt(projects, p, l))).map((p) => ({ path: p.path, title: p.title }));
    const noAlt = trProjects.filter((p) => (p.gallery ?? []).some((g) => !g.alt || /^[\w-]+$/.test(g.alt))).length;
    // İngilizce ya da Almanca sürümü Türkçe metinle duran içerik (çeviri bekliyor; Claude ile ya da otomatik çeviriyle yapılır)
    const sameText = (list: SyncItem[], kind: "project" | "post") =>
      list
        .filter((p) =>
          p.lang === "tr" &&
          SYNC_LANGS.some((l) => {
            const a = findAlt(list, p, l);
            return a && a.title === p.title && a.html === p.html;
          }),
        )
        .map((p) => ({ kind, path: p.path, title: p.title }));
    const waiting = [...sameText(projects, "project"), ...sameText(posts, "post")];
    // Panel açık kaldıkça oturum yenilenir
    return renewSession(NextResponse.json({
      enabled: true,
      authed: true,
      mode: storeMode(),
      translate: TRANSLATE_CONFIGURED,
      blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      categories: projectCats(),
      projects: trProjects.map((p) => ({ path: p.path, title: p.title, featuredImage: p.featuredImage, category: p.meta?.["Kategori"] ?? "", draft: Boolean(p.draft), video: Boolean(p.video) })),
      posts: posts.filter((p) => p.lang === "tr").map((p) => ({ path: p.path, title: p.title, date: p.date ?? null, featuredImage: p.featuredImage, draft: Boolean(p.draft), langs: SYNC_LANGS.filter((l) => findAlt(posts, p, l)) })),
      checks: { untranslated, noAlt, waiting },
    }));
  } catch (e) {
    if (e instanceof OpError) return bad(e.message, e.status);
    console.error("[admin] okuma", e instanceof Error ? e.message : e);
    return bad("İçerik okunamadı. Depo bağlantısını kontrol edin.", 502);
  }
}

export async function POST(req: Request) {
  if (!adminEnabled()) return bad("Panel kapalı.", 503);
  // Yalnızca panelin kendi sayfasından gelen JSON istekleri (başka siteden gönderilen form isteği kabul edilmez)
  if (!sameOrigin(req) || !isJson(req)) return bad("Geçersiz istek.", 403);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad("Geçersiz istek.");
  const op = str(body.op, 40);

  if (op === "login") {
    const ip = clientIp(req);
    // Sınırlar: IP başına 15 dakikada 8 hatalı deneme; tüm site için saatte 30 hatalı denemeden sonra giriş bir süre kapanır
    if ((await peek(`admin:loginfail:${ip}`)) >= 8 || (await peek("admin:loginfail:all")) >= 30) return bad("Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.", 429);
    if (!checkPassword(str(body.password, 200))) {
      await hit(`admin:loginfail:${ip}`, 15 * 60 * 1000);
      if ((await hit("admin:loginfail:all", HOUR)) === 30) console.error("[admin] çok sayıda hatalı giriş denemesi; giriş bir saatliğine kapandı");
      return bad("Parola hatalı.", 401);
    }
    return setSession(NextResponse.json({ ok: true }));
  }
  if (op === "logout") return clearSession(NextResponse.json({ ok: true }));
  if (!(await isAdmin())) return bad("Oturum süresi doldu, yeniden giriş yapın.", 401);
  // Ücretli ya da ağır işlemler oturumdan bağımsız olarak da sınırlıdır
  const LIMITS: Record<string, [number, number]> = { upload: [400, HOUR], translate: [80, HOUR], "translate.page": [40, HOUR], "youtube.info": [120, HOUR] };
  const savesTranslate = (op === "project.save" || op === "post.save") && body.translate !== false;
  const lim = LIMITS[op] ?? (savesTranslate ? LIMITS.translate : null);
  if (lim && !(await allow(`admin:op:${lim === LIMITS.translate ? "translate" : op}`, lim[0], lim[1]))) return bad("Kısa sürede çok fazla işlem yapıldı. Biraz sonra tekrar deneyin.", 429);
  if (storeMode() === "off") return bad("İçerik deposu bağlı değil (GITHUB_TOKEN ve GITHUB_REPO gerekli).", 503);

  try {
    // ---------------------------------------------------------------- görsel yükleme
    if (op === "upload") {
      const data = typeof body.data === "string" ? body.data : "";
      const m = str(body.type, 20).match(/^image\/(jpeg|png|webp)$/);
      if (!m || !/^[A-Za-z0-9+/=]+$/.test(data) || data.length > 5_500_000) return bad("Görsel yüklenemedi (en fazla 4 MB; JPG, PNG ya da WebP).");
      // Dosyanın içeriği bildirilen türle eşleşmeli
      const head = Buffer.from(data.slice(0, 24), "base64");
      const real = head[0] === 0xff && head[1] === 0xd8 ? "jpeg" : head.subarray(1, 4).toString("latin1") === "PNG" ? "png" : head.subarray(8, 12).toString("latin1") === "WEBP" ? "webp" : "";
      if (real !== m[1]) return bad("Görsel yüklenemedi: dosya içeriği JPG, PNG ya da WebP değil.");
      const d = new Date();
      const name = `${slugify(str(body.name, 80).replace(/\.[a-z0-9]+$/i, ""))}-${Math.random().toString(36).slice(2, 6)}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
      const file = `public/wp-content/uploads/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${name}`;
      const saved = await putBinary(file, data);
      return NextResponse.json({ src: file.replace(/^public/, ""), blob: saved.sha ? { path: saved.path, sha: saved.sha, token: blobToken(saved.path, saved.sha) } : null });
    }

    // ---------------------------------------------------------------- çeviri önizlemesi (dil sekmesindeki "Türkçeden çevir")
    if (op === "translate") {
      const src = { title: str(body.title, 180), description: str(body.description, 300), html: cleanHtml(str(body.html, 200_000)) };
      if (!src.title) return bad("Önce Türkçe başlığı yazın.");
      if (!TRANSLATE_CONFIGURED) return bad("Panelde otomatik çeviri kapalı; çeviriyi Claude'a yaptırın ya da dil sekmesine elle yazın.", 503);
      const got = await translateProject(src);
      if (!got) return bad("Çeviri yapılamadı, biraz sonra tekrar deneyin.", 502);
      return NextResponse.json(Object.fromEntries(SYNC_LANGS.map((l) => [l, { title: str(got[l].title, 180), description: str(got[l].description, 300), html: cleanHtml(str(got[l].html, 200_000)) }])));
    }

    const translate = memoTranslate();

    // ---------------------------------------------------------------- projeler
    if (op === "projects.order" || op === "project.save" || op === "project.delete") {
      const out = await transact([PROJECTS_FILE], async (t) => {
        const { value: list, crlf } = parse<SyncItem[]>(t[PROJECTS_FILE]);
        let message = "";
        let result: SyncItem | null = null;
        let note = "";
        if (op === "projects.order") {
          // TR projeler verilen sıraya girer; diğer diller TR karşılığının sırasını izler
          const order = new Map((Array.isArray(body.paths) ? body.paths : []).map((p, i) => [String(p), i]));
          const rank = (p: SyncItem) => order.get(p.lang === "tr" ? p.path : (p.alternates.tr ?? "")) ?? 1e6;
          for (const lang of ["tr", "en", "de"] as const) {
            const slots = list.map((p, i) => (p.lang === lang ? i : -1)).filter((i) => i >= 0);
            const sorted = slots.map((i) => list[i]).sort((a, b) => rank(a) - rank(b));
            slots.forEach((slot, k) => (list[slot] = sorted[k]));
          }
          message = `${PANEL_PREFIX} proje sırası güncellendi`;
        } else if (op === "project.delete") {
          const p = list.find((x) => x.path === str(body.path, 300) && x.lang === "tr");
          if (!p) throw new Error("404:Proje bulunamadı.");
          message = `${PANEL_PREFIX} proje silindi (${p.title})`;
          removeItem(list, p.path);
        } else {
          const d = (body.data ?? {}) as Record<string, unknown>;
          const title = str(d.title, 160);
          const category = str(d.category, 80);
          if (!title) throw new Error("400:Proje adı gerekli.");
          if (!projectCats().includes(category)) throw new Error("400:Kategori seçin.");
          const g = gallery(d.gallery, title);
          if (!g.length) throw new Error("400:En az bir fotoğraf ekleyin.");
          const html = cleanHtml(str(d.html, 60_000));
          const description = str(d.description, 300) || plain(html, 155) || title;
          const meta: Record<string, string> = { Kategori: category };
          if (str(d.brand, 120)) meta["Marka"] = str(d.brand, 120);
          if (str(d.service, 120)) meta["Verilen Hizmet"] = str(d.service, 120);
          const seo = { title, fullTitle: `${title} | Wawa Interiors`, description, ogImage: g[0].src };
          const v = video(d.video);
          const existing = list.find((p) => p.path === str(body.path, 300) && p.lang === "tr");
          if (existing) checkBase(existing, body.base);
          const prev = existing ? textOf(existing) : null;
          if (existing) {
            Object.assign(existing, { title, featuredImage: g[0].src, gallery: g, html, meta: { ...existing.meta, ...meta }, seo: { ...existing.seo, ...seo } });
            if (!str(d.brand, 120)) delete existing.meta?.["Marka"];
            if (!str(d.service, 120)) delete existing.meta?.["Verilen Hizmet"];
            result = existing;
            message = `${PANEL_PREFIX} proje güncellendi (${title})`;
          } else {
            let slug = slugify(title);
            for (let n = 2; resolve(`/portfolio/${slug}/`) || list.some((p) => p.path === `/portfolio/${slug}/`); n++) slug = `${slugify(title)}-${n}`;
            const path = `/portfolio/${slug}/`;
            result = { path, lang: "tr", alternates: { tr: path }, seo, slug, title, featuredImage: g[0].src, meta, gallery: g, html };
            // Yeni proje TR listesinin başına eklenir (sitede en üstte görünür)
            const first = list.findIndex((x) => x.lang === "tr");
            list.splice(first < 0 ? list.length : first, 0, result);
            message = `${PANEL_PREFIX} yeni proje (${title})`;
          }
          if (v) result.video = v;
          else delete result.video;
          if (bool(d.draft)) result.draft = true;
          else delete result.draft;
          const { tx, note: n } = await texts("project", list, result, prev, langTexts(body.langs), body.translate !== false, translate);
          const fallback = syncItem("project", list, result, tx, true);
          // Çeviri olmadan açılan dil sürümleri Türkçe metinle başlar; panelde açıkça söylenir
          note = fallback.length ? `İngilizce ve Almanca sayfalar Türkçe metinle açıldı; çevirisi Claude ile yapılacak (Gösterge'deki çeviri bekleyenler listesinde).` : n;
        }
        return { changes: [{ path: PROJECTS_FILE, text: dump(list, crlf) }, ...blobs(body.blobs)], message, result: { project: result, note } };
      });
      return NextResponse.json({ ok: true, ...out });
    }

    // ---------------------------------------------------------------- blog yazıları
    if (op === "post.save" || op === "post.delete") {
      const out = await transact([POSTS_FILE], async (t) => {
        const { value: list, crlf } = parse<SyncItem[]>(t[POSTS_FILE]);
        let message = "";
        let result: SyncItem | null = null;
        let note = "";
        if (op === "post.delete") {
          const p = list.find((x) => x.path === str(body.path, 300) && x.lang === "tr");
          if (!p) throw new Error("404:Yazı bulunamadı.");
          message = `${PANEL_PREFIX} yazı silindi (${p.title})`;
          removeItem(list, p.path);
        } else {
          const d = (body.data ?? {}) as Record<string, unknown>;
          const title = str(d.title, 180);
          const html = cleanHtml(str(d.html, 200_000));
          const cover = str(d.featuredImage, 300);
          if (!title) throw new Error("400:Başlık gerekli.");
          if (plain(html, 100).length < 20) throw new Error("400:Yazı metni çok kısa.");
          if (cover && !IMG.test(cover)) throw new Error("400:Kapak görseli geçersiz.");
          const description = str(d.description, 300) || plain(html, 155);
          const stamp = now();
          const existing = list.find((p) => p.path === str(body.path, 300) && p.lang === "tr");
          if (existing) checkBase(existing, body.base);
          const prev = existing ? textOf(existing) : null;
          if (existing) {
            Object.assign(existing, { title, html, featuredImage: cover || null, modified: stamp, seo: { ...existing.seo, title, fullTitle: title, description, ogImage: cover || null } });
            result = existing;
            message = `${PANEL_PREFIX} yazı güncellendi (${title})`;
          } else {
            let slug = slugify(title);
            for (let n = 2; resolve(`/${slug}/`) || list.some((p) => p.path === `/${slug}/`); n++) slug = `${slugify(title)}-${n}`;
            const path = `/${slug}/`;
            result = { path, lang: "tr", alternates: { tr: path }, seo: { title, fullTitle: title, description, ogImage: cover || null }, slug, title, date: stamp, modified: stamp, featuredImage: cover || null, categories: ["Blog"], html, faq: [] };
            // Yeni yazı en başa eklenir (blogda en üstte görünür)
            list.unshift(result);
            message = `${PANEL_PREFIX} yeni yazı (${title})`;
          }
          if (bool(d.draft)) result.draft = true;
          else delete result.draft;
          // Yazılarda dil sürümü yalnızca istenirse açılır; var olan sürümler her zaman eşitlenir
          const create = bool(body.createLangs);
          const hasAlt = SYNC_LANGS.some((l) => findAlt(list, result!, l));
          const manual = langTexts(body.langs);
          const r = await texts("post", list, result, prev, manual, body.translate !== false && (create || hasAlt), translate);
          const fallback = syncItem("post", list, result, r.tx, create);
          note = fallback.length ? "İngilizce ve Almanca sürümler Türkçe metinle açıldı; çevirisi Claude ile yapılacak (Gösterge'deki çeviri bekleyenler listesinde)." : r.note;
        }
        return { changes: [{ path: POSTS_FILE, text: dump(list, crlf) }, ...blobs(body.blobs)], message, result: { post: result, note } };
      });
      return NextResponse.json({ ok: true, ...out });
    }

    // ---------------------------------------------------------------- anasayfa
    if (op === "home.save") {
      const h = (body.home ?? {}) as Record<string, unknown>;
      const arr = (v: unknown) => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);
      const home = {
        slides: arr(h.slides)
          .map((s) => ({ sector: str(s.sector, 40), project: str(s.project, 80), image: img(s.image), alt: str(s.alt, 200), href: href(s.href) }))
          .filter((s) => s.image && s.sector)
          .slice(0, 12),
        featured: arr(h.featured)
          .map((f) => ({ path: /^\/(en\/|de\/)?portfolio\/[\w-]+\/$/.test(str(f.path, 300)) ? str(f.path, 300) : "", title: str(f.title, 80), location: str(f.location, 60) || null, image: img(f.image), category: str(f.category, 60), filter: ["residential", "commercial", "stand"].includes(String(f.filter)) ? String(f.filter) : "commercial" }))
          .filter((f) => f.path && f.title && f.image)
          .slice(0, 24),
        brands: arr(h.brands).map((b) => ({ name: str(b.name, 60), src: img(b.src) })).filter((b) => b.name && b.src).slice(0, 80),
        press: arr(h.press)
          .map((p) => {
            const logo = (p.logo ?? {}) as Record<string, unknown>;
            return { source: str(p.source, 60), date: str(p.date, 40), title: str(p.title, 200), href: /^https:\/\//.test(str(p.href, 400)) ? str(p.href, 400) : "", logo: { src: img(logo.src), w: Number(logo.w) || 480, h: Number(logo.h) || 160, cls: str(logo.cls, 40) || "max-h-8" } };
          })
          .filter((p) => p.source && p.title && p.href && p.logo.src)
          .slice(0, 20),
        reviews: (() => {
          const r = (h.reviews ?? {}) as Record<string, unknown>;
          return {
            rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
            count: Math.max(0, Math.round(Number(r.count) || 0)),
            url: /^https:\/\//.test(str(r.url, 300)) ? str(r.url, 300) : "",
            items: arr(r.items).map((i) => ({ author: str(i.author, 80), when: str(i.when, 40), text: str(i.text, 1500) })).filter((i) => i.author && i.text).slice(0, 30),
          };
        })(),
        faq: arr(h.faq).map((f) => ({ q: str(f.q, 200), a: str(f.a, 1500) })).filter((f) => f.q && f.a).slice(0, 20),
        process: arr(h.process)
          .map((p) => ({ title: str(p.title, 80), text: str(p.text, 600), points: (Array.isArray(p.points) ? p.points : []).map((x) => str(x, 80)).filter(Boolean).slice(0, 6), image: img(p.image), position: str(p.position, 20) || "50% 50%", alt: str(p.alt, 200) }))
          .filter((p) => p.title && p.image)
          .slice(0, 6),
      };
      if (!home.slides.length) return bad("En az bir açılış slaytı olmalı.");
      await transact([HOME_FILE], (t) => ({ changes: [{ path: HOME_FILE, text: dump(home, parse(t[HOME_FILE]).crlf) }, ...blobs(body.blobs)], message: `${PANEL_PREFIX} anasayfa güncellendi`, result: null }));
      return NextResponse.json({ ok: true });
    }

    // ---------------------------------------------------------------- videolar
    if (op === "videos.save") {
      const v = (body.videos ?? {}) as Record<string, unknown>;
      const youtube = (Array.isArray(v.youtube) ? v.youtube : [])
        .map((x) => x as Record<string, unknown>)
        .map((x) => ({ id: video(x.id), title: str(x.title, 120), duration: str(x.duration, 10) }))
        .filter((x) => /^[\w-]{11}$/.test(x.id) && x.title)
        .slice(0, 100);
      const files = (Array.isArray(v.files) ? v.files : [])
        .map((x) => x as Record<string, unknown>)
        .map((x) => ({ src: video(x.src), title: str(x.title, 120), size: Number(x.size) || undefined }))
        .filter((x) => x.src && !/^[\w-]{11}$/.test(x.src) && x.title)
        .slice(0, 50);
      const standHero = video(v.standHero) || youtube[0]?.id || "";
      await transact([VIDEOS_FILE], (t) => ({ changes: [{ path: VIDEOS_FILE, text: dump({ youtube, files, standHero }, parse(t[VIDEOS_FILE]).crlf) }], message: `${PANEL_PREFIX} videolar güncellendi`, result: null }));
      return NextResponse.json({ ok: true });
    }

    // ---------------------------------------------------------------- kütüphaneye görsel ekleme (yüklenenler tek kayıtta)
    if (op === "media.commit") {
      const list = blobs(body.blobs);
      if (storeMode() === "github" && !list.length) return bad("Yüklenen görsel yok.");
      if (list.length) await transact([], () => ({ changes: list, message: `${PANEL_PREFIX} ${list.length} görsel yüklendi`, result: null }));
      return NextResponse.json({ ok: true });
    }

    // ---------------------------------------------------------------- YouTube videosunun başlığı (oEmbed)
    if (op === "youtube.info") {
      const id = video(body.url);
      if (!/^[\w-]{11}$/.test(id)) return bad("Geçerli bir YouTube bağlantısı yapıştırın.");
      const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
      const j = r?.ok ? ((await r.json().catch(() => null)) as { title?: string } | null) : null;
      if (!j?.title) return bad("Video bulunamadı ya da herkese açık değil.", 404);
      return NextResponse.json({ id, title: j.title.slice(0, 120) });
    }

    // ---------------------------------------------------------------- yüklenmiş videoyu depodan silme
    if (op === "blob.delete") {
      const src = video(body.src);
      if (!src || /^[\w-]{11}$/.test(src)) return bad("Geçersiz video.");
      if (!process.env.BLOB_READ_WRITE_TOKEN) return bad("Video deposu bağlı değil.", 503);
      const { del } = await import("@vercel/blob");
      await del(src);
      return NextResponse.json({ ok: true });
    }

    // ---------------------------------------------------------------- medya silme (yalnız kullanılmayan yüklemeler)
    if (op === "media.delete") {
      const src = str(body.src, 300);
      const file = `public${src}`;
      if (!canDelete(file)) return bad("Bu görsel panelden silinemez.");
      // Kullanım kontrolü kaydın kendisiyle aynı anda, tüm içerik dosyalarının güncel hâli üzerinden yapılır
      await transact(DATA_FILES, (t) => {
        if ([BUILT, ...Object.values(t)].some((text) => text.includes(src))) throw new Error("409:Görsel bir içerikte kullanılıyor; önce oradan kaldırın.");
        return { changes: [{ path: file, remove: true }], message: `${PANEL_PREFIX} görsel silindi (${src.split("/").pop()})`, result: null };
      });
      return NextResponse.json({ ok: true });
    }

    // ---------------------------------------------------------------- Faz 2 içerikleri
    const c = await contentPost(op, body);
    if (c) return NextResponse.json(c);

    // Yapılandırılmış sayfanın Türkçe metinleri İngilizce ve Almancaya (aynı yapıda) çevrilir
    if (op === "translate.page") {
      if (!TRANSLATE_CONFIGURED) return bad("Panelde otomatik çeviri kapalı; çeviriyi Claude'a yaptırın ya da dil sekmesine elle yazın.", 503);
      const item = body.item;
      const list = collectText(item);
      if (!list.length) return bad("Çevrilecek metin yok.");
      if (list.length > TEXT_LIMIT.count || list.join("").length > TEXT_LIMIT.chars) return bad("Sayfa tek seferde çevrilemeyecek kadar uzun.");
      const [en, de] = await Promise.all([translateList(list, "en"), translateList(list, "de")]);
      if (!en || !de) return bad("Çeviri yapılamadı, biraz sonra tekrar deneyin.", 502);
      return NextResponse.json({ en: applyText(item, en), de: applyText(item, de) });
    }

    // ---------------------------------------------------------------- geri alma
    if (op === "revert") {
      const sha = str(body.sha, 40);
      if (!/^[0-9a-f]{40}$/.test(sha)) return bad("Geçersiz kayıt.");
      const title = await revert(sha);
      return NextResponse.json({ ok: true, title });
    }
  } catch (e) {
    if (e instanceof OpError) return bad(e.message, e.status);
    const msg = e instanceof Error ? e.message : String(e);
    const m = msg.match(/^(400|404|409):(.*)$/);
    if (m) return bad(m[2], Number(m[1]));
    if (/yeniden düzenlenmiş|Yalnızca panelden|yalnızca canlı|Geri alınacak/.test(msg)) return bad(msg, 409);
    console.error("[admin] yazma", msg);
    return bad("Kaydedilemedi. Biraz sonra tekrar deneyin.", 502);
  }
  return bad("Bilinmeyen işlem.");
}

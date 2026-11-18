import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_MS, adminEnabled, checkPassword, isAdmin, makeSession } from "@/lib/admin/auth";
import { POSTS_FILE, PROJECTS_FILE, commit, putBinary, readText, storeMode, type Change } from "@/lib/admin/store";
import { clientIp } from "@/lib/phone-otp";
import { allow } from "@/lib/rate-limit";
import { categories, type Post, type Project } from "@/lib/content";
import { resolve } from "@/lib/routes";

// Yönetim paneli ucu: giriş, içerik okuma, görsel yükleme, proje ve yazı kaydetme.
// Her işlem oturum ister; içerik her zaman depodan taze okunur (derlemedeki kopyadan değil).
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "");

// --- dosya okuma / yazma (girinti ve satır sonu korunur ki kayıt farkları küçük kalsın)
async function load<T>(file: string) {
  const text = await readText(file);
  return { list: JSON.parse(text) as T[], crlf: text.includes("\r\n") };
}
const dump = (list: unknown, crlf: boolean) => {
  const out = JSON.stringify(list, null, 1);
  return crlf ? out.replace(/\n/g, "\r\n") : out;
};

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
const slugify = (s: string) =>
  s
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TR_MAP[c])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "icerik";

// Panelden gelen metin: betik ve olay öznitelikleri ayıklanır (panel yalnızca yöneticiye açık olsa da)
const cleanHtml = (html: string) =>
  html
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/<\/?(span|font)[^>]*>/gi, "")
    .replace(/<div>/gi, "<p>")
    .replace(/<\/div>/gi, "</p>")
    .replace(/&nbsp;/g, " ")
    .trim();
const plain = (html: string, max: number) => {
  const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, t.lastIndexOf(" ", max)).trim();
};

const IMG = /^\/wp-content\/uploads\/[\w\-./%]+\.(jpe?g|png|webp)$/i;
type Gallery = { src: string; alt: string }[];
const gallery = (v: unknown, title: string): Gallery =>
  Array.isArray(v)
    ? v
        .map((g) => ({ src: str((g as { src?: unknown })?.src, 300), alt: str((g as { alt?: unknown })?.alt, 200) || title }))
        .filter((g) => IMG.test(g.src))
        .slice(0, 60)
    : [];
// Yeni yüklenen görsellerin depo kayıtları (GitHub'da içerik kimliği; yerelde dosya zaten yazılıdır)
const blobs = (v: unknown): Change[] =>
  Array.isArray(v)
    ? v.map((b) => ({ path: str((b as { path?: unknown })?.path, 300), sha: str((b as { sha?: unknown })?.sha, 64) })).filter((b) => b.path && /^[0-9a-f]{40}$/.test(b.sha ?? ""))
    : [];

const projectCats = () => categories.filter((c) => c.kind === "portfolio-category" && c.lang === "tr").map((c) => c.name);

export async function GET(req: Request) {
  if (!adminEnabled()) return NextResponse.json({ enabled: false });
  if (!(await isAdmin())) return NextResponse.json({ enabled: true, authed: false });
  const url = new URL(req.url);
  try {
    const postPath = url.searchParams.get("post");
    if (postPath) {
      const { list } = await load<Post>(POSTS_FILE);
      const post = list.find((p) => p.path === postPath);
      return post ? NextResponse.json({ post }) : bad("Yazı bulunamadı.", 404);
    }
    const [pr, po] = await Promise.all([load<Project>(PROJECTS_FILE), load<Post>(POSTS_FILE)]);
    return NextResponse.json({
      enabled: true,
      authed: true,
      mode: storeMode(),
      categories: projectCats(),
      projects: pr.list.filter((p) => p.lang === "tr"),
      posts: po.list.filter((p) => p.lang === "tr").map((p) => ({ path: p.path, title: p.title, date: p.date, featuredImage: p.featuredImage })),
    });
  } catch (e) {
    console.error("[admin] okuma", e instanceof Error ? e.message : e);
    return bad("İçerik okunamadı. Depo bağlantısını kontrol edin.", 502);
  }
}

export async function POST(req: Request) {
  if (!adminEnabled()) return bad("Panel kapalı.", 503);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad("Geçersiz istek.");
  const op = str(body.op, 40);

  if (op === "login") {
    if (!allow(`admin:login:${clientIp(req)}`, 8, 15 * 60 * 1000)) return bad("Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.", 429);
    if (!checkPassword(str(body.password, 200))) return bad("Parola hatalı.", 401);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, makeSession(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_TTL_MS / 1000 });
    return res;
  }
  if (op === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
  if (!(await isAdmin())) return bad("Oturum süresi doldu, yeniden giriş yapın.", 401);
  if (storeMode() === "off") return bad("İçerik deposu bağlı değil (GITHUB_TOKEN ve GITHUB_REPO gerekli).", 503);

  try {
    // ---------------------------------------------------------------- görsel yükleme
    if (op === "upload") {
      const data = typeof body.data === "string" ? body.data : "";
      const m = str(body.type, 20).match(/^image\/(jpeg|png|webp)$/);
      if (!m || !/^[A-Za-z0-9+/=]+$/.test(data) || data.length > 5_500_000) return bad("Görsel yüklenemedi (en fazla 4 MB; JPG, PNG ya da WebP).");
      const now = new Date();
      const name = `${slugify(str(body.name, 80).replace(/\.[a-z0-9]+$/i, ""))}-${Math.random().toString(36).slice(2, 6)}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
      const file = `public/wp-content/uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${name}`;
      const saved = await putBinary(file, data);
      return NextResponse.json({ src: file.replace(/^public/, ""), blob: saved.sha ? { path: saved.path, sha: saved.sha } : null });
    }

    // ---------------------------------------------------------------- projeler
    if (op === "projects.order" || op === "project.save" || op === "project.delete") {
      const { list, crlf } = await load<Project>(PROJECTS_FILE);
      let message = "";
      let result: Project | null = null;

      if (op === "projects.order") {
        // TR projeler verilen sıraya girer; diğer diller TR karşılığının sırasını izler
        const order = new Map((Array.isArray(body.paths) ? body.paths : []).map((p, i) => [String(p), i]));
        const rank = (p: Project) => order.get(p.lang === "tr" ? p.path : (p.alternates.tr ?? "")) ?? 1e6;
        for (const lang of ["tr", "en", "de"] as const) {
          const slots = list.map((p, i) => (p.lang === lang ? i : -1)).filter((i) => i >= 0);
          const sorted = slots.map((i) => list[i]).sort((a, b) => rank(a) - rank(b));
          slots.forEach((slot, k) => (list[slot] = sorted[k]));
        }
        message = "Panel: proje sırası güncellendi";
      } else if (op === "project.delete") {
        const i = list.findIndex((p) => p.path === str(body.path, 300) && p.lang === "tr");
        if (i < 0) return bad("Proje bulunamadı.", 404);
        message = `Panel: proje silindi (${list[i].title})`;
        list.splice(i, 1);
      } else {
        const d = (body.data ?? {}) as Record<string, unknown>;
        const title = str(d.title, 160);
        const category = str(d.category, 80);
        if (!title) return bad("Proje adı gerekli.");
        if (!projectCats().includes(category)) return bad("Kategori seçin.");
        const g = gallery(d.gallery, title);
        if (!g.length) return bad("En az bir fotoğraf ekleyin.");
        const html = cleanHtml(str(d.html, 60_000));
        const description = str(d.description, 300) || plain(html, 155) || title;
        const meta: Record<string, string> = { Kategori: category };
        if (str(d.brand, 120)) meta["Marka"] = str(d.brand, 120);
        if (str(d.service, 120)) meta["Verilen Hizmet"] = str(d.service, 120);
        const seo = { title, fullTitle: `${title} | Wawa Interiors`, description, ogImage: g[0].src };
        const existing = list.find((p) => p.path === str(body.path, 300) && p.lang === "tr");
        if (existing) {
          Object.assign(existing, { title, featuredImage: g[0].src, gallery: g, html, meta: { ...existing.meta, ...meta }, seo: { ...existing.seo, ...seo } });
          if (!str(d.brand, 120)) delete existing.meta?.["Marka"];
          if (!str(d.service, 120)) delete existing.meta?.["Verilen Hizmet"];
          result = existing;
          message = `Panel: proje güncellendi (${title})`;
        } else {
          let slug = slugify(title);
          for (let n = 2; resolve(`/portfolio/${slug}/`) || list.some((p) => p.path === `/portfolio/${slug}/`); n++) slug = `${slugify(title)}-${n}`;
          const p = `/portfolio/${slug}/`;
          result = { path: p, lang: "tr", alternates: { tr: p }, seo, slug, title, featuredImage: g[0].src, meta, gallery: g, html } as unknown as Project;
          // Yeni proje TR listesinin başına eklenir (sitede en üstte görünür)
          const first = list.findIndex((x) => x.lang === "tr");
          list.splice(first < 0 ? list.length : first, 0, result);
          message = `Panel: yeni proje (${title})`;
        }
      }
      await commit([{ path: PROJECTS_FILE, text: dump(list, crlf) }, ...blobs(body.blobs)], message);
      return NextResponse.json({ ok: true, project: result });
    }

    // ---------------------------------------------------------------- blog yazıları
    if (op === "post.save" || op === "post.delete") {
      const { list, crlf } = await load<Post>(POSTS_FILE);
      let message = "";
      let result: Post | null = null;
      if (op === "post.delete") {
        const i = list.findIndex((p) => p.path === str(body.path, 300) && p.lang === "tr");
        if (i < 0) return bad("Yazı bulunamadı.", 404);
        message = `Panel: yazı silindi (${list[i].title})`;
        list.splice(i, 1);
      } else {
        const d = (body.data ?? {}) as Record<string, unknown>;
        const title = str(d.title, 180);
        const html = cleanHtml(str(d.html, 200_000));
        const cover = str(d.featuredImage, 300);
        if (!title) return bad("Başlık gerekli.");
        if (plain(html, 100).length < 20) return bad("Yazı metni çok kısa.");
        if (cover && !IMG.test(cover)) return bad("Kapak görseli geçersiz.");
        const description = str(d.description, 300) || plain(html, 155);
        const now = new Date().toISOString().replace(/\.\d+Z$/, "+00:00");
        const existing = list.find((p) => p.path === str(body.path, 300) && p.lang === "tr");
        if (existing) {
          Object.assign(existing, { title, html, featuredImage: cover || null, modified: now, seo: { ...existing.seo, title, fullTitle: title, description, ogImage: cover || null } });
          result = existing;
          message = `Panel: yazı güncellendi (${title})`;
        } else {
          let slug = slugify(title);
          for (let n = 2; resolve(`/${slug}/`) || list.some((p) => p.path === `/${slug}/`); n++) slug = `${slugify(title)}-${n}`;
          const p = `/${slug}/`;
          result = { path: p, lang: "tr", alternates: { tr: p }, seo: { title, fullTitle: title, description, ogImage: cover || null }, slug, title, date: now, modified: now, featuredImage: cover || null, categories: ["Blog"], html, faq: [] } as unknown as Post;
          // Yeni yazı en başa eklenir (blogda en üstte görünür)
          list.unshift(result);
          message = `Panel: yeni yazı (${title})`;
        }
      }
      await commit([{ path: POSTS_FILE, text: dump(list, crlf) }, ...blobs(body.blobs)], message);
      return NextResponse.json({ ok: true, post: result });
    }
  } catch (e) {
    console.error("[admin] yazma", e instanceof Error ? e.message : e);
    return bad("Kaydedilemedi. Biraz sonra tekrar deneyin.", 502);
  }
  return bad("Bilinmeyen işlem.");
}

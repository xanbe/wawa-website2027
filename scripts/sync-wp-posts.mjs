// Canlı WordPress'te (wawainteriors.com) yeni yayınlanan TR blog yazılarını src/content/posts.json'a ekler.
// Yeni site yayına girene kadar Wawa SEO bulut işçisi yazıları WordPress'e yayınlamaya devam ediyor; bu betik aradaki farkı kapatır.
// Adres eski siteyle aynı kalır (/<slug>/). Kapak ve yazı içi görseller public/wp-content/uploads/ altına aynı yolla indirilir.
//
// Kullanım:  node scripts/sync-wp-posts.mjs            (posts.json'daki en yeni tarihten sonrakiler)
//            node scripts/sync-wp-posts.mjs --dry      (yalnızca listeler, dosyaya yazmaz)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Node 22.18+/24: TypeScript dosyası doğrudan içe aktarılır (tür bilgileri ayıklanır)
import { cleanHtml } from "../src/lib/sanitize.ts";

const WP = "https://wawainteriors.com";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = path.join(ROOT, "src/content/posts.json");
const DRY = process.argv.includes("--dry");

const posts = JSON.parse(fs.readFileSync(POSTS, "utf8"));
const known = new Set(posts.map((p) => p.path));
const latest = posts.map((p) => p.date).sort().at(-1);

const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
const meta = (html, re) => decode((html.match(re) || [])[1] || "").trim();
const UPLOAD = /https?:\/\/(?:www\.)?wawainteriors\.com(\/wp-content\/uploads\/[^"'\s)<>,]+)/g;

// Görseller yalnızca public/wp-content/uploads/YYYY/MM/ altına, yalnızca görsel uzantısıyla yazılır.
// Adres WordPress içeriğinden geldiği için güvenilmez: "..", sorgu dizesi ya da klasör dışına çıkan yol atlanır.
const UPLOADS = path.join(ROOT, "public", "wp-content", "uploads") + path.sep;
const SAFE_UPLOAD = /^\/wp-content\/uploads\/\d{4}\/\d{2}\/[\w.-]+\.(jpe?g|png|webp|gif|avif)$/i;
async function download(rel) {
  let u;
  try {
    u = new URL(rel, WP);
  } catch {
    return console.warn(`  geçersiz görsel adresi atlandı: ${rel}`);
  }
  const p = decodeURIComponent(u.pathname);
  if (u.origin !== WP || u.search || p.includes("..") || !SAFE_UPLOAD.test(p)) return console.warn(`  güvenli olmayan görsel adresi atlandı: ${rel}`);
  const dst = path.resolve(ROOT, "public", "." + p);
  if (!dst.startsWith(UPLOADS)) return console.warn(`  klasör dışına çıkan görsel atlandı: ${rel}`);
  if (fs.existsSync(dst)) return;
  const r = await fetch(u.origin + u.pathname, { redirect: "error" }).catch(() => null);
  if (!r) return console.warn(`  görsel indirilemedi: ${rel}`);
  if (!r.ok) return console.warn(`  görsel indirilemedi (${r.status}): ${rel}`);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer()));
}

const res = await fetch(`${WP}/wp-json/wp/v2/posts?per_page=100&lang=tr&after=${encodeURIComponent(latest)}&_embed=wp:featuredmedia,wp:term`);
const list = await res.json();
const fresh = list.filter((p) => !known.has(new URL(p.link).pathname));
console.log(`posts.json en yeni: ${latest} · WordPress'te sonrası: ${list.length} · eklenecek: ${fresh.length}`);

for (const p of fresh.reverse()) {
  const pathname = decodeURIComponent(new URL(p.link).pathname);
  // Yazı adresi tek düzeyli kısa ad olmalı (ör. /ofis-tasarimi/); başka bir şey gelirse yazı atlanır
  if (new URL(p.link).origin !== WP || !/^\/[\p{L}\p{N}-]{1,120}\/$/u.test(pathname)) {
    console.warn(`  beklenmeyen yazı adresi atlandı: ${p.link}`);
    continue;
  }
  const page = await (await fetch(p.link)).text();
  const title = decode(p.title.rendered);
  const fullTitle = meta(page, /<title>([^<]*)<\/title>/i).replace(/\s*[|–-]\s*Wawa Interiors.*$/i, "") || title;
  const description = meta(page, /<meta name="description" content="([^"]*)"/i);
  const feat = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
  const featRel = feat.replace(/^https?:\/\/(?:www\.)?wawainteriors\.com/, "");
  const featuredImage = SAFE_UPLOAD.test(featRel) ? featRel : "";
  // Başlık şablonda basılır: WordPress'te içeriğe eklenen H1 (wawa-post-title) çıkarılır.
  // İçerik sitedeki aynı izin listeli temizleyiciden geçer (betik, olay özniteliği, iframe vb. atılır)
  let html = cleanHtml(p.content.rendered.replace(/^\s*<h1[^>]*class="wawa-post-title"[^>]*>[\s\S]*?<\/h1>\s*/i, ""));
  const files = new Set([...html.matchAll(UPLOAD)].map((m) => m[1]));
  if (featuredImage) files.add(featuredImage);
  html = html.replace(UPLOAD, "$1").trim();
  const cats = (p._embedded?.["wp:term"]?.[0] || []).map((c) => decode(c.name));
  const entry = {
    path: pathname,
    lang: "tr",
    alternates: {},
    seo: { title: fullTitle, fullTitle, description, ogImage: featuredImage },
    slug: p.slug,
    title,
    date: p.date_gmt + "+00:00",
    modified: p.modified_gmt + "+00:00",
    featuredImage,
    categories: cats.length ? cats : ["Blog"],
    html,
    faq: [],
  };
  console.log(`+ ${pathname} · ${title} · ${files.size} görsel`);
  if (DRY) continue;
  for (const f of files) await download(f);
  posts.unshift(entry);
}

if (!DRY && fresh.length) {
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  fs.writeFileSync(POSTS, JSON.stringify(posts, null, 1).replace(/\n/g, "\r\n")); // dosyanın biçimi: CRLF, sonda satır sonu yok
  console.log(`posts.json güncellendi (${posts.length} yazı)`);
}

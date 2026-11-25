// Fuar rehberlerini (src/content/fair-guides.json) yayın öncesi denetler. Hata varsa çıkış kodu 1.
// Kullanım: node scripts/check-fair-guides.mjs            → denetim + özet
//           node scripts/check-fair-guides.mjs --next 6   → rehberi olmayan, tarihi yakın sıradaki 6 fuar (slug | ad | tarih | resmî site)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fairs = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/fairs.json"), "utf8"));
const guides = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/fair-guides.json"), "utf8"));
const bySlug = new Map(fairs.map((f) => [f.slug, f]));
const covered = new Set(guides.flatMap((g) => g.slugs));
// Resmî sitesi okunamayan / bilgi bulunamayan fuarlar: [{ slug, reason, date }] — sıraya tekrar girmez
const SKIP_FILE = path.join(ROOT, "src/content/fair-guides-skip.json");
const skipped = new Set(fs.existsSync(SKIP_FILE) ? JSON.parse(fs.readFileSync(SKIP_FILE, "utf8")).map((x) => x.slug) : []);

const nextIdx = process.argv.indexOf("--next");
if (nextIdx > -1) {
  const n = Number(process.argv[nextIdx + 1] || 6);
  const today = new Date().toISOString().slice(0, 10);
  const seenHost = new Set();
  const out = [];
  for (const f of [...fairs].sort((a, b) => a.start.localeCompare(b.start))) {
    if (covered.has(f.slug) || skipped.has(f.slug) || f.start < today || f.verified === false || !f.url || /tobb\.org\.tr/.test(f.url)) continue;
    const host = new URL(f.url).hostname;
    if (seenHost.has(host)) continue; // aynı organizatör sitesindeki fuarlar ayrı turlara
    seenHost.add(host);
    out.push(`${f.slug} | ${f.name} | ${f.city} | ${f.start}–${f.end} | ${f.url}`);
    if (out.length >= n) break;
  }
  console.log(out.join("\n"));
  process.exit(0);
}

const errors = [];
const seen = new Set();
const words = (t) => t.split(/\s+/).filter(Boolean).length;
for (const g of guides) {
  const id = g.name || "(adsız)";
  if (!g.name || !Array.isArray(g.slugs) || !g.slugs.length) errors.push(`${id}: name/slugs eksik`);
  for (const s of g.slugs || []) {
    if (!bySlug.has(s)) errors.push(`${id}: fuar listesinde olmayan slug "${s}"`);
    if (seen.has(s)) errors.push(`${id}: slug iki rehberde "${s}"`);
    seen.add(s);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g.updated || "")) errors.push(`${id}: updated YYYY-AA-GG olmalı`);
  if (!Array.isArray(g.sources) || !g.sources.length || g.sources.some((u) => !/^https?:\/\//.test(u))) errors.push(`${id}: sources boş ya da geçersiz`);
  for (const lang of ["tr", "en", "de"]) {
    const t = g[lang];
    if (!t || !t.intro || !Array.isArray(t.sections)) { errors.push(`${id}/${lang}: intro/sections eksik`); continue; }
    if (t.sections.length < 3) errors.push(`${id}/${lang}: en az 3 bölüm olmalı`);
    const total = words(t.intro) + t.sections.reduce((n, s) => n + words(s.h) + words(s.p), 0);
    if (total < 130) errors.push(`${id}/${lang}: metin kısa (${total} kelime, en az 130; dolgu değil resmî siteden bilgi ekle)`);
    const all = [t.intro, ...t.sections.flatMap((s) => [s.h, s.p])].join(" ");
    if (/günümüzün hızlı|hayallerinizi|kaliteden ödün|!/.test(all)) errors.push(`${id}/${lang}: yasaklı kalıp ya da ünlem`);
  }
}
console.log(`rehber: ${guides.length} · kapsanan fuar sayfası: ${covered.size}/${fairs.length}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("denetim temiz");

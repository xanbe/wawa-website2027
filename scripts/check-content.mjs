// Derleme öncesi denetim: içerik dosyalarında (src/content/*.json) betik çalıştırabilecek HTML var mı?
// Panel ve içe aktarma betikleri HTML'i zaten temizler; bu denetim gözden kaçan bir yol olursa derlemeyi durdurur.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "src", "content");
const BAD = /<\s*(script|iframe|object|embed|form|meta|base|link|style|svg|math)\b|\son[a-z]+\s*=|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|srcdoc\s*=/i;
const problems = [];

function walk(v, where) {
  if (typeof v === "string") {
    if (v.includes("<") || /script\s*:/i.test(v)) {
      const m = v.match(BAD);
      if (m) problems.push(`${where}: "${v.slice(Math.max(0, m.index - 30), m.index + 50).replace(/\s+/g, " ")}"`);
    }
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
}

for (const f of readdirSync(DIR).filter((f) => f.endsWith(".json"))) walk(JSON.parse(readFileSync(path.join(DIR, f), "utf8")), f);
if (problems.length) {
  console.error(`İçerik denetimi: ${problems.length} şüpheli HTML bulundu (derleme durduruldu):\n${problems.slice(0, 20).join("\n")}`);
  process.exit(1);
}
console.log("İçerik denetimi: sorun yok.");

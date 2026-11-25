import { NextResponse } from "next/server";
import { clientIp, notifyLead } from "@/lib/phone-otp";
import { allow } from "@/lib/rate-limit";

// İletişim ve teklif formu. Girdiler uzunluk ve biçimle sınırlanır; bot tuzağı (website alanı) dolu gelirse sessizce yutulur.
//  kind "offer" | "contact": talep e-postası (teklifte en fazla 3 dosya eki: plan, brif, görsel)
//  kind "meeting": teklif sonrası seçilen görüşme saati
const LIMITS: Record<string, number> = {
  name: 120,
  company: 160,
  email: 160,
  phone: 30,
  service: 120,
  area: 20,
  location: 120,
  date: 40,
  message: 3000,
  slot: 80,
};

// Ekler: toplam en fazla 3 MB (Vercel istek sınırının altında kalsın diye), yalnızca plan ve görsel türleri
const FILE_MAX_TOTAL = 3 * 1024 * 1024;
const FILE_EXT = /\.(pdf|jpe?g|png|webp|dwg|dxf|zip)$/i;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";

function parseFiles(raw: unknown): { filename: string; content: string }[] | null {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length > 3) return null;
  let total = 0;
  const out: { filename: string; content: string }[] = [];
  for (const f of raw) {
    const name = clean((f as { name?: unknown })?.name, 120).replace(/[\\/:*?"<>|]+/g, "_");
    const data = typeof (f as { data?: unknown })?.data === "string" ? ((f as { data: string }).data) : "";
    if (!FILE_EXT.test(name) || !/^[A-Za-z0-9+/=]+$/.test(data)) return null;
    total += Math.floor((data.length * 3) / 4);
    if (total > FILE_MAX_TOTAL) return null;
    out.push({ filename: name, content: data });
  }
  return out;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!allow(`contact:${ip}`, 8, 60 * 60 * 1000) || !allow("contact:global", 200, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (clean(body.website, 200)) return NextResponse.json({ ok: true }); // bot tuzağı

  const f = Object.fromEntries(Object.entries(LIMITS).map(([k, max]) => [k, clean(body[k], max)]));
  const kind = body.kind === "offer" ? "offer" : body.kind === "meeting" ? "meeting" : "contact";
  const lang = ["tr", "en", "de", "it", "fr"].includes(body.lang) ? body.lang : "tr";
  const emailOk = !f.email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email);
  const phoneOk = !f.phone || /^[+()\d\s-]{7,30}$/.test(f.phone);

  // Görüşme saati: teklif gönderildikten sonra seçilir
  if (kind === "meeting") {
    if (!f.name || !f.phone || !phoneOk || !f.slot) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const text = [`Görüşme isteği (${lang.toUpperCase()})`, "", `Ad: ${f.name}`, `Telefon: ${f.phone}`, `Tercih edilen zaman: ${f.slot}`, f.message && `\n${f.message}`].filter(Boolean).join("\n");
    await notifyLead(`Görüşme isteği · ${f.name} · ${f.slot}`, text, `Görüşme · ${lang}`);
    return NextResponse.json({ ok: true });
  }

  const files = kind === "offer" ? parseFiles(body.files) : [];
  if (!files) return NextResponse.json({ error: "files" }, { status: 400 });
  if (!f.name || (!f.email && !f.phone) || !emailOk || !phoneOk || !f.message) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const title = kind === "offer" ? "Teklif talebi" : "İletişim mesajı";
  const lines = [
    `${title} (${lang.toUpperCase()})`,
    "",
    `Ad: ${f.name}`,
    f.company && `Firma: ${f.company}`,
    f.email && `E-posta: ${f.email}`,
    f.phone && `Telefon: ${f.phone}`,
    f.service && `Hizmet: ${f.service}`,
    f.area && `Alan: ${f.area} m²`,
    f.location && `Konum: ${f.location}`,
    f.date && `Tarih: ${f.date}`,
    "",
    f.message,
    files.length ? `\nEkler: ${files.map((x) => x.filename).join(", ")}` : "",
  ].filter((l): l is string => typeof l === "string");
  await notifyLead(`${title} · ${f.name}${f.company ? ` · ${f.company}` : ""}`, lines.join("\n").replace(/\n{3,}/g, "\n\n"), `${title} · ${lang}`, files);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { LeadError, clientIp, notifyLead } from "@/lib/phone-otp";
import { allow } from "@/lib/rate-limit";
import { tooLarge } from "@/lib/request-guard";
import { verifyHuman } from "@/lib/turnstile";

// İletişim ve teklif formu. Girdiler uzunluk ve biçimle sınırlanır; bot tuzağı (website alanı) dolu gelirse sessizce yutulur.
//  kind "offer" | "contact": talep e-postası (teklifte en fazla 3 dosya eki: plan, brif, görsel)
//  kind "meeting": teklif sonrası seçilen görüşme saati
// Kişisel veri iletilmeden önce aydınlatma metninin gösterildiği (notice) ya da açık rıza (consent) alındığı doğrulanır.
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
const NOTICE_VERSION = "2026-11";

// Ekler: toplam en fazla 3 MB (Vercel istek sınırının altında kalsın diye), yalnızca plan ve görsel türleri
const FILE_MAX_TOTAL = 3 * 1024 * 1024;
const BODY_MAX = 4_400_000;
// Uzantı ve dosyanın gerçek içeriği (ilk baytlar) eşleşmeli
const MAGIC: Record<string, (b: Buffer) => boolean> = {
  pdf: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-",
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  webp: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  dwg: (b) => b.subarray(0, 4).toString("latin1") === "AC10",
  dxf: (b) => /^(\s*0\s*\r?\n\s*SECTION|\s*999\s*\r?\n|AutoCAD Binary DXF)/.test(b.subarray(0, 64).toString("latin1")),
  zip: (b) => b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
};

// Tek satırlık alanlar: kontrol karakterleri ve satır sonları boşluğa çevrilir (e-posta konusuna taşınmasın)
const line = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F20282029]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "");
// Mesaj: satır sonları korunur
const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max) : "");

function parseFiles(raw: unknown): { filename: string; content: string }[] | null {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length > 3) return null;
  let total = 0;
  const out: { filename: string; content: string }[] = [];
  for (const [i, f] of raw.entries()) {
    const name = line((f as { name?: unknown })?.name, 120);
    const data = typeof (f as { data?: unknown })?.data === "string" ? (f as { data: string }).data : "";
    const ext = name.toLowerCase().match(/\.(pdf|jpe?g|png|webp|dwg|dxf|zip)$/)?.[1]?.replace("jpeg", "jpg");
    if (!ext || !/^[A-Za-z0-9+/=]+$/.test(data)) return null;
    total += Math.floor((data.length * 3) / 4);
    if (total > FILE_MAX_TOTAL) return null;
    if (!MAGIC[ext](Buffer.from(data.slice(0, 96), "base64"))) return null;
    // Dosya adı sunucuda verilir: yön değiştiren karakterlerle sahte uzantı gösterilemez
    out.push({ filename: `ek-${i + 1}.${ext}`, content: data });
  }
  return out;
}

export async function POST(req: Request) {
  const big = tooLarge(req, BODY_MAX);
  if (big) return big;
  const ip = clientIp(req);
  if (!(await allow(`contact:${ip}`, 8, 60 * 60 * 1000)) || !(await allow("contact:global", 200, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (line(body.website, 200)) return NextResponse.json({ ok: true }); // bot tuzağı
  if (!(await verifyHuman(body.turnstile, ip))) return NextResponse.json({ error: "bot" }, { status: 403 });

  const f = Object.fromEntries(Object.entries(LIMITS).map(([k, max]) => [k, k === "message" ? text(body[k], max) : line(body[k], max)]));
  const kind = body.kind === "offer" ? "offer" : body.kind === "meeting" ? "meeting" : "contact";
  const lang = ["tr", "en", "de", "it", "fr"].includes(body.lang) ? body.lang : "tr";
  const emailOk = !f.email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email);
  const phoneOk = !f.phone || /^[+()\d\s-]{7,30}$/.test(f.phone);
  // Aydınlatma metni gösterildi ya da açık rıza verildi (formlar bunu her zaman gönderir)
  const consent = body.consent === true;
  if (!consent && body.notice !== true) return NextResponse.json({ error: "consent" }, { status: 400 });
  const privacy = `Aydınlatma metni (${NOTICE_VERSION}) gösterildi${consent ? "; açık rıza verildi" : ""} · ${new Date().toISOString()}`;

  try {
    // Görüşme saati: teklif gönderildikten sonra seçilir
    if (kind === "meeting") {
      if (!f.name || !f.phone || !phoneOk || !f.slot) return NextResponse.json({ error: "invalid" }, { status: 400 });
      const lines = [`Görüşme isteği (${lang.toUpperCase()})`, "", `Ad: ${f.name}`, `Telefon: ${f.phone}`, `Tercih edilen zaman: ${f.slot}`, f.message && `\n${f.message}`, "", privacy];
      await notifyLead(`Görüşme isteği · ${f.name} · ${f.slot}`, lines.filter(Boolean).join("\n"), `Görüşme · ${lang}`);
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
      files.length ? `\nEkler (ziyaretçinin yüklediği dosyalar): ${files.map((x) => x.filename).join(", ")}` : "",
      "",
      privacy,
    ].filter((l): l is string => typeof l === "string");
    await notifyLead(`${title} · ${f.name}${f.company ? ` · ${f.company}` : ""}`, lines.join("\n").replace(/\n{3,}/g, "\n\n"), `${title} · ${lang}`, files);
    return NextResponse.json({ ok: true });
  } catch (e) {
    // E-posta gitmediyse ziyaretçiye söylenir; form telefon ve WhatsApp seçeneğini gösterir
    if (e instanceof LeadError) return NextResponse.json({ error: "mail" }, { status: 502 });
    throw e;
  }
}

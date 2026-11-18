import { NextResponse } from "next/server";
import { clientIp, notifyLead } from "@/lib/phone-otp";
import { allow } from "@/lib/rate-limit";

// İletişim ve teklif formu. Girdiler uzunluk ve biçimle sınırlanır; bot tuzağı (website alanı) dolu gelirse sessizce yutulur.
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
};

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!allow(`contact:${ip}`, 5, 60 * 60 * 1000) || !allow("contact:global", 200, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (clean(body.website, 200)) return NextResponse.json({ ok: true }); // bot tuzağı

  const f = Object.fromEntries(Object.entries(LIMITS).map(([k, max]) => [k, clean(body[k], max)]));
  const kind = body.kind === "offer" ? "offer" : "contact";
  const lang = ["tr", "en", "de", "it", "fr"].includes(body.lang) ? body.lang : "tr";
  const emailOk = !f.email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email);
  const phoneOk = !f.phone || /^[+()\d\s-]{7,30}$/.test(f.phone);
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
  ].filter((l): l is string => typeof l === "string");
  await notifyLead(`${title} · ${f.name}${f.company ? ` · ${f.company}` : ""}`, lines.join("\n").replace(/\n{3,}/g, "\n\n"), `${title} · ${lang}`);
  return NextResponse.json({ ok: true });
}

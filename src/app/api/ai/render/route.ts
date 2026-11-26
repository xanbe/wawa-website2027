import { NextResponse } from "next/server";
import sharp from "sharp";
import { LeadError, checkCode, checkPass, clientIp, issuePass, maskPhone, notifyLead } from "@/lib/phone-otp";
import { allow, hit, once, peek } from "@/lib/rate-limit";
import { tooLarge } from "@/lib/request-guard";
import { verifyHuman } from "@/lib/turnstile";
import { AI_CONFIGURED, buildPrompt, parseBrief, renderImage } from "@/lib/ai-render";
import { AI_REFERENCE_SET } from "@/lib/ai-references";
import { dataUrl, makePreview, seal, sealContext, toJpeg, unseal } from "@/lib/ai-seal";
import { COPY, OPEN_SIDES, type StudioBrief } from "@/components/ai/studio-data";

// Yapay zeka stüdyosu: ölçüler + 3D taslak → gerçekçi görsel.
//  op "preview": iletişim bilgisi istemez. Filigranlı küçük önizleme + şifreli ("mühürlü") tam görsel döner.
//                Bot doğrulaması, IP başına günde 2 ve site geneli günlük bütçe.
//  op "unlock" : telefon SMS ile doğrulanınca mühür açılır, tam görsel döner ve talep (görsel + taslak) ekibe e-postayla gider.
//  Doğrulanmış kişi (geçiş belirteci) yeniden ürettiğinde görsel doğrudan tam çözünürlükte döner ve yine ekibe gider.
export const maxDuration = 120;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MAX_SKETCH = 2_000_000; // base64 karakter (1600 px JPEG taslak bunun çok altında kalır)
const BODY_MAX = 4_400_000;
// Site geneli günlük ücretli üretim sınırı (Google Cloud'daki bütçe sınırına ek güvence)
const GLOBAL_DAILY = 120;
// Yapay zeka anahtarı yokken (yalnızca geliştirmede) akış denenebilsin diye taslağın kendisi görsel yerine kullanılır
const TEST_MODE = !AI_CONFIGURED && process.env.NODE_ENV !== "production";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001F]/g, " ").trim().slice(0, max) : "");
const fail = (error: string, status: number, extra: Record<string, unknown> = {}) => NextResponse.json({ error, ...extra }, { status });

async function generate(brief: StudioBrief, sketch: { mimeType: string; data: string }): Promise<Buffer | null> {
  if (TEST_MODE) return Buffer.from(sketch.data, "base64");
  if (!AI_CONFIGURED) return null;
  const url = await renderImage(buildPrompt(brief, Boolean(brief.refSrc)), sketch, brief.refSrc).catch(() => null);
  const m = url?.match(/^data:image\/[a-z]+;base64,(.+)$/);
  return m ? Buffer.from(m[1], "base64") : null;
}

// Taslak gerçekten makul boyutta bir görsel olmalı (keyfi büyük ya da bozuk dosya modele gönderilmez)
async function validSketch(data: string) {
  const meta = await sharp(Buffer.from(data, "base64"))
    .metadata()
    .catch(() => null);
  return Boolean(meta?.width && meta.height && meta.width >= 200 && meta.height >= 150 && meta.width <= 2048 && meta.height <= 2048 && (meta.format === "jpeg" || meta.format === "png"));
}

// Site geneli bütçe: önce okunur, ücretli çağrıdan hemen önce harcanır (reddedilen istekler bütçeyi tüketmez)
const budgetLeft = async () => (await peek("ai:global")) < GLOBAL_DAILY;
const spendBudget = async () => (await hit("ai:global", DAY)) <= GLOBAL_DAILY;

function summaryOf(brief: StudioBrief) {
  const C = COPY.tr;
  return brief.mode === "stand"
    ? `Fuar standı · ${brief.stand.w} × ${brief.stand.d} m (${Math.round(brief.stand.w * brief.stand.d * 10) / 10} m²), h ${brief.stand.h} m · ${C.standTypes[brief.stand.type].title} (${OPEN_SIDES[brief.stand.type]} açık cephe)`
    : `İç mimari · ${C.spaces[brief.room.space]} · ${brief.room.w} × ${brief.room.l} m (${Math.round(brief.room.w * brief.room.l * 10) / 10} m²), tavan ${brief.room.h} m`;
}

// Ekibe bildirim: kim, ne, hangi ölçüde; tam görsel ve gönderilen ölçülü taslak ekli
async function notifyTeam(o: { lang: string; name: string; phone: string; email: string; brief: StudioBrief; image: Buffer | null; sketch: { mimeType: string; data: string } | null }) {
  const C = COPY.tr;
  const { brief } = o;
  const summary = summaryOf(brief);
  const lines = [
    `Yapay zeka stüdyosu (${o.lang.toUpperCase()})`,
    "",
    `Ad soyad: ${o.name}`,
    `Telefon: ${o.phone} (SMS ile doğrulandı)`,
    o.email ? `E-posta: ${o.email}` : "",
    "",
    summary,
    brief.mode === "stand"
      ? [`Sektör: ${brief.stand.sector || "-"}`, `Marka rengi: ${brief.stand.color}`, `Logo: ${brief.stand.logo ? "yüklendi (taslakta)" : "-"}`].join("\n")
      : [`Pencere: ${C.walls[brief.room.window]}`, `Kapı: ${C.walls[brief.room.door]}`, `Renk tonu: ${C.tones[brief.room.tone]}`].join("\n"),
    `Stil: ${brief.styles.map((s) => C.styles[s]).join(", ") || "-"}`,
    brief.notes ? `Not: ${brief.notes}` : "",
    "",
    o.image ? (TEST_MODE ? "Test modu: görsel yerine taslak eklendi." : "Üretilen görsel ekte.") : AI_CONFIGURED ? "Görsel üretilemedi (model hatası)." : "Görsel üretimi kapalı (GEMINI_API_KEY yok).",
    `Açık rıza verildi (aydınlatma metni onay kutusu) · ${new Date().toISOString()}`,
  ];
  const files: { filename: string; content: string }[] = [];
  if (o.image) files.push({ filename: "tasarim.jpg", content: o.image.toString("base64") });
  if (o.sketch) files.push({ filename: `taslak.${o.sketch.mimeType === "image/png" ? "png" : "jpg"}`, content: o.sketch.data });
  try {
    await notifyLead(`Yapay zeka tasarım · ${o.name} · ${summary}`, lines.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n"), `ai · ${maskPhone(o.phone)} · ${brief.mode}`, files);
  } catch (e) {
    // Ziyaretçi görselini yine alır; gönderilemeyen bildirim sunucu günlüğünde (notifyLead)
    if (!(e instanceof LeadError)) throw e;
  }
}

export async function POST(req: Request) {
  if (tooLarge(req, BODY_MAX)) return fail("invalid", 413);
  const ip = clientIp(req);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("invalid", 400);
  if (clean(body.website, 100)) return NextResponse.json({ ok: true, preview: null }); // bot tuzağı

  const lang = body.lang === "en" || body.lang === "de" ? body.lang : "tr";
  const brief = parseBrief(body.brief, AI_REFERENCE_SET);
  if (!brief) return fail("invalid", 400);
  const sketchUrl = typeof body.sketch === "string" ? body.sketch : "";
  const m = sketchUrl.match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/);
  const sketch = m && m[2].length <= MAX_SKETCH && (await validSketch(m[2])) ? { mimeType: m[1], data: m[2] } : null;
  // Mühür bu brife ve bu taslağa bağlıdır: başka bir istekle açılamaz
  const context = sealContext(brief, sketch?.data ?? "");

  // Doğrulama: SMS kodu ya da daha önce verilmiş geçiş belirteci
  const verify = async () => {
    const viaPass = typeof body.pass === "string" ? checkPass(body.pass.slice(0, 400)) : null;
    if (viaPass) return { ok: true as const, phone: viaPass };
    if (!(await allow(`ai:verify:${ip}`, 20, HOUR))) return { ok: false as const, reason: "Çok fazla deneme yapıldı, biraz sonra yeniden deneyin." };
    const check = await checkCode(clean(body.token, 400), clean(body.code, 8));
    return check.ok ? { ok: true as const, phone: check.phone } : { ok: false as const, reason: check.reason };
  };
  const contact = () => {
    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const ok = Boolean(name) && body.consent === true && (!email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
    return { ok, name, email };
  };

  // ------------------------------------------------ Mührü aç: tam görsel + ekibe bildirim
  if (body.op === "unlock") {
    if (!sketch) return fail("expired", 400);
    const c = contact();
    if (!c.ok) return fail("invalid", 400);
    const v = await verify();
    if (!v.ok) return fail("code", 400, { message: v.reason });
    const opened = unseal(clean(body.sealed, 4_000_000), context);
    if (!opened) return fail("expired", 400);
    if (!(await allow(`ai:unlock:${v.phone}`, 8, DAY))) return fail("too_many", 429);
    // Mühür tek kullanımlıktır
    if (!(await once(`ai:seal:${opened.id}`, opened.exp - Date.now() + 60_000))) return fail("expired", 400);
    // Geçiş belirteci yalnızca tüm kontroller geçtikten sonra verilir
    const pass = issuePass(v.phone);
    await notifyTeam({ lang, name: c.name, phone: `0${v.phone}`, email: c.email, brief, image: opened.image, sketch });
    return NextResponse.json({ ok: true, image: dataUrl(opened.image), pass });
  }

  // ------------------------------------------------ Üretim
  if (!sketch) return fail("invalid", 400);

  // Doğrulanmış kişi (geçiş ya da SMS kodu): doğrudan tam görsel, ekibe bildirim
  if (typeof body.pass === "string" || clean(body.code, 8)) {
    const c = contact();
    if (!c.ok) return fail("invalid", 400);
    const v = await verify();
    if (!v.ok) return fail("code", 400, { message: v.reason });
    const pass = issuePass(v.phone);
    if (!(await allow(`ai:phone:${v.phone}`, 4, DAY)) || !(await allow(`ai:ip:${ip}`, 6, HOUR))) return fail("too_many", 429, { pass });
    if (!(await budgetLeft()) || !(await spendBudget())) return fail("too_many", 429, { pass });
    const raw = await generate(brief, sketch);
    const image = raw ? await toJpeg(raw) : null;
    await notifyTeam({ lang, name: c.name, phone: `0${v.phone}`, email: c.email, brief, image, sketch });
    return NextResponse.json({ ok: true, image: image ? dataUrl(image) : null, configured: AI_CONFIGURED, test: TEST_MODE, pass });
  }

  // Herkese açık önizleme: bot doğrulaması, IP başına günde 2, sonra site geneli bütçe
  if (!(await verifyHuman(body.turnstile, ip))) return fail("bot", 403);
  if (!(await budgetLeft())) return fail("too_many", 429);
  if (!(await allow(`ai:preview:${ip}`, 2, DAY))) return fail("too_many_preview", 429);
  if (!(await spendBudget())) return fail("too_many", 429);
  const raw = await generate(brief, sketch);
  if (!raw) return NextResponse.json({ ok: true, preview: null, sealed: null, configured: AI_CONFIGURED });
  const full = await toJpeg(raw);
  const preview = await makePreview(full);
  return NextResponse.json({ ok: true, preview: dataUrl(preview), sealed: seal(full, context), configured: AI_CONFIGURED, test: TEST_MODE });
}

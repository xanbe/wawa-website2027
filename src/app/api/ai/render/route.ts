import { NextResponse } from "next/server";
import { checkCode, checkPass, clientIp, issuePass, maskPhone, notifyLead } from "@/lib/phone-otp";
import { allow } from "@/lib/rate-limit";
import { AI_CONFIGURED, buildPrompt, parseBrief, renderImage } from "@/lib/ai-render";
import { AI_REFERENCE_SET } from "@/lib/ai-references";
import { dataUrl, makePreview, seal, toJpeg, unseal } from "@/lib/ai-seal";
import { COPY, OPEN_SIDES, type StudioBrief } from "@/components/ai/studio-data";

// Yapay zeka stüdyosu: ölçüler + 3D taslak → gerçekçi görsel.
//  op "preview": iletişim bilgisi istemez. Filigranlı küçük önizleme + şifreli ("mühürlü") tam görsel döner. IP başına günde 2.
//  op "unlock" : telefon SMS ile doğrulanınca mühür açılır, tam görsel döner ve talep (görsel + taslak) ekibe e-postayla gider.
//  Doğrulanmış kişi (geçiş belirteci) yeniden ürettiğinde görsel doğrudan tam çözünürlükte döner ve yine ekibe gider.
export const maxDuration = 120;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MAX_SKETCH = 3_000_000; // base64 karakter
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
  ];
  const files: { filename: string; content: string }[] = [];
  if (o.image) files.push({ filename: "tasarim.jpg", content: o.image.toString("base64") });
  if (o.sketch) files.push({ filename: `taslak.${o.sketch.mimeType === "image/png" ? "png" : "jpg"}`, content: o.sketch.data });
  await notifyLead(`Yapay zeka tasarım · ${o.name} · ${summary}`, lines.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n"), `ai · ${maskPhone(o.phone)} · ${brief.mode}`, files);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("invalid", 400);
  if (clean(body.website, 100)) return NextResponse.json({ ok: true, preview: null }); // bot tuzağı

  const lang = body.lang === "en" || body.lang === "de" ? body.lang : "tr";
  const brief = parseBrief(body.brief, AI_REFERENCE_SET);
  if (!brief) return fail("invalid", 400);
  const sketchUrl = typeof body.sketch === "string" ? body.sketch : "";
  const m = sketchUrl.match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/);
  const sketch = m && m[2].length <= MAX_SKETCH ? { mimeType: m[1], data: m[2] } : null;

  // Doğrulama: SMS kodu ya da daha önce verilmiş geçiş belirteci
  const verify = () => {
    const viaPass = typeof body.pass === "string" ? checkPass(body.pass) : null;
    if (viaPass) return { ok: true as const, phone: viaPass };
    const check = checkCode(clean(body.token, 400), clean(body.code, 8));
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
    const v = verify();
    if (!v.ok) return fail("code", 400, { message: v.reason });
    const pass = issuePass(v.phone);
    const c = contact();
    if (!c.ok) return fail("invalid", 400, { pass });
    const image = unseal(clean(body.sealed, 8_000_000));
    if (!image) return fail("expired", 400, { pass });
    if (!allow(`ai:unlock:${v.phone}`, 8, DAY)) return fail("too_many", 429, { pass });
    await notifyTeam({ lang, name: c.name, phone: `0${v.phone}`, email: c.email, brief, image, sketch });
    return NextResponse.json({ ok: true, image: dataUrl(image), pass });
  }

  // ------------------------------------------------ Üretim
  if (!sketch) return fail("invalid", 400);
  if (!allow("ai:global", 120, DAY)) return fail("too_many", 429);
  // Doğrulama bilgisi geldiyse (geçiş ya da SMS kodu) doğrulanmış yoldan gidilir
  let passPhone: string | null = null;
  if (typeof body.pass === "string" || clean(body.code, 8)) {
    const v = verify();
    if (!v.ok) return fail("code", 400, { message: v.reason });
    passPhone = v.phone;
  }

  // Doğrulanmış kişi: doğrudan tam görsel, ekibe bildirim
  if (passPhone) {
    const c = contact();
    if (!c.ok) return fail("invalid", 400);
    if (!allow(`ai:phone:${passPhone}`, 4, DAY) || !allow(`ai:ip:${ip}`, 6, HOUR)) return fail("too_many", 429, { pass: body.pass });
    const raw = await generate(brief, sketch);
    const image = raw ? await toJpeg(raw) : null;
    await notifyTeam({ lang, name: c.name, phone: `0${passPhone}`, email: c.email, brief, image, sketch });
    return NextResponse.json({ ok: true, image: image ? dataUrl(image) : null, configured: AI_CONFIGURED, test: TEST_MODE, pass: issuePass(passPhone) });
  }

  // Herkese açık önizleme: IP başına günde 2
  if (!allow(`ai:preview:${ip}`, 2, DAY)) return fail("too_many_preview", 429);
  const raw = await generate(brief, sketch);
  if (!raw) return NextResponse.json({ ok: true, preview: null, sealed: null, configured: AI_CONFIGURED });
  const full = await toJpeg(raw);
  const preview = await makePreview(full);
  return NextResponse.json({ ok: true, preview: dataUrl(preview), sealed: seal(full), configured: AI_CONFIGURED, test: TEST_MODE });
}

import { NextResponse } from "next/server";
import { checkCode, checkPass, clientIp, issuePass, maskPhone, notifyLead } from "@/lib/phone-otp";
import { allow } from "@/lib/rate-limit";
import { AI_CONFIGURED, buildPrompt, parseBrief, renderImage } from "@/lib/ai-render";
import { AI_REFERENCE_SET } from "@/lib/ai-references";
import { COPY, OPEN_SIDES } from "@/components/ai/studio-data";

// Yapay zeka stüdyosu: ölçüler + 3D taslak → gerçekçi görsel. Her talep ekibe bildirilir.
// Maliyetli bir çağrı olduğu için IP, telefon ve günlük toplam sınırı vardır.
export const maxDuration = 120;

const HOUR = 60 * 60 * 1000;
const MAX_SKETCH = 3_000_000; // base64 karakter

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001F]/g, " ").trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!allow(`ai:ip:${ip}`, 4, HOUR) || !allow("ai:global", 80, 24 * HOUR)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (clean(body.website, 100)) return NextResponse.json({ ok: true, image: null }); // bot tuzağı

  const name = clean(body.name, 120);
  // Telefon istemciden alınmaz: SMS koduyla (ilk üretim) ya da doğrulama geçişiyle (yeniden üretim) kanıtlanan numara kullanılır
  let verified = typeof body.pass === "string" ? checkPass(body.pass) : null;
  if (!verified) {
    const check = checkCode(clean(body.token, 400), clean(body.code, 8));
    if (!check.ok) return NextResponse.json({ error: "code", message: check.reason }, { status: 400 });
    verified = check.phone;
  }
  const pass = issuePass(verified);
  const phone = `0${verified}`;
  const email = clean(body.email, 160);
  const lang = body.lang === "en" || body.lang === "de" ? body.lang : "tr";
  const brief = parseBrief(body.brief, AI_REFERENCE_SET);
  const sketchUrl = typeof body.sketch === "string" ? body.sketch : "";
  const sketch = sketchUrl.match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/);
  if (!name || phone.length < 10 || phone.length > 16 || body.consent !== true || !brief || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) {
    return NextResponse.json({ error: "invalid", pass }, { status: 400 });
  }
  if (!sketch || sketch[2].length > MAX_SKETCH) return NextResponse.json({ error: "invalid", pass }, { status: 400 });
  if (!allow(`ai:phone:${phone}`, 4, 24 * HOUR)) return NextResponse.json({ error: "too_many", pass }, { status: 429 });

  const prompt = buildPrompt(brief, Boolean(brief.refSrc));
  const image = AI_CONFIGURED ? await renderImage(prompt, { mimeType: sketch[1], data: sketch[2] }, brief.refSrc).catch(() => null) : null;

  // Ekibe bildirim: kim, ne, hangi ölçüde
  const C = COPY.tr;
  const summary =
    brief.mode === "stand"
      ? `Fuar standı · ${brief.stand.w} × ${brief.stand.d} m (${Math.round(brief.stand.w * brief.stand.d * 10) / 10} m²), h ${brief.stand.h} m · ${C.standTypes[brief.stand.type].title} (${OPEN_SIDES[brief.stand.type]} açık cephe)`
      : `İç mimari · ${C.spaces[brief.room.space]} · ${brief.room.w} × ${brief.room.l} m (${Math.round(brief.room.w * brief.room.l * 10) / 10} m²), tavan ${brief.room.h} m`;
  const lines = [
    `Yapay zeka stüdyosu (${lang.toUpperCase()})`,
    "",
    `Ad soyad: ${name}`,
    `Telefon: ${phone}`,
    email ? `E-posta: ${email}` : "",
    "",
    summary,
    brief.mode === "stand"
      ? [
          `Elemanlar: ${brief.stand.elements.map((e) => C.elements[e]).join(", ") || "-"}`,
          `Sektör: ${brief.stand.sector || "-"}`,
          `Marka rengi: ${brief.stand.color}`,
        ].join("\n")
      : [`Pencere: ${C.walls[brief.room.window]}`, `Kapı: ${C.walls[brief.room.door]}`, `Renk tonu: ${C.tones[brief.room.tone]}`].join("\n"),
    `Stil: ${brief.styles.map((s) => C.styles[s]).join(", ") || "-"}`,
    brief.refSrc ? `Referans proje görseli: ${brief.refSrc}` : "",
    brief.notes ? `Not: ${brief.notes}` : "",
    "",
    image ? "Görsel üretildi." : AI_CONFIGURED ? "Görsel üretilemedi (model hatası)." : "Görsel üretimi kapalı (GEMINI_API_KEY yok).",
  ];
  // Üretilen görsel ve gönderilen ölçülü taslak e-postaya eklenir: ekip müşterinin gördüğünü aynen görür
  const files: { filename: string; content: string }[] = [];
  const out = image?.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
  if (out) files.push({ filename: `tasarim.${out[1] === "jpeg" ? "jpg" : out[1]}`, content: out[2] });
  files.push({ filename: `taslak.${sketch[1] === "image/png" ? "png" : "jpg"}`, content: sketch[2] });
  await notifyLead(`Yapay zeka tasarım · ${name} · ${summary}`, lines.filter((l) => l !== null).join("\n").replace(/\n{3,}/g, "\n\n"), `ai · ${maskPhone(phone)} · ${brief.mode}`, files);

  return NextResponse.json({ ok: true, image, configured: AI_CONFIGURED, pass });
}

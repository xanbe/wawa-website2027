import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/fee";
import { OTP_TEST_MODE, SMS_CONFIGURED, canSend, clientIp, issueCode, maskPhone, sendSms } from "@/lib/phone-otp";

// Telefon numarasına doğrulama kodu gönderir, kodu taşıyan imzalı belirteci döndürür
export async function POST(req: Request) {
  // Canlıda SMS sağlayıcısı tanımlı değilse doğrulama kapalıdır (test koduyla geçilemez)
  if (!OTP_TEST_MODE && !SMS_CONFIGURED) {
    return NextResponse.json({ error: "Doğrulama şu anda kullanılamıyor, lütfen bizi arayın." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const phone = normalizePhone(String(body?.phone ?? ""));
  if (!phone) return NextResponse.json({ error: "Geçerli bir cep telefonu numarası girin." }, { status: 400 });

  const allowed = canSend(phone, clientIp(req));
  if (!allowed.ok) return NextResponse.json({ error: allowed.reason }, { status: 429 });

  const { code, token } = issueCode(phone);
  try {
    await sendSms(phone, `WAWA Interiors doğrulama kodunuz: ${code}`);
  } catch (e) {
    console.error(`[otp] ${maskPhone(phone)}`, e instanceof Error ? e.message : "bilinmeyen hata");
    return NextResponse.json({ error: "Kod gönderilemedi, lütfen yeniden deneyin." }, { status: 502 });
  }
  // testMode yalnızca geliştirmede true olur; canlıda istemciye hiçbir zaman test kodu ipucu gitmez
  return NextResponse.json({ token, testMode: OTP_TEST_MODE });
}

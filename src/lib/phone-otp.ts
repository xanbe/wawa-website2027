import { createHmac, hkdfSync, randomInt, timingSafeEqual } from "node:crypto";
import { allow, hit, once, peek } from "@/lib/rate-limit";
import { clientIp as ipOf, redact } from "@/lib/request-guard";

// Telefon doğrulaması durumsuz çalışır: kod sunucuda saklanmaz, imzalı bir belirtece gömülür.
// Belirteç = yük + "." + HMAC(yük) + "." + HMAC(yük + kod)
// İlk imza yükün sunucudan çıktığını kanıtlar; sahte yükler deneme sayacına hiç dokunmaz.

const TTL_MS = 10 * 60 * 1000;
const CODE_LEN = 6;
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
// Gönderim sınırları (ortak depoda tutulur; bkz. rate-limit.ts)
const LIMITS = {
  phone15m: 3, // aynı numaraya 15 dakikada
  phoneDay: 5, // aynı numaraya günde
  ip: 5, // aynı IP'den saatte
  globalHour: 60, // tüm site, saatte
  globalDay: 300, // tüm site, günde
};
const MAX_FAILS = 5; // numara başına 30 dakikada hatalı kod denemesi

// Test modu yalnızca geliştirmede: SMS gitmez, kod sabittir. Canlıda SMS sağlayıcısı yoksa kod gönderilmez.
const IS_PRODUCTION = process.env.NODE_ENV === "production";
// SMS sağlayıcısı: önce Verimor (wawamobilya sitesiyle aynı hesap ve aynı ortam değişkenleri), yoksa Netgsm
const VERIMOR_READY = Boolean(process.env.VERIMOR_SMS_USERNAME && process.env.VERIMOR_SMS_PASSWORD);
const NETGSM_READY = Boolean(process.env.NETGSM_USERCODE && process.env.NETGSM_PASSWORD);
export const SMS_CONFIGURED = VERIMOR_READY || NETGSM_READY;
export const OTP_TEST_MODE = !IS_PRODUCTION && !SMS_CONFIGURED;
const TEST_CODE = "123456";

// Ana gizli anahtardan amaca özel anahtarlar türetilir (kod, geçiş belirteci ve görsel mührü birbirinin yerine geçemez)
function master() {
  const s = process.env.OTP_SECRET;
  if (s) return s;
  if (!OTP_TEST_MODE) throw new Error("OTP_SECRET tanımlı değil");
  return "wawa-otp-test-secret";
}
const keys = new Map<string, Buffer>();
export function purposeKey(info: string) {
  let k = keys.get(info);
  if (!k) {
    k = Buffer.from(hkdfSync("sha256", master(), "wawa", info, 32));
    keys.set(info, k);
  }
  return k;
}
const sign = (purpose: string, data: string) => createHmac("sha256", purposeKey(purpose)).update(data).digest("base64url");
const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Günlüklerde telefonun yalnızca son dört hanesi görünür (KVKK)
export const maskPhone = (phone: string) => `05•• ••• ${phone.slice(-4)}`;

export async function canSend(phone: string, ip: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const busy = { ok: false as const, reason: "Şu anda kod gönderilemiyor, lütfen biraz sonra yeniden deneyin." };
  const many = { ok: false as const, reason: "Çok fazla kod istendi, biraz sonra yeniden deneyin." };
  // Önce kişiye özel sınırlar: reddedilen istek site geneli kotayı tüketmez
  if (!(await allow(`otp:ip:${ip}`, LIMITS.ip, HOUR))) return many;
  if (!(await allow(`otp:phone:${phone}`, LIMITS.phone15m, 15 * MIN))) return many;
  if (!(await allow(`otp:phoneday:${phone}`, LIMITS.phoneDay, DAY))) return many;
  if (!(await allow("otp:global:hour", LIMITS.globalHour, HOUR))) return busy;
  if (!(await allow("otp:global:day", LIMITS.globalDay, DAY))) {
    console.error("[otp] günlük SMS üst sınırına ulaşıldı");
    return busy;
  }
  return { ok: true };
}

export function issueCode(phone: string) {
  const code = OTP_TEST_MODE ? TEST_CODE : String(randomInt(0, 10 ** CODE_LEN)).padStart(CODE_LEN, "0");
  const payload = Buffer.from(JSON.stringify({ p: phone, e: Date.now() + TTL_MS })).toString("base64url");
  return { code, token: `${payload}.${sign("otp-p", payload)}.${sign("otp-c", `${payload}:${code}`)}` };
}

export async function checkCode(token: string, code: string): Promise<{ ok: true; phone: string } | { ok: false; reason: string }> {
  const expired = { ok: false as const, reason: "Kodun süresi doldu, yeniden isteyin." };
  const [payload, sigP, sigC, extra] = token.split(".");
  if (!payload || !sigP || !sigC || extra !== undefined || payload.length > 200 || sigP.length > 64 || sigC.length > 64) return expired;
  // Yük sunucunun imzasını taşımıyorsa hiçbir sayaca dokunulmaz
  if (!same(sigP, sign("otp-p", payload))) return expired;

  let data: { p?: string; e?: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return expired;
  }
  const now = Date.now();
  if (typeof data.p !== "string" || typeof data.e !== "number" || data.e < now || data.e > now + TTL_MS) return expired;
  const phone = data.p;
  if (!new RegExp(`^\\d{${CODE_LEN}}$`).test(code)) return { ok: false, reason: "Kod hatalı." };

  // Hatalı denemeler numara başına sayılır (her yeni kod isteğinde sıfırlanmaz)
  if ((await peek(`otp:fail:${phone}`)) >= MAX_FAILS) return { ok: false, reason: "Çok fazla deneme yapıldı, biraz sonra kodu yeniden isteyin." };
  if (!same(sigC, sign("otp-c", `${payload}:${code}`))) {
    await hit(`otp:fail:${phone}`, 30 * MIN);
    return { ok: false, reason: "Kod hatalı." };
  }
  // Belirteç tek kullanımlıktır: aynı kodla tekrar doğrulama (ve tekrar bildirim) yapılamaz
  if (!(await once(`otp:used:${sigC}`, data.e - now + MIN))) return { ok: false, reason: "Bu kod zaten kullanıldı, yeniden isteyin." };
  return { ok: true, phone };
}

// Netgsm HTTP GET API ile SMS. Canlıya almadan önce Netgsm hesabıyla denenmeli.
export async function sendSms(phone: string, message: string) {
  if (OTP_TEST_MODE) {
    console.info(`[otp:test] ${maskPhone(phone)} → ${message}`);
    return;
  }
  if (VERIMOR_READY) return sendVerimor(phone, message);
  const params = new URLSearchParams({
    usercode: process.env.NETGSM_USERCODE ?? "",
    password: process.env.NETGSM_PASSWORD ?? "",
    gsmno: `90${phone}`,
    message,
    msgheader: process.env.NETGSM_HEADER ?? "",
  });
  const res = await fetch(`https://api.netgsm.com.tr/sms/send/get?${params}`, { signal: AbortSignal.timeout(10_000) });
  const body = (await res.text()).trim();
  // Netgsm başarıda "00 <görev no>" döndürür
  if (!res.ok || !body.startsWith("00")) throw new Error(`SMS gönderilemedi: ${redact(body.slice(0, 40))}`);
}

// Verimor API'yi yalnızca izinli IP'den kabul eder; Vercel'in giden IP'si sabit değildir. SMS_RELAY_KEY varsa istek
// sabit IP'li aktarıcıdan geçer (wawamobilya ile aynı kurulum). Aktarıcının adresi VERIMOR_SMS_RELAY_URL ile verilir
// (kodda sabit adres yok; hesap bilgileri yalnızca sizin belirttiğiniz sunucuya gider).
// Metin ASCII gider: Türkçe karakter SMS boyunu yarıya indirir.
const ASCII: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U" };
async function sendVerimor(phone: string, message: string) {
  const relay = process.env.SMS_RELAY_KEY;
  const base = (process.env.VERIMOR_SMS_RELAY_URL ?? "").replace(/\/+$/, "");
  if (relay && !/^https:\/\//.test(base)) throw new Error("SMS gönderilemedi: VERIMOR_SMS_RELAY_URL tanımlı değil");
  const url = relay ? `${base}/v2/send.json` : "https://sms.verimor.com.tr/v2/send.json";
  const h = (process.env.VERIMOR_SMS_HEADER ?? "").trim();
  // Başlık reddedilirse önce hesabın varsayılan başlığı, sonra 90'lı biçim denenir
  const heads = [...new Set([h || undefined, undefined, /^0\d{10}$/.test(h) ? `9${h}` : undefined])];
  const msg = message.replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => ASCII[c] ?? c);
  for (const source of heads) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...(relay ? { "x-relay-key": relay } : {}) },
      body: JSON.stringify({
        username: process.env.VERIMOR_SMS_USERNAME,
        password: process.env.VERIMOR_SMS_PASSWORD,
        ...(source ? { source_addr: source } : {}),
        is_commercial: false, // doğrulama kodu ticari ileti değildir
        valid_for: "00:10",
        messages: [{ msg, dest: `90${phone}` }],
      }),
      signal: AbortSignal.timeout(10_000),
    }).catch(() => null);
    if (r?.ok) return;
    const body = r ? (await r.text().catch(() => "")).slice(0, 120) : "";
    if (!/NUMERIC_SOURCE_ADDRESS|SOURCE_ADDR/i.test(body)) throw new Error(`SMS gönderilemedi: ${r ? r.status : "ağ"} ${redact(body.slice(0, 40))}`);
  }
  throw new Error("SMS gönderilemedi: başlık kabul edilmedi");
}

// Doğrulama geçişi: kodu doğrulanan telefon için kısa süreli, imzalı izin. Aynı kişi görseli yeniden
// üretirken her seferinde SMS beklemez; üretim sayısı yine telefon ve IP sınırlarına tabidir.
const PASS_TTL_MS = 2 * HOUR;
export function issuePass(phone: string) {
  const payload = Buffer.from(JSON.stringify({ p: phone, e: Date.now() + PASS_TTL_MS, k: "pass" })).toString("base64url");
  return `${payload}.${sign("pass", payload)}`;
}
export function checkPass(token: string): string | null {
  const [payload, sig, extra] = token.split(".");
  if (!payload || !sig || extra !== undefined || payload.length > 200 || sig.length > 64) return null;
  if (!same(sig, sign("pass", payload))) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString()) as { p?: string; e?: number; k?: string };
    const now = Date.now();
    return d.k === "pass" && typeof d.p === "string" && typeof d.e === "number" && d.e > now && d.e <= now + PASS_TTL_MS ? d.p : null;
  } catch {
    return null;
  }
}

export class LeadError extends Error {}

// Doğrulanan talebi ekibe iletir; e-posta servisi tanımlı değilse günlüğe yalnızca maskeli özet yazılır.
// E-posta gönderilemezse hata fırlatır (talep sessizce kaybolmasın; çağıran ziyaretçiye telefon/WhatsApp önerir).
// attachments: e-postaya eklenecek dosyalar (base64 içerik), ör. yapay zekanın ürettiği görsel
export async function notifyLead(subject: string, text: string, logSummary: string, attachments: { filename: string; content: string }[] = []) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  if (!key || !to) {
    console.info(`[lead] ${logSummary}${OTP_TEST_MODE ? `\n${text}` : ""}`);
    return;
  }
  // Konu tek satır: form alanlarından gelen satır sonları e-posta başlığına taşınmaz
  const cleanSubject = `[Web formu] ${subject}`.replace(/[\u0000-\u001F\u007F20282029]+/g, " ").slice(0, 200);
  const body = JSON.stringify({ from: process.env.LEAD_EMAIL_FROM ?? "WAWA Site <onboarding@resend.dev>", to, subject: cleanSubject, text, ...(attachments.length ? { attachments } : {}) });
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
    if (r?.ok) return;
    const status = r?.status ?? 0;
    console.error(`[lead] e-posta gönderilemedi (${status || "ağ"}) · ${logSummary}`, r ? redact((await r.text().catch(() => "")).slice(0, 160)) : "");
    // Kalıcı hatalarda (ör. 4xx doğrulama) tekrar denenmez; geçici hatalarda (ağ, 429, 5xx) bir kez daha denenir
    if (status && status < 500 && status !== 429) break;
  }
  throw new LeadError("mail");
}

// İstemci IP'si (bkz. request-guard.ts)
export const clientIp = ipOf;

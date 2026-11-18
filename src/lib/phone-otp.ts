import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

// Telefon doğrulaması durumsuz çalışır: kod sunucuda saklanmaz, imzalı bir belirtece gömülür.
// Belirteç = base64url({p: telefon, e: son geçerlilik}) + "." + HMAC(yük + kod)

const TTL_MS = 10 * 60 * 1000;
const MAX_SENDS_PER_PHONE = 3;
const PHONE_WINDOW_MS = 15 * 60 * 1000;
const MAX_SENDS_PER_IP = 5;
const IP_WINDOW_MS = 60 * 60 * 1000;
// Tüm site için saatlik SMS üst sınırı (SMS maliyetini ve üçüncü kişilere spam'i sınırlar)
const MAX_SENDS_GLOBAL = 60;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// Test modu yalnızca geliştirmede: SMS gitmez, kod sabittir. Canlıda SMS sağlayıcısı yoksa kod gönderilmez.
const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const SMS_CONFIGURED = Boolean(process.env.NETGSM_USERCODE && process.env.NETGSM_PASSWORD);
export const OTP_TEST_MODE = !IS_PRODUCTION && !SMS_CONFIGURED;
const TEST_CODE = "1234";

function secret() {
  const s = process.env.OTP_SECRET;
  if (s) return s;
  if (!OTP_TEST_MODE) throw new Error("OTP_SECRET tanımlı değil");
  return "wawa-otp-test-secret";
}

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

// Günlüklerde telefonun yalnızca son dört hanesi görünür (KVKK)
export const maskPhone = (phone: string) => `05•• ••• ${phone.slice(-4)}`;

// Bellek içi sınırlar sunucu örneği başınadır (Vercel'de birden fazla örnek çalışabilir).
// Kalıcı ve paylaşılan sınır için Upstash/Vercel KV gibi bir depo ve Cloudflare Turnstile eklenmeli.
const phoneSends = new Map<string, number[]>();
const ipSends = new Map<string, number[]>();
let globalSends: number[] = [];
const attempts = new Map<string, { n: number; exp: number }>();
const usedTokens = new Map<string, number>();

function within(list: number[] | undefined, windowMs: number, now: number) {
  return (list ?? []).filter((t) => now - t < windowMs);
}

// Süresi geçmiş kayıtları temizler; haritalar sınırsız büyümez
function sweep(now: number) {
  for (const [k, v] of attempts) if (v.exp < now) attempts.delete(k);
  for (const [k, exp] of usedTokens) if (exp < now) usedTokens.delete(k);
  for (const [k, v] of phoneSends) if (!within(v, PHONE_WINDOW_MS, now).length) phoneSends.delete(k);
  for (const [k, v] of ipSends) if (!within(v, IP_WINDOW_MS, now).length) ipSends.delete(k);
}

export function canSend(phone: string, ip: string): { ok: true } | { ok: false; reason: string } {
  const now = Date.now();
  sweep(now);
  globalSends = within(globalSends, GLOBAL_WINDOW_MS, now);
  const byPhone = within(phoneSends.get(phone), PHONE_WINDOW_MS, now);
  const byIp = within(ipSends.get(ip), IP_WINDOW_MS, now);
  if (globalSends.length >= MAX_SENDS_GLOBAL) return { ok: false, reason: "Şu anda kod gönderilemiyor, lütfen biraz sonra yeniden deneyin." };
  if (byPhone.length >= MAX_SENDS_PER_PHONE || byIp.length >= MAX_SENDS_PER_IP)
    return { ok: false, reason: "Çok fazla kod istendi, biraz sonra yeniden deneyin." };
  phoneSends.set(phone, [...byPhone, now]);
  ipSends.set(ip, [...byIp, now]);
  globalSends.push(now);
  return { ok: true };
}

export function issueCode(phone: string) {
  const code = OTP_TEST_MODE ? TEST_CODE : String(randomInt(1000, 10000));
  const payload = Buffer.from(JSON.stringify({ p: phone, e: Date.now() + TTL_MS })).toString("base64url");
  return { code, token: `${payload}.${sign(payload + code)}` };
}

export function checkCode(token: string, code: string): { ok: true; phone: string } | { ok: false; reason: string } {
  const expired = { ok: false as const, reason: "Kodun süresi doldu, yeniden isteyin." };
  const [payload, sig] = token.split(".");
  if (!payload || !sig || sig.length > 64) return expired;

  // Önce belirtecin biçimi ve süresi kontrol edilir; deneme sayacı yalnızca geçerli belirteçler için tutulur
  let data: { p?: string; e?: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return expired;
  }
  const now = Date.now();
  if (typeof data.p !== "string" || typeof data.e !== "number" || data.e < now) return expired;
  if (usedTokens.has(sig)) return { ok: false, reason: "Bu kod zaten kullanıldı, yeniden isteyin." };

  const entry = attempts.get(sig) ?? { n: 0, exp: data.e };
  entry.n += 1;
  attempts.set(sig, entry);
  if (entry.n > MAX_ATTEMPTS) return { ok: false, reason: "Çok fazla deneme yapıldı, kodu yeniden isteyin." };

  const expected = Buffer.from(sign(payload + code));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "Kod hatalı." };

  // Belirteç tek kullanımlıktır: aynı kodla tekrar doğrulama (ve tekrar bildirim) yapılamaz
  attempts.delete(sig);
  usedTokens.set(sig, data.e);
  return { ok: true, phone: data.p };
}

// Netgsm HTTP GET API ile SMS. Canlıya almadan önce Netgsm hesabıyla denenmeli.
export async function sendSms(phone: string, message: string) {
  if (OTP_TEST_MODE) {
    console.info(`[otp:test] ${maskPhone(phone)} → ${message}`);
    return;
  }
  const params = new URLSearchParams({
    usercode: process.env.NETGSM_USERCODE ?? "",
    password: process.env.NETGSM_PASSWORD ?? "",
    gsmno: `90${phone}`,
    message,
    msgheader: process.env.NETGSM_HEADER ?? "",
  });
  const res = await fetch(`https://api.netgsm.com.tr/sms/send/get?${params}`);
  const body = (await res.text()).trim();
  // Netgsm başarıda "00 <görev no>" döndürür
  if (!res.ok || !body.startsWith("00")) throw new Error(`SMS gönderilemedi: ${body.slice(0, 40)}`);
}

// Doğrulanan talebi ekibe iletir; e-posta servisi tanımlı değilse günlüğe yalnızca maskeli özet yazılır
export async function notifyLead(subject: string, text: string, logSummary: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  if (!key || !to) {
    console.info(`[lead] ${logSummary}${OTP_TEST_MODE ? `\n${text}` : ""}`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.LEAD_EMAIL_FROM ?? "WAWA Site <onboarding@resend.dev>", to, subject, text }),
  }).catch(() => console.error("[lead] e-posta gönderilemedi"));
}

// İstemci IP'si: Vercel'in kendisinin yazdığı x-real-ip başlığından (istemci bunu değiştiremez).
// cf-connecting-ip yalnızca site Cloudflare arkasındaysa güvenilirdir; aksi hâlde sahte gönderilebilir.
export function clientIp(req: Request) {
  const h = req.headers;
  if (process.env.BEHIND_CLOUDFLARE === "1" && h.get("cf-connecting-ip")) return h.get("cf-connecting-ip")!;
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

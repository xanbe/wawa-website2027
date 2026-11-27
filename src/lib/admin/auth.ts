import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Yönetim paneli girişi: tek parola (ADMIN_PASSWORD), imzalı oturum çerezi.
// Panel yalnızca şu koşullarda açılır (canlıda yanlışlıkla açık kalmaz):
//  - ADMIN_PASSWORD en az 12 karakter
//  - ADMIN_SECRET en az 32 karakter (oturum imzası; SMS kodu anahtarıyla paylaşılmaz)
// Oturum parolaya ve ADMIN_SESSION_EPOCH'a bağlıdır: parola ya da bu değer değişince tüm açık oturumlar düşer.

const PROD = process.env.NODE_ENV === "production";
// Canlıda __Host- ön eki: çerez yalnızca HTTPS'te, yalnızca bu alan adında ve tüm sitede geçerli olur
export const SESSION_COOKIE = PROD ? "__Host-wawa_admin" : "wawa_admin";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const RENEW_BELOW_MS = 6 * 60 * 60 * 1000;

// Vercel'e yapıştırılan değerde kalan boşluk, satır sonu ya da çevreleyen tırnak giriş yapılamamasına yol açmasın
const env = (v: string | undefined) => (v ?? "").trim().replace(/^(["'])([\s\S]*)\1$/, "$2");
const secret = () => {
  const s = env(process.env.ADMIN_SECRET);
  return s.length >= 32 ? s : "";
};
const password = () => {
  const p = env(process.env.ADMIN_PASSWORD);
  return p.length >= 12 ? p : "";
};
export const adminEnabled = () => Boolean(password() && secret());

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");
export const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(given: string) {
  return adminEnabled() && same(sign(`pw:${given}`), sign(`pw:${password()}`));
}

// Oturumu parolaya ve dönem numarasına bağlayan parmak izi (parolanın kendisi imzaya girmez)
const binding = () => `${process.env.ADMIN_SESSION_EPOCH ?? "0"}:${createHash("sha256").update(password()).digest("base64url")}`;

export function makeSession() {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${sign(`s:${exp}:${binding()}`)}`;
}

// Geçerli oturumun bitiş zamanı (yoksa null)
export async function sessionExp(): Promise<number | null> {
  if (!adminEnabled()) return null;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value || value.length > 200) return null;
  const [exp, sig] = value.split(".");
  const n = Number(exp);
  if (!exp || !sig || !Number.isFinite(n) || n < Date.now() || n > Date.now() + SESSION_TTL_MS) return null;
  return same(sig, sign(`s:${exp}:${binding()}`)) ? n : null;
}

export async function isAdmin() {
  return (await sessionExp()) !== null;
}

export function setSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, makeSession(), { httpOnly: true, sameSite: "strict", secure: PROD, path: "/", maxAge: SESSION_TTL_MS / 1000 });
  return res;
}
export function clearSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: PROD, path: "/", maxAge: 0 });
  return res;
}
// Kayan oturum: panel açık kaldıkça süre yenilenir, 12 saat işlem yapılmazsa oturum kapanır
export async function renewSession(res: NextResponse) {
  const exp = await sessionExp();
  if (exp && exp - Date.now() < RENEW_BELOW_MS) setSession(res);
  return res;
}

// Yalnızca sitenin kendi sayfalarından gelen JSON istekleri kabul edilir (başka siteden form ile istek atılamaz)
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    // Vercel'de istek adresi iç ağ adresi olabilir; Host başlığıyla da karşılaştırılır
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (!host || new URL(origin).host !== host) return false;
  }
  if (req.headers.get("sec-fetch-site") === "cross-site") return false;
  return true;
}
export const isJson = (req: Request) => (req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");

// Yüklenen dosyanın depo kaydı (yol + içerik kimliği) sunucu imzasıyla döner; kayıt sırasında imza kontrol edilir.
// Böylece istemci, yüklemediği bir dosya kimliğini başka bir yola (ör. içerik dosyalarına) yazdıramaz.
export const blobToken = (path: string, sha: string) => sign(`blob:${path}:${sha}`);
export const checkBlobToken = (path: string, sha: string, token: string) => Boolean(token) && same(token, blobToken(path, sha));

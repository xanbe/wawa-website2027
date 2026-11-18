import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Yönetim paneli girişi: tek parola (ADMIN_PASSWORD), imzalı oturum çerezi.
// Parola tanımlı değilse panel tamamen kapalıdır (canlıda yanlışlıkla açık kalmaz).

export const SESSION_COOKIE = "wawa_admin";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const secret = () => process.env.ADMIN_SECRET || process.env.OTP_SECRET || (process.env.NODE_ENV !== "production" ? "wawa-admin-dev-secret" : "");
export const adminEnabled = () => Boolean(process.env.ADMIN_PASSWORD && secret());

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");
const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(password: string) {
  return adminEnabled() && same(sign(`pw:${password}`), sign(`pw:${process.env.ADMIN_PASSWORD}`));
}

export function makeSession() {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${sign(`s:${exp}`)}`;
}

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  return Boolean(exp && sig && Number(exp) > Date.now() && same(sig, sign(`s:${exp}`)));
}

import { NextResponse } from "next/server";

// Gövde boyutu: req.json() çağrılmadan önce bildirilen uzunluk kontrol edilir (Vercel'in 4,5 MB sınırına güvenilmez)
export function tooLarge(req: Request, limit: number) {
  const n = Number(req.headers.get("content-length") ?? 0);
  return Number.isFinite(n) && n > limit ? NextResponse.json({ error: "too_large" }, { status: 413 }) : null;
}

// Günlüklerde IP'nin son kısmı gizlenir (IPv4 ve IPv6)
export const maskIp = (ip: string) => (ip.includes(":") ? `${ip.split(":").slice(0, 3).join(":")}:x` : ip.replace(/\.\d+$/, ".x"));

// Sağlayıcı hata metinlerinde uzun rakam dizileri (telefon, görev no) gizlenir
export const redact = (s: string) => s.replace(/\d{6,}/g, "…");

// ---------------------------------------------------------------- istemci IP'si
// Temel kaynak Vercel'in kendi yazdığı x-real-ip başlığıdır (istemci değiştiremez). Site Cloudflare arkasındaysa
// (BEHIND_CLOUDFLARE=1) x-real-ip Cloudflare'in sunucusudur; o zaman cf-connecting-ip yalnızca istek gerçekten
// Cloudflare'den geldiyse kullanılır: x-real-ip Cloudflare'in yayımlanmış IP aralıklarında olmalı ya da
// Cloudflare'in eklediği x-origin-auth başlığı CF_ORIGIN_SECRET ile eşleşmeli. Aksi hâlde başlık sahte olabilir.
const CF_V4 = ["173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13", "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22"];
const CF_V6 = ["2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32"];

function v4(ip: string): bigint | null {
  const p = ip.split(".");
  if (p.length !== 4 || p.some((x) => !/^\d{1,3}$/.test(x) || Number(x) > 255)) return null;
  return p.reduce((n, x) => (n << BigInt(8)) | BigInt(Number(x)), BigInt(0));
}
function v6(ip: string): bigint | null {
  if (!/^[0-9a-f:]+$/i.test(ip) || (ip.match(/::/g) ?? []).length > 1) return null;
  const [head, tail] = ip.includes("::") ? ip.split("::") : [ip, null];
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const fill = tail === null ? 0 : 8 - h.length - t.length;
  const parts = [...h, ...Array(Math.max(0, fill)).fill("0"), ...t];
  if (parts.length !== 8 || parts.some((x) => !/^[0-9a-f]{1,4}$/i.test(x))) return null;
  return parts.reduce((n, x) => (n << BigInt(16)) | BigInt(parseInt(x, 16)), BigInt(0));
}
function inRanges(ip: string) {
  const isV6 = ip.includes(":");
  const n = isV6 ? v6(ip) : v4(ip);
  if (n === null) return false;
  const bits = isV6 ? BigInt(128) : BigInt(32);
  return (isV6 ? CF_V6 : CF_V4).some((cidr) => {
    const [base, len] = cidr.split("/");
    const b = isV6 ? v6(base) : v4(base);
    if (b === null) return false;
    const shift = bits - BigInt(len);
    return n >> shift === b >> shift;
  });
}

export function clientIp(req: Request) {
  const h = req.headers;
  const real = h.get("x-real-ip")?.trim() || "";
  const cf = h.get("cf-connecting-ip")?.trim() || "";
  if (process.env.BEHIND_CLOUDFLARE === "1" && cf) {
    const secret = process.env.CF_ORIGIN_SECRET;
    const fromCf = secret ? h.get("x-origin-auth") === secret : Boolean(real) && inRanges(real);
    if (fromCf) return cf.slice(0, 64);
  }
  return real.slice(0, 64) || "unknown";
}

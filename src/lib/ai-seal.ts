import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import sharp from "sharp";
import { purposeKey } from "@/lib/phone-otp";

// Önizleme ve kilitli tam görsel.
// Üretilen görselin önizlemesi küçük ve filigranlı döner; tam çözünürlüklü görsel şifrelenip ("mühür") istemciye verilir.
// Telefon doğrulanınca istemci mührü geri gönderir, sunucu açar. Sunucuda kayıt tutulmaz (birden fazla sunucu örneğinde de çalışır).

const SEAL_TTL_MS = 2 * 60 * 60 * 1000;

// Mühür anahtarı ana gizli anahtardan ayrı türetilir (SMS kodu ve geçiş imzalarıyla paylaşılmaz)
const key = () => purposeKey("ai-seal");

// Mühür, üretildiği isteğe (brif + taslak) bağlanır: başka bir istekle ya da değiştirilmiş taslakla açılamaz
export const sealContext = (brief: unknown, sketch: string) => createHash("sha256").update(JSON.stringify(brief)).update("|").update(sketch).digest();

export function seal(data: Buffer, context: Buffer) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  c.setAAD(context);
  const head = Buffer.alloc(8);
  head.writeBigUInt64BE(BigInt(Date.now() + SEAL_TTL_MS));
  const body = Buffer.concat([c.update(Buffer.concat([head, data])), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]).toString("base64url");
}

export function unseal(token: string, context: Buffer): { image: Buffer; id: string; exp: number } | null {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 40) return null;
    const d = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    d.setAAD(context);
    d.setAuthTag(raw.subarray(12, 28));
    const out = Buffer.concat([d.update(raw.subarray(28)), d.final()]);
    const exp = Number(out.readBigUInt64BE(0));
    if (exp < Date.now()) return null;
    // id: mührün tek kullanımlık olması için (rastgele IV)
    return { image: out.subarray(8), id: raw.subarray(0, 12).toString("base64url"), exp };
  } catch {
    return null;
  }
}

// Tam görsel: JPEG'e çevrilir (istek ve e-posta boyutu küçük kalır)
export async function toJpeg(data: Buffer) {
  return sharp(data).rotate().jpeg({ quality: 90, mozjpeg: true }).toBuffer();
}

// Önizleme: 720 px genişlik, ortada çapraz filigran şeridi
export async function makePreview(data: Buffer) {
  const { data: small, info } = await sharp(data).rotate().resize({ width: 720, withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const fs = Math.round(width / 16);
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <g transform="rotate(-24 ${width / 2} ${height / 2})" font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle">
        ${[-1, 0, 1]
          .map(
            (k) =>
              `<text x="${width / 2}" y="${height / 2 + k * fs * 3.2}" font-size="${fs}" fill="#ffffff" fill-opacity="0.42" stroke="#000000" stroke-opacity="0.18" stroke-width="1" letter-spacing="${fs * 0.18}">WAWA · ÖNİZLEME</text>`,
          )
          .join("")}
      </g>
    </svg>`,
  );
  return sharp(small).composite([{ input: svg, top: 0, left: 0 }]).jpeg({ quality: 68 }).toBuffer();
}

export const dataUrl = (buf: Buffer, mime = "image/jpeg") => `data:${mime};base64,${buf.toString("base64")}`;

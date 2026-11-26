// Hız sınırı ve kısa ömürlü işaretler.
// Upstash Redis (ya da Vercel KV) tanımlıysa sayaçlar tüm sunucu örneklerinde ortaktır; değilse bellek içi
// yedek kullanılır (yalnızca geliştirme ve tek örnek için yeterli).
// Ortam değişkenleri: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (ya da KV_REST_API_URL + KV_REST_API_TOKEN)

const REDIS_URL = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "").replace(/\/+$/, "");
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
export const SHARED_STORE = Boolean(REDIS_URL && REDIS_TOKEN);

async function redis(commands: (string | number)[][]): Promise<unknown[] | null> {
  try {
    const r = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${REDIS_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return null;
    const out = (await r.json()) as { result?: unknown; error?: string }[];
    return out.map((x) => x.result);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- bellek içi yedek
const buckets = new Map<string, { n: number; exp: number }>();
const flags = new Map<string, number>();
function sweep(now: number) {
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.exp < now) buckets.delete(k);
  if (flags.size > 5000) for (const [k, exp] of flags) if (exp < now) flags.delete(k);
}
function localHit(key: string, windowMs: number) {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);
  if (!b || b.exp < now) {
    buckets.set(key, { n: 1, exp: now + windowMs });
    return 1;
  }
  b.n += 1;
  return b.n;
}

// Sayacı bir artırır ve pencere içindeki toplamı döndürür (sabit pencere)
export async function hit(key: string, windowMs: number): Promise<number> {
  if (SHARED_STORE) {
    const k = `wawa:rl:${key}`;
    const res = await redis([
      ["INCR", k],
      ["PEXPIRE", k, windowMs, "NX"],
    ]);
    if (res && typeof res[0] === "number") return res[0];
    // Depo geçici olarak erişilemezse bellek içi sayaç devreye girer (sınır tamamen kalkmasın)
  }
  return localHit(key, windowMs);
}

// İstek sınır içindeyse true; sayaç her çağrıda artar
export async function allow(key: string, max: number, windowMs: number) {
  return (await hit(key, windowMs)) <= max;
}

// Sayacı artırmadan okur (önce kontrol, sonra ücretli işlemden hemen önce hit)
export async function peek(key: string): Promise<number> {
  if (SHARED_STORE) {
    const res = await redis([["GET", `wawa:rl:${key}`]]);
    if (res) return Number(res[0] ?? 0) || 0;
  }
  const b = buckets.get(key);
  return b && b.exp >= Date.now() ? b.n : 0;
}

// Tek kullanımlık işaret: ilk çağrıda true, süre dolana kadar sonraki çağrılarda false (ör. kullanılmış kod, açılmış mühür)
export async function once(key: string, ttlMs: number): Promise<boolean> {
  if (SHARED_STORE) {
    const res = await redis([["SET", `wawa:once:${key}`, "1", "PX", Math.max(1000, Math.round(ttlMs)), "NX"]]);
    if (res) return res[0] === "OK";
  }
  const now = Date.now();
  sweep(now);
  const exp = flags.get(key);
  if (exp && exp > now) return false;
  flags.set(key, now + ttlMs);
  return true;
}

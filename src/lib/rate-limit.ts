// Basit bellek içi hız sınırı (sunucu örneği başına). Kalıcı sınır için Upstash/Vercel KV + Turnstile önerilir.
const buckets = new Map<string, number[]>();

export function allow(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  // Harita sınırsız büyümesin
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}

// Cloudflare Turnstile (bot doğrulaması) sunucu kontrolü.
// TURNSTILE_SECRET_KEY tanımlı değilse kontrol atlanır (site anahtarı da yoksa formda pencere çıkmaz).
// Anahtarlar: Cloudflare panelinde Turnstile → site ekle; NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY.

export const TURNSTILE_ON = Boolean(process.env.TURNSTILE_SECRET_KEY);

export async function verifyHuman(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(8000) });
    const j = (await r.json().catch(() => null)) as { success?: boolean } | null;
    return j?.success === true;
  } catch {
    // Doğrulama servisine ulaşılamazsa istek reddedilir (ücretli işlemler korumasız kalmasın)
    return false;
  }
}

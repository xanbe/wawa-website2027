import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin, isJson, sameOrigin } from "@/lib/admin/auth";
import { allow } from "@/lib/rate-limit";

// Panelden kısa MP4 yükleme (Vercel Blob). Dosya tarayıcıdan doğrudan Blob'a gider; bu uç yalnızca yönetici oturumu varsa
// yükleme izni (kısa ömürlü anahtar) verir. Gerekli ortam değişkeni: BLOB_READ_WRITE_TOKEN (Vercel > Storage > Blob).
export const dynamic = "force-dynamic";

const MAX = 30 * 1024 * 1024;
const KNOWN = ["Oturum süresi doldu, yeniden giriş yapın.", "Geçersiz dosya adı.", "Çok fazla yükleme yapıldı, biraz sonra tekrar deneyin."];

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Video deposu bağlı değil (BLOB_READ_WRITE_TOKEN)." }, { status: 503 });
  if (!sameOrigin(req) || !isJson(req)) return NextResponse.json({ error: "Geçersiz istek." }, { status: 403 });
  const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error(KNOWN[0]);
        if (!/^videos\/[a-z0-9-]{1,80}\.(mp4|webm)$/.test(pathname)) throw new Error(KNOWN[1]);
        if (!(await allow("admin:blob", 40, 60 * 60 * 1000))) throw new Error(KNOWN[2]);
        return { allowedContentTypes: ["video/mp4", "video/webm"], maximumSizeInBytes: MAX, addRandomSuffix: true };
      },
      // Video listesine ekleme panelde kayıtla yapılır; burada ayrıca bir şey gerekmiyor
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(json);
  } catch (e) {
    // Yalnızca bilinen mesajlar gösterilir; diğer hata ayrıntıları sunucu günlüğünde kalır
    const msg = e instanceof Error ? e.message : "";
    if (!KNOWN.includes(msg)) console.error("[admin:blob]", msg);
    return NextResponse.json({ error: KNOWN.includes(msg) ? msg : "Yükleme izni verilemedi." }, { status: 400 });
  }
}

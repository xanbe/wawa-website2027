import { NextResponse } from "next/server";
import { feeRange, findVariant, PROJECT_TYPES, validateFeeInput } from "@/lib/fee";
import { computeFee } from "@/lib/fee-server";
import { LeadError, checkCode, checkPass, clientIp, issuePass, maskPhone, notifyLead } from "@/lib/phone-otp";
import { allow } from "@/lib/rate-limit";
import { maskIp, tooLarge } from "@/lib/request-guard";

const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;
const HOUR = 60 * 60 * 1000;

// Kodu doğrular; hesap sonucu yalnızca doğrulamadan sonra sunucuda hesaplanıp döndürülür.
// Doğrulanan kişi bir geçiş belirteci alır; bilgileri değiştirdikçe sonuç bu belirteçle yeniden istenir (yeni SMS gerekmez).
export async function POST(req: Request) {
  const big = tooLarge(req, 8_000);
  if (big) return big;
  const ip = clientIp(req);
  if (!(await allow(`fee:verify:${ip}`, 60, HOUR))) return NextResponse.json({ error: "Çok fazla deneme yapıldı, biraz sonra yeniden deneyin." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const input = validateFeeInput(body?.input);
  if (!input) return NextResponse.json({ error: "Proje bilgilerini kontrol edin." }, { status: 400 });

  // Daha önce doğrulanmış kişi: yalnızca yeni sonuç (bildirim tekrar gönderilmez)
  if (typeof body?.pass === "string") {
    const phone = checkPass(body.pass.slice(0, 400));
    if (!phone) return NextResponse.json({ error: "Doğrulamanın süresi doldu, numaranızı yeniden doğrulayın.", expired: true }, { status: 401 });
    if (!(await allow(`fee:quote:${phone}`, 200, HOUR))) return NextResponse.json({ error: "Çok fazla istek yapıldı, biraz sonra yeniden deneyin." }, { status: 429 });
    return NextResponse.json({ result: computeFee(input) });
  }

  const check = await checkCode(String(body?.token ?? "").slice(0, 400), String(body?.code ?? "").trim().slice(0, 8));
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });

  const result = computeFee(input);
  const type = PROJECT_TYPES.find((t) => t.id === input.typeId);
  const variant = findVariant(input.typeId, input.variantId);
  const { min, max } = feeRange(result.total);
  const project = `${type?.label}${type?.question ? ` (${variant?.label})` : ""}`;
  // Ekibe giden bildirim tek bakışta okunur: "05xx… 120 m² Daire için fiyat baktı"
  const headline = `0${check.phone} · ${input.area.toLocaleString("tr-TR")} m² ${project} için fiyat baktı`;
  try {
    await notifyLead(
      headline,
      [
        headline,
        "",
        `Telefon: 0${check.phone}`,
        `Mekân: ${project}, ${input.area.toLocaleString("tr-TR")} m²`,
        `Gördüğü aralık: ${tl(min)} – ${tl(max)} (KDV hariç)`,
        `Zaman: ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
        "Aydınlatma metni gösterildi (SMS doğrulaması öncesinde).",
      ].join("\n"),
      `${maskPhone(check.phone)} · ${input.area} m² ${project} · ${maskIp(ip)}`,
    );
  } catch (e) {
    // Ziyaretçi sonucu yine görür; kaybolan bildirim sunucu günlüğüne yazıldı (notifyLead)
    if (!(e instanceof LeadError)) throw e;
  }
  return NextResponse.json({ result, pass: issuePass(check.phone) });
}

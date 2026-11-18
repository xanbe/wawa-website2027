import { NextResponse } from "next/server";
import { computeFee, feeRange, findVariant, PROJECT_TYPES, validateFeeInput } from "@/lib/fee";
import { checkCode, clientIp, maskPhone, notifyLead } from "@/lib/phone-otp";

const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;

// Kodu doğrular; hesap sonucu yalnızca doğrulamadan sonra sunucuda hesaplanıp döndürülür
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const input = validateFeeInput(body?.input);
  if (!input) return NextResponse.json({ error: "Proje bilgilerini kontrol edin." }, { status: 400 });

  const check = checkCode(String(body?.token ?? ""), String(body?.code ?? "").trim());
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });

  const result = computeFee(input);
  const type = PROJECT_TYPES.find((t) => t.id === input.typeId);
  const variant = findVariant(input.typeId, input.variantId);
  const { min, max } = feeRange(result.total);
  const project = `${type?.label}${type?.question ? ` (${variant?.label})` : ""}`;
  // Ekibe giden bildirim tek bakışta okunur: "05xx… 120 m² Daire için fiyat baktı"
  const headline = `0${check.phone} · ${input.area.toLocaleString("tr-TR")} m² ${project} için fiyat baktı`;
  await notifyLead(
    headline,
    [
      headline,
      "",
      `Telefon: 0${check.phone}`,
      `Mekân: ${project}, ${input.area.toLocaleString("tr-TR")} m²`,
      `Gördüğü aralık: ${tl(min)} – ${tl(max)} (KDV hariç)`,
      `Zaman: ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
    ].join("\n"),
    `${maskPhone(check.phone)} · ${input.area} m² ${project} · ${clientIp(req).replace(/\.\d+$/, ".x")}`,
  );
  return NextResponse.json({ result });
}

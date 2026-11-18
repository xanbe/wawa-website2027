"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  AREA_MAX,
  AREA_MIN,
  PROJECT_TYPES,
  STAGES,
  computeFee,
  feeRange,
  type FeeInput,
  type FeeResult,
} from "@/lib/fee";

// Ziyaretçi yalnızca tür ve alanı girer; hesap tam iç mimarlık hizmeti (tüm aşamalar) üzerinden yapılır
const ALL_STAGES = STAGES.map((s) => s.id);

const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;

const labelClass = "text-[15px] text-wawa-charcoal";
const optionClass = (active: boolean) =>
  `cursor-pointer px-4 py-2.5 text-[15px] transition-colors duration-200 ${
    active ? "bg-wawa-charcoal text-white" : "bg-white text-wawa-charcoal hover:bg-wawa-charcoal/5"
  }`;
const inputClass =
  "w-full min-w-0 border border-wawa-charcoal/15 bg-white px-4 py-3 text-[17px] text-wawa-charcoal placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal focus:outline-none";

type Phase = "form" | "code" | "done";

// Sonuç aralık olarak gösterilir: alt sınır hesaplanan en az ücret, üst sınır bunun 1,5 katı
function Estimate({ result }: { result: FeeResult }) {
  const { min, max } = feeRange(result.total);
  return (
    <div>
      <p className="text-[15px] text-wawa-charcoal/65">Tahmini tasarım bedeli, KDV hariç</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-3 text-[34px] leading-tight tracking-[-0.03em] text-wawa-charcoal tabular-nums lg:text-[44px]">
        <span>{min.toLocaleString("tr-TR")}</span>
        <span aria-hidden className="text-wawa-charcoal/40">–</span>
        <span className="sr-only">ile</span>
        <span>{tl(max)}</span>
      </p>
      <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-wawa-charcoal/65">
        Bu tutar ön planlama içindir. Kesin teklifi keşif sonrasında; kapsam, malzeme ve uygulama ihtiyacına göre hazırlıyoruz.
      </p>
    </div>
  );
}

// Ayrı sayfada (/butce-planlama) sayfanın ana başlığı olarak kullanılır.
// Anasayfadaki bütçe adımlarından gelindiyse tür ve alan dolu açılır.
export function FeeCalculator({ initialType, initialArea }: { initialType?: string; initialArea?: string }) {
  const startType = PROJECT_TYPES.find((t) => t.id === initialType) ?? PROJECT_TYPES[0];
  const [typeId, setTypeId] = useState(startType.id);
  const [variantId, setVariantId] = useState(startType.variants[0].id);
  const [area, setArea] = useState((initialArea ?? "").replace(/[^\d.,]/g, "").slice(0, 9));

  const [phase, setPhase] = useState<Phase>("form");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const type = PROJECT_TYPES.find((t) => t.id === typeId) ?? PROJECT_TYPES[0];
  const areaNum = Number(area.replace(",", "."));
  const input: FeeInput = { typeId, variantId, area: areaNum, stages: ALL_STAGES, control: false, renders: 0 };
  const ready = Number.isFinite(areaNum) && areaNum >= AREA_MIN && areaNum <= AREA_MAX;
  // Numara bir kez doğrulandıktan sonra sonuç, bilgiler değiştikçe yerinde güncellenir
  const result = phase === "done" && ready ? computeFee(input) : null;

  const chooseType = (id: string) => {
    const t = PROJECT_TYPES.find((p) => p.id === id);
    if (!t) return;
    setTypeId(id);
    setVariantId(t.variants[0].id);
  };

  const post = async (url: string, body: unknown) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Bir sorun oluştu, lütfen yeniden deneyin.");
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir sorun oluştu, lütfen yeniden deneyin.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) {
      setError(`Alanı ${AREA_MIN}–${AREA_MAX.toLocaleString("tr-TR")} m² arasında girin.`);
      return;
    }
    const data = await post("/api/fee/send-code/", { phone });
    if (!data) return;
    setToken(data.token);
    setTestMode(Boolean(data.testMode));
    setCode("");
    setPhase("code");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await post("/api/fee/verify/", { token, code, input });
    if (data?.result) setPhase("done");
  };

  return (
    <section aria-labelledby="fee-title" className="bg-white pt-20 lg:pt-24">
      <div className="container-wide grid gap-12 py-14 lg:grid-cols-12 lg:gap-10 lg:py-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h1
              id="fee-title"
              className="font-heading text-[28px] leading-[1.2] font-normal tracking-[-0.01em] text-balance text-wawa-charcoal sm:text-[36px] lg:text-[44px]"
            >
              Tasarım bütçenizi planlayın.
            </h1>
            <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-wawa-charcoal">
              Mekânınızın türüne ve büyüklüğüne göre iç mimari tasarım bütçenizi önceden görün.
            </p>
            <ul className="mt-8 space-y-3">
              {["Mekân türü ve alanına göre hesaplanır", "Sonuç, telefonunuzu doğruladığınızda açılır", "Kesin teklif için ekibimiz sizinle iletişime geçer"].map(
                (t) => (
                  <li key={t} className="flex items-start gap-3 text-[17px] text-wawa-charcoal">
                    <span aria-hidden className="mt-[0.55em] h-2 w-2 shrink-0 bg-wawa-accent outline outline-1 outline-wawa-charcoal" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="bg-[#F3F2EF] p-6 sm:p-8 lg:col-span-7 lg:p-10">
          {/* Proje bilgileri */}
          <fieldset>
            <legend className={labelClass}>Proje türü</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {PROJECT_TYPES.map((t) => (
                <button key={t.id} type="button" aria-pressed={t.id === typeId} onClick={() => chooseType(t.id)} className={optionClass(t.id === typeId)}>
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          {type.question && (
            <fieldset className="mt-7">
              <legend className={labelClass}>{type.question}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {type.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={v.id === variantId}
                    onClick={() => setVariantId(v.id)}
                    className={optionClass(v.id === variantId)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-7 max-w-[260px]">
            <label htmlFor="fee-area" className={labelClass}>
              İç mimarlık yapılacak alan
            </label>
            <div className="relative mt-3">
              <input
                id="fee-area"
                type="text"
                inputMode="decimal"
                placeholder="Örn. 180"
                value={area}
                onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, ""))}
                className={`${inputClass} pr-12`}
              />
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[15px] text-wawa-charcoal/55">m²</span>
            </div>
          </div>

          {/* Doğrulama ve sonuç */}
          <div className="mt-8 border-t border-wawa-charcoal/15 pt-8">
            {phase === "form" && (
              <form onSubmit={sendCode}>
                <label htmlFor="fee-phone" className={labelClass}>
                  Sonucu görmek için cep telefonunuz
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="fee-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="05xx xxx xx xx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="group inline-flex shrink-0 cursor-pointer items-center justify-between gap-4 bg-wawa-charcoal px-7 py-3 text-[15px] text-white transition-colors duration-300 hover:bg-black disabled:opacity-60"
                  >
                    {busy ? "Gönderiliyor" : "Kod gönder"}
                    <ArrowRight className="h-4 w-4 text-wawa-accent transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
                {/* KVKK aydınlatma: numaranın hangi amaçla kullanıldığı */}
                <p className="mt-3 text-[13px] leading-relaxed text-wawa-charcoal/60">
                  Numaranızı yalnızca bütçe bilgisi ve teklif için sizinle iletişime geçmek amacıyla kullanırız.{" "}
                  <Link href="/kvkk-aydinlatma-metni/" className="underline underline-offset-2 hover:text-wawa-charcoal">
                    Aydınlatma metni
                  </Link>
                </p>
              </form>
            )}

            {phase === "code" && (
              <form onSubmit={verify}>
                <label htmlFor="fee-code" className={labelClass}>
                  {phone} numarasına gelen 4 haneli kod
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="fee-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    placeholder="••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    className={`${inputClass} tracking-[0.5em] sm:max-w-[200px]`}
                  />
                  <button
                    type="submit"
                    disabled={busy || code.length !== 4}
                    className="group inline-flex shrink-0 cursor-pointer items-center justify-between gap-4 bg-wawa-charcoal px-7 py-3 text-[15px] text-white transition-colors duration-300 hover:bg-black disabled:opacity-60"
                  >
                    {busy ? "Doğrulanıyor" : "Sonucu göster"}
                    <ArrowRight className="h-4 w-4 text-wawa-accent transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-wawa-charcoal/65">
                  {testMode && <span>Test modu: kod 1234</span>}
                  <button
                    type="button"
                    onClick={() => {
                      setPhase("form");
                      setError("");
                    }}
                    className="cursor-pointer underline underline-offset-4 hover:text-wawa-charcoal"
                  >
                    Numarayı değiştir
                  </button>
                </div>
              </form>
            )}

            {phase === "done" &&
              (result ? (
                <>
                  <Estimate result={result} />
                  <Link
                    href="/teklif-al/"
                    className="group mt-8 inline-flex items-center gap-4 bg-wawa-charcoal px-7 py-4 text-[15px] text-white transition-colors duration-300 hover:bg-black"
                  >
                    Teklif isteyin
                    <ArrowRight className="h-4 w-4 text-wawa-accent transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </>
              ) : (
                <p className="text-[15px] text-wawa-charcoal/70">Hesap için alanı girin.</p>
              ))}

            {error && (
              <p role="alert" className="mt-3 text-[15px] text-[#B42318]">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

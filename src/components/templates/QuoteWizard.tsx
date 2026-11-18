"use client";

// Açılıştaki aşamalı hızlı teklif: fuar → alan ve stand tipi → stand sistemi → iletişim.
// Yanıtlar teklif formuyla aynı adrese (/api/contact/) gider; ekibe tek bir özet olarak düşer.
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import type { SvcLang } from "./service-sections";

const T = {
  tr: {
    kicker: "Ücretsiz teklif alın",
    lead: "Birkaç adımda size özel teklif hazırlayalım.",
    next: "Devam",
    back: "Geri",
    send: "Teklif iste",
    sending: "Gönderiliyor…",
    q: ["Hangi fuara katılacaksınız?", "Stand alanınız ne kadar?", "Nasıl bir stand istiyorsunuz?", "Teklifi kime gönderelim?"],
    fair: "Fuar",
    fairPh: "Fuar adı, şehir veya sektör yazın",
    undecided: "Henüz karar vermedim / listede yok",
    area: "Alan (m²)",
    type: "Stand tipi",
    types: ["Sıra", "Köşe", "Yarımada", "Ada"],
    systems: [
      { v: "Ahşap (özel tasarım)", d: "Sıfırdan tasarlanır, atölyemizde üretilir." },
      { v: "Maxima (modüler)", d: "Hızlı kurulur, yeniden kullanılır." },
      { v: "Hibrit", d: "Modüler iskelet, ahşap kaplama." },
      { v: "Karar vermedim", d: "Bütçeme göre siz önerin." },
    ],
    name: "Ad soyad",
    company: "Firma",
    phone: "Telefon",
    email: "E-posta (isteğe bağlı)",
    kvkk: "Bilgilerinizi yalnızca bu teklif için kullanırız.",
    kvkkLink: "Aydınlatma metni",
    needFair: "Fuar adını yazın ya da kutuyu işaretleyin.",
    needArea: "Stand alanını m² olarak girin.",
    needSystem: "Bir seçenek belirleyin.",
    needContact: "Ad soyad ve geçerli bir telefon girin.",
    error: "Gönderilemedi. Lütfen tekrar deneyin ya da bizi arayın.",
    tooMany: "Kısa sürede çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.",
    doneTitle: "Talebiniz bize ulaştı.",
    done: "Aynı gün içinde sizi arayıp teklifinizi hazırlayacağız.",
    undecidedText: "Karar verilmedi",
  },
  en: {
    kicker: "Get a free offer",
    lead: "A tailored offer in a few steps.",
    next: "Continue",
    back: "Back",
    send: "Request offer",
    sending: "Sending…",
    q: ["Which fair will you attend?", "How large is your stand?", "What kind of stand do you want?", "Who should we send the offer to?"],
    fair: "Fair",
    fairPh: "Type the fair name, city or industry",
    undecided: "Not decided yet / not listed",
    area: "Area (m²)",
    type: "Stand type",
    types: ["Inline", "Corner", "Peninsula", "Island"],
    systems: [
      { v: "Wooden (custom design)", d: "Designed from scratch, built in our workshop." },
      { v: "Maxima (modular)", d: "Quick to build, reusable." },
      { v: "Hybrid", d: "Modular frame, wooden cladding." },
      { v: "Not decided", d: "Suggest one for my budget." },
    ],
    name: "Full name",
    company: "Company",
    phone: "Phone",
    email: "Email (optional)",
    kvkk: "We use your details only for this offer.",
    kvkkLink: "Privacy notice",
    needFair: "Type the fair name or tick the box.",
    needArea: "Enter the stand area in m².",
    needSystem: "Choose an option.",
    needContact: "Enter your name and a valid phone number.",
    error: "Could not send. Please try again or call us.",
    tooMany: "Too many attempts in a short time. Please try again later.",
    doneTitle: "We have received your request.",
    done: "We will call you the same day and prepare your offer.",
    undecidedText: "Not decided",
  },
  de: {
    kicker: "Kostenloses Angebot",
    lead: "In wenigen Schritten zu Ihrem individuellen Angebot.",
    next: "Weiter",
    back: "Zurück",
    send: "Angebot anfordern",
    sending: "Wird gesendet…",
    q: ["An welcher Messe nehmen Sie teil?", "Wie groß ist Ihr Stand?", "Welche Art von Stand wünschen Sie?", "An wen dürfen wir das Angebot senden?"],
    fair: "Messe",
    fairPh: "Messename, Stadt oder Branche eingeben",
    undecided: "Noch nicht entschieden / nicht aufgeführt",
    area: "Fläche (m²)",
    type: "Standart",
    types: ["Reihe", "Ecke", "Kopf", "Insel"],
    systems: [
      { v: "Holz (individuell)", d: "Von Grund auf entworfen, in unserer Werkstatt gebaut." },
      { v: "Maxima (modular)", d: "Schnell aufgebaut, wiederverwendbar." },
      { v: "Hybrid", d: "Modularer Rahmen, Holzverkleidung." },
      { v: "Noch offen", d: "Empfehlen Sie etwas für mein Budget." },
    ],
    name: "Name",
    company: "Firma",
    phone: "Telefon",
    email: "E-Mail (optional)",
    kvkk: "Wir verwenden Ihre Angaben nur für dieses Angebot.",
    kvkkLink: "Datenschutzhinweis",
    needFair: "Messenamen eingeben oder Kästchen ankreuzen.",
    needArea: "Standfläche in m² eingeben.",
    needSystem: "Bitte eine Option wählen.",
    needContact: "Bitte Namen und gültige Telefonnummer eingeben.",
    error: "Senden fehlgeschlagen. Bitte erneut versuchen oder anrufen.",
    tooMany: "Zu viele Versuche in kurzer Zeit. Bitte später erneut versuchen.",
    doneTitle: "Ihre Anfrage ist bei uns.",
    done: "Wir rufen Sie noch am selben Tag an und erstellen Ihr Angebot.",
    undecidedText: "Noch nicht entschieden",
  },
};

const AREAS = [12, 24, 36, 54, 100];
const field = "h-12 w-full min-w-0 border border-white/15 bg-white/[0.06] px-4 text-[16px] text-white placeholder:text-white/35 focus:border-wawa-accent focus:outline-none";
const label = "block text-[11px] tracking-[0.14em] text-white/55 uppercase";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`h-10 cursor-pointer border px-3.5 text-[14px] transition-colors ${on ? "border-wawa-accent bg-wawa-accent text-wawa-charcoal" : "border-white/20 text-white hover:border-white/60"}`}
    >
      {children}
    </button>
  );
}

export function QuoteWizard({ lang, k, service, fairs, privacyHref }: { lang: Lang; k: SvcLang; service: string; fairs: string[]; privacyHref: string }) {
  const t = T[k];
  const [step, setStep] = useState(0);
  const [a, setA] = useState({ fair: "", undecided: false, area: "", type: "", system: "", name: "", company: "", phone: "", email: "", website: "" });
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const set = (p: Partial<typeof a>) => {
    setA((v) => ({ ...v, ...p }));
    setError(null);
  };
  const LAST = 3;

  const check = () => {
    if (step === 0 && !a.fair.trim() && !a.undecided) return t.needFair;
    if (step === 1 && !(Number(a.area.replace(",", ".")) > 0)) return t.needArea;
    if (step === 2 && !a.system) return t.needSystem;
    if (step === 3 && (!a.name.trim() || a.phone.replace(/\D/g, "").length < 10)) return t.needContact;
    return null;
  };

  const submit = async () => {
    setState("busy");
    const fair = a.fair.trim() || t.undecidedText;
    // Ekibe giden özet her dilde Türkçe başlıklarla yazılır
    const message = [`Hızlı teklif (${service})`, `Fuar: ${fair}`, `Alan: ${a.area} m²`, `Stand tipi: ${a.type || "-"}`, `Stand sistemi: ${a.system}`].join("\n");
    const res = await fetch("/api/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "offer", lang, name: a.name, company: a.company, phone: a.phone, email: a.email, service, area: a.area, location: fair, message, website: a.website }),
    }).catch(() => null);
    if (res?.ok) setState("done");
    else {
      setState("idle");
      setError(res?.status === 429 ? t.tooMany : t.error);
    }
  };

  const go = () => {
    const e = check();
    if (e) return setError(e);
    if (step < LAST) setStep(step + 1);
    else submit();
  };

  return (
    <div className="relative border border-white/10 bg-[#141414]/90 backdrop-blur-md">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-wawa-accent" />
      {state === "done" ? (
        <div className="flex min-h-[340px] flex-col items-start justify-center p-6 sm:p-8" role="status">
          <span className="grid h-12 w-12 place-items-center bg-wawa-accent text-wawa-charcoal">
            <Check className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-6 font-heading text-[20px] leading-[1.3] text-white">{t.doneTitle}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70">{t.done}</p>
        </div>
      ) : (
        <form
          noValidate
          className="p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
        >
          <p className="flex items-center gap-2.5 text-[11px] tracking-[0.16em] text-wawa-accent uppercase">
            <span aria-hidden className="h-px w-6 bg-wawa-accent" />
            {t.kicker}
          </p>
          <p className="mt-2 text-[14px] text-white/60">{t.lead}</p>

          {/* İlerleme */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-[13px] tabular-nums text-white">
              {step + 1}/{LAST + 1}
            </span>
            <span className="flex flex-1 gap-1.5">
              {Array.from({ length: LAST + 1 }, (_, i) => (
                <span key={i} className={`h-[2px] flex-1 transition-colors duration-300 ${i <= step ? "bg-wawa-accent" : "bg-white/15"}`} />
              ))}
            </span>
          </div>

          <div key={step} className="mt-6 min-h-[188px]" style={{ animation: "fadeIn .35s ease" }}>
            <p className="flex items-center gap-3 text-[18px] leading-snug text-white">
              <span className="grid h-7 w-8 shrink-0 place-items-center bg-wawa-accent text-[12px] font-medium tabular-nums text-wawa-charcoal">{String(step + 1).padStart(2, "0")}</span>
              {t.q[step]}
            </p>

            {step === 0 && (
              <div className="mt-5">
                <label>
                  <span className={label}>{t.fair}</span>
                  <input list="svc-fairs-list" value={a.fair} disabled={a.undecided} maxLength={110} onChange={(e) => set({ fair: e.target.value })} placeholder={t.fairPh} className={`mt-2 ${field} disabled:opacity-40`} />
                </label>
                <datalist id="svc-fairs-list">
                  {fairs.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
                <label className="mt-4 flex cursor-pointer items-center gap-3 text-[14px] text-white/80">
                  <input type="checkbox" checked={a.undecided} onChange={(e) => set({ undecided: e.target.checked, fair: e.target.checked ? "" : a.fair })} className="h-4 w-4 accent-[#E7E864]" />
                  {t.undecided}
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="mt-5">
                <span className={label}>{t.area}</span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input inputMode="decimal" aria-label={t.area} value={a.area} maxLength={6} onChange={(e) => set({ area: e.target.value.replace(/[^\d.,]/g, "") })} placeholder="m²" className={`${field} !h-10 !w-24`} />
                  {AREAS.map((n) => (
                    <Chip key={n} on={a.area === String(n)} onClick={() => set({ area: String(n) })}>
                      {n}
                    </Chip>
                  ))}
                </div>
                <span className={`mt-5 ${label}`}>{t.type}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.types.map((x) => (
                    <Chip key={x} on={a.type === x} onClick={() => set({ type: a.type === x ? "" : x })}>
                      {x}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {t.systems.map((s) => {
                  const on = a.system === s.v;
                  return (
                    <button
                      key={s.v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set({ system: s.v })}
                      className={`cursor-pointer border p-3.5 text-left transition-colors ${on ? "border-wawa-accent bg-wawa-accent text-wawa-charcoal" : "border-white/20 text-white hover:border-white/60"}`}
                    >
                      <span className="block text-[15px] font-medium">{s.v}</span>
                      <span className={`mt-1 block text-[12px] leading-snug ${on ? "text-wawa-charcoal/75" : "text-white/55"}`}>{s.d}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input aria-label={t.name} placeholder={`${t.name} *`} autoComplete="name" maxLength={120} value={a.name} onChange={(e) => set({ name: e.target.value })} className={field} />
                <input aria-label={t.company} placeholder={t.company} autoComplete="organization" maxLength={160} value={a.company} onChange={(e) => set({ company: e.target.value })} className={field} />
                <input aria-label={t.phone} placeholder={`${t.phone} *`} type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={a.phone} onChange={(e) => set({ phone: e.target.value })} className={field} />
                <input aria-label={t.email} placeholder={t.email} type="email" autoComplete="email" maxLength={160} value={a.email} onChange={(e) => set({ email: e.target.value })} className={field} />
                <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={a.website} onChange={(e) => set({ website: e.target.value })} />
                <p className="text-[12px] leading-relaxed text-white/50 sm:col-span-2">
                  {t.kvkk}{" "}
                  <Link href={privacyHref} target="_blank" className="underline underline-offset-2 hover:text-white">
                    {t.kvkkLink}
                  </Link>
                </p>
              </div>
            )}
          </div>

          <p role="alert" className="min-h-[22px] text-[13px] text-[#FF9B8F]">
            {error}
          </p>

          <div className="mt-2 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => (setStep(step - 1), setError(null))} className="inline-flex h-12 cursor-pointer items-center gap-2 text-[14px] text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {t.back}
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={state === "busy"}
              className="group inline-flex h-12 cursor-pointer items-center gap-4 bg-wawa-accent px-6 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70"
            >
              {state === "busy" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t.sending}
                </>
              ) : (
                <>
                  {step === LAST ? t.send : t.next}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

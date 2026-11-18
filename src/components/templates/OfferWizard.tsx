"use client";

// Teklif alma sayfası: yormayan, yönlendirmeli form. Önce ne için teklif istendiği seçilir (iç mimarlık / fuar standı),
// sorular ona göre gelir ve çoğu tek tıkla yanıtlanır. Zorunlu olan yalnızca ad ve telefondur.
// Yanıtlar /api/contact/ ucuna tek bir özet olarak gider (ekibe e-posta).
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, Phone, Presentation, Sofa } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { contactInfo } from "@/components/layout/navigation";

type Kind = "interior" | "stand";
type L = "tr" | "en" | "de";

const T = {
  tr: {
    time: "Yaklaşık 1 dakika sürer",
    steps: ["Proje türü", "Proje bilgileri", "Zaman ve bütçe", "İletişim"],
    q0: "Ne için teklif almak istiyorsunuz?",
    kinds: {
      interior: { title: "İç mimarlık", text: "Konut, mağaza, klinik, cafe, ofis: tasarım ve uygulama." },
      stand: { title: "Fuar standı", text: "Yurt içi ve yurt dışı fuarlar için stand tasarımı ve kurulumu." },
    },
    space: "Mekân türü",
    spaces: ["Konut / Villa", "Mağaza", "Klinik", "Cafe / Restoran", "Ofis", "Otel", "Diğer"],
    area: "Alan (m²)",
    areaPh: "Tam ölçü (isteğe bağlı)",
    areasInterior: ["50'den az", "50–100", "100–250", "250–500", "500+"],
    areasStand: ["9–18", "18–36", "36–54", "54–100", "100+"],
    state: "Mekânın durumu",
    states: ["Yeni / boş", "Tadilat", "Kaba inşaat"],
    scope: "Hangi hizmetler? (birden fazla seçilebilir)",
    scopes: ["Tasarım", "Uygulama", "Özel mobilya"],
    fair: "Hangi fuar?",
    fairPh: "Fuar adı ya da şehir (belli değilse boş bırakın)",
    standType: "Stand tipi",
    standTypes: ["Sıra", "Köşe", "Yarımada", "Ada", "Bilmiyorum"],
    system: "Stand sistemi",
    systems: ["Ahşap (özel tasarım)", "Maxima (modüler)", "Karar vermedim"],
    location: "Proje nerede?",
    locationPh: "Şehir ve ilçe (yurt dışıysa ülke)",
    when: "Ne zaman başlamak istiyorsunuz?",
    whens: ["Hemen", "1–3 ay içinde", "3–6 ay içinde", "Araştırıyorum"],
    fairDate: "Fuar tarihi",
    fairDatePh: "Örn. Mart 2027",
    budget: "Bütçe yaklaşımınız (isteğe bağlı)",
    budgets: ["Ekonomik", "Dengeli", "Üst segment", "Henüz belli değil"],
    note: "Eklemek istedikleriniz (isteğe bağlı)",
    notePh: "Örn. mevcut projemiz var, yalnızca uygulama istiyoruz",
    name: "Ad soyad",
    company: "Firma (varsa)",
    phone: "Telefon",
    email: "E-posta (isteğe bağlı)",
    prefer: "Size nasıl ulaşalım?",
    prefers: ["Telefon", "WhatsApp", "E-posta"],
    consent: "Bilgilerimin bu talep için kullanılmasını kabul ediyorum.",
    consentLink: "Aydınlatma metni",
    next: "Devam",
    back: "Geri",
    send: "Teklif iste",
    sending: "Gönderiliyor…",
    needKind: "Bir proje türü seçin.",
    needContact: "Ad soyad ve geçerli bir telefon girin, onay kutusunu işaretleyin.",
    error: "Gönderilemedi. Lütfen tekrar deneyin ya da bizi arayın.",
    tooMany: "Kısa sürede çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.",
    summary: "Talebinizin özeti",
    empty: "Seçimleriniz burada görünecek.",
    promise: ["Teklif ücretsizdir", "Aynı gün içinde size dönüyoruz", "Tasarım, üretim ve uygulama tek ekipte"],
    quick: "Form doldurmak istemiyor musunuz?",
    call: "Arayın",
    doneTitle: "Talebiniz bize ulaştı.",
    done: "Aynı gün içinde sizi arayıp projenizi konuşacağız.",
    nextSteps: ["Sizi arıyoruz: ihtiyacı ve kapsamı birlikte netleştiriyoruz.", "Gerekirse yerinde keşif yapıyor ya da fuar bilgilerini alıyoruz.", "Teklifinizi yazılı olarak iletiyoruz."],
    home: "Anasayfaya dön",
  },
  en: {
    time: "Takes about 1 minute",
    steps: ["Project type", "Project details", "Timing and budget", "Contact"],
    q0: "What would you like an offer for?",
    kinds: {
      interior: { title: "Interior architecture", text: "Homes, stores, clinics, cafes, offices: design and build." },
      stand: { title: "Exhibition stand", text: "Stand design and build for fairs in Türkiye and abroad." },
    },
    space: "Type of space",
    spaces: ["Home / Villa", "Store", "Clinic", "Cafe / Restaurant", "Office", "Hotel", "Other"],
    area: "Area (m²)",
    areaPh: "Exact size (optional)",
    areasInterior: ["Under 50", "50–100", "100–250", "250–500", "500+"],
    areasStand: ["9–18", "18–36", "36–54", "54–100", "100+"],
    state: "Condition of the space",
    states: ["New / empty", "Renovation", "Shell"],
    scope: "Which services? (choose any)",
    scopes: ["Design", "Build", "Custom furniture"],
    fair: "Which fair?",
    fairPh: "Fair name or city (leave empty if not decided)",
    standType: "Stand type",
    standTypes: ["Inline", "Corner", "Peninsula", "Island", "Not sure"],
    system: "Stand system",
    systems: ["Wooden (custom)", "Maxima (modular)", "Not decided"],
    location: "Where is the project?",
    locationPh: "City (and country if abroad)",
    when: "When would you like to start?",
    whens: ["Right away", "Within 1–3 months", "Within 3–6 months", "Just researching"],
    fairDate: "Fair date",
    fairDatePh: "e.g. March 2027",
    budget: "Budget approach (optional)",
    budgets: ["Economical", "Balanced", "Premium", "Not decided"],
    note: "Anything to add? (optional)",
    notePh: "e.g. we already have a design and need the build only",
    name: "Full name",
    company: "Company (if any)",
    phone: "Phone",
    email: "Email (optional)",
    prefer: "How should we reach you?",
    prefers: ["Phone", "WhatsApp", "Email"],
    consent: "I agree to my details being used for this request.",
    consentLink: "Privacy notice",
    next: "Continue",
    back: "Back",
    send: "Request offer",
    sending: "Sending…",
    needKind: "Choose a project type.",
    needContact: "Enter your name and a valid phone number, and tick the consent box.",
    error: "Could not send. Please try again or call us.",
    tooMany: "Too many attempts in a short time. Please try again later.",
    summary: "Your request so far",
    empty: "Your choices will appear here.",
    promise: ["The offer is free", "We get back to you the same day", "Design, production and build in one team"],
    quick: "Prefer not to fill in a form?",
    call: "Call us",
    doneTitle: "We have received your request.",
    done: "We will call you the same day to talk about your project.",
    nextSteps: ["We call you and clarify the need and scope together.", "If needed we visit the site or collect the fair details.", "We send you the offer in writing."],
    home: "Back to home",
  },
  de: {
    time: "Dauert etwa 1 Minute",
    steps: ["Projektart", "Projektdetails", "Zeit und Budget", "Kontakt"],
    q0: "Wofür möchten Sie ein Angebot?",
    kinds: {
      interior: { title: "Innenarchitektur", text: "Wohnen, Läden, Praxen, Cafés, Büros: Planung und Ausführung." },
      stand: { title: "Messestand", text: "Standdesign und Aufbau für Messen in der Türkei und im Ausland." },
    },
    space: "Art des Raums",
    spaces: ["Wohnung / Villa", "Laden", "Praxis", "Café / Restaurant", "Büro", "Hotel", "Sonstiges"],
    area: "Fläche (m²)",
    areaPh: "Genaue Größe (optional)",
    areasInterior: ["Unter 50", "50–100", "100–250", "250–500", "500+"],
    areasStand: ["9–18", "18–36", "36–54", "54–100", "100+"],
    state: "Zustand des Raums",
    states: ["Neu / leer", "Renovierung", "Rohbau"],
    scope: "Welche Leistungen? (Mehrfachauswahl)",
    scopes: ["Planung", "Ausführung", "Möbel nach Maß"],
    fair: "Welche Messe?",
    fairPh: "Messename oder Stadt (leer lassen, wenn offen)",
    standType: "Standart",
    standTypes: ["Reihe", "Ecke", "Kopf", "Insel", "Unsicher"],
    system: "Standsystem",
    systems: ["Holz (individuell)", "Maxima (modular)", "Noch offen"],
    location: "Wo ist das Projekt?",
    locationPh: "Stadt (und Land, falls im Ausland)",
    when: "Wann möchten Sie beginnen?",
    whens: ["Sofort", "In 1–3 Monaten", "In 3–6 Monaten", "Ich informiere mich"],
    fairDate: "Messetermin",
    fairDatePh: "z. B. März 2027",
    budget: "Budgetrahmen (optional)",
    budgets: ["Wirtschaftlich", "Ausgewogen", "Premium", "Noch offen"],
    note: "Möchten Sie etwas ergänzen? (optional)",
    notePh: "z. B. Entwurf vorhanden, nur Ausführung gewünscht",
    name: "Name",
    company: "Firma (falls vorhanden)",
    phone: "Telefon",
    email: "E-Mail (optional)",
    prefer: "Wie dürfen wir Sie erreichen?",
    prefers: ["Telefon", "WhatsApp", "E-Mail"],
    consent: "Ich stimme der Verwendung meiner Angaben für diese Anfrage zu.",
    consentLink: "Datenschutzhinweis",
    next: "Weiter",
    back: "Zurück",
    send: "Angebot anfordern",
    sending: "Wird gesendet…",
    needKind: "Bitte eine Projektart wählen.",
    needContact: "Bitte Namen und gültige Telefonnummer eingeben und zustimmen.",
    error: "Senden fehlgeschlagen. Bitte erneut versuchen oder anrufen.",
    tooMany: "Zu viele Versuche in kurzer Zeit. Bitte später erneut versuchen.",
    summary: "Ihre Anfrage bisher",
    empty: "Ihre Auswahl erscheint hier.",
    promise: ["Das Angebot ist kostenlos", "Wir melden uns noch am selben Tag", "Planung, Produktion und Ausführung aus einer Hand"],
    quick: "Lieber kein Formular?",
    call: "Anrufen",
    doneTitle: "Ihre Anfrage ist bei uns.",
    done: "Wir rufen Sie noch am selben Tag an.",
    nextSteps: ["Wir rufen Sie an und klären Bedarf und Umfang.", "Bei Bedarf besichtigen wir den Ort oder nehmen die Messedaten auf.", "Sie erhalten Ihr Angebot schriftlich."],
    home: "Zur Startseite",
  },
};

const LINE = "border-wawa-charcoal/15";
const field = `h-12 w-full border px-4 text-[15px] text-wawa-charcoal outline-none placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal ${LINE}`;

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 cursor-pointer border px-4 py-2.5 text-[14px] transition-colors ${on ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 text-wawa-charcoal hover:border-wawa-charcoal"}`}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-7 first:mt-0">
      <p className="text-[14px] text-wawa-charcoal/70">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const EMPTY = { space: "", areaRange: "", area: "", state: "", scope: [] as string[], fair: "", standType: "", system: "", location: "", when: "", fairDate: "", budget: "", note: "", name: "", company: "", phone: "", email: "", prefer: "", consent: false, website: "" };

export function OfferWizard({ lang, fairs, privacyHref }: { lang: Lang; fairs: string[]; privacyHref: string }) {
  const k: L = lang === "tr" || lang === "de" ? lang : "en";
  const t = T[k];
  const [kind, setKind] = useState<Kind | null>(null);
  const [step, setStep] = useState(0);
  const [a, setA] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const top = useRef<HTMLDivElement>(null);
  const set = (p: Partial<typeof a>) => {
    setA((v) => ({ ...v, ...p }));
    setError(null);
  };
  const pick = <K extends keyof typeof a>(key: K, value: string) => set({ [key]: a[key] === value ? "" : value } as Partial<typeof a>);
  const go = (n: number) => {
    setStep(n);
    setError(null);
    top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const area = a.area ? `${a.area} m²` : a.areaRange ? `${a.areaRange} m²` : "";
  // Özet: yalnızca doldurulan satırlar; aynı liste ekibe giden mesajı da oluşturur
  const rows: [string, string][] = !kind
    ? []
    : ([
        [t.steps[0], t.kinds[kind].title],
        ...(kind === "interior"
          ? [
              [t.space, a.space],
              [t.area, area],
              [t.state, a.state],
              [t.scope.replace(/\s*\(.*\)$/, "").replace(/\?$/, ""), a.scope.join(", ")],
            ]
          : [
              [t.fair.replace(/\?$/, ""), a.fair],
              [t.area, area],
              [t.standType, a.standType],
              [t.system, a.system],
            ]),
        [t.location.replace(/\?$/, ""), a.location],
        kind === "stand" ? [t.fairDate, a.fairDate] : [t.when.replace(/\?$/, ""), a.when],
        [t.budget.replace(/\s*\(.*\)$/, ""), a.budget],
      ] as [string, string][]).filter(([, v]) => v);

  const submit = async () => {
    if (!a.name.trim() || a.phone.replace(/\D/g, "").length < 10 || !a.consent) return setError(t.needContact);
    setState("busy");
    const message = [...rows.map(([l, v]) => `${l}: ${v}`), a.prefer && `${t.prefer.replace(/\?$/, "")}: ${a.prefer}`, a.note && `\n${a.note}`].filter(Boolean).join("\n");
    const res = await fetch("/api/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "offer", lang, name: a.name, company: a.company, phone: a.phone, email: a.email, service: kind ? T.tr.kinds[kind].title : "", area: a.area || a.areaRange, location: a.location || a.fair, date: a.fairDate || a.when, message, website: a.website }),
    }).catch(() => null);
    if (res?.ok) {
      setState("done");
      top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    } else {
      setState("idle");
      setError(res?.status === 429 ? t.tooMany : t.error);
    }
  };

  const aside = (
    <aside className="lg:col-span-4 lg:col-start-9">
      <div className="lg:sticky lg:top-36">
        <div className="bg-[#F3F2EF] p-6">
          <p className="text-[12px] tracking-[0.14em] text-wawa-charcoal/60 uppercase">{t.summary}</p>
          {rows.length ? (
            <dl className="mt-4 grid gap-3">
              {rows.map(([l, v]) => (
                <div key={l}>
                  <dt className="text-[12px] text-wawa-charcoal/55">{l}</dt>
                  <dd className="text-[15px] text-wawa-charcoal">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-[14px] text-wawa-charcoal/60">{t.empty}</p>
          )}
        </div>
        <ul className={`mt-6 grid gap-3 border-t pt-6 ${LINE}`}>
          {t.promise.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[14px] leading-snug text-wawa-charcoal">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-wawa-accent">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <div className={`mt-6 border-t pt-6 ${LINE}`}>
          <p className="text-[14px] text-wawa-charcoal/70">{t.quick}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={contactInfo.phoneHref} className={`inline-flex h-11 items-center gap-2 border px-4 text-[14px] text-wawa-charcoal hover:border-wawa-charcoal ${LINE}`}>
              <Phone className="h-4 w-4" aria-hidden /> {t.call}: {contactInfo.phoneDisplay}
            </a>
            <a href={contactInfo.whatsappHref} target="_blank" rel="noopener noreferrer" className={`inline-flex h-11 items-center gap-2 border px-4 text-[14px] text-wawa-charcoal hover:border-wawa-charcoal ${LINE}`}>
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </aside>
  );

  if (state === "done")
    return (
      <div ref={top} className="scroll-mt-32 lg:col-span-12" role="status">
        <span className="grid h-14 w-14 place-items-center bg-wawa-accent">
          <Check className="h-6 w-6 text-wawa-charcoal" aria-hidden />
        </span>
        <h2 className="mt-6 font-heading text-[26px] leading-[1.2] text-wawa-charcoal lg:text-[34px]">{t.doneTitle}</h2>
        <p className="mt-3 text-[17px] text-wawa-charcoal/75">{t.done}</p>
        <ol className={`mt-8 grid max-w-[720px] gap-0 border-t ${LINE}`}>
          {t.nextSteps.map((s, i) => (
            <li key={s} className={`flex items-start gap-4 border-b py-4 text-[15px] text-wawa-charcoal ${LINE}`}>
              <span className="w-6 shrink-0 text-[12px] tabular-nums text-wawa-charcoal/50">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </li>
          ))}
        </ol>
        <Link href={lang === "tr" ? "/" : `/${lang}/`} className="mt-8 inline-flex h-12 items-center gap-3 bg-wawa-charcoal px-6 text-[15px] text-white hover:bg-black">
          {t.home} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    );

  return (
    <>
      <div className="lg:col-span-7">
        {/* İlerleme */}
        <div ref={top} className="scroll-mt-32">
          <div className="flex items-baseline justify-between gap-4 text-[13px] text-wawa-charcoal/60">
            <span>
              <span className="tabular-nums text-wawa-charcoal">{step + 1}</span> / 4 · {t.steps[step]}
            </span>
            <span>{t.time}</span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {t.steps.map((s, i) => (
              <span key={s} className={`h-1 flex-1 transition-colors duration-300 ${i < step ? "bg-wawa-accent" : i === step ? "bg-wawa-charcoal" : "bg-wawa-charcoal/12"}`} />
            ))}
          </div>
        </div>

        <form
          noValidate
          className="mt-9"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) go(step + 1);
            else submit();
          }}
        >
          <div key={step} style={{ animation: "fadeIn .35s ease" }}>
            {/* 1. Proje türü: seçince bir sonraki adıma geçer */}
            {step === 0 && (
              <>
                <h2 className="font-heading text-[22px] leading-[1.25] text-wawa-charcoal lg:text-[28px]">{t.q0}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {(["interior", "stand"] as const).map((m) => {
                    const Icon = m === "interior" ? Sofa : Presentation;
                    const on = kind === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setKind(m);
                          go(1);
                        }}
                        className={`group flex cursor-pointer flex-col items-start border p-6 text-left transition-colors ${on ? "border-wawa-charcoal" : "border-wawa-charcoal/15 hover:border-wawa-charcoal"}`}
                      >
                        <span className={`grid h-12 w-12 place-items-center transition-colors ${on ? "bg-wawa-accent" : "bg-[#F3F2EF] group-hover:bg-wawa-accent"}`}>
                          <Icon className="h-5 w-5 text-wawa-charcoal" strokeWidth={1.5} aria-hidden />
                        </span>
                        <span className="mt-5 flex w-full items-center justify-between gap-3 text-[19px] tracking-tight text-wawa-charcoal">
                          {t.kinds[m].title}
                          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
                        </span>
                        <span className="mt-2 text-[14px] leading-relaxed text-wawa-charcoal/65">{t.kinds[m].text}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* 2. Proje bilgileri */}
            {step === 1 && kind === "interior" && (
              <>
                <Group label={t.space}>
                  {t.spaces.map((x) => (
                    <Chip key={x} on={a.space === x} onClick={() => pick("space", x)}>
                      {x}
                    </Chip>
                  ))}
                </Group>
                <Group label={t.area}>
                  {t.areasInterior.map((x) => (
                    <Chip key={x} on={a.areaRange === x && !a.area} onClick={() => set({ areaRange: a.areaRange === x ? "" : x, area: "" })}>
                      {x}
                    </Chip>
                  ))}
                  <input inputMode="decimal" aria-label={t.areaPh} placeholder={t.areaPh} maxLength={7} value={a.area} onChange={(e) => set({ area: e.target.value.replace(/[^\d.,]/g, "") })} className={`${field} !h-11 !w-52`} />
                </Group>
                <Group label={t.state}>
                  {t.states.map((x) => (
                    <Chip key={x} on={a.state === x} onClick={() => pick("state", x)}>
                      {x}
                    </Chip>
                  ))}
                </Group>
                <Group label={t.scope}>
                  {t.scopes.map((x) => (
                    <Chip key={x} on={a.scope.includes(x)} onClick={() => set({ scope: a.scope.includes(x) ? a.scope.filter((y) => y !== x) : [...a.scope, x] })}>
                      {x}
                    </Chip>
                  ))}
                </Group>
              </>
            )}
            {step === 1 && kind === "stand" && (
              <>
                <div>
                  <label htmlFor="offer-fair" className="text-[14px] text-wawa-charcoal/70">
                    {t.fair}
                  </label>
                  <input id="offer-fair" list="offer-fairs" maxLength={110} placeholder={t.fairPh} value={a.fair} onChange={(e) => set({ fair: e.target.value })} className={`mt-2.5 ${field}`} />
                  <datalist id="offer-fairs">
                    {fairs.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>
                <Group label={t.area}>
                  {t.areasStand.map((x) => (
                    <Chip key={x} on={a.areaRange === x && !a.area} onClick={() => set({ areaRange: a.areaRange === x ? "" : x, area: "" })}>
                      {x}
                    </Chip>
                  ))}
                  <input inputMode="decimal" aria-label={t.areaPh} placeholder={t.areaPh} maxLength={7} value={a.area} onChange={(e) => set({ area: e.target.value.replace(/[^\d.,]/g, "") })} className={`${field} !h-11 !w-52`} />
                </Group>
                <Group label={t.standType}>
                  {t.standTypes.map((x) => (
                    <Chip key={x} on={a.standType === x} onClick={() => pick("standType", x)}>
                      {x}
                    </Chip>
                  ))}
                </Group>
                <Group label={t.system}>
                  {t.systems.map((x) => (
                    <Chip key={x} on={a.system === x} onClick={() => pick("system", x)}>
                      {x}
                    </Chip>
                  ))}
                </Group>
              </>
            )}

            {/* 3. Zaman ve bütçe */}
            {step === 2 && (
              <>
                <div>
                  <label htmlFor="offer-location" className="text-[14px] text-wawa-charcoal/70">
                    {t.location}
                  </label>
                  <input id="offer-location" maxLength={120} placeholder={t.locationPh} value={a.location} onChange={(e) => set({ location: e.target.value })} className={`mt-2.5 ${field}`} />
                </div>
                {kind === "stand" ? (
                  <div className="mt-7">
                    <label htmlFor="offer-date" className="text-[14px] text-wawa-charcoal/70">
                      {t.fairDate}
                    </label>
                    <input id="offer-date" maxLength={40} placeholder={t.fairDatePh} value={a.fairDate} onChange={(e) => set({ fairDate: e.target.value })} className={`mt-2.5 ${field}`} />
                  </div>
                ) : (
                  <Group label={t.when}>
                    {t.whens.map((x) => (
                      <Chip key={x} on={a.when === x} onClick={() => pick("when", x)}>
                        {x}
                      </Chip>
                    ))}
                  </Group>
                )}
                <Group label={t.budget}>
                  {t.budgets.map((x) => (
                    <Chip key={x} on={a.budget === x} onClick={() => pick("budget", x)}>
                      {x}
                    </Chip>
                  ))}
                </Group>
                <div className="mt-7">
                  <label htmlFor="offer-note" className="text-[14px] text-wawa-charcoal/70">
                    {t.note}
                  </label>
                  <textarea id="offer-note" rows={3} maxLength={1500} placeholder={t.notePh} value={a.note} onChange={(e) => set({ note: e.target.value })} className={`mt-2.5 ${field} !h-auto resize-none py-3`} />
                </div>
              </>
            )}

            {/* 4. İletişim */}
            {step === 3 && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input aria-label={t.name} placeholder={`${t.name} *`} autoComplete="name" maxLength={120} value={a.name} onChange={(e) => set({ name: e.target.value })} className={field} />
                  <input aria-label={t.company} placeholder={t.company} autoComplete="organization" maxLength={160} value={a.company} onChange={(e) => set({ company: e.target.value })} className={field} />
                  <input aria-label={t.phone} placeholder={`${t.phone} *`} type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={a.phone} onChange={(e) => set({ phone: e.target.value })} className={field} />
                  <input aria-label={t.email} placeholder={t.email} type="email" autoComplete="email" maxLength={160} value={a.email} onChange={(e) => set({ email: e.target.value })} className={field} />
                  <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={a.website} onChange={(e) => set({ website: e.target.value })} />
                </div>
                <Group label={t.prefer}>
                  {t.prefers.map((x) => (
                    <Chip key={x} on={a.prefer === x} onClick={() => pick("prefer", x)}>
                      {x}
                    </Chip>
                  ))}
                </Group>
                <label className="mt-7 flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-wawa-charcoal/75">
                  <input type="checkbox" checked={a.consent} onChange={(e) => set({ consent: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[#1A1A1A]" />
                  <span>
                    {t.consent}{" "}
                    <Link href={privacyHref} target="_blank" className="underline underline-offset-2">
                      {t.consentLink}
                    </Link>
                  </span>
                </label>
              </>
            )}
          </div>

          <p role="alert" className="mt-5 min-h-[22px] text-[14px] text-[#B42318]">
            {error}
          </p>

          {step > 0 && (
            <div className={`mt-3 flex items-center justify-between gap-3 border-t pt-6 ${LINE}`}>
              <button type="button" onClick={() => go(step - 1)} className="inline-flex h-12 cursor-pointer items-center gap-2 px-1 text-[15px] text-wawa-charcoal hover:underline">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {t.back}
              </button>
              <button
                type="submit"
                disabled={state === "busy"}
                className={`group inline-flex h-14 cursor-pointer items-center gap-4 px-8 text-[15px] font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
                  step === 3 ? "bg-wawa-accent text-wawa-charcoal hover:bg-wawa-charcoal hover:text-white" : "bg-wawa-charcoal text-white hover:bg-black"
                }`}
              >
                {state === "busy" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t.sending}
                  </>
                ) : (
                  <>
                    {step === 3 ? t.send : t.next}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
      {aside}
    </>
  );
}

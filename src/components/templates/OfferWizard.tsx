"use client";

// Teklif alma sayfası: yormayan, yönlendirmeli form. Önce ne için teklif istendiği seçilir (iç mimarlık / fuar standı),
// sorular ona göre gelir ve çoğu tek tıkla yanıtlanır. Zorunlu olan yalnızca ad ve telefondur.
// Yanıtlar /api/contact/ ucuna tek bir özet olarak gider (ekibe e-posta).
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, Paperclip, Phone, Presentation, Sofa, X } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { contactInfo } from "@/components/layout/navigation";
import type { FairPick } from "@/content/fairs";
import { FairCombobox } from "./FairCombobox";
import { estimate, euroRange, type PriceRegion, type StandSystem } from "@/content/stand-prices";

const FILE_EXT = /\.(pdf|jpe?g|png|webp|dwg|dxf|zip)$/i;
const FILE_MAX = 3 * 1024 * 1024;
type Attach = { name: string; size: number; data: string };
const readBase64 = (file: File) =>
  new Promise<string>((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).slice(String(r.result).indexOf(",") + 1));
    r.onerror = () => no(r.error);
    r.readAsDataURL(file);
  });
const TR_CITIES = /istanbul|i̇stanbul|izmir|i̇zmir|ankara|antalya|bursa|konya|türkiye|turkiye/i;
// m² aralığı ("36–54", "500+", "50'den az") ya da tam m² → [en az, en çok]
function areaBounds(exact: string, range: string): [number, number] | null {
  const n = Number(exact.replace(",", "."));
  if (n > 0) return [n, n];
  const nums = (range.match(/\d+/g) ?? []).map(Number);
  if (!nums.length) return null;
  if (/\+$/.test(range)) return [nums[0], nums[0] * 1.5];
  if (nums.length === 1) return [Math.max(9, nums[0] / 2), nums[0]];
  return [nums[0], nums[1]];
}

type Kind = "interior" | "stand";
type L = "tr" | "en" | "de";

const T = {
  tr: {
    ownership: "Satın almak mı, kiralamak mı?",
    ownerships: ["Satın almak","Kiralamak","Bilmiyorum"],
    estimate: "Yaklaşık bütçe",
    estimateNote: "KDV hariç planlama tahmini; kesin fiyat teklifle netleşir.",
    files: "Dosya ekleyin (isteğe bağlı)",
    filesHint: "Kat planı, fuar yerleşimi, brif ya da görsel · en fazla 3 dosya, toplam 3 MB · PDF, JPG, PNG, DWG, DXF, ZIP",
    filesError: "Dosya eklenemedi: en fazla 3 dosya ve toplam 3 MB; PDF, JPG, PNG, WebP, DWG, DXF ya da ZIP.",
    filePick: "Dosya seçin",
    meetTitle: "Görüşme saati seçin",
    meetLead: "Size uygun zamanı seçin, o saatte arayalım. İsterseniz WhatsApp'tan da devam edebilirsiniz.",
    meetSend: "Bu saatte arayın",
    meetSent: "Tamam, seçtiğiniz saatte arayacağız.",
    meetError: "Saat iletilemedi; sizi yine aynı gün içinde arayacağız.",
    whatsapp: "WhatsApp'tan yazın",
    waText: "Merhaba, web sitesinden teklif talebi gönderdim.",
    slots: ["10:00","12:00","14:00","16:00"],
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
    ownership: "Buy or rent?",
    ownerships: ["Buy","Rent","Not sure"],
    estimate: "Estimated budget",
    estimateNote: "Planning estimate excl. VAT; the offer sets the final price.",
    files: "Attach files (optional)",
    filesHint: "Floor plan, hall layout, brief or images · up to 3 files, 3 MB total · PDF, JPG, PNG, DWG, DXF, ZIP",
    filesError: "Could not attach: up to 3 files and 3 MB total; PDF, JPG, PNG, WebP, DWG, DXF or ZIP.",
    filePick: "Choose files",
    meetTitle: "Pick a time for a call",
    meetLead: "Choose a time that suits you and we will call then. You can also continue on WhatsApp.",
    meetSend: "Call me at this time",
    meetSent: "Done, we will call you at the time you chose.",
    meetError: "We could not send the time; we will still call you the same day.",
    whatsapp: "Message us on WhatsApp",
    waText: "Hello, I sent an offer request on your website.",
    slots: ["10:00","12:00","14:00","16:00"],
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
    ownership: "Kaufen oder mieten?",
    ownerships: ["Kaufen","Mieten","Unsicher"],
    estimate: "Geschätztes Budget",
    estimateNote: "Planungswert zzgl. MwSt.; der endgültige Preis steht im Angebot.",
    files: "Dateien anhängen (optional)",
    filesHint: "Grundriss, Hallenplan, Briefing oder Bilder · max. 3 Dateien, insgesamt 3 MB · PDF, JPG, PNG, DWG, DXF, ZIP",
    filesError: "Anhängen nicht möglich: max. 3 Dateien und 3 MB; PDF, JPG, PNG, WebP, DWG, DXF oder ZIP.",
    filePick: "Dateien wählen",
    meetTitle: "Termin für einen Anruf wählen",
    meetLead: "Wählen Sie eine passende Zeit, wir rufen Sie dann an. Sie können auch per WhatsApp weitermachen.",
    meetSend: "Zu dieser Zeit anrufen",
    meetSent: "Gut, wir rufen Sie zur gewählten Zeit an.",
    meetError: "Die Zeit konnte nicht gesendet werden; wir rufen Sie trotzdem am selben Tag an.",
    whatsapp: "Per WhatsApp schreiben",
    waText: "Hallo, ich habe auf Ihrer Website eine Angebotsanfrage gesendet.",
    slots: ["10:00","12:00","14:00","16:00"],
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

function slotDays() {
  const out: { key: string; label: string }[] = [];
  const d = new Date();
  while (out.length < 4) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    out.push({ key: d.toDateString(), label: d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" }) });
  }
  return out;
}

const EMPTY = { ownership: "", space: "", areaRange: "", area: "", state: "", scope: [] as string[], fair: "", standType: "", system: "", location: "", when: "", fairDate: "", budget: "", note: "", name: "", company: "", phone: "", email: "", prefer: "", consent: false, website: "" };

export function OfferWizard({ lang, fairs, privacyHref }: { lang: Lang; fairs: FairPick[]; privacyHref: string }) {
  const k: L = lang === "tr" || lang === "de" ? lang : "en";
  const t = T[k];
  const [kind, setKind] = useState<Kind | null>(null);
  const [step, setStep] = useState(0);
  const [a, setA] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const top = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<Attach[]>([]);
  const [meet, setMeet] = useState<{ slot: string; state: "idle" | "busy" | "sent" | "error" }>({ slot: "", state: "idle" });

  // Ön doldurma: yapay zeka stüdyosundan (oturum deposu) ya da bağlantıdan (?tur=stand&fuar=…&alan=…)
  useEffect(() => {
    const t0 = setTimeout(() => {
      const q = new URLSearchParams(window.location.search);
      let pre: { kind?: string; area?: string; standTypeIndex?: number; spaceIndex?: number; note?: string } = {};
      try {
        pre = JSON.parse(sessionStorage.getItem("wawa-offer-prefill") ?? "{}");
        sessionStorage.removeItem("wawa-offer-prefill");
      } catch {
        pre = {};
      }
      const kindQ = pre.kind ?? q.get("tur") ?? "";
      const k: Kind | null = kindQ === "stand" ? "stand" : kindQ === "interior" || kindQ === "ic-mimarlik" ? "interior" : null;
      if (!k) return;
      setKind(k);
      setA((v) => ({
        ...v,
        fair: q.get("fuar")?.slice(0, 110) ?? v.fair,
        area: (pre.area ?? q.get("alan") ?? "").replace(/[^\d.,]/g, "").slice(0, 7),
        standType: typeof pre.standTypeIndex === "number" ? (t.standTypes[pre.standTypeIndex] ?? "") : v.standType,
        space: typeof pre.spaceIndex === "number" ? (t.spaces[pre.spaceIndex] ?? "") : v.space,
        note: pre.note ? pre.note.slice(0, 1500) : v.note,
      }));
      setStep(1);
    }, 0);
    return () => clearTimeout(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      const total = next.reduce((n, x) => n + x.size, 0) + file.size;
      if (next.length >= 3 || !FILE_EXT.test(file.name) || total > FILE_MAX) return setError(t.filesError);
      next.push({ name: file.name, size: file.size, data: await readBase64(file) });
    }
    setFiles(next);
    setError(null);
  };

  // Canlı bütçe tahmini (stand): sistem seçiliyse o sistem, değilse ahşap ve Maxima ayrı; bölge fuardan çıkarılır
  const standEstimate = (() => {
    if (kind !== "stand") return null;
    const b = areaBounds(a.area, a.areaRange);
    if (!b) return null;
    const typed = a.fair.toLocaleLowerCase("tr-TR");
    const known = typed ? fairs.find((x) => typed.includes(x.v.split(" · ")[0].toLocaleLowerCase("tr-TR"))) : undefined;
    const region: PriceRegion = known ? (known.r === "tr" ? "tr" : "abroad") : !a.fair.trim() || TR_CITIES.test(a.fair) ? "tr" : "abroad";
    const systems: StandSystem[] = a.system === t.systems[0] ? ["ahsap"] : a.system === t.systems[1] ? ["maxima"] : ["ahsap", "maxima"];
    return systems.map((sys) => ({ sys, range: estimate(sys, region, b[0], b[1])! }));
  })();
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
              [t.ownership.replace(/\?$/, ""), a.ownership],
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
      body: JSON.stringify({ kind: "offer", lang, name: a.name, company: a.company, phone: a.phone, email: a.email, service: kind ? T.tr.kinds[kind].title : "", area: a.area || a.areaRange, location: a.location || a.fair, date: a.fairDate || a.when, message, website: a.website, files: files.map((x) => ({ name: x.name, data: x.data })) }),
    }).catch(() => null);
    if (res?.ok) {
      setState("done");
      top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    } else {
      setState("idle");
      setError(res?.status === 429 ? t.tooMany : res?.status === 400 && files.length ? t.filesError : t.error);
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
          {standEstimate && (
            <div className="mt-5 border-t border-wawa-charcoal/15 pt-4">
              <p className="text-[12px] text-wawa-charcoal/55">{t.estimate}</p>
              {standEstimate.map(({ sys, range }) => (
                <p key={sys} className="mt-1 flex flex-wrap justify-between gap-x-3 text-[15px] text-wawa-charcoal">
                  <span>{sys === "ahsap" ? t.systems[0] : t.systems[1]}</span>
                  <span className="tabular-nums">{euroRange(range)}</span>
                </p>
              ))}
              <p className="mt-2 text-[12px] leading-snug text-wawa-charcoal/55">{t.estimateNote}</p>
            </div>
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
        <div className="mt-10 max-w-[720px] bg-[#F3F2EF] p-6">
          <h3 className="text-[18px] font-medium tracking-tight text-wawa-charcoal">{t.meetTitle}</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-wawa-charcoal/70">{t.meetLead}</p>
          {meet.state === "sent" ? (
            <p className="mt-4 flex items-center gap-2 text-[15px] text-wawa-charcoal">
              <Check className="h-4 w-4" aria-hidden /> {t.meetSent} ({meet.slot})
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-3">
                {slotDays().map((d) => (
                  <div key={d.key} className="flex flex-wrap items-center gap-2">
                    <span className="w-28 shrink-0 text-[13px] text-wawa-charcoal/70">{d.label}</span>
                    {t.slots.map((h) => {
                      const v = `${d.label} ${h}`;
                      return (
                        <Chip key={h} on={meet.slot === v} onClick={() => setMeet({ slot: v, state: "idle" })}>
                          {h}
                        </Chip>
                      );
                    })}
                  </div>
                ))}
              </div>
              {meet.state === "error" && <p className="mt-3 text-[14px] text-[#B42318]">{t.meetError}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!meet.slot || meet.state === "busy"}
                  onClick={async () => {
                    setMeet((m) => ({ ...m, state: "busy" }));
                    const res = await fetch("/api/contact/", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ kind: "meeting", lang, name: a.name, phone: a.phone, slot: meet.slot, message: rows.map(([l, v]) => `${l}: ${v}`).join("\n") }),
                    }).catch(() => null);
                    setMeet((m) => ({ ...m, state: res?.ok ? "sent" : "error" }));
                  }}
                  className="inline-flex h-12 cursor-pointer items-center gap-3 bg-wawa-charcoal px-6 text-[15px] text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {meet.state === "busy" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  {t.meetSend}
                </button>
                <a
                  href={`${contactInfo.whatsappHref}?text=${encodeURIComponent(`${t.waText} ${a.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-12 items-center gap-2 border bg-white px-5 text-[15px] text-wawa-charcoal hover:border-wawa-charcoal ${LINE}`}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden /> {t.whatsapp}
                </a>
              </div>
            </>
          )}
        </div>
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
                  <div className="mt-2.5">
                    <FairCombobox id="offer-fair" lang={lang} picks={fairs} value={a.fair} onChange={(v) => set({ fair: v })} placeholder={t.fairPh} className={field} />
                  </div>
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
                {a.system && a.system !== t.systems[0] && (
                  <Group label={t.ownership}>
                    {t.ownerships.map((x) => (
                      <Chip key={x} on={a.ownership === x} onClick={() => pick("ownership", x)}>
                        {x}
                      </Chip>
                    ))}
                  </Group>
                )}
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
                <div className="mt-7">
                  <p className="text-[14px] text-wawa-charcoal/70">{t.files}</p>
                  <label className={`mt-2.5 flex cursor-pointer items-center gap-3 border border-dashed px-4 py-3.5 text-[14px] text-wawa-charcoal hover:border-wawa-charcoal ${LINE}`}>
                    <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1">
                      {t.filePick}
                      <span className="block text-[12px] leading-snug text-wawa-charcoal/55">{t.filesHint}</span>
                    </span>
                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.dwg,.dxf,.zip" className="sr-only" onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />
                  </label>
                  {files.length > 0 && (
                    <ul className="mt-2 grid gap-1">
                      {files.map((x, i) => (
                        <li key={x.name + i} className="flex items-center justify-between gap-3 bg-[#F3F2EF] px-3 py-2 text-[13px] text-wawa-charcoal">
                          <span className="min-w-0 truncate">{x.name}</span>
                          <span className="flex shrink-0 items-center gap-2 text-wawa-charcoal/55">
                            {(x.size / 1024 / 1024).toFixed(1)} MB
                            <button type="button" aria-label={`${x.name} kaldır`} onClick={() => setFiles(files.filter((_, k) => k !== i))} className="grid h-7 w-7 cursor-pointer place-items-center hover:text-wawa-charcoal">
                              <X className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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

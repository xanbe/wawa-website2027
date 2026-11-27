"use client";

// Yapay zeka tasarım stüdyosu: proje türü → ölçü → içerik → stil → üret.
// Sağda ölçüye göre canlı çizilen 3D taslak; üretimde bu taslak ve ölçüler yapay zekaya gönderilir.
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Download, Loader2, Minus, Plus, Presentation, RotateCcw, Sofa, Upload, X } from "lucide-react";
import {
  COPY,
  DEFAULT_BRIEF,
  LIMITS,
  SPACES,
  STAND_TYPES,
  STYLES,
  TONES,
  WALLS,
  clamp,
  round1,
  type Mode,
  type ReferenceProject,
  type StandType,
  type StudioBrief,
  type StudioLang,
} from "./studio-data";
import type { Moves, SceneApi, View } from "./StudioScene";
import { useTurnstile } from "@/components/ui/useTurnstile";
import { OptionCombobox } from "@/components/templates/OptionCombobox";
import { estimate, euroRange } from "@/content/stand-prices";

const StudioScene = dynamic(() => import("./StudioScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-wawa-charcoal/40" aria-hidden />
    </div>
  ),
});

const LINE = "border-wawa-charcoal/15";
const NO_MOVES: Moves = {};
// Üç aşama: alan ve ölçüler → sektör ve stil → iletişim ve üretim
const STAGE_T = {
  tr: { names: ["Alan ve ölçüler", "Sektör ve stil", "Görsel"], next: "Devam", back: "Geri" },
  en: { names: ["Space and size", "Industry and style", "Image"], next: "Continue", back: "Back" },
  de: { names: ["Fläche und Maße", "Branche und Stil", "Bild"], next: "Weiter", back: "Zurück" },
};
// Sektör önerileri: yazarken listeden seçilebilir, listede olmayan da yazılabilir
const SECTORS = {
  tr: ["Enerji", "Gıda ve içecek", "Tekstil ve hazır giyim", "Otomotiv", "Makine ve metal", "Plastik ve ambalaj", "İnşaat ve yapı", "Mobilya ve dekorasyon", "Sağlık ve ilaç", "Kozmetik", "Teknoloji ve yazılım", "Lojistik", "Kuyum", "Savunma", "Turizm"],
  en: ["Energy", "Food and beverage", "Textile and apparel", "Automotive", "Machinery and metal", "Plastics and packaging", "Construction", "Furniture and decoration", "Healthcare and pharma", "Cosmetics", "Technology and software", "Logistics", "Jewellery", "Defence", "Tourism"],
  de: ["Energie", "Lebensmittel und Getränke", "Textil und Bekleidung", "Automobil", "Maschinenbau und Metall", "Kunststoff und Verpackung", "Bau", "Möbel und Einrichtung", "Gesundheit und Pharma", "Kosmetik", "Technologie und Software", "Logistik", "Schmuck", "Verteidigung", "Tourismus"],
};
// 3D sahnedeki sürükleme ve logo yükleme metinleri
const SCENE_T = {
  tr: {
    previewLead: "Görseli ücretsiz üretin. Beğenirseniz telefonunuzu doğrulayarak yüksek çözünürlüklü halini alın; tasarımınız ekibimize de ulaşır.",
    budgetTitle: "Yaklaşık bütçe · Türkiye, KDV hariç",
    budgetNote: "Planlama tahminidir; yurt dışı fuarlarda aralık yükselir.",
    priceGuide: "Fiyat rehberi",
    feeLink: "İç mimari tasarım bütçenizi hesaplayın",
    systems: { ahsap: "Ahşap (özel tasarım)", maxima: "Maxima (modüler, kiralık da olur)" },
    previewBadge: "Önizleme",
    unlockCta: "Yüksek çözünürlüklü görseli alın",
    unlockTitle: "Yüksek çözünürlüklü görsel",
    unlockLead: "Telefonunuza gelen kodla doğrulayın; filigransız görsel ekranda açılır ve tasarımınız ekibimize iletilir.",
    verifyAndGet: "Doğrula ve görseli al",
    toOffer: "Bu tasarımla teklif alın",
    limitPreview: "Bugünkü 2 ücretsiz önizleme hakkınız doldu. Telefonunuzu doğrulayarak üretmeye devam edebilirsiniz.",
    expired: "Önizlemenin süresi doldu. Görseli yeniden üretin.",
    testNote: "Test modu: yapay zekâ kapalı olduğu için görsel yerine 3D taslak gösteriliyor.",
    offNote: "Görsel üretimi şu an kapalı. Ölçülerinizle doğrudan teklif alabilirsiniz.",
    failNote: "Görsel şu an üretilemedi. Biraz sonra yeniden deneyin ya da ölçülerinizle doğrudan teklif alın.",
    sendCode: "Doğrulama kodu gönder",
    sending: "Kod gönderiliyor…",
    codeLabel: "Telefonunuza gelen 6 haneli kod",
    codeSent: "Kodu telefonunuza SMS ile gönderdik.",
    resend: "Kodu yeniden gönder",
    codeNeed: "Telefonunuza gelen 6 haneli kodu girin.",
    testHint: "Test modu: SMS gönderilmez, kod 123456.",
    verified: "Telefonunuz doğrulandı.",
    free: "Alanınızın ölçülerini ve yüksekliğini girin; yapay zeka bu ölçülere sadık kalarak sektörünüze uygun tasarımı kendisi kurar.",
    logo: "Marka logosu (isteğe bağlı)",
    logoPick: "Logo yükleyin",
    logoHint: "PNG, JPG, SVG ya da WebP · en fazla 2 MB",
    logoRemove: "Logoyu kaldır",
    logoError: "Dosya açılamadı. 2 MB'tan küçük bir PNG, JPG, SVG ya da WebP seçin.",
  },
  en: {
    previewLead: "Generate the image for free. If you like it, verify your phone to get the high-resolution version; your design also reaches our team.",
    budgetTitle: "Estimated budget · Türkiye, excl. VAT",
    budgetNote: "A planning estimate; ranges are higher for fairs abroad.",
    priceGuide: "Price guide",
    feeLink: "Estimate your interior design budget",
    systems: { ahsap: "Wooden (custom)", maxima: "Maxima (modular, also for rent)" },
    previewBadge: "Preview",
    unlockCta: "Get the high-resolution image",
    unlockTitle: "High-resolution image",
    unlockLead: "Verify with the code sent to your phone; the image opens without watermark and your design is sent to our team.",
    verifyAndGet: "Verify and get the image",
    toOffer: "Get an offer for this design",
    limitPreview: "You have used today's 2 free previews. Verify your phone to keep generating.",
    expired: "The preview has expired. Please generate the image again.",
    testNote: "Test mode: AI is off, so the 3D sketch is shown instead of an image.",
    offNote: "Image generation is currently off. You can request an offer with your dimensions.",
    failNote: "The image could not be generated right now. Please try again shortly or request an offer with your dimensions.",
    sendCode: "Send verification code",
    sending: "Sending code…",
    codeLabel: "6-digit code sent to your phone",
    codeSent: "We sent the code to your phone by SMS.",
    resend: "Resend code",
    codeNeed: "Enter the 6-digit code sent to your phone.",
    testHint: "Test mode: no SMS is sent, the code is 123456.",
    verified: "Your phone is verified.",
    free: "Enter the size and height of your space; the AI keeps to those dimensions and designs freely for your industry.",
    logo: "Brand logo (optional)",
    logoPick: "Upload logo",
    logoHint: "PNG, JPG, SVG or WebP · up to 2 MB",
    logoRemove: "Remove logo",
    logoError: "Could not open the file. Choose a PNG, JPG, SVG or WebP under 2 MB.",
  },
  de: {
    previewLead: "Erstellen Sie das Bild kostenlos. Gefällt es Ihnen, bestätigen Sie Ihre Telefonnummer und erhalten Sie die hochauflösende Version; Ihr Entwurf geht auch an unser Team.",
    budgetTitle: "Geschätztes Budget · Türkei, zzgl. MwSt.",
    budgetNote: "Planungswert; für Messen im Ausland liegen die Spannen höher.",
    priceGuide: "Preisleitfaden",
    feeLink: "Planungsbudget berechnen",
    systems: { ahsap: "Holz (individuell)", maxima: "Maxima (modular, auch zur Miete)" },
    previewBadge: "Vorschau",
    unlockCta: "Hochauflösendes Bild erhalten",
    unlockTitle: "Hochauflösendes Bild",
    unlockLead: "Bestätigen Sie mit dem Code auf Ihrem Telefon; das Bild öffnet sich ohne Wasserzeichen und Ihr Entwurf geht an unser Team.",
    verifyAndGet: "Bestätigen und Bild erhalten",
    toOffer: "Angebot für diesen Entwurf",
    limitPreview: "Die 2 kostenlosen Vorschauen für heute sind aufgebraucht. Bestätigen Sie Ihre Telefonnummer, um weiterzumachen.",
    expired: "Die Vorschau ist abgelaufen. Bitte das Bild neu erstellen.",
    testNote: "Testmodus: KI ist aus, daher wird die 3D-Skizze statt eines Bildes gezeigt.",
    offNote: "Die Bilderstellung ist derzeit aus. Sie können mit Ihren Maßen ein Angebot anfordern.",
    failNote: "Das Bild konnte gerade nicht erstellt werden. Bitte versuchen Sie es gleich erneut oder fordern Sie mit Ihren Maßen ein Angebot an.",
    sendCode: "Bestätigungscode senden",
    sending: "Code wird gesendet…",
    codeLabel: "6-stelliger Code auf Ihrem Telefon",
    codeSent: "Wir haben den Code per SMS gesendet.",
    resend: "Code erneut senden",
    codeNeed: "Bitte den 6-stelligen Code eingeben.",
    testHint: "Testmodus: Es wird keine SMS gesendet, der Code ist 123456.",
    verified: "Ihre Telefonnummer ist bestätigt.",
    free: "Geben Sie Fläche und Höhe an; die KI hält diese Maße ein und entwirft frei, passend zu Ihrer Branche.",
    logo: "Markenlogo (optional)",
    logoPick: "Logo hochladen",
    logoHint: "PNG, JPG, SVG oder WebP · max. 2 MB",
    logoRemove: "Logo entfernen",
    logoError: "Datei konnte nicht geöffnet werden. Bitte PNG, JPG, SVG oder WebP unter 2 MB wählen.",
  },
};
const TONE_SWATCH = { sicak: "#C9AE8A", notr: "#C8C2B8", acik: "#E2DCD1", koyu: "#6E5B48" } as const;
const fmtNum = (n: number, lang: StudioLang) => n.toLocaleString(lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-GB", { maximumFractionDigits: 2 });

// ---------------------------------------------------------------- Küçük parçalar
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-7 first:mt-0">
      <p className="text-[13px] text-wawa-charcoal/60">{label}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function Choice({ active, onClick, children, className = "" }: { active: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`cursor-pointer border px-3.5 py-2.5 text-left text-[14px] transition-colors ${
        active ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 text-wawa-charcoal hover:border-wawa-charcoal"
      } ${className}`}
    >
      {children}
    </button>
  );
}

// Numaralı bölüm başlığı: form tek sayfada, bölümler alt alta
function SecHead({ title, first = false }: { n?: number; title: string; first?: boolean }) {
  return (
    <h2 className={`flex items-center gap-3 text-[17px] font-medium tracking-tight text-wawa-charcoal [&+*]:mt-5 ${first ? "" : "mt-10 border-t border-wawa-charcoal/15 pt-8"}`}>
      {title}
    </h2>
  );
}

// Hazır ölçüler (metre): tek tıkla genişlik ve derinlik dolar; kutulardan elle de değiştirilebilir
const STAND_PRESETS: [number, number][] = [
  [3, 3],
  [4, 3],
  [6, 4],
  [6, 6],
  [8, 6],
  [10, 8],
];
const ROOM_PRESETS: [number, number][] = [
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [8, 10],
];
const PRESET_T = { tr: "Hazır ölçüler", en: "Common sizes", de: "Gängige Größen" };

function Presets({ label, list, active, onPick }: { label: string; list: [number, number][]; active: [number, number]; onPick: (a: number, b: number) => void }) {
  return (
    <div className="mt-7">
      <p className="text-[13px] text-wawa-charcoal/60">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {list.map(([a, b]) => (
          <Choice key={`${a}x${b}`} active={active[0] === a && active[1] === b} onClick={() => onPick(a, b)} className="tabular-nums">
            {a} × {b} m
          </Choice>
        ))}
      </div>
    </div>
  );
}

// Metre girişi: eksi/artı düğmeleri ve elle yazılabilen kutu
function MeterInput({ label, value, range, step, onChange }: { label: string; value: number; range: readonly [number, number]; step: number; onChange: (n: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const set = (n: number) => onChange(round1(clamp(n, range)));
  return (
    <div>
      <p className="text-[13px] text-wawa-charcoal/60">{label}</p>
      <div className={`mt-2.5 flex h-12 items-stretch border ${LINE}`}>
        <button type="button" aria-label="−" onClick={() => set(value - step)} className="grid w-11 shrink-0 cursor-pointer place-items-center border-r border-wawa-charcoal/15 hover:bg-[#F3F2EF]">
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <label className="flex min-w-0 flex-1 items-center justify-center gap-1">
          <input
            inputMode="decimal"
            aria-label={label}
            value={draft ?? String(value).replace(".", ",")}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const n = Number((draft ?? "").replace(",", "."));
              if (draft !== null && Number.isFinite(n)) set(n);
              setDraft(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-16 bg-transparent text-center text-[17px] tabular-nums text-wawa-charcoal outline-none"
          />
          <span className="text-[14px] text-wawa-charcoal/55">m</span>
        </label>
        <button type="button" aria-label="+" onClick={() => set(value + step)} className="grid w-11 shrink-0 cursor-pointer place-items-center border-l border-wawa-charcoal/15 hover:bg-[#F3F2EF]">
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// Stand tipi simgesi: kalın çizgi = duvar (kapalı kenar), ince = koridora açık
function StandPlan({ type }: { type: StandType }) {
  const closed = { sira: ["t", "l", "r"], kose: ["t", "l"], yarimada: ["t"], ada: [] as string[] }[type];
  const s = (k: string) => (closed.includes(k) ? 5 : 1);
  return (
    <svg viewBox="0 0 40 30" className="h-7 w-9" aria-hidden>
      <line x1="2" y1="2" x2="38" y2="2" stroke="currentColor" strokeWidth={s("t")} />
      <line x1="2" y1="2" x2="2" y2="28" stroke="currentColor" strokeWidth={s("l")} />
      <line x1="38" y1="2" x2="38" y2="28" stroke="currentColor" strokeWidth={s("r")} />
      <line x1="2" y1="28" x2="38" y2="28" stroke="currentColor" strokeWidth={1} strokeDasharray="3 2" />
    </svg>
  );
}

// 3D görüntüsünü yapay zekaya gönderilecek boyuta indirir
async function shrink(url: string, max = 1600): Promise<string> {
  const img = new window.Image();
  img.src = url;
  await img.decode();
  const scale = Math.min(1, max / img.width);
  if (scale === 1) return url;
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.88);
}

// Sunucuya giden brif (referans görseli ve ekipman listesi gönderilmez)
function payloadBriefOf(brief: StudioBrief, logo: boolean) {
  return { ...brief, refSrc: null, stand: { ...brief.stand, elements: [], logo } };
}

// ---------------------------------------------------------------- Stüdyo
export function AiStudio({
  lang,
  title,
  references,
  privacyHref,
  offerHref,
}: {
  lang: StudioLang;
  title: string;
  references: { interior: ReferenceProject[]; stand: ReferenceProject[] };
  privacyHref: string;
  offerHref: string;
}) {
  const C = COPY[lang];
  const [brief, setBrief] = useState<StudioBrief>(DEFAULT_BRIEF);
  const [stage, setStage] = useState(0);
  const G = STAGE_T[lang];
  const top = useRef<HTMLDivElement>(null);
  const goStage = (n: number) => {
    setStage(n);
    top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const [lead, setLead] = useState({ name: "", phone: "", email: "", consent: false, website: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // Sonuç: önizleme (filigranlı) + mühür ya da doğrulama sonrası tam görsel
  const [result, setResult] = useState<{ preview: string | null; sealed: string | null; image: string | null; test: boolean; configured?: boolean } | null>(null);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const lastSketch = useRef<string | null>(null);
  // Önizlemenin üretildiği brif: mühür bu brife bağlıdır, açarken aynısı gönderilir
  const lastBrief = useRef<ReturnType<typeof payloadBriefOf> | null>(null);
  const { ref: humanRef, getToken: humanToken } = useTurnstile(lang);
  const [show, setShow] = useState<"3d" | "render">("3d");
  const [view, setView] = useState<View>("persp");
  const S = SCENE_T[lang];
  // Telefon doğrulaması: kod gönderilir, girilen kod üretim isteğiyle birlikte sunucuda doğrulanır.
  // pass: doğrulanmış telefon için sunucunun verdiği kısa süreli izin (yeniden üretimde SMS gerekmez)
  const [otp, setOtp] = useState({ token: "", code: "", sent: false, test: false, busy: false });
  const [pass, setPass] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const api = useRef<SceneApi | null>(null);
  const onSceneReady = useCallback((a: SceneApi) => {
    api.current = a;
  }, []);

  const s = brief.stand;
  // Yapay zekaya yalnızca alan ve yükseklik gider: taslakta stand elemanı çizilmez
  const bareStand = useMemo(() => ({ ...s, elements: [] }), [s]);
  const r = brief.room;
  const upd = (p: Partial<StudioBrief>) => setBrief((b) => ({ ...b, ...p }));
  const updStand = (p: Partial<StudioBrief["stand"]>) => setBrief((b) => ({ ...b, stand: { ...b.stand, ...p } }));
  const updRoom = (p: Partial<StudioBrief["room"]>) => setBrief((b) => ({ ...b, room: { ...b.room, ...p } }));
  const pickLogo = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type) || file.size > 2_000_000) return setLogoError(true);
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(typeof reader.result === "string" ? reader.result : null);
      setLogoError(false);
    };
    reader.onerror = () => setLogoError(true);
    reader.readAsDataURL(file);
  };


  const summary = useMemo(() => {
    if (brief.mode === "stand") return `${fmtNum(s.w, lang)} × ${fmtNum(s.d, lang)} m · ${fmtNum(round1(s.w * s.d), lang)} m² · ${C.standTypes[s.type].title}`;
    return `${C.spaces[r.space]} · ${fmtNum(r.w, lang)} × ${fmtNum(r.l, lang)} m · ${fmtNum(round1(r.w * r.l), lang)} m²`;
  }, [brief.mode, s, r, lang, C]);

  const chooseMode = (m: Mode) => {
    upd({ mode: m, refSrc: null });
    setResult(null);
    setShow("3d");
  };

  const leadValid = () => Boolean(lead.name.trim()) && lead.phone.replace(/\D/g, "").length >= 10 && lead.consent;

  async function sendCode() {
    setError(null);
    if (!leadValid()) return setError(C.errors.invalid);
    setOtp((o) => ({ ...o, busy: true }));
    const turnstile = await humanToken();
    const res = await fetch("/api/fee/send-code/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone: lead.phone, consent: lead.consent, turnstile }) }).catch(() => null);
    const json = (res ? await res.json().catch(() => ({})) : {}) as { token?: string; testMode?: boolean; error?: string };
    if (!res?.ok || !json.token) {
      setOtp((o) => ({ ...o, busy: false }));
      return setError(json.error ?? C.errors.failed);
    }
    setOtp({ token: json.token, code: "", sent: true, test: Boolean(json.testMode), busy: false });
  }

  const payloadBrief = () => payloadBriefOf(brief, Boolean(logo));
  type Reply = { image?: string | null; preview?: string | null; sealed?: string | null; test?: boolean; configured?: boolean; error?: string; message?: string; pass?: string };
  const errorText = (j: Reply) =>
    j.error === "code" ? (j.message ?? S.codeNeed) : j.error === "bot" ? C.errors.failed : j.error === "too_many_preview" ? S.limitPreview : j.error === "expired" ? S.expired : j.error === "too_many" ? C.errors.too_many : j.error === "invalid" ? C.errors.invalid : C.errors.failed;
  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/ai/render/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lang, website: lead.website, ...body }) }).catch(() => null);
    const json = ((res ? await res.json().catch(() => ({})) : {}) ?? {}) as Reply;
    if (json.pass) setPass(json.pass);
    return { ok: Boolean(res?.ok), json };
  }
  async function captureSketch() {
    const raw = api.current?.capture();
    if (!raw) throw new Error("capture");
    lastSketch.current = await shrink(raw);
    return lastSketch.current;
  }

  // Görsel üret: doğrulanmamış kişiye filigranlı önizleme, doğrulanmış kişiye doğrudan tam görsel
  async function generate() {
    setError(null);
    setStatus("loading");
    try {
      const sketch = await captureSketch();
      const auth = pass ? { pass, name: lead.name, email: lead.email, consent: lead.consent } : { turnstile: await humanToken() };
      lastBrief.current = payloadBrief();
      const { ok, json } = await post({ brief: lastBrief.current, sketch, ...auth });
      if (!ok) {
        setStatus("error");
        setError(errorText(json));
        if (json.error === "too_many_preview") setUnlockOpen(true);
        return;
      }
      setResult({ preview: json.preview ?? null, sealed: json.sealed ?? null, image: json.image ?? null, test: Boolean(json.test), configured: json.configured !== false });
      setUnlockOpen(false);
      setStatus("done");
    } catch {
      setStatus("error");
      setError(C.errors.failed);
    }
  }

  // Telefonu doğrula: önizleme varsa mührü açar, yoksa (günlük sınır) doğrulanmış olarak üretir
  async function unlock() {
    setError(null);
    if (!leadValid()) return setError(C.errors.invalid);
    if (!pass && otp.code.length !== 6) return setError(S.codeNeed);
    setStatus("loading");
    try {
      const auth = pass ? { pass } : { token: otp.token, code: otp.code };
      const common = { name: lead.name, email: lead.email, consent: lead.consent, ...auth };
      const { ok, json } = result?.sealed
        ? await post({ op: "unlock", sealed: result.sealed, sketch: lastSketch.current, brief: lastBrief.current ?? payloadBrief(), ...common })
        : await post({ sketch: await captureSketch(), brief: payloadBrief(), ...common });
      if (!ok) {
        setStatus(result ? "done" : "error");
        setError(errorText(json));
        return;
      }
      setResult((prev) => ({ preview: prev?.preview ?? null, sealed: null, image: json.image ?? null, test: Boolean(json.test ?? prev?.test), configured: json.configured !== false }));
      setUnlockOpen(false);
      setStatus("done");
    } catch {
      setStatus(result ? "done" : "error");
      setError(C.errors.failed);
    }
  }

  // Bu tasarımla teklif al: teklif formu ölçüler ve tasarım notuyla dolu açılır
  // Teklif formundaki mekân türü sırası: konut, ofis, mağaza, kafe, klinik, otel, güzellik, spor, diğer
  const SPACE_TO_OFFER: Record<string, number> = { salon: 0, mutfak: 0, yatak: 0, ofis: 1, magaza: 2, cafe: 3, klinik: 4 };
  const goOffer = () => {
    const stand = brief.mode === "stand";
    const prefill = stand
      ? { kind: "stand", area: String(round1(s.w * s.d)), standTypeIndex: STAND_TYPES.indexOf(s.type), note: `Yapay zekâ stüdyosu: ${summary}${s.sector ? ` · ${s.sector}` : ""}${result?.image ? " · görsel ekibe iletildi" : ""}` }
      : { kind: "interior", area: String(round1(r.w * r.l)), spaceIndex: SPACE_TO_OFFER[r.space] ?? 8, note: `Yapay zekâ stüdyosu: ${summary}${result?.image ? " · görsel ekibe iletildi" : ""}` };
    try {
      sessionStorage.setItem("wawa-offer-prefill", JSON.stringify(prefill));
    } catch {
      /* depolama kapalıysa form boş açılır */
    }
    window.location.assign(offerHref);
  };


  return (
    <section className="bg-white pt-20 lg:pt-[116px]" lang={lang}>
      <div className="mx-auto w-full max-w-[860px] px-4 sm:px-6 lg:pt-12 lg:pb-20">
        {/* ------------------------------------------------ Panel */}
        <div>
          <div className={`border-b pt-7 pb-6 lg:pt-0 ${LINE}`}>
            <h1 className="font-heading text-[22px] leading-[1.25] font-normal text-wawa-charcoal lg:text-[30px]">{title}</h1>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-wawa-charcoal/70">{S.free}</p>
            <ol ref={top as never} className="mt-7 grid scroll-mt-32 grid-cols-3 gap-2">
              {G.names.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    disabled={i > stage}
                    onClick={() => goStage(i)}
                    aria-current={i === stage ? "step" : undefined}
                    className="w-full cursor-pointer text-left disabled:cursor-default"
                  >
                    <span className={`block h-1 transition-colors ${i === stage ? "bg-wawa-charcoal" : i < stage ? "bg-wawa-accent" : "bg-wawa-charcoal/12"}`} />
                    <span className={`mt-2.5 flex items-baseline gap-2 text-[13px] ${i === stage ? "text-wawa-charcoal" : "text-wawa-charcoal/50"}`}>
                      <span className="tabular-nums">{i + 1}</span>
                      <span className="truncate">{label}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="py-8">
            <div>
              <div className={stage === 0 ? "" : "hidden"}>
              {/* 1. Proje türü */}
              <SecHead n={1} title={C.modeTitle} first />
              <div className="grid grid-cols-2 gap-2">
                {(["interior", "stand"] as const).map((m) => {
                  const Icon = m === "interior" ? Sofa : Presentation;
                  const active = brief.mode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={active}
                      onClick={() => chooseMode(m)}
                      className={`flex cursor-pointer items-center gap-3 border px-4 py-3.5 text-left text-[15px] transition-colors ${
                        active ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 text-wawa-charcoal hover:border-wawa-charcoal"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                      {C.modes[m].title}
                    </button>
                  );
                })}
              </div>

              {/* 2. Ölçüler */}
              <SecHead n={2} title={C.dimsTitle} />
              {brief.mode === "stand" && (
                <>
                  <Field label={C.standType}>
                    <div className="grid grid-cols-4 gap-2">
                      {STAND_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          aria-pressed={s.type === t}
                          onClick={() => updStand({ type: t })}
                          className={`flex cursor-pointer flex-col items-center gap-1.5 border px-1 py-3 transition-colors ${
                            s.type === t ? "border-wawa-charcoal bg-wawa-charcoal text-white" : "border-wawa-charcoal/20 text-wawa-charcoal hover:border-wawa-charcoal"
                          }`}
                        >
                          <StandPlan type={t} />
                          <span className="text-[13px]">{C.standTypes[t].title}</span>
                          <span className={`text-[11px] ${s.type === t ? "text-white/70" : "text-wawa-charcoal/50"}`}>{C.standTypes[t].text}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Presets label={PRESET_T[lang]} list={STAND_PRESETS} active={[s.w, s.d]} onPick={(w, d) => updStand({ w, d })} />
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MeterInput label={C.width} value={s.w} range={LIMITS.stand.w} step={0.5} onChange={(w) => updStand({ w })} />
                    <MeterInput label={C.depth} value={s.d} range={LIMITS.stand.d} step={0.5} onChange={(d) => updStand({ d })} />
                    <MeterInput label={C.height} value={s.h} range={LIMITS.stand.h} step={0.1} onChange={(h) => updStand({ h })} />
                    <div className="flex flex-col justify-end">
                      <p className="text-[13px] text-wawa-charcoal/60">{C.area}</p>
                      <p className="mt-2.5 flex h-12 items-center bg-[#F3F2EF] px-4 font-heading text-[18px] tabular-nums text-wawa-charcoal">
                        {fmtNum(round1(s.w * s.d), lang)} m²
                      </p>
                    </div>
                  </div>
                </>
              )}
              {brief.mode === "interior" && (
                <>
                  <Field label={C.space}>
                    <div className="flex flex-wrap gap-2">
                      {SPACES.map((sp) => (
                        <Choice key={sp} active={r.space === sp} onClick={() => updRoom({ space: sp })}>
                          {C.spaces[sp]}
                        </Choice>
                      ))}
                    </div>
                  </Field>
                  <Presets label={PRESET_T[lang]} list={ROOM_PRESETS} active={[r.w, r.l]} onPick={(w, l) => updRoom({ w, l })} />
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MeterInput label={C.width} value={r.w} range={LIMITS.room.w} step={0.5} onChange={(w) => updRoom({ w })} />
                    <MeterInput label={C.length} value={r.l} range={LIMITS.room.l} step={0.5} onChange={(l) => updRoom({ l })} />
                    <MeterInput label={C.ceiling} value={r.h} range={LIMITS.room.h} step={0.1} onChange={(h) => updRoom({ h })} />
                    <div className="flex flex-col justify-end">
                      <p className="text-[13px] text-wawa-charcoal/60">{C.area}</p>
                      <p className="mt-2.5 flex h-12 items-center bg-[#F3F2EF] px-4 font-heading text-[18px] tabular-nums text-wawa-charcoal">
                        {fmtNum(round1(r.w * r.l), lang)} m²
                      </p>
                    </div>
                  </div>
                  <Field label={C.windowWall}>
                    <div className="grid grid-cols-4 gap-2">
                      {WALLS.map((w) => (
                        <Choice key={w} active={r.window === w} onClick={() => updRoom({ window: w })} className="text-center">
                          {C.walls[w]}
                        </Choice>
                      ))}
                    </div>
                  </Field>
                  <Field label={C.doorWall}>
                    <div className="grid grid-cols-4 gap-2">
                      {WALLS.map((w) => (
                        <Choice key={w} active={r.door === w} onClick={() => updRoom({ door: w })} className="text-center">
                          {C.walls[w]}
                        </Choice>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              </div>
              <div className={stage === 1 ? "" : "hidden"}>
              {/* 3. İçerik */}
              <SecHead n={3} title={C.contentTitle} first />
              {brief.mode === "stand" && (
                <>
                  <Field label={C.sector}>
                    <OptionCombobox
                      value={s.sector}
                      onChange={(sector) => updStand({ sector })}
                      options={SECTORS[lang]}
                      placeholder={C.sectorPlaceholder}
                      className={`h-12 w-full border px-4 text-[15px] text-wawa-charcoal outline-none placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal ${LINE}`}
                    />
                  </Field>
                  <Field label={C.brandColor}>
                    <div className={`flex h-12 items-center gap-3 border px-2 ${LINE}`}>
                      <input type="color" value={s.color} onChange={(e) => updStand({ color: e.target.value })} aria-label={C.brandColor} className="h-8 w-10 cursor-pointer border-0 bg-transparent p-0" />
                      <span className="text-[15px] uppercase tabular-nums text-wawa-charcoal">{s.color}</span>
                    </div>
                  </Field>
                  <Field label={S.logo}>
                    {logo ? (
                      <div className={`flex h-16 items-center gap-3 border px-3 ${LINE}`}>
                        {/* Yüklenen logo (data URL) */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logo} alt="" className="h-10 w-24 object-contain" />
                        <span className="flex-1" />
                        <button type="button" onClick={() => setLogo(null)} className="inline-flex h-10 cursor-pointer items-center gap-2 px-2 text-[14px] text-wawa-charcoal hover:underline">
                          <X className="h-4 w-4" aria-hidden />
                          {S.logoRemove}
                        </button>
                      </div>
                    ) : (
                      <label className={`flex h-16 cursor-pointer items-center gap-3 border border-dashed px-4 text-[14px] text-wawa-charcoal transition-colors hover:border-wawa-charcoal ${LINE}`}>
                        <Upload className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="flex-1">
                          {S.logoPick}
                          <span className="block text-[12px] text-wawa-charcoal/55">{S.logoHint}</span>
                        </span>
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(e) => pickLogo(e.target.files?.[0])} />
                      </label>
                    )}
                    {logoError && (
                      <p role="alert" className="mt-2 text-[13px] text-[#B3261E]">
                        {S.logoError}
                      </p>
                    )}
                  </Field>
                </>
              )}
              {brief.mode === "interior" && (
                <Field label={C.tone}>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map((t) => (
                      <Choice key={t} active={r.tone === t} onClick={() => updRoom({ tone: t })} className="flex items-center gap-3">
                        <span className="h-5 w-5 shrink-0 border border-black/10" style={{ background: TONE_SWATCH[t] }} />
                        {C.tones[t]}
                      </Choice>
                    ))}
                  </div>
                </Field>
              )}

              {/* 4. Stil ve referans */}
              <SecHead n={4} title={C.styleTitle} />
              {
                <>
                  <Field label={C.styleLabel}>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map((st) => {
                        const on = brief.styles.includes(st);
                        return (
                          <Choice key={st} active={on} onClick={() => upd({ styles: on ? brief.styles.filter((x) => x !== st) : [...brief.styles, st].slice(-2) })}>
                            {C.styles[st]}
                          </Choice>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label={C.notes}>
                    <textarea
                      value={brief.notes}
                      maxLength={300}
                      rows={3}
                      onChange={(e) => upd({ notes: e.target.value })}
                      placeholder={C.notesPlaceholder}
                      className={`w-full resize-none border px-4 py-3 text-[15px] text-wawa-charcoal outline-none placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal ${LINE}`}
                    />
                  </Field>
                </>
              }

              </div>
              <div className={stage === 2 ? "" : "hidden"}>
              {/* 5. Görsel: önce ücretsiz önizleme, SMS ile tam görsel */}
              <SecHead n={5} title={C.generateTitle} first />
              <p className="text-[15px] leading-relaxed text-wawa-charcoal/75">{S.previewLead}</p>
              <p className="mt-5 bg-[#F3F2EF] px-4 py-3 text-[14px] text-wawa-charcoal">{summary}</p>
              {brief.mode === "stand" ? (
                <div className={`mt-3 border px-4 py-4 ${LINE}`}>
                  <p className="text-[12px] tracking-[0.12em] text-wawa-charcoal/55 uppercase">{S.budgetTitle}</p>
                  <dl className="mt-2 grid gap-1 text-[15px] text-wawa-charcoal">
                    {(["ahsap", "maxima"] as const).map((sys) => {
                      const range = estimate(sys, "tr", round1(s.w * s.d));
                      return range ? (
                        <div key={sys} className="flex flex-wrap justify-between gap-x-4">
                          <dt>{S.systems[sys]}</dt>
                          <dd className="tabular-nums">{euroRange(range)}</dd>
                        </div>
                      ) : null;
                    })}
                  </dl>
                  <p className="mt-2 text-[13px] text-wawa-charcoal/60">
                    {S.budgetNote}{" "}
                    {lang === "tr" && (
                      <Link href="/fuar-standi-fiyatlari/" className="underline underline-offset-2">
                        {S.priceGuide}
                      </Link>
                    )}
                  </p>
                </div>
              ) : (
                lang === "tr" && (
                  <Link href="/butce-planlama/" className={`group mt-3 flex items-center justify-between gap-4 border px-4 py-3 text-[14px] text-wawa-charcoal hover:border-wawa-charcoal ${LINE}`}>
                    {S.feeLink}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                )
              )}

              {!result && (
                <button
                  type="button"
                  onClick={generate}
                  disabled={status === "loading"}
                  className="group mt-6 inline-flex h-14 w-full cursor-pointer items-center justify-center gap-3 bg-wawa-accent px-7 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white disabled:cursor-wait disabled:opacity-70"
                >
                  {status === "loading" && !unlockOpen ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      {C.generating}
                    </>
                  ) : (
                    <>
                      {C.generate}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </>
                  )}
                </button>
              )}

              {result && (
                <div className="mt-6" aria-live="polite">
                  {result.image || result.preview ? (
                    <figure className="relative">
                      {/* Üretilen görsel (data URL); görünce sayfa ona kayar */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={(result.image ?? result.preview)!} alt={C.resultTitle} ref={(el) => el?.scrollIntoView({ block: "center", behavior: "smooth" })} className="w-full bg-wawa-charcoal" />
                      {!result.image && <span className="absolute top-0 left-0 bg-wawa-accent px-2.5 py-1 text-[12px] font-medium text-wawa-charcoal">{S.previewBadge}</span>}
                    </figure>
                  ) : (
                    <p className="bg-[#F3F2EF] p-4 text-[14px] text-wawa-charcoal">{result.configured === false ? S.offNote : S.failNote}</p>
                  )}
                  {result.test && <p className="mt-2 text-[12px] text-wawa-charcoal/55">{S.testNote}</p>}
                  {result.image && <p className="mt-3 text-[14px] leading-relaxed text-wawa-charcoal/70">{C.sentNote}</p>}
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {result.image ? (
                      <a href={result.image} download="wawa-tasarim.jpg" className={`inline-flex h-12 cursor-pointer items-center justify-center gap-3 border text-[15px] text-wawa-charcoal hover:border-wawa-charcoal disabled:cursor-wait disabled:opacity-60 ${LINE}`}>
                        <Download className="h-4 w-4" aria-hidden />
                        {C.download}
                      </a>
                    ) : (
                      result.preview && (
                        <button type="button" onClick={() => setUnlockOpen(true)} className="inline-flex h-12 cursor-pointer items-center justify-center gap-3 bg-wawa-accent px-5 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white">
                          {S.unlockCta}
                        </button>
                      )
                    )}
                    <button type="button" onClick={goOffer} className="group inline-flex h-12 cursor-pointer items-center justify-center gap-3 bg-wawa-charcoal px-5 text-[15px] text-white transition-colors hover:bg-black">
                      {S.toOffer}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </button>
                    <button type="button" disabled={status === "loading"} onClick={generate} className={`inline-flex h-12 cursor-pointer items-center justify-center gap-3 border text-[15px] text-wawa-charcoal hover:border-wawa-charcoal disabled:cursor-wait disabled:opacity-60 ${LINE}`}>
                      {status === "loading" && !unlockOpen ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RotateCcw className="h-4 w-4" aria-hidden />}
                      {C.regenerate}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        setStatus("idle");
                        setShow("3d");
                        goStage(0);
                      }}
                      className={`inline-flex h-12 cursor-pointer items-center justify-center gap-3 border text-[15px] text-wawa-charcoal hover:border-wawa-charcoal disabled:cursor-wait disabled:opacity-60 ${LINE}`}
                    >
                      {C.edit}
                    </button>
                  </div>
                </div>
              )}

              {unlockOpen && !result?.image && (
                <div className={`mt-8 border-t pt-6 ${LINE}`}>
                  <h3 className="text-[17px] font-medium tracking-tight text-wawa-charcoal">{S.unlockTitle}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-wawa-charcoal/70">{S.unlockLead}</p>
                    <form
                      className="mt-5 grid gap-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (pass || otp.sent) unlock();
                        else sendCode();
                      }}
                    >
                      {(
                        [
                          ["name", C.name, "text", "name"],
                          ["phone", C.phone, "tel", "tel"],
                          ["email", C.email, "email", "email"],
                        ] as const
                      ).map(([k, label, type, ac]) => (
                        <label key={k} className="block">
                          <span className="text-[13px] text-wawa-charcoal/60">{label}</span>
                          <input
                            type={type}
                            autoComplete={ac}
                            value={lead[k]}
                            onChange={(e) => {
                              setLead((l) => ({ ...l, [k]: e.target.value }));
                              // Numara değişince önceki kod ve doğrulama geçersiz olur
                              if (k === "phone") {
                                setOtp({ token: "", code: "", sent: false, test: false, busy: false });
                                setPass(null);
                              }
                            }}
                            className={`mt-1.5 h-12 w-full border px-4 text-[15px] text-wawa-charcoal outline-none focus:border-wawa-charcoal ${LINE}`}
                          />
                        </label>
                      ))}
                      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={lead.website} onChange={(e) => setLead((l) => ({ ...l, website: e.target.value }))} />
                      <label className="mt-1 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-wawa-charcoal/70">
                        <input type="checkbox" checked={lead.consent} onChange={(e) => setLead((l) => ({ ...l, consent: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-[#1A1A1A]" />
                        <span>
                          {C.consent}{" "}
                          <Link href={privacyHref} target="_blank" className="underline underline-offset-2">
                            {C.consentLink}
                          </Link>
                        </span>
                      </label>
                      {pass ? (
                        <p className="flex items-center gap-2 text-[14px] text-wawa-charcoal/75">
                          <span aria-hidden className="grid h-5 w-5 place-items-center bg-wawa-accent text-[12px] text-wawa-charcoal">✓</span>
                          {S.verified}
                        </p>
                      ) : (
                        otp.sent && (
                          <div className="bg-[#F3F2EF] p-4">
                            <label className="block">
                              <span className="text-[13px] text-wawa-charcoal/70">{S.codeLabel}</span>
                              <input
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                autoFocus
                                value={otp.code}
                                onChange={(e) => setOtp((o) => ({ ...o, code: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                                className={`mt-1.5 h-12 w-40 border bg-white px-4 text-[20px] tracking-[0.4em] tabular-nums text-wawa-charcoal outline-none focus:border-wawa-charcoal ${LINE}`}
                              />
                            </label>
                            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-wawa-charcoal/65">
                              {otp.test ? S.testHint : S.codeSent}
                              <button type="button" disabled={otp.busy} onClick={sendCode} className="cursor-pointer underline underline-offset-4 hover:text-wawa-charcoal disabled:opacity-50">
                                {S.resend}
                              </button>
                            </p>
                          </div>
                        )
                      )}
                      <button
                        type="submit"
                        disabled={status === "loading" || otp.busy}
                        className="group mt-2 inline-flex h-14 cursor-pointer items-center justify-center gap-3 bg-wawa-accent px-7 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white disabled:cursor-wait disabled:opacity-70"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            {C.generating}
                          </>
                        ) : (
                          <>
                            {pass || otp.sent ? S.verifyAndGet : otp.busy ? S.sending : S.sendCode}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                          </>
                        )}
                      </button>
                    </form>
                </div>
              )}
              <div ref={humanRef} className="mt-4 empty:hidden" />
              {error && (
                <p role="alert" className="mt-4 text-[14px] text-[#B42318]">
                  {error}
                </p>
              )}
              </div>

              {/* Aşamalar arası gezinme; son aşamada üretim düğmesi formun kendisindedir */}
              {(stage < 2 || !result) && (
                <div className={`mt-10 flex items-center justify-between gap-3 border-t pt-6 ${LINE}`}>
                  {stage > 0 ? (
                    <button type="button" onClick={() => goStage(stage - 1)} className="inline-flex h-12 cursor-pointer items-center gap-2 px-1 text-[15px] text-wawa-charcoal hover:underline">
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      {G.back}
                    </button>
                  ) : (
                    <span />
                  )}
                  {stage < 2 && (
                    <button
                      type="button"
                      onClick={() => goStage(stage + 1)}
                      className="group inline-flex h-12 cursor-pointer items-center gap-3 bg-wawa-charcoal px-7 text-[15px] text-white transition-colors hover:bg-black"
                    >
                      {G.next}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 3D taslak kullanıcıya gösterilmez: ekran dışında, sabit boyutta çizilir ve üretimde yapay zekaya gönderilir */}
        <div aria-hidden className="pointer-events-none fixed top-0 -left-[300vw] h-[720px] w-[1152px]">
          <StudioScene mode={brief.mode} stand={bareStand} room={r} lang={lang} onReady={onSceneReady} moves={NO_MOVES} bare logo={brief.mode === "stand" ? logo : null} />
        </div>
      </div>
    </section>
  );
}

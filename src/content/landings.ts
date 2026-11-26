// Hizmet sayfalarının açılış sayfası kurgusu (TR, EN, DE). Her sayfa kendi başına bir site gibi detaylıdır.
// Metinler eski sitenin hizmet sayfalarındaki bilgilere dayanır; sayı ve doğrulanamayan iddia yoktur.
// Eski SEO metni sayfanın "Detaylı bilgi" bölümünde aynen korunur.
// Veriler landings.json (sayfalar) ve process.json (ortak süreç ve kapsam kartları) dosyalarında durur;
// yönetim paneli bu dosyaları düzenleyip commit eder. Bu modül yalnızca veriyi tiplendirip dışa aktarır.
import data from "./landings.json";
import processData from "./process.json";

export type Landing = {
  kicker: string;
  title: string;
  lead: string;
  heroImages: string[];
  h1?: string; // sayfadaki H1 (yoksa eski sayfanın başlığı)
  heroVideo?: string; // açılış videosu (YouTube kimliği)
  highlights: { title: string; text: string }[];
  intro: { title: string; text: string };
  offerings?: { title: string; text: string; image: string; href?: string }[];
  offeringsTitle?: string;
  process: { title: string; text: string }[];
  processTitle?: string;
  blocks?: { title: string; lead?: string; items: { title: string; text: string }[] }[];
  projectCategories?: string[];
  projectPaths?: string[];
  // Hizmet kapsamı kartları (görselsiz): başlık, açıklama ve madde listesi
  scope?: { title: string; text: string; features: string[] }[];
  showReach?: boolean;
  showBrands?: boolean;
};

type Step = { title: string; text: string };
type ScopeCard = { title: string; text: string; features: string[] };
const P = processData as {
  standProcess: Record<"tr" | "en" | "de", Step[]>;
  interiorProcess: Record<"tr" | "en" | "de", Step[]>;
  interiorScope: Record<"tr" | "en" | "de", ScopeCard[]>;
};

export const STAND_PROCESS: Step[] = P.standProcess.tr;
export const INTERIOR_PROCESS: Step[] = P.interiorProcess.tr;
// İç mimarlık hizmet kapsamı (önceki sitedeki iç mimarlık sayfasından)
export const INTERIOR_SCOPE: ScopeCard[] = P.interiorScope.tr;

// Türkçe sayfalar ve İngilizce, Almanca sürümleri tek kayıtta (adres -> sayfa)
export const landings: Record<string, Landing> = data as Record<string, Landing>;

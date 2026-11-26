// İçmimarlık proje en az ücreti hesabı.
// Kaynak: TMMOB İçmimarlar Odası "En Az Ücret Bedelleri Hesaplama Esasları Şartnamesi" (26.09.2019, 33/283),
// "PİD İçin Ücret Oranları Cetveli" ve Çevre, Şehircilik ve İklim Değişikliği Bakanlığı
// "2026 Yılı Yapı Yaklaşık Birim Maliyetleri Hakkında Tebliğ" (Resmî Gazete 03.02.2026, sayı 33157).
// Formül: PAÜ = YYA × BM × PİD oranı × HBO × KK

export const TARIFF_YEAR = 2026;
export const SOURCE_URL = "https://www.icmo.org.tr/en_az_ucret";

// Yapı sınıfı grupları (birim maliyetler ve oran cetveli yalnızca sunucuda: fee-server.ts)
export type BuildingGroup = "III-A" | "III-B" | "III-C" | "IV-A" | "IV-B" | "IV-C" | "V-A" | "V-B" | "V-C" | "V-D";

// İçmimarlık hizmet bölümü oranları (toplam %100)
export const STAGES = [
  { id: "rolove", label: "Rölöve", share: 10 },
  { id: "on-proje", label: "Ön proje", share: 20 },
  { id: "kesin-proje", label: "Kesin proje ve malzeme seçimi", share: 30 },
  { id: "uygulama", label: "Uygulama projesi ve imalat detayları", share: 35 },
  { id: "metraj", label: "Mahal listesi, metraj ve iş programı", share: 5 },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

type Variant = { id: string; label: string; group: BuildingGroup };

// Ziyaretçiye yalnızca kendi bildiği şey sorulur. Bina yüksekliği gibi teknik ayrıntılar sorulmaz:
// daire, ofis ve restoranda en yaygın durum (21,5 m'ye kadar bina) varsayılır;
// villada sınıf, girilen alandan kendiliğinden belirlenir.
export const PROJECT_TYPES: { id: string; label: string; question?: string; variants: Variant[] }[] = [
  { id: "daire", label: "Daire", variants: [{ id: "standart", label: "Daire", group: "III-B" }] },
  {
    id: "villa",
    label: "Villa / müstakil",
    // Alan girildiğinde computeFee doğru sınıfı seçer (villaVariant)
    variants: [
      { id: "200-alti", label: "200 m² altı", group: "III-B" },
      { id: "200-500", label: "200–500 m²", group: "III-C" },
      { id: "500-ustu", label: "500 m² ve üzeri", group: "IV-B" },
    ],
  },
  { id: "ofis", label: "Ofis", variants: [{ id: "standart", label: "Ofis", group: "III-C" }] },
  {
    id: "magaza",
    label: "Mağaza & showroom",
    question: "Mağazanın yeri",
    variants: [
      { id: "cadde", label: "Cadde / bina içi", group: "III-C" },
      { id: "avm", label: "AVM", group: "IV-A" },
    ],
  },
  { id: "restoran", label: "Restoran & kafe", variants: [{ id: "standart", label: "Restoran & kafe", group: "III-C" }] },
  {
    id: "klinik",
    label: "Klinik",
    question: "Klinik türü",
    variants: [
      { id: "dis", label: "Diş kliniği", group: "III-C" },
      { id: "tip", label: "Tıp merkezi", group: "IV-A" },
      { id: "fizik", label: "Fizik tedavi", group: "IV-B" },
    ],
  },
  {
    id: "otel",
    label: "Otel",
    question: "Otel sınıfı",
    variants: [
      { id: "apart", label: "Apart", group: "III-B" },
      { id: "1-2", label: "1–2 yıldız", group: "IV-A" },
      { id: "3", label: "3 yıldız", group: "IV-C" },
      { id: "4", label: "4 yıldız", group: "V-B" },
      { id: "5", label: "5 yıldız", group: "V-D" },
    ],
  },
];

export type FeeInput = {
  typeId: string;
  variantId: string;
  area: number;
  stages: StageId[];
  control: boolean;
  renders: number;
};

export type FeeResult = {
  group: BuildingGroup;
  unitCost: number;
  pidRate: number;
  hbo: number;
  projectFee: number;
  controlFee: number;
  renderFee: number;
  total: number;
};

// Gösterilen aralığın üst sınırı: en az ücretin 1,5 katı
export const RANGE_FACTOR = 1.5;

export function feeRange(total: number) {
  return { min: total, max: Math.round(total * RANGE_FACTOR) };
}

export const AREA_MIN = 10;
export const AREA_MAX = 100000;
export const RENDERS_MAX = 50;

export function findVariant(typeId: string, variantId: string) {
  return PROJECT_TYPES.find((t) => t.id === typeId)?.variants.find((v) => v.id === variantId) ?? null;
}

export function validateFeeInput(raw: unknown): FeeInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const area = Number(r.area);
  const renders = Number(r.renders ?? 0);
  const stages = Array.isArray(r.stages) ? r.stages.filter((s): s is StageId => STAGES.some((st) => st.id === s)) : [];
  if (typeof r.typeId !== "string" || typeof r.variantId !== "string") return null;
  if (!findVariant(r.typeId, r.variantId)) return null;
  if (!Number.isFinite(area) || area < AREA_MIN || area > AREA_MAX) return null;
  if (!Number.isInteger(renders) || renders < 0 || renders > RENDERS_MAX) return null;
  if (stages.length === 0) return null;
  return { typeId: r.typeId, variantId: r.variantId, area, stages: [...new Set(stages)], control: r.control === true, renders };
}

// Türkiye cep telefonu: 05xx… ya da +905xx… biçimlerini 5xxxxxxxxx olarak döndürür
export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const m = digits.match(/^(?:90|0)?(5\d{9})$/);
  return m ? m[1] : null;
}

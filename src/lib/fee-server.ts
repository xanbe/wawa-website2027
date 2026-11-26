import "server-only";
import { STAGES, findVariant, type BuildingGroup, type FeeInput, type FeeResult } from "@/lib/fee";

// Ücret hesabı yalnızca sunucuda çalışır: tarife tabloları tarayıcıya gönderilmez, sonuç telefon doğrulamasından sonra döner.
// Kaynak ve formül: fee.ts başındaki açıklama.

// Koordinasyon kat sayısı: Türkiye genelinde 1,4
const KK = 1.4;

// 2026 yapı yaklaşık birim maliyetleri (TL/m², KDV hariç); yalnızca iç mimarlık projelerinin düştüğü gruplar
const UNIT_COSTS: Record<BuildingGroup, number> = {
  "III-A": 19800,
  "III-B": 21050,
  "III-C": 23400,
  "IV-A": 26450,
  "IV-B": 33900,
  "IV-C": 40500,
  "V-A": 42350,
  "V-B": 43850,
  "V-C": 48750,
  "V-D": 53500,
};

// PİD ücret oranları cetveli (%): alan eşiği, ardından I–V. sınıf oranları
const PID: [number, number, number, number, number, number][] = [
  [500, 3.92, 4.48, 5.04, 5.6, 6.16],
  [1000, 3.02, 3.58, 4.14, 4.7, 5.26],
  [2500, 2.42, 2.84, 3.27, 3.7, 4.12],
  [5000, 2.0, 2.31, 2.62, 2.93, 3.24],
  [7500, 1.8, 2.07, 2.32, 2.59, 2.84],
  [10000, 1.69, 1.91, 2.15, 2.38, 2.61],
  [12500, 1.57, 1.79, 2.0, 2.21, 2.42],
  [15000, 1.49, 1.68, 1.87, 2.07, 2.27],
  [17500, 1.41, 1.58, 1.76, 1.94, 2.12],
  [20000, 1.34, 1.51, 1.67, 1.84, 2.0],
  [22500, 1.28, 1.43, 1.57, 1.73, 1.88],
  [25000, 1.22, 1.35, 1.5, 1.64, 1.79],
  [27500, 1.16, 1.29, 1.42, 1.55, 1.68],
  [30000, 1.1, 1.22, 1.35, 1.47, 1.61],
  [32500, 1.05, 1.18, 1.31, 1.44, 1.57],
  [35000, 1.01, 1.14, 1.26, 1.39, 1.51],
  [37500, 0.98, 1.1, 1.22, 1.34, 1.46],
  [40000, 0.95, 1.07, 1.18, 1.3, 1.41],
  [42500, 0.92, 1.04, 1.15, 1.26, 1.37],
  [45000, 0.89, 1.01, 1.11, 1.23, 1.33],
  [47500, 0.87, 0.98, 1.08, 1.19, 1.3],
  [50000, 0.85, 0.96, 1.05, 1.16, 1.26],
  [52500, 0.83, 0.93, 1.03, 1.14, 1.23],
  [55000, 0.81, 0.91, 1.0, 1.11, 1.2],
  [57500, 0.79, 0.89, 0.98, 1.09, 1.18],
  [60000, 0.77, 0.87, 0.96, 1.06, 1.15],
  [62500, 0.76, 0.85, 0.94, 1.04, 1.13],
  [65000, 0.74, 0.84, 0.93, 1.02, 1.11],
  [67500, 0.73, 0.82, 0.91, 1.0, 1.09],
  [70000, 0.72, 0.81, 0.89, 0.98, 1.07],
  [72500, 0.7, 0.79, 0.88, 0.97, 1.05],
  [75000, 0.69, 0.78, 0.86, 0.95, 1.03],
  [77500, 0.68, 0.77, 0.85, 0.93, 1.02],
  [80000, 0.67, 0.75, 0.83, 0.92, 1.0],
];

// Villa sınıfı alana göre: 200 m² altı, 200–500 m², 500 m² ve üzeri
function villaVariantId(area: number) {
  return area < 200 ? "200-alti" : area < 500 ? "200-500" : "500-ustu";
}

// Cetvel 500 m²'den başlar; altında ilk satır, 80.000 m² üzerinde son satır kullanılır, aradaki alanlar doğrusal enterpole edilir
function pidRate(area: number, group: BuildingGroup) {
  const col = ["I", "II", "III", "IV", "V"].indexOf(group.split("-")[0]) + 1;
  if (area <= PID[0][0]) return PID[0][col];
  for (let i = 1; i < PID.length; i++) {
    const [a1] = PID[i];
    if (area <= a1) {
      const [a0] = PID[i - 1];
      const r0 = PID[i - 1][col];
      const r1 = PID[i][col];
      return r0 + ((area - a0) / (a1 - a0)) * (r1 - r0);
    }
  }
  return PID[PID.length - 1][col];
}

export function computeFee(input: FeeInput): FeeResult {
  const variantId = input.typeId === "villa" ? villaVariantId(input.area) : input.variantId;
  const variant = findVariant(input.typeId, variantId);
  if (!variant) throw new Error("Geçersiz proje türü");
  const unitCost = UNIT_COSTS[variant.group];
  const pid = pidRate(input.area, variant.group);
  const hbo = STAGES.filter((s) => input.stages.includes(s.id)).reduce((sum, s) => sum + s.share, 0) / 100;
  const projectFee = input.area * unitCost * (pid / 100) * hbo * KK;
  // Kontrolörlük proje en az ücretinin %25'i; perspektifte ilk pafta %5, sonrakilerin her biri bu oranın %25'i
  const controlFee = input.control ? projectFee * 0.25 : 0;
  const renderFee = input.renders > 0 ? projectFee * (0.05 + (input.renders - 1) * 0.05 * 0.25) : 0;
  return {
    group: variant.group,
    unitCost,
    pidRate: pid,
    hbo,
    projectFee: Math.round(projectFee),
    controlFee: Math.round(controlFee),
    renderFee: Math.round(renderFee),
    total: Math.round(projectFee + controlFee + renderFee),
  };
}


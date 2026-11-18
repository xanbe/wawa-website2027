import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  LIMITS,
  OPEN_SIDES,
  SPACES,
  STAND_ELEMENTS,
  STAND_TYPES,
  STYLES,
  TONES,
  WALLS,
  clamp,
  round1,
  type RoomBrief,
  type StandBrief,
  type StudioBrief,
} from "@/components/ai/studio-data";

// Yapay zeka görsel üretimi (Google Gemini görsel modeli). Anahtar yoksa üretim kapalıdır;
// talep yine ekibe iletilir. Girdiler burada yeniden doğrulanır, istemciden gelen değere güvenilmez.

export const AI_CONFIGURED = Boolean(process.env.GEMINI_API_KEY);
const MODEL = process.env.AI_IMAGE_MODEL || "gemini-2.5-flash-image";

const pick = <T extends string>(v: unknown, list: readonly T[], fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);
const num = (v: unknown, range: readonly [number, number], fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? round1(clamp(n, range)) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001F]/g, " ").trim().slice(0, max) : "");

export function parseBrief(raw: unknown, allowedRefs: Set<string>): StudioBrief | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const s = (b.stand ?? {}) as Record<string, unknown>;
  const r = (b.room ?? {}) as Record<string, unknown>;
  const color = typeof s.color === "string" && /^#[0-9a-fA-F]{6}$/.test(s.color) ? s.color : "#1F4E8C";
  const stand: StandBrief = {
    type: pick(s.type, STAND_TYPES, "kose"),
    w: num(s.w, LIMITS.stand.w, 6),
    d: num(s.d, LIMITS.stand.d, 4),
    h: num(s.h, LIMITS.stand.h, 3),
    elements: Array.isArray(s.elements) ? STAND_ELEMENTS.filter((e) => (s.elements as unknown[]).includes(e)) : [],
    sector: text(s.sector, 80),
    color,
  };
  const room: RoomBrief = {
    space: pick(r.space, SPACES, "salon"),
    w: num(r.w, LIMITS.room.w, 5),
    l: num(r.l, LIMITS.room.l, 6),
    h: num(r.h, LIMITS.room.h, 2.8),
    window: pick(r.window, WALLS, "back"),
    door: pick(r.door, WALLS, "left"),
    tone: pick(r.tone, TONES, "sicak"),
  };
  const refSrc = typeof b.refSrc === "string" && allowedRefs.has(b.refSrc) ? b.refSrc : null;
  return {
    mode: b.mode === "interior" ? "interior" : "stand",
    stand,
    room,
    styles: Array.isArray(b.styles) ? STYLES.filter((x) => (b.styles as unknown[]).includes(x)) : [],
    refSrc,
    notes: text(b.notes, 300),
  };
}

const STAND_TYPE_EN = {
  sira: "inline stand (only the front side open to the aisle; back, left and right sides closed by walls)",
  kose: "corner stand (front and right sides open to aisles; back and left sides closed by walls)",
  yarimada: "peninsula stand (front, left and right sides open; only the back side closed by a wall)",
  ada: "island stand (all four sides open, no perimeter walls)",
};
const ELEMENT_EN = {
  banko: "a reception counter about 1.6 m long and 1.05 m high near the front",
  depo: "a closed storage room about 1.2 x 1.2 m with a door in the back corner",
  led: "a large LED video wall",
  toplanti: "a meeting area with a round table and three chairs",
  raf: "product display shelving",
  asma: "a circular hanging banner suspended above the stand",
};
const SPACE_EN = {
  salon: "living room",
  mutfak: "kitchen",
  yatak: "bedroom",
  ofis: "office",
  magaza: "retail store",
  cafe: "cafe",
  klinik: "medical clinic",
};
const WALL_EN = { back: "back", left: "left", right: "right", none: "" };
const TONE_EN = { sicak: "warm", notr: "neutral", acik: "light", koyu: "dark" };
const STYLE_EN = { minimal: "minimal", modern: "modern", luks: "luxury", dogal: "natural materials", endustriyel: "industrial" };

export function buildPrompt(b: StudioBrief, hasRef: boolean) {
  const styles = b.styles.map((s) => STYLE_EN[s]).join(", ") || "contemporary";
  const common = [
    "The FIRST image is a 3D massing model drawn at exact real-world scale. Keep exactly the same footprint, wall positions, openings, proportions, element placement and camera angle. Replace the plain grey and white blocks with finished, high-quality real materials.",
    hasRef ? "The SECOND image is a reference project by WAWA Interiors: borrow only its material quality, lighting mood and level of detail, not its layout or size." : "",
    "The grey capsule figure is 1.75 m tall; use it to keep everything at correct human scale and replace it with a realistic person or remove it.",
    "Photorealistic, natural lighting, professional architectural photography, sharp details. No text, no logos, no watermarks, no dimension labels.",
    b.notes ? `Client note: ${b.notes}` : "",
  ];
  if (b.mode === "stand") {
    const s = b.stand;
    const area = round1(s.w * s.d);
    return [
      `Photorealistic photograph of a custom-built trade fair exhibition stand inside a modern exhibition hall.`,
      `EXACT DIMENSIONS, must be respected: footprint ${s.w} m wide by ${s.d} m deep (${area} m2), wall and structure height ${s.h} m.`,
      `Stand type: ${STAND_TYPE_EN[s.type]}; ${OPEN_SIDES[s.type]} open side(s).`,
      s.elements.length ? `Include: ${s.elements.map((e) => ELEMENT_EN[e]).join("; ")}.` : "",
      `Main brand accent colour ${s.color}.`,
      s.sector ? `Exhibitor industry: ${s.sector}.` : "",
      `Design style: ${styles}.`,
      ...common,
    ]
      .filter(Boolean)
      .join("\n");
  }
  const r = b.room;
  const area = round1(r.w * r.l);
  return [
    `Photorealistic interior design photograph of a ${SPACE_EN[r.space]}.`,
    `EXACT ROOM DIMENSIONS, must be respected: ${r.w} m wide by ${r.l} m long (${area} m2), ceiling height ${r.h} m. The front wall is removed to show the room.`,
    r.window !== "none" ? `A window on the ${WALL_EN[r.window]} wall, sill at 0.9 m.` : "No windows.",
    r.door !== "none" ? `A door 0.9 m wide and 2.1 m high on the ${WALL_EN[r.door]} wall.` : "",
    `Furnish the room completely with furniture at correct real-world sizes (seat height 0.45 m, table height 0.75 m, kitchen worktop 0.9 m).`,
    `Colour palette: ${TONE_EN[r.tone]}. Design style: ${styles}.`,
    ...common,
  ]
    .filter(Boolean)
    .join("\n");
}

async function refImage(src: string) {
  // Yalnızca public klasöründeki izinli proje görselleri okunur
  const file = path.join(process.cwd(), "public", path.normalize(src).replace(/^([/\\])+/, ""));
  if (!file.startsWith(path.join(process.cwd(), "public"))) return null;
  const data = await readFile(file).catch(() => null);
  if (!data) return null;
  const ext = path.extname(file).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return { mimeType: mime, data: data.toString("base64") };
}

export async function renderImage(prompt: string, sketch: { mimeType: string; data: string }, refSrc: string | null) {
  const parts: Record<string, unknown>[] = [{ text: prompt }, { inlineData: sketch }];
  if (refSrc) {
    const ref = await refImage(refSrc);
    if (ref) parts.push({ inlineData: ref });
  }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    console.error(`[ai] model hatası ${res.status}`);
    return null;
  }
  const json = (await res.json().catch(() => null)) as { candidates?: { content?: { parts?: Record<string, unknown>[] } }[] } | null;
  for (const p of json?.candidates?.[0]?.content?.parts ?? []) {
    const d = (p.inlineData ?? p.inline_data) as { mimeType?: string; mime_type?: string; data?: string } | undefined;
    if (d?.data) return `data:${d.mimeType ?? d.mime_type ?? "image/png"};base64,${d.data}`;
  }
  return null;
}

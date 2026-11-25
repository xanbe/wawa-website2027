// Fuar rehberleri: her fuarın kendi resmî sitesinden araştırılarak yazılmış özgün metin (TR/EN/DE).
// Kural: metindeki her bilgi `sources` içindeki sayfalarda yazıyor olmalı; organizatörün verdiği sayılar "organizatöre göre" diye aktarılır.
// Yeni rehber: fair-guides.json dizisine bir kayıt eklenir (slugs = fairs.json'daki fuar adresleri; Ocak/Eylül gibi aynı fuarın
// birden çok sayfası tek rehberi paylaşır). Rehberi olan fuar sayfası "<Fuar> hakkında" bölümünü ve rehber başlığını gösterir.
import data from "./fair-guides.json";
import type { PageLang } from "./fair-meta";

export type FairGuideText = { intro: string; sections: { h: string; p: string }[] };
export type FairGuide = { name: string; slugs: string[]; updated: string; sources: string[] } & Record<PageLang, FairGuideText>;

const GUIDES = data as FairGuide[];
const BY_SLUG = new Map(GUIDES.flatMap((g) => g.slugs.map((s) => [s, g] as const)));

export const getFairGuide = (slug: string): FairGuide | undefined => BY_SLUG.get(slug);
export const fairGuideCount = GUIDES.length;

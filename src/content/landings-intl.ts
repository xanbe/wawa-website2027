// Hizmet açılış sayfalarının İngilizce ve Almanca ortak süreç ve kapsam kartları (process.json'dan).
// Sayfaların kendisi landings.json içinde, Türkçe sayfalarla birlikte durur.
import processData from "./process.json";

type Lang = "en" | "de";
type Step = { title: string; text: string };
type ScopeCard = { title: string; text: string; features: string[] };
const P = processData as {
  standProcess: Record<Lang, Step[]>;
  interiorProcess: Record<Lang, Step[]>;
  interiorScope: Record<Lang, ScopeCard[]>;
};

export const STAND_PROCESS_L: Record<Lang, Step[]> = { en: P.standProcess.en, de: P.standProcess.de };
export const INTERIOR_PROCESS_L: Record<Lang, Step[]> = { en: P.interiorProcess.en, de: P.interiorProcess.de };
export const INTERIOR_SCOPE_L: Record<Lang, ScopeCard[]> = { en: P.interiorScope.en, de: P.interiorScope.de };

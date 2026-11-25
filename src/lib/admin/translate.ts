// Panelde kaydedilen Türkçe proje metninin İngilizce ve Almanca çevirisi (Google Gemini metin modeli).
// Anahtar yoksa ya da çeviri başarısız olursa null döner; kayıt yine yapılır, metin eski hâliyle kalır.
import type { ProjectText, SyncLang } from "./sync";

const MODEL = process.env.AI_TEXT_MODEL || "gemini-2.5-flash";
export const TRANSLATE_CONFIGURED = Boolean(process.env.GEMINI_API_KEY);

const PROMPT = `You translate project pages of WAWA Interiors, an interior architecture and exhibition stand company in Istanbul, from Turkish into English and German.
Rules:
- Natural, concise website copy; English in international/British spelling, German in the Sie form.
- Keep brand, company, fair and place names exactly as written.
- Keep the HTML structure and tags of "html" exactly; translate only the text between tags. Do not add, remove or reorder tags.
- "Fuar standı" = "exhibition stand" / "Messestand"; "anahtar teslim" = "turnkey" / "schlüsselfertig"; "AVM" = "shopping mall" / "Einkaufszentrum".
- Add nothing that is not in the source.
Return only JSON of the form {"en":{"title":"","description":"","html":""},"de":{"title":"","description":"","html":""}}.`;

const isText = (v: unknown): v is ProjectText =>
  typeof v === "object" && v !== null && ["title", "description", "html"].every((k) => typeof (v as Record<string, unknown>)[k] === "string");

export async function translateProject(src: ProjectText): Promise<Record<SyncLang, ProjectText> | null> {
  if (!TRANSLATE_CONFIGURED) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PROMPT }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(src) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(40_000),
    });
    if (!res.ok) {
      console.error(`[admin] çeviri model hatası ${res.status}`);
      return null;
    }
    const json = (await res.json().catch(() => null)) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null;
    const raw = json?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    const out = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")) as Record<string, unknown>;
    if (!isText(out.en) || !isText(out.de) || !out.en.title.trim() || !out.de.title.trim()) return null;
    return { en: out.en, de: out.de };
  } catch (e) {
    console.error("[admin] çeviri", e instanceof Error ? e.message : e);
    return null;
  }
}

// Fuar standı grubuna eklenen sayfalar (Plus Stand, AVM Standı; TR, EN, DE).
// Plus Stand, Maxima modüler sistemin büyük ölçekli sürümü olarak anlatılır. Sayı ve teknik ölçü verilmez.
// Veriler extra-pages.json içinde (key "stand"); sıra JSON'daki sıradır.
import type { ExtraPage } from "./extra-pages";
import data from "./extra-pages.json";

export const standPages: ExtraPage[] = (data as ExtraPage[]).filter((p) => p.key === "stand");

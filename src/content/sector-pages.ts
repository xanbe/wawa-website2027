// Sektörel iç mimari sayfaları (TR, EN, DE). Her sektörün kendine özgü ihtiyaçları anlatılır;
// WAWA'ya dair yalnızca eski sitede de yazan gerçekler kullanılır (kendi atölyesi, ruhsat hariç anahtar teslim).
// Veriler extra-pages.json içinde (key "sector"); sıra JSON'daki sıradır.
import type { ExtraPage } from "./extra-pages";
import data from "./extra-pages.json";

export const sectorPages: ExtraPage[] = (data as ExtraPage[]).filter((p) => p.key === "sector");

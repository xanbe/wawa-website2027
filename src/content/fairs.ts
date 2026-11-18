// Yaklaşan fuarlar şeridi için örnek liste (wawa fuar sitesindeki listeden). Tarihler kesin değildir;
// sayfada "örnek liste · tarihler kesin değil" notuyla gösterilir. Geçmiş fuarlar otomatik gizlenir.
export const FAIRS = [
  { name: "Big 5 Global", city: "Dubai", region: "me", start: "2026-11-23", end: "2026-11-26" },
  { name: "Plast Eurasia", city: "İstanbul", region: "tr", start: "2026-12-02", end: "2026-12-05" },
  { name: "Gulfood", city: "Dubai", region: "me", start: "2027-02-15", end: "2027-02-19" },
  { name: "ISH", city: "Frankfurt", region: "eu", start: "2027-03-15", end: "2027-03-19" },
  { name: "WIN Eurasia", city: "İstanbul", region: "tr", start: "2027-03-24", end: "2027-03-27" },
  { name: "Salone del Mobile", city: "Milano", region: "eu", start: "2027-04-13", end: "2027-04-18" },
  { name: "Solarex", city: "İstanbul", region: "tr", start: "2027-04-22", end: "2027-04-24" },
  { name: "Interzum", city: "Köln", region: "eu", start: "2027-05-18", end: "2027-05-21" },
] as const satisfies readonly { name: string; city: string; region: "tr" | "eu" | "me"; start: string; end: string }[];

"use client";

// Fuar sayfalarının zamana bağlı kısımları (sayfa derlemede üretilir; gün sayısı ve "geçti" durumu tarayıcıda hesaplanır)
import { useSyncExternalStore } from "react";

const DAY = 86_400_000;
const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
};
const nowMinute = () => Math.floor(Date.now() / 60_000) * 60_000;
const useNow = () => useSyncExternalStore(subscribe, nowMinute, () => 0);


// Açılışa kalan gün ya da "devam ediyor / sona erdi"
const CD = {
  tr: { ended: "Fuar sona erdi", live: "Fuar devam ediyor", pre: "Açılışa", post: "gün" },
  en: { ended: "The fair has ended", live: "The fair is on", pre: "", post: "days to opening" },
  de: { ended: "Messe beendet", live: "Messe läuft", pre: "Noch", post: "Tage bis zur Eröffnung" },
};
export function FairCountdown({ start, end, lang = "tr" }: { start: string; end: string; lang?: "tr" | "en" | "de" }) {
  const t = CD[lang];
  const now = useNow();
  if (!now) return <span className="text-wawa-charcoal/55">·</span>;
  const s = new Date(`${start}T09:00:00+03:00`).getTime();
  const e = new Date(`${end}T18:00:00+03:00`).getTime();
  if (now > e) return <span>{t.ended}</span>;
  if (now >= s) return <span>{t.live}</span>;
  return (
    <span>
      {t.pre && `${t.pre} `}
      <b className="font-heading text-[1.2em] font-normal tabular-nums">{Math.ceil((s - now) / DAY)}</b> {t.post}
    </span>
  );
}

// Takvim dizininde geçmiş fuarları gizler
export function UpcomingOnly({ end, children }: { end: string; children: React.ReactNode }) {
  const now = useNow();
  if (now && now > new Date(`${end}T18:00:00+03:00`).getTime()) return null;
  return <>{children}</>;
}

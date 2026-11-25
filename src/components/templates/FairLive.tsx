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
export function FairCountdown({ start, end }: { start: string; end: string }) {
  const now = useNow();
  if (!now) return <span className="text-wawa-charcoal/55">·</span>;
  const s = new Date(`${start}T09:00:00+03:00`).getTime();
  const e = new Date(`${end}T18:00:00+03:00`).getTime();
  if (now > e) return <span>Fuar sona erdi</span>;
  if (now >= s) return <span>Fuar devam ediyor</span>;
  return (
    <span>
      Açılışa <b className="font-heading text-[1.2em] font-normal tabular-nums">{Math.ceil((s - now) / DAY)}</b> gün
    </span>
  );
}

// Takvim dizininde geçmiş fuarları gizler
export function UpcomingOnly({ end, children }: { end: string; children: React.ReactNode }) {
  const now = useNow();
  if (now && now > new Date(`${end}T18:00:00+03:00`).getTime()) return null;
  return <>{children}</>;
}

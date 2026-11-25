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

const fmt = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

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

// İki son sipariş tarihi: tasarım hazırsa / tasarım da yapılacaksa
export function FairDeadlines({ ready, design }: { ready: string; design: string }) {
  const now = useNow();
  const rows = [
    { label: "Tasarım da bizden", note: "Konsept, 3D tasarım, üretim ve kurulum", date: new Date(design) },
    { label: "Tasarımınız hazırsa", note: "Onaylı tasarımın üretimi ve kurulumu", date: new Date(ready) },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map((r) => {
        const left = now ? Math.ceil((r.date.getTime() - now) / DAY) : null;
        const passed = left !== null && left < 0;
        return (
          <li key={r.label} className={`border p-5 ${passed ? "border-wawa-charcoal/10 text-wawa-charcoal/45" : "border-wawa-charcoal/20"}`}>
            <p className="text-[12px] tracking-[0.12em] uppercase opacity-70">{r.label}</p>
            <p className="mt-2 font-heading text-[22px] leading-tight text-current">{fmt(r.date)}</p>
            <p className="mt-2 text-[14px]">
              {left === null ? r.note : passed ? "Bu tarih geçti; yine de bize yazın, takvimi birlikte değerlendirelim." : left === 0 ? "Son gün bugün." : `${left} gün kaldı · ${r.note}`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

// Takvim dizininde geçmiş fuarları gizler
export function UpcomingOnly({ end, children }: { end: string; children: React.ReactNode }) {
  const now = useNow();
  if (now && now > new Date(`${end}T18:00:00+03:00`).getTime()) return null;
  return <>{children}</>;
}

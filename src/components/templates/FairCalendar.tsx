"use client";

// Fuar takvimi: bölge, ay ve arama ile süzülen liste. Geçmiş fuarlar tarayıcıda gizlenir.
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { REGION_LABEL, REGIONS, SECTOR_GROUPS, SECTOR_LABEL, fairPath, type FairLite, type FairRegion, type SectorGroupId } from "@/content/fairs";

const DAY = 86_400_000;
const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
};
const nowMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

const norm = (s: string) => s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");
const dayMonth = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (key: string) => new Date(`${key}-15T12:00:00Z`).toLocaleDateString("tr-TR", { month: "long", year: "numeric", timeZone: "UTC" });

export function FairCalendar({ fairs }: { fairs: FairLite[] }) {
  const now = useSyncExternalStore(subscribe, nowMinute, () => 0);
  const [region, setRegion] = useState<"all" | FairRegion>("all");
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<"all" | SectorGroupId>("all");

  // Sunucuda (now = 0) tüm liste çizilir; tarayıcıda geçmiş fuarlar düşer
  const upcoming = useMemo(() => (now ? fairs.filter((f) => new Date(`${f.end}T23:59:59Z`).getTime() + DAY > now) : fairs), [fairs, now]);
  // Bölge sayıları seçili sektöre, sektör sayıları seçili bölgeye göre
  const counts = useMemo(() => {
    const base = upcoming.filter((f) => sector === "all" || f.group === sector);
    const c = { all: base.length } as Record<"all" | FairRegion, number>;
    for (const r of REGIONS) c[r] = base.filter((f) => f.region === r).length;
    return c;
  }, [upcoming, sector]);
  const sectorCounts = useMemo(() => {
    const base = upcoming.filter((f) => region === "all" || f.region === region);
    const c: Record<string, number> = { all: base.length };
    for (const f of base) c[f.group] = (c[f.group] ?? 0) + 1;
    return c;
  }, [upcoming, region]);
  const sectorOptions = [...SECTOR_GROUPS.map((g) => g.id), "diger" as const].sort((a, b) => SECTOR_LABEL[a].localeCompare(SECTOR_LABEL[b], "tr"));
  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return upcoming.filter((f) => {
      if (region !== "all" && f.region !== region) return false;
      if (sector !== "all" && f.group !== sector) return false;
      const hay = norm(`${f.name} ${f.city} ${f.country} ${f.sector}`);
      return words.every((w) => hay.includes(w));
    });
  }, [upcoming, region, sector, q]);
  const groups = useMemo(() => {
    const m = new Map<string, FairLite[]>();
    for (const f of list) m.set(monthKey(f.start), [...(m.get(monthKey(f.start)) ?? []), f]);
    return [...m.entries()];
  }, [list]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max border border-wawa-charcoal/15" role="group" aria-label="Bölge">
            {(["all", ...REGIONS] as const).map((r, i) => (
              <button
                key={r}
                type="button"
                aria-pressed={region === r}
                onClick={() => setRegion(r)}
                className={`flex cursor-pointer items-baseline gap-2 px-4 py-3 text-[14px] whitespace-nowrap transition-colors ${i > 0 ? "border-l border-wawa-charcoal/15" : ""} ${
                  region === r ? "bg-wawa-charcoal text-white" : "text-wawa-charcoal hover:bg-[#F3F2EF]"
                }`}
              >
                {r === "all" ? "Tümü" : REGION_LABEL[r]}
                <span className={`text-[12px] tabular-nums ${region === r ? "text-white/60" : "text-wawa-charcoal/45"}`}>{counts[r]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:w-[560px]">
        <label className="block">
          <span className="sr-only">Sektör</span>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value as "all" | SectorGroupId)}
            className="h-12 w-full cursor-pointer border border-wawa-charcoal/15 bg-white px-4 text-[15px] text-wawa-charcoal outline-none focus:border-wawa-charcoal"
          >
            <option value="all">Tüm sektörler ({sectorCounts.all ?? 0})</option>
            {sectorOptions.map((id) => (
              <option key={id} value={id} disabled={!sectorCounts[id]}>
                {SECTOR_LABEL[id]} ({sectorCounts[id] ?? 0})
              </option>
            ))}
          </select>
        </label>
        <label className="relative block">
          <span className="sr-only">Fuar ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-wawa-charcoal/45" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Fuar, şehir ya da sektör"
            className="h-12 w-full border border-wawa-charcoal/15 bg-white pr-4 pl-11 text-[15px] text-wawa-charcoal outline-none placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal"
          />
        </label>
        </div>
      </div>

      <p className="mt-4 text-[13px] text-wawa-charcoal/55" aria-live="polite">
        {list.length} fuar
        {(region !== "all" || sector !== "all" || q) && (
          <button type="button" onClick={() => (setRegion("all"), setSector("all"), setQ(""))} className="ml-3 cursor-pointer underline underline-offset-4 hover:text-wawa-charcoal">
            Filtreleri temizle
          </button>
        )}
      </p>

      {groups.length === 0 ? (
        <p className="mt-8 bg-[#F3F2EF] p-6 text-[15px] text-wawa-charcoal">Aradığınız fuarı bulamadık. Listede yoksa da teklif formuna fuarın adını yazabilirsiniz.</p>
      ) : (
        groups.map(([key, items]) => (
          <section key={key} className="mt-8" aria-label={monthLabel(key)}>
            <h2 className="border-b border-wawa-charcoal pb-2 font-heading text-[18px] font-normal text-wawa-charcoal capitalize">{monthLabel(key)}</h2>
            <ul>
              {items.map((f) => {
                const s = new Date(`${f.start}T09:00:00Z`).getTime();
                const e = new Date(`${f.end}T23:59:59Z`).getTime();
                const status = !now ? "" : now > e ? "Sona erdi" : now >= s ? "Devam ediyor" : `${Math.ceil((s - now) / DAY)} gün`;
                return (
                  <li key={f.slug} className="border-b border-wawa-charcoal/15">
                    <Link href={fairPath(f.slug)} className="group grid grid-cols-[72px_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-4 sm:grid-cols-[96px_minmax(0,1fr)_minmax(0,220px)_90px_20px] sm:gap-x-6">
                      <span className="text-[14px] tabular-nums text-wawa-charcoal/70">
                        {dayMonth(f.start)}
                        {f.end !== f.start && <span className="block text-[12px] text-wawa-charcoal/45 sm:inline">–{dayMonth(f.end)}</span>}
                      </span>
                      <span className="min-w-0">
                        <span className="text-[17px] font-medium text-wawa-charcoal group-hover:underline">{f.name}</span>
                        <span className="block text-[13px] text-wawa-charcoal/55">
                          {f.city}, {f.country}
                        </span>
                      </span>
                      <span className="hidden truncate text-[14px] text-wawa-charcoal/65 sm:block">{f.sector}</span>
                      <span className="text-right text-[13px] tabular-nums text-wawa-charcoal/60">{status}</span>
                      <ArrowUpRight className="hidden h-4 w-4 text-wawa-charcoal sm:block" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

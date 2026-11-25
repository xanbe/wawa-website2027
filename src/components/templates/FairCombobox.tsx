"use client";

// Fuar seçimi: tarayıcının ham listesi yerine aranabilir, sade öneri kutusu. Serbest yazı da kabul edilir
// (listede olmayan fuar yazılabilir). Boşken yaklaşan fuarlar, yazınca ad, şehir, ülke ve sektörde arama.
import { useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { FairPick } from "@/content/fairs";
import type { Lang } from "@/lib/i18n";

const LIMIT = 8;
const norm = (s: string) => s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");
const LOCALE: Record<string, string> = { tr: "tr-TR", en: "en-GB", de: "de-DE", it: "it-IT", fr: "fr-FR" };
const T: Record<string, { upcoming: string; none: string; more: (n: number) => string }> = {
  tr: { upcoming: "Yaklaşan fuarlar", none: "Listede bulunamadı; yazdığınız ad kullanılacak.", more: (n) => `${n} sonuç daha, aramayı daraltın` },
  en: { upcoming: "Upcoming fairs", none: "Not in the list; we will use what you typed.", more: (n) => `${n} more, refine your search` },
  de: { upcoming: "Kommende Messen", none: "Nicht in der Liste; Ihre Eingabe wird übernommen.", more: (n) => `${n} weitere, Suche verfeinern` },
};

export function FairCombobox({
  id,
  lang,
  value,
  onChange,
  picks,
  placeholder,
  disabled,
  theme = "light",
  className = "",
}: {
  id?: string;
  lang: Lang;
  value: string;
  onChange: (v: string) => void;
  picks: FairPick[];
  placeholder: string;
  disabled?: boolean;
  theme?: "light" | "dark";
  className?: string;
}) {
  const auto = useId();
  const inputId = id ?? `fair-${auto}`;
  const listId = `${inputId}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const box = useRef<HTMLUListElement>(null);
  const t = T[lang] ?? T.en;
  const dark = theme === "dark";

  const { items, rest } = useMemo(() => {
    const words = norm(value).split(/\s+/).filter(Boolean);
    if (!words.length) {
      const up = picks.filter((p) => p.d >= today);
      return { items: up.slice(0, LIMIT), rest: 0 };
    }
    const q = words.join(" ");
    const scored: { p: FairPick; s: number }[] = [];
    for (const p of picks) {
      const name = norm(p.v);
      const hay = `${name} ${norm(p.c)} ${norm(p.s)}`;
      if (!words.every((w) => hay.includes(w))) continue;
      // Ad başta eşleşirse önce, sonra adın içinde, sonra şehir ve sektör; yaklaşan fuarlar geçmişlerin önünde
      const s = (name.startsWith(q) ? 0 : name.includes(q) ? 1 : 2) + (p.d < today ? 3 : 0);
      scored.push({ p, s });
    }
    scored.sort((a, b) => a.s - b.s);
    return { items: scored.slice(0, LIMIT).map((x) => x.p), rest: Math.max(0, scored.length - LIMIT) };
  }, [value, picks, today]);

  const month = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(LOCALE[lang] ?? "en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  const choose = (p: FairPick) => {
    onChange(p.v);
    setOpen(false);
  };
  const move = (d: number) => {
    if (!items.length) return;
    const n = (active + d + items.length) % items.length;
    setActive(n);
    box.current?.querySelector(`[data-i="${n}"]`)?.scrollIntoView({ block: "nearest" });
  };

  const showList = open && !disabled;
  const panel = dark ? "border-white/15 bg-[#1f1f1f] text-white" : "border-wawa-charcoal bg-white text-wawa-charcoal";
  const sub = dark ? "text-white/50" : "text-wawa-charcoal/55";
  // Koyu açılış kutusu taşmayı kestiği için liste orada daha kısa tutulur
  const hover = dark ? "bg-white/10" : "bg-[#F3F2EF]";

  return (
    <div className="relative">
      <input
        id={inputId}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && items[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        maxLength={110}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) setOpen(true);
            else move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter" && showList && items[active]) {
            e.preventDefault();
            choose(items[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={`pr-10 ${className}`}
      />
      <Search className={`pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 ${sub}`} aria-hidden />
      {showList && (
        <div className={`absolute inset-x-0 top-full z-30 mt-1 border shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${panel}`}>
          {!value.trim() && items.length > 0 && <p className={`px-4 pt-3 pb-1 text-[11px] tracking-[0.12em] uppercase ${sub}`}>{t.upcoming}</p>}
          <ul ref={box} id={listId} role="listbox" className={`overflow-y-auto py-1 ${dark ? "max-h-[228px]" : "max-h-[320px]"}`}>
            {items.map((p, i) => (
              <li
                key={p.v}
                id={`${listId}-${i}`}
                data-i={i}
                role="option"
                aria-selected={i === active}
                // Odak kutudan kaymasın diye seçim fare basıldığında yapılır
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(p);
                }}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-4 py-2.5 ${i === active ? hover : ""}`}
              >
                <span className="block truncate text-[15px]">{p.v.split(" · ")[0]}</span>
                <span className={`mt-0.5 block truncate text-[13px] ${sub}`}>
                  {p.c} · {month(p.d)} · {p.s}
                </span>
              </li>
            ))}
          </ul>
          {items.length === 0 && <p className={`px-4 py-3 text-[14px] ${sub}`}>{t.none}</p>}
          {rest > 0 && <p className={`border-t px-4 py-2 text-[12px] ${dark ? "border-white/10" : "border-wawa-charcoal/10"} ${sub}`}>{t.more(rest)}</p>}
        </div>
      )}
    </div>
  );
}

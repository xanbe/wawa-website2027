"use client";

// Kısa bir seçenek listesi için sade öneri kutusu (tarayıcının ham listesi yerine). Serbest yazı da kabul edilir;
// boşken tüm seçenekler, yazınca eşleşenler görünür. Klavye: aşağı/yukarı ok, Enter ile seç, Esc ile kapat.
import { useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const norm = (s: string) => s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

export function OptionCombobox({
  value,
  onChange,
  options,
  placeholder,
  maxLength = 80,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Kutu bir seçenekle doluysa yine tüm liste görünür (başka seçeneğe geçmek kolay olsun)
  const [typed, setTyped] = useState(false);
  const box = useRef<HTMLUListElement>(null);
  const items = useMemo(() => {
    const q = norm(value.trim());
    if (!q || !typed) return options;
    return options.filter((o) => norm(o).includes(q));
  }, [value, typed, options]);

  const choose = (v: string) => {
    onChange(v);
    setTyped(false);
    setOpen(false);
  };
  const move = (d: number) => {
    if (!items.length) return;
    const n = (active + d + items.length) % items.length;
    setActive(n);
    box.current?.querySelector(`[data-i="${n}"]`)?.scrollIntoView({ block: "nearest" });
  };

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && items[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setTyped(true);
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
          } else if (e.key === "Enter" && open && items[active]) {
            e.preventDefault();
            choose(items[active]);
          } else if (e.key === "Escape") setOpen(false);
        }}
        className={`pr-10 ${className}`}
      />
      <ChevronDown className={`pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-wawa-charcoal/50 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      {open && items.length > 0 && (
        <ul
          ref={box}
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-[280px] overflow-y-auto border border-wawa-charcoal bg-white py-1 shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
        >
          {items.map((o, i) => (
            <li
              key={o}
              id={`${listId}-${i}`}
              data-i={i}
              role="option"
              aria-selected={o === value}
              // Odak kutudan kaymasın diye seçim fare basıldığında yapılır
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-[15px] text-wawa-charcoal ${i === active ? "bg-[#F3F2EF]" : ""}`}
            >
              {o}
              {o === value && <span aria-hidden className="h-1.5 w-1.5 bg-wawa-accent outline outline-1 outline-wawa-charcoal" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

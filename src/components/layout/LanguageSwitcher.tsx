"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES, langFromPath, type Lang } from "@/lib/i18n";
import { useAlternates } from "./alternates";

// Site dilleri. IT ve FR'de ana sayfalar kendi dilinde, detay içerikler İngilizcedir.
export const LANGUAGES = [
  { code: "tr", label: "TR", name: "Türkçe", ready: true },
  { code: "en", label: "EN", name: "English", ready: true },
  { code: "de", label: "DE", name: "Deutsch", ready: true },
  { code: "it", label: "IT", name: "Italiano", ready: true },
  { code: "fr", label: "FR", name: "Français", ready: true },
] as const;

interface LanguageSwitcherProps {
  /** bar: üst şeritte yazı hâlinde; sheet: mobil menüde kare düğmeler */
  variant?: "bar" | "sheet";
  className?: string;
  onNavigate?: () => void;
}

// Bulunulan sayfanın diğer dildeki karşılığına gider; karşılığı yoksa o dilin anasayfasına
function useTargets() {
  const pathname = usePathname() ?? "/";
  const alt = useAlternates();
  const current = langFromPath(pathname);
  const href = (code: Lang) => alt?.alternates[code] ?? ROUTES[code].home;
  return { current, href };
}

export function LanguageSwitcher({ variant = "bar", className = "", onNavigate }: LanguageSwitcherProps) {
  const { current, href } = useTargets();

  if (variant === "sheet") {
    return (
      <div className={`grid grid-cols-5 border border-black/10 ${className}`} role="group" aria-label="Dil seçimi">
        {LANGUAGES.map((l, i) => {
          const active = l.code === current;
          const cls = `grid h-10 place-items-center text-xs font-medium tracking-[0.12em] ${i > 0 ? "border-l border-black/10" : ""} ${
            active ? "bg-wawa-charcoal text-white" : l.ready ? "bg-white text-wawa-charcoal/70 hover:text-wawa-charcoal" : "bg-white text-wawa-charcoal/25"
          }`;
          return l.ready ? (
            <Link key={l.code} href={href(l.code as Lang)} hrefLang={l.code} aria-current={active ? "true" : undefined} aria-label={l.name} onClick={onNavigate} className={cls}>
              {l.label}
            </Link>
          ) : (
            <span key={l.code} aria-disabled="true" title={l.name} className={cls}>
              {l.label}
            </span>
          );
        })}
      </div>
    );
  }

  // Üst şerit: aralarında ince dikey çizgiler olan kısaltmalar; seçili dilin altında sarı çizgi
  return (
    <div className={`flex items-center ${className}`} role="group" aria-label="Dil seçimi">
      {LANGUAGES.map((l, i) => {
        const active = l.code === current;
        const cls = `relative px-2.5 py-1 text-[12px] tracking-[0.12em] transition-colors ${
          active ? "font-medium text-wawa-charcoal" : l.ready ? "text-wawa-gray hover:text-wawa-charcoal" : "text-wawa-charcoal/25"
        }`;
        const underline = (
          <span
            aria-hidden
            className={`absolute inset-x-2.5 -bottom-px h-[2px] origin-left bg-wawa-accent transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0"}`}
          />
        );
        return (
          <span key={l.code} className="flex items-center">
            {i > 0 && <span aria-hidden className="h-3 w-px bg-wawa-charcoal/15" />}
            {l.ready ? (
              <Link href={href(l.code as Lang)} hrefLang={l.code} aria-current={active ? "true" : undefined} aria-label={l.name} title={l.name} className={cls}>
                {l.label}
                {underline}
              </Link>
            ) : (
              <span aria-disabled="true" title={l.name} className={cls}>
                {l.label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

"use client";

// Kaydırdıkça yüklenen ızgara: kartlar sunucuda hazırlanır, burada sayfa aşağı indikçe sırayla gösterilir.
import { Children, useEffect, useRef, useState, type ReactNode } from "react";

export function InfiniteGrid({ children, initial, step = 9, className }: { children: ReactNode; initial: number; step?: number; className?: string }) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(initial);
  const sentinel = useRef<HTMLDivElement>(null);
  const done = shown >= items.length;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done) return;
    // Liste sonuna gelmeden biraz önce sıradaki kartlar eklenir
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown((n) => n + step), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [done, step, shown]);

  return (
    <>
      <div className={className}>
        {items.slice(0, shown).map((child, i) => (
          <div key={i} className={i >= initial ? "svc-grid-in" : undefined}>
            {child}
          </div>
        ))}
      </div>
      {!done && <div ref={sentinel} aria-hidden className="h-px" />}
    </>
  );
}

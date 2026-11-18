"use client";

import { useEffect, useRef } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";

const FRICTION = 0.94; // bırakınca savrulmanın her karede azalma oranı

// Kendiliğinden kayan, fare/parmakla sürüklenebilen sonsuz şerit.
// İçerik iki kopya yan yana dizilir; rowRef ilk kopyaya bağlanır.
export function useDragMarquee({ speed = 0.07, maxFling = 1.6 }: { speed?: number; maxFling?: number } = {}) {
  const reduceMotion = useReducedMotion();
  const rowRef = useRef<HTMLUListElement>(null);
  const rowWidth = useRef(0);
  const x = useMotionValue(0);
  const velocity = useRef(0);
  const isHovered = useRef(false);
  const drag = useRef<{ startX: number; startValue: number; lastX: number; lastT: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      rowWidth.current = el.offsetWidth;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Konumu tek bir kopya genişliği içinde tutar; iki kopya olduğu için boşluk görünmez
  const wrap = (value: number) => {
    const width = rowWidth.current;
    if (!width) return value;
    const v = value % width;
    return v > 0 ? v - width : v;
  };

  useAnimationFrame((_, delta) => {
    if (drag.current) return;
    if (Math.abs(velocity.current) > 0.02) {
      x.set(wrap(x.get() + velocity.current * delta));
      velocity.current *= Math.pow(FRICTION, delta / 16);
    } else if (!isHovered.current && !reduceMotion) {
      x.set(wrap(x.get() - speed * delta));
    }
  });

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    // Bırakmadan önce bir süre durduysa savrulma olmasın
    if (e.timeStamp - d.lastT > 80) velocity.current = 0;
    velocity.current = Math.max(-maxFling, Math.min(maxFling, velocity.current));
    // Sürükleme sonrası gelen tıklama linki açmasın diye bayrak bir an daha kalır
    setTimeout(() => {
      drag.current = null;
    }, 0);
  };

  const containerProps = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") isHovered.current = true;
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") isHovered.current = false;
    },
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      velocity.current = 0;
      drag.current = { startX: e.clientX, startValue: x.get(), lastX: e.clientX, lastT: e.timeStamp, moved: false };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dt = e.timeStamp - d.lastT;
      if (dt > 0) velocity.current = (e.clientX - d.lastX) / dt;
      if (Math.abs(e.clientX - d.startX) > 5) d.moved = true;
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;
      x.set(wrap(d.startValue + e.clientX - d.startX));
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onClickCapture: (e: React.MouseEvent) => {
      if (drag.current?.moved) e.preventDefault();
    },
  };

  return { x, rowRef, containerProps };
}

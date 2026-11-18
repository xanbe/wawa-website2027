"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n";

// Sayfanın diğer dillerdeki karşılıkları. Sayfa bileşeni yazar, menüdeki dil seçici okur.
type State = { lang: Lang; alternates: Partial<Record<Lang, string>> } | null;

let state: State = null;
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

export function useAlternates() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => null,
  );
}

export function SetAlternates({ lang, alternates }: { lang: Lang; alternates: Partial<Record<Lang, string>> }) {
  useEffect(() => {
    set({ lang, alternates });
    return () => set(null);
  }, [lang, alternates]);
  return null;
}

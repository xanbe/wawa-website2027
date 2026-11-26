"use client";

// Cloudflare Turnstile: formu gönderirken arka planda bot doğrulaması yapar.
// Çoğu ziyaretçi hiçbir şey görmez; şüpheli durumda formun içinde küçük bir doğrulama kutusu çıkar.
// NEXT_PUBLIC_TURNSTILE_SITE_KEY tanımlı değilse hiçbir şey yüklenmez ve boş belirteç döner.
import { useCallback, useEffect, useRef } from "react";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
let loader: Promise<Turnstile> | null = null;

function load(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loader ??= new Promise<Turnstile>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => {
      loader = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

export function useTurnstile(lang = "tr") {
  const ref = useRef<HTMLDivElement | null>(null);
  const id = useRef<string | null>(null);
  const clear = () => {
    if (id.current && window.turnstile) window.turnstile.remove(id.current);
    id.current = null;
  };
  useEffect(() => clear, []);

  // Her gönderimde yeni (tek kullanımlık) belirteç alınır
  const getToken = useCallback(async (): Promise<string> => {
    if (!SITE_KEY || !ref.current) return "";
    try {
      const ts = await load();
      clear();
      return await new Promise<string>((resolve) => {
        const timer = window.setTimeout(() => resolve(""), 90_000);
        const done = (t: string) => {
          window.clearTimeout(timer);
          resolve(t);
        };
        id.current = ts.render(ref.current!, {
          sitekey: SITE_KEY,
          appearance: "interaction-only",
          language: lang,
          callback: done,
          "error-callback": () => done(""),
          "timeout-callback": () => done(""),
        });
      });
    } catch {
      return "";
    }
  }, [lang]);

  return { ref, getToken };
}

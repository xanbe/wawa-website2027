// İç mimarlık fiyat rehberi (TR /ic-mimarlik-fiyatlari/, EN /en/interior-design-prices/, DE /de/innenarchitektur-preise/).
// Şimdilik rakam verilmez: bütçenin nasıl oluştuğu, fiyatı belirleyen kalemler ve teklif öncesi hazırlık anlatılır.
// Tasarım bedeli Türkçede /butce-planlama/ aracıyla hesaplanır; diğer dillerde teklif formuna yönlenir.
// Metinler interior-prices.json içinde; yönetim paneli bu dosyayı düzenleyip commit eder.
// Not: başlıklardaki yıl metne yazılıdır; yıl değişince "year" ile birlikte metinler de güncellenmelidir.
import type { PageLang } from "./fair-meta";
import data from "./interior-prices.json";

type Content = {
  metaTitle: string;
  metaDesc: string;
  title: string;
  lead: string;
  h: { parts: string; modes: string; factors: string; spaces: string; prepare: string; faq: string };
  parts: { title: string; text: string; cta: { label: string; href: string } }[];
  modes: { title: string; text: string; items: string[] }[];
  factors: { title: string; text: string }[];
  spaces: { title: string; href: string; items: string[] }[];
  prepare: string[];
  faq: { q: string; a: string }[];
  end: { title: string; text: string; cta: string; href: string };
};

const D = data as { year: number; content: Record<PageLang, Content> };

export const INTERIOR_PRICE_YEAR: number = D.year;

export const INTERIOR_PRICES: Record<PageLang, Content> = D.content;

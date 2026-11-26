import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { HOME } from "@/content/home";
import { GOOGLE_MAPS_URL } from "./google-reviews-data";
import { SectionHeader } from "./SectionHeading";

// Puan, yorum sayısı ve yorumlar yönetim panelinden (src/content/home.json) gelir; harita adresi kodda sabittir
const { rating: GOOGLE_RATING, count: GOOGLE_REVIEW_COUNT, url: GOOGLE_REVIEWS_URL, items: REVIEWS } = HOME.reviews;

const LINE = "border-wawa-charcoal/15";
// Google Haritalar gömme görünümü; siyah beyaz gösterilir, tıklanınca işletme sayfası açılır
const MAP_EMBED =
  "https://www.google.com/maps?q=Wawa%20%C4%B0%C3%A7mimarl%C4%B1k%20Fuar%20Stand%C4%B1%20Zeytinburnu%20%C4%B0stanbul&z=15&output=embed";

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`5 üzerinden ${value.toLocaleString("tr-TR")} puan`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={`${size} ${i <= Math.round(value) ? "fill-wawa-charcoal text-wawa-charcoal" : "text-wawa-charcoal/25"}`}
        />
      ))}
    </span>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("tr-TR");

// Sayfanın sonunda: solda siyah beyaz harita (tıklanınca Google Haritalar), sağda seçilmiş 3 Google yorumu.
// Yorum girilmemişse bölüm görünmez.
export function GoogleReviews() {
  if (REVIEWS.length === 0) return null;
  const reviews = REVIEWS.slice(0, 3);
  const rating = GOOGLE_RATING.toLocaleString("tr-TR", { minimumFractionDigits: 1 });

  return (
    <section aria-labelledby="reviews-title" className="bg-white">
      <div className="container-wide pt-14 pb-14 lg:pt-16 lg:pb-16">
        <SectionHeader id="reviews-title" title="Müşterilerimizden.">
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 text-wawa-charcoal">
            <span className="font-heading text-[40px] font-normal leading-none tabular-nums">{rating}</span>
            <span className="flex flex-col gap-1.5">
              <Stars value={GOOGLE_RATING} />
              <span className="inline-flex items-center gap-1 text-[14px] text-wawa-charcoal/65 transition-colors group-hover:text-wawa-charcoal">
                Google&apos;da {GOOGLE_REVIEW_COUNT} yorum
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </span>
          </a>
        </SectionHeader>

        <div className={`mt-10 grid border lg:mt-14 lg:grid-cols-12 ${LINE}`}>
          {/* Harita: siyah beyaz, üzerine gelince hafifçe renklenir; tamamı Google Haritalar bağlantısı.
              Google'ın sol üstteki bilgi kartı görünmesin diye harita yukarı kaydırılır; alttaki Google atfı görünür kalır. */}
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WAWA Interiors'ı Google Haritalar'da açın"
            className={`group relative block aspect-[4/3] overflow-hidden border-b bg-[#F3F2EF] lg:col-span-5 lg:aspect-auto lg:min-h-[520px] lg:border-r lg:border-b-0 ${LINE}`}
          >
            <iframe
              src={MAP_EMBED}
              title="WAWA Interiors konumu"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
              className="pointer-events-none absolute inset-x-0 -top-[180px] bottom-0 h-[calc(100%+180px)] w-full border-0 [filter:grayscale(1)_contrast(1.08)] transition-[filter] duration-700 group-hover:[filter:grayscale(0.6)_contrast(1.04)]"
            />
            <span className="absolute top-4 right-4 left-4 flex items-center justify-between gap-4 bg-white p-4 sm:right-auto sm:min-w-[280px]">
              <span className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center bg-wawa-accent text-wawa-charcoal">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-[15px] text-wawa-charcoal">WAWA Interiors</span>
                  <span className="block text-[13px] text-wawa-charcoal/60">Zeytinburnu, İstanbul</span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-wawa-charcoal transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </a>

          {/* Yorumlar: satırlar ince çizgilerle ayrılır */}
          <div className="flex flex-col lg:col-span-7">
            <ul className="flex-1">
              {reviews.map((r, i) => (
                <li key={r.author} className={`flex gap-5 p-6 sm:p-8 ${i > 0 ? `border-t ${LINE}` : ""}`}>
                  <span
                    aria-hidden
                    className="grid h-11 w-11 shrink-0 place-items-center bg-wawa-charcoal text-[14px] font-medium tracking-wide text-wawa-accent"
                  >
                    {initials(r.author)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[15px] text-wawa-charcoal">{r.author}</span>
                      <Stars value={5} size="h-3.5 w-3.5" />
                      <span className="text-[13px] text-wawa-charcoal/55">{r.when}</span>
                    </div>
                    <blockquote className="mt-3 text-[16px] leading-relaxed text-wawa-charcoal/85">{r.text}</blockquote>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-between gap-4 border-t px-6 py-5 text-[15px] text-wawa-charcoal transition-colors duration-300 hover:bg-[#F3F2EF] sm:px-8 ${LINE}`}
            >
              {GOOGLE_REVIEW_COUNT} yorumun tamamını Google&apos;da görün
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

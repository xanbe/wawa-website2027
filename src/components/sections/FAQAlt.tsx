"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./SectionHeading";

const faqs: { question: string; answer: string }[] = [
  {
    question: "Tasarım süreci ne kadar sürer?",
    answer:
      "Proje türüne, metrekareye ve teslim tarihine göre değişir. İlk görüşmede kapsamı netleştirir, size baştan net bir takvim paylaşırız.",
  },
  {
    question: "Üretim ve kurulum hangi ülkelerde?",
    answer:
      "Üretim İstanbul'daki atölyemizde yapılır. Avrupa, Birleşik Krallık, Amerika, Ortadoğu ve Afrika'da kurulumu kendi ekibimiz ve lojistik planla yönetiriz.",
  },
  {
    question: "İç mimar ücreti nasıl belirlenir?",
    answer:
      "Ücret metrekareye ve proje kapsamına göre belirlenir: tasarım karmaşıklığı, malzeme seviyesi, özel imalatlar ve teslim tarihi. İlk görüşmede kapsamı ve bütçe aralığını netleştiririz.",
  },
  {
    question: "Nakliye ve montaj dahil mi?",
    answer:
      "Anahtar teslim projelerde üretim, nakliye ve montaj tek elden yönetilir. Dahil olan kalemler proje başında yazılı olarak netleşir.",
  },
  {
    question: "Başlamak için neye ihtiyacınız var?",
    answer:
      "Proje türü, ölçüler, lokasyon, teslim ya da fuar tarihi ve beğendiğiniz referanslar yeterli. Gerisini birlikte kurgularız.",
  },
];

const LINE = "border-wawa-charcoal/15";
const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

// Sık sorulan sorular, süreç bölümünün devamı olarak aynı taş zeminde durur.
// Sorular süreç adımları gibi yatayda sekmelerdir; seçili sorunun cevabı altta görünür. Görsel yok.
// Mobilde sekmeler yatayda kaydırılır.
export function FAQAlt() {
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="faq-title" className="bg-[#F3F2EF]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <div className="container-wide pt-8 pb-8 lg:pt-10 lg:pb-10">
        <SectionHeader id="faq-title" title="Sık sorulan sorular.">
          <Link
            href="/iletisim/"
            className="group inline-flex items-center gap-2 text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] transition-colors hover:decoration-wawa-charcoal"
          >
            Başka bir sorunuz mu var?
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </SectionHeader>

        {/* Yatay sekmeler: süreç adımlarındaki gibi üstte çizgi, numara ve soru */}
        <div className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:mt-10 [&::-webkit-scrollbar]:hidden">
          <ul className="grid min-w-[880px] grid-cols-5 gap-4 lg:min-w-0 lg:gap-6" role="tablist" aria-label="Sorular">
            {faqs.map((f, i) => {
              const isActive = i === active;
              return (
                <li key={f.question}>
                  <button
                    type="button"
                    role="tab"
                    id={`faq-tab-${i}`}
                    aria-selected={isActive}
                    aria-controls="faq-panel"
                    onClick={() => setActive(i)}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <span className="relative block h-[3px] bg-wawa-charcoal/10">
                      <span
                        className={`absolute inset-0 origin-left bg-wawa-charcoal transition-transform duration-500 ${EASE} ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </span>
                    <span className={`mt-4 block text-sm tabular-nums ${isActive ? "text-wawa-charcoal" : "text-wawa-charcoal/50"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`mt-1 block text-[17px] leading-snug tracking-tight transition-colors duration-300 lg:text-lg ${
                        isActive ? "text-wawa-charcoal" : "text-wawa-charcoal/50 group-hover:text-wawa-charcoal"
                      }`}
                    >
                      {f.question}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Seçili sorunun cevabı */}
        <div
          id="faq-panel"
          role="tabpanel"
          aria-labelledby={`faq-tab-${active}`}
          className={`mt-8 grid gap-6 border-t pt-8 lg:mt-10 lg:grid-cols-12 lg:gap-10 lg:pt-10 ${LINE}`}
        >
          {/* Bütün cevaplar sayfada durur (arama motorları ve ekran okuyucular hepsini okur); yalnızca seçili olan görünür */}
          {faqs.map((f, i) => (
            <p
              key={i === active ? `on-${i}` : `off-${i}`}
              hidden={i !== active}
              className="animate-fade-in text-[20px] leading-relaxed text-wawa-charcoal lg:col-span-7 lg:text-[24px]"
            >
              {f.answer}
            </p>
          ))}
          <Link
            href="/iletisim/"
            className="group inline-flex items-center gap-2 self-start text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] transition-colors hover:decoration-wawa-charcoal lg:col-span-4 lg:col-start-9 lg:mt-2.5 lg:justify-self-start"
          >
            Projenizi konuşalım
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

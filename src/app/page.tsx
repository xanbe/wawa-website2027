import type { Metadata } from "next";
import { getLegacyPage } from "@/lib/content";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { ProjectsGallery } from "@/components/sections/ProjectsGallery";
import { GlobalBrands } from "@/components/sections/GlobalBrands";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { ServiceCards } from "@/components/sections/ServiceCards";
import { TurnkeyProcess } from "@/components/sections/TurnkeyProcess";
import { BudgetTeaser } from "@/components/sections/BudgetTeaser";
import { Press } from "@/components/sections/Press";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { FAQAlt } from "@/components/sections/FAQAlt";
import { InteriorArchitectIntro } from "@/components/sections/InteriorArchitectIntro";

// Sayfanın akışı: iç mimarlık mesajı (hero) → referanslar → seçilmiş projeler → uzmanlık alanları →
// uluslararası deneyim → yaklaşım ve ekip → süreç → sorular → bütçe (üçü aynı taş zeminde) → Google yorumları ve harita → kapanış (footer)
// Eski sitenin anasayfa başlığı ve açıklaması korunur (arama sonuçlarındaki görünüm değişmesin)
const legacyHome = getLegacyPage("/")?.seo;
export const metadata: Metadata = {
  title: { absolute: legacyHome?.fullTitle ?? "İç Mimar ve Fuar Standı Tasarımı | Wawa Interiors" },
  description: legacyHome?.description ?? undefined,
  alternates: { canonical: "/", languages: { tr: "/", en: "/en/", de: "/de/", it: "/it/", fr: "/fr/", "x-default": "/" } },
};

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <GlobalBrands />
      <ProjectsGallery title="Seçilmiş projeler" />
      <ServiceCards />
      <InteriorArchitectIntro />
      <GlobalReach />
      <TurnkeyProcess />
      <FAQAlt />
      <BudgetTeaser />
      <Press />
      <GoogleReviews />
    </>
  );
}

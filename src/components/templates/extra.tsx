import { t, ROUTES } from "@/lib/i18n";
import type { ExtraPage } from "@/content/extra-pages";
import { INTERIOR_PROCESS, INTERIOR_SCOPE, STAND_PROCESS, type Landing } from "@/content/landings";
import { LandingTemplate, relatedProjects } from "./landing";
import { parentService } from "@/components/layout/navigation";

const FOCUS = { tr: "Neye dikkat ediyoruz?", en: "What we focus on", de: "Worauf wir achten", it: "A cosa prestiamo attenzione", fr: "Ce à quoi nous veillons" };

// Yeni hizmet sayfaları (İnşaat Taahhüt, Mobilya Üretim) ve sektör sayfaları: hizmet sayfalarıyla aynı açılış kurgusu
export function ExtraServiceTemplate({ page }: { page: ExtraPage }) {
  const lang = page.lang;
  const [first, ...rest] = page.sections;
  const landing: Landing = {
    kicker: page.title,
    title: page.title,
    lead: page.lead,
    heroImages: [page.image],
    highlights: page.points.map((p) => ({ title: p, text: "" })),
    intro: { title: first.h, text: first.p },
    process: page.key === "stand" ? STAND_PROCESS : lang === "tr" ? INTERIOR_PROCESS : [],
    scope: lang === "tr" && page.key === "sector" ? INTERIOR_SCOPE : undefined,
    blocks: rest.length ? [{ title: FOCUS[lang], items: rest.map((s) => ({ title: s.h, text: s.p })) }] : [],
    showBrands: lang === "tr",
  };
  return (
    <LandingTemplate
      lang={lang}
      path={page.path}
      title={page.title}
      lead={page.lead}
      heroImages={[page.image]}
      breadcrumb={(() => {
        // Sektör sayfasının üst bağlantısı kendi üst hizmetidir (ör. Kuyumcu → Mağaza Tasarımı)
        const parent = parentService(lang, page.path);
        return parent ? { label: parent.name, href: parent.href } : { label: t(lang).nav.services, href: ROUTES[lang].services };
      })()}
      landing={landing}
      projects={relatedProjects(lang, page.projectCategories, page.projectPaths, 24)}
      projectsHref={ROUTES[lang].projects}
      faq={page.faq}
      detailsHtml={page.faq?.length ? "" : undefined}
    />
  );
}

import Image from "next/image";
import Link from "next/link";
import { t, ROUTES, type Lang } from "@/lib/i18n";
import { projectCategories, projectCategory, projectsIn, type Category, type Project } from "@/lib/content";
import { CtaBand, LINE, PageIntro, Pagination, ProjectCard, Prose } from "./parts";

const INTRO = {
  tr: { title: "Projelerimiz", lead: "Tasarlayıp kendi ekibimizle uyguladığımız iç mimarlık ve fuar standı projeleri." },
  en: { title: "Our Projects", lead: "Interior architecture and exhibition stand projects we designed and built with our own team." },
  de: { title: "Unsere Projekte", lead: "Innenarchitektur- und Messestandprojekte, entworfen und umgesetzt von unserem eigenen Team." },
  it: { title: "Progetti", lead: "Progetti di architettura d'interni e stand fieristici, progettati e realizzati dal nostro team." },
  fr: { title: "Nos projets", lead: "Projets d'architecture intérieure et de stands d'exposition, conçus et réalisés par notre propre équipe." },
};

// Kategori sekmeleri: her biri kendi adresine giden kare bağlantılar
function CategoryTabs({ lang, active }: { lang: Lang; active?: string }) {
  const cats = projectCategories(lang);
  const all = { path: ROUTES[lang].projects, name: t(lang).labels.all };
  return (
    <div className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:mt-10 [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max border border-wawa-charcoal/15">
        {[all, ...cats].map((c, i) => {
          const isActive = (active ?? ROUTES[lang].projects) === c.path;
          return (
            <Link
              key={c.path}
              href={c.path}
              aria-current={isActive ? "page" : undefined}
              className={`px-4 py-3 text-[14px] whitespace-nowrap transition-colors sm:px-5 ${i > 0 ? "border-l border-wawa-charcoal/15" : ""} ${
                isActive ? "bg-wawa-charcoal text-white" : "text-wawa-charcoal hover:bg-[#F3F2EF]"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectListTemplate({
  lang,
  projects,
  page,
  pages,
  base,
  category,
}: {
  lang: Lang;
  projects: Project[];
  page: number;
  pages: number;
  base: string;
  category?: Category;
}) {
  const intro = INTRO[lang];
  return (
    <>
      <PageIntro lang={lang} title={category ? category.name : intro.title} lead={intro.lead}>
        <CategoryTabs lang={lang} active={category?.path} />
      </PageIntro>
      <section className="bg-white" lang={lang}>
        <div className="container-wide pb-14 lg:pb-16">
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.path} project={p} category={category ? null : projectCategory(p)?.name} />
            ))}
          </div>
          <Pagination base={base} page={page} pages={pages} lang={lang} />
        </div>
      </section>
      <CtaBand lang={lang} />
    </>
  );
}

export function ProjectTemplate({ project }: { project: Project }) {
  const lang = project.lang;
  const L = t(lang).labels;
  const cat = projectCategory(project);
  const facts = [
    { label: L.brand, value: project.meta?.["Marka"] },
    { label: L.service, value: project.meta?.["Verilen Hizmet"] },
    { label: L.category, value: cat?.name ?? project.meta?.["Kategori"] },
  ].filter((f) => f.value);
  const related = projectsIn(lang)
    .filter((p) => p.path !== project.path && projectCategory(p)?.path === cat?.path)
    .slice(0, 3);
  const [hero, ...rest] = project.gallery.length ? project.gallery : project.featuredImage ? [{ src: project.featuredImage, alt: project.title }] : [];

  return (
    <>
      <article lang={lang}>
        <header className="bg-white">
          <div className="container-wide pt-32 lg:pt-44">
            <Link href={cat?.path ?? ROUTES[lang].projects} className="text-[14px] text-wawa-charcoal/60 underline-offset-4 hover:underline">
              {cat?.name ?? t(lang).nav.projects}
            </Link>
            <h1 className="mt-4 max-w-[26ch] font-heading text-[28px] leading-[1.25] font-normal tracking-[-0.01em] text-balance text-wawa-charcoal sm:text-[36px] lg:text-[48px]">
              {project.title}
            </h1>
            {facts.length > 0 && (
              <dl className={`mt-8 grid border-t sm:grid-cols-3 lg:mt-10 ${LINE}`}>
                {facts.map((f, i) => (
                  <div key={f.label} className={`py-4 sm:py-5 ${i > 0 ? `border-t sm:border-t-0 sm:border-l sm:pl-6 ${LINE}` : ""}`}>
                    <dt className="text-[13px] text-wawa-charcoal/55">{f.label}</dt>
                    <dd className="mt-1 text-[16px] text-wawa-charcoal">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {hero && (
            <div className="container-wide mt-2">
              <div className="relative aspect-[16/9] overflow-hidden bg-[#F3F2EF]">
                <Image src={hero.src} alt={hero.alt || project.title} fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
              </div>
            </div>
          )}
        </header>

        {project.html && (
          <div className="container-wide grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
            <div className="lg:col-span-8 lg:col-start-3">
              <Prose html={project.html} />
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <section className="container-wide pb-14 lg:pb-16" aria-label={L.gallery}>
            <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
              {rest.map((img, i) => (
                <div key={img.src} className={`relative overflow-hidden bg-[#F3F2EF] ${i % 3 === 2 ? "aspect-[16/9] sm:col-span-2" : "aspect-[4/3]"}`}>
                  <Image
                    src={img.src}
                    alt={img.alt || project.title}
                    fill
                    sizes={i % 3 === 2 ? "(min-width: 1280px) 1216px, 100vw" : "(min-width: 640px) 50vw, 100vw"}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {related.length > 0 && (
        <section className="bg-white" lang={lang}>
          <div className={`container-wide border-t pt-12 pb-14 lg:pt-14 lg:pb-16 ${LINE}`}>
            <h2 className="font-heading text-[24px] font-normal text-wawa-charcoal lg:text-[30px]">{L.relatedProjects}</h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.path} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand lang={lang} />
    </>
  );
}

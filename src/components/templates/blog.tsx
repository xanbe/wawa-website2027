import Image from "next/image";
import Link from "next/link";
import { t, ROUTES, type Lang } from "@/lib/i18n";
import { postsIn, readingMinutes, type Post } from "@/lib/content";
import { CtaBand, FaqList, LINE, PageIntro, Pagination, PostCard, Prose, formatDate } from "./parts";

const INTRO = {
  tr: { title: "Blog", lead: "İç mimarlık, fuar standı ve uygulama süreçleri üzerine yazılar." },
  en: { title: "Blog", lead: "Articles on interior architecture, exhibition stands and project delivery." },
  de: { title: "Blog", lead: "Beiträge über Innenarchitektur, Messestände und Projektumsetzung." },
  it: { title: "Blog", lead: "Articoli su architettura d'interni, stand fieristici e realizzazione dei progetti." },
  fr: { title: "Blog", lead: "Articles sur l'architecture intérieure, les stands d'exposition et la réalisation des projets." },
};

export function BlogListTemplate({
  lang,
  title,
  lead,
  posts,
  page,
  pages,
  base,
}: {
  lang: Lang;
  title?: string;
  lead?: string;
  posts: Post[];
  page: number;
  pages: number;
  base: string;
}) {
  const intro = INTRO[lang];
  return (
    <>
      <PageIntro lang={lang} title={title ?? intro.title} lead={lead ?? intro.lead} />
      <section className="bg-white" lang={lang}>
        <div className="container-wide pb-14 lg:pb-16">
          <div className={`grid gap-x-8 gap-y-14 border-t pt-10 sm:grid-cols-2 lg:grid-cols-3 lg:pt-14 ${LINE}`}>
            {posts.map((p) => (
              <PostCard key={p.path} post={p} lang={lang} />
            ))}
          </div>
          <Pagination base={base} page={page} pages={pages} lang={lang} />
        </div>
      </section>
      <CtaBand lang={lang} />
    </>
  );
}

export function PostTemplate({ post }: { post: Post }) {
  const lang = post.lang;
  const L = t(lang).labels;
  const latest = postsIn(lang)
    .filter((p) => p.path !== post.path)
    .slice(0, 3);
  return (
    <>
      <article lang={lang}>
        <header className="bg-white">
          <div className="container-wide pt-32 lg:pt-44">
            <Link href={ROUTES[lang].blog} className="text-[14px] text-wawa-charcoal/60 underline-offset-4 hover:underline">
              Blog
            </Link>
            <h1 className="mt-4 max-w-[26ch] font-heading text-[28px] leading-[1.25] font-normal tracking-[-0.01em] text-balance text-wawa-charcoal sm:text-[36px] lg:text-[44px]">
              {post.title}
            </h1>
            <p className="mt-5 text-[14px] text-wawa-charcoal/60">
              {formatDate(post.date, lang)} · {readingMinutes(post.html)} {L.minRead}
            </p>
          </div>
          {post.featuredImage && (
            <div className="container-wide mt-10 lg:mt-12">
              <div className="relative aspect-[16/9] overflow-hidden bg-[#F3F2EF]">
                <Image src={post.featuredImage} alt={post.title} fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
              </div>
            </div>
          )}
        </header>
        <div className="container-wide grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-8 lg:col-start-3">
            <Prose html={post.html} />
            <FaqList items={post.faq} lang={lang} />
          </div>
        </div>
      </article>
      {latest.length > 0 && (
        <section className="bg-white" lang={lang}>
          <div className={`container-wide border-t pt-12 pb-14 lg:pt-14 lg:pb-16 ${LINE}`}>
            <h2 className="font-heading text-[24px] font-normal text-wawa-charcoal lg:text-[30px]">{L.latestPosts}</h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((p) => (
                <PostCard key={p.path} post={p} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand lang={lang} />
    </>
  );
}

// Eski WordPress adreslerinin tamamını yeni şablonlara eşler. Hiçbir adres değişmez; her biri aynı yolda açılır.
import { LANGS, ROUTES, contentLang, langFromPath, type Lang } from "./i18n";
import {
  PAGE_SIZE,
  categories,
  getCategory,
  getLegacyPage,
  getPost,
  getProject,
  getService,
  legacyPages,
  paginate,
  posts,
  postsIn,
  postsInCategory,
  projects,
  projectsIn,
  projectsInCategory,
  services,
  type Category,
  type LegacyPage,
  type Post,
  type Project,
  type Service,
} from "./content";
import { INTERIOR_HUB } from "@/components/layout/navigation";
import { extraPages, getExtraPage, type ExtraPage } from "@/content/extra-pages";
import { sectorPages } from "@/content/sector-pages";
import { standPages } from "@/content/stand-pages";
import { getLegalPage, legalPages, type LegalPage } from "@/content/legal";

export type Resolved =
  | { type: "home"; lang: Exclude<Lang, "tr"> }
  | { type: "about" | "contact" | "offer" | "services"; lang: Lang; legacy?: LegacyPage }
  | { type: "projects"; lang: Lang; items: Project[]; page: number; pages: number; base: string }
  | { type: "projectCategory"; lang: Lang; category: Category; items: Project[]; page: number; pages: number; base: string }
  | { type: "blog"; lang: Lang; items: Post[]; page: number; pages: number; base: string; title?: string }
  | { type: "post"; post: Post }
  | { type: "project"; project: Project }
  | { type: "service"; service: Service }
  | { type: "page"; page: LegacyPage }
  | { type: "extra"; page: ExtraPage }
  | { type: "legal"; page: LegalPage };

// Yeni hizmet ve sektör sayfaları
const ALL_EXTRA = [...extraPages, ...sectorPages, ...standPages];
const extraByPath = (path: string) => getExtraPage(path) ?? sectorPages.find((p) => p.path === path) ?? standPages.find((p) => p.path === path);

// Sabit sayfalar (her dilde)
const FIXED: Record<string, { type: "about" | "contact" | "offer" | "services"; lang: Lang }> = {};
for (const lang of LANGS) {
  FIXED[ROUTES[lang].about] = { type: "about", lang };
  FIXED[ROUTES[lang].contact] = { type: "contact", lang };
  FIXED[ROUTES[lang].offer] = { type: "offer", lang };
  FIXED[ROUTES[lang].services] = { type: "services", lang };
}
// Eski hizmet arşivleri de hizmetler sayfasını gösterir (kanonik: hizmetler sayfası)
const SERVICE_ARCHIVES: Record<string, Lang> = {
  "/service/": "tr",
  "/en/service/": "en",
  "/de/service/": "de",
  "/service-category/hizmetler/": "tr",
  "/en/service-category/services/": "en",
  "/de/service-category/dienstleistungen/": "de",
};
// Proje listeleri: yeni ad (projelerimiz) ve eski arşiv (/portfolio/, sayfalı)
const PROJECT_ARCHIVES: Record<string, Lang> = {
  "/projelerimiz/": "tr",
  "/en/our-projects/": "en",
  "/de/unsere-projekte/": "de",
  "/portfolio/": "tr",
  "/en/portfolio/": "en",
  "/de/portfolio/": "de",
  "/it/progetti/": "it",
  "/fr/nos-projets/": "fr",
};
const BLOG_ARCHIVES: Record<string, Lang> = { "/blog/": "tr", "/en/blog-2/": "en", "/de/blog-3/": "de" };
// Eski kategori sayfası "Blog" ve "Genel" (yalnızca TR)
const POST_CATEGORY_PATHS = categories.filter((c) => c.kind === "post-category").map((c) => c.path);
// Yukarıdaki şablonların karşıladığı eski sayfalar; geri kalanlar içerik sayfası olarak açılır
const HOMES = ["/en/", "/de/", "/it/", "/fr/"];
const HANDLED = new Set(["/", ...HOMES, ...Object.keys(FIXED), ...Object.keys(PROJECT_ARCHIVES), ...Object.keys(BLOG_ARCHIVES)]);

function splitPage(path: string): { base: string; page: number } {
  const m = path.match(/^(.*\/)page\/(\d+)\/$/);
  return m ? { base: m[1], page: Number(m[2]) } : { base: path, page: 1 };
}

const sortedProjects = (lang: Lang) => projectsIn(contentLang(lang));
const blogPosts = (lang: Lang) => (lang === "de" ? postsIn("en") : postsIn(lang));

export function resolve(path: string): Resolved | null {
  if (HOMES.includes(path)) return { type: "home", lang: langFromPath(path) as Exclude<Lang, "tr"> };
  if (FIXED[path]) return { ...FIXED[path], legacy: getLegacyPage(path) };
  if (SERVICE_ARCHIVES[path]) return { type: "services", lang: SERVICE_ARCHIVES[path] };

  const legal = getLegalPage(path);
  if (legal) return { type: "legal", page: legal };
  const extra = extraByPath(path);
  if (extra) return { type: "extra", page: extra };

  // İç mimarlık ana sayfası: eski "İç Mimarlık Hizmeti" yazısının adresi hizmet açılış sayfası olarak gösterilir (metni sayfada kalır)
  if (path === INTERIOR_HUB) {
    const p = getPost(path);
    if (p) return { type: "service", service: { path: p.path, lang: p.lang, slug: p.slug, title: "İç Mimarlık", featuredImage: p.featuredImage, images: [], html: p.html, faq: p.faq, alternates: { tr: p.path }, seo: p.seo } };
  }
  const post = getPost(path);
  if (post) return { type: "post", post };
  const project = getProject(path);
  if (project) return { type: "project", project };
  const service = getService(path);
  if (service) return { type: "service", service };

  const { base, page } = splitPage(path);
  if (PROJECT_ARCHIVES[base]) {
    const lang = PROJECT_ARCHIVES[base];
    const p = paginate(sortedProjects(lang), page, PAGE_SIZE.projects);
    if (page > p.pages) return null;
    return { type: "projects", lang, items: p.items, page, pages: p.pages, base };
  }
  const cat = getCategory(base);
  if (cat && cat.kind === "portfolio-category") {
    const p = paginate(projectsInCategory(cat), page, PAGE_SIZE.projects);
    if (page > p.pages) return null;
    return { type: "projectCategory", lang: cat.lang, category: cat, items: p.items, page, pages: p.pages, base };
  }
  if (BLOG_ARCHIVES[base]) {
    const lang = BLOG_ARCHIVES[base];
    const p = paginate(blogPosts(lang), page, PAGE_SIZE.posts);
    if (page > p.pages) return null;
    return { type: "blog", lang, items: p.items, page, pages: p.pages, base };
  }
  if (POST_CATEGORY_PATHS.includes(base) && cat) {
    const p = paginate(postsInCategory(cat), page, PAGE_SIZE.posts);
    if (page > p.pages) return null;
    return { type: "blog", lang: "tr", items: p.items, page, pages: p.pages, base, title: cat.name };
  }
  if (page === 1) {
    const legacy = getLegacyPage(path);
    if (legacy && !HANDLED.has(path)) return { type: "page", page: legacy };
  }
  return null;
}

// Derleme sırasında üretilecek tüm adresler
export function allPaths(): string[] {
  const out = new Set<string>([...HOMES, ...Object.keys(FIXED), ...Object.keys(SERVICE_ARCHIVES)]);
  posts.forEach((p) => out.add(p.path));
  projects.forEach((p) => out.add(p.path));
  services.forEach((s) => out.add(s.path));
  legacyPages.forEach((p) => p.path !== "/" && out.add(p.path));
  ALL_EXTRA.forEach((p) => out.add(p.path));
  legalPages.forEach((p) => out.add(p.path));
  const addPaged = (base: string, total: number, size: number) => {
    out.add(base);
    for (let n = 2; n <= Math.ceil(total / size); n++) out.add(`${base}page/${n}/`);
  };
  for (const [base, lang] of Object.entries(PROJECT_ARCHIVES)) addPaged(base, sortedProjects(lang).length, PAGE_SIZE.projects);
  for (const [base, lang] of Object.entries(BLOG_ARCHIVES)) addPaged(base, blogPosts(lang).length, PAGE_SIZE.posts);
  for (const c of categories) {
    if (c.kind === "portfolio-category") addPaged(c.path, projectsInCategory(c).length, PAGE_SIZE.projects);
    if (c.kind === "post-category") addPaged(c.path, postsInCategory(c).length, PAGE_SIZE.posts);
  }
  return [...out].filter((p) => p !== "/" && resolve(p) !== null);
}

// Kanonik adres: arşiv kopyaları asıl sayfayı gösterir, diğerleri kendisini
export function canonicalOf(path: string, r: Resolved): string {
  if (r.type === "services") return ROUTES[r.lang].services;
  if (r.type === "projects" && r.page === 1) return ROUTES[r.lang].projects;
  return path;
}

export { langFromPath };

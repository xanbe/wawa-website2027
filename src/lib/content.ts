// Eski WordPress sitesinden taşınan içeriğe erişim. Veriler src/content/*.json dosyalarındadır.
import postsData from "@/content/posts.json";
import projectsData from "@/content/projects.json";
import servicesData from "@/content/services.json";
import pagesData from "@/content/pages.json";
import categoriesData from "@/content/categories.json";
import { seoOverrides } from "@/content/seo-overrides";
import type { Lang } from "./i18n";

export type Seo = { title: string | null; fullTitle: string | null; description: string | null; ogImage: string | null };
type Alternates = Partial<Record<Lang, string>>;
type Image = { src: string; alt: string };

export type Post = {
  path: string;
  lang: Lang;
  slug: string;
  title: string;
  date: string | null;
  modified: string | null;
  featuredImage: string | null;
  categories: string[];
  html: string;
  faq: { q: string; a: string }[];
  alternates: Alternates;
  seo: Seo;
};

export type Project = {
  path: string;
  lang: Lang;
  slug: string;
  title: string;
  featuredImage: string | null;
  meta: Record<string, string>;
  gallery: Image[];
  html: string;
  alternates: Alternates;
  seo: Seo;
};

export type Service = {
  path: string;
  lang: Lang;
  slug: string;
  title: string;
  featuredImage: string | null;
  images: Image[];
  html: string;
  faq: { q: string; a: string }[];
  alternates: Alternates;
  seo: Seo;
};

export type LegacyPage = {
  path: string;
  lang: Lang;
  slug: string;
  title: string;
  html: string;
  images: Image[];
  alternates: Alternates;
  seo: Seo;
};

export type Category = {
  path: string;
  lang: Lang;
  kind: "portfolio-category" | "service-category" | "post-category" | "portfolio" | "service";
  slug: string;
  name: string;
  items: string[];
  alternates: Alternates;
  seo: Seo;
};

export const posts = postsData as Post[];
export const projects = projectsData as Project[];
export const services = servicesData as Service[];
export const legacyPages = pagesData as LegacyPage[];
export const categories = categoriesData as Category[];

// Anahtar kelime düzeltmeleri (src/content/seo-overrides.ts): başlık, açıklama ve H1, adres değişmeden
for (const item of [...posts, ...services, ...legacyPages] as { path: string; title: string; seo: Seo }[]) {
  const o = seoOverrides[item.path];
  if (!o) continue;
  item.seo = { ...item.seo, ...(o.fullTitle && { fullTitle: o.fullTitle }), ...(o.description && { description: o.description }) };
  if (o.h1) item.title = o.h1;
}

const byPath = <T extends { path: string }>(list: T[]) => new Map(list.map((x) => [x.path, x]));
const postMap = byPath(posts);
const projectMap = byPath(projects);
const serviceMap = byPath(services);
const pageMap = byPath(legacyPages);
const categoryMap = byPath(categories);

export const getPost = (path: string) => postMap.get(path);
export const getProject = (path: string) => projectMap.get(path);
export const getService = (path: string) => serviceMap.get(path);
export const getLegacyPage = (path: string) => pageMap.get(path);
export const getCategory = (path: string) => categoryMap.get(path);

export const postsIn = (lang: Lang) => posts.filter((p) => p.lang === lang);
export const projectsIn = (lang: Lang) => projects.filter((p) => p.lang === lang);
export const servicesIn = (lang: Lang) => services.filter((s) => s.lang === lang);

// Proje kategorileri: TR projelerinde "Kategori" alanı var; EN/DE projeleri TR karşılığından kategorisini alır
export const projectCategories = (lang: Lang) => categories.filter((c) => c.kind === "portfolio-category" && c.lang === lang);

const normalize = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9çğıöşü]+/g, " ")
    .trim();

function trCategoryPathOf(project: Project): string | null {
  const tr = project.lang === "tr" ? project : project.alternates.tr ? getProject(project.alternates.tr) : undefined;
  const name = tr?.meta?.["Kategori"];
  if (!name) return null;
  const cat = projectCategories("tr").find((c) => normalize(c.name) === normalize(name));
  return cat?.path ?? null;
}

// Bir projenin kendi dilindeki kategori sayfası
export function projectCategory(project: Project): Category | null {
  const trPath = trCategoryPathOf(project);
  if (!trPath) return null;
  const trCat = getCategory(trPath);
  if (!trCat) return null;
  if (project.lang === "tr") return trCat;
  const alt = trCat.alternates[project.lang];
  return (alt && getCategory(alt)) || null;
}

export function projectsInCategory(cat: Category) {
  return projectsIn(cat.lang).filter((p) => projectCategory(p)?.path === cat.path);
}

// İç mimarlık mı fuar mı: kategori adına göre (anasayfa ve listeler için)
const STAND_CATEGORY_TR = ["/portfolio-category/fuar-stand-tasarimi/", "/portfolio-category/avm-standi/", "/portfolio-category/maxima-stand/"];
export function isStandProject(project: Project) {
  const trPath = trCategoryPathOf(project);
  return trPath ? STAND_CATEGORY_TR.includes(trPath) : false;
}

// Blog kategorileri (yalnızca TR): yazı kategorisi adı → kategori sayfası
export const postCategories = () => categories.filter((c) => c.kind === "post-category");
export function postsInCategory(cat: Category) {
  return postsIn("tr").filter((p) => p.categories.some((n) => normalize(n) === normalize(cat.name)));
}

// Okuma süresi (dakika)
export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// HTML'den düz metin özet
export function excerpt(html: string, max = 180) {
  const text = html
    .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)) + "…";
}

// Eski sitedeki sayfa başına kayıt sayısı (sayfalı adresler aynı kalsın diye)
export const PAGE_SIZE = { posts: 9, projects: 9 };

export function paginate<T>(list: T[], page: number, size: number) {
  const pages = Math.max(1, Math.ceil(list.length / size));
  return { items: list.slice((page - 1) * size, page * size), pages };
}

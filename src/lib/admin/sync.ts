// Panelde Türkçe proje kaydedilince İngilizce ve Almanca sürümleri eşitlenir:
// fotoğraflar ve kapak her dilde aynı olur; metin, çeviri varsa çeviriyle değişir; yeni projenin dil sürümleri açılır.
// Saf işlev (dosya ya da ağ yok) ki ayrıca sınanabilsin. IT ve FR sitede İngilizce içeriği gösterir.

export type SyncLang = "en" | "de";
export const SYNC_LANGS: SyncLang[] = ["en", "de"];

export type SyncProject = {
  path: string;
  lang: string;
  alternates: Partial<Record<"tr" | SyncLang, string>>;
  seo: { title: string; fullTitle: string; description: string; ogImage?: string | null };
  slug: string;
  title: string;
  featuredImage: string | null;
  meta?: Record<string, string>;
  gallery: { src: string; alt: string }[];
  html: string;
};
export type ProjectText = { title: string; description: string; html: string };

const fullTitle = (t: string) => `${t} | Wawa Interiors`;

// Türkçe metin değişti mi (ya da dil sürümü hiç yok mu): çeviri yalnızca o zaman istenir
export function needsTranslation(tr: SyncProject, prev: ProjectText | null, list: SyncProject[]) {
  if (!prev) return true;
  if (prev.title !== tr.title || prev.html !== tr.html || prev.description !== tr.seo.description) return true;
  return SYNC_LANGS.some((l) => !list.some((p) => p.lang === l && p.path === tr.alternates[l]));
}

// list yerinde değişir; dönen dizi panelde gösterilecek uyarılardır
export function syncProject(list: SyncProject[], tr: SyncProject, tx: Partial<Record<SyncLang, ProjectText>> | null): string[] {
  const notes: string[] = [];
  for (const lang of SYNC_LANGS) {
    let alt = list.find((p) => p.lang === lang && (p.path === tr.alternates[lang] || p.alternates.tr === tr.path));
    const t = tx?.[lang];
    if (!alt) {
      const slug = `${tr.slug}-${lang}`;
      const path = `/${lang}/portfolio/${slug}/`;
      const text = t ?? { title: tr.title, description: tr.seo.description, html: tr.html };
      alt = {
        path,
        lang,
        alternates: { tr: tr.path },
        seo: { title: text.title, fullTitle: fullTitle(text.title), description: text.description, ogImage: tr.featuredImage },
        slug,
        title: text.title,
        featuredImage: tr.featuredImage,
        meta: {},
        gallery: tr.gallery.map((g) => ({ ...g })),
        html: text.html,
      };
      // Yeni proje kendi dilindeki listenin başına (Türkçe sürüm de başa eklenir)
      const first = list.findIndex((p) => p.lang === lang);
      list.splice(first < 0 ? list.length : first, 0, alt);
      if (!t) notes.push(lang);
    } else if (t) {
      alt.title = t.title;
      alt.html = t.html;
      alt.seo = { ...alt.seo, title: t.title, fullTitle: fullTitle(t.title), description: t.description };
    }
    // Fotoğraflar, kapak ve sıra her dilde Türkçeyle aynı
    alt.featuredImage = tr.featuredImage;
    alt.gallery = tr.gallery.map((g) => ({ ...g }));
    alt.seo = { ...alt.seo, ogImage: tr.featuredImage };
  }
  // Üç sürümün karşılık adresleri birbirini göstersin
  const alternates: SyncProject["alternates"] = { tr: tr.path };
  for (const lang of SYNC_LANGS) {
    const alt = list.find((p) => p.lang === lang && (p.path === tr.alternates[lang] || p.alternates.tr === tr.path));
    if (alt) alternates[lang] = alt.path;
  }
  for (const p of list) if (p === tr || (p.lang !== "tr" && p.alternates.tr === tr.path) || Object.values(alternates).includes(p.path)) p.alternates = { ...p.alternates, ...alternates };
  return notes;
}

// Türkçe proje silinince dil sürümleri de kalkar
export function removeProject(list: SyncProject[], trPath: string) {
  const tr = list.find((p) => p.lang === "tr" && p.path === trPath);
  const paths = new Set([trPath, ...Object.values(tr?.alternates ?? {})]);
  for (let i = list.length - 1; i >= 0; i--) if (paths.has(list[i].path) || list[i].alternates.tr === trPath) list.splice(i, 1);
}

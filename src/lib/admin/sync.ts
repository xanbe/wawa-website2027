// Panelde Türkçe içerik (proje ya da blog yazısı) kaydedilince İngilizce ve Almanca sürümleri eşitlenir:
// görseller, kapak, video ve taslak durumu her dilde aynı olur; metin, verilen çeviriyle (otomatik ya da elle) değişir;
// sürümü olmayan dilde yeni sayfa açılır. Saf işlev (dosya ya da ağ yok) ki ayrıca sınanabilsin.
// IT ve FR sitede İngilizce içeriği gösterir.

export type SyncLang = "en" | "de";
export const SYNC_LANGS: SyncLang[] = ["en", "de"];
export type SyncKind = "project" | "post";

export type SyncItem = {
  path: string;
  lang: string;
  alternates: Partial<Record<"tr" | SyncLang, string>>;
  seo: { title: string; fullTitle: string; description: string | null; ogImage?: string | null };
  slug: string;
  title: string;
  featuredImage: string | null;
  html: string;
  draft?: boolean;
  // proje alanları
  meta?: Record<string, string>;
  gallery?: { src: string; alt: string }[];
  video?: string;
  // yazı alanları
  date?: string | null;
  modified?: string | null;
  categories?: string[];
  faq?: { q: string; a: string }[];
};
export type ItemText = { title: string; description: string; html: string };
// Geriye dönük adlar
export type SyncProject = SyncItem;
export type ProjectText = ItemText;

// Dil sürümlerinin adresleri: projeler /en/portfolio/<ad>-en/, yazılar /en/<ad>/
export const altPath = (kind: SyncKind, lang: SyncLang, slug: string) => (kind === "project" ? `/${lang}/portfolio/${slug}-${lang}/` : `/${lang}/${slug}/`);
const fullTitle = (kind: SyncKind, t: string) => (kind === "project" ? `${t} | Wawa Interiors` : t);

export const findAlt = (list: SyncItem[], tr: SyncItem, lang: SyncLang) => list.find((p) => p.lang === lang && (p.path === tr.alternates[lang] || p.alternates.tr === tr.path));
export const textOf = (p: SyncItem): ItemText => ({ title: p.title, description: p.seo.description ?? "", html: p.html });

// Türkçe metin değişti mi (ya da dil sürümü hiç yok mu): otomatik çeviri yalnızca o zaman istenir
export function needsTranslation(tr: SyncItem, prev: ItemText | null, list: SyncItem[]) {
  if (!prev) return true;
  if (prev.title !== tr.title || prev.html !== tr.html || prev.description !== (tr.seo.description ?? "")) return true;
  return SYNC_LANGS.some((l) => !findAlt(list, tr, l));
}

// list yerinde değişir. tx: dile göre metin (yoksa var olan metin kalır; yeni sürümde Türkçe metin kullanılır).
// create: sürümü olmayan dillerde sayfa açılsın mı (projelerde her zaman; yazılarda yalnızca istenirse).
// Dönen dizi: Türkçe metinle açılmak zorunda kalınan diller (panelde uyarı için).
export function syncItem(kind: SyncKind, list: SyncItem[], tr: SyncItem, tx: Partial<Record<SyncLang, ItemText>> | null, create = true): SyncLang[] {
  const fallback: SyncLang[] = [];
  for (const lang of SYNC_LANGS) {
    let alt = findAlt(list, tr, lang);
    const t = tx?.[lang];
    if (!alt) {
      if (!create && !t) continue;
      let slug = kind === "project" ? `${tr.slug}-${lang}` : tr.slug;
      let path = altPath(kind, lang, tr.slug);
      for (let n = 2; list.some((p) => p.path === path); n++) {
        path = altPath(kind, lang, `${tr.slug}-${n}`);
        slug = kind === "project" ? `${tr.slug}-${n}-${lang}` : `${tr.slug}-${n}`;
      }
      const text = t ?? textOf(tr);
      alt = {
        path,
        lang,
        alternates: { tr: tr.path },
        seo: { title: text.title, fullTitle: fullTitle(kind, text.title), description: text.description, ogImage: tr.featuredImage },
        slug,
        title: text.title,
        featuredImage: tr.featuredImage,
        html: text.html,
        ...(kind === "project" ? { meta: {}, gallery: [] } : { date: tr.date ?? null, modified: tr.modified ?? null, categories: [], faq: [] }),
      };
      // Yeni sürüm kendi dilindeki listenin başına (Türkçe sürüm de başa eklenir)
      const first = list.findIndex((p) => p.lang === lang);
      list.splice(first < 0 ? list.length : first, 0, alt);
      if (!t) fallback.push(lang);
    } else if (t) {
      alt.title = t.title;
      alt.html = t.html;
      alt.seo = { ...alt.seo, title: t.title, fullTitle: fullTitle(kind, t.title), description: t.description };
    }
    // Görseller, kapak, video ve taslak durumu her dilde Türkçeyle aynı
    alt.featuredImage = tr.featuredImage;
    alt.seo = { ...alt.seo, ogImage: tr.featuredImage };
    if (kind === "project") {
      alt.gallery = (tr.gallery ?? []).map((g) => ({ ...g }));
      if (tr.video) alt.video = tr.video;
      else delete alt.video;
    } else {
      alt.modified = tr.modified ?? alt.modified ?? null;
    }
    if (tr.draft) alt.draft = true;
    else delete alt.draft;
  }
  // Sürümlerin karşılık adresleri birbirini göstersin
  const alternates: SyncItem["alternates"] = { tr: tr.path };
  for (const lang of SYNC_LANGS) {
    const alt = findAlt(list, tr, lang);
    if (alt) alternates[lang] = alt.path;
  }
  const linked = new Set(Object.values(alternates));
  for (const p of list) if (linked.has(p.path)) p.alternates = { ...p.alternates, ...alternates };
  return fallback;
}
export const syncProject = (list: SyncItem[], tr: SyncItem, tx: Partial<Record<SyncLang, ItemText>> | null) => syncItem("project", list, tr, tx, true);

// Türkçe içerik silinince dil sürümleri de kalkar
export function removeItem(list: SyncItem[], trPath: string) {
  const tr = list.find((p) => p.lang === "tr" && p.path === trPath);
  const paths = new Set([trPath, ...Object.values(tr?.alternates ?? {})]);
  for (let i = list.length - 1; i >= 0; i--) if (paths.has(list[i].path) || list[i].alternates.tr === trPath) list.splice(i, 1);
}
export const removeProject = removeItem;

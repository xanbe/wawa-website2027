import type { MetadataRoute } from "next";
import { allPaths, canonicalOf, resolve } from "@/lib/routes";
import { getPost, getProject } from "@/lib/content";

const BASE = "https://wawainteriors.com";

// Tüm sayfalar tek site haritasında; sayfalı liste sayfaları (page/N) ve asıl sayfası başka adres olan takma adresler
// (ör. /service/ → /hizmetler/, /portfolio/ → /projelerimiz/) dışarıda bırakılır — haritada yalnız canonical adresler olur
export default function sitemap(): MetadataRoute.Sitemap {
  const isCanonical = (p: string) => {
    const r = resolve(p);
    return !r || canonicalOf(p, r) === p;
  };
  const paths = ["/", "/butce-planlama/", ...allPaths().filter((p) => !/\/page\/\d+\/$/.test(p) && isCanonical(p))];
  return paths.map((p) => {
    const post = getPost(p);
    const project = getProject(p);
    return {
      url: BASE + encodeURI(p),
      lastModified: post?.modified ?? post?.date ?? undefined,
      changeFrequency: post ? "monthly" : project ? "yearly" : "weekly",
      priority: p === "/" ? 1 : post || project ? 0.6 : 0.8,
    };
  });
}

import type { MetadataRoute } from "next";
import { allPaths } from "@/lib/routes";
import { getPost, getProject } from "@/lib/content";

const BASE = "https://wawainteriors.com";

// Tüm sayfalar tek site haritasında; sayfalı liste sayfaları (page/N) dışarıda bırakılır
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/butce-planlama/", ...allPaths().filter((p) => !/\/page\/\d+\/$/.test(p))];
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

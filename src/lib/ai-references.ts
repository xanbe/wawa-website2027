// Stüdyoda "projelerimizden ilham" olarak gösterilen WAWA projeleri.
// Aynı liste sunucuda referans görsel izni olarak da kullanılır (yalnızca bu görseller okunabilir).
import { isStandProject, projectsIn } from "./content";
import type { ReferenceProject } from "@/components/ai/studio-data";

const LIMIT = 9;

function pickProjects(stand: boolean): ReferenceProject[] {
  return projectsIn("tr")
    .filter((p) => p.featuredImage && isStandProject(p) === stand)
    .slice(0, LIMIT)
    .map((p) => ({ src: p.featuredImage!, title: p.title, path: p.path }));
}

export const AI_REFERENCES = { interior: pickProjects(false), stand: pickProjects(true) };
export const AI_REFERENCE_SET = new Set([...AI_REFERENCES.interior, ...AI_REFERENCES.stand].map((r) => r.src));

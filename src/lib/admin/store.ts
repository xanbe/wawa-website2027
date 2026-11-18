import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Panelin içerik deposu. İçerik sitenin kendi dosyalarıdır (src/content/*.json ve public/wp-content/uploads).
//  - Canlıda: GitHub deposuna kayıt (commit) atılır; Vercel siteyi yeniden derler, değişiklik birkaç dakikada yayına girer.
//    Gerekli ortam değişkenleri: GITHUB_TOKEN (depoya yazma izni), GITHUB_REPO ("sahip/depo"), GITHUB_BRANCH (varsayılan main)
//  - Geliştirmede (GITHUB_TOKEN yokken): dosyalar doğrudan diske yazılır.

const GH = { token: process.env.GITHUB_TOKEN, repo: process.env.GITHUB_REPO, branch: process.env.GITHUB_BRANCH || "main" };
export const storeMode = (): "github" | "local" | "off" => (GH.token && GH.repo ? "github" : process.env.NODE_ENV !== "production" ? "local" : "off");

export const PROJECTS_FILE = "src/content/projects.json";
export const POSTS_FILE = "src/content/posts.json";
const UPLOAD_RE = /^public\/wp-content\/uploads\/\d{4}\/\d{2}\/[a-z0-9][a-z0-9-]{0,80}\.(jpg|png|webp)$/;
const allowed = (p: string) => p === PROJECTS_FILE || p === POSTS_FILE || UPLOAD_RE.test(p);

async function gh<T>(url: string, init: RequestInit = {}, raw = false): Promise<T> {
  const res = await fetch(`https://api.github.com/repos/${GH.repo}${url}`, {
    ...init,
    headers: {
      authorization: `Bearer ${GH.token}`,
      accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(init.body ? { "content-type": "application/json" } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} ${url.split("?")[0]}`);
  return (raw ? await res.text() : await res.json()) as T;
}

export async function readText(file: string): Promise<string> {
  if (!allowed(file)) throw new Error("izin verilmeyen dosya");
  if (storeMode() === "github") return gh<string>(`/contents/${file}?ref=${encodeURIComponent(GH.branch)}`, {}, true);
  if (storeMode() === "local") return readFile(path.join(process.cwd(), file), "utf8");
  throw new Error("depo kapalı");
}

// Görsel yükleme: GitHub'da yalnızca içerik (blob) oluşturulur, kayıt (commit) sonradan içerikle birlikte atılır.
// Böylece on fotoğraflı bir proje on ayrı derleme başlatmaz.
export async function putBinary(file: string, base64: string): Promise<{ path: string; sha?: string }> {
  if (!UPLOAD_RE.test(file)) throw new Error("izin verilmeyen dosya");
  if (storeMode() === "github") {
    const blob = await gh<{ sha: string }>("/git/blobs", { method: "POST", body: JSON.stringify({ content: base64, encoding: "base64" }) });
    return { path: file, sha: blob.sha };
  }
  if (storeMode() === "local") {
    const full = path.join(process.cwd(), file);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, Buffer.from(base64, "base64"));
    return { path: file };
  }
  throw new Error("depo kapalı");
}

export type Change = { path: string; text?: string; sha?: string };

export async function commit(changes: Change[], message: string) {
  const files = changes.filter((c) => allowed(c.path) && (c.text !== undefined || c.sha));
  if (!files.length) return;
  if (storeMode() === "github") {
    const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${encodeURIComponent(GH.branch)}`);
    const head = await gh<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
    const tree = await gh<{ sha: string }>("/git/trees", {
      method: "POST",
      body: JSON.stringify({
        base_tree: head.tree.sha,
        tree: files.map((f) => ({ path: f.path, mode: "100644", type: "blob", ...(f.sha ? { sha: f.sha } : { content: f.text }) })),
      }),
    });
    const made = await gh<{ sha: string }>("/git/commits", { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }) });
    await gh(`/git/refs/heads/${encodeURIComponent(GH.branch)}`, { method: "PATCH", body: JSON.stringify({ sha: made.sha }) });
    return;
  }
  if (storeMode() === "local") {
    for (const f of files) if (f.text !== undefined) await writeFile(path.join(process.cwd(), f.path), f.text);
    return;
  }
  throw new Error("depo kapalı");
}

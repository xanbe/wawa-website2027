import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Panelin içerik deposu. İçerik sitenin kendi dosyalarıdır (src/content/*.json ve public/wp-content/uploads).
//  - Canlıda: GitHub deposuna kayıt (commit) atılır; Vercel siteyi yeniden derler, değişiklik birkaç dakikada yayına girer.
//    Gerekli ortam değişkenleri: GITHUB_TOKEN (depoya yazma izni), GITHUB_REPO ("sahip/depo"), GITHUB_BRANCH (varsayılan main)
//  - Geliştirmede (GITHUB_TOKEN yokken): dosyalar doğrudan diske yazılır; geçmiş ve geri alma yalnızca canlıda çalışır.
// Aynı depoya başka kayıtlar da gelir (ör. fuar rehberleri). Kayıt anında dal ilerlemişse işlem baştan okunup yeniden denenir;
// böylece kimsenin değişikliği ezilmez.

const GH = { token: process.env.GITHUB_TOKEN, repo: process.env.GITHUB_REPO, branch: process.env.GITHUB_BRANCH || "main" };
export const storeMode = (): "github" | "local" | "off" => (GH.token && GH.repo ? "github" : process.env.NODE_ENV !== "production" ? "local" : "off");

export const PROJECTS_FILE = "src/content/projects.json";
export const POSTS_FILE = "src/content/posts.json";
export const HOME_FILE = "src/content/home.json";
export const VIDEOS_FILE = "src/content/videos.json";
const DATA_FILES = [PROJECTS_FILE, POSTS_FILE, HOME_FILE, VIDEOS_FILE];
export const UPLOAD_RE = /^public\/wp-content\/uploads\/\d{4}\/\d{2}\/[a-z0-9][a-z0-9-]{0,80}\.(jpg|png|webp|svg)$/;
// Kütüphanede listelenen görsel klasörleri; silme yalnızca yükleme klasöründe yapılabilir
export const MEDIA_DIRS = ["public/wp-content/uploads/", "public/images/", "public/logos/"];
const MEDIA_RE = /\.(jpe?g|png|webp|svg|gif|avif)$/i;
const allowed = (p: string) => DATA_FILES.includes(p) || UPLOAD_RE.test(p);
// Eski WordPress yüklemeleri de silinebilir (yalnızca hiçbir içerikte kullanılmıyorsa; kontrol çağıranda)
const deletable = (p: string) => p.startsWith("public/wp-content/uploads/") && MEDIA_RE.test(p) && !p.includes("..");

class Conflict extends Error {}

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
  if (res.status === 422 && init.method === "PATCH") throw new Conflict("dal ilerledi");
  if (!res.ok) throw new Error(`GitHub ${res.status} ${url.split("?")[0]}`);
  return (raw ? await res.text() : await res.json()) as T;
}
const local = (p: string) => path.join(/* turbopackIgnore: true */ process.cwd(), p);
const headSha = async () => (await gh<{ object: { sha: string } }>(`/git/ref/heads/${encodeURIComponent(GH.branch)}`)).object.sha;

// Dosyanın belirli bir kayıttaki (yoksa dalın son hâlindeki) metni
export async function readText(file: string, ref?: string): Promise<string> {
  if (!allowed(file)) throw new Error("izin verilmeyen dosya");
  if (storeMode() === "github") return gh<string>(`/contents/${file}?ref=${encodeURIComponent(ref ?? GH.branch)}`, {}, true);
  if (storeMode() === "local") return readFile(local(file), "utf8");
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
    const full = local(file);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, Buffer.from(base64, "base64"));
    return { path: file };
  }
  throw new Error("depo kapalı");
}

// text: yeni içerik, sha: önceden yüklenmiş içerik (görsel), remove: dosyayı sil
export type Change = { path: string; text?: string; sha?: string; remove?: boolean };

async function writeCommit(changes: Change[], message: string, parent: string) {
  // Silinen eski bir yüklemeyi geri getirirken (sha ile) yükleme klasöründeki her görsel adına izin verilir
  const files = changes.filter((c) => (c.remove ? deletable(c.path) : (allowed(c.path) && (c.text !== undefined || c.sha)) || (Boolean(c.sha) && deletable(c.path))));
  if (!files.length) return;
  const head = await gh<{ tree: { sha: string } }>(`/git/commits/${parent}`);
  const tree = await gh<{ sha: string }>("/git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: head.tree.sha,
      tree: files.map((f) => ({ path: f.path, mode: "100644", type: "blob", ...(f.remove ? { sha: null } : f.sha ? { sha: f.sha } : { content: f.text }) })),
    }),
  });
  const made = await gh<{ sha: string }>("/git/commits", { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [parent] }) });
  // force: false — dal bu arada ilerlediyse GitHub reddeder (Conflict), işlem yeniden okunarak tekrarlanır
  await gh(`/git/refs/heads/${encodeURIComponent(GH.branch)}`, { method: "PATCH", body: JSON.stringify({ sha: made.sha, force: false }) });
}

async function writeLocal(changes: Change[]) {
  for (const f of changes) {
    if (f.remove && deletable(f.path)) await unlink(local(f.path)).catch(() => undefined);
    else if (allowed(f.path) && f.text !== undefined) await writeFile(local(f.path), f.text);
  }
}

// Okuyup değiştirip kaydetme: dosyalar tek bir kayıttan okunur, değişiklik o kaydın üstüne yazılır.
// Dal arada ilerlediyse (başka bir kayıt geldiyse) en fazla 3 kez baştan okunur.
export async function transact<R>(
  files: string[],
  build: (texts: Record<string, string>) => Promise<{ changes: Change[]; message: string; result: R }> | { changes: Change[]; message: string; result: R },
): Promise<R> {
  const mode = storeMode();
  if (mode === "off") throw new Error("depo kapalı");
  for (let attempt = 0; ; attempt++) {
    const parent = mode === "github" ? await headSha() : "";
    const texts: Record<string, string> = {};
    for (const f of files) texts[f] = await readText(f, parent || undefined);
    const { changes, message, result } = await build(texts);
    try {
      if (mode === "github") await writeCommit(changes, message, parent);
      else await writeLocal(changes);
      return result;
    } catch (e) {
      if (e instanceof Conflict && attempt < 2) continue;
      throw e;
    }
  }
}

// Tek seferlik kayıt (okuma gerektirmeyen değişiklikler için)
export const commit = (changes: Change[], message: string) => transact([], () => ({ changes, message, result: undefined }));

// ---------------------------------------------------------------- medya listesi
export type MediaFile = { path: string; size: number };
export async function listMedia(): Promise<MediaFile[]> {
  if (storeMode() === "github") {
    const t = await gh<{ tree: { path: string; type: string; size?: number }[] }>(`/git/trees/${encodeURIComponent(GH.branch)}?recursive=1`);
    return t.tree.filter((x) => x.type === "blob" && MEDIA_DIRS.some((d) => x.path.startsWith(d)) && MEDIA_RE.test(x.path)).map((x) => ({ path: x.path, size: x.size ?? 0 }));
  }
  if (storeMode() === "local") {
    const out: MediaFile[] = [];
    const walk = async (dir: string) => {
      for (const e of await readdir(local(dir), { withFileTypes: true }).catch(() => [])) {
        const p = `${dir}${e.name}`;
        if (e.isDirectory()) await walk(`${p}/`);
        else if (MEDIA_RE.test(e.name)) out.push({ path: p, size: (await stat(local(p))).size });
      }
    };
    for (const d of MEDIA_DIRS) await walk(d);
    return out;
  }
  throw new Error("depo kapalı");
}
export const canDelete = deletable;

// ---------------------------------------------------------------- geçmiş ve geri alma (yalnızca canlıda)
export const PANEL_PREFIX = "Panel:";
export type HistoryItem = { sha: string; message: string; date: string };
export async function history(): Promise<HistoryItem[]> {
  if (storeMode() !== "github") return [];
  const list = await gh<{ sha: string; commit: { message: string; committer: { date: string } } }[]>(`/commits?sha=${encodeURIComponent(GH.branch)}&per_page=100`);
  return list.filter((c) => c.commit.message.startsWith(PANEL_PREFIX)).map((c) => ({ sha: c.sha, message: c.commit.message.split("\n")[0], date: c.commit.committer.date }));
}

// Bir panel kaydını geri alır: değiştirdiği dosyalar kaydın öncesindeki hâline döner.
// Aynı dosya daha sonra yeniden değiştiyse geri alma reddedilir (sonraki değişiklik kaybolmasın).
export async function revert(sha: string): Promise<string> {
  if (storeMode() !== "github") throw new Error("Geri alma yalnızca canlı sitede çalışır.");
  const c = await gh<{ commit: { message: string }; parents: { sha: string }[]; files?: { filename: string; status: string }[] }>(`/commits/${sha}`);
  if (!c.commit.message.startsWith(PANEL_PREFIX)) throw new Error("Yalnızca panelden yapılan değişiklikler geri alınabilir.");
  const parent = c.parents[0]?.sha;
  const files = (c.files ?? []).filter((f) => allowed(f.filename) || deletable(f.filename));
  if (!parent || !files.length) throw new Error("Geri alınacak dosya yok.");
  for (const f of files) {
    const last = await gh<{ sha: string }[]>(`/commits?sha=${encodeURIComponent(GH.branch)}&path=${encodeURIComponent(f.filename)}&per_page=1`);
    if (last[0] && last[0].sha !== sha) throw new Error(`"${f.filename.split("/").pop()}" bu değişiklikten sonra yeniden düzenlenmiş; önce sonraki değişikliği geri alın.`);
  }
  const title = c.commit.message.split("\n")[0].replace(PANEL_PREFIX, "").trim();
  await transact([], async () => {
    const changes: Change[] = [];
    for (const f of files) {
      if (f.status === "added") changes.push({ path: f.filename, remove: true });
      else {
        // Önceki içerik (görsel ya da metin) blob kimliğiyle geri yazılır
        const prev = await gh<{ sha: string }>(`/contents/${f.filename}?ref=${parent}`);
        changes.push({ path: f.filename, sha: prev.sha });
      }
    }
    return { changes, message: `${PANEL_PREFIX} geri alındı (${title})`, result: undefined };
  });
  return title;
}

"use client";

// Yönetim paneli: solda bölümler (Gösterge, Projeler, Blog, Medya, Anasayfa, Geçmiş), sağda çalışma alanı.
// Kaydedilen her değişiklik sitenin içerik dosyalarına yazılır; canlıda site birkaç dakika içinde yeniden derlenir.
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, FileText, FolderKanban, History, Home, Image as ImageIcon, LayoutDashboard, Loader2, LogOut, Menu, X } from "lucide-react";
import { ERR, LINE, Label, Notice, PageHead, btnDark, call, input, toTop } from "./ui";
import { ProjectForm, ProjectList, type ProjectRow } from "./Projects";
import { PostForm, PostList, type PostRow } from "./Posts";
import { MediaPage } from "./Media";
import { HomeEditor } from "./HomeEditor";
import { HistoryPage } from "./History";

type Data = {
  mode: "github" | "local" | "off";
  translate: boolean;
  blob: boolean;
  categories: string[];
  projects: ProjectRow[];
  posts: PostRow[];
  checks: { untranslated: { path: string; title: string }[]; noAlt: number };
};
type View = "dashboard" | "projects" | "posts" | "media" | "home" | "history";

const NAV: [View, string, typeof LayoutDashboard][] = [
  ["dashboard", "Gösterge", LayoutDashboard],
  ["projects", "Projeler", FolderKanban],
  ["posts", "Blog", FileText],
  ["media", "Medya", ImageIcon],
  ["home", "Anasayfa", Home],
  ["history", "Geçmiş", History],
];

function Dashboard({ data, go, edit }: { data: Data; go: (v: View) => void; edit: (path: string) => void }) {
  const drafts = data.projects.filter((p) => p.draft).length + data.posts.filter((p) => p.draft).length;
  const setup: [boolean, string, string][] = [
    [data.mode === "github", "Canlı kayıt (GitHub)", data.mode === "github" ? "Değişiklikler GitHub'a kaydedilir, site birkaç dakikada güncellenir." : "Yerel mod: değişiklikler bu bilgisayardaki dosyalara yazılır (GITHUB_TOKEN ve GITHUB_REPO yok)."],
    [data.translate, "Otomatik çeviri", data.translate ? "İngilizce ve Almanca sürümler Türkçeden çevrilir." : "GEMINI_API_KEY tanımlı değil; diğer dillerde yalnızca görseller eşitlenir."],
    [data.blob, "MP4 video yükleme", data.blob ? "Kısa videolar Vercel Blob'a yüklenebilir." : "BLOB_READ_WRITE_TOKEN tanımlı değil; şimdilik YouTube bağlantıları kullanılabilir."],
  ];
  const cards: [string, number, View][] = [
    ["Proje", data.projects.length, "projects"],
    ["Blog yazısı", data.posts.length, "posts"],
    ["Taslak", drafts, "projects"],
    ["Dil sürümü eksik proje", data.checks.untranslated.length, "projects"],
  ];
  return (
    <div>
      <PageHead title="Gösterge" lead="Sitenin içerik durumu ve panel ayarları." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, n, v]) => (
          <button key={label} type="button" onClick={() => go(v)} className={`cursor-pointer border bg-white p-5 text-left hover:border-wawa-charcoal ${LINE}`}>
            <span className="block font-heading text-[32px] leading-none text-wawa-charcoal tabular-nums">{n}</span>
            <span className="mt-2 block text-[13px] text-wawa-charcoal/60">{label}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className={`border bg-white p-5 ${LINE}`}>
          <h2 className="text-[16px] font-medium text-wawa-charcoal">Kurulum</h2>
          <ul className="mt-3 grid gap-3">
            {setup.map(([ok, title, text]) => (
              <li key={title} className="flex gap-3">
                {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1F7A4D]" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />}
                <span>
                  <span className="block text-[14px] text-wawa-charcoal">{title}</span>
                  <span className="text-[13px] text-wawa-charcoal/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className={`border bg-white p-5 ${LINE}`}>
          <h2 className="text-[16px] font-medium text-wawa-charcoal">Kontrol edilecekler</h2>
          <ul className="mt-3 grid gap-2 text-[14px] text-wawa-charcoal">
            {data.checks.noAlt > 0 && <li>{data.checks.noAlt} projede görsel açıklaması (alt metin) eksik ya da dosya adı gibi duruyor.</li>}
            {data.checks.untranslated.length > 0 ? (
              <li>
                İngilizce ya da Almanca sürümü olmayan projeler:
                <ul className="mt-1 grid gap-1">
                  {data.checks.untranslated.slice(0, 8).map((p) => (
                    <li key={p.path}>
                      <button type="button" onClick={() => edit(p.path)} className="cursor-pointer text-left underline decoration-wawa-charcoal/30 underline-offset-4 hover:decoration-wawa-charcoal">
                        {p.title}
                      </button>
                    </li>
                  ))}
                </ul>
                <span className="mt-1 block text-[12px] text-wawa-charcoal/55">Projeyi açıp kaydetmeniz yeterli; eksik dil sürümü açılır.</span>
              </li>
            ) : (
              <li className="text-wawa-charcoal/60">Her projenin İngilizce ve Almanca sürümü var.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

export function AdminApp() {
  const [state, setState] = useState<"loading" | "off" | "login" | "ready">("loading");
  const [data, setData] = useState<Data | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [editProject, setEditProject] = useState<string | "new" | null>(null);
  const [editPost, setEditPost] = useState<string | "new" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [menu, setMenu] = useState(false);

  const refresh = useCallback(async () => {
    const j = (await fetch("/api/admin/", { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => ({ error: "Bağlantı kurulamadı." }))) as Partial<Data> & { enabled?: boolean; authed?: boolean; error?: string };
    if (j.error) return setError(j.error), setState((s) => (s === "loading" ? "login" : s));
    if (!j.enabled) return setState("off");
    if (!j.authed) return setState("login");
    setData(j as Data);
    setVersion((v) => v + 1);
    setState("ready");
  }, []);
  useEffect(() => {
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  const go = (v: View) => {
    setView(v);
    setEditProject(null);
    setEditPost(null);
    setNotice(null);
    setMenu(false);
    toTop();
  };
  const saved = async (msg: string) => {
    await refresh();
    setEditProject(null);
    setEditPost(null);
    setNotice(msg);
    toTop();
  };
  const live = data?.mode === "github" ? " Sitede görünmesi birkaç dakika sürer." : " (Yerel mod: dosyalara yazıldı.)";

  let body: ReactNode;
  if (state === "loading") body = <p className="flex items-center gap-3 text-[15px] text-wawa-charcoal/70"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</p>;
  else if (state === "off") body = <p className="max-w-[60ch] text-[15px] leading-relaxed text-wawa-charcoal/75">Panel kapalı. Açmak için sunucuda ADMIN_PASSWORD tanımlanmalı.</p>;
  else if (state === "login")
    body = (
      <form
        className="mx-auto mt-10 max-w-[380px]"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            await call({ op: "login", password });
            setPassword("");
            setState("loading");
            refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Giriş yapılamadı.");
          }
        }}
      >
        <PageHead title="Yönetim paneli" lead="Devam etmek için parolayı girin." />
        <Label text="Parola">
          <input type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        </Label>
        {error && <p role="alert" className={`mt-3 ${ERR}`}>{error}</p>}
        <button type="submit" className={`${btnDark} mt-5 w-full`}>Giriş yap</button>
      </form>
    );
  else if (data) {
    let page: ReactNode;
    if (view === "projects" && editProject) page = <ProjectForm key={editProject} path={editProject === "new" ? null : editProject} categories={data.categories} canTranslate={data.translate} onClose={() => setEditProject(null)} onSaved={saved} />;
    else if (view === "posts" && editPost) page = <PostForm key={editPost} path={editPost === "new" ? null : editPost} canTranslate={data.translate} onClose={() => setEditPost(null)} onSaved={saved} />;
    else if (view === "projects") page = <ProjectList key={version} rows={data.projects} categories={data.categories} onEdit={setEditProject} onSaved={saved} />;
    else if (view === "posts") page = <PostList rows={data.posts} onEdit={setEditPost} />;
    else if (view === "media") page = <MediaPage blobEnabled={data.blob} />;
    else if (view === "home") page = <HomeEditor />;
    else if (view === "history") page = <HistoryPage />;
    else
      page = (
        <Dashboard
          data={data}
          go={go}
          edit={(p) => {
            go("projects");
            setEditProject(p);
          }}
        />
      );
    body = (
      <>
        {notice && <Notice text={notice + live} onClose={() => setNotice(null)} />}
        {page}
      </>
    );
  }

  const ready = state === "ready" && data;
  return (
    // Panel sitenin üst menüsünü ve alt bilgisini örter: tam ekran, kendi başlığıyla
    <div id="admin-scroll" className="fixed inset-0 z-[200] overflow-y-auto bg-[#FAFAF8]">
      <header className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 ${LINE}`}>
        <span className="flex items-center gap-3">
          {ready && (
            <button type="button" aria-label="Menü" onClick={() => setMenu((m) => !m)} className="grid h-10 w-10 cursor-pointer place-items-center lg:hidden">
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          <span className="font-heading text-[18px] text-wawa-charcoal">WAWA · Panel</span>
          {ready && <span className={`hidden px-2 py-0.5 text-[11px] sm:inline ${data.mode === "github" ? "bg-[#E7F5EC] text-[#1F7A4D]" : "bg-[#FFF4E5] text-[#B54708]"}`}>{data.mode === "github" ? "Canlı" : "Yerel"}</span>}
        </span>
        <span className="flex items-center gap-1">
          <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 px-3 text-[14px] text-wawa-charcoal hover:underline">
            <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">Siteyi aç</span>
          </Link>
          {state === "ready" && (
            <button
              type="button"
              onClick={async () => {
                await call({ op: "logout" }).catch(() => null);
                setData(null);
                setState("login");
              }}
              className="inline-flex h-10 cursor-pointer items-center gap-2 px-3 text-[14px] text-wawa-charcoal hover:underline"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Çıkış</span>
            </button>
          )}
        </span>
      </header>
      <div className="flex">
        {ready && (
          <nav className={`${menu ? "block" : "hidden"} fixed inset-x-0 top-16 bottom-0 z-20 border-r bg-white p-3 lg:sticky lg:block lg:h-[calc(100vh-4rem)] lg:w-60 lg:shrink-0 ${LINE}`}>
            <ul className="grid gap-1">
              {NAV.map(([v, label, Icon]) => (
                <li key={v}>
                  <button type="button" onClick={() => go(v)} className={`flex h-11 w-full cursor-pointer items-center gap-3 px-3 text-left text-[14px] ${view === v ? "bg-wawa-charcoal text-white" : "text-wawa-charcoal hover:bg-[#F3F2EF]"}`}>
                    <Icon className="h-4 w-4" /> {label}
                    {v === "projects" && <span className={`ml-auto text-[12px] tabular-nums ${view === v ? "text-white/60" : "text-wawa-charcoal/45"}`}>{data.projects.length}</span>}
                    {v === "posts" && <span className={`ml-auto text-[12px] tabular-nums ${view === v ? "text-white/60" : "text-wawa-charcoal/45"}`}>{data.posts.length}</span>}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-6 px-3 text-[12px] leading-relaxed text-wawa-charcoal/50">Hizmet sayfaları, fiyatlar, fuarlar, talepler ve site ayarları sonraki aşamada eklenecek.</p>
          </nav>
        )}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto w-full max-w-[1200px]">{body}</div>
        </main>
      </div>
    </div>
  );
}

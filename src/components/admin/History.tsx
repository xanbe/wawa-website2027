"use client";

// Geçmiş: panelden yapılan son değişiklikler ve tek tıkla geri alma (yalnızca canlıda; yerelde dosyalar git ile izlenir).
import { useEffect, useState } from "react";
import { Loader2, Undo2 } from "lucide-react";
import { ERR, LINE, Notice, PageHead, call, errText, get } from "./ui";

type Item = { sha: string; message: string; date: string };

export function HistoryPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [mode, setMode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const load = () =>
    get<{ items: Item[]; mode: string }>("history=1")
      .then((r) => {
        setItems(r.items);
        setMode(r.mode);
      })
      .catch((e) => setError(errText(e)));
  useEffect(() => {
    load();
  }, []);
  const undo = async (it: Item) => {
    if (!window.confirm(`"${it.message.replace(/^Panel:\s*/, "")}" geri alınsın mı? Değişen dosyalar bu kayıttan önceki hâline döner.`)) return;
    setBusy(it.sha);
    setError(null);
    try {
      const r = await call<{ title: string }>({ op: "revert", sha: it.sha });
      setMsg(`Geri alındı: ${r.title}. Sitede birkaç dakika içinde güncellenir.`);
      await load();
    } catch (e) {
      setError(errText(e));
    }
    setBusy(null);
  };
  return (
    <div>
      <PageHead title="Geçmiş" lead="Panelden yapılan son 100 kayıttaki değişiklikler. Bir değişikliği geri almak, o kayıtta değişen dosyaları önceki hâline döndürür." />
      {msg && <Notice text={msg} onClose={() => setMsg(null)} />}
      {error && <p role="alert" className={`mb-4 ${ERR}`}>{error}</p>}
      {!items && !error && <p className="flex items-center gap-2 text-[14px] text-wawa-charcoal/60"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</p>}
      {items && mode !== "github" && <p className="bg-[#F7F6F3] px-4 py-3 text-[14px] text-wawa-charcoal/75">Geçmiş ve geri alma canlı sitede (GitHub bağlıyken) çalışır. Yerel denemede değişiklikler doğrudan dosyalara yazılır.</p>}
      {items && mode === "github" && !items.length && <p className="text-[14px] text-wawa-charcoal/60">Henüz panelden yapılmış bir değişiklik yok.</p>}
      <ul className={`border-t ${LINE}`}>
        {items?.map((it, i) => (
          <li key={it.sha} className={`flex flex-wrap items-center justify-between gap-3 border-b py-3 ${LINE}`}>
            <span className="min-w-0">
              <span className="block text-[15px] text-wawa-charcoal">{it.message.replace(/^Panel:\s*/, "")}</span>
              <span className="text-[12px] text-wawa-charcoal/50">
                {new Date(it.date).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                {i === 0 && " · en son"}
              </span>
            </span>
            {!/geri alındı/.test(it.message) && (
              <button type="button" disabled={busy !== null} onClick={() => undo(it)} className="inline-flex h-9 cursor-pointer items-center gap-2 border border-wawa-charcoal/20 px-3 text-[13px] text-wawa-charcoal hover:border-wawa-charcoal disabled:opacity-50">
                {busy === it.sha ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />} Geri al
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

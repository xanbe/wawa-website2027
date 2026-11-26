"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { useTurnstile } from "@/components/ui/useTurnstile";

const TEXT = {
  tr: {
    name: "Ad soyad",
    company: "Firma",
    email: "E-posta",
    phone: "Telefon",
    service: "Hizmet",
    area: "Alan (m²)",
    location: "Proje konumu",
    date: "Teslim / fuar tarihi",
    message: "Projenizden kısaca bahsedin",
    send: "Gönder",
    sending: "Gönderiliyor",
    done: "Mesajınız ulaştı, en kısa sürede size dönüyoruz.",
    error: "Gönderilemedi. Lütfen bilgileri kontrol edin ya da bizi arayın.",
    tooMany: "Çok fazla deneme yapıldı, biraz sonra yeniden deneyin.",
    kvkk: "Bilgilerinizi yalnızca talebinizle ilgili sizinle iletişime geçmek için kullanırız.",
    kvkkLink: "Aydınlatma metni",
    services: ["İç mimarlık", "Fuar standı", "İnşaat taahhüt", "Mobilya üretim"],
    pick: "Seçin",
  },
  en: {
    name: "Full name",
    company: "Company",
    email: "E-mail",
    phone: "Phone",
    service: "Service",
    area: "Area (m²)",
    location: "Project location",
    date: "Delivery / fair date",
    message: "Tell us briefly about your project",
    send: "Send",
    sending: "Sending",
    done: "Your message has arrived, we will get back to you shortly.",
    error: "Could not be sent. Please check the details or call us.",
    tooMany: "Too many attempts, please try again later.",
    kvkk: "We only use your details to contact you about your request.",
    kvkkLink: "Privacy policy",
    services: ["Interior architecture", "Exhibition stand", "Construction", "Furniture production"],
    pick: "Select",
  },
  de: {
    name: "Vor- und Nachname",
    company: "Firma",
    email: "E-Mail",
    phone: "Telefon",
    service: "Leistung",
    area: "Fläche (m²)",
    location: "Projektort",
    date: "Liefer- / Messetermin",
    message: "Beschreiben Sie Ihr Projekt kurz",
    send: "Senden",
    sending: "Wird gesendet",
    done: "Ihre Nachricht ist angekommen, wir melden uns zeitnah.",
    error: "Senden fehlgeschlagen. Bitte prüfen Sie die Angaben oder rufen Sie uns an.",
    tooMany: "Zu viele Versuche, bitte später erneut versuchen.",
    kvkk: "Wir verwenden Ihre Angaben nur, um Sie zu Ihrer Anfrage zu kontaktieren.",
    kvkkLink: "Datenschutz",
    services: ["Innenarchitektur", "Messestand", "Bauausführung", "Möbelproduktion"],
    pick: "Auswählen",
  },
  it: {
    name: "Nome e cognome",
    company: "Azienda",
    email: "E-mail",
    phone: "Telefono",
    service: "Servizio",
    area: "Superficie (m²)",
    location: "Luogo del progetto",
    date: "Data di consegna / fiera",
    message: "Raccontaci brevemente il tuo progetto",
    send: "Invia",
    sending: "Invio in corso",
    done: "Il tuo messaggio è arrivato, ti risponderemo a breve.",
    error: "Invio non riuscito. Controlla i dati o chiamaci.",
    tooMany: "Troppi tentativi, riprova più tardi.",
    kvkk: "Usiamo i tuoi dati solo per contattarti in merito alla tua richiesta.",
    kvkkLink: "Privacy",
    services: ["Architettura d'interni", "Stand fieristico", "Costruzione", "Produzione di arredi"],
    pick: "Seleziona",
  },
  fr: {
    name: "Nom et prénom",
    company: "Entreprise",
    email: "E-mail",
    phone: "Téléphone",
    service: "Service",
    area: "Surface (m²)",
    location: "Lieu du projet",
    date: "Date de livraison / salon",
    message: "Décrivez brièvement votre projet",
    send: "Envoyer",
    sending: "Envoi en cours",
    done: "Votre message est bien arrivé, nous vous répondrons rapidement.",
    error: "Envoi impossible. Vérifiez vos informations ou appelez-nous.",
    tooMany: "Trop de tentatives, veuillez réessayer plus tard.",
    kvkk: "Nous utilisons vos données uniquement pour vous contacter au sujet de votre demande.",
    kvkkLink: "Confidentialité",
    services: ["Architecture intérieure", "Stand d'exposition", "Construction", "Fabrication de mobilier"],
    pick: "Choisir",
  },
};

// Aydınlatma/gizlilik metni adresleri (src/content/legal.ts ile aynı)
const LEGAL: Record<Lang, string> = { tr: "/kvkk-aydinlatma-metni/", en: "/en/privacy-policy/", de: "/de/datenschutz/", it: "/en/privacy-policy/", fr: "/en/privacy-policy/" };

// Açık zeminde kutulu alanlar; koyu zeminde (hizmet sayfası teklif bölümü) alt çizgili alanlar
const STYLES = {
  light: {
    input: "h-12 w-full min-w-0 border border-wawa-charcoal/15 bg-white px-4 text-[16px] text-wawa-charcoal placeholder:text-wawa-charcoal/40 focus:border-wawa-charcoal focus:outline-none",
    area: "w-full border border-wawa-charcoal/15 bg-white px-4 py-3 text-[16px] text-wawa-charcoal focus:border-wawa-charcoal focus:outline-none",
    label: "block text-[13px] text-wawa-charcoal/60",
    note: "text-[13px] text-wawa-charcoal/60",
    link: "underline underline-offset-2 hover:text-wawa-charcoal",
    button: "bg-wawa-charcoal text-white hover:bg-black",
    arrow: "text-wawa-accent",
    done: "text-wawa-charcoal",
  },
  dark: {
    input: "h-11 w-full min-w-0 border-0 border-b border-white/25 bg-transparent px-0 text-[16px] text-white placeholder:text-white/35 focus:border-wawa-accent focus:outline-none [&>option]:text-wawa-charcoal",
    area: "w-full border-0 border-b border-white/25 bg-transparent px-0 py-2 text-[16px] text-white focus:border-wawa-accent focus:outline-none",
    label: "block text-[12px] tracking-[0.08em] text-white/55 uppercase",
    note: "text-[13px] text-white/55",
    link: "underline underline-offset-2 hover:text-white",
    button: "bg-wawa-accent text-wawa-charcoal hover:bg-white",
    arrow: "text-wawa-charcoal",
    done: "text-white",
  },
};

export function ContactForm({ lang, kind, tone = "light" }: { lang: Lang; kind: "contact" | "offer"; tone?: "light" | "dark" }) {
  const T = TEXT[lang];
  const S = STYLES[tone];
  const { input, label } = S;
  const [state, setState] = useState<"idle" | "busy" | "done" | "error" | "tooMany">("idle");
  const { ref: humanRef, getToken: humanToken } = useTurnstile(lang);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState("busy");
    const turnstile = await humanToken();
    const res = await fetch("/api/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // notice: aydınlatma metni formun altında gösterildi
      body: JSON.stringify({ ...data, kind, lang, notice: true, turnstile }),
    }).catch(() => null);
    setState(res?.ok ? "done" : res?.status === 429 ? "tooMany" : "error");
  };

  if (state === "done") {
    return (
      <p className={`flex items-center gap-3 text-lg ${S.done}`}>
        <span className="grid h-10 w-10 place-items-center bg-wawa-accent">
          <Check className="h-5 w-5" aria-hidden />
        </span>
        {T.done}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      {/* Bot tuzağı: görünmez alan */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="sm:col-span-1">
        <span className={label}>{T.name} *</span>
        <input name="name" required maxLength={120} autoComplete="name" className={`mt-2 ${input}`} />
      </label>
      <label>
        <span className={label}>{T.company}</span>
        <input name="company" maxLength={160} autoComplete="organization" className={`mt-2 ${input}`} />
      </label>
      <label>
        <span className={label}>{T.phone} *</span>
        <input name="phone" type="tel" inputMode="tel" required maxLength={30} autoComplete="tel" className={`mt-2 ${input}`} />
      </label>
      <label>
        <span className={label}>{T.email}</span>
        <input name="email" type="email" maxLength={160} autoComplete="email" className={`mt-2 ${input}`} />
      </label>
      {kind === "offer" && (
        <>
          <label>
            <span className={label}>{T.service}</span>
            <select name="service" defaultValue="" className={`mt-2 ${input}`}>
              <option value="">{T.pick}</option>
              {T.services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={label}>{T.area}</span>
            <input name="area" inputMode="decimal" maxLength={20} className={`mt-2 ${input}`} />
          </label>
          <label>
            <span className={label}>{T.location}</span>
            <input name="location" maxLength={120} className={`mt-2 ${input}`} />
          </label>
          <label>
            <span className={label}>{T.date}</span>
            <input name="date" maxLength={40} className={`mt-2 ${input}`} />
          </label>
        </>
      )}
      <label className="sm:col-span-2">
        <span className={label}>{T.message} *</span>
        <textarea
          name="message"
          required
          maxLength={3000}
          rows={5}
          className={`mt-2 ${S.area}`}
        />
      </label>
      <div ref={humanRef} className="empty:hidden sm:col-span-2" />
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={S.note}>
          {T.kvkk}{" "}
          <Link href={LEGAL[lang]} className={S.link}>
            {T.kvkkLink}
          </Link>
        </p>
        <button
          type="submit"
          disabled={state === "busy"}
          className={`group inline-flex h-12 shrink-0 cursor-pointer items-center justify-between gap-6 px-7 text-[15px] transition-colors disabled:opacity-60 ${S.button}`}
        >
          {state === "busy" ? T.sending : T.send}
          <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${S.arrow}`} />
        </button>
      </div>
      {(state === "error" || state === "tooMany") && (
        <p role="alert" className="text-[15px] text-[#B42318] sm:col-span-2">
          {state === "tooMany" ? T.tooMany : T.error}
        </p>
      )}
    </form>
  );
}

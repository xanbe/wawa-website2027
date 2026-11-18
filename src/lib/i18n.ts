// Site dilleri ve dile göre sabit adresler / arayüz metinleri.
// Adresler eski WordPress sitesindekilerle birebir aynıdır (SEO için değiştirilmez).

export const LANGS = ["tr", "en", "de", "it", "fr"] as const;
export type Lang = (typeof LANGS)[number];

export function langFromPath(path: string): Lang {
  for (const l of ["en", "de", "it", "fr"] as const) if (path === `/${l}` || path.startsWith(`/${l}/`)) return l;
  return "tr";
}

// IT ve FR'de proje, hizmet ve blog içeriği yok; bu dillerde İngilizce içerik gösterilir
export const contentLang = (lang: Lang): "tr" | "en" | "de" => (lang === "it" || lang === "fr" ? "en" : lang);

// Her dilde sabit sayfaların adresi
export const ROUTES: Record<Lang, {
  home: string;
  about: string;
  services: string;
  projects: string;
  blog: string;
  contact: string;
  offer: string;
  budget: string;
}> = {
  tr: {
    home: "/",
    about: "/hakkimizda/",
    services: "/hizmetler/",
    projects: "/projelerimiz/",
    blog: "/blog/",
    contact: "/iletisim/",
    offer: "/teklif-al/",
    budget: "/butce-planlama/",
  },
  en: {
    home: "/en/",
    about: "/en/about-us/",
    services: "/en/what-are-we-doing/",
    projects: "/en/our-projects/",
    blog: "/en/blog-2/",
    contact: "/en/contact/",
    offer: "/en/get-offer/",
    budget: "/butce-planlama/",
  },
  de: {
    home: "/de/",
    about: "/de/ueber-uns/",
    services: "/de/was-tun-wir/",
    projects: "/de/unsere-projekte/",
    blog: "/de/blog-3/",
    contact: "/de/kontakt/",
    offer: "/de/angebot-erhalten/",
    budget: "/butce-planlama/",
  },
  it: {
    home: "/it/",
    about: "/it/chi-siamo/",
    services: "/it/cosa-facciamo/",
    projects: "/it/progetti/",
    blog: "/en/blog-2/",
    contact: "/it/contatti/",
    offer: "/it/richiedi-preventivo/",
    budget: "/butce-planlama/",
  },
  fr: {
    home: "/fr/",
    about: "/fr/a-propos/",
    services: "/fr/nos-services/",
    projects: "/fr/nos-projets/",
    blog: "/en/blog-2/",
    contact: "/fr/contact/",
    offer: "/fr/demande-de-devis/",
    budget: "/butce-planlama/",
  },
};

// Arayüz metinleri (içerik değil); her dilde aynı anahtarlar
const DICT = {
  tr: {
    nav: { home: "Anasayfa", about: "Hakkımızda", services: "Neler Yapıyoruz?", projects: "Projelerimiz", blog: "Blog", contact: "İletişim" },
    cta: { start: "Proje Başlat", talk: "Projenizi konuşalım", offer: "Teklif alın", allProjects: "Tüm projeler", readMore: "Devamını okuyun", back: "Geri" },
    labels: {
      brand: "Marka",
      service: "Hizmet",
      category: "Kategori",
      location: "Konum",
      all: "Tümü",
      relatedProjects: "Benzer projeler",
      latestPosts: "Son yazılar",
      faq: "Sık sorulan sorular",
      gallery: "Proje görselleri",
      page: "Sayfa",
      prev: "Önceki",
      next: "Sonraki",
      services: "Hizmetler",
      company: "Şirket",
      follow: "Takip edin",
      contact: "İletişim",
      phone: "Telefon",
      email: "E-posta",
      address: "Adres",
      privacy: "Gizlilik",
      cookies: "Çerez Politikası",
      published: "Yayın",
      minRead: "dk okuma",
    },
    footer: { headline: "Projenizi birlikte şekillendirelim." },
  },
  en: {
    nav: { home: "Home", about: "About Us", services: "What We Do", projects: "Our Projects", blog: "Blog", contact: "Contact" },
    cta: { start: "Start a Project", talk: "Let's talk about your project", offer: "Get an offer", allProjects: "All projects", readMore: "Read more", back: "Back" },
    labels: {
      brand: "Brand",
      service: "Service",
      category: "Category",
      location: "Location",
      all: "All",
      relatedProjects: "Related projects",
      latestPosts: "Latest posts",
      faq: "Frequently asked questions",
      gallery: "Project images",
      page: "Page",
      prev: "Previous",
      next: "Next",
      services: "Services",
      company: "Company",
      follow: "Follow us",
      contact: "Contact",
      phone: "Phone",
      email: "E-mail",
      address: "Address",
      privacy: "Privacy",
      cookies: "Cookie Policy",
      published: "Published",
      minRead: "min read",
    },
    footer: { headline: "Let's shape your project together." },
  },
  de: {
    nav: { home: "Startseite", about: "Über uns", services: "Was wir tun", projects: "Unsere Projekte", blog: "Blog", contact: "Kontakt" },
    cta: { start: "Projekt starten", talk: "Sprechen wir über Ihr Projekt", offer: "Angebot erhalten", allProjects: "Alle Projekte", readMore: "Weiterlesen", back: "Zurück" },
    labels: {
      brand: "Marke",
      service: "Leistung",
      category: "Kategorie",
      location: "Ort",
      all: "Alle",
      relatedProjects: "Ähnliche Projekte",
      latestPosts: "Neueste Beiträge",
      faq: "Häufige Fragen",
      gallery: "Projektbilder",
      page: "Seite",
      prev: "Zurück",
      next: "Weiter",
      services: "Leistungen",
      company: "Unternehmen",
      follow: "Folgen Sie uns",
      contact: "Kontakt",
      phone: "Telefon",
      email: "E-Mail",
      address: "Adresse",
      privacy: "Datenschutz",
      cookies: "Cookie-Richtlinie",
      published: "Veröffentlicht",
      minRead: "Min. Lesezeit",
    },
    footer: { headline: "Gestalten wir Ihr Projekt gemeinsam." },
  },
  it: {
    nav: { home: "Home", about: "Chi siamo", services: "Cosa facciamo", projects: "Progetti", blog: "Blog", contact: "Contatti" },
    cta: { start: "Inizia un progetto", talk: "Parliamo del tuo progetto", offer: "Richiedi un preventivo", allProjects: "Tutti i progetti", readMore: "Leggi di più", back: "Indietro" },
    labels: {
      brand: "Marchio",
      service: "Servizio",
      category: "Categoria",
      location: "Luogo",
      all: "Tutti",
      relatedProjects: "Progetti simili",
      latestPosts: "Ultimi articoli",
      faq: "Domande frequenti",
      gallery: "Immagini del progetto",
      page: "Pagina",
      prev: "Precedente",
      next: "Successiva",
      services: "Servizi",
      company: "Azienda",
      follow: "Seguici",
      contact: "Contatti",
      phone: "Telefono",
      email: "E-mail",
      address: "Indirizzo",
      privacy: "Privacy",
      cookies: "Cookie",
      published: "Pubblicato",
      minRead: "min di lettura",
    },
    footer: { headline: "Diamo forma insieme al tuo progetto." },
  },
  fr: {
    nav: { home: "Accueil", about: "À propos", services: "Nos services", projects: "Nos projets", blog: "Blog", contact: "Contact" },
    cta: { start: "Démarrer un projet", talk: "Parlons de votre projet", offer: "Demander un devis", allProjects: "Tous les projets", readMore: "Lire la suite", back: "Retour" },
    labels: {
      brand: "Marque",
      service: "Service",
      category: "Catégorie",
      location: "Lieu",
      all: "Tous",
      relatedProjects: "Projets similaires",
      latestPosts: "Derniers articles",
      faq: "Questions fréquentes",
      gallery: "Images du projet",
      page: "Page",
      prev: "Précédente",
      next: "Suivante",
      services: "Services",
      company: "Entreprise",
      follow: "Suivez-nous",
      contact: "Contact",
      phone: "Téléphone",
      email: "E-mail",
      address: "Adresse",
      privacy: "Confidentialité",
      cookies: "Cookies",
      published: "Publié",
      minRead: "min de lecture",
    },
    footer: { headline: "Façonnons votre projet ensemble." },
  },
} as const;

export type Dict = (typeof DICT)["tr"];

export function t(lang: Lang): Dict {
  return DICT[lang] as unknown as Dict;
}

export const OG_LOCALE: Record<Lang, string> = { tr: "tr_TR", en: "en_US", de: "de_DE", it: "it_IT", fr: "fr_FR" };

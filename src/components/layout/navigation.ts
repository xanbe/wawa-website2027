import { ROUTES, type Lang } from "@/lib/i18n";

export interface NavLink {
  name: string;
  href: string;
  isNew?: boolean;
}

export interface ServiceGroup {
  number: string;
  title: string;
  description: string;
  href: string;
  items: NavLink[];
}

// Menü her dilde aynı yapıda; adresler eski sitedeki gerçek sayfalardır (SEO için değişmez)
type Nav = {
  main: NavLink[];
  servicesLabel: string;
  serviceGroups: ServiceGroup[];
  singleServices: Omit<ServiceGroup, "items">[];
  menuInvite: { signature: string[]; text: string; cta: string; href: string };
  start: string;
  ai: { label: string; short: string; href: string };
  strip: string;
  allProjects: string;
  menu: string;
};

// Alt hizmetler (yalnız TR sektör sayfaları): üst hizmet → alt sayfalar. Hizmet sayfalarındaki "Proje türleri" vitrininde
// üst hizmetin hemen altında listelenir; alt sayfanın üst bağlantısı (breadcrumb) üst hizmettir. Böylece sektör sayfaları sitede yetim kalmaz.
export const SUB_SERVICES: Record<string, { name: string; href: string }[]> = {
  "/service/magaza-tasarimi/": [
    { name: "Kuyumcu İç Mimarisi", href: "/kuyumcu-ic-mimari/" },
    { name: "Eczane İç Mimarisi", href: "/eczane-ic-mimari/" },
    { name: "Showroom İç Mimarisi", href: "/showroom-ic-mimari/" },
  ],
  "/service/klinik-tasarimi/": [
    { name: "Diş Kliniği Tasarımı", href: "/dis-klinigi-ic-mimari/" },
    { name: "Güzellik Salonu İç Mimarisi", href: "/guzellik-salonu-ic-mimari/" },
  ],
};
export const parentService = (lang: Lang, path: string) => {
  const parent = Object.entries(SUB_SERVICES).find(([, subs]) => subs.some((s) => s.href === path))?.[0];
  return parent ? NAV[lang].serviceGroups.flatMap((g) => g.items).find((i) => i.href === parent) : undefined;
};

export const NAV: Record<Lang, Nav> = {
  tr: {
    main: [
      { name: "Anasayfa", href: ROUTES.tr.home },
      { name: "Hakkımızda", href: ROUTES.tr.about },
      { name: "Projelerimiz", href: ROUTES.tr.projects },
      { name: "Blog", href: ROUTES.tr.blog },
      { name: "İletişim", href: ROUTES.tr.contact },
    ],
    servicesLabel: "Neler Yapıyoruz?",
    serviceGroups: [
      {
        number: "01",
        title: "İç Mimarlık",
        description: "Konuttan ticari alana, anahtar teslim iç mimari.",
        href: ROUTES.tr.services,
        items: [
          { name: "Konut & Villa Tasarımı", href: "/konut-villa-tasarim/" },
          { name: "Mağaza Tasarımı", href: "/service/magaza-tasarimi/" },
          { name: "Klinik Tasarımı", href: "/service/klinik-tasarimi/" },
          { name: "Cafe & Restoran Tasarımı", href: "/cafe-dekorasyon/" },
          { name: "Ofis Tasarımı", href: "/ofis-tasarimi-ve-uygulama/" },
        ],
      },
      {
        number: "02",
        title: "Fuar Standı",
        description: "Tasarımdan kuruluma, dünya genelinde fuar standı.",
        href: "/fuar-standi/",
        items: [
          { name: "Fuar Standı", href: "/fuar-standi/" },
          { name: "Kongre Standı", href: "/service/kongre-stand-tasarimi/" },
          { name: "Maxima Stand", href: "/maxima-stand/" },
          { name: "Plus Stand", href: "/plus-stand/" },
          { name: "AVM Standı", href: "/avm-standi/" },
        ],
      },
    ],
    singleServices: [
      { number: "03", title: "İnşaat Taahhüt", description: "Projelerin inşaat ve uygulama taahhüdü.", href: "/insaat-taahhut/" },
      { number: "04", title: "Mobilya Üretim", description: "Projeye özel mobilya tasarımı ve imalatı.", href: "/mobilya-uretim/" },
    ],
    menuInvite: { signature: ["Size ait", "bir imza."], text: "Birlikte yeni bir projeye başlayalım.", cta: "Projenizi konuşalım", href: ROUTES.tr.contact },
    start: "Proje Başlat",
    ai: { label: "Yapay Zeka ile Tasarla", short: "Yapay Zeka", href: "/yapay-zeka/" },
    strip: "Tasarım, üretim, lojistik ve kurulum — anahtar teslim.",
    allProjects: "Tüm projelerimiz",
    menu: "Menüyü aç",
  },
  en: {
    main: [
      { name: "Home", href: ROUTES.en.home },
      { name: "About Us", href: ROUTES.en.about },
      { name: "Our Projects", href: ROUTES.en.projects },
      { name: "Blog", href: ROUTES.en.blog },
      { name: "Contact", href: ROUTES.en.contact },
    ],
    servicesLabel: "What We Do",
    serviceGroups: [
      {
        number: "01",
        title: "Interior Architecture",
        description: "Turnkey interiors, from homes to commercial spaces.",
        href: ROUTES.en.services,
        items: [
          { name: "Residential & Villa Design", href: "/en/service/housing-villa-design/" },
          { name: "Store Design", href: "/en/service/store-design-and-implementation/" },
          { name: "Clinic Design", href: "/en/service/clinic-design-and-implementation/" },
          { name: "Cafe & Restaurant Design", href: "/en/service/cafe-restaurant-design-and-implementation/" },
          { name: "Office Design", href: "/en/service/office-design-and-implementation/" },
        ],
      },
      {
        number: "02",
        title: "Exhibition Stands",
        description: "Exhibition stands worldwide, from design to installation.",
        href: "/en/service/expo-design/",
        items: [
          { name: "Exhibition Stand", href: "/en/service/expo-design/" },
          { name: "Congress Stand", href: "/en/service/congress-stand-design/" },
          { name: "Maxima Stand", href: "/en/service/maxima-stand/" },
        ],
      },
    ],
    singleServices: [
      { number: "03", title: "Construction", description: "Construction and implementation of our projects.", href: "/en/construction-contracting/" },
      { number: "04", title: "Furniture Production", description: "Custom furniture design and manufacturing.", href: "/en/furniture-production/" },
    ],
    menuInvite: { signature: ["A signature", "of your own."], text: "Let's start a new project together.", cta: "Let's talk", href: ROUTES.en.contact },
    start: "Start a Project",
    ai: { label: "Design with AI", short: "AI Design", href: "/en/design-with-ai/" },
    strip: "Design, production, logistics and installation — turnkey.",
    allProjects: "All our projects",
    menu: "Open menu",
  },
  de: {
    main: [
      { name: "Startseite", href: ROUTES.de.home },
      { name: "Über uns", href: ROUTES.de.about },
      { name: "Unsere Projekte", href: ROUTES.de.projects },
      { name: "Blog", href: ROUTES.de.blog },
      { name: "Kontakt", href: ROUTES.de.contact },
    ],
    servicesLabel: "Was wir tun",
    serviceGroups: [
      {
        number: "01",
        title: "Innenarchitektur",
        description: "Schlüsselfertige Innenräume, vom Wohnen bis zum Gewerbe.",
        href: ROUTES.de.services,
        items: [
          { name: "Wohnungs- & Villendesign", href: "/de/service/wohnungs-villendesign/" },
          { name: "Ladendesign", href: "/de/service/laden-design-und-umsetzungen/" },
          { name: "Klinikdesign", href: "/de/service/klinikdesign-und-umsetzungen/" },
          { name: "Café- & Restaurantdesign", href: "/de/service/cafe-restaurantdesign-und-umsetzungen/" },
          { name: "Bürodesign", href: "/de/service/buerodesign-und-umsetzung/" },
        ],
      },
      {
        number: "02",
        title: "Messestände",
        description: "Messestände weltweit, von der Planung bis zum Aufbau.",
        href: "/de/service/messe-stand/",
        items: [
          { name: "Messestand", href: "/de/service/messe-stand/" },
          { name: "Kongressstand", href: "/de/service/kongress-stand-design/" },
          { name: "Maxima Stand", href: "/de/service/maxima-stand/" },
        ],
      },
    ],
    singleServices: [
      { number: "03", title: "Bauausführung", description: "Bau und Umsetzung unserer Projekte.", href: "/de/bauausfuehrung/" },
      { number: "04", title: "Möbelproduktion", description: "Maßgefertigte Möbel aus eigener Werkstatt.", href: "/de/moebelproduktion/" },
    ],
    menuInvite: { signature: ["Eine eigene", "Handschrift."], text: "Starten wir gemeinsam ein neues Projekt.", cta: "Sprechen wir", href: ROUTES.de.contact },
    start: "Projekt starten",
    ai: { label: "Mit KI gestalten", short: "KI-Design", href: "/de/messestand-mit-ki/" },
    strip: "Planung, Produktion, Logistik und Aufbau — schlüsselfertig.",
    allProjects: "Alle Projekte",
    menu: "Menü öffnen",
  },
  // IT ve FR: hizmet detay sayfaları İngilizce sürüme gider
  it: {
    main: [
      { name: "Home", href: ROUTES.it.home },
      { name: "Chi siamo", href: ROUTES.it.about },
      { name: "Progetti", href: ROUTES.it.projects },
      { name: "Blog", href: ROUTES.it.blog },
      { name: "Contatti", href: ROUTES.it.contact },
    ],
    servicesLabel: "Cosa facciamo",
    serviceGroups: [
      {
        number: "01",
        title: "Architettura d'interni",
        description: "Interni chiavi in mano, dalle residenze agli spazi commerciali.",
        href: ROUTES.it.services,
        items: [
          { name: "Residenze e ville", href: "/en/service/housing-villa-design/" },
          { name: "Negozi", href: "/en/service/store-design-and-implementation/" },
          { name: "Cliniche", href: "/en/service/clinic-design-and-implementation/" },
          { name: "Caffè e ristoranti", href: "/en/service/cafe-restaurant-design-and-implementation/" },
          { name: "Uffici", href: "/en/service/office-design-and-implementation/" },
        ],
      },
      {
        number: "02",
        title: "Stand fieristici",
        description: "Stand fieristici in tutto il mondo, dal progetto al montaggio.",
        href: "/en/service/expo-design/",
        items: [
          { name: "Stand fieristico", href: "/en/service/expo-design/" },
          { name: "Stand per congressi", href: "/en/service/congress-stand-design/" },
          { name: "Maxima Stand", href: "/en/service/maxima-stand/" },
        ],
      },
    ],
    singleServices: [
      { number: "03", title: "Costruzione", description: "Costruzione e realizzazione dei nostri progetti.", href: "/en/construction-contracting/" },
      { number: "04", title: "Arredi su misura", description: "Progettazione e produzione di arredi su misura.", href: "/en/furniture-production/" },
    ],
    menuInvite: { signature: ["Una firma", "tutta vostra."], text: "Iniziamo insieme un nuovo progetto.", cta: "Parliamone", href: ROUTES.it.contact },
    start: "Avvia un progetto",
    ai: { label: "Progetta con l'IA", short: "IA", href: "/en/design-with-ai/" },
    strip: "Progettazione, produzione, logistica e montaggio — chiavi in mano.",
    allProjects: "Tutti i progetti",
    menu: "Apri il menu",
  },
  fr: {
    main: [
      { name: "Accueil", href: ROUTES.fr.home },
      { name: "À propos", href: ROUTES.fr.about },
      { name: "Nos projets", href: ROUTES.fr.projects },
      { name: "Blog", href: ROUTES.fr.blog },
      { name: "Contact", href: ROUTES.fr.contact },
    ],
    servicesLabel: "Nos services",
    serviceGroups: [
      {
        number: "01",
        title: "Architecture intérieure",
        description: "Intérieurs clés en main, de l'habitat aux espaces commerciaux.",
        href: ROUTES.fr.services,
        items: [
          { name: "Logements et villas", href: "/en/service/housing-villa-design/" },
          { name: "Boutiques", href: "/en/service/store-design-and-implementation/" },
          { name: "Cliniques", href: "/en/service/clinic-design-and-implementation/" },
          { name: "Cafés et restaurants", href: "/en/service/cafe-restaurant-design-and-implementation/" },
          { name: "Bureaux", href: "/en/service/office-design-and-implementation/" },
        ],
      },
      {
        number: "02",
        title: "Stands d'exposition",
        description: "Stands d'exposition dans le monde entier, de la conception au montage.",
        href: "/en/service/expo-design/",
        items: [
          { name: "Stand d'exposition", href: "/en/service/expo-design/" },
          { name: "Stand de congrès", href: "/en/service/congress-stand-design/" },
          { name: "Maxima Stand", href: "/en/service/maxima-stand/" },
        ],
      },
    ],
    singleServices: [
      { number: "03", title: "Construction", description: "Construction et réalisation de nos projets.", href: "/en/construction-contracting/" },
      { number: "04", title: "Mobilier sur mesure", description: "Conception et fabrication de mobilier sur mesure.", href: "/en/furniture-production/" },
    ],
    menuInvite: { signature: ["Une signature", "qui vous ressemble."], text: "Commençons ensemble un nouveau projet.", cta: "Parlons-en", href: ROUTES.fr.contact },
    start: "Lancer un projet",
    ai: { label: "Concevoir avec l'IA", short: "IA", href: "/en/design-with-ai/" },
    strip: "Conception, production, logistique et montage — clés en main.",
    allProjects: "Tous nos projets",
    menu: "Ouvrir le menu",
  },
};

export const contactInfo = {
  phoneDisplay: "0 (212) 706 28 32",
  phoneHref: "tel:+902127062832",
  email: "info@wawainteriors.com",
  whatsappHref: "https://wa.me/902127062832",
};

// Eski sitede olmayan, yeni eklenen hizmet sayfaları (İnşaat Taahhüt, Mobilya Üretim).
// Metinler eski sitedeki ifadelere dayanır: kendi mobilya atölyesi, inşaat ve müteahhitlik hizmeti,
// ruhsat hariç anahtar teslim yönetim. Sayı ve iddia uydurulmaz.
import type { Lang } from "@/lib/i18n";

export type ExtraPage = {
  key: "construction" | "furniture" | "sector" | "stand";
  path: string;
  lang: Lang;
  title: string;
  lead: string;
  image: string;
  sections: { h: string; p: string }[];
  points: string[];
  projectCategories?: string[]; // TR proje kategori adresleri (ilgili projeler için)
  projectPaths?: string[]; // doğrudan ilgili projeler
  faq?: { q: string; a: string }[];
  seo: { title: string; description: string };
};

const ALT = {
  construction: { tr: "/insaat-taahhut/", en: "/en/construction-contracting/", de: "/de/bauausfuehrung/" },
  furniture: { tr: "/mobilya-uretim/", en: "/en/furniture-production/", de: "/de/moebelproduktion/" },
} as const;

export const extraAlternates = (page: ExtraPage): Partial<Record<Lang, string>> =>
  page.key === "sector" || page.key === "stand" ? { [page.lang]: page.path } : { ...ALT[page.key] };

export const extraPages: ExtraPage[] = [
  {
    key: "construction",
    path: ALT.construction.tr,
    lang: "tr",
    title: "İnşaat Taahhüt",
    lead: "Tasarladığımız mekânın inşaat ve uygulamasını da biz üstleniyoruz. Proje, şantiye ve teslim tek ekipte kalır.",
    image: "/images/hero/acarkent-villa.webp",
    sections: [
      {
        h: "Tasarımdan şantiyeye tek sorumluluk",
        p: "WAWA, inşaat ve müteahhitlik hizmeti veren bir iç mimarlık firmasıdır. Tasarım ve teknik çizimleri kendi bünyemizde hazırlıyor; inşaat, mobilya üretimi ve uygulamayı tek elden yönetiyoruz. Çizimi hazırlayan ekip, sahada kararların doğru uygulandığını da takip eder.",
      },
      {
        h: "İş kalemlerinin doğru sırası",
        p: "Uygulamada inşaat işleri, elektrik, tesisat, boya ve mobilya montajı birbirini bekleyen kalemlerdir. Sıralamayı baştan doğru kurmak süreyi belirler; her etabı iş programına bağlayıp sahada kontrol ediyoruz.",
      },
      {
        h: "Kapsam yazılı, sürpriz yok",
        p: "Anahtar teslim projelerde ruhsat hariç tüm süreçleri biz yönetiyoruz. Hangi işlerin kapsamda olduğu teklif ve sözleşmede kalem kalem netleşir.",
      },
    ],
    points: ["Kaba ve ince işler", "Elektrik ve tesisat koordinasyonu", "İş programı ve şantiye yönetimi", "Yerinde kontrol ve teslim"],
    projectCategories: ["/portfolio-category/konut-villa/", "/portfolio-category/klinik-tasarim/", "/portfolio-category/cafe-restoran-tasarim/"],
    seo: {
      title: "İnşaat Taahhüt ve Uygulama | WAWA Interiors",
      description: "İç mimari projelerin inşaat ve uygulamasını tek elden yönetiyoruz: iş programı, şantiye yönetimi, yerinde kontrol ve anahtar teslim.",
    },
  },
  {
    key: "furniture",
    path: ALT.furniture.tr,
    lang: "tr",
    title: "Mobilya Üretim",
    lead: "Projeye özel mobilya ve sabit donatıyı kendi atölyemizde üretiyor, sahada monte ediyoruz.",
    image: "/images/process/konsept.webp",
    sections: [
      {
        h: "Kendi atölyemiz",
        p: "WAWA'nın kendi mobilya atölyesi var. Üretim detayları, tasarım ve teknik çizimle aynı çatı altında ele alınır; ölçü, malzeme ve birleşim kararları çizim masasından atölyeye kaybolmadan taşınır.",
      },
      {
        h: "Atölyede hazırlanır, sahada monte edilir",
        p: "Dolap, tezgâh, banko, duvar kaplaması gibi parçalar atölyede hazırlanır; sahada yalnızca montaj yapılır. Böylece şantiyedeki süre kısalır, işçilik kalitesi kontrol altında kalır.",
      },
      {
        h: "Konut, ticari mekân ve fuar standı",
        p: "Konut ve villa projelerinden klinik, mağaza, ofis ve restoranlara, ahşap fuar standlarına kadar projeye özel üretim yapıyoruz.",
      },
    ],
    points: ["Projeye özel mobilya", "Sabit donatı ve kaplamalar", "Malzeme ve numune seçimi", "Nakliye ve montaj"],
    projectCategories: ["/portfolio-category/cafe-restoran-tasarim/", "/portfolio-category/ofis-tasarimi/", "/portfolio-category/magaza-tasarim/"],
    seo: {
      title: "Projeye Özel Mobilya Üretimi | WAWA Interiors",
      description: "Projeye özel mobilya ve sabit donatıyı kendi atölyemizde üretiyor, sahada monte ediyoruz. Tasarım, üretim ve montaj tek elden.",
    },
  },
  {
    key: "construction",
    path: ALT.construction.en,
    lang: "en",
    title: "Construction & Contracting",
    lead: "We also build the spaces we design. Project, site and handover stay with one team.",
    image: "/images/hero/acarkent-villa.webp",
    sections: [
      {
        h: "One responsibility from design to site",
        p: "WAWA is an interior architecture firm that also provides construction and contracting. We prepare design and technical drawings in-house and manage construction, furniture production and implementation ourselves. The team that draws the project also follows it on site.",
      },
      {
        h: "The right order of works",
        p: "Construction, electrical, plumbing, painting and furniture installation depend on each other. Getting the sequence right from the start defines the schedule; we tie every stage to a work programme and check it on site.",
      },
      {
        h: "Written scope, no surprises",
        p: "In turnkey projects we manage every process except permits. What is included is defined item by item in the offer and contract.",
      },
    ],
    points: ["Shell and finishing works", "Electrical and plumbing coordination", "Work programme and site management", "On-site checks and handover"],
    projectCategories: ["/portfolio-category/konut-villa/", "/portfolio-category/klinik-tasarim/", "/portfolio-category/cafe-restoran-tasarim/"],
    seo: {
      title: "Construction & Contracting | WAWA Interiors",
      description: "We manage the construction and implementation of interior projects in one hand: work programme, site management, on-site checks and turnkey handover.",
    },
  },
  {
    key: "furniture",
    path: ALT.furniture.en,
    lang: "en",
    title: "Furniture Production",
    lead: "We produce custom furniture and fixed fittings in our own workshop and install them on site.",
    image: "/images/process/konsept.webp",
    sections: [
      {
        h: "Our own workshop",
        p: "WAWA has its own furniture workshop. Production details are handled under the same roof as design and technical drawings, so decisions on size, material and joinery move from the drawing board to the workshop intact.",
      },
      {
        h: "Made in the workshop, installed on site",
        p: "Cabinets, counters, reception desks and wall claddings are prepared in the workshop; only installation happens on site. This shortens time on site and keeps workmanship under control.",
      },
      {
        h: "Homes, commercial spaces and exhibition stands",
        p: "From residences and villas to clinics, stores, offices, restaurants and timber exhibition stands, we produce what each project needs.",
      },
    ],
    points: ["Custom furniture", "Fixed fittings and claddings", "Material and sample selection", "Delivery and installation"],
    projectCategories: ["/portfolio-category/cafe-restoran-tasarim/", "/portfolio-category/ofis-tasarimi/", "/portfolio-category/magaza-tasarim/"],
    seo: {
      title: "Custom Furniture Production | WAWA Interiors",
      description: "We produce custom furniture and fixed fittings in our own workshop and install them on site. Design, production and installation in one hand.",
    },
  },
  {
    key: "construction",
    path: ALT.construction.de,
    lang: "de",
    title: "Bauausführung",
    lead: "Wir bauen die Räume, die wir planen, auch selbst. Projekt, Baustelle und Übergabe bleiben in einem Team.",
    image: "/images/hero/acarkent-villa.webp",
    sections: [
      {
        h: "Eine Verantwortung von der Planung bis zur Baustelle",
        p: "WAWA ist ein Innenarchitekturbüro, das auch Bau- und Generalunternehmerleistungen erbringt. Entwurf und technische Zeichnungen entstehen im eigenen Haus; Bau, Möbelproduktion und Umsetzung steuern wir selbst. Das Team, das plant, begleitet das Projekt auch auf der Baustelle.",
      },
      {
        h: "Die richtige Reihenfolge der Gewerke",
        p: "Bau, Elektrik, Sanitär, Malerarbeiten und Möbelmontage hängen voneinander ab. Die richtige Reihenfolge bestimmt die Bauzeit; jede Phase wird mit einem Bauzeitenplan verknüpft und vor Ort geprüft.",
      },
      {
        h: "Schriftlicher Umfang, keine Überraschungen",
        p: "Bei schlüsselfertigen Projekten steuern wir alle Prozesse außer Genehmigungen. Der Leistungsumfang wird in Angebot und Vertrag Position für Position festgelegt.",
      },
    ],
    points: ["Rohbau und Ausbau", "Koordination Elektrik und Sanitär", "Bauzeitenplan und Baustellenleitung", "Kontrolle vor Ort und Übergabe"],
    projectCategories: ["/portfolio-category/konut-villa/", "/portfolio-category/klinik-tasarim/", "/portfolio-category/cafe-restoran-tasarim/"],
    seo: {
      title: "Bauausführung | WAWA Interiors",
      description: "Bau und Umsetzung von Innenarchitekturprojekten aus einer Hand: Bauzeitenplan, Baustellenleitung, Kontrolle vor Ort und schlüsselfertige Übergabe.",
    },
  },
  {
    key: "furniture",
    path: ALT.furniture.de,
    lang: "de",
    title: "Möbelproduktion",
    lead: "Maßgefertigte Möbel und Einbauten entstehen in unserer eigenen Werkstatt und werden vor Ort montiert.",
    image: "/images/process/konsept.webp",
    sections: [
      {
        h: "Eigene Werkstatt",
        p: "WAWA hat eine eigene Möbelwerkstatt. Produktionsdetails entstehen unter einem Dach mit Entwurf und technischen Zeichnungen, sodass Maße, Materialien und Verbindungen vom Zeichentisch unverändert in die Werkstatt gelangen.",
      },
      {
        h: "In der Werkstatt gefertigt, vor Ort montiert",
        p: "Schränke, Theken, Empfangstresen und Wandverkleidungen werden in der Werkstatt vorbereitet; auf der Baustelle wird nur montiert. Das verkürzt die Bauzeit und hält die Ausführungsqualität unter Kontrolle.",
      },
      {
        h: "Wohnen, Gewerbe und Messestände",
        p: "Von Wohnungen und Villen bis zu Kliniken, Läden, Büros, Restaurants und Holzmessenständen fertigen wir, was das Projekt braucht.",
      },
    ],
    points: ["Maßgefertigte Möbel", "Einbauten und Verkleidungen", "Material- und Musterauswahl", "Lieferung und Montage"],
    projectCategories: ["/portfolio-category/cafe-restoran-tasarim/", "/portfolio-category/ofis-tasarimi/", "/portfolio-category/magaza-tasarim/"],
    seo: {
      title: "Maßgefertigte Möbelproduktion | WAWA Interiors",
      description: "Maßgefertigte Möbel und Einbauten aus eigener Werkstatt, vor Ort montiert. Planung, Produktion und Montage aus einer Hand.",
    },
  },
];

export const getExtraPage = (path: string) => extraPages.find((p) => p.path === path);

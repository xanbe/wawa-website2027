// Yapay zeka tasarım stüdyosu: veri modeli, sınırlar ve metinler.
// Ölçüler metre; x genişlik (soldan sağa), z derinlik (arka = negatif, ön/koridor = pozitif), y yukarı.

export type StudioLang = "tr" | "en" | "de";
export type Mode = "interior" | "stand";
export type StandType = "sira" | "kose" | "yarimada" | "ada";
export type Space = "salon" | "mutfak" | "yatak" | "ofis" | "magaza" | "cafe" | "klinik";
export type WallSide = "back" | "left" | "right" | "none";
export type StandElement = "banko" | "depo" | "led" | "toplanti" | "raf" | "asma";
export type Tone = "sicak" | "notr" | "acik" | "koyu";
export type Style = "minimal" | "modern" | "luks" | "dogal" | "endustriyel";

export interface StandBrief {
  type: StandType;
  w: number;
  d: number;
  h: number;
  elements: StandElement[];
  sector: string;
  color: string;
  logo?: boolean; // taslakta marka logosu var mı (görselin kendisi taslak görüntüsündedir)
}

export interface RoomBrief {
  space: Space;
  w: number;
  l: number;
  h: number;
  window: WallSide;
  door: WallSide;
  tone: Tone;
}

export interface StudioBrief {
  mode: Mode;
  stand: StandBrief;
  room: RoomBrief;
  styles: Style[];
  refSrc: string | null;
  notes: string;
}

export const LIMITS = {
  stand: { w: [2, 30], d: [2, 20], h: [2.5, 6] },
  room: { w: [2, 30], l: [2, 30], h: [2.4, 6] },
} as const;

export const DEFAULT_BRIEF: StudioBrief = {
  mode: "stand",
  stand: { type: "kose", w: 6, d: 4, h: 3, elements: ["banko", "depo", "led", "toplanti"], sector: "", color: "#1F4E8C" },
  room: { space: "salon", w: 5, l: 6, h: 2.8, window: "back", door: "left", tone: "sicak" },
  styles: ["modern"],
  refSrc: null,
  notes: "",
};

export const STAND_TYPES: StandType[] = ["sira", "kose", "yarimada", "ada"];
export const SPACES: Space[] = ["salon", "mutfak", "yatak", "ofis", "magaza", "cafe", "klinik"];
export const STAND_ELEMENTS: StandElement[] = ["banko", "depo", "led", "toplanti", "raf", "asma"];
export const TONES: Tone[] = ["sicak", "notr", "acik", "koyu"];
export const STYLES: Style[] = ["minimal", "modern", "luks", "dogal", "endustriyel"];
export const WALLS: WallSide[] = ["back", "left", "right", "none"];

// Açık cephe sayısı (koridora bakan kenar)
export const OPEN_SIDES: Record<StandType, number> = { sira: 1, kose: 2, yarimada: 3, ada: 4 };

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const clamp = (n: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, n));

export type ReferenceProject = { src: string; title: string; path: string };

type Copy = {
  steps: [string, string, string, string, string];
  next: string;
  back: string;
  modeTitle: string;
  modes: Record<Mode, { title: string; text: string }>;
  dimsTitle: string;
  width: string;
  depth: string;
  length: string;
  height: string;
  ceiling: string;
  area: string;
  standType: string;
  standTypes: Record<StandType, { title: string; text: string }>;
  space: string;
  spaces: Record<Space, string>;
  windowWall: string;
  doorWall: string;
  walls: Record<WallSide, string>;
  contentTitle: string;
  elementsLabel: string;
  elements: Record<StandElement, string>;
  sector: string;
  sectorPlaceholder: string;
  brandColor: string;
  tone: string;
  tones: Record<Tone, string>;
  styleTitle: string;
  styleLabel: string;
  styles: Record<Style, string>;
  refLabel: string;
  refHint: string;
  noRef: string;
  notes: string;
  notesPlaceholder: string;
  generateTitle: string;
  generateLead: string;
  name: string;
  phone: string;
  email: string;
  consent: string;
  consentLink: string;
  generate: string;
  generating: string;
  resultTitle: string;
  resultPending: string;
  download: string;
  regenerate: string;
  edit: string;
  offer: string;
  view3d: string;
  viewRender: string;
  views: { persp: string; top: string; front: string };
  scaleNote: string;
  errors: { invalid: string; too_many: string; failed: string };
  sentNote: string;
};

export const COPY: Record<StudioLang, Copy> = {
  tr: {
    steps: ["Proje", "Ölçüler", "İçerik", "Stil", "Üret"],
    next: "Devam",
    back: "Geri",
    modeTitle: "Ne tasarlıyoruz?",
    modes: {
      interior: { title: "İç mimari", text: "Salon, mutfak, ofis, mağaza, cafe ya da klinik. Odanızın ölçülerini girin." },
      stand: { title: "Fuar standı", text: "Sıra, köşe, yarımada ya da ada stand. Stand alanınızın ölçülerini girin." },
    },
    dimsTitle: "Ölçüleri girin",
    width: "Genişlik",
    depth: "Derinlik",
    length: "Uzunluk",
    height: "Stand yüksekliği",
    ceiling: "Tavan yüksekliği",
    area: "Alan",
    standType: "Stand tipi",
    standTypes: {
      sira: { title: "Sıra", text: "1 açık cephe" },
      kose: { title: "Köşe", text: "2 açık cephe" },
      yarimada: { title: "Yarımada", text: "3 açık cephe" },
      ada: { title: "Ada", text: "4 açık cephe" },
    },
    space: "Mekân",
    spaces: { salon: "Salon", mutfak: "Mutfak", yatak: "Yatak odası", ofis: "Ofis", magaza: "Mağaza", cafe: "Cafe", klinik: "Klinik" },
    windowWall: "Pencere",
    doorWall: "Kapı",
    walls: { back: "Arka duvar", left: "Sol duvar", right: "Sağ duvar", none: "Yok" },
    contentTitle: "İçerik",
    elementsLabel: "Standda neler olsun?",
    elements: { banko: "Karşılama bankosu", depo: "Depo", led: "LED ekran", toplanti: "Toplantı alanı", raf: "Ürün rafları", asma: "Asma pano" },
    sector: "Sektör",
    sectorPlaceholder: "Örn. gıda, enerji, kozmetik",
    brandColor: "Marka rengi",
    tone: "Renk tonu",
    tones: { sicak: "Sıcak", notr: "Nötr", acik: "Açık", koyu: "Koyu" },
    styleTitle: "Stil",
    styleLabel: "Tasarım dili",
    styles: { minimal: "Minimal", modern: "Modern", luks: "Lüks", dogal: "Doğal", endustriyel: "Endüstriyel" },
    refLabel: "Projelerimizden ilham",
    refHint: "Beğendiğiniz bir projemizi seçin; malzeme ve ışık dili referans alınır.",
    noRef: "Referans yok",
    notes: "Notunuz",
    notesPlaceholder: "Örn. ürünler göz hizasında sergilensin, ahşap ağırlıklı olsun",
    generateTitle: "Görseli üretelim",
    generateLead: "3D taslağınız ve ölçüleriniz yapay zekaya gerçek ölçülerle verilir. Görsel hazırlanınca ekibimiz de projenizi inceler.",
    name: "Ad soyad",
    phone: "Telefon",
    email: "E-posta (isteğe bağlı)",
    consent: "Bilgilerimin bu talep için kullanılmasını kabul ediyorum.",
    consentLink: "Aydınlatma metni",
    generate: "Görseli üret",
    generating: "Görsel hazırlanıyor…",
    resultTitle: "Tasarım önerisi",
    resultPending: "Talebiniz ve 3D taslağınız ekibimize ulaştı. Görsel üretimi şu an kapalı; tasarım önerinizi ekibimiz hazırlayıp size dönecek.",
    download: "İndir",
    regenerate: "Yeniden üret",
    edit: "Ölçüleri düzenle",
    offer: "Bu proje için teklif al",
    view3d: "3D taslak",
    viewRender: "Görsel",
    views: { persp: "Perspektif", top: "Üstten", front: "Önden" },
    scaleNote: "İnsan figürü 1,75 m",
    errors: {
      invalid: "Lütfen ad soyad ve geçerli bir telefon girin, onay kutusunu işaretleyin.",
      too_many: "Kısa sürede çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.",
      failed: "Görsel şu an üretilemedi. Talebiniz ekibimize iletildi; tekrar deneyebilirsiniz.",
    },
    sentNote: "Talebiniz ekibimize iletildi.",
  },
  en: {
    steps: ["Project", "Size", "Content", "Style", "Create"],
    next: "Continue",
    back: "Back",
    modeTitle: "What are we designing?",
    modes: {
      interior: { title: "Interior", text: "Living room, kitchen, office, store, cafe or clinic. Enter your room size." },
      stand: { title: "Exhibition stand", text: "Inline, corner, peninsula or island stand. Enter your stand size." },
    },
    dimsTitle: "Enter the dimensions",
    width: "Width",
    depth: "Depth",
    length: "Length",
    height: "Stand height",
    ceiling: "Ceiling height",
    area: "Area",
    standType: "Stand type",
    standTypes: {
      sira: { title: "Inline", text: "1 open side" },
      kose: { title: "Corner", text: "2 open sides" },
      yarimada: { title: "Peninsula", text: "3 open sides" },
      ada: { title: "Island", text: "4 open sides" },
    },
    space: "Space",
    spaces: { salon: "Living room", mutfak: "Kitchen", yatak: "Bedroom", ofis: "Office", magaza: "Store", cafe: "Cafe", klinik: "Clinic" },
    windowWall: "Window",
    doorWall: "Door",
    walls: { back: "Back wall", left: "Left wall", right: "Right wall", none: "None" },
    contentTitle: "Content",
    elementsLabel: "What should the stand include?",
    elements: { banko: "Reception counter", depo: "Storage", led: "LED screen", toplanti: "Meeting area", raf: "Product shelves", asma: "Hanging banner" },
    sector: "Industry",
    sectorPlaceholder: "e.g. food, energy, cosmetics",
    brandColor: "Brand colour",
    tone: "Colour tone",
    tones: { sicak: "Warm", notr: "Neutral", acik: "Light", koyu: "Dark" },
    styleTitle: "Style",
    styleLabel: "Design language",
    styles: { minimal: "Minimal", modern: "Modern", luks: "Luxury", dogal: "Natural", endustriyel: "Industrial" },
    refLabel: "Inspired by our projects",
    refHint: "Pick one of our projects; its materials and lighting are used as a reference.",
    noRef: "No reference",
    notes: "Your note",
    notesPlaceholder: "e.g. products at eye level, mostly wood",
    generateTitle: "Let's create the image",
    generateLead: "Your 3D draft and dimensions are given to the AI at real scale. Our team also reviews your project once the image is ready.",
    name: "Full name",
    phone: "Phone",
    email: "Email (optional)",
    consent: "I agree that my details are used for this request.",
    consentLink: "Privacy notice",
    generate: "Create image",
    generating: "Creating image…",
    resultTitle: "Design proposal",
    resultPending: "Your request and 3D draft have reached our team. Image generation is currently off; our team will prepare your design proposal and get back to you.",
    download: "Download",
    regenerate: "Create again",
    edit: "Edit dimensions",
    offer: "Get an offer for this project",
    view3d: "3D draft",
    viewRender: "Image",
    views: { persp: "Perspective", top: "Top", front: "Front" },
    scaleNote: "Human figure 1.75 m",
    errors: {
      invalid: "Please enter your name and a valid phone number, and tick the consent box.",
      too_many: "Too many attempts in a short time. Please try again later.",
      failed: "The image could not be created right now. Your request has been sent to our team; you can try again.",
    },
    sentNote: "Your request has been sent to our team.",
  },
  de: {
    steps: ["Projekt", "Maße", "Inhalt", "Stil", "Erstellen"],
    next: "Weiter",
    back: "Zurück",
    modeTitle: "Was gestalten wir?",
    modes: {
      interior: { title: "Innenarchitektur", text: "Wohnzimmer, Küche, Büro, Laden, Café oder Klinik. Geben Sie die Raummaße ein." },
      stand: { title: "Messestand", text: "Reihen-, Eck-, Kopf- oder Inselstand. Geben Sie die Standmaße ein." },
    },
    dimsTitle: "Maße eingeben",
    width: "Breite",
    depth: "Tiefe",
    length: "Länge",
    height: "Standhöhe",
    ceiling: "Raumhöhe",
    area: "Fläche",
    standType: "Standart",
    standTypes: {
      sira: { title: "Reihe", text: "1 offene Seite" },
      kose: { title: "Ecke", text: "2 offene Seiten" },
      yarimada: { title: "Kopf", text: "3 offene Seiten" },
      ada: { title: "Insel", text: "4 offene Seiten" },
    },
    space: "Raum",
    spaces: { salon: "Wohnzimmer", mutfak: "Küche", yatak: "Schlafzimmer", ofis: "Büro", magaza: "Laden", cafe: "Café", klinik: "Klinik" },
    windowWall: "Fenster",
    doorWall: "Tür",
    walls: { back: "Rückwand", left: "Linke Wand", right: "Rechte Wand", none: "Keine" },
    contentTitle: "Inhalt",
    elementsLabel: "Was soll der Stand enthalten?",
    elements: { banko: "Empfangstheke", depo: "Lager", led: "LED-Wand", toplanti: "Besprechungsbereich", raf: "Produktregale", asma: "Deckenbanner" },
    sector: "Branche",
    sectorPlaceholder: "z. B. Lebensmittel, Energie, Kosmetik",
    brandColor: "Markenfarbe",
    tone: "Farbton",
    tones: { sicak: "Warm", notr: "Neutral", acik: "Hell", koyu: "Dunkel" },
    styleTitle: "Stil",
    styleLabel: "Gestaltungssprache",
    styles: { minimal: "Minimal", modern: "Modern", luks: "Luxus", dogal: "Natürlich", endustriyel: "Industriell" },
    refLabel: "Inspiriert von unseren Projekten",
    refHint: "Wählen Sie eines unserer Projekte; Materialien und Licht dienen als Referenz.",
    noRef: "Keine Referenz",
    notes: "Ihre Notiz",
    notesPlaceholder: "z. B. Produkte auf Augenhöhe, viel Holz",
    generateTitle: "Bild erstellen",
    generateLead: "Ihr 3D-Entwurf und Ihre Maße gehen maßstabsgetreu an die KI. Sobald das Bild fertig ist, prüft auch unser Team Ihr Projekt.",
    name: "Name",
    phone: "Telefon",
    email: "E-Mail (optional)",
    consent: "Ich bin einverstanden, dass meine Angaben für diese Anfrage verwendet werden.",
    consentLink: "Datenschutzhinweis",
    generate: "Bild erstellen",
    generating: "Bild wird erstellt…",
    resultTitle: "Gestaltungsvorschlag",
    resultPending: "Ihre Anfrage und Ihr 3D-Entwurf sind bei unserem Team. Die Bilderstellung ist derzeit aus; unser Team erstellt Ihren Vorschlag und meldet sich.",
    download: "Herunterladen",
    regenerate: "Neu erstellen",
    edit: "Maße bearbeiten",
    offer: "Angebot für dieses Projekt",
    view3d: "3D-Entwurf",
    viewRender: "Bild",
    views: { persp: "Perspektive", top: "Oben", front: "Vorne" },
    scaleNote: "Figur 1,75 m",
    errors: {
      invalid: "Bitte Namen und gültige Telefonnummer eingeben und die Einwilligung ankreuzen.",
      too_many: "Zu viele Versuche in kurzer Zeit. Bitte später erneut versuchen.",
      failed: "Das Bild konnte gerade nicht erstellt werden. Ihre Anfrage ging an unser Team; Sie können es erneut versuchen.",
    },
    sentNote: "Ihre Anfrage wurde an unser Team gesendet.",
  },
};

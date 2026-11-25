// Fuarların veri dışı ortak parçaları: türler, bölge ve sektör etiketleri, dillere göre adresler.
// Tarayıcıda çalışan bileşenler bunu kullanır; fuar listesinin kendisi (fairs.json) buraya girmez.
import type { Lang } from "@/lib/i18n";

export type FairRegion = "tr" | "eu" | "uk" | "me" | "am";
export type Fair = {
  slug: string;
  name: string;
  city: string;
  country: string;
  venue?: string;
  region: FairRegion;
  start: string;
  end: string;
  sector: string;
  url?: string;
  verified?: boolean;
  match: string[];
};

export const REGION_LABEL: Record<FairRegion, string> = { tr: "Türkiye", eu: "Avrupa", uk: "İngiltere", me: "Orta Doğu", am: "Amerika" };
export const REGIONS = Object.keys(REGION_LABEL) as FairRegion[];

// Sektör grupları: her fuarın serbest yazılmış sektörü ana gruplardan birine bağlanır (takvimde sektör filtresi için).
// Sıra önemlidir: ilk eşleşen grup geçerlidir (ör. "Tarım makineleri" makineden önce tarıma düşer).
export const SECTOR_GROUPS = [
  { id: "kuyum", label: "Kuyum ve saat", re: /mücevher|kuyum|saat\b|saat ve|bijuteri|jewel/ },
  { id: "savunma", label: "Güvenlik ve savunma", re: /savunma|iş sağlığı|afet|iş güvenli|güvenlik|yangın|atıcılık|av ve/ },
  { id: "saglik", label: "Sağlık ve medikal", re: /sağlık|medikal|ilaç|eczane|eczacılık|diş hekim|dermatoloji|rehabilitasyon|optik|gözlük|tıp|hastane|laboratuvar/ },
  { id: "guzellik", label: "Güzellik ve kozmetik", re: /kozmetik|güzellik|kuaför|parfüm/ },
  { id: "petrol", label: "Petrol ve gaz", re: /petrol|doğalgaz|\bgaz\b|akaryakıt|madeni yağ|endüstriyel yağ/ },
  { id: "iklim", label: "İklimlendirme ve tesisat", re: /iklimlendirme|ısıtma|soğutma|klima|tesisat|hvac|havuz|sauna/ },
  { id: "mobilya", label: "Mobilya ve iç mekân", re: /mobilya|iç mimari|iç mekan|iç mekân|dekorasyon|ev ve|ev,|ev tekstil|ev ürün|ev dekor|halı|zemin kaplama|yatak|uyku|mutfak ve banyo|hediyelik|otel tasarım|otel iç|ağaç işleme|ahşap|yüzey malzeme|perde|stor/ },
  { id: "otel", label: "Otel, restoran ve turizm", re: /otel|restoran|gastronomi|ağırlama|turizm|endüstriyel mutfak|horeca|konaklama/ },
  { id: "tarim", label: "Tarım ve hayvancılık", re: /tarım|hayvancılık|kanatlı|tavuk|sera|yem\b|bahçecilik|binicilik|bağcılık/ },
  { id: "gida", label: "Gıda ve içecek", re: /gıda|içecek|şarap|kahve|şekerleme|atıştırmalık|\bet\b|süt|meyve|sebze|pasta|fırın|dondurma|helal|organik|gurme|su ürünleri|deniz ürün|süpermarket/ },
  { id: "plastik", label: "Plastik ve kimya", re: /plastik|kauçuk|silikon|kimya|kompozit|köpük|poliüretan|petrokimya|toz ve dozaj|hammadde/ },
  { id: "ambalaj", label: "Ambalaj ve baskı", re: /ambalaj|matbaa|baskı|kağıt|etiket|tabela|paketleme|mukavva|karton/ },
  { id: "tekstil", label: "Tekstil, moda ve deri", re: /tekstil|giyim|moda|kumaş|iplik|triko|ayakkabı|deri|konfeksiyon|aksesuar|çanta|pijama|denim|nonwoven/ },
  { id: "insaat", label: "İnşaat ve yapı", re: /inşaat|yapı(?!m)|beton|doğal taş|mermer|seramik|\bcam\b|pencere|kapı|asansör|kepenk|tente|altyapı|\byol\b|hırdavat|boya|kaplama|mimari|gayrimenkul|akıllı şehir|akıllı bina|peyzaj|bahçe|bina/ },
  { id: "otomotiv", label: "Otomotiv ve ulaşım", re: /otomotiv|araç|otobüs|lastik|motosiklet|bisiklet|demiryolu|havacılı|vasıta|denizcilik|tekne|\byat\b|gemi|karavan|filo|mobilite|ulaşım|havalimanı|yolcu/ },
  { id: "enerji", label: "Enerji ve elektrik", re: /enerji|güneş|rüzgar|hidrojen|batarya|elektrik|aydınlatma|güç elektroniği/ },
  { id: "lojistik", label: "Lojistik", re: /lojisti|taşımacılık|depolama|kargo|malzeme taşıma/ },
  { id: "makine", label: "Makine, metal ve endüstri", re: /makine|tezgah|metal|\bsac\b|kaynak|döküm|metalurji|çelik|alüminyum|otomasyon|robot|imalat|endüstri|sanayi|kalıp|bağlantı eleman|hassas|ısıl işlem|lazer|vana|kalite|\btest\b|proses|mühendislik|maden|iş makine|cam işleme|üretim|yüzey işlem|platform|dökme|tel|kablo/ },
  { id: "cevre", label: "Çevre ve su", re: /çevre|\bsu\b|atık|geri dönüşüm|temizlik|hijyen/ },
  { id: "tuketici", label: "Tüketici ürünleri ve perakende", re: /perakende|tüketici|oyuncak|kırtasiye|hobi|bebek|çocuk|anne|promosyon|özel etiket|özel marka|private label|franchise|lisans|evcil|spor|fitness|outdoor|tütün|el işi/ },
  { id: "teknoloji", label: "Elektronik ve teknoloji", re: /teknoloji|bilişim|elektronik|yazılım|yapay zeka|siber|dijital|telekom|iletişim|görsel|ses-görüntü|yayıncılık|gömülü|yarı iletken|fiber|e-ticaret|ödeme|veri merkez|drone|fotoğraf|oyun|uydu|telsiz|elektroteknik|elektromanyetik|pazarlama|sanal gerçeklik|müşteri hizmet|jeodezi|coğrafi|ışık ve ses/ },
] as const;
export type SectorGroupId = (typeof SECTOR_GROUPS)[number]["id"] | "diger";
export const SECTOR_LABEL: Record<SectorGroupId, string> = { ...Object.fromEntries(SECTOR_GROUPS.map((g) => [g.id, g.label])), diger: "Diğer" } as Record<SectorGroupId, string>;
export function sectorGroup(f: Pick<Fair, "sector" | "name">): SectorGroupId {
  const s = f.sector.toLocaleLowerCase("tr-TR");
  const n = f.name.toLocaleLowerCase("tr-TR");
  return (SECTOR_GROUPS.find((g) => g.re.test(s)) ?? SECTOR_GROUPS.find((g) => g.re.test(n)))?.id ?? "diger";
}

export type FairLite = Pick<Fair, "slug" | "name" | "city" | "country" | "region" | "start" | "end" | "sector"> & { group: SectorGroupId };
// Fuar seçim kutularındaki satır (liste fairs-i18n.ts içinde dile göre üretilir).
// v: "Ad · Şehir" (forma yazılan değer), c: "Şehir, Ülke", d: başlangıç, s: sektör, r: bölge
export type FairPick = { v: string; c: string; d: string; s: string; r: FairRegion };

export type PageLang = "tr" | "en" | "de";
export const pageLang = (lang: Lang): PageLang => (lang === "tr" || lang === "de" ? lang : "en");

export const CALENDAR_PATH: Record<PageLang, string> = { tr: "/fuar-takvimi/", en: "/en/trade-fair-calendar/", de: "/de/messekalender/" };
export const STAND_PRICES_PATH: Record<PageLang, string> = { tr: "/fuar-standi-fiyatlari/", en: "/en/exhibition-stand-prices/", de: "/de/messestand-preise/" };
export const INTERIOR_PRICES_PATHS: Record<PageLang, string> = { tr: "/ic-mimarlik-fiyatlari/", en: "/en/interior-design-prices/", de: "/de/innenarchitektur-preise/" };

export const calendarPath = (lang: Lang) => CALENDAR_PATH[pageLang(lang)];
export const fairPathL = (lang: Lang, slug: string) => `${calendarPath(lang)}${slug}/`;
// hreflang için aynı sayfanın diğer dillerdeki adresleri
export const alternatesOf = (paths: Record<PageLang, string>) => ({ tr: paths.tr, en: paths.en, de: paths.de, "x-default": paths.en });
// Menüdeki dil seçici için: IT ve FR İngilizce sayfaya gider
export const switchTargets = (paths: Record<PageLang, string>) => ({ tr: paths.tr, en: paths.en, de: paths.de, it: paths.en, fr: paths.en });

export const REGION_LABELS: Record<PageLang, Record<FairRegion, string>> = {
  tr: { tr: "Türkiye", eu: "Avrupa", uk: "İngiltere", me: "Orta Doğu", am: "Amerika" },
  en: { tr: "Türkiye", eu: "Europe", uk: "UK", me: "Middle East", am: "Americas" },
  de: { tr: "Türkei", eu: "Europa", uk: "Großbritannien", me: "Naher Osten", am: "Amerika" },
};

export const SECTOR_LABELS: Record<Exclude<PageLang, "tr">, Record<SectorGroupId, string>> = {
  en: {
    kuyum: "Jewellery and watches",
    savunma: "Security and defence",
    saglik: "Health and medical",
    guzellik: "Beauty and cosmetics",
    petrol: "Oil and gas",
    iklim: "HVAC and building services",
    mobilya: "Furniture and interiors",
    otel: "Hospitality and tourism",
    tarim: "Agriculture and livestock",
    gida: "Food and beverage",
    plastik: "Plastics and chemicals",
    ambalaj: "Packaging and print",
    tekstil: "Textiles, fashion and leather",
    insaat: "Construction and building",
    otomotiv: "Automotive and mobility",
    enerji: "Energy and electrical",
    lojistik: "Logistics",
    makine: "Machinery, metal and industry",
    cevre: "Environment and water",
    tuketici: "Consumer goods and retail",
    teknoloji: "Electronics and technology",
    diger: "Other",
  },
  de: {
    kuyum: "Schmuck und Uhren",
    savunma: "Sicherheit und Verteidigung",
    saglik: "Gesundheit und Medizin",
    guzellik: "Beauty und Kosmetik",
    petrol: "Öl und Gas",
    iklim: "Klima- und Haustechnik",
    mobilya: "Möbel und Interior",
    otel: "Hotellerie und Tourismus",
    tarim: "Landwirtschaft und Tierhaltung",
    gida: "Lebensmittel und Getränke",
    plastik: "Kunststoff und Chemie",
    ambalaj: "Verpackung und Druck",
    tekstil: "Textil, Mode und Leder",
    insaat: "Bau und Gebäude",
    otomotiv: "Automobil und Mobilität",
    enerji: "Energie und Elektro",
    lojistik: "Logistik",
    makine: "Maschinen, Metall und Industrie",
    cevre: "Umwelt und Wasser",
    tuketici: "Konsumgüter und Handel",
    teknoloji: "Elektronik und Technologie",
    diger: "Sonstige",
  },
};


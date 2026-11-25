import data from "./fairs.json";

// Fuar listesi (Türkiye, Avrupa, İngiltere, Orta Doğu, Amerika). Veri fairs.json dosyasındadır; tarihler organizatörlerin
// resmî sayfalarından alınmıştır (verified: false olanlar yalnızca fuar takvim sitelerinde görülebilmiştir).
// Geçmiş fuarlar listelerde tarayıcıda gizlenir. Her fuarın /fuar-takvimi/<slug>/ adresinde kendi sayfası vardır.
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

export const FAIRS: Fair[] = [...(data as Fair[])].sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name, "tr"));

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

export const getFair = (slug: string): Fair | undefined => FAIRS.find((f) => f.slug === slug);

// Listeler ve seçim kutuları için hafif kopya (sayfa içine gömülen veri küçük kalsın)
export type FairLite = Pick<Fair, "slug" | "name" | "city" | "country" | "region" | "start" | "end" | "sector"> & { group: SectorGroupId };
export const FAIRS_LITE: FairLite[] = FAIRS.map(({ slug, name, city, country, region, start, end, sector }) => ({ slug, name, city, country, region, start, end, sector, group: sectorGroup({ sector, name }) }));

// Fuar seçim kutuları için tekrarsız liste (aynı fuarın iki baskısı tek satır, ilk baskı kalır).
// v: "Ad · Şehir" (forma yazılan değer), c: "Şehir, Ülke", d: başlangıç, s: sektör, r: bölge
export type FairPick = { v: string; c: string; d: string; s: string; r: FairRegion };
export const FAIR_PICKS: FairPick[] = (() => {
  const seen = new Set<string>();
  const out: FairPick[] = [];
  for (const f of FAIRS) {
    const v = `${f.name} · ${f.city}`;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push({ v, c: `${f.city}, ${f.country}`, d: f.start, s: f.sector, r: f.region });
  }
  return out;
})();

export const fairPath = (slug: string) => `/fuar-takvimi/${slug}/`;
export const FAIRS_PATH = "/fuar-takvimi/";

// Anahtar kelimeye göre başlık (title), açıklama (meta description) ve sayfa başlığı (H1) düzeltmeleri.
// Kaynak: wawa-seo/keywords.txt (kelime | hedef sayfa). Adresler DEĞİŞMEZ; yalnızca metinler.
// Eski WordPress'ten taşınan "Wawa İçmimarlık Ofisi" ekleri ve yazım hataları burada düzeltilir.
// Dokunulmayanlar (Wawa SEO kural 6: 60 gün içinde düzenlenen sayfa): ana sayfa ve /maxima-stand/ — 11 Aralık 2026'dan sonra.
// Şehir sayfaları (/izmir-ic-mimarlik/ vb.) Ekim 2026'da yayınlandı; başlıkları zaten kelimeyi içeriyor.
export type SeoOverride = { fullTitle?: string; description?: string; h1?: string };

export const seoOverrides: Record<string, SeoOverride> = {
  // Hizmetler sayfası ana sayfayla aynı başlığı taşıyordu ("İç Mimar ve Fuar Standı Tasarımı") — iki sayfa aynı kelimede yarışmasın
  "/hizmetler/": {
    fullTitle: "Hizmetlerimiz: İç Mimarlık ve Fuar Standı | Wawa Interiors",
  },
  // ofis tasarımı istanbul · ofis iç mimari
  "/ofis-tasarimi-ve-uygulama/": {
    fullTitle: "Ofis Tasarımı İstanbul | Ofis İç Mimari ve Uygulama | Wawa",
    description:
      "İstanbul'da ofis tasarımı ve ofis iç mimari: çalışma düzeni, toplantı alanları, akustik ve aydınlatma kararlarından anahtar teslim uygulamaya. Teklif alın.",
    h1: "Ofis İç Mimari ve Ofis Tasarımı",
  },
  // mağaza tasarımı · mağaza iç mimar
  "/service/magaza-tasarimi/": {
    fullTitle: "Mağaza Tasarımı ve Mağaza İç Mimarlığı | Wawa Interiors",
    description:
      "Mağaza tasarımı ve mağaza iç mimar desteği: müşteri akışı, vitrin, raf düzeni, aydınlatma ve marka kimliğinden anahtar teslim uygulamaya.",
  },
  // klinik tasarımı · diş kliniği tasarımı
  "/service/klinik-tasarimi/": {
    fullTitle: "Klinik Tasarımı ve Klinik İç Mimarisi | Wawa Interiors",
    description:
      "Klinik tasarımı: hasta akışı, bekleme alanı, muayene odası ve hijyenik malzeme kararlarıyla diş kliniği ve sağlık mekânlarında anahtar teslim uygulama.",
    h1: "Klinik Tasarımı ve Uygulama",
  },
  // cafe tasarımı · restoran tasarımı · cafe iç mekan tasarımları · restoran iç mimar
  "/cafe-dekorasyon/": {
    fullTitle: "Cafe Tasarımı ve Restoran Tasarımı | Wawa Interiors",
    description:
      "Cafe tasarımı ve restoran tasarımı: konsept, oturma düzeni, servis akışı, aydınlatma ve malzeme seçimiyle cafe iç mekan tasarımları ve anahtar teslim uygulama.",
    h1: "Cafe Tasarımı ve Restoran İç Mimarisi",
  },
  // villa iç mimar · villa iç mimari · villa mimarlık firması
  "/konut-villa-tasarim/": {
    fullTitle: "Villa İç Mimari ve Villa Tasarımı | Wawa Interiors",
    h1: "Villa İç Mimari ve Konut Tasarımı",
  },
  // fuar standı · fuar stand firması · ahşap fuar standı · tüyap fuar standı (başlık ve H1 kelimeyi zaten içeriyor)
  "/fuar-standi/": {
    description:
      "Fuar stand firması: ahşap fuar standı, modüler (Maxima), kongre ve AVM standı tasarımı; Tüyap ve yurt dışı fuarlarında anahtar teslim kurulum.",
  },
  // kongre standı · kongre stand tasarımı
  "/service/kongre-stand-tasarimi/": {
    fullTitle: "Kongre Standı ve Kongre Stand Tasarımı | Wawa Interiors",
    description:
      "Kongre standı tasarımı ve uygulaması: sınırlı alanda görünürlük, hızlı kurulum, grafik ve aydınlatma; kongre ve sempozyumlar için anahtar teslim stand.",
  },
  // fuar standı fiyatları (eski başlıkta yazım hatası: "Stand Fiyatları nı")
  "/stand-fiyatlari/": {
    fullTitle: "Fuar Standı Fiyatları: Fiyatı Belirleyen Faktörler | Wawa",
    description:
      "Fuar standı fiyatları neye göre değişir? Metrekare, stand tipi, malzeme, grafik, nakliye ve kurulum kalemlerini teklifleri karşılaştırmadan önce inceleyin.",
    h1: "Fuar Standı Fiyatları: Stand Fiyatını Etkileyen Faktörler",
  },
  // yurtdışı fuar standı
  "/yurtdisi-fuar-stand-kurulum-firmasi/": {
    fullTitle: "Yurtdışı Fuar Standı Kurulum Firması ve Uygulamaları | Wawa",
    description:
      "Yurtdışı fuar standı nasıl planlanır? Kurulum firması seçimi, stand malzemeleri, nakliye ve yerel kurallar; Wawa'nın yurt dışı stand uygulamaları.",
    h1: "Yurtdışı Fuar Standı Kurulum Firması",
  },
  // almanya fuar stand firması
  "/almanya-fuar-stand-firmalari/": {
    fullTitle: "Almanya Fuar Stand Firması: Stand Örnekleri | Wawa Interiors",
    description:
      "Almanya'da fuar stand firması seçerken nelere bakılır? Uluslararası fuarlarda stand modelleri, kurulum ve Wawa'nın Almanya fuar standı uygulamaları.",
  },
};

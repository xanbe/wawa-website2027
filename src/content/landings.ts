// Hizmet sayfalarının açılış sayfası kurgusu (TR). Her sayfa kendi başına bir site gibi detaylıdır.
// Metinler eski sitenin hizmet sayfalarındaki bilgilere dayanır; sayı ve doğrulanamayan iddia yoktur.
// Eski SEO metni sayfanın "Detaylı bilgi" bölümünde aynen korunur.

import { landingsIntl } from "./landings-intl";

export type Landing = {
  kicker: string;
  title: string;
  lead: string;
  heroImages: string[];
  h1?: string; // sayfadaki H1 (yoksa eski sayfanın başlığı)
  heroVideo?: string; // açılış videosu (YouTube kimliği)
  highlights: { title: string; text: string }[];
  intro: { title: string; text: string };
  offerings?: { title: string; text: string; image: string; href?: string }[];
  offeringsTitle?: string;
  process: { title: string; text: string }[];
  processTitle?: string;
  blocks?: { title: string; lead?: string; items: { title: string; text: string }[] }[];
  projectCategories?: string[];
  projectPaths?: string[];
  // Hizmet kapsamı kartları (görselsiz): başlık, açıklama ve madde listesi
  scope?: { title: string; text: string; features: string[] }[];
  showReach?: boolean;
  showBrands?: boolean;
};

export const STAND_PROCESS = [
  { title: "Brief ve fuar bilgisi", text: "Fuar, salon, stand numarası, metrekare ve açık cephe sayısı; markanızın hedefi ve teşhir edilecek ürünler netleşir." },
  { title: "Konsept ve 3D tasarım", text: "Kurumsal renkleriniz ve hedef kitleniz analiz edilerek size özel stand konsepti ve 3D görseller hazırlanır." },
  { title: "Teknik proje ve onay", text: "Fuar kurallarına uygun teknik çizimler, elektrik ve aydınlatma planı hazırlanır; organizatör onayı alınır." },
  { title: "Atölyede üretim", text: "Stand elemanları ve teşhir üniteleri kendi atölyemizde üretilir, montaj öncesi kontrol edilir." },
  { title: "Lojistik ve kurulum", text: "Yurt içi ve yurt dışı nakliye, kurulum ve fuar boyunca teknik destek tek elden yönetilir." },
  { title: "Söküm ve depolama", text: "Fuar sonunda stand sökülür; tekrar kullanılabilir elemanlar sonraki katılımlar için değerlendirilir." },
];

export const INTERIOR_PROCESS = [
  { title: "Keşif ve ihtiyaç analizi", text: "Mekân yerinde incelenir, ölçü alınır; kullanım senaryosu, ihtiyaç programı ve takvim birlikte netleşir." },
  { title: "Konsept ve tasarım", text: "Mekânsal planlama, malzeme ve ışık kurgusu konsepte dönüşür; 3D görsellerle karar verilir." },
  { title: "Teknik proje", text: "Uygulama projeleri, detay çizimleri, mahal listesi ve iş programı hazırlanır." },
  { title: "Üretim ve uygulama", text: "Mobilya ve sabit donatı kendi atölyemizde üretilir; inşaat ve montaj sahada tek ekiple yürür." },
  { title: "Kontrol ve teslim", text: "Detaylar yerinde kontrol edilir, mekân kullanıma hazır teslim edilir. Ruhsat hariç tüm süreçler bizdedir." },
];

const INTERIOR_HIGHLIGHTS = [
  { title: "Tek ekip", text: "Tasarım, teknik çizim, inşaat ve mobilya üretimi aynı çatı altında." },
  { title: "Kendi atölyemiz", text: "Projeye özel mobilya ve sabit donatı atölyede üretilir, sahada monte edilir." },
  { title: "Yazılı kapsam", text: "Hangi işlerin dahil olduğu teklif ve sözleşmede kalem kalem netleşir." },
  { title: "Anahtar teslim", text: "Ruhsat hariç tüm süreçleri biz yönetiriz; siz yalnızca karar verirsiniz." },
];

// İç mimarlık hizmet kapsamı (önceki sitedeki iç mimarlık sayfasından)
export const INTERIOR_SCOPE = [
  { title: "Konsept tasarım", text: "İhtiyaçlarınıza ve yaşam tarzınıza uygun özgün konsept tasarımları geliştiriyoruz.", features: ["Mood board", "Renk paleti", "Malzeme seçimi"] },
  { title: "Teknik proje", text: "Uygulamaya hazır, detaylı teknik çizimler ve 3D görselleştirmeler hazırlıyoruz.", features: ["AutoCAD çizimler", "3D modelleme", "Detay projeleri"] },
  { title: "Anahtar teslim uygulama", text: "Tasarımı gerçeğe dönüştürüyoruz; tüm uygulama sürecini tek ekiple yönetiyoruz.", features: ["İnşaat yönetimi", "Mobilya montajı", "Dekorasyon"] },
];

const landingsTr: Record<string, Landing> = {
  "/fuar-standi/": {
    kicker: "Fuar Standı",
    h1: "Fuar Standı",
    title: "Fuar standınız, markanızın en güçlü sahnesi.",
    lead: "Yurt içi ve yurt dışı fuarlarda standınızı tasarlıyor, kendi atölyemizde üretiyor, nakliye ve kurulumuyla anahtar teslim yönetiyoruz.",
    heroImages: [
      "/images/projects/electrip-intersolar.webp",
      "/images/projects/kardemir-metal-expo.webp",
      "/images/projects/dubai-fuarstandi.webp",
      "/wp-content/uploads/2025/07/Huzurplastik-Plasteurasia24-Fuarstandi-Wawainteriors.jpg",
    ],
    highlights: [
      { title: "Özgün tasarım", text: "Kurumsal kimliğinize ve hedef kitlenize göre size özel stand konsepti." },
      { title: "Kendi üretimimiz", text: "Ahşap ve modüler stand elemanları kendi atölyemizde üretilir." },
      { title: "Yurt içi ve yurt dışı", text: "İstanbul'dan Avrupa, Amerika ve Ortadoğu'daki fuarlara kurulum." },
      { title: "Zamanında teslim", text: "Lojistik, kurulum ve söküm tek elden, fuar takvimine göre planlanır." },
    ],
    intro: {
      title: "Bir organizasyon değil, uzun soluklu bir marka dostluğu.",
      text: "Fuar standınızın kalitesi ve prestiji bizi de temsil eder. Kurumsal renklerinizi, markanızı ve hedef kitlenizi analiz ederek size özel kreatif bir stand tasarlıyor; tasarımdan üretime, lojistikten kuruluma kadar her ölçekte projeyi anahtar teslim yönetiyoruz.",
    },
    offeringsTitle: "Stand türleri",
    offerings: [
      {
        title: "Özel tasarım ahşap stand",
        text: "Tamamen kişiselleştirilmiş, detayların ön planda olduğu standlar. Markanızı en iyi şekilde yansıtmak ve benzersiz bir görsel etki yaratmak istediğiniz fuarlar için.",
        image: "/wp-content/uploads/2025/07/Huzurplastik-Plasteurasia24-Fuarstandi-Wawainteriors-2.jpg",
      },
      {
        title: "Modüler (Maxima) stand",
        text: "Hızlı kurulup sökülebilen, tekrar kullanılabilen modüler sistem. Sık fuara katılan ve maliyeti kontrol etmek isteyen markalar için.",
        image: "/wp-content/uploads/2024/08/tatko-maximastand-1.webp",
        href: "/maxima-stand/",
      },
      {
        title: "Kongre standı",
        text: "Tıp, ilaç, finans ve teknoloji gibi bilgi yoğun sektörlerde, kompakt alanda prestijli ve profesyonel bir izlenim için.",
        image: "/wp-content/uploads/2024/07/mexc-kongrestand-1.webp",
        href: "/service/kongre-stand-tasarimi/",
      },
      {
        title: "AVM ve pop-up stand",
        text: "Yüksek yaya trafiğinde dikkat çeken, taşınabilir ve tekrar kurulabilen satış ve deneyim alanları.",
        image: "/wp-content/uploads/2024/08/alanya-magazatasarim-1.webp",
      },
    ],
    projectCategories: ["/portfolio-category/fuar-stand-tasarimi/"],
    processTitle: "Fuar standı nasıl hazırlanır?",
    process: STAND_PROCESS,
    blocks: [
      {
        title: "Sektörünüze göre stand",
        lead: "Her sektörün ziyaretçi beklentisi ve teşhir ihtiyacı farklıdır. Standın kurgusunu sektörünüze göre uyarlıyoruz.",
        items: [
          { title: "Enerji ve yenilenebilir enerji", text: "Büyük ekipman teşhirine uygun açık planlar, sürdürülebilir malzemeler ve teknolojik vurgular." },
          { title: "Gıda ve içecek", text: "Hijyenik teşhir üniteleri, tadım ve ikram alanları, sıcak ve davetkâr bir atmosfer." },
          { title: "Tekstil ve hazır giyim", text: "Koleksiyon sunumuna uygun askı ve vitrin sistemleri, güçlü aydınlatma." },
          { title: "Otomotiv ve makine", text: "Ağır ürünleri taşıyabilen zemin çözümleri ve ürün odaklı, dramatik aydınlatma." },
        ],
      },
      {
        title: "Stand bütçesini ne belirler?",
        lead: "Fuar standı fiyatı tek bir kalemle açıklanamaz; toplam maliyet birkaç değişkenin bileşimidir.",
        items: [
          { title: "Metrekare ve stand tipi", text: "Ada, yarımada, köşe veya sıra stand; açık cephe sayısı maliyeti belirler." },
          { title: "Malzeme ve işçilik", text: "Tamamen özel ahşap üretim ile modüler sistem arasında ciddi fark vardır." },
          { title: "Teknoloji ve aydınlatma", text: "LED, ekran ve interaktif üniteler bütçeyi artırır ama etkiyi yükseltir." },
          { title: "Lojistik ve kurulum", text: "Özellikle yurt dışı katılımlarda nakliye ve montaj önemli bir kalemdir." },
        ],
      },
    ],
    showReach: true,
    showBrands: true,
  },

  "/service/kongre-stand-tasarimi/": {
    kicker: "Kongre Standı",
    title: "Kompakt alanda prestijli bir sunum.",
    lead: "Tıp, ilaç, finans ve teknoloji kongreleri için hızlı kurulan, içerik aktarımını ve birebir görüşmeyi öne alan standlar tasarlayıp kuruyoruz.",
    heroImages: ["/wp-content/uploads/2024/07/mexc-kongrestand-1.webp", "/wp-content/uploads/2024/08/zes-euf-fuarstandi-1.webp"],
    highlights: [
      { title: "Kompakt ve etkili", text: "Sınırlı metrekarede profesyonel bir izlenim." },
      { title: "Hızlı kurulum", text: "Kısa kongre takvimine uygun modüler sistemler." },
      { title: "Ekran ve ışık", text: "Sunum ve içerik aktarımı için entegre ekran ve aydınlatma." },
      { title: "Görüşme alanı", text: "Ziyaretçiyle birebir görüşme için oturma düzeni." },
    ],
    intro: {
      title: "Bilgi yoğun sektörler için kısa, etkili sunumlar.",
      text: "Kongre standları, kısa süreli ama yüksek etkili sunumlar için tasarlanır. Aydınlatma, ekran entegrasyonu ve oturma alanları ziyaretçiyle birebir görüşmeyi ve içerik aktarımını önceleyecek şekilde kurgulanır.",
    },
    projectCategories: ["/portfolio-category/fuar-stand-tasarimi/"],
    processTitle: "Kongre standı nasıl hazırlanır?",
    process: STAND_PROCESS,
    showBrands: true,
  },

  "/maxima-stand/": {
    kicker: "Maxima Stand",
    title: "Tekrar tekrar kurulan modüler stand.",
    lead: "Maxima modüler sistemle hızlı kurulan, sökülüp yeniden kullanılabilen, farklı metrekarelere uyarlanabilen fuar standları.",
    heroImages: ["/wp-content/uploads/2024/08/tatko-maximastand-1.webp"],
    highlights: [
      { title: "Tekrar kullanılabilir", text: "Aynı sistem farklı fuarlarda yeniden kurulur." },
      { title: "Hızlı kurulum", text: "Modüler elemanlarla kısa sürede kurulum ve söküm." },
      { title: "Uyarlanabilir", text: "Farklı metrekare ve stand tiplerine göre yeniden düzenlenir." },
      { title: "Bütçe kontrolü", text: "Sık fuara katılan markalar için maliyet avantajı." },
    ],
    intro: {
      title: "Sık fuara katılan markalar için akılcı bir sistem.",
      text: "Maxima modüler stand, özel tasarım ahşap standın görsel etkisini tekrar kullanılabilir bir sistemle birleştirir. Grafikler ve ürün teşhir üniteleri her fuarda markanıza göre yenilenir.",
    },
    projectCategories: ["/portfolio-category/maxima-stand/"],
    processTitle: "Maxima stand nasıl hazırlanır?",
    process: STAND_PROCESS,
    showBrands: true,
  },

  "/ic-mimarlik-hizmeti/": {
    kicker: "İç Mimarlık",
    h1: "İç Mimarlık",
    title: "Mekânınıza kimlik kazandıran iç mimarlık.",
    lead: "Konut, mağaza, klinik, cafe ve ofis projelerinde tasarımı, özel mobilya üretimini ve uygulamayı tek ekiple, anahtar teslim yürütüyoruz.",
    heroImages: ["/images/hero/halide-akinci-klinik.webp", "/images/hero/acarkent-villa.webp", "/images/hero/instreet-havalimani.webp", "/images/hero/caddebostan-konut.webp", "/images/hero/fulya-klinik.webp"],
    highlights: INTERIOR_HIGHLIGHTS,
    intro: {
      title: "Tasarım, üretim ve uygulama tek çatı altında.",
      text: "Mekânı yerinde inceliyor, ihtiyaç programını birlikte netleştiriyoruz. Yerleşim, malzeme ve ışık kurgusu 3D görsellerle karara bağlanır; mobilya ve sabit donatı kendi atölyemizde üretilir, inşaat ve montaj sahada tek ekiple yürür.",
    },
    projectCategories: [
      "/portfolio-category/konut-villa/",
      "/portfolio-category/magaza-tasarim/",
      "/portfolio-category/klinik-tasarim/",
      "/portfolio-category/cafe-restoran-tasarim/",
      "/portfolio-category/ofis-tasarimi/",
    ],
    processTitle: "İç mimarlık projesi nasıl ilerler?",
    process: INTERIOR_PROCESS,
    scope: INTERIOR_SCOPE,
    showBrands: true,
  },
  "/konut-villa-tasarim/": {
    kicker: "Konut & Villa",
    title: "Yaşadığınız hayata göre tasarlanmış bir ev.",
    lead: "Konut ve villa projelerinde yerleşimden malzemeye, özel mobilyadan uygulamaya kadar tüm süreci tek ekiple yürütüyoruz.",
    heroImages: ["/images/hero/acarkent-villa.webp", "/images/hero/caddebostan-konut.webp", "/images/projects/acarkent-villa-tasarimi.webp"],
    highlights: INTERIOR_HIGHLIGHTS,
    intro: {
      title: "Yerleşim, ışık ve malzeme aynı masada.",
      text: "Evin yerleşimi, aile bireylerinin gün içindeki hareketine ve yaşam alışkanlıklarına göre kurgulanır. Malzeme ve özel mobilyalar tasarım aşamasında birlikte planlanır; uygulama sırasında sürpriz kalmaz.",
    },
    projectCategories: ["/portfolio-category/konut-villa/"],
    process: INTERIOR_PROCESS,
    scope: INTERIOR_SCOPE,
    showBrands: true,
  },
  "/service/magaza-tasarimi/": {
    kicker: "Mağaza Tasarımı",
    title: "Ürünü öne çıkaran, satışı destekleyen mağazalar.",
    lead: "Cadde ve AVM mağazalarında marka kimliğini mekâna taşıyor, teşhir ünitelerini kendi atölyemizde üretiyoruz.",
    heroImages: ["/images/hero/instreet-havalimani.webp", "/images/projects/golden-rose-bursa.webp"],
    highlights: INTERIOR_HIGHLIGHTS,
    intro: {
      title: "Müşterinin dolaşımı, ürünün görünürlüğü.",
      text: "Mağazanın girişinden kasasına kadar müşterinin yolu, ürün grupları ve aydınlatma birlikte kurgulanır. Raf, vitrin ve teşhir üniteleri ölçüye özel üretilir.",
    },
    projectCategories: ["/portfolio-category/magaza-tasarim/"],
    projectPaths: ["/portfolio/golden-rose-bursa/", "/portfolio/golden-rose-akbati/", "/portfolio/golden-rose-yekta-avm/"],
    process: INTERIOR_PROCESS,
    scope: INTERIOR_SCOPE,
    showBrands: true,
  },
  "/service/klinik-tasarimi/": {
    kicker: "Klinik Tasarımı",
    title: "Hasta için sakin, ekip için verimli klinikler.",
    lead: "Klinik ve diş kliniği projelerinde hasta konforunu, hijyeni ve personel akışını birlikte ele alıp anahtar teslim uyguluyoruz.",
    heroImages: ["/images/hero/halide-akinci-klinik.webp", "/images/hero/fulya-klinik.webp"],
    highlights: INTERIOR_HIGHLIGHTS,
    intro: {
      title: "Hasta ve personelin mekânı nasıl kullanacağı.",
      text: "İhtiyaç analizi, konsept, mekânsal planlama, malzeme ve renk seçimi, teknik çizimler ve uygulama aşamalarını planlıyoruz. Hasta konforu, hijyen, güvenlik ve kullanım kolaylığı tasarımın temel konularıdır.",
    },
    projectCategories: ["/portfolio-category/klinik-tasarim/"],
    process: INTERIOR_PROCESS,
    scope: INTERIOR_SCOPE,
    showBrands: true,
  },
  "/cafe-dekorasyon/": {
    kicker: "Cafe & Restoran",
    title: "Misafirin geri dönmek istediği mekânlar.",
    lead: "Cafe ve restoran projelerinde atmosferi, servis akışını ve mutfak bağlantılarını birlikte tasarlayıp uyguluyoruz.",
    heroImages: ["/images/projects/gurme-restoran.webp"],
    highlights: INTERIOR_HIGHLIGHTS,
    intro: {
      title: "Atmosfer ve işleyiş birlikte.",
      text: "Oturma düzeni, servis akışı, bar ve mutfak bağlantıları ile aydınlatma ve akustik birlikte kurgulanır. Sabit donatı ve mobilyalar kendi atölyemizde üretilir.",
    },
    projectCategories: ["/portfolio-category/cafe-restoran-tasarim/"],
    process: INTERIOR_PROCESS,
    scope: INTERIOR_SCOPE,
    showBrands: true,
  },
  "/ofis-tasarimi-ve-uygulama/": {
    kicker: "Ofis Tasarımı",
    title: "Ekibin verimli çalıştığı ofisler.",
    lead: "Açık ofis, toplantı ve odak alanlarını şirketinizin çalışma biçimine göre tasarlayıp, çalışırken bile etaplı uygulayabiliyoruz.",
    heroImages: ["/images/projects/acik-ofis-tasarimlari.webp"],
    highlights: INTERIOR_HIGHLIGHTS,
    intro: {
      title: "Çalışma biçiminize göre bir plan.",
      text: "Açık çalışma alanları, toplantı odaları, odak alanları ve sosyal alanlar ekibin gün içindeki ihtiyacına göre planlanır. Ofis çalışırken yenileme gerekiyorsa işler etaplara bölünür.",
    },
    projectCategories: ["/portfolio-category/ofis-tasarimi/"],
    process: INTERIOR_PROCESS,
    scope: INTERIOR_SCOPE,
    showBrands: true,
  },
};

// İngilizce ve Almanca hizmet sayfaları landings-intl.ts içinde
export const landings: Record<string, Landing> = { ...landingsTr, ...landingsIntl };

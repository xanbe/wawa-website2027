// Sektörel iç mimari sayfaları (TR). Her sektörün kendine özgü ihtiyaçları anlatılır;
// WAWA'ya dair yalnızca eski sitede de yazan gerçekler kullanılır (kendi atölyesi, ruhsat hariç anahtar teslim).
import type { ExtraPage } from "./extra-pages";
import { sectorPagesIntl } from "./extra-intl";

const WORKSHOP =
  "Tasarım ve teknik çizimleri kendi bünyemizde hazırlıyor; inşaat, mobilya üretimi ve uygulamayı tek elden yönetiyoruz. Mobilya ve sabit donatı kendi atölyemizde üretilir, sahada monte edilir.";

const sectorPagesTr: ExtraPage[] = [
  {
    key: "sector",
    path: "/kuyumcu-ic-mimari/",
    lang: "tr",
    title: "Kuyumcu İç Mimarisi",
    lead: "Ürünü öne çıkaran ışık, güven veren düzen ve markaya özel vitrinler: kuyumcu mağazalarını tasarlayıp kendi atölyemizde üretiyoruz.",
    image: "/images/projects/dila-exclusive.jpg",
    sections: [
      {
        h: "Işık ürünü taşır",
        p: "Kuyumculukta ışık, tasarımın merkezindedir. Altının sıcaklığını, pırlantanın parıltısını ve gümüşün soğuk tonunu ayrı ayrı ele alan bir aydınlatma kurgusu kurar; vitrin içi, tezgâh ve genel aydınlatmayı birbirini bastırmayacak şekilde dengeleriz.",
      },
      {
        h: "Vitrin ve tezgâh, mağazanın kalbi",
        p: "Vitrinler, satış tezgâhları ve ürün sergileme üniteleri ölçüye özel üretilir. Malzeme, cam ve kilit detayları tasarım aşamasında çözülür; üniteler atölyemizde hazırlanıp sahada monte edilir.",
      },
      {
        h: "Güven duygusu ve akış",
        p: "Müşterinin rahatça bakabildiği, satış danışmanının ürünü güvenle sunabildiği bir yerleşim planlarız. Giriş, bekleme, özel görüşme alanı ve kasa arasındaki akış, mağazanın günlük işleyişine göre kurgulanır.",
      },
    ],
    points: ["Vitrin ve sergileme üniteleri", "Ürüne göre aydınlatma kurgusu", "Satış tezgâhı ve özel görüşme alanı", "Kuyum fuarı standları"],
    projectPaths: ["/portfolio/dila-exclusive/", "/portfolio/midas/", "/portfolio/midas-2024/"],
    faq: [
      {
        q: "Kuyumcu mağazası tasarımında en önemli konu nedir?",
        a: "Ürünün doğru ışıkta görünmesi ve müşterinin kendini güvende hissetmesidir. Aydınlatma, vitrin yerleşimi ve satış alanı birlikte planlanır.",
      },
      {
        q: "Vitrin ve tezgâhları siz mi üretiyorsunuz?",
        a: "Evet. Vitrinler, tezgâhlar ve sergileme üniteleri kendi atölyemizde projeye özel üretilir ve sahada monte edilir.",
      },
      {
        q: "Kuyum fuarları için de stand tasarlıyor musunuz?",
        a: "Evet. Kuyum fuarları için stand tasarımını, üretimini ve kurulumunu da üstleniyoruz.",
      },
    ],
    seo: {
      title: "Kuyumcu İç Mimarisi ve Mağaza Tasarımı | WAWA Interiors",
      description:
        "Kuyumcu mağazaları için iç mimari: ürüne göre aydınlatma, ölçüye özel vitrin ve tezgâhlar, güven veren yerleşim. Tasarım, üretim ve uygulama tek elden.",
    },
  },
  {
    key: "sector",
    path: "/dis-klinigi-ic-mimari/",
    lang: "tr",
    title: "Diş Kliniği Tasarımı",
    lead: "Hasta için sakin, ekip için verimli bir klinik. Ünit yerleşiminden sterilizasyon akışına kadar diş kliniklerini tasarlayıp uyguluyoruz.",
    image: "/images/hero/halide-akinci-klinik.webp",
    sections: [
      {
        h: "Hasta konforu ve güven",
        p: "Bekleme alanından tedavi odasına kadar hastanın gördüğü, duyduğu ve hissettiği her şeyi ele alırız. Malzeme, renk ve ışık kararları kaygıyı azaltan sakin bir atmosfer için birlikte verilir.",
      },
      {
        h: "Ünit, sterilizasyon ve personel akışı",
        p: "Diş kliniğinde üniteler, hekim ve yardımcı personelin hareket alanı, aydınlatma ve temizlik süreçleri birlikte ele alınır. Cihaz bağlantıları ve tesisat noktaları üreticinin teknik bilgileriyle, kullanım düzeni ise sağlık ekibiyle netleştirilir.",
      },
      {
        h: "Hijyen ve kolay temizlik",
        p: "Yüzeyler, birleşim detayları ve dolaplar kolay temizlenecek şekilde seçilir. Depolama ve malzeme erişimi, tedavi sırasında hekimin işini kolaylaştıracak biçimde planlanır.",
      },
    ],
    points: ["Bekleme ve resepsiyon", "Tedavi odası ve ünit yerleşimi", "Sterilizasyon ve depolama", "Elektrik ve tesisat koordinasyonu"],
    projectPaths: ["/portfolio/halide-akinci-klinik-tasarim/", "/portfolio/fulya-klinik-tasarim/"],
    faq: [
      {
        q: "Ruhsat işlemleri kapsamda mı?",
        a: "Hayır. Anahtar teslim projelerde ruhsat hariç tüm süreçleri biz yönetiyoruz; ruhsat süreci kliniğin kendi sorumluluğundadır.",
      },
      {
        q: "Cihaz yerleşimini nasıl planlıyorsunuz?",
        a: "Ünit ve cihazların bağlantı noktalarını üreticinin teknik bilgileriyle, kullanım düzenini ise sağlık ekibiyle birlikte netleştiriyoruz.",
      },
      {
        q: "Mevcut bir kliniği yenileyebilir misiniz?",
        a: "Evet. Mevcut mekânın ölçü ve tesisatını inceleyip yenileme kapsamını keşif sonrasında birlikte belirliyoruz.",
      },
    ],
    seo: {
      title: "Diş Kliniği Tasarımı ve İç Mimarisi | Wawa Interiors",
      description:
        "Diş kliniği tasarımı: hasta konforu, ünit yerleşimi, sterilizasyon ve personel akışı. Tasarımdan uygulamaya, ruhsat hariç anahtar teslim diş kliniği iç mimarisi.",
    },
  },
  {
    key: "sector",
    path: "/eczane-ic-mimari/",
    lang: "tr",
    title: "Eczane İç Mimarisi",
    lead: "Raf düzeni, tezgâh ve depo akışı doğru kurulmuş, müşterinin aradığını kolayca bulduğu eczaneler tasarlayıp uyguluyoruz.",
    image: "/images/process/konsept.webp",
    sections: [
      {
        h: "Raf düzeni ve görünürlük",
        p: "Reçeteli ve reçetesiz ürünler, dermokozmetik ve kişisel bakım bölümleri müşterinin rahatça dolaşabileceği bir düzende planlanır. Raf yükseklikleri, etiket alanları ve aydınlatma ürünlerin kolay bulunmasına göre belirlenir.",
      },
      {
        h: "Tezgâh ve arka alan",
        p: "Satış tezgâhı, danışma noktası ve arka depo arasındaki akış eczacının gün içindeki hareketine göre kurgulanır. Çekmeceli dolaplar ve depolama üniteleri ölçüye özel üretilir.",
      },
      {
        h: "Sade ve güven veren bir mekân",
        p: "Temiz, düzenli ve aydınlık bir iç mekân sağlık alanında güven duygusunu destekler. Malzemeler dayanıklı ve kolay temizlenen seçeneklerden seçilir.",
      },
    ],
    points: ["Raf ve teşhir sistemleri", "Satış tezgâhı ve danışma noktası", "Depo ve çekmeceli dolaplar", "Aydınlatma ve cephe"],
    projectCategories: ["/portfolio-category/magaza-tasarim/", "/portfolio-category/klinik-tasarim/"],
    faq: [
      {
        q: "Raf ve dolapları siz mi üretiyorsunuz?",
        a: "Evet. Raf sistemleri, tezgâh ve depolama üniteleri kendi atölyemizde ölçüye özel üretilir ve sahada monte edilir.",
      },
      {
        q: "Eczane çalışırken yenileme yapılabilir mi?",
        a: "Kapsama göre işleri etaplara bölerek planlayabiliyoruz. Uygulama takvimini keşif sonrasında birlikte netleştiriyoruz.",
      },
    ],
    seo: {
      title: "Eczane İç Mimarisi ve Eczane Tasarımı | WAWA Interiors",
      description:
        "Eczaneler için iç mimari: raf ve teşhir düzeni, satış tezgâhı, depo akışı ve aydınlatma. Ölçüye özel üretim ve uygulama tek elden.",
    },
  },
  {
    key: "sector",
    path: "/guzellik-salonu-ic-mimari/",
    lang: "tr",
    title: "Güzellik Salonu İç Mimarisi",
    lead: "Bakım odalarından bekleme alanına, misafirin kendini iyi hissettiği güzellik ve estetik salonları tasarlıyoruz.",
    image: "/images/hero/fulya-klinik.webp",
    sections: [
      {
        h: "İlk izlenim ve bekleme",
        p: "Giriş ve resepsiyon salonun karakterini belirler. Misafirin rahat ettiği, markanın kimliğini taşıyan bir karşılama alanı tasarlarız.",
      },
      {
        h: "Bakım odaları ve mahremiyet",
        p: "Bakım ve uygulama odaları mahremiyet, ses ve ışık açısından ayrı ayrı ele alınır. Cihaz ve tesisat noktaları kullanım düzenine göre planlanır.",
      },
      {
        h: "Hijyen ve dayanıklı malzemeler",
        p: "Sık temizlenen yüzeyler için dayanıklı malzemeler seçilir; depolama ve ürün sergileme üniteleri ölçüye özel üretilir.",
      },
    ],
    points: ["Resepsiyon ve bekleme", "Bakım ve uygulama odaları", "Ürün sergileme ve depolama", "Aydınlatma ve akustik"],
    projectCategories: ["/portfolio-category/klinik-tasarim/", "/portfolio-category/magaza-tasarim/"],
    seo: {
      title: "Güzellik Salonu ve Estetik Merkezi İç Mimarisi | WAWA Interiors",
      description:
        "Güzellik salonları ve estetik merkezleri için iç mimari: karşılama, bakım odaları, mahremiyet ve hijyen. Tasarımdan uygulamaya tek ekip.",
    },
  },
  {
    key: "sector",
    path: "/showroom-ic-mimari/",
    lang: "tr",
    title: "Showroom İç Mimarisi",
    lead: "Ürünü bir hikâyenin parçası olarak sunan showroomlar: marka kimliğini mekâna taşıyıp kendi atölyemizde üretiyoruz.",
    image: "/images/hero/instreet-havalimani.webp",
    sections: [
      {
        h: "Ürün hikâyesi",
        p: "Showroom, ürünü bir rafta değil bir sahnede gösterir. Ürün gruplarını, ziyaretçinin dolaşma sırasını ve vurgulanacak noktaları markayla birlikte belirleriz.",
      },
      {
        h: "Esnek sergileme",
        p: "Koleksiyon değiştikçe yeniden düzenlenebilen sergileme sistemleri tasarlarız. Teşhir üniteleri ve sabit donatı atölyemizde üretilir.",
      },
      {
        h: "Fuar deneyimiyle",
        p: "Fuar standlarında edindiğimiz deneyim, kalıcı mekânlarda da ürünü öne çıkaran sergileme çözümlerine yansır.",
      },
    ],
    points: ["Marka kimliğine uygun konsept", "Esnek teşhir sistemleri", "Aydınlatma ve vitrin", "Toplantı ve sunum alanı"],
    projectCategories: ["/portfolio-category/magaza-tasarim/", "/portfolio-category/ofis-tasarimi/"],
    seo: {
      title: "Showroom İç Mimarisi ve Tasarımı | WAWA Interiors",
      description:
        "Showroomlar için iç mimari: marka kimliğine uygun konsept, esnek teşhir sistemleri ve aydınlatma. Tasarım, üretim ve uygulama tek elden.",
    },
  },
];

// İngilizce ve Almanca sürümleri extra-intl.ts içinde
export const sectorPages: ExtraPage[] = [...sectorPagesTr, ...sectorPagesIntl];

export const SECTOR_WORKSHOP_NOTE = WORKSHOP;

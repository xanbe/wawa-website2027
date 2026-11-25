// İç mimarlık fiyat rehberi (/ic-mimarlik-fiyatlari/). Şimdilik rakam verilmez: bütçenin nasıl oluştuğu,
// fiyatı belirleyen kalemler ve teklif öncesi hazırlık anlatılır. Tasarım bedeli /butce-planlama/ aracıyla hesaplanır.
export const INTERIOR_PRICES_PATH = "/ic-mimarlik-fiyatlari/";
export const INTERIOR_PRICE_YEAR = 2027;

export const COST_PARTS = [
  {
    title: "Tasarım bedeli",
    text: "Rölöve, konsept, 3D görseller, teknik ve uygulama projeleri. Mekânın türüne ve alanına göre hesaplanır; uygulamayı kimin yapacağından bağımsızdır.",
    cta: { label: "Tasarım bedelinizi hesaplayın", href: "/butce-planlama/" },
  },
  {
    title: "Uygulama bedeli",
    text: "İnşaat ve tadilat işleri, malzeme, tesisat, özel mobilya üretimi, montaj ve işçilik. Keşif ve proje sonrasında kalem kalem, yazılı olarak teklif edilir.",
    cta: { label: "Uygulama teklifi isteyin", href: "/teklif-al/?tur=ic-mimarlik" },
  },
];

export const WORK_MODES = [
  { title: "Yalnızca tasarım", text: "Konsept, 3D görseller ve uygulamaya hazır teknik proje. Uygulamayı kendi ekibinizle yaparsınız.", items: ["Rölöve ve ihtiyaç programı", "Konsept ve 3D görseller", "Teknik ve detay çizimler", "Mahal listesi ve metraj"] },
  { title: "Tasarım ve uygulama", text: "Anahtar teslim. Tasarım, üretim ve uygulama tek ekipte; tek muhatap, tek takvim.", items: ["Tasarımın tüm aşamaları", "İnşaat ve tesisat işleri", "Atölyemizde özel mobilya", "Kontrol ve teslim"] },
  { title: "Yalnızca uygulama", text: "Hazır projenizi uygularız. Proje gözden geçirilir, eksik detaylar tamamlanır, iş programı çıkarılır.", items: ["Proje kontrolü", "Metraj ve iş programı", "İnşaat ve montaj", "Saha yönetimi"] },
];

export const INTERIOR_PRICE_FACTORS = [
  { title: "Alan", text: "Metrekare arttıkça toplam bütçe artar; birim maliyet ise büyük alanlarda genellikle düşer." },
  { title: "Mekânın durumu", text: "Kaba inşaat, boş mekân ya da kullanılan bir mekânın yenilenmesi; söküm ve hazırlık işleri bütçeyi değiştirir." },
  { title: "Malzeme sınıfı", text: "Zemin, duvar ve tavan kaplamalarında seçilen malzeme ve markalar en büyük farkı yaratan kalemdir." },
  { title: "Özel mobilya oranı", text: "Ölçüye özel üretilen mobilya ve sabit donatı arttıkça işçilik ve üretim payı büyür." },
  { title: "Tesisat", text: "Elektrik, aydınlatma, mekanik ve iklimlendirme işlerinin kapsamı; mevcut tesisatın ne kadarının kullanılabileceği." },
  { title: "Takvim", text: "Kısa teslim süresi, gece ya da hafta sonu çalışma, işletme açıkken etaplı uygulama ek planlama gerektirir." },
  { title: "Konum", text: "İstanbul dışı ve yurt dışı projelerde nakliye, konaklama ve saha organizasyonu bütçeye eklenir." },
  { title: "Kurallar ve onaylar", text: "AVM teknik şartnameleri, site yönetimi kuralları ya da sektöre özel gereklilikler (ör. klinikler) kapsamı etkiler." },
];

export const SPACE_COSTS = [
  { title: "Konut ve villa", href: "/konut-villa-tasarim/", items: ["Islak hacimler ve mutfak", "Özel mobilya ve dolaplar", "Aydınlatma ve akıllı ev sistemleri"] },
  { title: "Mağaza", href: "/service/magaza-tasarimi/", items: ["Vitrin ve teşhir üniteleri", "Marka standartları", "AVM şartnamesi ve gece çalışma"] },
  { title: "Klinik", href: "/service/klinik-tasarimi/", items: ["Medikal tesisat ve hijyenik yüzeyler", "Sterilizasyon ve bekleme alanları", "Sektöre özel gereklilikler"] },
  { title: "Cafe ve restoran", href: "/cafe-dekorasyon/", items: ["Endüstriyel mutfak ve havalandırma", "Akustik ve aydınlatma", "Oturma düzeni ve bar ünitesi"] },
  { title: "Ofis", href: "/ofis-tasarimi-ve-uygulama/", items: ["Data ve elektrik altyapısı", "Akustik ve toplantı odaları", "Çalışırken etaplı uygulama"] },
];

export const PREPARE = [
  "Mekânın planı ya da ölçüleri (yoksa keşifte biz alırız)",
  "Mevcut durumun fotoğrafları",
  "Beğendiğiniz mekânlardan referans görseller",
  "Hedef bütçe aralığınız",
  "Açılış ya da taşınma tarihiniz",
];

export const INTERIOR_PRICE_FAQ = [
  {
    q: "İç mimarlık fiyatı metrekareye göre mi belirlenir?",
    a: "Tasarım bedeli büyük ölçüde mekânın türü ve alanına göre hesaplanır. Uygulama bedeli ise metrekareden çok malzeme, tesisat ve özel mobilya kapsamına bağlıdır; bu yüzden keşif sonrası kalem kalem teklif edilir.",
  },
  {
    q: "Yalnızca tasarım hizmeti alabilir miyim?",
    a: "Evet. Konsept, 3D görseller ve uygulamaya hazır teknik projeyi teslim ederiz; uygulamayı kendi ekibinizle yapabilirsiniz. Dilerseniz uygulama aşamasında kontrollük de veririz.",
  },
  {
    q: "Teklif ücretsiz mi?",
    a: "Evet. Mekân bilgilerinizi paylaştığınızda kapsamı netleştirir, ücretsiz teklif hazırlarız.",
  },
  {
    q: "Bütçem belli, ona göre tasarım yapılabilir mi?",
    a: "Evet. Hedef bütçenizi baştan paylaşırsanız malzeme ve mobilya kararlarını bu aralığa göre veririz; alternatifleri karşılaştırmalı sunarız.",
  },
];

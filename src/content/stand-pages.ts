// Fuar standı grubuna eklenen yeni sayfalar (TR; İngilizce ve Almanca sürümleri extra-intl.ts içinde).
// AVM Standı: eski sitedeki AVM standı projeleri ve AVM blog yazılarındaki ifadelere dayanır.
// Plus Stand: Maxima modüler sistemin büyük ölçekli sürümü olarak anlatılır. Sayı ve teknik ölçü verilmez.
import type { ExtraPage } from "./extra-pages";
import { standPagesIntl } from "./extra-intl";

const standPagesTr: ExtraPage[] = [
  {
    key: "stand",
    path: "/plus-stand/",
    lang: "tr",
    title: "Plus Stand",
    lead: "Maxima modüler sistemin büyük ölçekli sürümü: geniş metrekareli fuar standlarında modüler sistemin pratikliğini, özel tasarım standın etkisiyle birleştiriyoruz.",
    image: "/wp-content/uploads/2024/08/daly-maximastand-1.webp",
    points: ["Büyük metrekare", "Modüler iskelet", "Tekrar kullanılabilir", "Markaya özel üretim"],
    sections: [
      {
        h: "Büyük standlar için modüler sistem.",
        p: "Plus Stand, Maxima modüler sistemin daha geniş metrekareli standlar için kurgulanmış sürümüdür. Karşılama, toplantı ve ürün teşhir alanları aynı sistem içinde çözülür; kurulum ve söküm planlı ve hızlı ilerler.",
      },
      {
        h: "Tekrar kullanılabilir yapı",
        p: "Sistem elemanları fuardan fuara yeniden kurulur. Grafikler, teşhir üniteleri ve yerleşim her katılımda markanıza ve stand alanına göre yeniden düzenlenir.",
      },
      {
        h: "Özel üretimle tamamlanan görünüm",
        p: "Karşılama bankoları, raflar ve vitrinler kendi atölyemizde üretilir; modüler yapıya markanıza özel detaylar eklenir.",
      },
      {
        h: "Tasarımdan kuruluma tek ekip",
        p: "Konsept, 3D tasarım, teknik onay, üretim, lojistik ve kurulum tek elden yönetilir; yurt içi ve yurt dışı fuarlarda aynı ekip sahadadır.",
      },
    ],
    projectCategories: ["/portfolio-category/maxima-stand/"],
    faq: [
      {
        q: "Plus Stand ile Maxima Stand arasındaki fark nedir?",
        a: "İkisi de aynı modüler sisteme dayanır. Plus Stand daha geniş metrekareli ve daha kapsamlı stand kurguları için hazırlanır; Maxima daha kompakt standlarda hızlı ve ekonomik bir çözüm sunar.",
      },
      {
        q: "Plus Stand tekrar kullanılabilir mi?",
        a: "Evet. Sistem elemanları sonraki fuarlarda yeniden kurulur; grafikler ve teşhir üniteleri her katılımda yenilenebilir.",
      },
      {
        q: "Plus Stand fiyatı neye göre belirlenir?",
        a: "Metrekare, açık cephe sayısı, özel üretim ünitelerin kapsamı, grafik ve aydınlatma ile fuarın yeri toplam maliyeti belirler. Fuar bilgilerinizi paylaştığınızda teklif hazırlıyoruz.",
      },
    ],
    seo: {
      title: "Plus Stand | Büyük Ölçekli Modüler Fuar Standı | WAWA Interiors",
      description: "Maxima modüler sistemin büyük ölçekli sürümü Plus Stand: geniş metrekareli, tekrar kullanılabilir ve markaya özel üretimle tamamlanan fuar standları.",
    },
  },
  {
    key: "stand",
    path: "/avm-standi/",
    lang: "tr",
    title: "AVM Standı",
    lead: "Alışveriş merkezlerinde markanızı öne çıkaran, uzun süre kullanılan AVM standları ve kiosklar tasarlayıp kendi atölyemizde üretiyoruz.",
    image: "/wp-content/uploads/2024/07/golden-rose-bursa-3.webp",
    points: ["Uzun süreli kullanım", "Ürün odaklı tasarım", "Kendi atölyemizde üretim", "Kurulum ve montaj"],
    sections: [
      {
        h: "Küçük alanda güçlü bir mağaza.",
        p: "AVM standı, diğer adıyla kiosk, alışveriş merkezinin meydan ve orta alanlarında markanızın yüzü olur. Montajdan sonra mini bir mağaza gibi kullanılır; ürünler kolay erişilebilir şekilde sergilenir ve ziyaretçi kısa sürede karar verir.",
      },
      {
        h: "Fuar standından farkı",
        p: "AVM standı da fuar standı da markayı hedef kitleyle buluşturur. Fark süresindedir: fuar standı kısa süreli etkinliklerde, AVM standı uzun süre kullanılır. Bu yüzden malzeme, dayanıklılık ve günlük kullanım kolaylığı tasarımın merkezindedir.",
      },
      {
        h: "Her yönden görünür tasarım",
        p: "Köşeli ya da köşesiz, mini bar görünümünde, etrafı açık ya da dört tarafı kapalı modeller tasarlanabilir. Marka renkleri, aydınlatma ve logonun konumu standın her yönden fark edilmesi için birlikte planlanır.",
      },
      {
        h: "Lansman standları",
        p: "Ürün lansmanları ve dönemsel kampanyalar için kısa süreli AVM standları da hazırlıyoruz; Gardrops Akasya AVM lansman standı bunlardan biridir.",
      },
    ],
    projectCategories: ["/portfolio-category/avm-standi/"],
    faq: [
      {
        q: "AVM standı fiyatları neye göre değişir?",
        a: "Fiyat; standın ölçülerine, sahip olacağı özelliklere ve tasarım detaylarına göre değişir. Malzeme, aydınlatma, teşhir üniteleri ve kurulum kapsamı netleştiğinde teklif hazırlıyoruz.",
      },
      {
        q: "AVM standı ile fuar standı arasındaki fark nedir?",
        a: "İkisi de markayı ve ürünleri öne çıkarır. AVM standları uzun süre kullanılırken fuar standları genellikle kısa süreli etkinliklerde tercih edilir.",
      },
      {
        q: "Hangi AVM standı modelleri yapılabilir?",
        a: "Köşeli ya da köşesiz, mini bar görünümünde, etrafı açık ya da dört tarafı kapalı modeller yapılabilir; müşteri talebine göre her türlü özel tasarım unsuru eklenebilir.",
      },
    ],
    seo: {
      title: "AVM Standı ve Kiosk Tasarımı | WAWA Interiors",
      description: "Alışveriş merkezleri için uzun süre kullanılan AVM standı ve kiosk tasarımı, kendi atölyemizde üretim ve montaj. Golden Rose ve Gardrops AVM standları.",
    },
  },
];

export const standPages: ExtraPage[] = [...standPagesTr, ...standPagesIntl];

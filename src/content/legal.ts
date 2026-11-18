// Gizlilik, çerez ve KVKK metinleri. Sitenin gerçekte işlediği verilere göre yazılmıştır:
// iletişim/teklif formu, bütçe hesaplayıcıda telefon doğrulaması (Netgsm), e-posta bildirimi (Resend),
// barındırma (Vercel), Google Haritalar ve YouTube gömmeleri. Sitenin kendi çerezi yoktur.
// Not: Yayından önce bir hukukçunun kontrol etmesi önerilir.
import type { Lang } from "@/lib/i18n";

export type LegalPage = {
  path: string;
  lang: Lang;
  title: string;
  updated: string;
  sections: { h: string; p: string[] }[];
  alternates: Partial<Record<Lang, string>>;
  seo: { title: string; description: string };
};

const CONTROLLER_TR = "WAWA Interiors — Maltepe Mh. Eski Çırpıcı Yolu, Nef12 D:22, Zeytinburnu, İstanbul — info@wawainteriors.com — 0 (212) 706 28 32";
const CONTROLLER_EN = "WAWA Interiors — Maltepe Mh. Eski Çırpıcı Yolu, Nef12 D:22, Zeytinburnu, Istanbul, Türkiye — info@wawainteriors.com — +90 212 706 28 32";

const PRIVACY_ALT = { tr: "/gizlilik-politikasi/", en: "/en/privacy-policy/", de: "/de/datenschutz/" };

export const legalPages: LegalPage[] = [
  {
    path: "/kvkk-aydinlatma-metni/",
    lang: "tr",
    title: "KVKK Aydınlatma Metni",
    updated: "Kasım 2026",
    alternates: { tr: "/kvkk-aydinlatma-metni/" },
    seo: {
      title: "KVKK Aydınlatma Metni | WAWA Interiors",
      description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında WAWA Interiors web sitesinde işlenen kişisel verilere ilişkin aydınlatma metni.",
    },
    sections: [
      {
        h: "Veri sorumlusu",
        p: [
          "Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (KVKK) 10. maddesi uyarınca, wawainteriors.com web sitesi üzerinden işlenen kişisel verileriniz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.",
          `Veri sorumlusu: ${CONTROLLER_TR}`,
        ],
      },
      {
        h: "İşlenen kişisel veriler",
        p: [
          "İletişim ve teklif formu: ad soyad, firma adı, telefon numarası, e-posta adresi, proje bilgileri (hizmet türü, alan, konum, tarih) ve mesajınız.",
          "Tasarım bütçesi hesaplayıcı: cep telefonu numaranız, seçtiğiniz mekân türü ve girdiğiniz alan bilgisi.",
          "Teknik veriler: güvenlik ve kötüye kullanımı önleme amacıyla IP adresi ve tarayıcı bilgileri sunucu kayıtlarında kısa süreli tutulur.",
        ],
      },
      {
        h: "İşleme amaçları",
        p: [
          "Talebinize yanıt vermek, teklif hazırlamak ve sizinle proje hakkında iletişime geçmek.",
          "Bütçe hesaplayıcıda telefon numaranızı doğrulamak ve hesap sonucunu ekibimize bildirmek.",
          "Web sitesinin güvenliğini sağlamak, spam ve kötüye kullanımı önlemek.",
        ],
      },
      {
        h: "Hukuki sebepler",
        p: [
          "Kişisel verileriniz KVKK'nın 5. maddesinin 2. fıkrasındaki; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (teklif ve iletişim talepleri) ve ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati (site güvenliği) hukuki sebeplerine dayanılarak işlenir.",
        ],
      },
      {
        h: "Aktarım",
        p: [
          "Telefon doğrulama kodu, SMS hizmet sağlayıcımız Netgsm aracılığıyla gönderilir.",
          "Form ve hesaplayıcı bildirimleri ekibimize e-posta hizmet sağlayıcısı Resend (ABD) aracılığıyla iletilir; web sitesi Vercel (ABD) altyapısında barındırılır. Bu hizmetler nedeniyle verileriniz yurt dışındaki sunuculara aktarılabilir. Yurt dışına aktarım, KVKK'nın 9. maddesine uygun olarak gerçekleştirilir.",
          "Kişisel verileriniz bunların dışında üçüncü kişilerle paylaşılmaz; yasal zorunluluk hâlinde yetkili kurumlara aktarılabilir.",
        ],
      },
      {
        h: "Toplama yöntemi",
        p: ["Kişisel verileriniz, web sitesindeki formları doldurmanız ve hesaplayıcıyı kullanmanız yoluyla elektronik ortamda toplanır."],
      },
      {
        h: "Saklama süresi",
        p: [
          "Talep ve teklif yazışmaları, ilgili iş ilişkisi ve yasal saklama yükümlülükleri süresince saklanır; amaç ortadan kalktığında silinir, yok edilir veya anonim hâle getirilir.",
        ],
      },
      {
        h: "Haklarınız",
        p: [
          "KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini, KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme, münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme ve kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.",
          "Taleplerinizi info@wawainteriors.com adresine veya yukarıdaki posta adresine iletebilirsiniz. Talepleriniz en geç otuz gün içinde ücretsiz olarak sonuçlandırılır.",
        ],
      },
    ],
  },
  {
    path: PRIVACY_ALT.tr,
    lang: "tr",
    title: "Gizlilik ve Çerez Politikası",
    updated: "Kasım 2026",
    alternates: PRIVACY_ALT,
    seo: {
      title: "Gizlilik ve Çerez Politikası | WAWA Interiors",
      description: "WAWA Interiors web sitesinde hangi verilerin, hangi amaçla işlendiği ve kullanılan çerezler hakkında bilgi.",
    },
    sections: [
      {
        h: "Genel",
        p: [
          "Bu politika, wawainteriors.com web sitesini ziyaret ettiğinizde hangi bilgilerin işlendiğini ve hangi çerezlerin kullanıldığını açıklar. Kişisel verilerinizin işlenmesine ilişkin ayrıntılar KVKK Aydınlatma Metni'nde yer alır.",
          `İletişim: ${CONTROLLER_TR}`,
        ],
      },
      {
        h: "Formlar ve hesaplayıcı",
        p: [
          "İletişim ve teklif formuna yazdığınız bilgiler ile bütçe hesaplayıcıda doğruladığınız telefon numarası yalnızca talebinizle ilgili sizinle iletişime geçmek için kullanılır ve ekibimize e-postayla iletilir.",
        ],
      },
      {
        h: "Çerezler",
        p: [
          "Sitemiz kendi çerezini kullanmaz; reklam veya takip amaçlı çerez yoktur ve ziyaretçi istatistiği toplanmaz.",
        ],
      },
      {
        h: "Üçüncü taraf içerikler",
        p: [
          "İletişim ve hizmet sayfalarında Google Haritalar haritası, bazı sayfalarda YouTube videoları gömülüdür. Bu içerikler yüklendiğinde Google kendi çerezlerini kullanabilir; YouTube videoları gizlilik odaklı youtube-nocookie.com alanından yüklenir. Bu hizmetlerin veri işleme koşulları için Google'ın gizlilik politikasına bakabilirsiniz.",
        ],
      },
      {
        h: "Güvenlik",
        p: [
          "Site HTTPS üzerinden sunulur. Formlar kötüye kullanıma karşı istek sınırlarıyla korunur; sunucu kayıtlarında telefon numaraları maskeli tutulur.",
        ],
      },
      {
        h: "Değişiklikler",
        p: ["Bu politika gerektiğinde güncellenir. Güncel sürüm her zaman bu sayfada yayımlanır."],
      },
    ],
  },
  {
    path: PRIVACY_ALT.en,
    lang: "en",
    title: "Privacy & Cookie Policy",
    updated: "November 2026",
    alternates: PRIVACY_ALT,
    seo: {
      title: "Privacy & Cookie Policy | WAWA Interiors",
      description: "What data the WAWA Interiors website processes, why, and which cookies it uses.",
    },
    sections: [
      { h: "Controller", p: [`${CONTROLLER_EN}`] },
      {
        h: "What we process",
        p: [
          "Contact and offer form: name, company, phone, e-mail, project details and your message.",
          "Design budget calculator (Turkish site): mobile phone number, space type and area.",
          "Technical data: IP address and browser information are kept briefly in server logs for security and abuse prevention.",
        ],
      },
      {
        h: "Why",
        p: [
          "To answer your request, prepare an offer and contact you about your project; to verify phone numbers in the calculator; to keep the website secure.",
        ],
      },
      {
        h: "Service providers",
        p: [
          "SMS verification is sent via Netgsm. Form notifications are delivered by e-mail via Resend (USA); the website is hosted on Vercel (USA). Your data may therefore be transferred to servers abroad. We do not share your data with anyone else unless legally required.",
        ],
      },
      {
        h: "Cookies",
        p: [
          "The website sets no cookies of its own; there are no advertising or tracking cookies and no visitor statistics.",
          "Google Maps and YouTube content embedded on some pages may set Google's own cookies; YouTube videos are loaded from the privacy-enhanced youtube-nocookie.com domain.",
        ],
      },
      {
        h: "Your rights",
        p: ["You can request access to, correction or deletion of your personal data at info@wawainteriors.com."],
      },
    ],
  },
  {
    path: PRIVACY_ALT.de,
    lang: "de",
    title: "Datenschutz- und Cookie-Richtlinie",
    updated: "November 2026",
    alternates: PRIVACY_ALT,
    seo: {
      title: "Datenschutz | WAWA Interiors",
      description: "Welche Daten die Website von WAWA Interiors verarbeitet, zu welchem Zweck und welche Cookies verwendet werden.",
    },
    sections: [
      { h: "Verantwortlicher", p: [`${CONTROLLER_EN}`] },
      {
        h: "Welche Daten",
        p: [
          "Kontakt- und Angebotsformular: Name, Firma, Telefon, E-Mail, Projektangaben und Ihre Nachricht.",
          "Budgetrechner (türkische Website): Mobilnummer, Raumtyp und Fläche.",
          "Technische Daten: IP-Adresse und Browserinformationen werden kurzzeitig in Serverprotokollen gespeichert, zur Sicherheit und Missbrauchsabwehr.",
        ],
      },
      {
        h: "Zweck",
        p: ["Beantwortung Ihrer Anfrage, Angebotserstellung und Kontaktaufnahme zu Ihrem Projekt; Verifizierung der Telefonnummer im Rechner; Sicherheit der Website."],
      },
      {
        h: "Dienstleister",
        p: [
          "SMS-Codes werden über Netgsm versendet. Formularbenachrichtigungen werden per E-Mail über Resend (USA) zugestellt; die Website wird bei Vercel (USA) gehostet. Ihre Daten können daher auf Server im Ausland übertragen werden. Eine weitere Weitergabe erfolgt nur bei gesetzlicher Verpflichtung.",
        ],
      },
      {
        h: "Cookies",
        p: [
          "Die Website setzt keine eigenen Cookies; es gibt keine Werbe- oder Tracking-Cookies und keine Besucherstatistiken.",
          "Eingebettete Inhalte von Google Maps und YouTube können eigene Cookies von Google setzen; YouTube-Videos werden über die datenschutzfreundliche Domain youtube-nocookie.com geladen.",
        ],
      },
      {
        h: "Ihre Rechte",
        p: ["Auskunft, Berichtigung oder Löschung Ihrer personenbezogenen Daten können Sie unter info@wawainteriors.com beantragen."],
      },
    ],
  },
];

export const getLegalPage = (path: string) => legalPages.find((p) => p.path === path);
export const privacyPath = (lang: Lang) => (lang === "tr" ? PRIVACY_ALT.tr : lang === "de" ? PRIVACY_ALT.de : PRIVACY_ALT.en);
export const kvkkPath = "/kvkk-aydinlatma-metni/";

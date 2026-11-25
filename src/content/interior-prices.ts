// İç mimarlık fiyat rehberi (TR /ic-mimarlik-fiyatlari/, EN /en/interior-design-prices/, DE /de/innenarchitektur-preise/).
// Şimdilik rakam verilmez: bütçenin nasıl oluştuğu, fiyatı belirleyen kalemler ve teklif öncesi hazırlık anlatılır.
// Tasarım bedeli Türkçede /butce-planlama/ aracıyla hesaplanır; diğer dillerde teklif formuna yönlenir.
import type { PageLang } from "./fair-meta";

export const INTERIOR_PRICE_YEAR = 2027;

type Content = {
  metaTitle: string;
  metaDesc: string;
  title: string;
  lead: string;
  h: { parts: string; modes: string; factors: string; spaces: string; prepare: string; faq: string };
  parts: { title: string; text: string; cta: { label: string; href: string } }[];
  modes: { title: string; text: string; items: string[] }[];
  factors: { title: string; text: string }[];
  spaces: { title: string; href: string; items: string[] }[];
  prepare: string[];
  faq: { q: string; a: string }[];
  end: { title: string; text: string; cta: string; href: string };
};

export const INTERIOR_PRICES: Record<PageLang, Content> = {
  tr: {
    metaTitle: `İç Mimarlık Fiyatları ${INTERIOR_PRICE_YEAR}: Bütçe Neye Göre Belirlenir? | WAWA Interiors`,
    metaDesc: "İç mimarlık ve anahtar teslim uygulama bütçesi nasıl oluşur? Tasarım ve uygulama bedeli, fiyatı belirleyen kalemler, mekân türüne göre maliyetler ve teklif öncesi hazırlık.",
    title: `İç mimarlık fiyatları ${INTERIOR_PRICE_YEAR}`,
    lead: "Her mekânın bütçesi kendi kapsamıyla oluşur. Bu rehber, fiyatın hangi kalemlerden oluştuğunu ve neye göre değiştiğini anlatır; kesin rakam keşif ve projeyle yazılı teklifte netleşir.",
    h: { parts: "Bütçe iki kalemden oluşur", modes: "Üç çalışma biçimi", factors: "Fiyatı neler belirler?", spaces: "Mekân türüne göre öne çıkan kalemler", prepare: "Teklif için neler hazırlanmalı?", faq: "Sık sorulanlar" },
    parts: [
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
    ],
    modes: [
      { title: "Yalnızca tasarım", text: "Konsept, 3D görseller ve uygulamaya hazır teknik proje. Uygulamayı kendi ekibinizle yaparsınız.", items: ["Rölöve ve ihtiyaç programı", "Konsept ve 3D görseller", "Teknik ve detay çizimler", "Mahal listesi ve metraj"] },
      { title: "Tasarım ve uygulama", text: "Anahtar teslim. Tasarım, üretim ve uygulama tek ekipte; tek muhatap, tek takvim.", items: ["Tasarımın tüm aşamaları", "İnşaat ve tesisat işleri", "Atölyemizde özel mobilya", "Kontrol ve teslim"] },
      { title: "Yalnızca uygulama", text: "Hazır projenizi uygularız. Proje gözden geçirilir, eksik detaylar tamamlanır, iş programı çıkarılır.", items: ["Proje kontrolü", "Metraj ve iş programı", "İnşaat ve montaj", "Saha yönetimi"] },
    ],
    factors: [
      { title: "Alan", text: "Metrekare arttıkça toplam bütçe artar; birim maliyet ise büyük alanlarda genellikle düşer." },
      { title: "Mekânın durumu", text: "Kaba inşaat, boş mekân ya da kullanılan bir mekânın yenilenmesi; söküm ve hazırlık işleri bütçeyi değiştirir." },
      { title: "Malzeme sınıfı", text: "Zemin, duvar ve tavan kaplamalarında seçilen malzeme ve markalar en büyük farkı yaratan kalemdir." },
      { title: "Özel mobilya oranı", text: "Ölçüye özel üretilen mobilya ve sabit donatı arttıkça işçilik ve üretim payı büyür." },
      { title: "Tesisat", text: "Elektrik, aydınlatma, mekanik ve iklimlendirme işlerinin kapsamı; mevcut tesisatın ne kadarının kullanılabileceği." },
      { title: "Takvim", text: "Kısa teslim süresi, gece ya da hafta sonu çalışma, işletme açıkken etaplı uygulama ek planlama gerektirir." },
      { title: "Konum", text: "İstanbul dışı ve yurt dışı projelerde nakliye, konaklama ve saha organizasyonu bütçeye eklenir." },
      { title: "Kurallar ve onaylar", text: "AVM teknik şartnameleri, site yönetimi kuralları ya da sektöre özel gereklilikler (ör. klinikler) kapsamı etkiler." },
    ],
    spaces: [
      { title: "Konut ve villa", href: "/konut-villa-tasarim/", items: ["Islak hacimler ve mutfak", "Özel mobilya ve dolaplar", "Aydınlatma ve akıllı ev sistemleri"] },
      { title: "Mağaza", href: "/service/magaza-tasarimi/", items: ["Vitrin ve teşhir üniteleri", "Marka standartları", "AVM şartnamesi ve gece çalışma"] },
      { title: "Klinik", href: "/service/klinik-tasarimi/", items: ["Medikal tesisat ve hijyenik yüzeyler", "Sterilizasyon ve bekleme alanları", "Sektöre özel gereklilikler"] },
      { title: "Cafe ve restoran", href: "/cafe-dekorasyon/", items: ["Endüstriyel mutfak ve havalandırma", "Akustik ve aydınlatma", "Oturma düzeni ve bar ünitesi"] },
      { title: "Ofis", href: "/ofis-tasarimi-ve-uygulama/", items: ["Data ve elektrik altyapısı", "Akustik ve toplantı odaları", "Çalışırken etaplı uygulama"] },
    ],
    prepare: ["Mekânın planı ya da ölçüleri (yoksa keşifte biz alırız)", "Mevcut durumun fotoğrafları", "Beğendiğiniz mekânlardan referans görseller", "Hedef bütçe aralığınız", "Açılış ya da taşınma tarihiniz"],
    faq: [
      { q: "İç mimarlık fiyatı metrekareye göre mi belirlenir?", a: "Tasarım bedeli büyük ölçüde mekânın türü ve alanına göre hesaplanır. Uygulama bedeli ise metrekareden çok malzeme, tesisat ve özel mobilya kapsamına bağlıdır; bu yüzden keşif sonrası kalem kalem teklif edilir." },
      { q: "Yalnızca tasarım hizmeti alabilir miyim?", a: "Evet. Konsept, 3D görseller ve uygulamaya hazır teknik projeyi teslim ederiz; uygulamayı kendi ekibinizle yapabilirsiniz. Dilerseniz uygulama aşamasında kontrollük de veririz." },
      { q: "Teklif ücretsiz mi?", a: "Evet. Mekân bilgilerinizi paylaştığınızda kapsamı netleştirir, ücretsiz teklif hazırlarız." },
      { q: "Bütçem belli, ona göre tasarım yapılabilir mi?", a: "Evet. Hedef bütçenizi baştan paylaşırsanız malzeme ve mobilya kararlarını bu aralığa göre veririz; alternatifleri karşılaştırmalı sunarız." },
    ],
    end: { title: "Mekânınızın bütçesini birlikte çıkaralım.", text: "Mekân türünü, alanı ve beklentilerinizi paylaşın; kapsamı netleştirip ücretsiz, yazılı teklif hazırlayalım.", cta: "Teklif alın", href: "/teklif-al/?tur=ic-mimarlik" },
  },
  en: {
    metaTitle: `Interior Design Prices ${INTERIOR_PRICE_YEAR}: What Sets the Budget? | WAWA Interiors`,
    metaDesc: "How is an interior design and turnkey fit-out budget built? Design and build costs, the factors that drive the price, costs by space type and what to prepare before asking for an offer.",
    title: `Interior design prices ${INTERIOR_PRICE_YEAR}`,
    lead: "Every space has a budget shaped by its own scope. This guide explains what the price is made of and what changes it; the exact figure comes with a site survey, the design and a written offer.",
    h: { parts: "A budget has two parts", modes: "Three ways to work with us", factors: "What drives the price?", spaces: "Key cost items by space type", prepare: "What to prepare for an offer", faq: "Frequently asked" },
    parts: [
      {
        title: "Design fee",
        text: "Survey, concept, 3D visuals, technical and construction drawings. Calculated from the type and size of the space, regardless of who builds it.",
        cta: { label: "Ask for a design fee", href: "/en/get-offer/?tur=ic-mimarlik" },
      },
      {
        title: "Build cost",
        text: "Construction and renovation, materials, building services, custom furniture, installation and labour. Quoted item by item in writing after the survey and design.",
        cta: { label: "Ask for a build offer", href: "/en/get-offer/?tur=ic-mimarlik" },
      },
    ],
    modes: [
      { title: "Design only", text: "Concept, 3D visuals and construction-ready drawings. You build with your own team.", items: ["Survey and brief", "Concept and 3D visuals", "Technical and detail drawings", "Schedules and quantities"] },
      { title: "Design and build", text: "Turnkey. Design, production and build in one team: one contact, one schedule.", items: ["All design stages", "Construction and services", "Custom furniture from our workshop", "Snagging and handover"] },
      { title: "Build only", text: "We build your existing design. We review it, complete missing details and set the work programme.", items: ["Design review", "Quantities and programme", "Construction and installation", "Site management"] },
    ],
    factors: [
      { title: "Area", text: "The total budget grows with the area; the cost per m² usually falls on larger spaces." },
      { title: "Condition of the space", text: "A shell, an empty unit or a space in use being renovated; strip-out and preparation change the budget." },
      { title: "Material grade", text: "The materials and brands chosen for floors, walls and ceilings make the biggest difference." },
      { title: "Share of custom furniture", text: "The more made-to-measure furniture and joinery, the larger the production and labour share." },
      { title: "Building services", text: "The scope of electrical, lighting, mechanical and HVAC work, and how much of the existing installation can stay." },
      { title: "Schedule", text: "Short lead times, night or weekend work and phased work while the business stays open need extra planning." },
      { title: "Location", text: "For projects outside Istanbul or abroad, shipping, accommodation and site organisation are added." },
      { title: "Rules and approvals", text: "Mall technical specifications, building management rules or sector requirements (e.g. clinics) affect the scope." },
    ],
    spaces: [
      { title: "Homes and villas", href: "/en/service/housing-villa-design/", items: ["Bathrooms and kitchen", "Custom furniture and wardrobes", "Lighting and smart home systems"] },
      { title: "Stores", href: "/en/service/store-design-and-implementation/", items: ["Shop front and display units", "Brand standards", "Mall specifications and night work"] },
      { title: "Clinics", href: "/en/service/clinic-design-and-implementation/", items: ["Medical services and hygienic surfaces", "Sterilisation and waiting areas", "Sector requirements"] },
      { title: "Cafés and restaurants", href: "/en/service/cafe-restaurant-design-and-implementation/", items: ["Commercial kitchen and ventilation", "Acoustics and lighting", "Seating layout and bar"] },
      { title: "Offices", href: "/en/service/office-design-and-implementation/", items: ["Data and power infrastructure", "Acoustics and meeting rooms", "Phased work while you operate"] },
    ],
    prepare: ["A plan or measurements of the space (we can survey it if not)", "Photos of the current state", "Reference images of spaces you like", "Your target budget range", "Your opening or move-in date"],
    faq: [
      { q: "Is interior design priced per square metre?", a: "The design fee is largely based on the type and size of the space. The build cost depends more on materials, building services and custom furniture than on area, so it is quoted item by item after the survey." },
      { q: "Can I hire you for design only?", a: "Yes. We deliver the concept, 3D visuals and construction-ready drawings; you can build with your own team. We can also supervise the build if you wish." },
      { q: "Is the offer free?", a: "Yes. Once you share the details of your space, we clarify the scope and prepare a free offer." },
      { q: "I have a set budget. Can you design to it?", a: "Yes. If you share your target budget up front, we make material and furniture choices within it and present alternatives side by side." },
    ],
    end: { title: "Let's work out the budget for your space.", text: "Tell us the type of space, its size and what you expect; we will clarify the scope and send a free written offer.", cta: "Get an offer", href: "/en/get-offer/?tur=ic-mimarlik" },
  },
  de: {
    metaTitle: `Innenarchitektur Preise ${INTERIOR_PRICE_YEAR}: Wovon hängt das Budget ab? | WAWA Interiors`,
    metaDesc: "Wie entsteht das Budget für Innenarchitektur und schlüsselfertigen Ausbau? Planungs- und Ausführungskosten, Preisfaktoren, Kosten nach Raumtyp und was Sie vor der Anfrage vorbereiten sollten.",
    title: `Innenarchitektur Preise ${INTERIOR_PRICE_YEAR}`,
    lead: "Jedes Budget ergibt sich aus dem eigenen Umfang. Dieser Leitfaden zeigt, woraus der Preis besteht und was ihn verändert; die genaue Zahl folgt nach Aufmaß und Planung im schriftlichen Angebot.",
    h: { parts: "Das Budget hat zwei Teile", modes: "Drei Arten der Zusammenarbeit", factors: "Was bestimmt den Preis?", spaces: "Wichtige Kostenpunkte nach Raumtyp", prepare: "Was Sie für ein Angebot vorbereiten sollten", faq: "Häufige Fragen" },
    parts: [
      {
        title: "Planungshonorar",
        text: "Aufmaß, Konzept, 3D-Visualisierungen, Werk- und Detailplanung. Berechnet nach Art und Größe des Raums, unabhängig davon, wer ausführt.",
        cta: { label: "Planungshonorar anfragen", href: "/de/angebot-erhalten/?tur=ic-mimarlik" },
      },
      {
        title: "Ausführungskosten",
        text: "Bau- und Umbauarbeiten, Material, Haustechnik, Möbel nach Maß, Montage und Arbeitszeit. Nach Aufmaß und Planung Position für Position schriftlich angeboten.",
        cta: { label: "Ausführungsangebot anfragen", href: "/de/angebot-erhalten/?tur=ic-mimarlik" },
      },
    ],
    modes: [
      { title: "Nur Planung", text: "Konzept, 3D-Visualisierungen und ausführungsreife Pläne. Die Umsetzung übernimmt Ihr eigenes Team.", items: ["Aufmaß und Bedarfsprogramm", "Konzept und 3D-Visualisierung", "Werk- und Detailpläne", "Raumbuch und Massen"] },
      { title: "Planung und Ausführung", text: "Schlüsselfertig. Planung, Fertigung und Ausführung aus einer Hand: ein Ansprechpartner, ein Zeitplan.", items: ["Alle Planungsphasen", "Bau und Haustechnik", "Möbel aus unserer Werkstatt", "Abnahme und Übergabe"] },
      { title: "Nur Ausführung", text: "Wir setzen Ihre vorhandene Planung um, prüfen sie, ergänzen fehlende Details und erstellen den Bauzeitenplan.", items: ["Planprüfung", "Massen und Bauzeitenplan", "Bau und Montage", "Bauleitung"] },
    ],
    factors: [
      { title: "Fläche", text: "Mit der Fläche wächst das Gesamtbudget; der Preis pro m² sinkt bei größeren Flächen meist." },
      { title: "Zustand des Raums", text: "Rohbau, leere Einheit oder Umbau im laufenden Betrieb; Rückbau und Vorbereitung verändern das Budget." },
      { title: "Materialklasse", text: "Die gewählten Materialien und Marken für Böden, Wände und Decken machen den größten Unterschied." },
      { title: "Anteil Möbel nach Maß", text: "Je mehr Maßmöbel und Einbauten, desto größer der Fertigungs- und Arbeitsanteil." },
      { title: "Haustechnik", text: "Umfang von Elektro, Beleuchtung, Lüftung und Klima, und wie viel der bestehenden Installation bleiben kann." },
      { title: "Zeitplan", text: "Kurze Fristen, Nacht- oder Wochenendarbeit und Ausführung in Etappen bei laufendem Betrieb brauchen zusätzliche Planung." },
      { title: "Standort", text: "Bei Projekten außerhalb Istanbuls oder im Ausland kommen Transport, Unterkunft und Baustellenorganisation hinzu." },
      { title: "Vorgaben und Genehmigungen", text: "Technische Vorgaben von Einkaufszentren, Hausordnungen oder Branchenanforderungen (z. B. Praxen) beeinflussen den Umfang." },
    ],
    spaces: [
      { title: "Wohnungen und Villen", href: "/de/service/wohnungs-villendesign/", items: ["Bäder und Küche", "Maßmöbel und Schränke", "Licht und Smart Home"] },
      { title: "Läden", href: "/de/service/laden-design-und-umsetzungen/", items: ["Schaufenster und Präsentationsmöbel", "Markenstandards", "Center-Vorgaben und Nachtarbeit"] },
      { title: "Praxen und Kliniken", href: "/de/service/klinikdesign-und-umsetzungen/", items: ["Medizintechnik und hygienische Oberflächen", "Sterilisation und Wartebereiche", "Branchenanforderungen"] },
      { title: "Cafés und Restaurants", href: "/de/service/cafe-restaurantdesign-und-umsetzungen/", items: ["Gewerbeküche und Lüftung", "Akustik und Licht", "Sitzplan und Bar"] },
      { title: "Büros", href: "/de/service/buerodesign-und-umsetzung/", items: ["Daten- und Stromversorgung", "Akustik und Besprechungsräume", "Umbau im laufenden Betrieb"] },
    ],
    prepare: ["Grundriss oder Maße des Raums (sonst messen wir auf)", "Fotos vom aktuellen Zustand", "Referenzbilder von Räumen, die Ihnen gefallen", "Ihr Zielbudget", "Ihr Eröffnungs- oder Einzugstermin"],
    faq: [
      { q: "Wird Innenarchitektur pro Quadratmeter berechnet?", a: "Das Planungshonorar richtet sich weitgehend nach Art und Größe des Raums. Die Ausführungskosten hängen mehr von Material, Haustechnik und Maßmöbeln ab als von der Fläche und werden nach dem Aufmaß Position für Position angeboten." },
      { q: "Kann ich nur die Planung beauftragen?", a: "Ja. Wir liefern Konzept, 3D-Visualisierungen und ausführungsreife Pläne; die Umsetzung kann Ihr eigenes Team übernehmen. Auf Wunsch übernehmen wir auch die Bauüberwachung." },
      { q: "Ist das Angebot kostenlos?", a: "Ja. Sobald Sie uns die Eckdaten Ihres Raums nennen, klären wir den Umfang und erstellen ein kostenloses Angebot." },
      { q: "Mein Budget steht fest. Planen Sie danach?", a: "Ja. Wenn Sie Ihr Zielbudget vorab nennen, treffen wir Material- und Möbelentscheidungen in diesem Rahmen und stellen Alternativen gegenüber." },
    ],
    end: { title: "Ermitteln wir gemeinsam das Budget für Ihren Raum.", text: "Nennen Sie Raumtyp, Fläche und Ihre Erwartungen; wir klären den Umfang und senden ein kostenloses schriftliches Angebot.", cta: "Angebot anfragen", href: "/de/angebot-erhalten/?tur=ic-mimarlik" },
  },
};

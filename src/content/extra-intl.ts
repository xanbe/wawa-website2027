// Stand ve sektör sayfalarının İngilizce ve Almanca sürümleri (stand-pages.ts ve sector-pages.ts'deki Türkçe metinlerden).
import type { ExtraPage } from "./extra-pages";

const WORKSHOP_EN =
  "We prepare design and technical drawings in-house and manage construction, furniture production and implementation from a single source. Furniture and fixed fittings are produced in our own workshop and installed on site.";

const WORKSHOP_DE =
  "Entwurf und technische Zeichnungen erstellen wir im eigenen Haus; Bau, Möbelfertigung und Umsetzung steuern wir aus einer Hand. Möbel und feste Einbauten werden in unserer eigenen Werkstatt gefertigt und vor Ort montiert.";

export const standPagesIntl: ExtraPage[] = [
  {
    key: "stand",
    path: "/en/plus-stand/",
    lang: "en",
    group: "/plus-stand/",
    title: "Plus Stand",
    lead: "The large-scale version of the Maxima modular system: on large trade fair stands, we combine the practicality of a modular system with the impact of a custom-designed stand.",
    image: "/wp-content/uploads/2024/08/daly-maximastand-1.webp",
    points: ["Large floor area", "Modular framework", "Reusable", "Brand-specific production"],
    sections: [
      {
        h: "A modular system for large stands.",
        p: "Plus Stand is the version of the Maxima modular system designed for stands with a larger floor area. Reception, meeting and product display areas are resolved within the same system; set-up and dismantling are planned and fast.",
      },
      {
        h: "A reusable structure",
        p: "The system elements are reassembled from one fair to the next. Graphics, display units and layout are rearranged for each participation to suit your brand and stand space.",
      },
      {
        h: "A look completed by custom production",
        p: "Reception counters, shelving and display cases are produced in our own workshop; brand-specific details are added to the modular structure.",
      },
      {
        h: "One team from design to installation",
        p: "Concept, 3D design, technical approval, production, logistics and installation are managed from a single source; the same team is on site at fairs in Turkey and abroad.",
      },
    ],
    projectCategories: ["/portfolio-category/maxima-stand/"],
    faq: [
      {
        q: "What is the difference between Plus Stand and Maxima Stand?",
        a: "Both are based on the same modular system. Plus Stand is designed for larger floor areas and more extensive stand layouts; Maxima offers a fast and economical solution for more compact stands.",
      },
      {
        q: "Is Plus Stand reusable?",
        a: "Yes. The system elements are reassembled at later fairs; graphics and display units can be renewed for each participation.",
      },
      {
        q: "What determines the price of a Plus Stand?",
        a: "Floor area, number of open sides, the scope of custom-built units, graphics and lighting, and the location of the fair determine the total cost. Share your fair details with us and we will prepare a quote.",
      },
    ],
    seo: {
      title: "Plus Stand | Large-Scale Modular Exhibition Stand | WAWA Interiors",
      description: "Plus Stand, the large-scale version of the Maxima modular system: reusable trade fair stands with a large floor area, completed with brand-specific custom production.",
    },
  },
  {
    key: "stand",
    path: "/de/plus-stand/",
    lang: "de",
    group: "/plus-stand/",
    title: "Plus Stand",
    lead: "Die großformatige Version des modularen Maxima-Systems: Bei Messeständen mit großer Fläche verbinden wir die Praktikabilität eines modularen Systems mit der Wirkung eines individuell gestalteten Stands.",
    image: "/wp-content/uploads/2024/08/daly-maximastand-1.webp",
    points: ["Große Standfläche", "Modulares Grundgerüst", "Wiederverwendbar", "Markenspezifische Fertigung"],
    sections: [
      {
        h: "Ein modulares System für große Stände.",
        p: "Plus Stand ist die Version des modularen Maxima-Systems, die für Stände mit größerer Fläche konzipiert ist. Empfang, Besprechungs- und Produktpräsentationsbereiche werden innerhalb desselben Systems gelöst; Auf- und Abbau verlaufen geplant und schnell.",
      },
      {
        h: "Wiederverwendbare Konstruktion",
        p: "Die Systemelemente werden von Messe zu Messe neu aufgebaut. Grafiken, Präsentationseinheiten und Aufteilung werden bei jeder Teilnahme passend zu Ihrer Marke und Standfläche neu gestaltet.",
      },
      {
        h: "Ein Erscheinungsbild, vollendet durch Sonderanfertigung",
        p: "Empfangstheken, Regale und Vitrinen werden in unserer eigenen Werkstatt gefertigt; die modulare Konstruktion wird um markenspezifische Details ergänzt.",
      },
      {
        h: "Ein Team vom Entwurf bis zum Aufbau",
        p: "Konzept, 3D-Design, technische Freigabe, Fertigung, Logistik und Aufbau werden aus einer Hand gesteuert; bei Messen in der Türkei und im Ausland ist dasselbe Team vor Ort.",
      },
    ],
    projectCategories: ["/portfolio-category/maxima-stand/"],
    faq: [
      {
        q: "Was ist der Unterschied zwischen Plus Stand und Maxima Stand?",
        a: "Beide basieren auf demselben modularen System. Plus Stand ist für größere Flächen und umfangreichere Standkonzepte ausgelegt; Maxima bietet eine schnelle und wirtschaftliche Lösung für kompaktere Stände.",
      },
      {
        q: "Ist Plus Stand wiederverwendbar?",
        a: "Ja. Die Systemelemente werden bei späteren Messen erneut aufgebaut; Grafiken und Präsentationseinheiten können bei jeder Teilnahme erneuert werden.",
      },
      {
        q: "Wovon hängt der Preis eines Plus Stands ab?",
        a: "Fläche, Anzahl der offenen Seiten, Umfang der Sonderanfertigungen, Grafik und Beleuchtung sowie der Messeort bestimmen die Gesamtkosten. Wenn Sie uns Ihre Messedaten mitteilen, erstellen wir Ihnen ein Angebot.",
      },
    ],
    seo: {
      title: "Plus Stand | Großformatiger modularer Messestand | WAWA Interiors",
      description: "Plus Stand, die großformatige Version des modularen Maxima-Systems: wiederverwendbare Messestände mit großer Fläche, vollendet durch markenspezifische Sonderanfertigung.",
    },
  },
  {
    key: "stand",
    path: "/en/mall-stand/",
    lang: "en",
    group: "/avm-standi/",
    title: "Mall Stand and Kiosk",
    lead: "We design mall stands and kiosks that make your brand stand out in shopping centres and are built for long-term use, and we produce them in our own workshop.",
    image: "/wp-content/uploads/2024/07/golden-rose-bursa-3.webp",
    points: ["Long-term use", "Product-focused design", "Produced in our own workshop", "Installation and assembly"],
    sections: [
      {
        h: "A strong store in a small space.",
        p: "A mall stand, also known as a kiosk, becomes the face of your brand in the atriums and central areas of a shopping centre. Once installed, it works like a mini store: products are displayed within easy reach and visitors make their decision quickly.",
      },
      {
        h: "How it differs from an exhibition stand",
        p: "Both mall stands and exhibition stands bring a brand together with its target audience. The difference is duration: an exhibition stand is used at short-term events, while a mall stand is used over a long period. That is why materials, durability and ease of everyday use are at the heart of the design.",
      },
      {
        h: "Designed to be seen from every side",
        p: "Models with or without corners, with a mini-bar look, open all round or closed on all four sides can be designed. Brand colours, lighting and logo placement are planned together so the stand is noticed from every direction.",
      },
      {
        h: "Launch stands",
        p: "We also create short-term mall stands for product launches and seasonal campaigns; the Gardrops launch stand at Akasya AVM is one of them.",
      },
    ],
    projectCategories: ["/portfolio-category/avm-standi/"],
    faq: [
      {
        q: "What do mall stand prices depend on?",
        a: "The price depends on the stand's dimensions, its features and its design details. Once the materials, lighting, display units and installation scope are clear, we prepare a quote.",
      },
      {
        q: "What is the difference between a mall stand and an exhibition stand?",
        a: "Both put the brand and its products in the spotlight. Mall stands are used over a long period, while exhibition stands are usually chosen for short-term events.",
      },
      {
        q: "Which mall stand models are possible?",
        a: "Models with or without corners, with a mini-bar look, open all round or closed on all four sides are possible; any custom design element can be added at the client's request.",
      },
    ],
    seo: {
      title: "Mall Stand and Kiosk Design | WAWA Interiors",
      description: "Mall stand and kiosk design for long-term use in shopping centres, with production in our own workshop and installation. Golden Rose and Gardrops mall stands.",
    },
  },
  {
    key: "stand",
    path: "/de/mall-stand/",
    lang: "de",
    group: "/avm-standi/",
    title: "Mall-Stand und Kiosk",
    lead: "Wir entwerfen Mall-Stände und Kioske, die Ihre Marke in Einkaufszentren in den Vordergrund rücken und auf lange Nutzung ausgelegt sind, und fertigen sie in unserer eigenen Werkstatt.",
    image: "/wp-content/uploads/2024/07/golden-rose-bursa-3.webp",
    points: ["Langfristige Nutzung", "Produktorientiertes Design", "Fertigung in eigener Werkstatt", "Aufbau und Montage"],
    sections: [
      {
        h: "Ein starkes Geschäft auf kleiner Fläche.",
        p: "Ein Mall-Stand, auch Kiosk genannt, wird auf den Plätzen und in den Mittelbereichen eines Einkaufszentrums zum Gesicht Ihrer Marke. Nach der Montage funktioniert er wie ein kleines Geschäft: Die Produkte sind leicht zugänglich präsentiert, und Besucher entscheiden sich schnell.",
      },
      {
        h: "Der Unterschied zum Messestand",
        p: "Mall-Stand und Messestand bringen beide die Marke mit ihrer Zielgruppe zusammen. Der Unterschied liegt in der Dauer: Ein Messestand wird bei kurzen Veranstaltungen eingesetzt, ein Mall-Stand über lange Zeit genutzt. Deshalb stehen Material, Langlebigkeit und einfache Handhabung im Alltag im Mittelpunkt des Entwurfs.",
      },
      {
        h: "Von allen Seiten sichtbar",
        p: "Möglich sind Modelle mit oder ohne Ecken, im Stil einer Minibar, rundum offen oder an allen vier Seiten geschlossen. Markenfarben, Beleuchtung und Logoposition werden gemeinsam geplant, damit der Stand aus jeder Richtung wahrgenommen wird.",
      },
      {
        h: "Launch-Stände",
        p: "Für Produktlaunches und saisonale Kampagnen gestalten wir auch kurzfristige Stände in Einkaufszentren; der Gardrops-Launch-Stand im Akasya AVM ist einer davon.",
      },
    ],
    projectCategories: ["/portfolio-category/avm-standi/"],
    faq: [
      {
        q: "Wovon hängen die Preise für einen Mall-Stand ab?",
        a: "Der Preis richtet sich nach den Abmessungen des Stands, seiner Ausstattung und den Gestaltungsdetails. Sobald Material, Beleuchtung, Präsentationseinheiten und Montageumfang feststehen, erstellen wir ein Angebot.",
      },
      {
        q: "Was ist der Unterschied zwischen einem Mall-Stand und einem Messestand?",
        a: "Beide rücken Marke und Produkte in den Vordergrund. Mall-Stände werden über lange Zeit genutzt, Messestände dagegen meist bei kurzen Veranstaltungen eingesetzt.",
      },
      {
        q: "Welche Mall-Stand-Modelle sind möglich?",
        a: "Möglich sind Modelle mit oder ohne Ecken, im Stil einer Minibar, rundum offen oder an allen vier Seiten geschlossen; auf Kundenwunsch lassen sich beliebige individuelle Gestaltungselemente ergänzen.",
      },
    ],
    seo: {
      title: "Mall-Stand und Kiosk-Design | WAWA Interiors",
      description: "Mall-Stände und Kioske für die langfristige Nutzung in Einkaufszentren: Design, Fertigung in eigener Werkstatt und Montage. Mall-Stände für Golden Rose und Gardrops.",
    },
  },
];

export const sectorPagesIntl: ExtraPage[] = [
  {
    key: "sector",
    path: "/en/jewellery-store-interior-design/",
    lang: "en",
    group: "/kuyumcu-ic-mimari/",
    title: "Jewellery Store Interior Design",
    lead: "Lighting that brings out the product, a layout that inspires trust and display cases made for your brand: we design jewellery stores and produce them in our own workshop.",
    image: "/images/projects/dila-exclusive.jpg",
    sections: [
      {
        h: "Light carries the product",
        p: "In jewellery retail, light is at the heart of the design. We create a lighting scheme that treats the warmth of gold, the sparkle of diamonds and the cool tone of silver individually, balancing display case, counter and general lighting so that none overpowers the others.",
      },
      {
        h: "Display cases and counters, the heart of the store",
        p: "Display cases, sales counters and product display units are made to measure. Materials, glass and locking details are resolved at the design stage; the units are prepared in our workshop and installed on site.",
      },
      {
        h: "A sense of trust and flow",
        p: "We plan a layout where customers can browse comfortably and sales advisers can present pieces with confidence. The flow between entrance, waiting area, private consultation area and checkout is designed around the store's day-to-day operation.",
      },
    ],
    points: ["Display cases and display units", "Product-specific lighting scheme", "Sales counter and private consultation area", "Jewellery fair stands"],
    projectPaths: ["/portfolio/dila-exclusive/", "/portfolio/midas/", "/portfolio/midas-2024/"],
    faq: [
      {
        q: "What matters most in jewellery store design?",
        a: "That the product is seen in the right light and the customer feels secure. Lighting, display case layout and the sales area are planned together.",
      },
      {
        q: "Do you produce the display cases and counters yourselves?",
        a: "Yes. Display cases, counters and display units are produced for each project in our own workshop and installed on site.",
      },
      {
        q: "Do you also design stands for jewellery fairs?",
        a: "Yes. We also handle stand design, production and installation for jewellery fairs.",
      },
    ],
    seo: {
      title: "Jewellery Store Interior Architecture and Shop Design | WAWA Interiors",
      description:
        "Interior design for jewellery stores: product-specific lighting, made-to-measure display cases and counters, and a layout that inspires trust. Design, production and implementation from a single source.",
    },
  },
  {
    key: "sector",
    path: "/de/juwelier-innenarchitektur/",
    lang: "de",
    group: "/kuyumcu-ic-mimari/",
    title: "Innenarchitektur für Juweliere",
    lead: "Licht, das das Produkt zur Geltung bringt, eine Vertrauen schaffende Raumaufteilung und markenspezifische Vitrinen: Wir gestalten Juweliergeschäfte und fertigen sie in unserer eigenen Werkstatt.",
    image: "/images/projects/dila-exclusive.jpg",
    sections: [
      {
        h: "Licht trägt das Produkt",
        p: "Im Juwelierhandel steht das Licht im Mittelpunkt der Gestaltung. Wir entwickeln ein Beleuchtungskonzept, das die Wärme von Gold, das Funkeln von Brillanten und den kühlen Ton von Silber jeweils gesondert berücksichtigt, und stimmen Vitrinen-, Theken- und Allgemeinbeleuchtung so ab, dass keine die andere überstrahlt.",
      },
      {
        h: "Vitrinen und Theken, das Herz des Geschäfts",
        p: "Vitrinen, Verkaufstheken und Präsentationseinheiten werden nach Maß gefertigt. Material-, Glas- und Schließdetails werden bereits in der Entwurfsphase gelöst; die Einheiten werden in unserer Werkstatt vorbereitet und vor Ort montiert.",
      },
      {
        h: "Vertrauen und Wegeführung",
        p: "Wir planen eine Aufteilung, in der sich Kunden in Ruhe umsehen und Verkaufsberater die Stücke mit Sicherheit präsentieren können. Die Wege zwischen Eingang, Wartebereich, Bereich für private Beratung und Kasse richten sich nach dem täglichen Betrieb des Geschäfts.",
      },
    ],
    points: ["Vitrinen und Präsentationseinheiten", "Produktgerechtes Beleuchtungskonzept", "Verkaufstheke und Bereich für private Beratung", "Stände für Schmuckmessen"],
    projectPaths: ["/portfolio/dila-exclusive/", "/portfolio/midas/", "/portfolio/midas-2024/"],
    faq: [
      {
        q: "Worauf kommt es bei der Gestaltung eines Juweliergeschäfts am meisten an?",
        a: "Darauf, dass das Produkt im richtigen Licht erscheint und sich der Kunde sicher fühlt. Beleuchtung, Anordnung der Vitrinen und Verkaufsbereich werden gemeinsam geplant.",
      },
      {
        q: "Fertigen Sie Vitrinen und Theken selbst?",
        a: "Ja. Vitrinen, Theken und Präsentationseinheiten werden in unserer eigenen Werkstatt projektspezifisch gefertigt und vor Ort montiert.",
      },
      {
        q: "Gestalten Sie auch Stände für Schmuckmessen?",
        a: "Ja. Für Schmuckmessen übernehmen wir ebenfalls Standdesign, Fertigung und Aufbau.",
      },
    ],
    seo: {
      title: "Innenarchitektur und Ladengestaltung für Juweliere | WAWA Interiors",
      description:
        "Innenarchitektur für Juweliergeschäfte: produktgerechte Beleuchtung, maßgefertigte Vitrinen und Theken, eine Vertrauen schaffende Aufteilung. Entwurf, Fertigung und Umsetzung aus einer Hand.",
    },
  },
  {
    key: "sector",
    path: "/en/dental-clinic-design/",
    lang: "en",
    group: "/dis-klinigi-ic-mimari/",
    title: "Dental Clinic Design",
    lead: "A calm clinic for patients and an efficient one for the team. From dental unit layout to sterilisation flow, we design and build dental clinics.",
    image: "/images/hero/halide-akinci-klinik.webp",
    sections: [
      {
        h: "Patient comfort and trust",
        p: "From the waiting area to the treatment room, we consider everything patients see, hear and feel. Decisions on materials, colour and light are made together to create a calm atmosphere that eases anxiety.",
      },
      {
        h: "Dental units, sterilisation and staff flow",
        p: "In a dental clinic, the units, the working space of dentists and assistants, lighting and cleaning processes are considered together. Equipment connections and service points are defined using the manufacturer's technical data, and the working layout is agreed with the healthcare team.",
      },
      {
        h: "Hygiene and easy cleaning",
        p: "Surfaces, joint details and cabinetry are chosen to be easy to clean. Storage and access to supplies are planned to make the dentist's work easier during treatment.",
      },
    ],
    points: ["Waiting area and reception", "Treatment rooms and dental unit layout", "Sterilisation and storage", "Electrical and plumbing coordination"],
    projectPaths: ["/portfolio/halide-akinci-klinik-tasarim/", "/portfolio/fulya-klinik-tasarim/"],
    faq: [
      {
        q: "Are permit procedures included?",
        a: "No. In turnkey projects we manage every process except permits; the permit process remains the clinic's own responsibility.",
      },
      {
        q: "How do you plan equipment placement?",
        a: "We define the connection points of units and equipment using the manufacturer's technical data, and agree the working layout together with the healthcare team.",
      },
      {
        q: "Can you renovate an existing clinic?",
        a: "Yes. We review the dimensions and services of the existing space and define the renovation scope together after a site survey.",
      },
    ],
    seo: {
      title: "Dental Clinic Design and Interior Architecture | WAWA Interiors",
      description:
        "Dental clinic design: patient comfort, dental unit layout, sterilisation and staff flow. Turnkey dental clinic interiors from design to implementation, except permits.",
    },
  },
  {
    key: "sector",
    path: "/de/zahnarztpraxis-design/",
    lang: "de",
    group: "/dis-klinigi-ic-mimari/",
    title: "Zahnarztpraxis-Design",
    lead: "Eine ruhige Praxis für Patienten und eine effiziente für das Team. Von der Anordnung der Behandlungseinheiten bis zum Sterilisationsablauf planen und realisieren wir Zahnarztpraxen.",
    image: "/images/hero/halide-akinci-klinik.webp",
    sections: [
      {
        h: "Patientenkomfort und Vertrauen",
        p: "Vom Wartebereich bis zum Behandlungszimmer berücksichtigen wir alles, was Patienten sehen, hören und fühlen. Entscheidungen zu Material, Farbe und Licht werden gemeinsam getroffen, um eine ruhige Atmosphäre zu schaffen, die Ängste mindert.",
      },
      {
        h: "Behandlungseinheiten, Sterilisation und Personalwege",
        p: "In einer Zahnarztpraxis werden Behandlungseinheiten, Bewegungsräume von Zahnärzten und Assistenzpersonal, Beleuchtung und Reinigungsabläufe gemeinsam betrachtet. Geräteanschlüsse und Installationspunkte werden anhand der technischen Angaben des Herstellers festgelegt, die Nutzungsabläufe gemeinsam mit dem Praxisteam.",
      },
      {
        h: "Hygiene und einfache Reinigung",
        p: "Oberflächen, Fugendetails und Schränke werden so gewählt, dass sie sich leicht reinigen lassen. Lagerung und Materialzugriff werden so geplant, dass sie dem Zahnarzt die Arbeit während der Behandlung erleichtern.",
      },
    ],
    points: ["Wartebereich und Empfang", "Behandlungszimmer und Anordnung der Einheiten", "Sterilisation und Lagerung", "Koordination von Elektro- und Sanitärinstallation"],
    projectPaths: ["/portfolio/halide-akinci-klinik-tasarim/", "/portfolio/fulya-klinik-tasarim/"],
    faq: [
      {
        q: "Sind Genehmigungsverfahren im Leistungsumfang enthalten?",
        a: "Nein. Bei schlüsselfertigen Projekten steuern wir alle Abläufe außer Genehmigungen; das Genehmigungsverfahren liegt in der Verantwortung der Praxis.",
      },
      {
        q: "Wie planen Sie die Anordnung der Geräte?",
        a: "Die Anschlusspunkte von Behandlungseinheiten und Geräten legen wir anhand der technischen Angaben des Herstellers fest, die Nutzungsabläufe gemeinsam mit dem Praxisteam.",
      },
      {
        q: "Können Sie eine bestehende Praxis renovieren?",
        a: "Ja. Wir prüfen Maße und Installationen der bestehenden Räume und legen den Renovierungsumfang nach einer Besichtigung gemeinsam fest.",
      },
    ],
    seo: {
      title: "Zahnarztpraxis-Design und Innenarchitektur | WAWA Interiors",
      description:
        "Zahnarztpraxis-Design: Patientenkomfort, Anordnung der Behandlungseinheiten, Sterilisation und Personalwege. Schlüsselfertige Innenarchitektur für Zahnarztpraxen vom Entwurf bis zur Umsetzung, außer Genehmigungen.",
    },
  },
  {
    key: "sector",
    path: "/en/pharmacy-interior-design/",
    lang: "en",
    group: "/eczane-ic-mimari/",
    title: "Pharmacy Interior Design",
    lead: "We design and build pharmacies with well-planned shelving, counters and stockroom flow, where customers easily find what they are looking for.",
    image: "/images/process/konsept.webp",
    sections: [
      {
        h: "Shelf layout and visibility",
        p: "Prescription and over-the-counter products, dermocosmetics and personal care sections are arranged so customers can move around comfortably. Shelf heights, label areas and lighting are set so products are easy to find.",
      },
      {
        h: "Counter and back of house",
        p: "The flow between the sales counter, consultation point and back stockroom is designed around the pharmacist's movements throughout the day. Drawer cabinets and storage units are made to measure.",
      },
      {
        h: "A simple space that inspires trust",
        p: "A clean, orderly and bright interior supports a sense of trust in a healthcare setting. Materials are chosen from durable, easy-to-clean options.",
      },
    ],
    points: ["Shelving and display systems", "Sales counter and consultation point", "Stockroom and drawer cabinets", "Lighting and shopfront"],
    projectCategories: ["/portfolio-category/magaza-tasarim/", "/portfolio-category/klinik-tasarim/"],
    faq: [
      {
        q: "Do you produce the shelving and cabinets yourselves?",
        a: "Yes. Shelving systems, counters and storage units are made to measure in our own workshop and installed on site.",
      },
      {
        q: "Can the pharmacy be renovated while it stays open?",
        a: "Depending on the scope, we can plan the work in phases. We agree the implementation schedule together after a site survey.",
      },
    ],
    seo: {
      title: "Pharmacy Interior Architecture and Design | WAWA Interiors",
      description:
        "Interior design for pharmacies: shelving and display layout, sales counter, stockroom flow and lighting. Made-to-measure production and implementation from a single source.",
    },
  },
  {
    key: "sector",
    path: "/de/apotheken-innenarchitektur/",
    lang: "de",
    group: "/eczane-ic-mimari/",
    title: "Innenarchitektur für Apotheken",
    lead: "Wir planen und realisieren Apotheken mit durchdachter Regalordnung, Theke und Lagerabläufen, in denen Kunden mühelos finden, was sie suchen.",
    image: "/images/process/konsept.webp",
    sections: [
      {
        h: "Regalordnung und Sichtbarkeit",
        p: "Verschreibungspflichtige und rezeptfreie Produkte, Dermokosmetik und Körperpflege werden so angeordnet, dass sich Kunden bequem bewegen können. Regalhöhen, Etikettenflächen und Beleuchtung werden so festgelegt, dass Produkte leicht zu finden sind.",
      },
      {
        h: "Theke und rückwärtiger Bereich",
        p: "Die Wege zwischen Verkaufstheke, Beratungsplatz und Lager werden nach den täglichen Bewegungsabläufen des Apothekers geplant. Schubladenschränke und Lagereinheiten werden nach Maß gefertigt.",
      },
      {
        h: "Ein schlichter Raum, der Vertrauen schafft",
        p: "Ein sauberer, geordneter und heller Innenraum stärkt im Gesundheitsbereich das Gefühl von Vertrauen. Die Materialien werden aus langlebigen und leicht zu reinigenden Optionen gewählt.",
      },
    ],
    points: ["Regal- und Präsentationssysteme", "Verkaufstheke und Beratungsplatz", "Lager und Schubladenschränke", "Beleuchtung und Fassade"],
    projectCategories: ["/portfolio-category/magaza-tasarim/", "/portfolio-category/klinik-tasarim/"],
    faq: [
      {
        q: "Fertigen Sie Regale und Schränke selbst?",
        a: "Ja. Regalsysteme, Theken und Lagereinheiten werden in unserer eigenen Werkstatt nach Maß gefertigt und vor Ort montiert.",
      },
      {
        q: "Ist eine Renovierung während des laufenden Apothekenbetriebs möglich?",
        a: "Je nach Umfang können wir die Arbeiten in Bauabschnitte aufteilen. Den Zeitplan für die Umsetzung legen wir nach einer Besichtigung gemeinsam fest.",
      },
    ],
    seo: {
      title: "Innenarchitektur und Gestaltung für Apotheken | WAWA Interiors",
      description:
        "Innenarchitektur für Apotheken: Regal- und Präsentationsordnung, Verkaufstheke, Lagerabläufe und Beleuchtung. Maßanfertigung und Umsetzung aus einer Hand.",
    },
  },
  {
    key: "sector",
    path: "/en/beauty-salon-interior-design/",
    lang: "en",
    group: "/guzellik-salonu-ic-mimari/",
    title: "Beauty Centre & Spa Design",
    lead: "From treatment rooms to the waiting area, we design beauty centres, aesthetics salons and spa areas where guests feel at ease.",
    image: "/images/hero/fulya-klinik.webp",
    sections: [
      {
        h: "First impressions and waiting",
        p: "The entrance and reception define the salon's character. We design a welcome area where guests feel comfortable and that carries the brand's identity.",
      },
      {
        h: "Treatment rooms and privacy",
        p: "Treatment and procedure rooms are each considered in terms of privacy, sound and light. Equipment and service points are planned around how the rooms are used.",
      },
      {
        h: "Hygiene and durable materials",
        p: "Durable materials are chosen for frequently cleaned surfaces; storage and product display units are made to measure.",
      },
    ],
    points: ["Reception and waiting area", "Treatment and procedure rooms", "Product display and storage", "Lighting and acoustics"],
    projectCategories: ["/portfolio-category/klinik-tasarim/", "/portfolio-category/magaza-tasarim/"],
    seo: {
      title: "Beauty Salon and Aesthetic Clinic Interior Design | WAWA Interiors",
      description:
        "Interior design for beauty salons and aesthetic clinics: reception, treatment rooms, privacy and hygiene. One team from design to implementation.",
    },
  },
  {
    key: "sector",
    path: "/de/kosmetikstudio-innenarchitektur/",
    lang: "de",
    group: "/guzellik-salonu-ic-mimari/",
    title: "Beauty- & Spa-Design",
    lead: "Vom Behandlungsraum bis zum Wartebereich gestalten wir Kosmetik- und Ästhetikstudios sowie Spa-Bereiche, in denen sich Ihre Gäste wohlfühlen.",
    image: "/images/hero/fulya-klinik.webp",
    sections: [
      {
        h: "Erster Eindruck und Wartebereich",
        p: "Eingang und Empfang prägen den Charakter des Studios. Wir gestalten einen Empfangsbereich, in dem sich Gäste wohlfühlen und der die Identität der Marke widerspiegelt.",
      },
      {
        h: "Behandlungsräume und Privatsphäre",
        p: "Behandlungs- und Anwendungsräume werden jeweils hinsichtlich Privatsphäre, Akustik und Licht betrachtet. Geräte- und Installationspunkte werden nach den Nutzungsabläufen geplant.",
      },
      {
        h: "Hygiene und langlebige Materialien",
        p: "Für häufig gereinigte Oberflächen werden langlebige Materialien gewählt; Lager- und Produktpräsentationseinheiten werden nach Maß gefertigt.",
      },
    ],
    points: ["Empfang und Wartebereich", "Behandlungs- und Anwendungsräume", "Produktpräsentation und Lagerung", "Beleuchtung und Akustik"],
    projectCategories: ["/portfolio-category/klinik-tasarim/", "/portfolio-category/magaza-tasarim/"],
    seo: {
      title: "Innenarchitektur für Kosmetikstudios und Ästhetikzentren | WAWA Interiors",
      description:
        "Innenarchitektur für Kosmetikstudios und Ästhetikzentren: Empfang, Behandlungsräume, Privatsphäre und Hygiene. Ein Team vom Entwurf bis zur Umsetzung.",
    },
  },
  {
    key: "sector",
    path: "/en/showroom-interior-design/",
    lang: "en",
    group: "/showroom-ic-mimari/",
    title: "Showroom Interior Design",
    lead: "Showrooms that present the product as part of a story: we bring your brand identity into the space and produce it in our own workshop.",
    image: "/images/hero/instreet-havalimani.webp",
    sections: [
      {
        h: "The product story",
        p: "A showroom presents the product on a stage, not on a shelf. Together with the brand, we define the product groups, the order in which visitors move through the space and the points to highlight.",
      },
      {
        h: "Flexible display",
        p: "We design display systems that can be rearranged as collections change. Display units and fixed fittings are produced in our workshop.",
      },
      {
        h: "Backed by trade fair experience",
        p: "The experience we have gained with exhibition stands carries over into permanent spaces, in display solutions that make the product stand out.",
      },
    ],
    points: ["Concept aligned with brand identity", "Flexible display systems", "Lighting and display windows", "Meeting and presentation area"],
    projectCategories: ["/portfolio-category/magaza-tasarim/", "/portfolio-category/ofis-tasarimi/"],
    seo: {
      title: "Showroom Interior Architecture and Design | WAWA Interiors",
      description:
        "Interior design for showrooms: concepts aligned with brand identity, flexible display systems and lighting. Design, production and implementation from a single source.",
    },
  },
  {
    key: "sector",
    path: "/de/showroom-innenarchitektur/",
    lang: "de",
    group: "/showroom-ic-mimari/",
    title: "Showroom-Innenarchitektur",
    lead: "Showrooms, die das Produkt als Teil einer Geschichte präsentieren: Wir übertragen Ihre Markenidentität in den Raum und fertigen in unserer eigenen Werkstatt.",
    image: "/images/hero/instreet-havalimani.webp",
    sections: [
      {
        h: "Die Geschichte des Produkts",
        p: "Ein Showroom zeigt das Produkt nicht im Regal, sondern auf einer Bühne. Gemeinsam mit der Marke legen wir Produktgruppen, den Rundgang der Besucher und die hervorzuhebenden Punkte fest.",
      },
      {
        h: "Flexible Präsentation",
        p: "Wir entwerfen Präsentationssysteme, die sich bei wechselnden Kollektionen neu anordnen lassen. Präsentationseinheiten und feste Einbauten werden in unserer Werkstatt gefertigt.",
      },
      {
        h: "Mit Messeerfahrung",
        p: "Unsere Erfahrung mit Messeständen spiegelt sich auch in dauerhaften Räumen wider: in Präsentationslösungen, die das Produkt in den Vordergrund rücken.",
      },
    ],
    points: ["Konzept passend zur Markenidentität", "Flexible Präsentationssysteme", "Beleuchtung und Schaufenster", "Besprechungs- und Präsentationsbereich"],
    projectCategories: ["/portfolio-category/magaza-tasarim/", "/portfolio-category/ofis-tasarimi/"],
    seo: {
      title: "Showroom-Innenarchitektur und Gestaltung | WAWA Interiors",
      description:
        "Innenarchitektur für Showrooms: Konzepte passend zur Markenidentität, flexible Präsentationssysteme und Beleuchtung. Entwurf, Fertigung und Umsetzung aus einer Hand.",
    },
  },
  {
    key: "sector",
    group: "/otel-ic-mimari/",
    path: "/en/hotel-interior-design/",
    lang: "en",
    title: "Hotel & Hospitality Design",
    lead: "From the lobby to the rooms, the restaurant to the shared spaces: we design and build hotel and hospitality interiors that balance guest comfort with day-to-day operations.",
    image: "/images/hero/acarkent-villa.webp",
    sections: [
      { h: "The guest's first impression", p: "The entrance, lobby and reception set a hotel's character. We plan arrival, waiting and wayfinding as one space where guests find their way easily and the brand comes through." },
      { h: "Rooms and repeated details", p: "We resolve each room type through a sample room, planning furniture, lighting, bathrooms and storage so they repeat in every room at the same quality. Fitted furniture is made in our own workshop." },
      { h: "Shared spaces and operations", p: "Restaurant, café, meeting and lounge areas are planned together with staff and service routes, so what guests see and what runs behind the scenes do not get in each other's way." },
      { h: "Durability and maintenance", p: "High-traffic areas get durable, easy-to-clean materials. Renovations are split into phases that leave the open parts of the hotel undisturbed." },
    ],
    points: ["Lobby and reception", "Rooms and suites", "Restaurant and shared spaces", "Phased renovation"],
    projectCategories: ["/portfolio-category/konut-villa/", "/portfolio-category/cafe-restoran-tasarim/"],
    faq: [
      { q: "Can you renovate while the hotel stays open?", a: "Yes. Work is split by floor, block or area and planned so that the parts guests use are not affected." },
      { q: "Do you make the room furniture?", a: "Yes. Fitted furniture and custom units are made in our own workshop and installed on site." },
      { q: "Do you work on boutique hotels and guesthouses too?", a: "Yes. We work from small boutique hotels to larger hospitality projects, based on the brief." },
    ],
    seo: { title: "Hotel Interior Design and Hospitality Interiors | WAWA Interiors", description: "Interior design for hotels and hospitality: lobby, rooms, restaurant and shared spaces. Design, custom furniture and build in one team." },
  },
  {
    key: "sector",
    group: "/spor-salonu-ic-mimari/",
    path: "/en/gym-studio-interior-design/",
    lang: "en",
    title: "Gym & Studio Design",
    lead: "We design and build gyms, pilates and yoga studios and boutique training spaces that are easy to use, durable and true to the brand.",
    image: "/images/process/konsept.webp",
    sections: [
      { h: "Dividing the space well", p: "Cardio, weights, functional training and group classes are laid out around equipment sizes and the class schedule, so members' circulation never cuts through training areas." },
      { h: "Flooring, acoustics and ventilation", p: "Impact-resistant floors, sound insulation and enough fresh air are the basis of any training space. These decisions are made early, together with the building services." },
      { h: "Changing rooms and wet areas", p: "Changing rooms, showers and lockers are planned for heavy use and easy cleaning, with moisture-resistant materials." },
      { h: "Brand experience", p: "Reception, waiting and sales areas carry the studio's identity. Lighting, colour and graphics set the atmosphere of each area." },
    ],
    points: ["Training area layout", "Group class studios", "Changing rooms and wet areas", "Flooring, acoustics and ventilation"],
    projectCategories: ["/portfolio-category/ofis-tasarimi/", "/portfolio-category/magaza-tasarim/"],
    faq: [
      { q: "Do you also work on small spaces such as pilates or yoga studios?", a: "Yes. We work from single-room boutique studios to multi-zone gyms, based on the brief." },
      { q: "Do you plan the equipment layout?", a: "We plan the layout around the sizes of the equipment you have chosen or will choose, and resolve power and floor details accordingly." },
      { q: "Can you renovate an existing gym?", a: "Yes. The work can be split into phases that leave the open parts of the gym undisturbed." },
    ],
    seo: { title: "Gym and Studio Interior Design | WAWA Interiors", description: "Interior design for gyms, pilates and yoga studios: layout, flooring, acoustics and changing rooms. Design to build in one team." },
  },
  {
    key: "sector",
    group: "/otel-ic-mimari/",
    path: "/de/hotel-innenarchitektur/",
    lang: "de",
    title: "Hotel- & Gastgewerbedesign",
    lead: "Von der Lobby bis zu den Zimmern, vom Restaurant bis zu den Gemeinschaftsflächen: Wir planen und bauen Hotelinterieurs, die den Komfort der Gäste und den täglichen Betrieb zusammendenken.",
    image: "/images/hero/acarkent-villa.webp",
    sections: [
      { h: "Der erste Eindruck", p: "Eingang, Lobby und Rezeption prägen den Charakter eines Hotels. Ankunft, Warten und Orientierung planen wir als Einheit, in der sich Gäste leicht zurechtfinden und die Marke spürbar wird." },
      { h: "Zimmer und wiederkehrende Details", p: "Jeden Zimmertyp lösen wir an einem Musterzimmer: Möbel, Licht, Bad und Stauraum werden so geplant, dass sie in jedem Zimmer in gleicher Qualität wiederkehren. Einbaumöbel entstehen in unserer eigenen Werkstatt." },
      { h: "Gemeinschaftsflächen und Betrieb", p: "Restaurant, Café, Besprechungs- und Loungebereiche planen wir zusammen mit Personal- und Servicewegen, damit sich Gästebereich und Betrieb nicht behindern." },
      { h: "Haltbarkeit und Pflege", p: "Stark genutzte Bereiche erhalten langlebige, leicht zu reinigende Materialien. Renovierungen werden in Etappen aufgeteilt, die den laufenden Hotelbetrieb nicht stören." },
    ],
    points: ["Lobby und Rezeption", "Zimmer und Suiten", "Restaurant und Gemeinschaftsflächen", "Renovierung in Etappen"],
    projectCategories: ["/portfolio-category/konut-villa/", "/portfolio-category/cafe-restoran-tasarim/"],
    faq: [
      { q: "Ist eine Renovierung bei laufendem Betrieb möglich?", a: "Ja. Die Arbeiten werden nach Etage, Gebäudeteil oder Bereich aufgeteilt und so geplant, dass die von Gästen genutzten Bereiche nicht betroffen sind." },
      { q: "Fertigen Sie die Zimmermöbel selbst?", a: "Ja. Einbaumöbel und Sonderanfertigungen entstehen in unserer eigenen Werkstatt und werden vor Ort montiert." },
      { q: "Arbeiten Sie auch für Boutique-Hotels und Pensionen?", a: "Ja. Wir arbeiten vom kleinen Boutique-Hotel bis zu größeren Beherbergungsbetrieben, je nach Bedarf." },
    ],
    seo: { title: "Hotel-Innenarchitektur und Gastgewerbedesign | WAWA Interiors", description: "Innenarchitektur für Hotels und Beherbergung: Lobby, Zimmer, Restaurant und Gemeinschaftsflächen. Planung, Maßmöbel und Ausführung aus einer Hand." },
  },
  {
    key: "sector",
    group: "/spor-salonu-ic-mimari/",
    path: "/de/fitnessstudio-innenarchitektur/",
    lang: "de",
    title: "Fitness- & Studiodesign",
    lead: "Wir planen und bauen Fitnessstudios, Pilates- und Yogastudios sowie Boutique-Trainingsräume, die einfach zu nutzen, robust und markengerecht sind.",
    image: "/images/process/konsept.webp",
    sections: [
      { h: "Die Fläche richtig aufteilen", p: "Cardio-, Kraft-, Functional- und Kursbereiche werden nach Gerätegrößen und Kursplan angeordnet, damit sich Laufwege und Trainingsflächen nicht kreuzen." },
      { h: "Boden, Akustik und Lüftung", p: "Stoßfeste Böden, Schalldämmung und ausreichend Frischluft sind die Grundlage jeder Trainingsfläche. Diese Entscheidungen fallen früh, zusammen mit der Haustechnik." },
      { h: "Umkleiden und Nassbereiche", p: "Umkleiden, Duschen und Spinde werden für intensive Nutzung und leichte Reinigung geplant, mit feuchtigkeitsbeständigen Materialien." },
      { h: "Markenerlebnis", p: "Empfang, Warte- und Verkaufsbereiche tragen die Identität des Studios. Licht, Farbe und Grafik prägen die Atmosphäre jedes Bereichs." },
    ],
    points: ["Aufteilung der Trainingsfläche", "Kursräume", "Umkleiden und Nassbereiche", "Boden, Akustik und Lüftung"],
    projectCategories: ["/portfolio-category/ofis-tasarimi/", "/portfolio-category/magaza-tasarim/"],
    faq: [
      { q: "Arbeiten Sie auch für kleine Flächen wie Pilates- oder Yogastudios?", a: "Ja. Wir arbeiten vom Boutique-Studio mit einem Raum bis zum Fitnessstudio mit mehreren Bereichen, je nach Bedarf." },
      { q: "Planen Sie die Aufstellung der Geräte?", a: "Wir planen die Aufstellung nach den Maßen der gewählten oder geplanten Geräte und lösen Strom- und Bodendetails entsprechend." },
      { q: "Können Sie ein bestehendes Studio renovieren?", a: "Ja. Die Arbeiten lassen sich in Etappen aufteilen, die den laufenden Betrieb nicht stören." },
    ],
    seo: { title: "Innenarchitektur für Fitnessstudios und Kursräume | WAWA Interiors", description: "Innenarchitektur für Fitness-, Pilates- und Yogastudios: Aufteilung, Boden, Akustik und Umkleiden. Von der Planung bis zur Ausführung aus einer Hand." },
  },
];

export const SECTOR_WORKSHOP_NOTE_EN = WORKSHOP_EN;
export const SECTOR_WORKSHOP_NOTE_DE = WORKSHOP_DE;

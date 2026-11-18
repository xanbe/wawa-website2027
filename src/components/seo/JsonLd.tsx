
// JSON-LD betiğe gömülürken "<" kaçırılır; içerik ileride dinamik veri taşısa da </script> ile betikten çıkılamaz
function toJsonLd(schema: unknown) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WAWA Interiors",
    alternateName: "WAWA Design Studio",
    url: "https://wawainteriors.com",
    logo: "https://wawainteriors.com/logo.png",
    description:
      "İç mimarlık ve fuar standı projelerinde anahtar teslim hizmet sunan profesyonel tasarım stüdyosu.",
    foundingDate: "2009",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Maltepe Mh. Eski Çırpıcı Yolu Nef12 D:22",
      addressLocality: "Zeytinburnu",
      addressRegion: "İstanbul",
      postalCode: "34010",
      addressCountry: "TR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+90-212-706-2832",
      contactType: "customer service",
      availableLanguage: ["Turkish", "English"],
    },
    sameAs: [
      "https://instagram.com/wawafuar",
      "https://linkedin.com/company/wawa",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://wawainteriors.com/#business",
    name: "WAWA Interiors",
    image: "https://wawainteriors.com/og.jpg",
    url: "https://wawainteriors.com",
    telephone: "+90-212-706-2832",
    email: "info@wawainteriors.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Maltepe Mh. Eski Çırpıcı Yolu Nef12 D:22",
      addressLocality: "Zeytinburnu",
      addressRegion: "İstanbul",
      postalCode: "34010",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.0116,
      longitude: 28.8976,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Turkey",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
    />
  );
}

export function ServiceJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: "WAWA Interiors",
      url: "https://wawainteriors.com",
    },
    areaServed: {
      "@type": "Country",
      name: "Turkey",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
    />
  );
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
    />
  );
}







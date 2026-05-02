import { COMPANY, SITE_URL } from "@/data/site";

function localBusinessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: COMPANY.name,
    image: COMPANY.logoUrl,
    url: SITE_URL,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.streetAddress,
      addressLocality: COMPANY.address.addressLocality,
      addressRegion: COMPANY.address.addressRegion,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: COMPANY.geo.latitude,
      longitude: COMPANY.geo.longitude,
    },
    openingHoursSpecification: COMPANY.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: COMPANY.aggregateRating.ratingValue,
      bestRating: COMPANY.aggregateRating.bestRating,
      worstRating: COMPANY.aggregateRating.worstRating,
      reviewCount: COMPANY.aggregateRating.reviewCount,
    },
    priceRange: "$$",
  };
}

function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: COMPANY.name,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: COMPANY.logoUrl,
    },
    sameAs: [...COMPANY.sameAs],
  };
}

export type JsonLdObject = Record<string, unknown>;

/**
 * JSON-LD for LocalBusiness + Organization, plus optional page-level schemas
 * (e.g. Service, FAQPage, BreadcrumbList). Use `includeSiteWide={false}` on
 * inner pages when the root layout already emitted the site-wide graph.
 */
export function SchemaMarkup({
  includeSiteWide = true,
  additionalSchema,
}: {
  includeSiteWide?: boolean;
  additionalSchema?: JsonLdObject | JsonLdObject[];
}) {
  const extra = additionalSchema
    ? Array.isArray(additionalSchema)
      ? additionalSchema
      : [additionalSchema]
    : [];

  const graph: JsonLdObject[] = [
    ...(includeSiteWide
      ? [localBusinessSchema(), organizationSchema()]
      : []),
    ...extra,
  ];

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

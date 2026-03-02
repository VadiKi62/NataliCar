import { getSeoConfig } from "@config/seo";
import {
  getHubSeo,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import type { LocationSeoResolved } from "@domain/locationSeo/types";
import { toAbsoluteUrl } from "./urlBuilder";

const DEFAULT_AGGREGATE_RATING = {
  ratingValue: "4.9",
  reviewCount: "140",
};

function buildAreaServed(areaNames: string[]) {
  return areaNames.map((name) => ({
    "@type": "AdministrativeArea",
    name,
    addressCountry: "GR",
  }));
}

function buildPickupAddress() {
  const seoConfig = getSeoConfig();

  return {
    "@type": "PostalAddress",
    streetAddress: seoConfig.contact.address.split(",")[0] || seoConfig.contact.address,
    addressLocality: "Nea Kallikratia",
    addressRegion: "Halkidiki",
    postalCode: "63080",
    addressCountry: "GR",
  };
}

function buildGeoCoordinates() {
  const seoConfig = getSeoConfig();

  return {
    "@type": "GeoCoordinates",
    latitude: Number.parseFloat(seoConfig.coordinates.lat),
    longitude: Number.parseFloat(seoConfig.coordinates.lon),
  };
}

export function buildAutoRentalJsonLd(input: {
  localeCandidate: string | undefined | null;
  pagePath: string;
  location: Pick<
    LocationSeoResolved,
    "seoDescription" | "areaServed" | "pickupLocation" | "offerName" | "offerDescription"
  >;
  offerUrlPath?: string;
}) {
  const locale = normalizeLocale(input.localeCandidate);
  const seoConfig = getSeoConfig();
  const pageUrl = toAbsoluteUrl(input.pagePath);
  const offerUrl = toAbsoluteUrl(input.offerUrlPath || input.pagePath);

  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    additionalType: "https://schema.org/LocalBusiness",
    name: seoConfig.siteName,
    url: pageUrl,
    description: input.location.seoDescription,
    image: `${seoConfig.baseUrl}/favicon.png`,
    inLanguage: locale,
    areaServed: buildAreaServed(input.location.areaServed),
    pickupLocation: {
      "@type": "Place",
      name: input.location.pickupLocation,
      address: buildPickupAddress(),
      geo: buildGeoCoordinates(),
    },
    offers: {
      "@type": "Offer",
      name: input.location.offerName,
      description: input.location.offerDescription,
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      url: offerUrl,
      areaServed: buildAreaServed(input.location.areaServed),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: DEFAULT_AGGREGATE_RATING.ratingValue,
      reviewCount: DEFAULT_AGGREGATE_RATING.reviewCount,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: seoConfig.contact.phone,
      email: seoConfig.contact.email,
      contactType: "customer support",
      areaServed: "GR",
    },
  };
}

export function buildHubJsonLd(input: {
  localeCandidate: string | undefined | null;
  pagePath: string;
  primaryLocation: Pick<
    LocationSeoResolved,
    "seoDescription" | "areaServed" | "pickupLocation" | "offerName" | "offerDescription"
  >;
}) {
  const locale = normalizeLocale(input.localeCandidate);
  const hubSeo = getHubSeo(locale);

  return {
    ...buildAutoRentalJsonLd({
      localeCandidate: locale,
      pagePath: input.pagePath,
      location: {
        ...input.primaryLocation,
        seoDescription: hubSeo.seoDescription,
      },
    }),
    description: hubSeo.seoDescription,
  };
}

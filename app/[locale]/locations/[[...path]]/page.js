import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Box } from "@mui/material";
import Feed from "@app/components/Feed";
import CarGrid from "@app/components/CarGrid";
import JsonLdScript from "@app/components/seo/JsonLdScript";
import SeoHeroSliderCard from "@app/components/seo/SeoHeroSliderCard";
import {
  buildHubAndLocationLinks,
  getCarPath,
  getLocaleDictionary,
  getHubSeo,
  getLocationById,
  getLocationByPath,
  getLocationBySeoSlug,
  getLocationPathFromLocation,
  getLocationBreadcrumbChain,
  getLocationHierarchyRouteParams,
  getAllLocationsForLocale,
  getHomepageSearchUrl,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { SUPPORTED_LOCALES, LOCATION_IDS } from "@domain/locationSeo/locationSeoKeys";
import {
  getLocationHeroImage,
  getLocationDistanceText,
} from "@domain/locationSeo/locationHeroImages";
import { fetchAllCars, fetchCompany, reFetchActiveOrders } from "@utils/action";
import { COMPANY_ID } from "@config/company";
import { buildAutoRentalJsonLd, buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/services/seo/jsonLdBuilder";
import { toAbsoluteUrl } from "@/services/seo/urlBuilder";
import {
  getAirportPrioritySeo,
  isPriorityAirportLocation,
} from "@/services/seo/airportPrioritySeo";
import { buildLocationMetadata, buildLocationsIndexMetadata } from "@/services/seo/metadataBuilder";
import {
  SeoBreadcrumbNav,
  SeoFaqBlock,
  SeoIntroBlock,
  SeoLinksBlock,
  SeoNearbyPlacesBlock,
  SeoPickupGuidanceBlock,
  SeoWhyRentBlock,
  SeoDistanceTableBlock,
  SeoMapBlock,
} from "@app/components/seo/SeoContentBlocks";
import {
  CAR_CATEGORIES,
  SEO_LOCATIONS,
  getLocationSeoSlug,
  getResolvedCategoryContent,
  getSeoPagePath,
} from "@domain/seoPages/seoPageRegistry";

const PILLAR_LOCATION_IDS = [LOCATION_IDS.HALKIDIKI, LOCATION_IDS.THESSALONIKI_AIRPORT, LOCATION_IDS.NEA_KALLIKRATIA];

function getPublicCars(cars) {
  return (cars || []).filter(
    (c) =>
      c?.slug &&
      String(c.slug).trim() &&
      c?.isActive !== false &&
      c?.isHidden !== true &&
      !c?.deletedAt
  );
}

export const dynamic = "force-dynamic";

/** Location page paths: index, primary (single-segment SEO slug), and hierarchy (multi-segment). */
export function generateStaticParams() {
  const params = [];
  for (const locale of SUPPORTED_LOCALES) {
    params.push({ locale, path: [] });
    for (const loc of SEO_LOCATIONS) {
      const slug = getLocationSeoSlug(loc.locationId, locale);
      if (slug) params.push({ locale, path: [slug] });
    }
  }
  const hierarchyParams = getLocationHierarchyRouteParams();
  return [...params, ...hierarchyParams];
}

function toPathArray(path) {
  if (path == null) return [];
  if (Array.isArray(path)) {
    const flat = path.flatMap((p) => (typeof p === "string" && p.includes("/") ? p.split("/").filter(Boolean) : p));
    return flat.filter(Boolean);
  }
  const s = String(path).trim();
  return s ? s.split("/").filter(Boolean) : [];
}

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  const pathArray = toPathArray(params.path);
  if (pathArray.length === 0) {
    return buildLocationsIndexMetadata(params.locale);
  }
  // Single segment: resolve by centralized SEO slug first (seoSlugByLocale)
  if (pathArray.length === 1) {
    const locationBySlug = getLocationBySeoSlug(locale, pathArray[0]);
    if (locationBySlug) {
      return buildLocationMetadata(locationBySlug);
    }
  }
  // Multi-segment: hierarchy (path segments = location IDs)
  const location = getLocationByPath(locale, pathArray);
  if (!location) {
    return { robots: { index: false, follow: false } };
  }
  return buildLocationMetadata(location);
}

export default async function LocationHierarchyPage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) notFound();

  const pathArray = toPathArray(params.path);

  if (pathArray.length > 3) notFound();

  // Index: /locations (no path segments)
  if (pathArray.length === 0) {
    const hubSeo = getHubSeo(locale);
    const dictionary = getLocaleDictionary(locale);
    const locationLinks = getAllLocationsForLocale(locale).map((location) => ({
      href: getLocationPathFromLocation(locale, location),
      label: location.shortName,
    }));
    return (
      <Feed locale={locale} isMain={false}>
        <Box
          component="main"
          sx={{
            color: "text.primary",
            bgcolor: "background.default",
            minHeight: "60vh",
            py: 3,
            px: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ maxWidth: 980, mx: "auto" }}>
            <SeoIntroBlock title={hubSeo.h1} introText={hubSeo.introText} />
            <SeoLinksBlock
              title={dictionary.links.hubToLocationsTitle}
              links={locationLinks}
            />
          </Box>
        </Box>
      </Feed>
    );
  }

  let location = null;

  // Single segment: resolve only via centralized SEO slug (seoSlugByLocale)
  if (pathArray.length === 1) {
    const slug = pathArray[0];
    location = getLocationBySeoSlug(locale, slug);
    // Legacy: single-segment hierarchy ID (e.g. /en/locations/halkidiki) → redirect to canonical SEO URL
    if (!location) {
      location = getLocationByPath(locale, pathArray);
      if (location) {
        const canonicalPath = getLocationPathFromLocation(locale, location);
        const currentPath = `/${locale}/locations/${slug}`;
        if (canonicalPath !== currentPath) {
          redirect(canonicalPath);
        }
      }
    }
  } else {
    // Multi-segment: hierarchy only (path segments = location IDs)
    location = getLocationByPath(locale, pathArray);
  }

  if (!location) notFound();

  const dictionary = getLocaleDictionary(locale);
  const isPillar = PILLAR_LOCATION_IDS.includes(location.id);
  let allCars = [];
  let ordersData = null;
  let companyData = null;
  if (isPillar) {
    const headersList = await headers();
    const cookie = headersList.get("cookie");
    const [carsData, orders, company] = await Promise.all([
      fetchAllCars({ cookie }).catch(() => []),
      reFetchActiveOrders().catch(() => null),
      fetchCompany(COMPANY_ID).catch(() => null),
    ]);
    allCars = carsData || [];
    ordersData = orders;
    companyData = company;
  }
  const publicCars = getPublicCars(allCars);

  const pagePath = getLocationPathFromLocation(locale, location);
  const locationJsonLd = buildAutoRentalJsonLd({
    localeCandidate: locale,
    pagePath,
    location,
  });

  const locationLinks = buildHubAndLocationLinks(locale, location);
  const links = dictionary.links;
  const prioritySeo = isPriorityAirportLocation(location)
    ? getAirportPrioritySeo(locale)
    : null;
  const prioritizedTitle = prioritySeo?.h1 || location.h1;
  const prioritizedIntroText = prioritySeo?.introText || location.introText;

  // Hero images: from config (domain/locationSeo/locationHeroImages.ts). Fallback used if no entry.
  const locationHeroImage = getLocationHeroImage(location.id);
  const heroImages = [locationHeroImage];
  const distanceText = getLocationDistanceText(location.id);
  const ctaHref =
    location.canonicalSlug && typeof getHomepageSearchUrl === "function"
      ? getHomepageSearchUrl(locale, location.canonicalSlug)
      : locationLinks.hubPath;
  const ctaLabel = links.locationHeroCtaLabel;
  const heroParagraphs = prioritySeo?.heroSubtitle
    ? [prioritySeo.heroSubtitle]
    : prioritizedIntroText
      ? [prioritizedIntroText]
      : [];

  const breadcrumbItems = getLocationBreadcrumbChain(locale, location);
  const faqJsonLd = buildFaqJsonLd(location.faq || []);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    breadcrumbItems.map((item) => ({ name: item.label, url: toAbsoluteUrl(item.href) }))
  );

  const halkidikiLocation = getLocationById(locale, LOCATION_IDS.HALKIDIKI);
  const internalLinks = [];
  if (halkidikiLocation) {
    internalLinks.push({
      href: getLocationPathFromLocation(locale, halkidikiLocation),
      label: halkidikiLocation.h1 || "Car rental in Halkidiki",
    });
  }
  internalLinks.push({
    href: getSeoPagePath(locale, "automatic-car-rental-halkidiki"),
    label: dictionary.links?.automaticCarRentalHalkidiki ?? "Automatic car rental in Halkidiki",
  });
  internalLinks.push({
    href: `/${locale}/cars`,
    label: dictionary.links?.carsCatalogue ?? "Cars catalogue",
  });

  const isAirport = isPriorityAirportLocation(location);

  return (
    <Feed
      locale={locale}
      isMain={false}
      {...(isPillar && publicCars.length > 0
        ? { cars: publicCars, orders: ordersData, company: companyData }
        : {})}
    >
      <SeoHeroSliderCard
        title={prioritizedTitle}
        paragraphs={heroParagraphs}
        imageUrls={heroImages}
        imageAlt={location.slug}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        fullBleedUnderNav
      />
      <Box
        component="main"
        sx={{
          color: "text.primary",
          bgcolor: "background.default",
          minHeight: "60vh",
          py: 3,
          px: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ maxWidth: 980, mx: "auto" }}>
          <JsonLdScript id={`location-jsonld-${location.id}-${locale}`} data={locationJsonLd} />
          {faqJsonLd && (
            <JsonLdScript id={`location-faq-jsonld-${location.id}-${locale}`} data={faqJsonLd} />
          )}
          {breadcrumbJsonLd && (
            <JsonLdScript
              id={`location-breadcrumb-jsonld-${location.id}-${locale}`}
              data={breadcrumbJsonLd}
            />
          )}
          <SeoBreadcrumbNav items={breadcrumbItems} />

          {/* Temporarily disabled until car availability UX is redesigned. */}
          {/* {isPillar && publicCars.length > 0 && (
            <section style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 8px" }}>
              <h2 style={{ marginBottom: 16 }}>{dictionary.links.locationToCarsTitle}</h2>
              <CarGrid />
            </section>
          )} */}

          {/* 1. Intro (first paragraph only when we have multiple) */}
          {(() => {
            const introParas = prioritizedIntroText
              ? prioritizedIntroText.split(/\n\n+/).filter(Boolean)
              : [];
            const firstPara = introParas.length > 0 ? introParas[0] : prioritizedIntroText;
            return (
              <SeoIntroBlock title={prioritizedTitle} introText={firstPara} skipTitle />
            );
          })()}

          {/* 2. Location information: remaining short paragraphs */}
          {prioritizedIntroText &&
            prioritizedIntroText.split(/\n\n+/).filter(Boolean).length > 1 && (
              <section style={{ maxWidth: 980, margin: "0 auto", padding: "16px 16px 8px" }}>
                {prioritizedIntroText
                  .split(/\n\n+/)
                  .filter(Boolean)
                  .slice(1)
                  .map((p, i) => (
                    <p key={i} style={{ margin: "0 0 12px", lineHeight: 1.6 }}>
                      {p.trim()}
                    </p>
                  ))}
              </section>
            )}

          {/* 3. Distance to Thessaloniki */}
          {distanceText && (
            <section style={{ maxWidth: 980, margin: "0 auto", padding: "16px 16px 8px" }}>
              <h2 style={{ marginBottom: 8, fontSize: "1.25rem" }}>Distance to Thessaloniki</h2>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{distanceText}</p>
            </section>
          )}

          {isAirport && prioritySeo?.benefitBlockTitle && prioritySeo?.quickBenefits?.length > 0 && (
            <SeoWhyRentBlock
              title={prioritySeo.benefitBlockTitle}
              bullets={prioritySeo.quickBenefits.map((b) => (b.startsWith("✔") ? b : `✔ ${b}`))}
            />
          )}

          {isAirport && prioritySeo?.seoLongText && (
            <section style={{ maxWidth: 980, margin: "0 auto", padding: "16px 16px 8px" }}>
              {prioritySeo.seoLongText.split(/\n\n+/).map((p, i) => (
                <p key={i} style={{ margin: "0 0 12px", lineHeight: 1.6 }}>
                  {p.trim()}
                </p>
              ))}
            </section>
          )}

          <SeoPickupGuidanceBlock
            title={links.pickupGuidanceTitle}
            pickupGuidance={location.pickupGuidance}
          />
          <SeoNearbyPlacesBlock
            title={links.nearbyPlacesTitle}
            nearbyPlaces={location.nearbyPlaces}
          />

          {isAirport && prioritySeo?.distanceTableTitle && prioritySeo?.distanceTableRows?.length > 0 && (
            <SeoDistanceTableBlock
              title={prioritySeo.distanceTableTitle}
              rows={prioritySeo.distanceTableRows}
            />
          )}

          {isAirport && prioritySeo?.mapSectionTitle && (
            <SeoMapBlock
              title={prioritySeo.mapSectionTitle}
              mapUrl={prioritySeo.mapUrl}
              mapEmbedHtml={prioritySeo.mapEmbedHtml}
            />
          )}

          {/* 4. FAQ */}
          <SeoFaqBlock title={links.localFaqTitle} faq={location.faq} />

          {/* 5. Cars list (text + links, no CarGrid) */}
          {publicCars.length > 0 && (
            <section style={{ maxWidth: 980, margin: "0 auto", padding: "16px 16px 24px" }}>
              <h2 style={{ marginBottom: 12, fontSize: "1.25rem", fontWeight: 600 }}>
                Available cars in this location
              </h2>
              <Box
                component="ul"
                sx={{
                  margin: 0,
                  padding: 2,
                  listStyle: "none",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  "& a": { color: "primary.main", textDecoration: "none" },
                  "& a:hover": { textDecoration: "underline" },
                  "& li": { py: 0.75, fontSize: "1rem", lineHeight: 1.5 },
                }}
              >
                {publicCars.map((car) => (
                  <Box component="li" key={car.slug}>
                    <Link href={getCarPath(locale, car.slug)}>{car.model || car.slug}</Link>
                  </Box>
                ))}
              </Box>
            </section>
          )}

          {(() => {
            const matchedSeoLoc = SEO_LOCATIONS.find((sl) => sl.locationId === location.id);
            if (!matchedSeoLoc) return null;
            const locSlug = getLocationSeoSlug(matchedSeoLoc.locationId, locale);
            const catLinks = CAR_CATEGORIES.map((cat) => {
              const locName = matchedSeoLoc.nameByLocale[locale];
              const content = getResolvedCategoryContent(cat.id, locale, locName);
              return {
                href: getSeoPagePath(locale, `${cat.id}-car-rental-${locSlug}`),
                label: content?.h1 || `${cat.id} car rental`,
              };
            });
            return catLinks.length > 0 ? (
              <SeoLinksBlock title="Browse by category" links={catLinks} />
            ) : null;
          })()}

          {internalLinks.length > 0 && (
            <SeoLinksBlock
              title={dictionary.links?.exploreMore ?? "Explore more"}
              links={internalLinks}
            />
          )}
        </Box>
      </Box>
    </Feed>
  );
}

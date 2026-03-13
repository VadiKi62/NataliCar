import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { Box } from "@mui/material";
import Feed from "@app/components/Feed";
import CarGrid from "@app/components/CarGrid";
import JsonLdScript from "@app/components/seo/JsonLdScript";
import SeoHeroSliderCard from "@app/components/seo/SeoHeroSliderCard";
import {
  buildHubAndLocationLinks,
  getCarPath,
  getLocaleDictionary,
  getLocationById,
  getLocationByLocaleAndSlug,
  getLocationByAnySlug,
  getLocationPath,
  getLocationRouteParams,
  getHomepageSearchUrl,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { LOCATION_IDS } from "@domain/locationSeo/locationSeoKeys";
import { fetchAllCars, fetchCompany, reFetchActiveOrders } from "@utils/action";
import { COMPANY_ID } from "@config/company";
import { buildAutoRentalJsonLd, buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/services/seo/jsonLdBuilder";
import { toAbsoluteUrl } from "@/services/seo/urlBuilder";
import {
  getAirportPrioritySeo,
  isPriorityAirportLocation,
} from "@/services/seo/airportPrioritySeo";
import { buildLocationMetadata } from "@/services/seo/metadataBuilder";
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

export function generateStaticParams() {
  return getLocationRouteParams();
}

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  const location =
    getLocationByLocaleAndSlug(locale, params.slug) ||
    getLocationByAnySlug(locale, params.slug);

  if (!location) {
    return {
      robots: { index: false, follow: false },
    };
  }

  return buildLocationMetadata(location);
}

export default async function LocationSeoPage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  let location = getLocationByLocaleAndSlug(locale, params.slug);

  if (!location) {
    const fallback = getLocationByAnySlug(locale, params.slug);
    if (fallback) {
      redirect(getLocationPath(locale, fallback.slug));
    }
    notFound();
  }

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
  const carLinks = publicCars.map((c) => ({
    href: getCarPath(locale, c.slug),
    label: c.model || c.slug,
  }));

  const locationJsonLd = buildAutoRentalJsonLd({
    localeCandidate: locale,
    pagePath: `/${locale}/locations/${location.slug}`,
    location,
  });

  const locationLinks = buildHubAndLocationLinks(locale, location);
  const links = dictionary.links;
  const prioritySeo = isPriorityAirportLocation(location)
    ? getAirportPrioritySeo(locale)
    : null;
  const prioritizedTitle = prioritySeo?.h1 || location.h1;
  const prioritizedIntroText = prioritySeo?.introText || location.introText;

  const locationHeroImage =
    location.id === LOCATION_IDS.NEA_KALLIKRATIA
      ? {
          defaultSrc: "/car-rental-neakallikratia.png",
          portraitPhoneSrc: "/car-rental-neakallikratia-portrait.png",
        }
      : location.id === LOCATION_IDS.HALKIDIKI
        ? {
            defaultSrc: "/car-rental-halkidiki.png",
            portraitPhoneSrc: "/car-rental-halkidiki-portrait.png",
          }
      : location.id === LOCATION_IDS.THESSALONIKI_AIRPORT
        ? {
            defaultSrc: "/car-rental-thessaloniki-airport.png",
            portraitPhoneSrc: "/car-rental-thessaloniki-airport-portrait.png",
          }
      : location.id === LOCATION_IDS.THESSALONIKI
        ? {
            defaultSrc: "/car-rental-thessaloniki.png",
            portraitPhoneSrc: "/car-rental-thessaloniki-portrait.png",
          }
      : {
          defaultSrc: "/car-rental-neakallikratia.png",
          portraitPhoneSrc: "/car-rental-neakallikratia-portrait.png",
        };
  const heroImages = [locationHeroImage];
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

  const breadcrumbItems = [
    { href: `/${locale}`, label: dictionary.breadcrumbHome ?? "Home" },
    { href: getLocationPath(locale, location.slug), label: prioritizedTitle },
  ];
  const faqJsonLd = buildFaqJsonLd(location.faq || []);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    breadcrumbItems.map((item) => ({ name: item.label, url: toAbsoluteUrl(item.href) }))
  );

  const halkidikiLocation = getLocationById(locale, LOCATION_IDS.HALKIDIKI);
  const internalLinks = [];
  if (halkidikiLocation) {
    internalLinks.push({
      href: getLocationPath(locale, halkidikiLocation.slug),
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
        ctaBottomRight
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

          {isPillar && publicCars.length > 0 && (
            <section style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 8px" }}>
              <h2 style={{ marginBottom: 16 }}>{dictionary.links.locationToCarsTitle}</h2>
              <CarGrid />
            </section>
          )}

          <SeoIntroBlock title={prioritizedTitle} introText={prioritizedIntroText} skipTitle />

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

          {carLinks.length > 0 && (
            <SeoLinksBlock
              title={dictionary.links.locationToCarsTitle}
              links={carLinks}
            />
          )}
          {(() => {
            const matchedSeoLoc = SEO_LOCATIONS.find((sl) => sl.locationId === location.id);
            if (!matchedSeoLoc) return null;
            const catLinks = CAR_CATEGORIES.map((cat) => {
              const locName = matchedSeoLoc.nameByLocale[locale];
              const content = getResolvedCategoryContent(cat.id, locale, locName);
              return {
                href: getSeoPagePath(locale, `${cat.id}-car-rental-${matchedSeoLoc.slugSuffix}`),
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

          <SeoFaqBlock title={links.localFaqTitle} faq={location.faq} />
        </Box>
      </Box>
    </Feed>
  );
}

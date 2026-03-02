import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import Feed from "@app/components/Feed";
import JsonLdScript from "@app/components/seo/JsonLdScript";
import {
  buildHubAndLocationLinks,
  getCarPath,
  getHomepageSearchUrl,
  getLocaleDictionary,
  getLocationByLocaleAndSlug,
  getLocationRouteParams,
  getLocationSearchCtaLabel,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { fetchAllCars } from "@utils/action";
import { buildAutoRentalJsonLd } from "@/services/seo/jsonLdBuilder";
import { buildLocationMetadata } from "@/services/seo/metadataBuilder";
import {
  SeoFaqBlock,
  SeoIntroBlock,
  SeoLinksBlock,
  SeoLocationCtaBlock,
  SeoNearbyPlacesBlock,
  SeoPickupGuidanceBlock,
  SeoSingleLinkBlock,
} from "@app/components/seo/SeoContentBlocks";

function getPublicCars(cars) {
  return (cars || [])
    .filter(
      (car) =>
        car?.slug &&
        String(car.slug).trim() &&
        car?.isActive !== false &&
        car?.isHidden !== true &&
        !car?.deletedAt
    )
    .sort((a, b) => String(a.model || "").localeCompare(String(b.model || "")));
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getLocationRouteParams();
}

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  const location = getLocationByLocaleAndSlug(locale, params.slug);

  if (!location) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildLocationMetadata(location);
}

export default async function LocationSeoPage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const location = getLocationByLocaleAndSlug(locale, params.slug);
  if (!location) {
    notFound();
  }

  const dictionary = getLocaleDictionary(locale);
  const cars = await fetchAllCars();
  const publicCars = getPublicCars(cars);

  const locationJsonLd = buildAutoRentalJsonLd({
    localeCandidate: locale,
    pagePath: `/${locale}/locations/${location.slug}`,
    location,
  });

  const carLinks = publicCars.slice(0, 20).map((car) => ({
    href: getCarPath(locale, String(car.slug).trim()),
    label: car.model || car.slug,
  }));

  const locationLinks = buildHubAndLocationLinks(locale, location);
  const links = dictionary.links;
  const showCityCta = location.locationType === "city";

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
          <JsonLdScript id={`location-jsonld-${location.id}-${locale}`} data={locationJsonLd} />
          <SeoIntroBlock title={location.h1} introText={location.introText} />
          {showCityCta ? (
            <SeoLocationCtaBlock
              href={getHomepageSearchUrl(locale, location.canonicalSlug)}
              label={getLocationSearchCtaLabel(locale, location.shortName)}
            />
          ) : null}
          <SeoSingleLinkBlock
            title={links.mainHubLabel}
            href={locationLinks.hubPath}
            label={links.locationToHubLabel}
          />
          {locationLinks.parent ? (
            <SeoSingleLinkBlock
              title={links.locationToParentLabel}
              href={locationLinks.parent.path}
              label={locationLinks.parent.label}
            />
          ) : null}
          <SeoPickupGuidanceBlock
            title={links.pickupGuidanceTitle}
            pickupGuidance={location.pickupGuidance}
          />
          <SeoNearbyPlacesBlock
            title={links.nearbyPlacesTitle}
            nearbyPlaces={location.nearbyPlaces}
          />
          <SeoFaqBlock title={links.localFaqTitle} faq={location.faq} />
          <SeoLinksBlock
            title={links.locationToCarsTitle}
            links={carLinks}
          />
          <SeoLinksBlock
            title={links.locationToChildrenTitle}
            links={locationLinks.children}
          />
          <SeoLinksBlock
            title={links.locationToSiblingTitle}
            links={locationLinks.siblings}
          />
        </Box>
      </Box>
    </Feed>
  );
}

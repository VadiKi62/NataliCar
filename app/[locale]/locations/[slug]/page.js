import { notFound, redirect } from "next/navigation";
import { Box } from "@mui/material";
import Feed from "@app/components/Feed";
import JsonLdScript from "@app/components/seo/JsonLdScript";
import SeoHeroSliderCard from "@app/components/seo/SeoHeroSliderCard";
import {
  buildHubAndLocationLinks,
  getLocaleDictionary,
  getLocationByLocaleAndSlug,
  getLocationByAnySlug,
  getLocationPath,
  getLocationRouteParams,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { buildAutoRentalJsonLd } from "@/services/seo/jsonLdBuilder";
import { buildLocationMetadata } from "@/services/seo/metadataBuilder";
import {
  SeoFaqBlock,
  SeoIntroBlock,
  SeoNearbyPlacesBlock,
  SeoPickupGuidanceBlock,
} from "@app/components/seo/SeoContentBlocks";

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

  const locationJsonLd = buildAutoRentalJsonLd({
    localeCandidate: locale,
    pagePath: `/${locale}/locations/${location.slug}`,
    location,
  });

  const locationLinks = buildHubAndLocationLinks(locale, location);
  const links = dictionary.links;

  const heroImages = ["/car-rental-thessaloniki-airport.png"];
  const ctaHref = locationLinks.hubPath;
  const ctaLabel = links.locationHeroCtaLabel;

  return (
    <Feed locale={locale} isMain={false}>
      <SeoHeroSliderCard
        title={location.h1}
        paragraphs={location.introText ? [location.introText] : []}
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
          <SeoIntroBlock title={location.h1} introText={location.introText} />
          <SeoPickupGuidanceBlock
            title={links.pickupGuidanceTitle}
            pickupGuidance={location.pickupGuidance}
          />
          <SeoNearbyPlacesBlock
            title={links.nearbyPlacesTitle}
            nearbyPlaces={location.nearbyPlaces}
          />
          <SeoFaqBlock title={links.localFaqTitle} faq={location.faq} />
        </Box>
      </Box>
    </Feed>
  );
}

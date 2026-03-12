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
import { LOCATION_IDS } from "@domain/locationSeo/locationSeoKeys";
import { buildAutoRentalJsonLd } from "@/services/seo/jsonLdBuilder";
import {
  getAirportPrioritySeo,
  isPriorityAirportLocation,
} from "@/services/seo/airportPrioritySeo";
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
  const ctaHref = locationLinks.hubPath;
  const ctaLabel = links.locationHeroCtaLabel;

  return (
    <Feed locale={locale} isMain={false}>
      <SeoHeroSliderCard
        title={prioritizedTitle}
        paragraphs={prioritizedIntroText ? [prioritizedIntroText] : []}
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
          <SeoIntroBlock title={prioritizedTitle} introText={prioritizedIntroText} />
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

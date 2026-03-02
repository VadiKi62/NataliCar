import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLdScript from "@app/components/seo/JsonLdScript";
import {
  buildCarSeoText,
  getAllLocationsForLocale,
  getCarPath,
  getLocaleDictionary,
  getLocationById,
  getLocationPath,
  getSupportedLocales,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { LOCATION_IDS } from "@domain/locationSeo/locationSeoKeys";
import { fetchAllCars, fetchCarBySlug } from "@utils/action";
import { buildAutoRentalJsonLd } from "@/services/seo/jsonLdBuilder";
import { buildCarMetadata } from "@/services/seo/metadataBuilder";
import {
  SeoIntroBlock,
  SeoLinksBlock,
  SeoSingleLinkBlock,
} from "@app/components/seo/SeoContentBlocks";

function getPublicCarSlugs(cars) {
  return (cars || [])
    .filter(
      (car) =>
        car?.slug &&
        String(car.slug).trim() &&
        car?.isActive !== false &&
        car?.isHidden !== true &&
        !car?.deletedAt
    )
    .map((car) => String(car.slug).trim());
}

export async function generateStaticParams() {
  const cars = await fetchAllCars().catch(() => []);
  const carSlugs = getPublicCarSlugs(cars);
  const locales = getSupportedLocales();

  return locales.flatMap((locale) => carSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  const car = await fetchCarBySlug(params.slug).catch(() => null);

  if (!car) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const fallbackLocation = getLocationById(locale, LOCATION_IDS.HALKIDIKI);
  const locationName = fallbackLocation?.shortName || "Halkidiki";

  return buildCarMetadata({
    localeCandidate: locale,
    carSlug: params.slug,
    carModel: car.model || params.slug,
    locationName,
  });
}

export default async function LocalizedCarPage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const car = await fetchCarBySlug(params.slug).catch(() => null);
  if (!car) {
    notFound();
  }

  const dictionary = getLocaleDictionary(locale);
  const fallbackLocation =
    getLocationById(locale, LOCATION_IDS.HALKIDIKI) ||
    getAllLocationsForLocale(locale)[0] ||
    null;

  const locationName = fallbackLocation?.shortName || "Halkidiki";
  const carModel = car.model || params.slug;

  const carSeoText = buildCarSeoText(locale, {
    carModel,
    locationName,
  });

  const locationLinks = getAllLocationsForLocale(locale).map((location) => ({
    href: getLocationPath(locale, location.slug),
    label: location.shortName,
  }));

  const carJsonLd = fallbackLocation
    ? buildAutoRentalJsonLd({
        localeCandidate: locale,
        pagePath: getCarPath(locale, params.slug),
        offerUrlPath: getCarPath(locale, params.slug),
        location: {
          seoDescription: carSeoText.seoDescription,
          areaServed: fallbackLocation.areaServed,
          pickupLocation: fallbackLocation.pickupLocation,
          offerName: fallbackLocation.offerName,
          offerDescription: fallbackLocation.offerDescription,
        },
      })
    : null;

  return (
    <main style={{ paddingTop: 96, paddingBottom: 32 }}>
      <JsonLdScript id={`car-jsonld-${params.slug}-${locale}`} data={carJsonLd} />
      <SeoIntroBlock title={carModel} introText={carSeoText.introText} />
      <SeoSingleLinkBlock
        title={dictionary.links.mainHubLabel}
        href={`/${locale}`}
        label={dictionary.links.carsToHubLabel}
      />
      <SeoLinksBlock
        title={dictionary.links.carsToLocationsTitle}
        links={locationLinks}
      />
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "8px 16px" }}>
        <h2 style={{ marginBottom: 8 }}>{dictionary.links.carsListTitle}</h2>
        <p style={{ margin: 0 }}>
          <Link href={`/${locale}`}>{dictionary.links.mainHubLabel}</Link>
        </p>
      </section>
    </main>
  );
}

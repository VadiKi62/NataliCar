import { MetadataRoute } from "next";
import {
  getAllLocationsForLocale,
  getCarAlternates,
  getDefaultLocale,
  getHubAlternates,
  getLocationAlternatesById,
  getLocationPathFromLocation,
  getStaticPagePath,
  getSupportedLocales,
} from "@domain/locationSeo/locationSeoService";
import { LOCATION_IDS, STATIC_PAGE_KEYS, type StaticPageKey } from "@domain/locationSeo/locationSeoKeys";
import { buildHreflangAlternates } from "@/services/seo/hreflangBuilder";
import { toAbsoluteUrl } from "@/services/seo/urlBuilder";
import {
  getAllSeoPageSlugs,
  getSeoPageAlternates,
  getSeoPagePath,
  buildProgrammaticSlug,
  buildAllBrandPageSlugs,
  SEO_LOCATIONS,
} from "@domain/seoPages/seoPageRegistry";

type SitemapCar = {
  slug?: string;
  isActive?: boolean;
  isHidden?: boolean;
  deletedAt?: string | Date | null;
  updatedAt?: string | Date;
  dateLastModified?: string | Date;
  dateAddCar?: string | Date;
};

function getLastModifiedDate(car: SitemapCar): string {
  const value =
    car.updatedAt || car.dateLastModified || car.dateAddCar || new Date().toISOString();
  return new Date(value).toISOString();
}

function isPublicCar(car: SitemapCar): boolean {
  return Boolean(
    car?.slug &&
      String(car.slug).trim() &&
      car.isActive !== false &&
      car.isHidden !== true &&
      !car.deletedAt
  );
}

function buildLocaleStaticAlternates(pageKey: StaticPageKey): Record<string, string> {
  const alternatesByLocale = Object.fromEntries(
    getSupportedLocales().map((locale) => [locale, getStaticPagePath(locale, pageKey)])
  );
  return buildHreflangAlternates(alternatesByLocale);
}

function getLocationPriority(
  locationId: string,
  _locale: string,
  defaultLocale: string
): number {
  if (locationId === LOCATION_IDS.THESSALONIKI_AIRPORT) {
    return 1;
  }
  return _locale === defaultLocale ? 0.85 : 0.8;
}

export function validateSitemapEntries(entries: MetadataRoute.Sitemap) {
  const duplicateUrls: string[] = [];
  const urlSet = new Set<string>();
  const missingXDefault: string[] = [];

  for (const entry of entries) {
    if (urlSet.has(entry.url)) {
      duplicateUrls.push(entry.url);
    }
    urlSet.add(entry.url);

    const alternates = entry.alternates?.languages || {};
    if (!alternates["x-default"]) {
      missingXDefault.push(entry.url);
    }
  }

  return {
    duplicateUrls,
    missingXDefault,
  };
}

export function buildLocalizedSitemap(cars: SitemapCar[] = []): MetadataRoute.Sitemap {
  const nowIso = new Date().toISOString();
  const defaultLocale = getDefaultLocale();
  const entries: MetadataRoute.Sitemap = [];
  const supportedLocales = getSupportedLocales();

  const hubAlternates = buildHreflangAlternates(getHubAlternates());
  for (const locale of supportedLocales) {
    const localePath = `/${locale}`;
    entries.push({
      url: toAbsoluteUrl(localePath),
      lastModified: nowIso,
      changeFrequency: "daily",
      priority: locale === defaultLocale ? 1 : 0.9,
      alternates: {
        languages: hubAlternates,
      },
    });
  }

  const locationsIndexAlternates = buildHreflangAlternates(
    Object.fromEntries(supportedLocales.map((l) => [l, `/${l}/locations`]))
  );
  for (const locale of supportedLocales) {
    entries.push({
      url: toAbsoluteUrl(`/${locale}/locations`),
      lastModified: nowIso,
      changeFrequency: "weekly",
      priority: locale === defaultLocale ? 0.85 : 0.8,
      alternates: { languages: locationsIndexAlternates },
    });
  }

  const carsIndexAlternates = buildHreflangAlternates(
    Object.fromEntries(supportedLocales.map((l) => [l, `/${l}/cars`]))
  );
  for (const locale of supportedLocales) {
    entries.push({
      url: toAbsoluteUrl(`/${locale}/cars`),
      lastModified: nowIso,
      changeFrequency: "weekly",
      priority: locale === defaultLocale ? 0.9 : 0.85,
      alternates: { languages: carsIndexAlternates },
    });
  }

  // Only SEO-relevant static pages. Exclude legal/technical (noindex) from sitemap.
  const staticPagesInSitemap: StaticPageKey[] = [STATIC_PAGE_KEYS.CONTACTS];

  for (const pageKey of staticPagesInSitemap) {
    const alternates = buildLocaleStaticAlternates(pageKey);
    for (const locale of supportedLocales) {
      entries.push({
        url: toAbsoluteUrl(getStaticPagePath(locale, pageKey)),
        lastModified: nowIso,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  const defaultLocations = getAllLocationsForLocale(defaultLocale);
  for (const location of defaultLocations) {
    const alternates = buildHreflangAlternates(getLocationAlternatesById(location.id));
    for (const locale of supportedLocales) {
      const localizedLocation = getAllLocationsForLocale(locale).find(
        (item) => item.id === location.id
      );

      if (!localizedLocation) continue;

      const locationPath = getLocationPathFromLocation(locale, localizedLocation);
      entries.push({
        url: toAbsoluteUrl(locationPath),
        lastModified: nowIso,
        changeFrequency: "weekly",
        priority: getLocationPriority(location.id, locale, defaultLocale),
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  const publicCars = (cars || []).filter(isPublicCar);
  for (const car of publicCars) {
    const slug = String(car.slug).trim();
    const alternates = buildHreflangAlternates(getCarAlternates(slug));
    const carLastModified = getLastModifiedDate(car);

    for (const locale of supportedLocales) {
      entries.push({
        url: toAbsoluteUrl(`/${locale}/cars/${encodeURIComponent(slug)}`),
        lastModified: carLastModified,
        changeFrequency: "weekly",
        priority: locale === defaultLocale ? 0.75 : 0.7,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  // ── Category × Location SEO pages (e.g. /automatic-car-rental-halkidiki) ──
  const seoPageSlugs = getAllSeoPageSlugs();
  for (const seoPage of seoPageSlugs) {
    const alternates = buildHreflangAlternates(getSeoPageAlternates(seoPage.seoSlug));
    for (const locale of supportedLocales) {
      entries.push({
        url: toAbsoluteUrl(getSeoPagePath(locale, seoPage.seoSlug)),
        lastModified: nowIso,
        changeFrequency: "weekly",
        priority: locale === defaultLocale ? 0.85 : 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  // ── Brand × Location SEO pages (e.g. /toyota-car-rental-halkidiki) ──
  const brandPages = buildAllBrandPageSlugs(publicCars);
  for (const brandPage of brandPages) {
    const brandAlternates = buildHreflangAlternates(getSeoPageAlternates(brandPage.seoSlug));
    for (const locale of supportedLocales) {
      entries.push({
        url: toAbsoluteUrl(getSeoPagePath(locale, brandPage.seoSlug)),
        lastModified: nowIso,
        changeFrequency: "weekly",
        priority: locale === defaultLocale ? 0.8 : 0.75,
        alternates: { languages: brandAlternates },
      });
    }
  }

  // ── Programmatic rent-{car}-{location} pages ──
  for (const car of publicCars) {
    const carSlug = String(car.slug).trim();
    for (const location of SEO_LOCATIONS) {
      const progSlug = buildProgrammaticSlug(carSlug, location.slugSuffix);
      const progAlternates = buildHreflangAlternates(getSeoPageAlternates(progSlug));
      for (const locale of supportedLocales) {
        entries.push({
          url: toAbsoluteUrl(getSeoPagePath(locale, progSlug)),
          lastModified: getLastModifiedDate(car),
          changeFrequency: "weekly",
          priority: locale === defaultLocale ? 0.7 : 0.65,
          alternates: { languages: progAlternates },
        });
      }
    }
  }

  const validation = validateSitemapEntries(entries);
  if (validation.duplicateUrls.length > 0) {
    throw new Error(
      `[sitemapBuilder] Duplicate sitemap URLs found: ${validation.duplicateUrls.join(", ")}`
    );
  }

  return entries;
}

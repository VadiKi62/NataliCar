import { MetadataRoute } from "next";
import { fetchAllCars } from "@utils/action";

/**
 * Get production base URL for sitemap.
 * Sitemap MUST only contain production URLs, never preview/staging URLs.
 */
function getProductionBaseUrl(): string {
  const PRODUCTION_URL = "https://natali-cars.com";
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "").replace("www.", "");
    if (url === PRODUCTION_URL || url.includes("natali-cars.com")) {
      return PRODUCTION_URL;
    }
  }
  return PRODUCTION_URL;
}

/**
 * Sitemap for production.
 * - Static pages: home, contacts, policies.
 * - Car pages: ONLY /cars/{slug} for cars that have a slug.
 * - No /car/{id} URLs. Exclude cars without slug or unpublished/hidden.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getProductionBaseUrl();
  const currentDate = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: currentDate, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/contacts`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/privacy-policy`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
  ];

  let carEntries: MetadataRoute.Sitemap = [];
  try {
    const cars = await fetchAllCars();
    const publicCars = (cars || []).filter(
      (car: {
        slug?: string;
        isActive?: boolean;
        isHidden?: boolean;
        deletedAt?: string | Date | null;
      }) =>
        car?.slug &&
        String(car.slug).trim() &&
        car?.isActive !== false &&
        car?.isHidden !== true &&
        !car?.deletedAt
    );
    carEntries = publicCars.map(
      (car: {
        slug: string;
        updatedAt?: string | Date;
        dateLastModified?: string | Date;
        dateAddCar?: string | Date;
      }) => ({
        url: `${baseUrl}/cars/${encodeURIComponent(car.slug.trim())}`,
        lastModified: (car.updatedAt
          ? new Date(car.updatedAt)
          : car.dateLastModified
            ? new Date(car.dateLastModified)
            : car.dateAddCar
              ? new Date(car.dateAddCar)
              : new Date()
        ).toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })
    );
  } catch (error) {
    console.error("[sitemap] Failed to fetch cars", error);
  }

  return [...staticEntries, ...carEntries];
}

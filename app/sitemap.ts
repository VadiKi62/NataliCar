import { MetadataRoute } from "next";
import { getSeoConfig } from "@config/seo";

/**
 * Get production base URL for sitemap.
 * Sitemap MUST only contain production URLs, never preview/staging URLs.
 */
function getProductionBaseUrl(): string {
  // Always use NEXT_PUBLIC_SITE_URL if set (should be production domain)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  
  // If VERCEL_ENV is production, VERCEL_URL is the production domain
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For preview/staging deployments, always use production domain
  // This ensures sitemap.xml never contains preview URLs
  return "https://www.natali-cars.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use production URL only (never preview URLs)
  const baseUrl = getProductionBaseUrl();
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return staticPages;
}

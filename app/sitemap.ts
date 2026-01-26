import { MetadataRoute } from "next";
import { getSeoConfig } from "@config/seo";

/**
 * Get production base URL for sitemap.
 * Sitemap MUST only contain production URLs, never preview/staging URLs.
 * 
 * IMPORTANT: Always returns production domain, regardless of deployment environment.
 * Preview/staging deployments should still generate sitemaps pointing to production.
 */
function getProductionBaseUrl(): string {
  // Canonical production URL (без www - все редиректы идут сюда)
  const PRODUCTION_URL = "https://natali-cars.com";
  
  // Only use NEXT_PUBLIC_SITE_URL if it's explicitly the production domain
  // This prevents preview URLs from being used even if env var is set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "").replace("www.", "");
    // Check if it's actually the production domain (not a preview URL)
    if (url === PRODUCTION_URL || url.includes("natali-cars.com")) {
      return PRODUCTION_URL; // Always return canonical URL (без www)
    }
  }
  
  // Always return production URL for sitemap (canonical, без www)
  // Sitemap must always point to production, even when generated in preview/staging
  return PRODUCTION_URL;
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

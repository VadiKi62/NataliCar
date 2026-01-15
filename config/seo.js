/**
 * SEO Configuration
 * Centralized SEO constants to avoid duplication
 * Can accept companyData from DB or fallback to config
 */

import { companyData as fallbackCompanyData } from "@config/company";

// Base URL - prioritize env var, fallback to Vercel preview/production URLs
const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  // Fallback for Vercel deployments
  if (typeof process !== "undefined" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Development fallback
  return "https://www.natali-cars.com";
};

/**
 * Get SEO configuration
 * @param {Object} [dbCompanyData] - Company data from database (optional)
 * @returns {Object} SEO configuration object
 */
export function getSeoConfig(dbCompanyData = null) {
  // Use DB data if available, otherwise fallback to config
  const companyData = dbCompanyData || fallbackCompanyData;

  return {
    siteName: companyData?.name || fallbackCompanyData.name || "Natali Cars",
    baseUrl: getBaseUrl(),
    defaultLocale: "en",
    primaryLocation: "Halkidiki, Greece",
    titleTemplate: "%s | Natali Cars - Car Rental in Halkidiki",
    defaultTitle: "Natali Cars - Car Rental in Halkidiki, Greece",
    defaultDescription:
      "Rent a car in Halkidiki, Greece with Natali Cars. Affordable car hire with flexible pickup and return options. Best car rental service in Halkidiki.",
    // Social links from Footer
    social: {
      facebook: "https://www.facebook.com/people/Natali-carscom/100053110548109/?sk=about",
      instagram: "https://www.facebook.com/people/Natali-carscom/100053110548109/?sk=about",
      linkedin: "https://www.linkedin.com/in/natalia-kirejeva/",
    },
    // Contact info - prefer DB data
    contact: {
      email: companyData?.email || fallbackCompanyData.email || "cars-support@bbqr.site",
      phone: companyData?.tel || fallbackCompanyData.tel || "+30 6970 034 707",
      address: companyData?.address || fallbackCompanyData.address || "Antonioy Kelesi 12, Nea Kallikratia 630 80",
    },
    // Business location coordinates - prefer DB data
    coordinates: {
      lat: companyData?.coords?.lat || fallbackCompanyData.coords?.lat || "40.311273589340836",
      lon: companyData?.coords?.lon || fallbackCompanyData.coords?.lon || "23.06426516796098",
    },
  };
}

// Export default config for backward compatibility (uses fallback data)
export const seoConfig = getSeoConfig();

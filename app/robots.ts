import { MetadataRoute } from "next";

// Always point crawlers to the canonical production domain
const getProductionBaseUrl = () => {
  const PRODUCTION_URL = "https://natali-cars.com";

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "").replace("www.", "");
    if (url === PRODUCTION_URL || url.includes("natali-cars.com")) {
      return PRODUCTION_URL;
    }
  }

  return PRODUCTION_URL;
};

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getProductionBaseUrl();
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

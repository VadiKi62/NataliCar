import { MetadataRoute } from "next";

const PRODUCTION_BASE_URL = "https://natali-cars.com";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = PRODUCTION_BASE_URL;
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login", "/car/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

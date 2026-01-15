import { MetadataRoute } from "next";
import { getSeoConfig } from "@config/seo";

export default function robots(): MetadataRoute.Robots {
  const seoConfig = getSeoConfig();
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login"],
    },
    sitemap: `${seoConfig.baseUrl}/sitemap.xml`,
  };
}

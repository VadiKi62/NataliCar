import { MetadataRoute } from "next";
import { fetchAllCars } from "@utils/action";
import { buildLocalizedSitemap } from "@lib/sitemap/sitemapBuilder";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await fetchAllCars().catch(() => []);
  return buildLocalizedSitemap(cars || []);
}

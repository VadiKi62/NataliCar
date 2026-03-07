import { NextResponse } from "next/server";
import { fetchAllCars } from "@utils/action";
import { buildLocalizedSitemap } from "@lib/sitemap/sitemapBuilder";
import { sitemapToPrettyXml } from "@lib/sitemap/sitemapToXml";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const cars = await fetchAllCars().catch(() => []);
  const entries = buildLocalizedSitemap(cars ?? []);
  const xml = sitemapToPrettyXml(entries);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

import React, { Suspense } from "react";
import Feed from "@app/components/Feed";
import Script from "next/script";
import { unstable_noStore } from "next/cache";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";
import CarGrid from "./components/CarGrid";
import { companyData as companyDataConfig } from "@config/company";
import { getSeoConfig } from "@config/seo";

// Metadata is generated dynamically in the component using DB data
export async function generateMetadata() {
  const { companyId } = companyDataConfig;
  const companyData = await fetchCompany(companyId).catch(() => null);
  const seoConfig = getSeoConfig(companyData);

  return {
    title: "Car Rental in Halkidiki, Greece | Affordable Car Hire",
    description:
      "Rent a car in Halkidiki, Greece with Natali Cars. Choose from our fleet of quality vehicles. Flexible pickup and return options in Nea Kallikratia. Best car rental service in Halkidiki.",
    alternates: {
      canonical: seoConfig.baseUrl,
    },
    openGraph: {
      title: "Car Rental in Halkidiki, Greece | Natali Cars",
      description:
        "Rent a car in Halkidiki, Greece with Natali Cars. Choose from our fleet of quality vehicles. Flexible pickup and return options.",
      url: seoConfig.baseUrl,
    },
  };
}

export default async function Home() {
  unstable_noStore();
  const {companyId} = companyDataConfig;
  
  // Загружаем данные параллельно для ускорения загрузки
  const [carsData, ordersData, companyData] = await Promise.all([
    fetchAllCars(),
    reFetchAllOrders(),
    fetchCompany(companyId),
  ]);

  const company = companyData;
  // Get SEO config with DB company data
  const seoConfig = getSeoConfig(companyData);

  // Structured data (JSON-LD) for LocalBusiness / AutoRental
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: seoConfig.siteName,
    url: seoConfig.baseUrl,
    logo: `${seoConfig.baseUrl}/favicon.png`,
    image: `${seoConfig.baseUrl}/favicon.png`,
    description: seoConfig.defaultDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: seoConfig.contact.address.split(",")[0] || seoConfig.contact.address,
      addressLocality: "Nea Kallikratia",
      addressRegion: "Halkidiki",
      addressCountry: "GR",
      postalCode: "630 80",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: parseFloat(seoConfig.coordinates.lat),
      longitude: parseFloat(seoConfig.coordinates.lon),
    },
    areaServed: {
      "@type": "City",
      name: "Halkidiki",
      addressCountry: "GR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: seoConfig.contact.phone,
      email: seoConfig.contact.email,
      contactType: "Customer Service",
      areaServed: "GR",
      availableLanguage: ["en", "el", "ru"],
    },
    sameAs: [
      seoConfig.social.facebook,
      seoConfig.social.instagram,
      seoConfig.social.linkedin,
    ].filter(Boolean),
    priceRange: "€€",
    openingHours: "Mo-Su 08:00-20:00",
  };

  return (
    <Suspense>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* <CarGrid carsData={carsData} ordersData={ordersData} /> */}
      <Feed cars={carsData} orders={ordersData} isMain={true} company={company}>
        <CarGrid />
      </Feed>
    </Suspense>
  );
}

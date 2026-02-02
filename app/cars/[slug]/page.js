import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCarBySlug, fetchAllCars } from "@utils/action";
import { getSeoConfig } from "@config/seo";

/** Only cars with slug are pre-rendered / in sitemap. */
export async function generateStaticParams() {
  try {
    const cars = await fetchAllCars();
    if (!Array.isArray(cars)) return [];
    return cars
      .filter((c) => c?.slug)
      .map((car) => ({ slug: car.slug }));
  } catch {
    return [];
  }
}

export const generateMetadata = async ({ params }) => {
  const slug = params.slug;
  const seoConfig = getSeoConfig();
  const canonicalUrl = `${seoConfig.baseUrl}/cars/${slug}`;

  try {
    const car = await fetchCarBySlug(slug);
    const carTitle = car?.model || "Car";
    const title = `${carTitle} Rental in Halkidiki | Natali Cars`;
    const description = `Rent ${carTitle} in Halkidiki, Greece with Natali Cars. Affordable rates, flexible pickup and return in Nea Kallikratia. Book online today.`;

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      robots: { index: true, follow: true },
      openGraph: { title, description, url: canonicalUrl, type: "website" },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    return {
      title: "Car Rental in Halkidiki | Natali Cars",
      description: seoConfig.defaultDescription,
      alternates: { canonical: canonicalUrl },
      robots: { index: true, follow: true },
    };
  }
};

async function CarPageBySlug({ params }) {
  const slug = params.slug;
  const seoConfig = getSeoConfig();

  const carData = await fetchCarBySlug(slug).catch(() => null);
  if (!carData) notFound();

  const canonicalUrl = `${seoConfig.baseUrl}/cars/${slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: carData.model,
    brand: "Natali Cars",
    identifier: carData._id,
    url: canonicalUrl,
    image: carData.photoUrl?.startsWith("http")
      ? carData.photoUrl
      : carData.photoUrl
        ? `${seoConfig.baseUrl}${carData.photoUrl}`
        : `${seoConfig.baseUrl}/favicon.png`,
    vehicleTransmission: carData.transmission,
    fuelType: carData.fueltype,
    numberOfDoors: carData.numberOfDoors,
    seatingCapacity: carData.seats,
    vehicleEngine: carData.engine,
    color: carData.color,
    productionDate: carData.registration,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      url: canonicalUrl,
    },
  };

  const modelName = carData.model || "Car";
  const description =
    carData.transmission || carData.fueltype || carData.seats
      ? [
          carData.transmission && `Transmission: ${carData.transmission}`,
          carData.fueltype && `Fuel: ${carData.fueltype}`,
          carData.seats && `Seats: ${carData.seats}`,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <>
      <Script
        id="vehicle-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>{modelName} — аренда в Халкидиках</h1>
        {description && <p style={{ color: "#555", marginBottom: "1rem" }}>{description}</p>}
        <p>
          Аренда автомобиля {modelName} в Неа Калликратии и Халкидиках. Бронируйте онлайн на нашем сайте.
        </p>
        <p>
          <Link href="/">← Все автомобили и календарь бронирования</Link>
        </p>
      </article>
    </>
  );
}

export default CarPageBySlug;

import Script from "next/script";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { fetchCar, fetchAllCars } from "@utils/action";
import { getSeoConfig } from "@config/seo";

const getId = (idParam) => (Array.isArray(idParam) ? idParam[0] : idParam);

/**
 * Legacy route /car/[id]. NOT indexed.
 * - If car exists and has slug → permanentRedirect to /cars/[slug] (308).
 * - If car does not exist → notFound() (404). 410 would require a route handler.
 * - If car exists but no slug → render with robots: noindex, follow.
 */
export async function generateMetadata({ params }) {
  const id = getId(params.id);
  const seoConfig = getSeoConfig();

  try {
    const car = await fetchCar(id);
    if (!car) {
      return { robots: { index: false, follow: false } };
    }
    const carTitle = car.model || "Car";
    const title = `${carTitle} Rental in Halkidiki | Natali Cars`;
    if (car.slug) {
      return {
        title,
        description: `Rent ${carTitle} in Halkidiki, Greece with Natali Cars.`,
        alternates: { canonical: `${seoConfig.baseUrl}/cars/${car.slug}` },
        robots: { index: false, follow: false },
      };
    }
    return {
      title,
      description: `Rent ${carTitle} in Halkidiki, Greece with Natali Cars.`,
      alternates: { canonical: `${seoConfig.baseUrl}/cars/${car.slug || id}` },
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: "Car Rental in Halkidiki | Natali Cars",
      robots: { index: false, follow: false },
    };
  }
}

async function CarPageMain({ params }) {
  const id = getId(params.id);
  const seoConfig = getSeoConfig();

  const carData = await fetchCar(id).catch(() => null);
  if (!carData) {
    notFound();
  }

  if (carData.slug) {
    permanentRedirect(`/cars/${carData.slug}`);
  }

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: carData.model,
    brand: "Natali Cars",
    identifier: carData._id,
    url: `${seoConfig.baseUrl}/cars/${carData.slug || id}`,
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
      url: `${seoConfig.baseUrl}/cars/${carData.slug || id}`,
    },
  };

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

export default CarPageMain;

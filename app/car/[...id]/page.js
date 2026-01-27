import Script from "next/script";
import { fetchCar } from "@utils/action";
import { getSeoConfig } from "@config/seo";

const getId = (idParam) => (Array.isArray(idParam) ? idParam[0] : idParam);

export const generateMetadata = async ({ params }) => {
  const id = getId(params.id);

  try {
    const car = await fetchCar(id);
    const carTitle = car?.model || "Car";
    const title = `${carTitle} Rental in Halkidiki | Natali Cars`;
    const description = `Rent ${carTitle} in Halkidiki, Greece with Natali Cars. Affordable rates, flexible pickup and return in Nea Kallikratia. Book online today.`;
    const seoConfig = getSeoConfig();

    return {
      title,
      description,
      alternates: {
        canonical: `${seoConfig.baseUrl}/car/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `${seoConfig.baseUrl}/car/${id}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    const seoConfig = getSeoConfig();
    return {
      title: "Car Rental in Halkidiki | Natali Cars",
      description: seoConfig.defaultDescription,
      alternates: {
        canonical: `${seoConfig.baseUrl}/car/${id}`,
      },
    };
  }
};

async function CarPageMain({ params }) {
  const id = getId(params.id);
  const seoConfig = getSeoConfig();

  const carData = await fetchCar(id).catch(() => null);

  const structuredData = carData
    ? {
        "@context": "https://schema.org",
        "@type": "Vehicle",
        name: carData.model,
        brand: "Natali Cars",
        identifier: carData._id,
        url: `${seoConfig.baseUrl}/car/${id}`,
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
          url: `${seoConfig.baseUrl}/car/${id}`,
        },
      }
    : null;

  return (
    <>
      {structuredData && (
        <Script
          id="vehicle-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <h1>Car Page</h1>
      {/* <Suspense fallback={<Loading />}>
        <Feed car={carData} />
      </Suspense> */}
    </>
  );
}

export default CarPageMain;

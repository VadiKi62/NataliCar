import { notFound, permanentRedirect } from "next/navigation";
import { fetchCar } from "@utils/action";
import { getDefaultLocale } from "@domain/locationSeo/locationSeoService";

const getId = (idParam) => (Array.isArray(idParam) ? idParam[0] : idParam);

export async function generateMetadata() {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LegacyCarIdRedirectPage({ params }) {
  const id = getId(params.id);
  const car = await fetchCar(id).catch(() => null);

  if (!car) {
    notFound();
  }

  if (car.slug) {
    permanentRedirect(`/${getDefaultLocale()}/cars/${encodeURIComponent(car.slug)}`);
  }

  notFound();
}

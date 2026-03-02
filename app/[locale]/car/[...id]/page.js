import { notFound, permanentRedirect } from "next/navigation";
import { fetchCar } from "@utils/action";
import { normalizeLocale } from "@domain/locationSeo/locationSeoService";

const getId = (idParam) => (Array.isArray(idParam) ? idParam[0] : idParam);

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata() {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LocalizedLegacyCarPage({ params }) {
  const locale = normalizeLocale(params.locale);
  const id = getId(params.id);

  const car = await fetchCar(id).catch(() => null);
  if (!car) {
    notFound();
  }

  if (car.slug) {
    permanentRedirect(`/${locale}/cars/${encodeURIComponent(car.slug)}`);
  }

  notFound();
}

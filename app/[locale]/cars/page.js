import { redirect } from "next/navigation";
import { normalizeLocale } from "@domain/locationSeo/locationSeoService";

export default function LocalizedCarsIndexPage({ params }) {
  const locale = normalizeLocale(params.locale);
  redirect(`/${locale}`);
}

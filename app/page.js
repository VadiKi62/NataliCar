import { redirect } from "next/navigation";
import { getDefaultLocale } from "@domain/locationSeo/locationSeoService";

export default function HomePageRedirect() {
  redirect(`/${getDefaultLocale()}`);
}

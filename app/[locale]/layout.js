import { notFound } from "next/navigation";
import {
  getHubLocationsForNav,
  getLocaleDictionary,
  getLocaleRouteParams,
  getLocationPath,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { NavLocationsProvider } from "@app/context/NavLocationsContext";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocaleRouteParams();
}

export default function LocaleLayout({ children, params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const hubLocations = getHubLocationsForNav(locale);
  const dictionary = getLocaleDictionary(locale);
  const hubLinks = hubLocations.map((loc) => ({
    href: getLocationPath(locale, loc.slug),
    label: loc.shortName,
  }));
  const navLocationsDescription = dictionary?.links?.navLocationsDropdownDescription ?? "";

  return (
    <NavLocationsProvider
      hubLinks={hubLinks}
      navLocationsDescription={navLocationsDescription}
    >
      {children}
    </NavLocationsProvider>
  );
}

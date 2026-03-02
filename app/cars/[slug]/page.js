import { permanentRedirect } from "next/navigation";
import { getDefaultLocale } from "@domain/locationSeo/locationSeoService";

export async function generateMetadata() {
  return {
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function LegacyCarsSlugRedirectPage({ params }) {
  permanentRedirect(`/${getDefaultLocale()}/cars/${encodeURIComponent(params.slug)}`);
}

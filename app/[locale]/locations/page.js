import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import Feed from "@app/components/Feed";
import {
  getAllLocationsForLocale,
  getHubSeo,
  getLocaleDictionary,
  getLocationPath,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { buildLocationsIndexMetadata } from "@/services/seo/metadataBuilder";
import { SeoIntroBlock, SeoLinksBlock } from "@app/components/seo/SeoContentBlocks";

export async function generateMetadata({ params }) {
  return buildLocationsIndexMetadata(params.locale);
}

export default function LocalizedLocationsIndexPage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const hubSeo = getHubSeo(locale);
  const dictionary = getLocaleDictionary(locale);
  const locationLinks = getAllLocationsForLocale(locale).map((location) => ({
    href: getLocationPath(locale, location.slug),
    label: location.shortName,
  }));

  return (
    <Feed locale={locale} isMain={false}>
      <Box
        component="main"
        sx={{
          color: "text.primary",
          bgcolor: "background.default",
          minHeight: "60vh",
          py: 3,
          px: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ maxWidth: 980, mx: "auto" }}>
          <SeoIntroBlock title={hubSeo.h1} introText={hubSeo.introText} />
          <SeoLinksBlock
            title={dictionary.links.hubToLocationsTitle}
            links={locationLinks}
          />
        </Box>
      </Box>
    </Feed>
  );
}

/**
 * Hero image configuration for location pages.
 * Keys must match location ids (LOCATION_IDS from locationSeoKeys).
 *
 * To add an image for a new location, add an entry to LOCATION_HERO_IMAGES
 * with the location id as key (e.g. "nikiti", "sithonia") and defaultSrc + portraitPhoneSrc.
 */

const DEFAULT_HERO = {
  defaultSrc: "/car-rental-neakallikratia.png",
  portraitPhoneSrc: "/car-rental-neakallikratia-portrait.png",
} as const;

export const LOCATION_HERO_IMAGES: Record<
  string,
  { defaultSrc: string; portraitPhoneSrc: string }
> = {
  "nea-kallikratia": {
    defaultSrc: "/car-rental-neakallikratia.png",
    portraitPhoneSrc: "/car-rental-neakallikratia-portrait.png",
  },
  halkidiki: {
    defaultSrc: "/car-rental-halkidiki.png",
    portraitPhoneSrc: "/car-rental-halkidiki-portrait.png",
  },
  "thessaloniki-airport": {
    defaultSrc: "/car-rental-thessaloniki-airport.png",
    portraitPhoneSrc: "/car-rental-thessaloniki-airport-portrait.png",
  },
  thessaloniki: {
    defaultSrc: "/car-rental-thessaloniki.png",
    portraitPhoneSrc: "/car-rental-thessaloniki-portrait.png",
  },
};

/**
 * Optional "Distance to Thessaloniki" paragraph per location (for location page content).
 * To add an image for a new location, add it to LOCATION_HERO_IMAGES.
 */
export const LOCATION_DISTANCE_TEXT: Record<string, string> = {
  "nea-kallikratia":
    "Nea Kallikratia is located about 35 km from Thessaloniki and about 25 km from Thessaloniki Airport (SKG).",
  "thessaloniki-airport":
    "Thessaloniki Airport (SKG) is the main international airport serving Thessaloniki and the wider region.",
  thessaloniki:
    "Thessaloniki is the second-largest city in Greece and the main hub for Northern Greece.",
  halkidiki:
    "Halkidiki is about 110 km from Thessaloniki and roughly 90 km from Thessaloniki Airport (SKG).",
};

/**
 * Returns hero image config for a location id. Falls back to default if not in config.
 */
export function getLocationHeroImage(locationId: string): {
  defaultSrc: string;
  portraitPhoneSrc: string;
} {
  return (
    LOCATION_HERO_IMAGES[locationId] || {
      ...DEFAULT_HERO,
    }
  );
}

export function getLocationDistanceText(locationId: string): string | undefined {
  return LOCATION_DISTANCE_TEXT[locationId];
}

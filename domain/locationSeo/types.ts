import type {
  LocationContentKey,
  LocationId,
  LocationType,
  StaticPageKey,
  SupportedLocale,
} from "./locationSeoKeys";

export interface LocationSeoRepoItem {
  id: LocationId;
  canonicalSlug: string;
  locationType: LocationType;
  slugByLocale: Record<SupportedLocale, string>;
  contentKey: LocationContentKey;
  parentId?: LocationId | null;
  childIds?: LocationId[];
}

export interface LocationSeoFaqItem {
  question: string;
  answer: string;
}

export interface LocationSeoContent {
  shortName: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  introText: string;
  areaServed: string[];
  pickupLocation: string;
  offerName: string;
  offerDescription: string;
  /** Optional: pickup guidance paragraph for city/SEO pages */
  pickupGuidance?: string;
  /** Optional: 3-item nearby places list */
  nearbyPlaces?: string[];
  /** Optional: 3-item FAQ for local content */
  faq?: LocationSeoFaqItem[];
}

export interface HubSeoContent {
  h1: string;
  seoTitle: string;
  seoDescription: string;
  introText: string;
}

export interface CarFaqItem {
  question: string;
  answer: string;
}

export interface CarSeoContent {
  seoTitleTemplate: string;
  seoDescriptionTemplate: string;
  /** H1 e.g. "Rent {carModel} in {locationName}" */
  carH1Template: string;
  introTemplate: string;
  /** Longer intro 150–200 words for SEO */
  introLongTemplate: string;
  specsTitle: string;
  quickSpecsTitle: string;
  featuresTitle: string;
  whyRentTitle: string;
  whyRentBullets: string[];
  faqTitle: string;
  faq: CarFaqItem[];
  breadcrumbHome: string;
  breadcrumbCars: string;
  breadcrumbCarRentalLocation: string;
  pickupTitle: string;
  pillarLinksTitle: string;
}

export interface LinkSeoContent {
  hubToLocationsTitle: string;
  locationToCarsTitle: string;
  locationToHubLabel: string;
  locationToParentLabel: string;
  locationToChildrenTitle: string;
  locationToSiblingTitle: string;
  carsToLocationsTitle: string;
  carsToHubLabel: string;
  carsListTitle: string;
  mainHubLabel: string;
  /** Template for city page CTA: "Search cars in {locationName}" → homepage with pickup param */
  locationSearchCtaLabel: string;
  /** Hero CTA button on location pages: "Find your car" → main page */
  locationHeroCtaLabel: string;
  pickupGuidanceTitle: string;
  nearbyPlacesTitle: string;
  localFaqTitle: string;
  /** Short description for the navbar Locations mega menu (left column). */
  navLocationsDropdownDescription: string;
  /** Title for "Other cars you may like" section on single car pages. */
  otherCarsTitle: string;
}

export interface StaticPageSeoContent {
  seoTitle: string;
  seoDescription: string;
}

export interface LocaleSeoDictionary {
  hub: HubSeoContent;
  car: CarSeoContent;
  links: LinkSeoContent;
  staticPages: Record<StaticPageKey, StaticPageSeoContent>;
}

export interface LocationSeoResolved {
  id: LocationId;
  slug: string;
  locale: SupportedLocale;
  seoTitle: string;
  seoDescription: string;
  introText: string;
  areaServed: string[];
  canonicalSlug: string;
  locationType: LocationType;
  parentId: LocationId | null;
  childIds: LocationId[];
  shortName: string;
  h1: string;
  pickupLocation: string;
  offerName: string;
  offerDescription: string;
  pickupGuidance?: string;
  nearbyPlaces?: string[];
  faq?: LocationSeoFaqItem[];
}

export interface LocationAlternateMap {
  [locale: string]: string;
}

export interface LocaleDetectionInput {
  cookieLocale?: string | null;
  acceptLanguageHeader?: string | null;
}

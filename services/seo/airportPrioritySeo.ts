import {
  LOCATION_IDS,
  type SupportedLocale,
} from "@domain/locationSeo/locationSeoKeys";
import type { LocationSeoResolved } from "@domain/locationSeo/types";

type AirportPrioritySeoText = {
  h1: string;
  seoTitle: string;
  seoDescription: string;
  introText: string;
};

const AIRPORT_PRIORITY_SEO_BY_LOCALE: Record<SupportedLocale, AirportPrioritySeoText> = {
  en: {
    h1: "Car Rental Thessaloniki Airport (SKG)",
    seoTitle: "Car Rental Thessaloniki Airport (SKG) | Natali Cars",
    seoDescription:
      "Car rental Thessaloniki Airport (SKG) with terminal pickup, direct support, and fast transfer to Halkidiki.",
    introText:
      "Car rental Thessaloniki Airport (SKG) with pickup at the terminal and quick route to Halkidiki resorts.",
  },
  ru: {
    h1: "Аренда авто аэропорт Салоники (SKG)",
    seoTitle: "Аренда авто аэропорт Салоники (SKG) | Natali Cars",
    seoDescription:
      "Аренда авто аэропорт Салоники (SKG) с выдачей в терминале, быстрой подачей и удобным выездом в Халкидики.",
    introText:
      "Аренда авто аэропорт Салоники (SKG) с выдачей в терминале. Быстрый выезд в Халкидики, прозрачные условия и поддержка Natali Cars.",
  },
  uk: {
    h1: "Оренда авто аеропорт Салоніки (SKG)",
    seoTitle: "Оренда авто аеропорт Салоніки (SKG) | Natali Cars",
    seoDescription:
      "Оренда авто аеропорт Салоніки (SKG) з видачею в терміналі, швидкою передачею та зручним виїздом до Халкідік.",
    introText:
      "Оренда авто аеропорт Салоніки (SKG) з отриманням у терміналі та швидким маршрутом до курортів Халкідік.",
  },
  el: {
    h1: "Ενοικίαση αυτοκινήτου αεροδρόμιο Θεσσαλονίκη (SKG)",
    seoTitle: "Ενοικίαση αυτοκινήτου αεροδρόμιο Θεσσαλονίκη (SKG) | Natali Cars",
    seoDescription:
      "Ενοικίαση αυτοκινήτου αεροδρόμιο Θεσσαλονίκη (SKG) με παραλαβή στο terminal και άμεση πρόσβαση στη Χαλκιδική.",
    introText:
      "Ενοικίαση αυτοκινήτου αεροδρόμιο Θεσσαλονίκη (SKG) με γρήγορη παραλαβή και άμεση αναχώρηση για Χαλκιδική.",
  },
  de: {
    h1: "Mietwagen Flughafen Thessaloniki (SKG)",
    seoTitle: "Mietwagen Flughafen Thessaloniki (SKG) | Natali Cars",
    seoDescription:
      "Mietwagen Flughafen Thessaloniki (SKG) mit Übergabe im Terminal, direktem Support und schneller Fahrt nach Chalkidiki.",
    introText:
      "Mietwagen Flughafen Thessaloniki (SKG) mit schneller Übernahme am Terminal und direkter Route zu den Resorts in Chalkidiki.",
  },
  bg: {
    h1: "Кола под наем летище Солун (SKG)",
    seoTitle: "Кола под наем летище Солун (SKG) | Natali Cars",
    seoDescription:
      "Кола под наем летище Солун (SKG) с получаване на терминала, бърза поддръжка и удобен трансфер до Халкидики.",
    introText:
      "Кола под наем летище Солун (SKG) с бързо получаване на терминала и директен маршрут към курортите в Халкидики.",
  },
  ro: {
    h1: "Închirieri auto aeroport Salonic (SKG)",
    seoTitle: "Închirieri auto aeroport Salonic (SKG) | Natali Cars",
    seoDescription:
      "Închirieri auto aeroport Salonic (SKG) cu preluare la terminal, suport direct și transfer rapid către Halkidiki.",
    introText:
      "Închirieri auto aeroport Salonic (SKG) cu predare rapidă la terminal și traseu direct spre stațiunile din Halkidiki.",
  },
  sr: {
    h1: "Rent a car aerodrom Solun (SKG)",
    seoTitle: "Rent a car aerodrom Solun (SKG) | Natali Cars",
    seoDescription:
      "Rent a car aerodrom Solun (SKG) sa preuzimanjem na terminalu, direktnom podrškom i brzim transferom ka Halkidikiju.",
    introText:
      "Rent a car aerodrom Solun (SKG) uz brzo preuzimanje i direktan polazak ka letovalištima na Halkidikiju.",
  },
};

export function isPriorityAirportLocation(
  location: Pick<LocationSeoResolved, "id">
): boolean {
  return location.id === LOCATION_IDS.THESSALONIKI_AIRPORT;
}

export function getAirportPrioritySeo(locale: SupportedLocale): AirportPrioritySeoText {
  return AIRPORT_PRIORITY_SEO_BY_LOCALE[locale];
}


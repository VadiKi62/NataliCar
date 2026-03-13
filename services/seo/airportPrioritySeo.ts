import {
  LOCATION_IDS,
  type SupportedLocale,
} from "@domain/locationSeo/locationSeoKeys";
import type { LocationSeoResolved } from "@domain/locationSeo/types";

export type AirportDistanceRow = { location: string; distance: string };

export type AirportPrioritySeoText = {
  h1: string;
  heroSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  introText: string;
  /** Long SEO text 400–600 words */
  seoLongText: string;
  /** Title for benefits block */
  benefitBlockTitle: string;
  /** Why rent at airport — 5 bullets */
  quickBenefits: string[];
  /** Distance table title */
  distanceTableTitle: string;
  /** Rows for distance table */
  distanceTableRows: AirportDistanceRow[];
  /** Map section title */
  mapSectionTitle: string;
};

const AIRPORT_PRIORITY_SEO_BY_LOCALE: Record<SupportedLocale, AirportPrioritySeoText> = {
  en: {
    h1: "Car Rental at Thessaloniki Airport (SKG)",
    heroSubtitle: "Pick up your rental car directly at Thessaloniki Airport and start your Halkidiki trip without delays.",
    seoTitle: "Car Rental Thessaloniki Airport (SKG) | Natali Cars",
    seoDescription:
      "Rent a car at Thessaloniki Airport (SKG) with pickup on arrival. Affordable car rental for Halkidiki trips. Automatic and economy cars available.",
    introText:
      "Car rental Thessaloniki Airport (SKG) with pickup at the terminal and quick route to Halkidiki resorts.",
    seoLongText:
      "Renting a car at Thessaloniki Airport (SKG) is the easiest way to start your trip to Halkidiki. The airport is located only about 30 minutes from Nea Kallikratia and around one hour from many popular resorts in Halkidiki. With a rental car you can explore beautiful beaches, traditional villages and coastal roads without relying on public transport. Natali Cars offers pickup directly at the airport terminal, so you can collect your vehicle as soon as you land and drive straight to your accommodation. No need for taxis or shuttle buses — your car is ready when you are. The drive from Thessaloniki Airport to Halkidiki takes you along scenic routes with views of the Gulf of Thessaloniki. Nea Kallikratia is approximately 35 km away, while the main Halkidiki peninsula resorts are within 60–90 km. Thessaloniki city center is only 15 km from the airport if you need to make a stop. We offer flexible pickup times to match your flight schedule, competitive prices and a range of vehicles from economy to automatic and family cars. All rentals include comprehensive insurance and 24/7 support. Book your car rental at Thessaloniki Airport online and enjoy a stress-free start to your Halkidiki holiday.",
    benefitBlockTitle: "Why rent a car at Thessaloniki Airport",
    quickBenefits: [
      "Immediate pickup after arrival",
      "No need for taxi or bus",
      "Direct drive to Halkidiki beaches",
      "Flexible pickup times",
      "Competitive prices",
    ],
    distanceTableTitle: "Distance from Thessaloniki Airport",
    distanceTableRows: [
      { location: "Nea Kallikratia", distance: "35 km" },
      { location: "Halkidiki", distance: "60 km" },
      { location: "Thessaloniki center", distance: "15 km" },
      { location: "Kassandra", distance: "85 km" },
      { location: "Sithonia", distance: "95 km" },
    ],
    mapSectionTitle: "Pickup location near Thessaloniki Airport",
  },
  ru: {
    h1: "Аренда авто аэропорт Салоники (SKG)",
    heroSubtitle: "Получите авто прямо в аэропорту Салоники и начните поездку в Халкидики без задержек.",
    seoTitle: "Аренда авто аэропорт Салоники (SKG) | Natali Cars",
    seoDescription: "Аренда авто в аэропорту Салоники (SKG) с подачей по прилёте. Недорогой прокат для поездок в Халкидики. Автомат и эконом.",
    introText: "Аренда авто аэропорт Салоники (SKG) с выдачей в терминале. Быстрый выезд в Халкидики.",
    seoLongText:
      "Аренда авто в аэропорту Салоники (SKG) — самый удобный способ начать поездку в Халкидики. Аэропорт расположен примерно в 30 минутах от Неа Каликратии и в часе езды от многих курортов Халкидиков. С арендованной машиной вы можете исследовать пляжи, деревни и побережье без общественного транспорта. Natali Cars предлагает подачу в терминале аэропорта. Не нужны такси или трансферы — машина готова к вашему прилёту. До Неа Каликратии около 35 км, до курортов Халкидиков — 60–90 км. Центр Салоников в 15 км от аэропорта. Гибкое время подачи, конкурентные цены, полная страховка. Забронируйте авто в аэропорту Салоники онлайн.",
    benefitBlockTitle: "Почему арендовать авто в аэропорту Салоники",
    quickBenefits: [
      "Подача сразу после прилёта",
      "Без такси и автобусов",
      "Прямая дорога к пляжам Халкидиков",
      "Гибкое время подачи",
      "Выгодные цены",
    ],
    distanceTableTitle: "Расстояние от аэропорта Салоники",
    distanceTableRows: [
      { location: "Неа Каликратия", distance: "35 км" },
      { location: "Халкидики", distance: "60 км" },
      { location: "Центр Салоников", distance: "15 км" },
      { location: "Кассандра", distance: "85 км" },
      { location: "Ситония", distance: "95 км" },
    ],
    mapSectionTitle: "Подача рядом с аэропортом Салоники",
  },
  uk: {
    h1: "Оренда авто аеропорт Салоніки (SKG)",
    heroSubtitle: "Отримайте авто прямо в аеропорту Салоніки та почніть поїздку до Халкідік без затримок.",
    seoTitle: "Оренда авто аеропорт Салоніки (SKG) | Natali Cars",
    seoDescription: "Оренда авто в аеропорту Салоніки (SKG) з подачею по прильоту. Недорогий прокат для поїздок у Халкідіки.",
    introText: "Оренда авто аеропорт Салоніки (SKG) з отриманням у терміналі та швидким маршрутом до курортів Халкідік.",
    seoLongText:
      "Оренда авто в аеропорту Салоніки (SKG) — найзручніший спосіб почати поїздку до Халкідік. Аеропорт знаходиться приблизно за 30 хвилин від Неа Калікратії. Natali Cars пропонує подачу в терміналі. Машина готова до вашого прильоту. Гнучкий час подачі, вигідні цени. Забронюйте авто в аеропорту Салоніки онлайн.",
    benefitBlockTitle: "Чому орендувати авто в аеропорту Салоніки",
    quickBenefits: [
      "Подача одразу після прильоту",
      "Без таксі та автобусів",
      "Пряма дорога до пляжів Халкідік",
      "Гнучкий час подачі",
      "Вигідні ціни",
    ],
    distanceTableTitle: "Відстань від аеропорту Салоніки",
    distanceTableRows: [
      { location: "Неа Калікратія", distance: "35 км" },
      { location: "Халкідіки", distance: "60 км" },
      { location: "Центр Салонік", distance: "15 км" },
      { location: "Кассандра", distance: "85 км" },
      { location: "Сітонія", distance: "95 км" },
    ],
    mapSectionTitle: "Подача біля аеропорту Салоніки",
  },
  el: {
    h1: "Ενοικίαση αυτοκινήτου αεροδρόμιο Θεσσαλονίκη (SKG)",
    heroSubtitle: "Παραλάβετε το αυτοκίνητό σας απευθείας στο αεροδρόμιο Θεσσαλονίκης και ξεκινήστε για τη Χαλκιδική χωρίς καθυστερήσεις.",
    seoTitle: "Ενοικίαση αυτοκινήτου αεροδρόμιο Θεσσαλονίκη (SKG) | Natali Cars",
    seoDescription: "Νοικιάστε αυτοκίνητο στο αεροδρόμιο Θεσσαλονίκης (SKG) με παραλαβή upon arrival. Οικονομική ενοικίαση για τη Χαλκιδική.",
    introText: "Ενοικίαση αυτοκινήτου αεροδρόμιο Θεσσαλονίκη (SKG) με γρήγορη παραλαβή και άμεση αναχώρηση για Χαλκιδική.",
    seoLongText:
      "Η ενοικίαση αυτοκινήτου στο αεροδρόμιο Θεσσαλονίκης (SKG) είναι ο ευκολότερος τρόπος να ξεκινήσετε το ταξίδι σας στη Χαλκιδική. Το αεροδρόμιο απέχει περίπου 30 λεπτά από τη Νέα Καλλικράτεια και περίπου μία ώρα από πολλά δημοφιλή θέρετρα. Με ενοικιαζόμενο αυτοκίνητο μπορείτε να εξερευνήσετε παραλίες και παραθαλάσσια χωριά. Η Natali Cars προσφέρει παραλαβή στο terminal. Κλείστε online.",
    benefitBlockTitle: "Γιατί να νοικιάσετε αυτοκίνητο στο αεροδρόμιο Θεσσαλονίκης",
    quickBenefits: [
      "Άμεση παραλαβή μετά την άφιξη",
      "Χωρίς ταξί ή λεωφορεία",
      "Απευθείας για τις παραλίες της Χαλκιδικής",
      "Ευέλικτες ώρες παραλαβής",
      "Ανταγωνιστικές τιμές",
    ],
    distanceTableTitle: "Απόσταση από αεροδρόμιο Θεσσαλονίκης",
    distanceTableRows: [
      { location: "Νέα Καλλικράτεια", distance: "35 km" },
      { location: "Χαλκιδική", distance: "60 km" },
      { location: "Κέντρο Θεσσαλονίκης", distance: "15 km" },
      { location: "Κασσάνδρα", distance: "85 km" },
      { location: "Σιθωνία", distance: "95 km" },
    ],
    mapSectionTitle: "Σημείο παραλαβής κοντά στο αεροδρόμιο",
  },
  de: {
    h1: "Mietwagen Flughafen Thessaloniki (SKG)",
    heroSubtitle: "Holen Sie Ihr Mietauto direkt am Flughafen Thessaloniki ab und starten Sie ohne Verzögerung in die Chalkidiki.",
    seoTitle: "Mietwagen Flughafen Thessaloniki (SKG) | Natali Cars",
    seoDescription: "Mietwagen am Flughafen Thessaloniki (SKG) mit Abholung bei Ankunft. Günstige Mieten für Chalkidiki. Automatik und Economy.",
    introText: "Mietwagen Flughafen Thessaloniki (SKG) mit schneller Übernahme am Terminal und direkter Route zu den Resorts in Chalkidiki.",
    seoLongText:
      "Ein Mietwagen am Flughafen Thessaloniki (SKG) ist der einfachste Start in die Chalkidiki. Der Flughafen liegt etwa 30 Minuten von Nea Kallikratia und etwa eine Stunde von vielen Resorts entfernt. Mit dem Mietwagen erkunden Sie Strände und Küstenorte. Natali Cars bietet Abholung am Terminal. Buchen Sie online.",
    benefitBlockTitle: "Warum am Flughafen Thessaloniki mieten",
    quickBenefits: [
      "Abholung direkt nach Ankunft",
      "Kein Taxi oder Bus nötig",
      "Direkt zu den Stränden der Chalkidiki",
      "Flexible Abholzeiten",
      "Konkurrenzfähige Preise",
    ],
    distanceTableTitle: "Entfernung vom Flughafen Thessaloniki",
    distanceTableRows: [
      { location: "Nea Kallikratia", distance: "35 km" },
      { location: "Chalkidiki", distance: "60 km" },
      { location: "Thessaloniki Zentrum", distance: "15 km" },
      { location: "Kassandra", distance: "85 km" },
      { location: "Sithonia", distance: "95 km" },
    ],
    mapSectionTitle: "Abholort am Flughafen Thessaloniki",
  },
  bg: {
    h1: "Кола под наем летище Солун (SKG)",
    heroSubtitle: "Вземете колата си директно на летище Солун и тръгнете за Халкидики без забавяне.",
    seoTitle: "Кола под наем летище Солун (SKG) | Natali Cars",
    seoDescription: "Наем на кола на летище Солун (SKG) с получаване при пристигане. Доступен наем за Халкидики.",
    introText: "Кола под наем летище Солун (SKG) с бързо получаване на терминала и директен маршрут към курортите в Халкидики.",
    seoLongText:
      "Наемът на кола на летище Солун (SKG) е най-лесният старт за Халкидики. Летището е на около 30 минути от Неа Каликратия. С наета кола можете да посетите плажове и курорти. Natali Cars предлага получаване на терминала. Резервирайте онлайн.",
    benefitBlockTitle: "Защо да наемете кола на летище Солун",
    quickBenefits: [
      "Получаване веднага след пристигане",
      "Без такси или автобус",
      "Директно до плажовете на Халкидики",
      "Гъвкаво време за получаване",
      "Конкурентни цени",
    ],
    distanceTableTitle: "Разстояние от летище Солун",
    distanceTableRows: [
      { location: "Неа Каликратия", distance: "35 км" },
      { location: "Халкидики", distance: "60 км" },
      { location: "Център Солун", distance: "15 км" },
      { location: "Касандра", distance: "85 км" },
      { location: "Ситония", distance: "95 км" },
    ],
    mapSectionTitle: "Място за получаване при летище Солун",
  },
  ro: {
    h1: "Închirieri auto aeroport Salonic (SKG)",
    heroSubtitle: "Ridicați mașina direct de la aeroportul Salonic și porniți spre Halkidiki fără întârzieri.",
    seoTitle: "Închirieri auto aeroport Salonic (SKG) | Natali Cars",
    seoDescription: "Închirieri auto la aeroportul Salonic (SKG) cu preluare la sosire. Închirieri pentru Halkidiki. Automat și economy.",
    introText: "Închirieri auto aeroport Salonic (SKG) cu predare rapidă la terminal și traseu direct spre stațiunile din Halkidiki.",
    seoLongText:
      "Închirierea unei mașini la aeroportul Salonic (SKG) este cel mai simplu mod de a începe călătoria în Halkidiki. Aeroportul este la aproximativ 30 de minute de Nea Kallikratia. Cu mașina închiriată explorați plaje și sate. Natali Cars oferă preluare la terminal. Rezervați online.",
    benefitBlockTitle: "De ce să închiriați mașină la aeroportul Salonic",
    quickBenefits: [
      "Preluare imediat după sosire",
      "Fără taxi sau autobuz",
      "Conducere directă spre plajele din Halkidiki",
      "Ore flexibile de preluare",
      "Prețuri competitive",
    ],
    distanceTableTitle: "Distanță de la aeroportul Salonic",
    distanceTableRows: [
      { location: "Nea Kallikratia", distance: "35 km" },
      { location: "Halkidiki", distance: "60 km" },
      { location: "Centrul Salonic", distance: "15 km" },
      { location: "Kassandra", distance: "85 km" },
      { location: "Sithonia", distance: "95 km" },
    ],
    mapSectionTitle: "Locație preluare lângă aeroportul Salonic",
  },
  sr: {
    h1: "Rent a car aerodrom Solun (SKG)",
    heroSubtitle: "Preuzmite auto direktno na aerodromu Solun i krenite ka Halkidikiju bez odlaganja.",
    seoTitle: "Rent a car aerodrom Solun (SKG) | Natali Cars",
    seoDescription: "Iznajmljivanje auta na aerodromu Solun (SKG) sa preuzimanjem po dolasku. Pristupačno za Halkidiki.",
    introText: "Rent a car aerodrom Solun (SKG) uz brzo preuzimanje i direktan polazak ka letovalištima na Halkidikiju.",
    seoLongText:
      "Iznajmljivanje auta na aerodromu Solun (SKG) je najlakši način da započnete putovanje na Halkidiki. Aerodrom je oko 30 minuta od Nea Kalikratije. Sa iznajmljenim autom istražujete plaže i letovališta. Natali Cars nudi preuzimanje na terminalu. Rezervište online.",
    benefitBlockTitle: "Zašto iznajmiti auto na aerodromu Solun",
    quickBenefits: [
      "Preuzimanje odmah po dolasku",
      "Bez taksi ili autobusa",
      "Direktno do plaža na Halkidikiju",
      "Fleksibilno vreme preuzimanja",
      "Konkurentne cene",
    ],
    distanceTableTitle: "Udaljenost od aerodroma Solun",
    distanceTableRows: [
      { location: "Nea Kalikratija", distance: "35 km" },
      { location: "Halkidiki", distance: "60 km" },
      { location: "Centar Soluna", distance: "15 km" },
      { location: "Kasandra", distance: "85 km" },
      { location: "Sitonija", distance: "95 km" },
    ],
    mapSectionTitle: "Mesto preuzimanja kod aerodroma Solun",
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


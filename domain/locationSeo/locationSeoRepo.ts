import {
  DEFAULT_LOCALE,
  LOCATION_CONTENT_KEYS,
  LOCATION_IDS,
  STATIC_PAGE_KEYS,
  SUPPORTED_LOCALES,
  type LocationContentKey,
  type SupportedLocale,
} from "./locationSeoKeys";
import type {
  LocaleSeoDictionary,
  LocationSeoContent,
  LocationSeoRepoItem,
} from "./types";

type PartialLocaleRecord<T> = Partial<Record<SupportedLocale, T>>;

function expandLocaleRecord<T>(partial: PartialLocaleRecord<T>): Record<SupportedLocale, T> {
  const fallback = partial[DEFAULT_LOCALE];
  if (!fallback) {
    throw new Error("[locationSeoRepo] Missing default locale content");
  }

  return SUPPORTED_LOCALES.reduce((acc, locale) => {
    acc[locale] = partial[locale] || fallback;
    return acc;
  }, {} as Record<SupportedLocale, T>);
}

const localeSeoDictionaryRaw: PartialLocaleRecord<LocaleSeoDictionary> = {
  en: {
    hub: {
      h1: "Car Rental in Halkidiki and Thessaloniki",
      seoTitle: "Car Rental in Halkidiki, Thessaloniki and Airport | Natali Cars",
      seoDescription:
        "Book a rental car in Halkidiki, Thessaloniki city, and Thessaloniki Airport with localized pickup options, transparent pricing, and direct support.",
      introText:
        "Natali Cars provides car rental coverage across Halkidiki sub-regions and Thessaloniki access points with one booking flow and location-specific pickup guidance.",
    },
    car: {
      seoTitleTemplate: "{carModel} Rental in Halkidiki and Thessaloniki | Natali Cars",
      seoDescriptionTemplate:
        "Rent {carModel} with pickup options in {locationName}. Transparent rates, direct support, and flexible handover with Natali Cars.",
      introTemplate:
        "Choose {carModel} and arrange pickup in {locationName}. This page is localized for regional SEO and links to location hubs.",
    },
    links: {
      hubToLocationsTitle: "Explore Car Rental Locations",
      locationToCarsTitle: "Available Cars for This Location",
      locationToHubLabel: "Back to Main Car Rental Hub",
      locationToParentLabel: "Back to Parent Location",
      locationToChildrenTitle: "Sub-locations",
      locationToSiblingTitle: "Nearby Alternative Locations",
      carsToLocationsTitle: "Popular Pickup Locations",
      carsToHubLabel: "Back to Main Hub",
      carsListTitle: "Browse Car Models",
      mainHubLabel: "Main Car Rental Hub",
      locationSearchCtaLabel: "Search cars in {locationName}",
      pickupGuidanceTitle: "Pickup guidance",
      nearbyPlacesTitle: "Nearby places",
      localFaqTitle: "Local FAQ",
      navLocationsDropdownDescription:
        "Pickup and return across Thessaloniki, airport, and Halkidiki peninsula. Choose your area for details and car search.",
    },
    staticPages: {
      [STATIC_PAGE_KEYS.CONTACTS]: {
        seoTitle: "Contact Natali Cars | Car Rental Support",
        seoDescription:
          "Contact Natali Cars for booking questions, pickup planning, and support for Halkidiki and Thessaloniki car rental.",
      },
      [STATIC_PAGE_KEYS.PRIVACY_POLICY]: {
        seoTitle: "Privacy Policy | Natali Cars",
        seoDescription:
          "Read how Natali Cars processes and protects personal data for bookings and customer communication.",
      },
      [STATIC_PAGE_KEYS.TERMS_OF_SERVICE]: {
        seoTitle: "Terms of Service | Natali Cars",
        seoDescription:
          "Review Natali Cars service terms, booking obligations, and responsibilities for rental agreements.",
      },
      [STATIC_PAGE_KEYS.COOKIE_POLICY]: {
        seoTitle: "Cookie Policy | Natali Cars",
        seoDescription:
          "Learn which cookies Natali Cars uses and how they support booking flow, analytics, and website performance.",
      },
      [STATIC_PAGE_KEYS.RENTAL_TERMS]: {
        seoTitle: "Rental Terms and Conditions | Natali Cars",
        seoDescription:
          "Review Natali Cars rental conditions, insurance scope, and vehicle handover rules before booking.",
      },
    },
  },
  ru: {
    hub: {
      h1: "Прокат авто в Халкидиках и Салониках",
      seoTitle: "Прокат авто в Халкидиках, Салониках и аэропорту | Natali Cars",
      seoDescription:
        "Арендуйте автомобиль в Халкидиках, Салониках и аэропорту Салоники с локальными точками выдачи и прозрачными условиями.",
      introText:
        "Natali Cars покрывает основные зоны Халкидик и Салоник через единую систему бронирования и локальные SEO-страницы.",
    },
    car: {
      seoTitleTemplate: "Аренда {carModel} в Халкидиках и Салониках | Natali Cars",
      seoDescriptionTemplate:
        "Арендуйте {carModel} с выдачей в районе {locationName}. Прозрачные цены и поддержка напрямую от Natali Cars.",
      introTemplate:
        "Выберите {carModel} и оформите выдачу в {locationName}. Страница связана с локальными SEO-хабами.",
    },
    links: {
      hubToLocationsTitle: "Локации проката авто",
      locationToCarsTitle: "Автомобили для этой локации",
      locationToHubLabel: "Вернуться в главный хаб",
      locationToParentLabel: "Вернуться к родительской локации",
      locationToChildrenTitle: "Подлокации",
      locationToSiblingTitle: "Альтернативные ближайшие локации",
      carsToLocationsTitle: "Популярные точки выдачи",
      carsToHubLabel: "Вернуться в главный хаб",
      carsListTitle: "Список моделей",
      mainHubLabel: "Главный хаб проката",
      locationSearchCtaLabel: "Поиск авто в {locationName}",
      pickupGuidanceTitle: "Инструкция по выдаче",
      nearbyPlacesTitle: "Рядом",
      localFaqTitle: "Частые вопросы",
      navLocationsDropdownDescription:
        "Выдача и возврат в Салониках, аэропорту и на полуострове Халкидики. Выберите район для деталей и поиска авто.",
    },
    staticPages: {
      [STATIC_PAGE_KEYS.CONTACTS]: {
        seoTitle: "Контакты Natali Cars | Поддержка проката авто",
        seoDescription:
          "Свяжитесь с Natali Cars по вопросам бронирования, выдачи автомобиля и поддержки по Халкидикам и Салоникам.",
      },
      [STATIC_PAGE_KEYS.PRIVACY_POLICY]: {
        seoTitle: "Политика конфиденциальности | Natali Cars",
        seoDescription:
          "Узнайте, как Natali Cars обрабатывает персональные данные при бронировании и клиентской коммуникации.",
      },
      [STATIC_PAGE_KEYS.TERMS_OF_SERVICE]: {
        seoTitle: "Условия сервиса | Natali Cars",
        seoDescription:
          "Ознакомьтесь с условиями сервиса Natali Cars и обязанностями сторон при аренде автомобиля.",
      },
      [STATIC_PAGE_KEYS.COOKIE_POLICY]: {
        seoTitle: "Политика cookies | Natali Cars",
        seoDescription:
          "Узнайте, какие cookies используются на сайте Natali Cars и для каких задач они нужны.",
      },
      [STATIC_PAGE_KEYS.RENTAL_TERMS]: {
        seoTitle: "Условия аренды | Natali Cars",
        seoDescription:
          "Проверьте правила аренды, страховки и передачи автомобиля перед бронированием в Natali Cars.",
      },
    },
  },
  uk: {
    hub: {
      h1: "Оренда авто в Халкідіках і Салоніках",
      seoTitle: "Оренда авто в Халкідіках, Салоніках і аеропорту | Natali Cars",
      seoDescription:
        "Орендуйте авто в Халкідіках, Салоніках і аеропорту Салоніки з локальними точками отримання та прозорими умовами.",
      introText:
        "Natali Cars покриває ключові локації Халкідік та Салонік через єдину систему бронювання і локальні SEO-сторінки.",
    },
    car: {
      seoTitleTemplate: "Оренда {carModel} в Халкідіках і Салоніках | Natali Cars",
      seoDescriptionTemplate:
        "Орендуйте {carModel} з отриманням у {locationName}. Прозора ціна та підтримка напряму від Natali Cars.",
      introTemplate:
        "Оберіть {carModel} та організуйте отримання у {locationName}. Сторінка пов'язана з локальними SEO-хабами.",
    },
    links: {
      hubToLocationsTitle: "Локації оренди авто",
      locationToCarsTitle: "Автомобілі для цієї локації",
      locationToHubLabel: "Повернутися до головного хабу",
      locationToParentLabel: "Повернутися до батьківської локації",
      locationToChildrenTitle: "Підлокації",
      locationToSiblingTitle: "Альтернативні найближчі локації",
      carsToLocationsTitle: "Популярні точки отримання",
      carsToHubLabel: "Повернутися до головного хабу",
      carsListTitle: "Список моделей",
      mainHubLabel: "Головний хаб оренди",
      locationSearchCtaLabel: "Пошук авто в {locationName}",
      pickupGuidanceTitle: "Інструкція з отримання",
      nearbyPlacesTitle: "Поруч",
      localFaqTitle: "Часті питання",
      navLocationsDropdownDescription:
        "Отримання та повернення в Салоніках, аеропорту та на півострові Халкідіки. Оберіть регіон для деталей та пошуку авто.",
    },
    staticPages: {
      [STATIC_PAGE_KEYS.CONTACTS]: {
        seoTitle: "Контакти Natali Cars | Підтримка оренди авто",
        seoDescription:
          "Звертайтесь до Natali Cars щодо бронювання, отримання авто та підтримки у Халкідіках і Салоніках.",
      },
      [STATIC_PAGE_KEYS.PRIVACY_POLICY]: {
        seoTitle: "Політика конфіденційності | Natali Cars",
        seoDescription:
          "Дізнайтеся, як Natali Cars обробляє персональні дані під час бронювання і взаємодії з клієнтами.",
      },
      [STATIC_PAGE_KEYS.TERMS_OF_SERVICE]: {
        seoTitle: "Умови сервісу | Natali Cars",
        seoDescription:
          "Ознайомтесь з умовами сервісу Natali Cars та відповідальністю сторін під час оренди авто.",
      },
      [STATIC_PAGE_KEYS.COOKIE_POLICY]: {
        seoTitle: "Політика cookies | Natali Cars",
        seoDescription:
          "Дізнайтеся, які cookies використовує Natali Cars і як вони впливають на роботу сайту.",
      },
      [STATIC_PAGE_KEYS.RENTAL_TERMS]: {
        seoTitle: "Умови оренди | Natali Cars",
        seoDescription:
          "Перегляньте умови оренди, страхування та передачі авто перед бронюванням у Natali Cars.",
      },
    },
  },
  el: {
    hub: {
      h1: "Ενοικίαση αυτοκινήτου σε Χαλκιδική και Θεσσαλονίκη",
      seoTitle: "Ενοικίαση αυτοκινήτου σε Χαλκιδική, Θεσσαλονίκη και αεροδρόμιο | Natali Cars",
      seoDescription:
        "Κλείστε αυτοκίνητο στη Χαλκιδική, στη Θεσσαλονίκη και στο αεροδρόμιο με τοπικά σημεία παραλαβής και διαφανείς όρους.",
      introText:
        "Η Natali Cars καλύπτει βασικές τοποθεσίες Χαλκιδικής και Θεσσαλονίκης με ενιαία ροή κράτησης και τοπικές SEO σελίδες.",
    },
    car: {
      seoTitleTemplate: "Ενοικίαση {carModel} σε Χαλκιδική και Θεσσαλονίκη | Natali Cars",
      seoDescriptionTemplate:
        "Κλείστε {carModel} με παραλαβή στην περιοχή {locationName}. Διαφανείς τιμές και άμεση υποστήριξη από τη Natali Cars.",
      introTemplate:
        "Επιλέξτε {carModel} και οργανώστε παραλαβή στην περιοχή {locationName}. Η σελίδα συνδέεται με τοπικά SEO hubs.",
    },
    links: {
      hubToLocationsTitle: "Τοποθεσίες ενοικίασης",
      locationToCarsTitle: "Διαθέσιμα αυτοκίνητα για αυτή την τοποθεσία",
      locationToHubLabel: "Επιστροφή στο κεντρικό hub",
      locationToParentLabel: "Επιστροφή στη γονική τοποθεσία",
      locationToChildrenTitle: "Υποτοποθεσίες",
      locationToSiblingTitle: "Εναλλακτικές κοντινές τοποθεσίες",
      carsToLocationsTitle: "Δημοφιλή σημεία παραλαβής",
      carsToHubLabel: "Επιστροφή στο κεντρικό hub",
      carsListTitle: "Λίστα μοντέλων",
      mainHubLabel: "Κεντρικό hub ενοικίασης",
      locationSearchCtaLabel: "Αναζήτηση αυτοκινήτων στην {locationName}",
      pickupGuidanceTitle: "Οδηγίες παραλαβής",
      nearbyPlacesTitle: "Κοντινά σημεία",
      localFaqTitle: "Συχνές ερωτήσεις",
      navLocationsDropdownDescription:
        "Παραλαβή και επιστροφή στη Θεσσαλονίκη, αεροδρόμιο και Χαλκιδική. Επιλέξτε περιοχή για λεπτομέρειες και αναζήτηση αυτοκινήτου.",
    },
    staticPages: {
      [STATIC_PAGE_KEYS.CONTACTS]: {
        seoTitle: "Επικοινωνία Natali Cars | Υποστήριξη ενοικίασης",
        seoDescription:
          "Επικοινωνήστε με τη Natali Cars για κρατήσεις, παραλαβή οχήματος και υποστήριξη σε Χαλκιδική και Θεσσαλονίκη.",
      },
      [STATIC_PAGE_KEYS.PRIVACY_POLICY]: {
        seoTitle: "Πολιτική Απορρήτου | Natali Cars",
        seoDescription:
          "Μάθετε πώς η Natali Cars διαχειρίζεται προσωπικά δεδομένα για κρατήσεις και επικοινωνία πελατών.",
      },
      [STATIC_PAGE_KEYS.TERMS_OF_SERVICE]: {
        seoTitle: "Όροι Υπηρεσίας | Natali Cars",
        seoDescription:
          "Διαβάστε τους όρους υπηρεσίας της Natali Cars και τις ευθύνες των μερών στις μισθώσεις.",
      },
      [STATIC_PAGE_KEYS.COOKIE_POLICY]: {
        seoTitle: "Πολιτική Cookies | Natali Cars",
        seoDescription:
          "Μάθετε ποια cookies χρησιμοποιεί η Natali Cars και γιατί είναι απαραίτητα για τη λειτουργία του site.",
      },
      [STATIC_PAGE_KEYS.RENTAL_TERMS]: {
        seoTitle: "Όροι Ενοικίασης | Natali Cars",
        seoDescription:
          "Διαβάστε όρους ενοικίασης, κάλυψη ασφάλισης και διαδικασία παράδοσης οχήματος πριν την κράτηση.",
      },
    },
  },
};

export const localeSeoDictionary = expandLocaleRecord(localeSeoDictionaryRaw);

const locationContentByKeyRaw: Record<
  LocationContentKey,
  PartialLocaleRecord<LocationSeoContent>
> = {
  [LOCATION_CONTENT_KEYS.THESSALONIKI]: {
    en: {
      shortName: "Thessaloniki",
      h1: "Car Rental in Thessaloniki",
      seoTitle: "Car Rental in Thessaloniki City | Natali Cars",
      seoDescription:
        "Rent a car in Thessaloniki city with hotel-area pickup, direct communication, and transfer-ready scheduling to Halkidiki.",
      introText:
        "This location page targets Thessaloniki city demand and connects travelers to fast pickup for city stays, business trips, and Halkidiki transfers.",
      areaServed: ["Thessaloniki Center", "Perea", "Kalamaria"],
      pickupLocation: "Thessaloniki City Pickup Point",
      offerName: "Thessaloniki City Car Hire Offer",
      offerDescription:
        "Flexible city pickup for short stays, business schedules, and direct transfer to Halkidiki resorts.",
    },
    ru: {
      shortName: "Салоники",
      h1: "Прокат авто в Салониках",
      seoTitle: "Прокат авто в Салониках | Natali Cars",
      seoDescription:
        "Аренда автомобиля в Салониках с выдачей в городе, поддержкой напрямую и удобной передачей авто для поездок в Халкидики.",
      introText:
        "SEO-страница Салоник покрывает городские заказы, командировки и поездки к побережью через единый процесс бронирования.",
      areaServed: ["Центр Салоник", "Перея", "Каламария"],
      pickupLocation: "Точка выдачи в Салониках",
      offerName: "Предложение проката в Салониках",
      offerDescription:
        "Городская выдача для коротких поездок, рабочих визитов и трансфера в Халкидики.",
    },
    uk: {
      shortName: "Салоніки",
      h1: "Оренда авто в Салоніках",
      seoTitle: "Оренда авто в Салоніках | Natali Cars",
      seoDescription:
        "Орендуйте авто в Салоніках з отриманням у місті, прямою підтримкою та зручною передачею авто для поїздок у Халкідіки.",
      introText:
        "Локальна SEO-сторінка Салонік охоплює міські поїздки, бізнес-візити та виїзди на узбережжя через єдиний процес бронювання.",
      areaServed: ["Центр Салонік", "Перея", "Каламарія"],
      pickupLocation: "Точка отримання в Салоніках",
      offerName: "Пропозиція оренди в Салоніках",
      offerDescription:
        "Міське отримання для коротких поїздок, робочих візитів і трансферу до Халкідік.",
    },
    el: {
      shortName: "Θεσσαλονίκη",
      h1: "Ενοικίαση αυτοκινήτου στη Θεσσαλονίκη",
      seoTitle: "Ενοικίαση αυτοκινήτου στη Θεσσαλονίκη | Natali Cars",
      seoDescription:
        "Ενοικιάστε αυτοκίνητο στη Θεσσαλονίκη με παραλαβή στην πόλη, άμεση υποστήριξη και εύκολη μετακίνηση προς Χαλκιδική.",
      introText:
        "Η τοπική SEO σελίδα Θεσσαλονίκης καλύπτει city demand, εταιρικά ταξίδια και αναχωρήσεις προς παραθαλάσσιες περιοχές.",
      areaServed: ["Κέντρο Θεσσαλονίκης", "Περαία", "Καλαμαριά"],
      pickupLocation: "Σημείο παραλαβής Θεσσαλονίκης",
      offerName: "Προσφορά ενοικίασης Θεσσαλονίκης",
      offerDescription:
        "Παραλαβή στην πόλη για σύντομα ταξίδια, επαγγελματικές μετακινήσεις και άμεση μετάβαση στη Χαλκιδική.",
    },
  },
  [LOCATION_CONTENT_KEYS.THESSALONIKI_AIRPORT]: {
    en: {
      shortName: "Thessaloniki Airport",
      h1: "Car Rental at Thessaloniki Airport",
      seoTitle: "Car Rental at Thessaloniki Airport (SKG) | Natali Cars",
      seoDescription:
        "Book airport car rental at Thessaloniki (SKG) with handover-ready pickup, direct customer support, and coastal transfer coverage.",
      introText:
        "This airport location page is optimized for travelers arriving at SKG and looking for immediate pickup to Halkidiki, Sithonia, or Kassandra.",
      areaServed: ["SKG Airport", "Perea", "Nea Kallikratia"],
      pickupLocation: "Thessaloniki Airport Pickup Point",
      offerName: "Airport Pickup Rental Offer",
      offerDescription:
        "Fast airport handover with route-ready setup for resorts and villas in Halkidiki.",
    },
    ru: {
      shortName: "Аэропорт Салоники",
      h1: "Прокат авто в аэропорту Салоники",
      seoTitle: "Прокат авто в аэропорту Салоники (SKG) | Natali Cars",
      seoDescription:
        "Арендуйте авто в аэропорту Салоники (SKG) с быстрой выдачей, прямой поддержкой и удобным выездом в Халкидики.",
      introText:
        "SEO-страница аэропорта SKG ориентирована на туристов, которым нужна выдача сразу по прилету и маршрут к морю без задержек.",
      areaServed: ["Аэропорт SKG", "Перея", "Неа Каликратия"],
      pickupLocation: "Точка выдачи в аэропорту Салоники",
      offerName: "Предложение проката с выдачей в аэропорту",
      offerDescription:
        "Быстрая выдача после прилета и готовый маршрут к курортам Халкидик.",
    },
    uk: {
      shortName: "Аеропорт Салоніки",
      h1: "Оренда авто в аеропорту Салоніки",
      seoTitle: "Оренда авто в аеропорту Салоніки (SKG) | Natali Cars",
      seoDescription:
        "Орендуйте авто в аеропорту Салоніки (SKG) з швидкою передачею, прямою підтримкою та зручним виїздом до Халкідік.",
      introText:
        "SEO-сторінка аеропорту SKG орієнтована на мандрівників, яким потрібне авто одразу після прильоту.",
      areaServed: ["Аеропорт SKG", "Перея", "Неа Каллікратія"],
      pickupLocation: "Точка отримання в аеропорту Салоніки",
      offerName: "Пропозиція оренди з отриманням в аеропорту",
      offerDescription:
        "Швидка передача авто після прильоту та готовий маршрут до курортів Халкідік.",
    },
    el: {
      shortName: "Αεροδρόμιο Θεσσαλονίκης",
      h1: "Ενοικίαση αυτοκινήτου στο αεροδρόμιο Θεσσαλονίκης",
      seoTitle: "Ενοικίαση αυτοκινήτου στο αεροδρόμιο Θεσσαλονίκης (SKG) | Natali Cars",
      seoDescription:
        "Κλείστε αυτοκίνητο στο αεροδρόμιο Θεσσαλονίκης (SKG) με γρήγορη παράδοση, άμεση υποστήριξη και εύκολη μετάβαση στη Χαλκιδική.",
      introText:
        "Η σελίδα αεροδρομίου SKG είναι βελτιστοποιημένη για αφίξεις που χρειάζονται άμεση παραλαβή και διαδρομή προς παραθαλάσσιες περιοχές.",
      areaServed: ["Αεροδρόμιο SKG", "Περαία", "Νέα Καλλικράτεια"],
      pickupLocation: "Σημείο παραλαβής στο αεροδρόμιο Θεσσαλονίκης",
      offerName: "Προσφορά ενοικίασης με παραλαβή στο αεροδρόμιο",
      offerDescription:
        "Άμεση παραλαβή μετά την άφιξη και έτοιμη διαδρομή προς θέρετρα Χαλκιδικής.",
    },
  },
  [LOCATION_CONTENT_KEYS.HALKIDIKI]: {
    en: {
      shortName: "Halkidiki",
      h1: "Car Rental in Halkidiki",
      seoTitle: "Car Rental in Halkidiki Region | Natali Cars",
      seoDescription:
        "Rent a car in Halkidiki with localized pickup coverage across regional hubs, beach zones, and major transfer routes.",
      introText:
        "This regional page connects Halkidiki demand across sub-regions and links to dedicated landing pages for Sithonia and Kassandra.",
      areaServed: ["Nea Kallikratia", "Sithonia", "Kassandra"],
      pickupLocation: "Halkidiki Regional Pickup",
      offerName: "Halkidiki Regional Rental Offer",
      offerDescription:
        "Regional pickup coverage for beaches, villas, and family travel across Halkidiki.",
    },
    ru: {
      shortName: "Халкидики",
      h1: "Прокат авто в Халкидиках",
      seoTitle: "Прокат авто в регионе Халкидики | Natali Cars",
      seoDescription:
        "Арендуйте авто в Халкидиках с покрытием по региону, пляжным зонам и ключевым маршрутам к курортам.",
      introText:
        "Региональная SEO-страница Халкидик объединяет основной спрос и связывает подстраницы Ситонии и Кассандры.",
      areaServed: ["Неа Каликратия", "Ситония", "Кассандра"],
      pickupLocation: "Региональная точка выдачи Халкидики",
      offerName: "Региональное предложение Халкидики",
      offerDescription:
        "Выдача по региону для пляжного отдыха, вилл и семейных поездок.",
    },
    uk: {
      shortName: "Халкідіки",
      h1: "Оренда авто в Халкідіках",
      seoTitle: "Оренда авто в регіоні Халкідіки | Natali Cars",
      seoDescription:
        "Орендуйте авто в Халкідіках з покриттям по регіону, пляжних зонах і ключових маршрутах до курортів.",
      introText:
        "Регіональна SEO-сторінка Халкідік об'єднує основний попит і пов'язує підсторінки Ситонії та Кассандри.",
      areaServed: ["Неа Каллікратія", "Ситонія", "Кассандра"],
      pickupLocation: "Регіональна точка отримання Халкідіки",
      offerName: "Регіональна пропозиція Халкідіки",
      offerDescription:
        "Отримання авто по регіону для пляжного відпочинку, вілл і сімейних поїздок.",
    },
    el: {
      shortName: "Χαλκιδική",
      h1: "Ενοικίαση αυτοκινήτου στη Χαλκιδική",
      seoTitle: "Ενοικίαση αυτοκινήτου στη Χαλκιδική | Natali Cars",
      seoDescription:
        "Ενοικιάστε αυτοκίνητο στη Χαλκιδική με κάλυψη σε παραλιακές περιοχές, υπο-περιοχές και βασικές διαδρομές μεταφοράς.",
      introText:
        "Η περιφερειακή σελίδα Χαλκιδικής συγκεντρώνει τη ζήτηση και συνδέεται με εξειδικευμένες σελίδες για Σιθωνία και Κασσάνδρα.",
      areaServed: ["Νέα Καλλικράτεια", "Σιθωνία", "Κασσάνδρα"],
      pickupLocation: "Περιφερειακό σημείο παραλαβής Χαλκιδικής",
      offerName: "Περιφερειακή προσφορά Χαλκιδικής",
      offerDescription:
        "Κάλυψη παραλαβής για παραλίες, βίλες και οικογενειακές διαδρομές σε όλη τη Χαλκιδική.",
    },
  },
  [LOCATION_CONTENT_KEYS.SITHONIA]: {
    en: {
      shortName: "Sithonia",
      h1: "Car Rental in Sithonia",
      seoTitle: "Car Rental in Sithonia, Halkidiki | Natali Cars",
      seoDescription:
        "Book a rental car in Sithonia with pickup options for Nikiti, Neos Marmaras, and long-stay coastal accommodations.",
      introText:
        "This sub-region page targets east-coast Halkidiki trips, villa stays, and flexible pickup for extended holidays in Sithonia.",
      areaServed: ["Nikiti", "Neos Marmaras", "Sarti"],
      pickupLocation: "Sithonia Pickup Point",
      offerName: "Sithonia Car Hire Offer",
      offerDescription:
        "Pickup for coastal hotels, villas, and weekly stays across Sithonia.",
    },
    ru: {
      shortName: "Ситония",
      h1: "Прокат авто в Ситонии",
      seoTitle: "Прокат авто в Ситонии, Халкидики | Natali Cars",
      seoDescription:
        "Забронируйте автомобиль в Ситонии с выдачей для Никити, Неос Мармараса и длительного отдыха на побережье.",
      introText:
        "Подстраница Ситонии ориентирована на длительные поездки по восточному побережью Халкидик и размещение в виллах.",
      areaServed: ["Никити", "Неос Мармарас", "Сарти"],
      pickupLocation: "Точка выдачи Ситония",
      offerName: "Предложение проката Ситония",
      offerDescription:
        "Выдача для отелей у моря, вилл и недельного отдыха в Ситонии.",
    },
    uk: {
      shortName: "Ситонія",
      h1: "Оренда авто в Ситонії",
      seoTitle: "Оренда авто в Ситонії, Халкідіки | Natali Cars",
      seoDescription:
        "Забронюйте авто в Ситонії з отриманням для Нікіті, Неос Мармарас і тривалого відпочинку на узбережжі.",
      introText:
        "Підсторінка Ситонії орієнтована на довгі поїздки східним узбережжям Халкідік і проживання у віллах.",
      areaServed: ["Нікіті", "Неос Мармарас", "Сарті"],
      pickupLocation: "Точка отримання Ситонія",
      offerName: "Пропозиція оренди Ситонія",
      offerDescription:
        "Отримання авто для готелів біля моря, вілл і тижневого відпочинку в Ситонії.",
    },
    el: {
      shortName: "Σιθωνία",
      h1: "Ενοικίαση αυτοκινήτου στη Σιθωνία",
      seoTitle: "Ενοικίαση αυτοκινήτου στη Σιθωνία, Χαλκιδική | Natali Cars",
      seoDescription:
        "Κλείστε αυτοκίνητο στη Σιθωνία με παραλαβή για Νικήτη, Νέο Μαρμαρά και παραθαλάσσιες διαμονές μεγάλης διάρκειας.",
      introText:
        "Η σελίδα Σιθωνίας στοχεύει ταξίδια ανατολικής Χαλκιδικής, διαμονές σε βίλες και ευέλικτη παραλαβή για πολυήμερες διακοπές.",
      areaServed: ["Νικήτη", "Νέος Μαρμαράς", "Σάρτη"],
      pickupLocation: "Σημείο παραλαβής Σιθωνίας",
      offerName: "Προσφορά ενοικίασης Σιθωνίας",
      offerDescription:
        "Παραλαβή για παραθαλάσσια ξενοδοχεία, βίλες και πολυήμερες διακοπές στη Σιθωνία.",
    },
  },
  [LOCATION_CONTENT_KEYS.KASSANDRA]: {
    en: {
      shortName: "Kassandra",
      h1: "Car Rental in Kassandra",
      seoTitle: "Car Rental in Kassandra, Halkidiki | Natali Cars",
      seoDescription:
        "Rent a car in Kassandra with pickup support for resort zones, family stays, and high-season coastal traffic.",
      introText:
        "This Kassandra page is built for resort-oriented travel demand and links with the wider Halkidiki hub for regional planning.",
      areaServed: ["Pefkochori", "Hanioti", "Kallithea"],
      pickupLocation: "Kassandra Pickup Point",
      offerName: "Kassandra Car Hire Offer",
      offerDescription:
        "Pickup coverage for Kassandra resorts, family accommodations, and seasonal coastal demand.",
    },
    ru: {
      shortName: "Кассандра",
      h1: "Прокат авто в Кассандре",
      seoTitle: "Прокат авто в Кассандре, Халкидики | Natali Cars",
      seoDescription:
        "Аренда авто в Кассандре с выдачей в курортных зонах, для семейного отдыха и поездок в высокий сезон.",
      introText:
        "Страница Кассандры ориентирована на курортный спрос и связана с региональным хабом Халкидик для планирования маршрутов.",
      areaServed: ["Пефкохори", "Ханиоти", "Каллифея"],
      pickupLocation: "Точка выдачи Кассандра",
      offerName: "Предложение проката Кассандра",
      offerDescription:
        "Выдача в курортных зонах Кассандры для семейного и сезонного отдыха.",
    },
    uk: {
      shortName: "Кассандра",
      h1: "Оренда авто в Кассандрі",
      seoTitle: "Оренда авто в Кассандрі, Халкідіки | Natali Cars",
      seoDescription:
        "Орендуйте авто в Кассандрі з отриманням у курортних зонах для сімейного відпочинку і поїздок у високий сезон.",
      introText:
        "Сторінка Кассандри орієнтована на курортний попит і пов'язана з регіональним хабом Халкідік для планування маршрутів.",
      areaServed: ["Пефкохорі", "Ханіоті", "Каллітея"],
      pickupLocation: "Точка отримання Кассандра",
      offerName: "Пропозиція оренди Кассандра",
      offerDescription:
        "Отримання авто в курортних зонах Кассандри для сімейного та сезонного відпочинку.",
    },
    el: {
      shortName: "Κασσάνδρα",
      h1: "Ενοικίαση αυτοκινήτου στην Κασσάνδρα",
      seoTitle: "Ενοικίαση αυτοκινήτου στην Κασσάνδρα, Χαλκιδική | Natali Cars",
      seoDescription:
        "Ενοικιάστε αυτοκίνητο στην Κασσάνδρα με παραλαβή σε τουριστικές ζώνες, οικογενειακές διαμονές και εποχική ζήτηση.",
      introText:
        "Η σελίδα Κασσάνδρας στοχεύει τουριστική κίνηση θέρετρων και συνδέεται με το περιφερειακό hub Χαλκιδικής.",
      areaServed: ["Πευκοχώρι", "Χανιώτη", "Καλλιθέα"],
      pickupLocation: "Σημείο παραλαβής Κασσάνδρας",
      offerName: "Προσφορά ενοικίασης Κασσάνδρας",
      offerDescription:
        "Κάλυψη παραλαβής σε θέρετρα Κασσάνδρας για οικογενειακές και εποχικές διαδρομές.",
    },
  },
  // —— Halkidiki city pages (SEO landings; CTA → homepage search with pickup param) ——
  [LOCATION_CONTENT_KEYS.NEA_KALLIKRATIA]: {
    en: {
      shortName: "Nea Kallikratia",
      h1: "Car Rental in Nea Kallikratia",
      seoTitle: "Car Rental in Nea Kallikratia, Halkidiki | Natali Cars",
      seoDescription:
        "Rent a car in Nea Kallikratia with convenient pickup near the beach and main road. Ideal for coastal stays and day trips across Halkidiki.",
      introText:
        "Nea Kallikratia is a popular coastal town on the way to Halkidiki. This page helps you arrange car rental with pickup suited to your accommodation.",
      areaServed: ["Nea Kallikratia Beach", "Central Nea Kallikratia"],
      pickupLocation: "Nea Kallikratia Pickup Point",
      offerName: "Nea Kallikratia Car Hire",
      offerDescription: "Beach-area pickup for Nea Kallikratia and nearby coastal stays.",
      pickupGuidance:
        "Pickup in Nea Kallikratia is typically arranged near your accommodation or a agreed landmark along the main coastal road. Confirm the exact spot when booking so the handover is smooth.",
      nearbyPlaces: ["Thessaloniki (city)", "Nea Moudania (port)", "Sithonia peninsula"],
      faq: [
        { question: "Can I get a car delivered to my hotel in Nea Kallikratia?", answer: "Yes. We coordinate pickup at or near your hotel or rental; confirm the address when booking." },
        { question: "Is Nea Kallikratia a good base for exploring Halkidiki?", answer: "Yes. It sits on the main route into the peninsula, so Sithonia and Kassandra are easily reachable by car." },
        { question: "What if I arrive from Thessaloniki Airport?", answer: "Book with pickup at the airport or arrange a later handover in Nea Kallikratia after you reach your accommodation." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.NEA_MOUDANIA]: {
    en: {
      shortName: "Nea Moudania",
      h1: "Car Rental in Nea Moudania",
      seoTitle: "Car Rental in Nea Moudania, Halkidiki | Natali Cars",
      seoDescription:
        "Book a rental car in Nea Moudania with pickup near the port or town. Convenient for ferry arrivals and trips across Halkidiki.",
      introText:
        "Nea Moudania is the main port and gateway to Halkidiki. Arrange car rental with pickup in town or near the port for a smooth start to your trip.",
      areaServed: ["Nea Moudania Port", "Nea Moudania Town"],
      pickupLocation: "Nea Moudania Pickup Point",
      offerName: "Nea Moudania Car Hire",
      offerDescription: "Port and town pickup for Nea Moudania and onward travel.",
      pickupGuidance:
        "Handover in Nea Moudania can be at the port area or at a agreed location in town. Specify your arrival details when booking so we can suggest the best pickup point.",
      nearbyPlaces: ["Nea Kallikratia", "Olympiada", "Mount Athos area (by boat)"],
      faq: [
        { question: "Can I pick up a car after arriving by ferry at Nea Moudania?", answer: "Yes. We can arrange handover near the port; share your ferry time when booking." },
        { question: "Is Nea Moudania good for visiting Mount Athos?", answer: "Yes. Many visitors use Nea Moudania as a base and take boats to the Athos peninsula from nearby ports." },
        { question: "How far is Nea Moudania from Thessaloniki?", answer: "About 50 km; roughly 45–60 minutes by car depending on traffic." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.NIKITI]: {
    en: {
      shortName: "Nikiti",
      h1: "Car Rental in Nikiti",
      seoTitle: "Car Rental in Nikiti, Sithonia | Natali Cars",
      seoDescription:
        "Rent a car in Nikiti with pickup for hotels and villas. Explore Sithonia beaches and villages with flexible handover options.",
      introText:
        "Nikiti is one of the main towns on Sithonia. This page connects you to car rental with pickup tailored to your stay in Nikiti or nearby.",
      areaServed: ["Nikiti Town", "Nikiti Beach", "Nearby Villas"],
      pickupLocation: "Nikiti Pickup Point",
      offerName: "Nikiti Car Hire",
      offerDescription: "Town and beach-area pickup for Nikiti and Sithonia stays.",
      pickupGuidance:
        "Pickup in Nikiti is usually at or near your accommodation or a central landmark. We’ll confirm the exact meeting point when you book so you know where to meet.",
      nearbyPlaces: ["Neos Marmaras", "Sarti", "Agios Nikolaos (Sithonia)"],
      faq: [
        { question: "Can I get a car at my villa outside Nikiti?", answer: "Yes. We arrange pickup at villas and hotels in the Nikiti area; provide the address when booking." },
        { question: "What are the best beaches near Nikiti?", answer: "Several beaches line the coast; a car lets you reach Agios Nikolaos, Kalogria, and other bays easily." },
        { question: "Is Nikiti good for families?", answer: "Yes. The town has shops, tavernas, and calm beaches; a car adds flexibility for day trips." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.NEOS_MARMARAS]: {
    en: {
      shortName: "Neos Marmaras",
      h1: "Car Rental in Neos Marmaras",
      seoTitle: "Car Rental in Neos Marmaras, Sithonia | Natali Cars",
      seoDescription:
        "Book a car in Neos Marmaras with pickup for the harbour and resorts. Ideal for exploring Sithonia and nearby beaches.",
      introText:
        "Neos Marmaras is a busy resort town on Sithonia with a harbour and many accommodations. Arrange rental with pickup that suits your plans.",
      areaServed: ["Neos Marmaras Harbour", "Neos Marmaras Town", "Resort Zone"],
      pickupLocation: "Neos Marmaras Pickup Point",
      offerName: "Neos Marmaras Car Hire",
      offerDescription: "Harbour and town pickup for Neos Marmaras and Sithonia.",
      pickupGuidance:
        "Handover in Neos Marmaras can be at the harbour, your hotel, or another agreed spot. Confirm your address or preferred meeting point at booking.",
      nearbyPlaces: ["Nikiti", "Porto Carras", "Sarti"],
      faq: [
        { question: "Can I pick up a car at Porto Carras?", answer: "Yes. We can arrange pickup at or near Porto Carras; specify your resort or hotel when booking." },
        { question: "Is Neos Marmaras good for nightlife?", answer: "Yes. The town has bars and restaurants; a car helps you explore quieter beaches by day." },
        { question: "How do I reach Sarti from Neos Marmaras?", answer: "By car along the east coast of Sithonia; the drive is scenic and takes about 30–40 minutes." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.SARTI]: {
    en: {
      shortName: "Sarti",
      h1: "Car Rental in Sarti",
      seoTitle: "Car Rental in Sarti, Sithonia | Natali Cars",
      seoDescription:
        "Rent a car in Sarti with pickup for beach and villa stays. Discover the eastern coast of Sithonia and nearby bays.",
      introText:
        "Sarti is known for its long beach and relaxed vibe. This page helps you book a rental with pickup in Sarti or at your accommodation.",
      areaServed: ["Sarti Beach", "Sarti Village", "Eastern Sithonia"],
      pickupLocation: "Sarti Pickup Point",
      offerName: "Sarti Car Hire",
      offerDescription: "Beach and village pickup for Sarti and eastern Sithonia.",
      pickupGuidance:
        "Pickup in Sarti is arranged at a agreed spot—often your hotel, villa, or a central point. Tell us your address when booking for a smooth handover.",
      nearbyPlaces: ["Neos Marmaras", "Sykes Beach", "Mount Athos (viewpoints)"],
      faq: [
        { question: "Is Sarti good for a quiet holiday?", answer: "Yes. Sarti is quieter than Neos Marmaras; a car lets you explore more beaches and villages." },
        { question: "Can I see Mount Athos from Sarti?", answer: "Yes. On clear days you can see the Athos peninsula; some viewpoints are a short drive away." },
        { question: "Are there supermarkets in Sarti?", answer: "Yes. The village has shops; a car is useful for bigger supermarkets in Neos Marmaras or Nikiti." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.KALLITHEA]: {
    en: {
      shortName: "Kallithea",
      h1: "Car Rental in Kallithea",
      seoTitle: "Car Rental in Kallithea, Kassandra | Natali Cars",
      seoDescription:
        "Book a car in Kallithea with pickup for resorts and beaches. Explore Kassandra and the west coast with flexible rental.",
      introText:
        "Kallithea is a popular resort on Kassandra with a lively strip and good beaches. Arrange car rental with pickup that fits your stay.",
      areaServed: ["Kallithea Beach", "Kallithea Strip", "Resort Area"],
      pickupLocation: "Kallithea Pickup Point",
      offerName: "Kallithea Car Hire",
      offerDescription: "Resort and beach pickup for Kallithea and Kassandra.",
      pickupGuidance:
        "Handover in Kallithea is usually at your hotel or a agreed spot on the main strip. Share your accommodation details when booking so we can set the best meeting point.",
      nearbyPlaces: ["Pefkohori", "Hanioti", "Afitos"],
      faq: [
        { question: "Is Kallithea good for families?", answer: "Yes. There are family-friendly beaches and amenities; a car helps with day trips to quieter spots." },
        { question: "How far is Kallithea from Thessaloniki?", answer: "About 110 km; roughly 1.5 hours by car." },
        { question: "Can I get a car at my all-inclusive in Kallithea?", answer: "Yes. We coordinate pickup at or near your hotel; confirm the name and address when booking." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.PEFKOHORI]: {
    en: {
      shortName: "Pefkohori",
      h1: "Car Rental in Pefkohori",
      seoTitle: "Car Rental in Pefkohori, Kassandra | Natali Cars",
      seoDescription:
        "Rent a car in Pefkohori with pickup for hotels and villas. Ideal for exploring Kassandra and nearby beaches.",
      introText:
        "Pefkohori offers a long beach and a busy main street. This page helps you arrange car rental with convenient pickup for your stay.",
      areaServed: ["Pefkohori Beach", "Pefkohori Village", "Surrounding Villas"],
      pickupLocation: "Pefkohori Pickup Point",
      offerName: "Pefkohori Car Hire",
      offerDescription: "Beach and village pickup for Pefkohori and Kassandra.",
      pickupGuidance:
        "Pickup in Pefkohori is arranged at or near your accommodation or a central point. Provide your address when booking so we can confirm the exact meeting place.",
      nearbyPlaces: ["Kallithea", "Hanioti", "Kriopigi"],
      faq: [
        { question: "Is Pefkohori busy in summer?", answer: "Yes. It’s one of the busier resorts on Kassandra; booking your car in advance is recommended." },
        { question: "Can I drive to Sithonia from Pefkohori?", answer: "Yes. You cross the “neck” of Halkidiki to reach Sithonia; allow about 45–60 minutes to Nikiti." },
        { question: "Are there parking options in Pefkohori?", answer: "Yes. Many hotels have parking; we can advise on the best place to leave the car when you book." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.HANIOTI]: {
    en: {
      shortName: "Hanioti",
      h1: "Car Rental in Hanioti",
      seoTitle: "Car Rental in Hanioti, Kassandra | Natali Cars",
      seoDescription:
        "Book a car in Hanioti with pickup for the centre and beaches. Explore Kassandra and nearby villages with ease.",
      introText:
        "Hanioti is a lively resort with a long beach and plenty of amenities. Arrange rental with pickup that suits your accommodation.",
      areaServed: ["Hanioti Centre", "Hanioti Beach", "Resort Zone"],
      pickupLocation: "Hanioti Pickup Point",
      offerName: "Hanioti Car Hire",
      offerDescription: "Centre and beach pickup for Hanioti and Kassandra.",
      pickupGuidance:
        "Handover in Hanioti is typically at your hotel or a agreed landmark in the centre. Share your stay details when booking for a smooth pickup.",
      nearbyPlaces: ["Pefkohori", "Polichrono", "Kassandria"],
      faq: [
        { question: "Is Hanioti good for young travellers?", answer: "Yes. It has a busy strip with bars and restaurants; a car still helps for beach-hopping and day trips." },
        { question: "Can I pick up a car at my apartment in Hanioti?", answer: "Yes. We arrange pickup at apartments and villas; provide the full address when booking." },
        { question: "How far is Hanioti from the airport?", answer: "About 120 km from Thessaloniki Airport; roughly 1.5–2 hours by car." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.POLICHRONO]: {
    en: {
      shortName: "Polichrono",
      h1: "Car Rental in Polichrono",
      seoTitle: "Car Rental in Polichrono, Kassandra | Natali Cars",
      seoDescription:
        "Rent a car in Polichrono with pickup for hotels and the beach. Discover Kassandra and nearby resorts.",
      introText:
        "Polichrono is a family-friendly resort with a long beach. This page connects you to car rental with pickup tailored to your stay.",
      areaServed: ["Polichrono Beach", "Polichrono Village", "Nearby Resorts"],
      pickupLocation: "Polichrono Pickup Point",
      offerName: "Polichrono Car Hire",
      offerDescription: "Beach and village pickup for Polichrono and Kassandra.",
      pickupGuidance:
        "Pickup in Polichrono is usually at your hotel or a agreed spot by the beach or main road. Confirm your address when booking so we can set the meeting point.",
      nearbyPlaces: ["Hanioti", "Kassandria", "Sani"],
      faq: [
        { question: "Is Polichrono suitable for families?", answer: "Yes. The beach is long and relatively shallow; a car helps for trips to Sani or other villages." },
        { question: "Can I get a car delivered to my campsite?", answer: "Yes. We can arrange handover at or near campsites; share the exact location when booking." },
        { question: "What is there to do near Polichrono?", answer: "Beaches, tavernas, and short drives to Sani, Kassandria, and other Kassandra spots." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.AFITOS]: {
    en: {
      shortName: "Afitos",
      h1: "Car Rental in Afitos",
      seoTitle: "Car Rental in Afitos, Kassandra | Natali Cars",
      seoDescription:
        "Book a car in Afitos with pickup for the old village and beach. Explore traditional Kassandra and the coast.",
      introText:
        "Afitos is a picturesque village on Kassandra with stone houses and a cliff-top setting. Arrange rental with pickup that fits your stay.",
      areaServed: ["Afitos Village", "Afitos Beach", "Kassandra West"],
      pickupLocation: "Afitos Pickup Point",
      offerName: "Afitos Car Hire",
      offerDescription: "Village and beach pickup for Afitos and Kassandra.",
      pickupGuidance:
        "Handover in Afitos can be at your accommodation or a agreed point in the village or near the beach. Provide your address when booking.",
      nearbyPlaces: ["Kallithea", "Nea Fokea", "Sani"],
      faq: [
        { question: "Is Afitos good for a quiet stay?", answer: "Yes. It’s more traditional and quieter than the busier resorts; a car helps explore the peninsula." },
        { question: "Can I park in Afitos?", answer: "Yes. There are parking areas; some streets in the old village are narrow—we can suggest the best handover spot." },
        { question: "How far is Afitos from Sani?", answer: "About 15–20 minutes by car; Sani is a short drive north." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.KRIOPIGI]: {
    en: {
      shortName: "Kriopigi",
      h1: "Car Rental in Kriopigi",
      seoTitle: "Car Rental in Kriopigi, Kassandra | Natali Cars",
      seoDescription:
        "Rent a car in Kriopigi with pickup for hotels and villas. Explore the middle of Kassandra and nearby beaches.",
      introText:
        "Kriopigi sits between the busier resorts and offers a quieter base. This page helps you book a rental with pickup in Kriopigi or nearby.",
      areaServed: ["Kriopigi Village", "Kriopigi Beach", "Central Kassandra"],
      pickupLocation: "Kriopigi Pickup Point",
      offerName: "Kriopigi Car Hire",
      offerDescription: "Village and beach pickup for Kriopigi and Kassandra.",
      pickupGuidance:
        "Pickup in Kriopigi is arranged at your accommodation or a agreed spot. Share your stay details when booking so we can confirm the meeting point.",
      nearbyPlaces: ["Pefkohori", "Kallithea", "Hanioti"],
      faq: [
        { question: "Is Kriopigi good for a relaxing holiday?", answer: "Yes. It’s less busy than Pefkohori or Hanioti; a car gives you flexibility to explore." },
        { question: "Can I get a car at my villa in Kriopigi?", answer: "Yes. We arrange pickup at villas and apartments; provide the full address when booking." },
        { question: "How do I reach Kriopigi from the airport?", answer: "By car from Thessaloniki Airport via Nea Moudania and the Kassandra road; about 1.5 hours." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.SANI]: {
    en: {
      shortName: "Sani",
      h1: "Car Rental in Sani",
      seoTitle: "Car Rental in Sani, Kassandra | Natali Cars",
      seoDescription:
        "Book a car in Sani with pickup for the resort and marina. Ideal for Sani Resort guests and exploring Kassandra.",
      introText:
        "Sani is known for its upscale resort and marina. Arrange car rental with pickup at Sani or your accommodation for trips around Kassandra.",
      areaServed: ["Sani Resort", "Sani Marina", "Sani Beach"],
      pickupLocation: "Sani Pickup Point",
      offerName: "Sani Car Hire",
      offerDescription: "Resort and marina pickup for Sani and northern Kassandra.",
      pickupGuidance:
        "Handover at Sani can be at the resort, marina, or a agreed point. Confirm your accommodation or preferred meeting place when booking.",
      nearbyPlaces: ["Polichrono", "Afitos", "Thessaloniki (day trip)"],
      faq: [
        { question: "Can I pick up a car at Sani Resort?", answer: "Yes. We coordinate pickup at or near the resort; specify that you’re at Sani Resort when booking." },
        { question: "Is Sani good for a luxury stay?", answer: "Yes. The resort and marina offer high-end facilities; a car adds freedom for exploring the rest of Kassandra." },
        { question: "How far is Sani from Thessaloniki?", answer: "About 100 km; roughly 1.5 hours by car." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.KASSANDRIA]: {
    en: {
      shortName: "Kassandria",
      h1: "Car Rental in Kassandria",
      seoTitle: "Car Rental in Kassandria, Kassandra | Natali Cars",
      seoDescription:
        "Rent a car in Kassandria town with pickup for the centre and nearby resorts. Explore the peninsula from a central base.",
      introText:
        "Kassandria is the main town in the middle of Kassandra peninsula. This page helps you arrange rental with pickup in town or at your stay.",
      areaServed: ["Kassandria Town", "Central Kassandra", "Resort Access"],
      pickupLocation: "Kassandria Pickup Point",
      offerName: "Kassandria Car Hire",
      offerDescription: "Town and central Kassandra pickup.",
      pickupGuidance:
        "Pickup in Kassandria can be in the town centre or at your accommodation. Share your address when booking so we can agree the best meeting point.",
      nearbyPlaces: ["Hanioti", "Polichrono", "Pefkohori"],
      faq: [
        { question: "Is Kassandria a good base for the whole peninsula?", answer: "Yes. It’s central, so you can reach both northern and southern Kassandra easily." },
        { question: "Are there supermarkets in Kassandria?", answer: "Yes. The town has shops and services; many visitors stock up here before heading to resorts." },
        { question: "Can I get a car at my hotel near Kassandria?", answer: "Yes. We arrange pickup at hotels and villas in and around Kassandria; provide your address when booking." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.FOURKA]: {
    en: {
      shortName: "Fourka",
      h1: "Car Rental in Fourka",
      seoTitle: "Car Rental in Fourka, Sithonia | Natali Cars",
      seoDescription:
        "Book a car in Fourka with pickup for the beach and village. Explore western Sithonia and nearby bays.",
      introText:
        "Fourka is a small resort on the west coast of Sithonia. Arrange rental with pickup in Fourka or at your accommodation for a relaxed stay.",
      areaServed: ["Fourka Beach", "Fourka Village", "Western Sithonia"],
      pickupLocation: "Fourka Pickup Point",
      offerName: "Fourka Car Hire",
      offerDescription: "Beach and village pickup for Fourka and Sithonia.",
      pickupGuidance:
        "Handover in Fourka is usually at your hotel or a agreed spot by the beach. Tell us your address when booking so we can set the meeting point.",
      nearbyPlaces: ["Nikiti", "Neos Marmaras", "Metamorfosi"],
      faq: [
        { question: "Is Fourka good for a quiet holiday?", answer: "Yes. It’s smaller and quieter than Nikiti or Neos Marmaras; a car helps explore more of Sithonia." },
        { question: "Can I get a car at my apartment in Fourka?", answer: "Yes. We arrange pickup at apartments and villas; provide the full address when booking." },
        { question: "What beaches are near Fourka?", answer: "Several bays are within a short drive; we can suggest routes when you book." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.METAMORFOSI]: {
    en: {
      shortName: "Metamorfosi",
      h1: "Car Rental in Metamorfosi",
      seoTitle: "Car Rental in Metamorfosi, Sithonia | Natali Cars",
      seoDescription:
        "Rent a car in Metamorfosi with pickup for the village and coast. Discover western Sithonia and nearby beaches.",
      introText:
        "Metamorfosi is a small village on Sithonia with a relaxed atmosphere. This page helps you book a rental with pickup in Metamorfosi or nearby.",
      areaServed: ["Metamorfosi Village", "Metamorfosi Coast", "Western Sithonia"],
      pickupLocation: "Metamorfosi Pickup Point",
      offerName: "Metamorfosi Car Hire",
      offerDescription: "Village and coast pickup for Metamorfosi and Sithonia.",
      pickupGuidance:
        "Pickup in Metamorfosi is arranged at your accommodation or a agreed landmark. Share your stay details when booking for a smooth handover.",
      nearbyPlaces: ["Fourka", "Nikiti", "Neos Marmaras"],
      faq: [
        { question: "Is Metamorfosi family-friendly?", answer: "Yes. It’s quiet and low-key; a car helps with beach-hopping and shopping in Nikiti or Neos Marmaras." },
        { question: "Can I pick up a car at my villa in Metamorfosi?", answer: "Yes. We coordinate pickup at villas; provide the address when booking." },
        { question: "How far is Metamorfosi from the airport?", answer: "About 120 km from Thessaloniki Airport; roughly 1.5–2 hours by car." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.AGIOS_NIKOLAOS_HALKIDIKI]: {
    en: {
      shortName: "Agios Nikolaos",
      h1: "Car Rental in Agios Nikolaos (Halkidiki)",
      seoTitle: "Car Rental in Agios Nikolaos, Sithonia | Natali Cars",
      seoDescription:
        "Book a car in Agios Nikolaos with pickup for the village and beach. Explore eastern Sithonia and nearby bays.",
      introText:
        "Agios Nikolaos is a scenic village on the east coast of Sithonia. Arrange rental with pickup that suits your accommodation and plans.",
      areaServed: ["Agios Nikolaos Village", "Agios Nikolaos Beach", "Eastern Sithonia"],
      pickupLocation: "Agios Nikolaos Pickup Point",
      offerName: "Agios Nikolaos Car Hire",
      offerDescription: "Village and beach pickup for Agios Nikolaos and Sithonia.",
      pickupGuidance:
        "Handover in Agios Nikolaos can be at your hotel or a agreed spot by the beach or village. Provide your address when booking.",
      nearbyPlaces: ["Nikiti", "Sarti", "Sykes"],
      faq: [
        { question: "Is Agios Nikolaos good for swimming?", answer: "Yes. The village has a calm bay; a car lets you discover other beaches along the coast." },
        { question: "Can I get a car at my hotel in Agios Nikolaos?", answer: "Yes. We arrange pickup at hotels and apartments; confirm your address when booking." },
        { question: "How do I reach Sarti from Agios Nikolaos?", answer: "By car along the east coast; the drive is scenic and takes about 20–30 minutes." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.ORMILIA]: {
    en: {
      shortName: "Ormilia",
      h1: "Car Rental in Ormilia",
      seoTitle: "Car Rental in Ormilia, Halkidiki | Natali Cars",
      seoDescription:
        "Rent a car in Ormilia with pickup for the village and nearby areas. Convenient for the western approach to Halkidiki.",
      introText:
        "Ormilia is on the way into Halkidiki from Thessaloniki. This page helps you arrange car rental with pickup in Ormilia or at your stay.",
      areaServed: ["Ormilia Village", "Western Halkidiki Approach"],
      pickupLocation: "Ormilia Pickup Point",
      offerName: "Ormilia Car Hire",
      offerDescription: "Village pickup for Ormilia and western Halkidiki.",
      pickupGuidance:
        "Pickup in Ormilia is arranged at a agreed point in the village or near your accommodation. Share your address when booking.",
      nearbyPlaces: ["Nea Moudania", "Nea Kallikratia", "Thessaloniki"],
      faq: [
        { question: "Is Ormilia a good stop on the way to Halkidiki?", answer: "Yes. It’s a convenient point to pick up or drop off a car when travelling from Thessaloniki." },
        { question: "Can I get a car at my hotel near Ormilia?", answer: "Yes. We coordinate pickup at hotels and villas in the area; provide your address when booking." },
        { question: "How far is Ormilia from Thessaloniki?", answer: "About 45 km; roughly 40–50 minutes by car." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.PETRALONA]: {
    en: {
      shortName: "Petralona",
      h1: "Car Rental in Petralona",
      seoTitle: "Car Rental in Petralona, Halkidiki | Natali Cars",
      seoDescription:
        "Book a car in Petralona with pickup for the village and cave area. Ideal for combining culture and beach trips in Halkidiki.",
      introText:
        "Petralona is famous for the Petralona Cave and sits inland from the coast. Arrange rental with pickup in Petralona or nearby for a flexible trip.",
      areaServed: ["Petralona Village", "Petralona Cave Area", "Inland Halkidiki"],
      pickupLocation: "Petralona Pickup Point",
      offerName: "Petralona Car Hire",
      offerDescription: "Village and cave-area pickup for Petralona and inland Halkidiki.",
      pickupGuidance:
        "Handover in Petralona can be at your accommodation or near the cave and village. Confirm your address or preferred meeting point when booking.",
      nearbyPlaces: ["Nea Moudania", "Olympiada", "Thessaloniki"],
      faq: [
        { question: "Is Petralona Cave worth visiting?", answer: "Yes. It’s a major archaeological and natural site; a car makes it easy to combine with beach stays." },
        { question: "Can I pick up a car at Petralona Cave?", answer: "We can arrange pickup near the cave or in the village; specify when booking." },
        { question: "How far is Petralona from the coast?", answer: "About 15–20 km from Nea Moudania; roughly 20–25 minutes by car." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.VRASNA]: {
    en: {
      shortName: "Vrasna",
      h1: "Car Rental in Vrasna",
      seoTitle: "Car Rental in Vrasna, Halkidiki | Natali Cars",
      seoDescription:
        "Rent a car in Vrasna with pickup for the beach and village. Explore the eastern coast and Strymon Gulf area.",
      introText:
        "Vrasna is a coastal village on the eastern side of Halkidiki. This page helps you arrange rental with pickup in Vrasna or at your accommodation.",
      areaServed: ["Vrasna Beach", "Vrasna Village", "Eastern Halkidiki Coast"],
      pickupLocation: "Vrasna Pickup Point",
      offerName: "Vrasna Car Hire",
      offerDescription: "Beach and village pickup for Vrasna and the east coast.",
      pickupGuidance:
        "Pickup in Vrasna is usually at your hotel or a agreed spot by the beach or village. Share your stay details when booking so we can set the meeting point.",
      nearbyPlaces: ["Olympiada", "Stratoni", "Nea Moudania"],
      faq: [
        { question: "Is Vrasna good for families?", answer: "Yes. The beach is calm and the village is low-key; a car helps with day trips." },
        { question: "Can I get a car at my apartment in Vrasna?", answer: "Yes. We arrange pickup at apartments and villas; provide the full address when booking." },
        { question: "How do I reach Olympiada from Vrasna?", answer: "By car along the coast; the drive takes about 30–40 minutes." },
      ],
    },
  },
  [LOCATION_CONTENT_KEYS.OLYMPIADA]: {
    en: {
      shortName: "Olympiada",
      h1: "Car Rental in Olympiada",
      seoTitle: "Car Rental in Olympiada, Halkidiki | Natali Cars",
      seoDescription:
        "Book a car in Olympiada with pickup for the village and beach. Discover ancient Stageira and the eastern Halkidiki coast.",
      introText:
        "Olympiada is a coastal village near ancient Stageira. Arrange rental with pickup in Olympiada or at your stay for history and beach trips.",
      areaServed: ["Olympiada Village", "Olympiada Beach", "Stageira Area"],
      pickupLocation: "Olympiada Pickup Point",
      offerName: "Olympiada Car Hire",
      offerDescription: "Village and beach pickup for Olympiada and eastern Halkidiki.",
      pickupGuidance:
        "Handover in Olympiada can be at your accommodation or a agreed point by the beach or village. Provide your address when booking.",
      nearbyPlaces: ["Ancient Stageira", "Vrasna", "Stratoni"],
      faq: [
        { question: "Is Olympiada near Ancient Stageira?", answer: "Yes. The archaeological site is a short drive; a car makes it easy to visit and explore the coast." },
        { question: "Can I pick up a car at my hotel in Olympiada?", answer: "Yes. We coordinate pickup at hotels and apartments; confirm your address when booking." },
        { question: "How far is Olympiada from Thessaloniki?", answer: "About 110 km; roughly 1.5–2 hours by car." },
      ],
    },
  },
};

export const locationContentByKey = Object.fromEntries(
  Object.entries(locationContentByKeyRaw).map(([contentKey, localizedValues]) => [
    contentKey,
    expandLocaleRecord(localizedValues),
  ])
) as Record<LocationContentKey, Record<SupportedLocale, LocationSeoContent>>;

export const locationSeoRepo: LocationSeoRepoItem[] = [
  {
    id: LOCATION_IDS.THESSALONIKI,
    canonicalSlug: "car-rental-thessaloniki",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.THESSALONIKI,
    parentId: null,
    childIds: [LOCATION_IDS.THESSALONIKI_AIRPORT],
    slugByLocale: {
      en: "car-rental-thessaloniki",
      ru: "arenda-avto-saloniki",
      uk: "orenda-avto-saloniky",
      el: "enoikiasi-autokinitou-thessaloniki",
      de: "mietwagen-thessaloniki",
      bg: "koli-pod-naem-solun",
      ro: "inchirieri-auto-salonic",
      sr: "rent-a-car-solun",
    },
  },
  {
    id: LOCATION_IDS.THESSALONIKI_AIRPORT,
    canonicalSlug: "car-rental-thessaloniki-airport",
    locationType: "airport",
    contentKey: LOCATION_CONTENT_KEYS.THESSALONIKI_AIRPORT,
    parentId: LOCATION_IDS.THESSALONIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-thessaloniki-airport",
      ru: "arenda-avto-aeroport-saloniki",
      uk: "orenda-avto-aeroport-saloniky",
      el: "enoikiasi-autokinitou-aerodromio-thessaloniki",
      de: "mietwagen-thessaloniki-flughafen",
      bg: "koli-pod-naem-letishte-solun",
      ro: "inchirieri-auto-aeroport-salonic",
      sr: "rent-a-car-aerodrom-solun",
    },
  },
  {
    id: LOCATION_IDS.HALKIDIKI,
    canonicalSlug: "car-rental-halkidiki",
    locationType: "region",
    contentKey: LOCATION_CONTENT_KEYS.HALKIDIKI,
    parentId: null,
    childIds: [
      LOCATION_IDS.SITHONIA,
      LOCATION_IDS.KASSANDRA,
      LOCATION_IDS.NEA_KALLIKRATIA,
      LOCATION_IDS.NEA_MOUDANIA,
      LOCATION_IDS.NIKITI,
      LOCATION_IDS.NEOS_MARMARAS,
      LOCATION_IDS.SARTI,
      LOCATION_IDS.KALLITHEA,
      LOCATION_IDS.PEFKOHORI,
      LOCATION_IDS.HANIOTI,
      LOCATION_IDS.POLICHRONO,
      LOCATION_IDS.AFITOS,
      LOCATION_IDS.KRIOPIGI,
      LOCATION_IDS.SANI,
      LOCATION_IDS.KASSANDRIA,
      LOCATION_IDS.FOURKA,
      LOCATION_IDS.METAMORFOSI,
      LOCATION_IDS.AGIOS_NIKOLAOS_HALKIDIKI,
      LOCATION_IDS.ORMILIA,
      LOCATION_IDS.PETRALONA,
      LOCATION_IDS.VRASNA,
      LOCATION_IDS.OLYMPIADA,
    ],
    slugByLocale: {
      en: "car-rental-halkidiki",
      ru: "arenda-avto-halkidiki",
      uk: "orenda-avto-halkidiki",
      el: "enoikiasi-autokinitou-halkidiki",
      de: "mietwagen-halkidiki",
      bg: "koli-pod-naem-halkidiki",
      ro: "inchirieri-auto-halkidiki",
      sr: "rent-a-car-halkidiki",
    },
  },
  {
    id: LOCATION_IDS.SITHONIA,
    canonicalSlug: "car-rental-sithonia",
    locationType: "subRegion",
    contentKey: LOCATION_CONTENT_KEYS.SITHONIA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-sithonia",
      ru: "arenda-avto-sitoniya",
      uk: "orenda-avto-sitoniya",
      el: "enoikiasi-autokinitou-sithonia",
      de: "mietwagen-sithonia",
      bg: "koli-pod-naem-sitoniya",
      ro: "inchirieri-auto-sithonia",
      sr: "rent-a-car-sitonija",
    },
  },
  {
    id: LOCATION_IDS.KASSANDRA,
    canonicalSlug: "car-rental-kassandra",
    locationType: "subRegion",
    contentKey: LOCATION_CONTENT_KEYS.KASSANDRA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-kassandra",
      ru: "arenda-avto-kassandra",
      uk: "orenda-avto-kassandra",
      el: "enoikiasi-autokinitou-kassandra",
      de: "mietwagen-kassandra",
      bg: "koli-pod-naem-kasandra",
      ro: "inchirieri-auto-kassandra",
      sr: "rent-a-car-kasandra",
    },
  },
  // Halkidiki city pages (CTA → homepage search with pickup param)
  {
    id: LOCATION_IDS.NEA_KALLIKRATIA,
    canonicalSlug: "car-rental-nea-kallikratia",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.NEA_KALLIKRATIA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-nea-kallikratia",
      ru: "arenda-avto-nea-kallikratia",
      uk: "orenda-avto-nea-kallikratia",
      el: "enoikiasi-nea-kallikratia",
      de: "mietwagen-nea-kallikratia",
      bg: "koli-pod-naem-nea-kallikratia",
      ro: "inchirieri-auto-nea-kallikratia",
      sr: "rent-a-car-nea-kallikratia",
    },
  },
  {
    id: LOCATION_IDS.NEA_MOUDANIA,
    canonicalSlug: "car-rental-nea-moudania",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.NEA_MOUDANIA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-nea-moudania",
      ru: "arenda-avto-nea-mudania",
      uk: "orenda-avto-nea-mudania",
      el: "enoikiasi-nea-moudania",
      de: "mietwagen-nea-moudania",
      bg: "koli-pod-naem-nea-moudania",
      ro: "inchirieri-auto-nea-moudania",
      sr: "rent-a-car-nea-moudania",
    },
  },
  {
    id: LOCATION_IDS.NIKITI,
    canonicalSlug: "car-rental-nikiti",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.NIKITI,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-nikiti",
      ru: "arenda-avto-nikiti",
      uk: "orenda-avto-nikiti",
      el: "enoikiasi-nikiti",
      de: "mietwagen-nikiti",
      bg: "koli-pod-naem-nikiti",
      ro: "inchirieri-auto-nikiti",
      sr: "rent-a-car-nikiti",
    },
  },
  {
    id: LOCATION_IDS.NEOS_MARMARAS,
    canonicalSlug: "car-rental-neos-marmaras",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.NEOS_MARMARAS,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-neos-marmaras",
      ru: "arenda-avto-neos-marmaras",
      uk: "orenda-avto-neos-marmaras",
      el: "enoikiasi-neos-marmaras",
      de: "mietwagen-neos-marmaras",
      bg: "koli-pod-naem-neos-marmaras",
      ro: "inchirieri-auto-neos-marmaras",
      sr: "rent-a-car-neos-marmaras",
    },
  },
  {
    id: LOCATION_IDS.SARTI,
    canonicalSlug: "car-rental-sarti",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.SARTI,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-sarti",
      ru: "arenda-avto-sarti",
      uk: "orenda-avto-sarti",
      el: "enoikiasi-sarti",
      de: "mietwagen-sarti",
      bg: "koli-pod-naem-sarti",
      ro: "inchirieri-auto-sarti",
      sr: "rent-a-car-sarti",
    },
  },
  {
    id: LOCATION_IDS.KALLITHEA,
    canonicalSlug: "car-rental-kallithea",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.KALLITHEA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-kallithea",
      ru: "arenda-avto-kallifea",
      uk: "orenda-avto-kallifea",
      el: "enoikiasi-kallithea",
      de: "mietwagen-kallithea",
      bg: "koli-pod-naem-kallithea",
      ro: "inchirieri-auto-kallithea",
      sr: "rent-a-car-kallithea",
    },
  },
  {
    id: LOCATION_IDS.PEFKOHORI,
    canonicalSlug: "car-rental-pefkohori",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.PEFKOHORI,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-pefkohori",
      ru: "arenda-avto-pefkohori",
      uk: "orenda-avto-pefkohori",
      el: "enoikiasi-pefkohori",
      de: "mietwagen-pefkohori",
      bg: "koli-pod-naem-pefkohori",
      ro: "inchirieri-auto-pefkohori",
      sr: "rent-a-car-pefkohori",
    },
  },
  {
    id: LOCATION_IDS.HANIOTI,
    canonicalSlug: "car-rental-hanioti",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.HANIOTI,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-hanioti",
      ru: "arenda-avto-hanoti",
      uk: "orenda-avto-hanoti",
      el: "enoikiasi-hanioti",
      de: "mietwagen-hanioti",
      bg: "koli-pod-naem-hanioti",
      ro: "inchirieri-auto-hanioti",
      sr: "rent-a-car-hanioti",
    },
  },
  {
    id: LOCATION_IDS.POLICHRONO,
    canonicalSlug: "car-rental-polichrono",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.POLICHRONO,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-polichrono",
      ru: "arenda-avto-polihrono",
      uk: "orenda-avto-polihrono",
      el: "enoikiasi-polichrono",
      de: "mietwagen-polichrono",
      bg: "koli-pod-naem-polichrono",
      ro: "inchirieri-auto-polichrono",
      sr: "rent-a-car-polichrono",
    },
  },
  {
    id: LOCATION_IDS.AFITOS,
    canonicalSlug: "car-rental-afitos",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.AFITOS,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-afitos",
      ru: "arenda-avto-afitos",
      uk: "orenda-avto-afitos",
      el: "enoikiasi-afitos",
      de: "mietwagen-afitos",
      bg: "koli-pod-naem-afitos",
      ro: "inchirieri-auto-afitos",
      sr: "rent-a-car-afitos",
    },
  },
  {
    id: LOCATION_IDS.KRIOPIGI,
    canonicalSlug: "car-rental-kriopigi",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.KRIOPIGI,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-kriopigi",
      ru: "arenda-avto-kriopigi",
      uk: "orenda-avto-kriopigi",
      el: "enoikiasi-kriopigi",
      de: "mietwagen-kriopigi",
      bg: "koli-pod-naem-kriopigi",
      ro: "inchirieri-auto-kriopigi",
      sr: "rent-a-car-kriopigi",
    },
  },
  {
    id: LOCATION_IDS.SANI,
    canonicalSlug: "car-rental-sani",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.SANI,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-sani",
      ru: "arenda-avto-sani",
      uk: "orenda-avto-sani",
      el: "enoikiasi-sani",
      de: "mietwagen-sani",
      bg: "koli-pod-naem-sani",
      ro: "inchirieri-auto-sani",
      sr: "rent-a-car-sani",
    },
  },
  {
    id: LOCATION_IDS.KASSANDRIA,
    canonicalSlug: "car-rental-kassandria",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.KASSANDRIA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-kassandria",
      ru: "arenda-avto-kassandria",
      uk: "orenda-avto-kassandria",
      el: "enoikiasi-kassandria",
      de: "mietwagen-kassandria",
      bg: "koli-pod-naem-kassandria",
      ro: "inchirieri-auto-kassandria",
      sr: "rent-a-car-kassandria",
    },
  },
  {
    id: LOCATION_IDS.FOURKA,
    canonicalSlug: "car-rental-fourka",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.FOURKA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-fourka",
      ru: "arenda-avto-fourka",
      uk: "orenda-avto-fourka",
      el: "enoikiasi-fourka",
      de: "mietwagen-fourka",
      bg: "koli-pod-naem-fourka",
      ro: "inchirieri-auto-fourka",
      sr: "rent-a-car-fourka",
    },
  },
  {
    id: LOCATION_IDS.METAMORFOSI,
    canonicalSlug: "car-rental-metamorfosi",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.METAMORFOSI,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-metamorfosi",
      ru: "arenda-avto-metamorfosi",
      uk: "orenda-avto-metamorfosi",
      el: "enoikiasi-metamorfosi",
      de: "mietwagen-metamorfosi",
      bg: "koli-pod-naem-metamorfosi",
      ro: "inchirieri-auto-metamorfosi",
      sr: "rent-a-car-metamorfosi",
    },
  },
  {
    id: LOCATION_IDS.AGIOS_NIKOLAOS_HALKIDIKI,
    canonicalSlug: "car-rental-agios-nikolaos-halkidiki",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.AGIOS_NIKOLAOS_HALKIDIKI,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-agios-nikolaos-halkidiki",
      ru: "arenda-avto-agios-nikolaos-halkidiki",
      uk: "orenda-avto-agios-nikolaos-halkidiki",
      el: "enoikiasi-agios-nikolaos-halkidiki",
      de: "mietwagen-agios-nikolaos-halkidiki",
      bg: "koli-pod-naem-agios-nikolaos-halkidiki",
      ro: "inchirieri-auto-agios-nikolaos-halkidiki",
      sr: "rent-a-car-agios-nikolaos-halkidiki",
    },
  },
  {
    id: LOCATION_IDS.ORMILIA,
    canonicalSlug: "car-rental-ormilia",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.ORMILIA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-ormilia",
      ru: "arenda-avto-ormilia",
      uk: "orenda-avto-ormilia",
      el: "enoikiasi-ormilia",
      de: "mietwagen-ormilia",
      bg: "koli-pod-naem-ormilia",
      ro: "inchirieri-auto-ormilia",
      sr: "rent-a-car-ormilia",
    },
  },
  {
    id: LOCATION_IDS.PETRALONA,
    canonicalSlug: "car-rental-petralona",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.PETRALONA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-petralona",
      ru: "arenda-avto-petralona",
      uk: "orenda-avto-petralona",
      el: "enoikiasi-petralona",
      de: "mietwagen-petralona",
      bg: "koli-pod-naem-petralona",
      ro: "inchirieri-auto-petralona",
      sr: "rent-a-car-petralona",
    },
  },
  {
    id: LOCATION_IDS.VRASNA,
    canonicalSlug: "car-rental-vrasna",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.VRASNA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-vrasna",
      ru: "arenda-avto-vrasna",
      uk: "orenda-avto-vrasna",
      el: "enoikiasi-vrasna",
      de: "mietwagen-vrasna",
      bg: "koli-pod-naem-vrasna",
      ro: "inchirieri-auto-vrasna",
      sr: "rent-a-car-vrasna",
    },
  },
  {
    id: LOCATION_IDS.OLYMPIADA,
    canonicalSlug: "car-rental-olympiada",
    locationType: "city",
    contentKey: LOCATION_CONTENT_KEYS.OLYMPIADA,
    parentId: LOCATION_IDS.HALKIDIKI,
    childIds: [],
    slugByLocale: {
      en: "car-rental-olympiada",
      ru: "arenda-avto-olimpiada",
      uk: "orenda-avto-olimpiada",
      el: "enoikiasi-olympiada",
      de: "mietwagen-olympiada",
      bg: "koli-pod-naem-olympiada",
      ro: "inchirieri-auto-olympiada",
      sr: "rent-a-car-olympiada",
    },
  },
];

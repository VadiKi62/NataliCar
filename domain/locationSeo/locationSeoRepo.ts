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
  LocationSeoFaqItem,
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
      seoTitleTemplate: "Rent {carModel} in Halkidiki | Natali Cars",
      seoDescriptionTemplate:
        "Book {carModel} car rental in Halkidiki with pickup at Thessaloniki Airport (SKG) or {locationName}. {transmission} transmission, air conditioning, fuel efficient. Comfortable and easy to drive.",
      carH1Template: "Rent {carModel} in {locationName}",
      introTemplate:
        "The {carModel} is available for rent in {locationName} with flexible pickup and return options. {transmission} transmission, {fuelType} fuel, {seats} seats — a great choice for your trip to Halkidiki.",
      introLongTemplate:
        "The {carModel} is one of the most convenient cars to rent in {locationName}. This compact and fuel-efficient vehicle is ideal for exploring beaches, villages and scenic coastal roads. With {transmission} transmission and air conditioning, the {carModel} offers comfortable driving both in Thessaloniki city traffic and along the Halkidiki peninsula. Natali Cars offers pickup at Thessaloniki Airport (SKG) and Nea Kallikratia, making it easy to start your trip immediately after arrival. All rentals include comprehensive insurance and free cancellation. Book online to secure the best rate for your dates.",
      specsTitle: "Vehicle Specifications",
      quickSpecsTitle: "At a glance",
      featuresTitle: "Features of {carModel}",
      whyRentTitle: "Why choose {carModel} for your {locationName} trip",
      whyRentBullets: [
        "Easy parking — compact size fits narrow village streets",
        "Fuel efficient — lower cost for long drives",
        "Perfect for couples or small families",
        "Reliable and comfortable for city and coast",
      ],
      faqTitle: "Frequently Asked Questions",
      faq: [
        { question: "Can I pick up this car at Thessaloniki Airport?", answer: "Yes, we offer pickup and return at Thessaloniki Airport (SKG), as well as at locations across Halkidiki including Nea Kallikratia, Kassandra, and Sithonia." },
        { question: "Is insurance included in the rental price?", answer: "Basic TPL insurance is included at no extra cost. You can also add full CDW coverage for additional peace of mind during your rental." },
        { question: "Do I need a credit card to rent a car?", answer: "No, a credit card is not required. We accept cash payments and offer rentals without a deposit on selected vehicles." },
        { question: "What documents do I need to rent a car?", answer: "You need a valid driving license held for at least 1 year and a passport or ID card. International driving permits are accepted." },
        { question: "Can I return the car to a different location?", answer: "Yes, one-way rentals are available. You can pick up in one location and return in another across our Halkidiki and Thessaloniki network." },
      ],
      breadcrumbHome: "Home",
      breadcrumbCars: "Cars",
      breadcrumbCarRentalLocation: "Car rental {locationName}",
      pickupTitle: "Pickup Locations",
      pillarLinksTitle: "Car rental by location",
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
      locationHeroCtaLabel: "Find your car",
      pickupGuidanceTitle: "Pickup guidance",
      nearbyPlacesTitle: "Nearby places",
      usefulTipsTitle: "Useful tips",
      distanceToThessalonikiTitle: "Distance to Thessaloniki",
      localFaqTitle: "Local FAQ",
      navLocationsDropdownDescription:
        "Pickup and return across Thessaloniki, airport, and Halkidiki peninsula. Choose your area for details and car search.",
      otherCarsTitle: "Other cars you may like",
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
      seoTitleTemplate: "Аренда {carModel} в Халкидиках | Natali Cars",
      seoDescriptionTemplate:
        "Забронируйте аренду {carModel} в Халкидиках с подачей в аэропорту Салоников (SKG) или {locationName}. {transmission}, кондиционер, экономичный расход.",
      carH1Template: "Аренда {carModel} в {locationName}",
      introTemplate:
        "{carModel} доступен для аренды в {locationName} с гибкими условиями выдачи и возврата. КПП {transmission}, топливо {fuelType}, {seats} мест — отличный выбор для поездки в Халкидики.",
      introLongTemplate:
        "{carModel} — один из самых удобных автомобилей для аренды в {locationName}. Компактный и экономичный, он идеален для поездок по пляжам, деревням и живописным дорогам побережья. С {transmission} и кондиционером {carModel} обеспечивает комфортную езду и в городе Салоники, и по полуострову Халкидики. Natali Cars предлагает подачу в аэропорту Салоников (SKG) и в Неа Каликратии. В стоимость входят страховка и бесплатная отмена. Забронируйте онлайн по лучшей цене.",
      specsTitle: "Характеристики автомобиля",
      quickSpecsTitle: "Кратко",
      featuresTitle: "Особенности {carModel}",
      whyRentTitle: "Почему выбрать {carModel} для поездки в {locationName}",
      whyRentBullets: [
        "Удобная парковка — компактный размер для узких улиц",
        "Экономичный расход — выгодно для дальних поездок",
        "Идеален для пары или небольшой семьи",
        "Надёжный и комфортный в городе и на побережье",
      ],
      faqTitle: "Часто задаваемые вопросы",
      faq: [
        { question: "Можно ли забрать этот автомобиль в аэропорту Салоников?", answer: "Да, мы предлагаем выдачу и возврат в аэропорту Салоников (SKG), а также в Халкидиках: Неа Каликратия, Кассандра, Ситония." },
        { question: "Включена ли страховка в стоимость аренды?", answer: "Базовая страховка ОСАГО (TPL) включена бесплатно. Вы также можете добавить полное КАСКО (CDW) для дополнительной защиты." },
        { question: "Нужна ли кредитная карта для аренды?", answer: "Нет, кредитная карта не требуется. Мы принимаем оплату наличными и предлагаем аренду без депозита на отдельные автомобили." },
        { question: "Какие документы нужны для аренды?", answer: "Вам понадобятся действующие водительские права со стажем не менее 1 года и паспорт или удостоверение личности. Принимаются международные права." },
        { question: "Можно ли вернуть машину в другом месте?", answer: "Да, возможна аренда в одну сторону. Вы можете получить авто в одной точке и вернуть в другой по нашей сети в Халкидиках и Салониках." },
      ],
      breadcrumbHome: "Главная",
      breadcrumbCars: "Автомобили",
      breadcrumbCarRentalLocation: "Аренда авто в {locationName}",
      pickupTitle: "Пункты выдачи",
      pillarLinksTitle: "Аренда авто по локациям",
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
      locationHeroCtaLabel: "Подобрать авто",
      pickupGuidanceTitle: "Инструкция по выдаче",
      nearbyPlacesTitle: "Рядом",
      usefulTipsTitle: "Полезные советы",
      distanceToThessalonikiTitle: "Расстояние до Салоник",
      localFaqTitle: "Частые вопросы",
      navLocationsDropdownDescription:
        "Выдача и возврат в Салониках, аэропорту и на полуострове Халкидики. Выберите район для деталей и поиска авто.",
      otherCarsTitle: "Другие автомобили, которые могут вам понравиться",
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
      seoTitleTemplate: "Оренда {carModel} в Халкідіках | Natali Cars",
      seoDescriptionTemplate:
        "Забронюйте оренду {carModel} в Халкідіках з подачею в аеропорту Салонік (SKG) або {locationName}. {transmission}, кондиціонер, економний витрата.",
      carH1Template: "Оренда {carModel} у {locationName}",
      introTemplate:
        "{carModel} доступний для оренди в {locationName} з гнучкими умовами видачі та повернення. КПП {transmission}, паливо {fuelType}, {seats} місць — чудовий вибір для подорожі до Халкідік.",
      introLongTemplate:
        "{carModel} — один із найзручніших автомобілів для оренди у {locationName}. Компактний та економний, він ідеальний для поїздок узбережжям, селами та мальовничими дорогами. З {transmission} та кондиціонером {carModel} забезпечує комфортну їзду в місті Салоніки та по Халкідіках. Natali Cars пропонує подачу в аеропорту Салонік (SKG) та в Неа Калікратії. У вартість входить страховка та безкоштовне скасування.",
      specsTitle: "Характеристики автомобіля",
      quickSpecsTitle: "Коротко",
      featuresTitle: "Особливості {carModel}",
      whyRentTitle: "Чому обрати {carModel} для поїздки у {locationName}",
      whyRentBullets: [
        "Зручна парковка — компактний розмір для вузьких вулиць",
        "Економний витрата палива",
        "Ідеален для пари або невеликої сім'ї",
        "Надійний і комфортний у місті та на узбережжі",
      ],
      faqTitle: "Поширені запитання",
      faq: [
        { question: "Чи можна забрати цей автомобіль в аеропорту Салонік?", answer: "Так, ми пропонуємо видачу та повернення в аеропорту Салонік (SKG), а також у Халкідіках: Неа Калікратія, Кассандра, Сітонія." },
        { question: "Чи включена страховка у вартість оренди?", answer: "Базова страховка ОСАГО (TPL) включена безкоштовно. Ви також можете додати повне КАСКО (CDW) для додаткового захисту." },
        { question: "Чи потрібна кредитна картка для оренди?", answer: "Ні, кредитна картка не потрібна. Ми приймаємо оплату готівкою та пропонуємо оренду без депозиту на окремі автомобілі." },
        { question: "Які документи потрібні для оренди?", answer: "Вам знадобляться дійсне водійське посвідчення зі стажем не менше 1 року та паспорт або посвідчення особи. Приймаються міжнародні права." },
        { question: "Чи можна повернути авто в іншому місці?", answer: "Так, можлива оренда в один бік. Ви можете отримати авто в одній точці та повернути в іншій по нашій мережі в Халкідіках і Салоніках." },
      ],
      breadcrumbHome: "Головна",
      breadcrumbCars: "Автомобілі",
      breadcrumbCarRentalLocation: "Оренда авто у {locationName}",
      pickupTitle: "Пункти видачі",
      pillarLinksTitle: "Оренда авто за локаціями",
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
      locationHeroCtaLabel: "Знайти авто",
      pickupGuidanceTitle: "Інструкція з отримання",
      nearbyPlacesTitle: "Поруч",
      usefulTipsTitle: "Корисні поради",
      distanceToThessalonikiTitle: "Відстань до Салонік",
      localFaqTitle: "Часті питання",
      navLocationsDropdownDescription:
        "Отримання та повернення в Салоніках, аеропорту та на півострові Халкідіки. Оберіть регіон для деталей та пошуку авто.",
      otherCarsTitle: "Інші автомобілі, які можуть вам сподобатися",
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
      seoTitleTemplate: "Ενοικίαση {carModel} στη Χαλκιδική | Natali Cars",
      seoDescriptionTemplate:
        "Κλείστε ενοικίαση {carModel} στη Χαλκιδική με παραλαβή στο αεροδρόμιο Θεσσαλονίκης (SKG) ή στη {locationName}. {transmission}, κλιματισμός, οικονομία καυσίμου.",
      carH1Template: "Ενοικίαση {carModel} στη {locationName}",
      introTemplate:
        "Το {carModel} είναι διαθέσιμο προς ενοικίαση στη {locationName} με ευέλικτες επιλογές παραλαβής και επιστροφής. Κιβώτιο {transmission}, καύσιμο {fuelType}, {seats} θέσεις — ιδανική επιλογή για τη Χαλκιδική.",
      introLongTemplate:
        "Το {carModel} είναι ένα από τα πιο βολικά αυτοκίνητα για ενοικίαση στη {locationName}. Κομψό και οικονομικό, ιδανικό για παραλίες, χωριά και πανοραμικούς δρόμους. Με κιβώτιο {transmission} και κλιματισμό, το {carModel} προσφέρει άνετη οδήγηση τόσο στην πόλη της Θεσσαλονίκης όσο και στη Χαλκιδική. Η Natali Cars προσφέρει παραλαβή στο αεροδρόμιο Θεσσαλονίκης (SKG) και στη Νέα Καλλικράτεια. Όλες οι ενοικιάσεις περιλαμβάνουν ασφάλιση και δωρεάν ακύρωση.",
      specsTitle: "Προδιαγραφές οχήματος",
      quickSpecsTitle: "Σύντομα",
      featuresTitle: "Χαρακτηριστικά του {carModel}",
      whyRentTitle: "Γιατί να επιλέξετε το {carModel} για το ταξίδι σας στη {locationName}",
      whyRentBullets: [
        "Εύκολο πάρκινγκ — compact μέγεθος για στενά δρομάκια",
        "Οικονομία καυσίμου",
        "Ιδανικό για ζευγάρια ή μικρές οικογένειες",
        "Αξιόπιστο και άνετο στην πόλη και στην ακτή",
      ],
      faqTitle: "Συχνές ερωτήσεις",
      faq: [
        { question: "Μπορώ να παραλάβω αυτό το αυτοκίνητο στο αεροδρόμιο Θεσσαλονίκης;", answer: "Ναι, προσφέρουμε παραλαβή και επιστροφή στο αεροδρόμιο Θεσσαλονίκης (SKG), καθώς και σε τοποθεσίες στη Χαλκιδική: Νέα Καλλικράτεια, Κασσάνδρα, Σιθωνία." },
        { question: "Περιλαμβάνεται ασφάλιση στην τιμή ενοικίασης;", answer: "Η βασική ασφάλιση αστικής ευθύνης (TPL) περιλαμβάνεται χωρίς επιπλέον κόστος. Μπορείτε επίσης να προσθέσετε πλήρη κάλυψη CDW." },
        { question: "Χρειάζομαι πιστωτική κάρτα για ενοικίαση;", answer: "Όχι, δεν απαιτείται πιστωτική κάρτα. Δεχόμαστε πληρωμή με μετρητά και προσφέρουμε ενοικίαση χωρίς εγγύηση σε επιλεγμένα οχήματα." },
        { question: "Τι έγγραφα χρειάζομαι;", answer: "Χρειάζεστε έγκυρη άδεια οδήγησης με τουλάχιστον 1 έτος εμπειρίας και διαβατήριο ή ταυτότητα. Γίνονται δεκτές διεθνείς άδειες." },
        { question: "Μπορώ να επιστρέψω το αυτοκίνητο σε άλλη τοποθεσία;", answer: "Ναι, είναι διαθέσιμη η ενοικίαση μόνης κατεύθυνσης. Μπορείτε να παραλάβετε σε μία τοποθεσία και να επιστρέψετε σε άλλη." },
      ],
      breadcrumbHome: "Αρχική",
      breadcrumbCars: "Αυτοκίνητα",
      breadcrumbCarRentalLocation: "Ενοικίαση αυτοκινήτου στη {locationName}",
      pickupTitle: "Σημεία παραλαβής",
      pillarLinksTitle: "Ενοικίαση ανά τοποθεσία",
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
      locationHeroCtaLabel: "Βρείτε το αυτοκίνητό σας",
      pickupGuidanceTitle: "Οδηγίες παραλαβής",
      nearbyPlacesTitle: "Κοντινά σημεία",
      usefulTipsTitle: "Χρήσιμες συμβουλές",
      distanceToThessalonikiTitle: "Απόσταση από τη Θεσσαλονίκη",
      localFaqTitle: "Συχνές ερωτήσεις",
      navLocationsDropdownDescription:
        "Παραλαβή και επιστροφή στη Θεσσαλονίκη, αεροδρόμιο και Χαλκιδική. Επιλέξτε περιοχή για λεπτομέρειες και αναζήτηση αυτοκινήτου.",
      otherCarsTitle: "Άλλα αυτοκίνητα που μπορεί να σας αρέσουν",
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
  bg: {
    hub: {
      h1: "Коли под наем в Халкидики и Солун",
      seoTitle: "Коли под наем в Халкидики, Солун и летището | Natali Cars",
      seoDescription:
        "Резервирайте кола под наем в Халкидики, град Солун и летище Солун с удобни места за получаване, прозрачни цени и директна поддръжка.",
      introText:
        "Natali Cars предлага коли под наем в основните райони на Халкидики и Солун чрез една система за резервации и локализирани SEO страници.",
    },
    car: {
      seoTitleTemplate: "Наем на {carModel} в Халкидики | Natali Cars",
      seoDescriptionTemplate:
        "Резервирайте {carModel} в Халкидики с получаване на летище Солун (SKG) или {locationName}. {transmission}, климатик, икономичен разход.",
      carH1Template: "Наем на {carModel} в {locationName}",
      introTemplate:
        "{carModel} е на разположение за наем в {locationName} с гъвкави опции за получаване и връщане. Скоростна кутия {transmission}, гориво {fuelType}, {seats} места — отличен избор за Халкидики.",
      introLongTemplate:
        "{carModel} е един от най-удобните автомобили за наем в {locationName}. Компактен и икономичен, идеален за плажове, села и сценични пътища. С {transmission} и климатик {carModel} предлага комфортно шофиране в Солун и по полуостров Халкидики. Natali Cars предлага получаване на летище Солун (SKG) и в Неа Каликратия. Всички наеми включват застраховка и безплатна отмяна.",
      specsTitle: "Спецификации на автомобила",
      quickSpecsTitle: "Накратко",
      featuresTitle: "Характеристики на {carModel}",
      whyRentTitle: "Защо да изберете {carModel} за пътуване в {locationName}",
      whyRentBullets: [
        "Лесно паркиране — компактен размер за тесни улици",
        "Икономичен разход на гориво",
        "Идеален за двойки или малки семейства",
        "Надежден и комфортен в града и на крайбрежието",
      ],
      faqTitle: "Често задавани въпроси",
      faq: [
        { question: "Мога ли да взема този автомобил от летище Солун?", answer: "Да, предлагаме получаване и връщане на летище Солун (SKG), както и в Халкидики: Неа Каликратия, Касандра, Ситония." },
        { question: "Включена ли е застраховка в цената за наем?", answer: "Базовата застраховка ГО (TPL) е включена безплатно. Можете да добавите и пълна CDW застраховка за допълнително спокойствие." },
        { question: "Нужна ли ми е кредитна карта за наем?", answer: "Не, кредитна карта не е необходима. Приемаме плащане в брой и предлагаме наем без депозит за избрани автомобили." },
        { question: "Какви документи са необходими?", answer: "Необходима ви е валидна шофьорска книжка с минимум 1 година стаж и паспорт или лична карта. Приемат се международни шофьорски книжки." },
        { question: "Мога ли да върна колата на друго място?", answer: "Да, еднопосочен наем е възможен. Можете да вземете автомобила от едно място и да го върнете на друго в нашата мрежа." },
      ],
      breadcrumbHome: "Начало",
      breadcrumbCars: "Автомобили",
      breadcrumbCarRentalLocation: "Наем на кола в {locationName}",
      pickupTitle: "Места за получаване",
      pillarLinksTitle: "Наем на кола по локация",
    },
    links: {
      hubToLocationsTitle: "Разгледайте локациите за коли под наем",
      locationToCarsTitle: "Налични автомобили за тази локация",
      locationToHubLabel: "Обратно към основния hub",
      locationToParentLabel: "Обратно към родителската локация",
      locationToChildrenTitle: "Подлокации",
      locationToSiblingTitle: "Алтернативни близки локации",
      carsToLocationsTitle: "Популярни места за получаване",
      carsToHubLabel: "Обратно към основния hub",
      carsListTitle: "Разгледайте моделите автомобили",
      mainHubLabel: "Основен hub за коли под наем",
      locationSearchCtaLabel: "Търсене на автомобили в {locationName}",
      locationHeroCtaLabel: "Намерете своя автомобил",
      pickupGuidanceTitle: "Информация за получаване",
      nearbyPlacesTitle: "Близки места",
      usefulTipsTitle: "Полезни съвети",
      distanceToThessalonikiTitle: "Разстояние до Солун",
      localFaqTitle: "Често задавани въпроси",
      navLocationsDropdownDescription:
        "Получаване и връщане в Солун, летището и на полуостров Халкидики. Изберете район за подробности и търсене на автомобил.",
      otherCarsTitle: "Други автомобили, които може да ви харесат",
    },
    staticPages: {
      [STATIC_PAGE_KEYS.CONTACTS]: {
        seoTitle: "Контакти Natali Cars | Поддръжка за коли под наем",
        seoDescription:
          "Свържете се с Natali Cars за въпроси относно резервации, получаване на автомобил и поддръжка за коли под наем в Халкидики и Солун.",
      },
      [STATIC_PAGE_KEYS.PRIVACY_POLICY]: {
        seoTitle: "Политика за поверителност | Natali Cars",
        seoDescription:
          "Вижте как Natali Cars обработва и защитава личните данни при резервации и комуникация с клиенти.",
      },
      [STATIC_PAGE_KEYS.TERMS_OF_SERVICE]: {
        seoTitle: "Условия за ползване | Natali Cars",
        seoDescription:
          "Прегледайте условията за ползване на Natali Cars, задълженията при резервация и отговорностите по договора за наем.",
      },
      [STATIC_PAGE_KEYS.COOKIE_POLICY]: {
        seoTitle: "Политика за бисквитки | Natali Cars",
        seoDescription:
          "Научете какви бисквитки използва Natali Cars и как те подпомагат резервациите, анализа и работата на сайта.",
      },
      [STATIC_PAGE_KEYS.RENTAL_TERMS]: {
        seoTitle: "Условия за наем | Natali Cars",
        seoDescription:
          "Прегледайте условията за наем на Natali Cars, застрахователното покритие и правилата за предаване на автомобила преди резервация.",
      },
    },
  },
};

const locationHeroCtaLabelOverrides: Partial<Record<SupportedLocale, string>> = {
  de: "Finden Sie Ihr Auto",
  ro: "Găsiți mașina dvs.",
  sr: "Pronađite svoj automobil",
};

const localFaqTitleOverrides: Partial<Record<SupportedLocale, string>> = {
  de: "Lokale FAQ",
  ro: "Intrebari locale frecvente",
  sr: "Lokalna FAQ",
};

const localeSeoDictionaryExpanded = expandLocaleRecord(localeSeoDictionaryRaw);

// Patch fallback-only locales with translated hero CTA labels.
// expandLocaleRecord shares the same object reference for fallback locales,
// so we must clone the links object before mutating to avoid corrupting "en".
for (const locale of SUPPORTED_LOCALES) {
  const label = locationHeroCtaLabelOverrides[locale];
  const localFaqTitle = localFaqTitleOverrides[locale];
  if (label || localFaqTitle) {
    localeSeoDictionaryExpanded[locale] = {
      ...localeSeoDictionaryExpanded[locale],
      links: {
        ...localeSeoDictionaryExpanded[locale].links,
        ...(label ? { locationHeroCtaLabel: label } : {}),
        ...(localFaqTitle ? { localFaqTitle } : {}),
      },
    };
  }
}

export const localeSeoDictionary = localeSeoDictionaryExpanded;

type LocationContentFallbackTemplate = {
  h1: string;
  seoTitle: string;
  seoDescription: string;
  introText: string;
  pickupLocation: string;
  offerName: string;
  offerDescription: string;
  pickupGuidance: string;
};

type LocationFaqFallbackTemplate = LocationSeoFaqItem[];

const locationContentFallbackTemplates: Partial<
  Record<SupportedLocale, LocationContentFallbackTemplate>
> = {
  ru: {
    h1: "\u041F\u0440\u043E\u043A\u0430\u0442 \u0430\u0432\u0442\u043E \u0432 {locationName}",
    seoTitle:
      "\u041F\u0440\u043E\u043A\u0430\u0442 \u0430\u0432\u0442\u043E \u0432 {locationName} | Natali Cars",
    seoDescription:
      "\u0410\u0440\u0435\u043D\u0434\u0443\u0439\u0442\u0435 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u0432 {locationName} \u0441 \u0443\u0434\u043E\u0431\u043D\u043E\u0439 \u0432\u044B\u0434\u0430\u0447\u0435\u0439 \u0438 \u043F\u0440\u044F\u043C\u043E\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u043E\u0439 Natali Cars.",
    introText:
      "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 {locationName} \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u043A\u0430\u0442 \u0430\u0432\u0442\u043E \u0441 \u0432\u044B\u0434\u0430\u0447\u0435\u0439 \u0443 \u043C\u0435\u0441\u0442\u0430 \u043F\u0440\u043E\u0436\u0438\u0432\u0430\u043D\u0438\u044F \u0438\u043B\u0438 \u0432 \u0433\u043E\u0440\u043E\u0434\u0435.",
    pickupLocation:
      "\u0422\u043E\u0447\u043A\u0430 \u0432\u044B\u0434\u0430\u0447\u0438 \u0432 {locationName}",
    offerName:
      "\u0410\u0440\u0435\u043D\u0434\u0430 \u0430\u0432\u0442\u043E \u0432 {locationName}",
    offerDescription:
      "\u0412\u044B\u0434\u0430\u0447\u0430 \u0443 \u043E\u0442\u0435\u043B\u044F \u0438\u043B\u0438 \u0432 \u0433\u043E\u0440\u043E\u0434\u0435 \u0434\u043B\u044F \u043F\u043E\u0435\u0437\u0434\u043E\u043A \u043F\u043E {locationName} \u0438 \u043E\u043A\u0440\u0435\u0441\u0442\u043D\u043E\u0441\u0442\u044F\u043C.",
    pickupGuidance:
      "\u041F\u0435\u0440\u0435\u0434\u0430\u0447\u0443 \u0430\u0432\u0442\u043E \u0432 {locationName} \u043C\u043E\u0436\u043D\u043E \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043E\u0432\u0430\u0442\u044C \u0443 \u043C\u0435\u0441\u0442\u0430 \u043F\u0440\u043E\u0436\u0438\u0432\u0430\u043D\u0438\u044F \u0438\u043B\u0438 \u0432 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435. \u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u043F\u0440\u0438 \u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438.",
  },
};

const locationFaqFallbackTemplates: Partial<
  Record<SupportedLocale, LocationFaqFallbackTemplate>
> = {
  ru: [
    {
      question:
        "\u041C\u043E\u0436\u043D\u043E \u043B\u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0430\u0432\u0442\u043E \u0432 {locationName} \u0440\u044F\u0434\u043E\u043C \u0441 \u043E\u0442\u0435\u043B\u0435\u043C?",
      answer:
        "\u0414\u0430. \u041C\u044B \u043C\u043E\u0436\u0435\u043C \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043E\u0432\u0430\u0442\u044C \u0432\u044B\u0434\u0430\u0447\u0443 \u0443 \u043E\u0442\u0435\u043B\u044F, \u0430\u043F\u0430\u0440\u0442\u0430\u043C\u0435\u043D\u0442\u043E\u0432 \u0438\u043B\u0438 \u0432 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435.",
    },
    {
      question:
        "\u041F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u043B\u0438 \u0430\u0440\u0435\u043D\u0434\u0430 \u0430\u0432\u0442\u043E \u0432 {locationName} \u0434\u043B\u044F \u043F\u043E\u0435\u0437\u0434\u043E\u043A \u043F\u043E \u0440\u0435\u0433\u0438\u043E\u043D\u0443?",
      answer:
        "\u0414\u0430. \u0421 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u043C \u0443\u0434\u043E\u0431\u043D\u043E \u043F\u043E\u0441\u0435\u0449\u0430\u0442\u044C \u043F\u043B\u044F\u0436\u0438, \u0441\u043E\u0441\u0435\u0434\u043D\u0438\u0435 \u043A\u0443\u0440\u043E\u0440\u0442\u044B \u0438 \u0434\u043E\u0441\u0442\u043E\u043F\u0440\u0438\u043C\u0435\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438.",
    },
    {
      question:
        "\u041A\u0430\u043A \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u0442\u044C \u043C\u0435\u0441\u0442\u043E \u0438 \u0432\u0440\u0435\u043C\u044F \u0432\u044B\u0434\u0430\u0447\u0438 \u0432 {locationName}?",
      answer:
        "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u043F\u0440\u043E\u0436\u0438\u0432\u0430\u043D\u0438\u044F \u0438 \u0443\u0434\u043E\u0431\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043F\u0440\u0438 \u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438, \u0438 \u043C\u044B \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043C \u0442\u043E\u0447\u043A\u0443 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0438.",
    },
  ],
  uk: [
    {
      question:
        "\u0427\u0438 \u043C\u043E\u0436\u043D\u0430 \u043E\u0442\u0440\u0438\u043C\u0430\u0442\u0438 \u0430\u0432\u0442\u043E \u0432 {locationName} \u0431\u0456\u043B\u044F \u0433\u043E\u0442\u0435\u043B\u044E?",
      answer:
        "\u0422\u0430\u043A. \u041C\u0438 \u043C\u043E\u0436\u0435\u043C\u043E \u043E\u0440\u0433\u0430\u043D\u0456\u0437\u0443\u0432\u0430\u0442\u0438 \u0432\u0438\u0434\u0430\u0447\u0443 \u0431\u0456\u043B\u044F \u0433\u043E\u0442\u0435\u043B\u044E, \u0430\u043F\u0430\u0440\u0442\u0430\u043C\u0435\u043D\u0442\u0456\u0432 \u0430\u0431\u043E \u0432 \u0443\u0437\u0433\u043E\u0434\u0436\u0435\u043D\u0456\u0439 \u0442\u043E\u0447\u0446\u0456.",
    },
    {
      question:
        "\u0427\u0438 \u0437\u0440\u0443\u0447\u043D\u0430 \u043E\u0440\u0435\u043D\u0434\u0430 \u0430\u0432\u0442\u043E \u0432 {locationName} \u0434\u043B\u044F \u043F\u043E\u0457\u0437\u0434\u043E\u043A \u043E\u043A\u043E\u043B\u0438\u0446\u044F\u043C\u0438?",
      answer:
        "\u0422\u0430\u043A. \u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0456\u043B\u0435\u043C \u0437\u0440\u0443\u0447\u043D\u043E \u0432\u0456\u0434\u0432\u0456\u0434\u0430\u0442\u0438 \u043F\u043B\u044F\u0436\u0456, \u0441\u0443\u0441\u0456\u0434\u043D\u0456 \u043A\u0443\u0440\u043E\u0440\u0442\u0438 \u0442\u0430 \u0446\u0456\u043A\u0430\u0432\u0456 \u043C\u0456\u0441\u0446\u044F.",
    },
    {
      question:
        "\u042F\u043A \u0443\u0437\u0433\u043E\u0434\u0438\u0442\u0438 \u043C\u0456\u0441\u0446\u0435 \u0442\u0430 \u0447\u0430\u0441 \u0432\u0438\u0434\u0430\u0447\u0456 \u0432 {locationName}?",
      answer:
        "\u0412\u043A\u0430\u0436\u0456\u0442\u044C \u0430\u0434\u0440\u0435\u0441\u0443 \u043F\u0440\u043E\u0436\u0438\u0432\u0430\u043D\u043D\u044F \u0442\u0430 \u0437\u0440\u0443\u0447\u043D\u0438\u0439 \u0447\u0430\u0441 \u043F\u0456\u0434 \u0447\u0430\u0441 \u0431\u0440\u043E\u043D\u044E\u0432\u0430\u043D\u043D\u044F, \u0456 \u043C\u0438 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043C\u043E \u0442\u043E\u0447\u043A\u0443 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0456.",
    },
  ],
  el: [
    {
      question:
        "\u039C\u03C0\u03BF\u03C1\u03CE \u03BD\u03B1 \u03C0\u03B1\u03C1\u03B1\u03BB\u03AC\u03B2\u03C9 \u03B1\u03C5\u03C4\u03BF\u03BA\u03AF\u03BD\u03B7\u03C4\u03BF \u03C3\u03C4\u03BF {locationName} \u03BA\u03BF\u03BD\u03C4\u03AC \u03C3\u03C4\u03BF \u03BE\u03B5\u03BD\u03BF\u03B4\u03BF\u03C7\u03B5\u03AF\u03BF \u03BC\u03BF\u03C5;",
      answer:
        "\u039D\u03B1\u03B9. \u039C\u03C0\u03BF\u03C1\u03BF\u03CD\u03BC\u03B5 \u03BD\u03B1 \u03BF\u03C1\u03B3\u03B1\u03BD\u03CE\u03C3\u03BF\u03C5\u03BC\u03B5 \u03C0\u03B1\u03C1\u03AC\u03B4\u03BF\u03C3\u03B7 \u03C3\u03B5 \u03BE\u03B5\u03BD\u03BF\u03B4\u03BF\u03C7\u03B5\u03AF\u03BF, \u03B4\u03B9\u03B1\u03BC\u03AD\u03C1\u03B9\u03C3\u03BC\u03B1 \u03AE \u03C3\u03B5 \u03C3\u03C5\u03BC\u03C6\u03C9\u03BD\u03B7\u03BC\u03AD\u03BD\u03BF \u03C3\u03B7\u03BC\u03B5\u03AF\u03BF.",
    },
    {
      question:
        "\u0395\u03AF\u03BD\u03B1\u03B9 \u03C7\u03C1\u03AE\u03C3\u03B9\u03BC\u03B7 \u03B7 \u03B5\u03BD\u03BF\u03B9\u03BA\u03AF\u03B1\u03C3\u03B7 \u03B1\u03C5\u03C4\u03BF\u03BA\u03B9\u03BD\u03AE\u03C4\u03BF\u03C5 \u03C3\u03C4\u03BF {locationName} \u03B3\u03B9\u03B1 \u03B4\u03B9\u03B1\u03B4\u03C1\u03BF\u03BC\u03AD\u03C2 \u03C3\u03C4\u03B7\u03BD \u03C0\u03B5\u03C1\u03B9\u03BF\u03C7\u03AE;",
      answer:
        "\u039D\u03B1\u03B9. \u039C\u03B5 \u03B1\u03C5\u03C4\u03BF\u03BA\u03AF\u03BD\u03B7\u03C4\u03BF \u03BC\u03B5\u03C4\u03B1\u03BA\u03B9\u03BD\u03B5\u03AF\u03C3\u03C4\u03B5 \u03B5\u03CD\u03BA\u03BF\u03BB\u03B1 \u03C3\u03B5 \u03C0\u03B1\u03C1\u03B1\u03BB\u03AF\u03B5\u03C2, \u03B3\u03B5\u03B9\u03C4\u03BF\u03BD\u03B9\u03BA\u03AC \u03B8\u03AD\u03C1\u03B5\u03C4\u03C1\u03B1 \u03BA\u03B1\u03B9 \u03B1\u03BE\u03B9\u03BF\u03B8\u03AD\u03B1\u03C4\u03B1.",
    },
    {
      question:
        "\u03A0\u03CE\u03C2 \u03BA\u03B1\u03BD\u03BF\u03BD\u03AF\u03B6\u03C9 \u03C4\u03BF \u03C3\u03B7\u03BC\u03B5\u03AF\u03BF \u03BA\u03B1\u03B9 \u03C4\u03B7\u03BD \u03CE\u03C1\u03B1 \u03C0\u03B1\u03C1\u03B1\u03BB\u03B1\u03B2\u03AE\u03C2 \u03C3\u03C4\u03BF {locationName};",
      answer:
        "\u0394\u03CE\u03C3\u03C4\u03B5 \u03C3\u03C4\u03B7\u03BD \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03B7 \u03C4\u03B7 \u03B4\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03AE \u03C3\u03B1\u03C2 \u03BA\u03B1\u03B9 \u03C4\u03B7\u03BD \u03B5\u03C0\u03B9\u03B8\u03C5\u03BC\u03B7\u03C4\u03AE \u03CE\u03C1\u03B1 \u03BA\u03B1\u03B9 \u03B8\u03B1 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03CE\u03C3\u03BF\u03C5\u03BC\u03B5 \u03C4\u03BF \u03C3\u03B7\u03BC\u03B5\u03AF\u03BF \u03C0\u03B1\u03C1\u03AC\u03B4\u03BF\u03C3\u03B7\u03C2.",
    },
  ],
  de: [
    {
      question:
        "Kann ich das Auto in {locationName} in der Naehe meines Hotels uebernehmen?",
      answer:
        "Ja. Wir koennen die Uebergabe am Hotel, Apartment oder an einem vereinbarten Treffpunkt organisieren.",
    },
    {
      question:
        "Ist ein Mietwagen in {locationName} praktisch fuer Ausfluege in die Umgebung?",
      answer:
        "Ja. Mit dem Auto erreichen Sie Straende, benachbarte Orte und Sehenswuerdigkeiten flexibel.",
    },
    {
      question: "Wie vereinbare ich Abholort und Uhrzeit in {locationName}?",
      answer:
        "Geben Sie bei der Buchung Ihre Adresse und Wunschzeit an, wir bestaetigen den Treffpunkt.",
    },
  ],
  bg: [
    {
      question:
        "\u041C\u043E\u0433\u0430 \u043B\u0438 \u0434\u0430 \u0432\u0437\u0435\u043C\u0430 \u043A\u043E\u043B\u0430 \u0432 {locationName} \u0431\u043B\u0438\u0437\u043E \u0434\u043E \u0445\u043E\u0442\u0435\u043B\u0430 \u043C\u0438?",
      answer:
        "\u0414\u0430. \u041C\u043E\u0436\u0435\u043C \u0434\u0430 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0438\u0440\u0430\u043C\u0435 \u043F\u0440\u0435\u0434\u0430\u0432\u0430\u043D\u0435 \u043F\u0440\u0438 \u0445\u043E\u0442\u0435\u043B, \u0430\u043F\u0430\u0440\u0442\u0430\u043C\u0435\u043D\u0442 \u0438\u043B\u0438 \u043D\u0430 \u0443\u0433\u043E\u0432\u043E\u0440\u0435\u043D\u0430 \u0442\u043E\u0447\u043A\u0430.",
    },
    {
      question:
        "\u041F\u043E\u0434\u0445\u043E\u0434\u044F\u0449 \u043B\u0438 \u0435 \u043D\u0430\u0435\u043C\u044A\u0442 \u043D\u0430 \u043A\u043E\u043B\u0430 \u0432 {locationName} \u0437\u0430 \u0440\u0430\u0437\u0445\u043E\u0434\u043A\u0438 \u0432 \u0440\u0430\u0439\u043E\u043D\u0430?",
      answer:
        "\u0414\u0430. \u0421 \u043A\u043E\u043B\u0430 \u043B\u0435\u0441\u043D\u043E \u0441\u0442\u0438\u0433\u0430\u0442\u0435 \u0434\u043E \u043F\u043B\u0430\u0436\u043E\u0432\u0435, \u0441\u044A\u0441\u0435\u0434\u043D\u0438 \u043A\u0443\u0440\u043E\u0440\u0442\u0438 \u0438 \u0437\u0430\u0431\u0435\u043B\u0435\u0436\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442\u0438.",
    },
    {
      question:
        "\u041A\u0430\u043A \u0434\u0430 \u0443\u0442\u043E\u0447\u043D\u044F \u043C\u044F\u0441\u0442\u043E\u0442\u043E \u0438 \u0447\u0430\u0441\u0430 \u0437\u0430 \u043F\u0440\u0435\u0434\u0430\u0432\u0430\u043D\u0435 \u0432 {locationName}?",
      answer:
        "\u041F\u043E\u0441\u043E\u0447\u0435\u0442\u0435 \u0430\u0434\u0440\u0435\u0441\u0430 \u0438 \u0443\u0434\u043E\u0431\u043D\u0438\u044F \u0447\u0430\u0441 \u043F\u0440\u0438 \u0440\u0435\u0437\u0435\u0440\u0432\u0430\u0446\u0438\u044F, \u0430 \u043D\u0438\u0435 \u0449\u0435 \u043F\u043E\u0442\u0432\u044A\u0440\u0434\u0438\u043C \u0442\u043E\u0447\u043A\u0430\u0442\u0430 \u0437\u0430 \u043F\u0440\u0435\u0434\u0430\u0432\u0430\u043D\u0435.",
    },
  ],
  ro: [
    {
      question: "Pot prelua masina in {locationName} aproape de hotel?",
      answer:
        "Da. Putem organiza predarea la hotel, apartament sau intr-un punct stabilit impreuna.",
    },
    {
      question:
        "Este utila inchirierea unei masini in {locationName} pentru excursii in zona?",
      answer:
        "Da. Cu masina ajungeti usor la plaje, localitati vecine si obiective turistice.",
    },
    {
      question: "Cum stabilesc locul si ora preluarii in {locationName}?",
      answer:
        "Indicati adresa si ora dorita la rezervare, iar noi confirmam punctul de predare.",
    },
  ],
  sr: [
    {
      question: "Da li mogu preuzeti auto u {locationName} blizu hotela?",
      answer:
        "Da. Mozemo organizovati preuzimanje kod hotela, apartmana ili na dogovorenom mestu.",
    },
    {
      question: "Da li je rent a car u {locationName} dobar za izlete po okolini?",
      answer:
        "Da. Automobilom lako obilazite plaze, susedna mesta i znamenitosti.",
    },
    {
      question: "Kako da dogovorim mesto i vreme preuzimanja u {locationName}?",
      answer:
        "Unesite adresu i zeljeno vreme pri rezervaciji, a mi cemo potvrditi tacku preuzimanja.",
    },
  ],
};

function fillLocationNameTemplate(template: string, locationName: string): string {
  return template.replaceAll("{locationName}", locationName);
}

function buildLocalizedFallbackFaq(
  locale: SupportedLocale,
  baseFaq: LocationSeoFaqItem[] | undefined,
  locationName: string
): LocationSeoFaqItem[] | undefined {
  if (!baseFaq || baseFaq.length === 0) {
    return baseFaq;
  }

  const faqTemplate = locationFaqFallbackTemplates[locale];
  if (!faqTemplate || faqTemplate.length === 0) {
    return baseFaq;
  }

  return faqTemplate.map((item) => ({
    question: fillLocationNameTemplate(item.question, locationName),
    answer: fillLocationNameTemplate(item.answer, locationName),
  }));
}

function buildLocalizedFallbackLocationContent(
  locale: SupportedLocale,
  baseContent: LocationSeoContent
): LocationSeoContent {
  const template = locationContentFallbackTemplates[locale];
  const locationName = baseContent.shortName;
  const localizedFaq = buildLocalizedFallbackFaq(locale, baseContent.faq, locationName);

  if (!template) {
    return {
      ...baseContent,
      faq: localizedFaq,
    };
  }

  return {
    ...baseContent,
    h1: fillLocationNameTemplate(template.h1, locationName),
    seoTitle: fillLocationNameTemplate(template.seoTitle, locationName),
    seoDescription: fillLocationNameTemplate(template.seoDescription, locationName),
    introText: fillLocationNameTemplate(template.introText, locationName),
    pickupLocation: fillLocationNameTemplate(template.pickupLocation, locationName),
    offerName: fillLocationNameTemplate(template.offerName, locationName),
    offerDescription: fillLocationNameTemplate(template.offerDescription, locationName),
    pickupGuidance: baseContent.pickupGuidance
      ? fillLocationNameTemplate(template.pickupGuidance, locationName)
      : baseContent.pickupGuidance,
    faq: localizedFaq,
  };
}

function expandLocationContentRecord(
  partial: PartialLocaleRecord<LocationSeoContent>
): Record<SupportedLocale, LocationSeoContent> {
  const fallbackContent = partial[DEFAULT_LOCALE];
  if (!fallbackContent) {
    throw new Error("[locationSeoRepo] Missing default locale location content");
  }

  const expanded = expandLocaleRecord(partial);

  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (partial[locale]) continue;
    expanded[locale] = buildLocalizedFallbackLocationContent(locale, fallbackContent);
  }

  return expanded;
}

/**
 * Location page content — single source of truth for all location SEO pages.
 *
 * Edit content here. Each location has per-locale content with:
 * - introText: main intro (first para = hero, rest = main info if no mainInfoText)
 * - mainInfoText (optional): extra location details block
 * - distanceToThessalonikiText (optional): "Distance to Thessaloniki" paragraph
 * - pickupGuidance (optional): pickup instructions
 * - nearbyPlaces (optional): string[] of nearby spots
 * - usefulTips (optional): string[] of travel/rental tips
 * - faq (optional): { question, answer }[] — hide block if empty
 */
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
      distanceToThessalonikiText:
        "Thessaloniki is the second-largest city in Greece and the main hub for Northern Greece.",
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
      h1: "Car Rental at Thessaloniki Airport (SKG)",
      seoTitle: "Car Rental at Thessaloniki Airport (SKG) | Natali Cars",
      seoDescription:
        "Book airport car rental at Thessaloniki (SKG) with handover-ready pickup, direct customer support, and coastal transfer coverage.",
      introText:
        "The Thessaloniki Airport (SKG) page is intended for travelers arriving in Northern Greece who want to continue their journey directly from the airport. Thessaloniki Airport is the main gateway to Halkidiki, and from here it's an easy drive toward the region's beaches, seaside villages, and resorts. Starting your trip from SKG makes it simple to reach destinations across Sithonia, Kassandra, and the wider Halkidiki area.",
      areaServed: ["SKG Airport", "Perea", "Nea Kallikratia"],
      pickupLocation: "Thessaloniki Airport Pickup Point",
      offerName: "Airport Pickup Rental Offer",
      offerDescription:
        "Fast airport handover with route-ready setup for resorts and villas in Halkidiki.",
      distanceToThessalonikiText:
        "Thessaloniki Airport (SKG) is the main international airport serving Thessaloniki and the wider region.",
    },
    ru: {
      shortName: "Аэропорт Салоники",
      h1: "Прокат авто в аэропорту Салоники (SKG)",
      seoTitle: "Прокат авто в аэропорту Салоники (SKG) | Natali Cars",
      seoDescription:
        "Арендуйте авто в аэропорту Салоники (SKG) с быстрой выдачей, прямой поддержкой и удобным выездом в Халкидики.",
      introText:
        "Страница аэропорта Салоники (SKG) предназначена для путешественников, прибывающих на север Греции и планирующих продолжить поездку прямо из аэропорта. Аэропорт Салоники является главными воротами на Халкидики, и отсюда удобно отправиться к пляжам, курортам и прибрежным деревням региона. Начав путешествие из SKG, легко добраться до направлений по всей Ситонии, Кассандре и другим частям Халкидики.",
      areaServed: ["Аэропорт SKG", "Перея", "Неа Каликратия"],
      pickupLocation: "Точка выдачи в аэропорту Салоники",
      offerName: "Предложение проката с выдачей в аэропорту",
      offerDescription:
        "Быстрая выдача после прилета и готовый маршрут к курортам Халкидик.",
    },
    uk: {
      shortName: "Аеропорт Салоніки",
      h1: "Оренда авто в аеропорту Салоніки (SKG)",
      seoTitle: "Оренда авто в аеропорту Салоніки (SKG) | Natali Cars",
      seoDescription:
        "Орендуйте авто в аеропорту Салоніки (SKG) з швидкою передачею, прямою підтримкою та зручним виїздом до Халкідік.",
      introText:
        "Сторінка аеропорту Салоніки (SKG) призначена для мандрівників, які прилітають на північ Греції та планують продовжити подорож безпосередньо з аеропорту. Аеропорт Салоніки є головними воротами до Халкідікі, звідки легко дістатися до пляжів, курортів і прибережних містечок регіону. Почавши подорож зі SKG, зручно доїхати до напрямків на Ситонії, Кассандрі та інших частинах Халкідікі.",
      areaServed: ["Аеропорт SKG", "Перея", "Неа Каллікратія"],
      pickupLocation: "Точка отримання в аеропорту Салоніки",
      offerName: "Пропозиція оренди з отриманням в аеропорту",
      offerDescription:
        "Швидка передача авто після прильоту та готовий маршрут до курортів Халкідік.",
    },
    el: {
      shortName: "Αεροδρόμιο Θεσσαλονίκης",
      h1: "Ενοικίαση αυτοκινήτου στο αεροδρόμιο Θεσσαλονίκης (SKG)",
      seoTitle: "Ενοικίαση αυτοκινήτου στο αεροδρόμιο Θεσσαλονίκης (SKG) | Natali Cars",
      seoDescription:
        "Κλείστε αυτοκίνητο στο αεροδρόμιο Θεσσαλονίκης (SKG) με γρήγορη παράδοση, άμεση υποστήριξη και εύκολη μετάβαση στη Χαλκιδική.",
      introText:
        "Η σελίδα του αεροδρομίου Θεσσαλονίκης (SKG) απευθύνεται σε ταξιδιώτες που φτάνουν στη Βόρεια Ελλάδα και θέλουν να συνεχίσουν το ταξίδι τους απευθείας από το αεροδρόμιο. Το αεροδρόμιο Θεσσαλονίκης αποτελεί την κύρια πύλη προς τη Χαλκιδική και από εδώ η διαδρομή προς τις παραλίες, τα θέρετρα και τα παραθαλάσσια χωριά της περιοχής είναι εύκολη. Ξεκινώντας από το SKG μπορείτε να φτάσετε γρήγορα σε προορισμούς σε όλη τη Σιθωνία, την Κασσάνδρα και την ευρύτερη Χαλκιδική.",
      areaServed: ["Αεροδρόμιο SKG", "Περαία", "Νέα Καλλικράτεια"],
      pickupLocation: "Σημείο παραλαβής στο αεροδρόμιο Θεσσαλονίκης",
      offerName: "Προσφορά ενοικίασης με παραλαβή στο αεροδρόμιο",
      offerDescription:
        "Άμεση παραλαβή μετά την άφιξη και έτοιμη διαδρομή προς θέρετρα Χαλκιδικής.",
    },
    de: {
      shortName: "Flughafen Thessaloniki",
      h1: "Mietwagen am Flughafen Thessaloniki (SKG)",
      seoTitle: "Mietwagen am Flughafen Thessaloniki (SKG) | Natali Cars",
      seoDescription:
        "Buchen Sie einen Mietwagen am Flughafen Thessaloniki (SKG) mit Abholung, direktem Kundenservice und Transfer an die Küste.",
      introText:
        "Die Seite zum Flughafen Thessaloniki (SKG) richtet sich an Reisende, die in Nordgriechenland ankommen und ihre Reise direkt vom Flughafen aus fortsetzen möchten. Der Flughafen Thessaloniki ist das wichtigste Tor nach Chalkidiki, und von hier aus erreicht man schnell die Strände, Küstenorte und Resorts der Region. Wenn Sie Ihre Reise vom SKG aus beginnen, gelangen Sie bequem zu Zielen in Sithonia, Kassandra und anderen Teilen von Chalkidiki.",
      areaServed: ["Flughafen SKG", "Perea", "Nea Kallikratia"],
      pickupLocation: "Abholpunkt Flughafen Thessaloniki",
      offerName: "Angebot Mietwagen Flughafen",
      offerDescription:
        "Schnelle Übergabe am Flughafen und direkte Fahrt zu den Resorts in Chalkidiki.",
    },
    bg: {
      shortName: "Летище Солун",
      h1: "Под наем на кола на летище Солун (SKG)",
      seoTitle: "Под наем на кола на летище Солун (SKG) | Natali Cars",
      seoDescription:
        "Наем на кола на летище Солун (SKG) с бърза получаване, пряка поддръжка и удобен трансфер до Халкидики.",
      introText:
        "Страницата за летище Солун (SKG) е предназначена за пътници, които пристигат в Северна Гърция и искат да продължат пътуването си директно от летището. Летище Солун е основната врата към Халкидики и оттук лесно се стига до плажовете, курортите и крайбрежните селища на региона. Започвайки пътуването си от SKG, можете бързо да достигнете до дестинации в Ситония, Касандра и останалите части на Халкидики.",
      areaServed: ["Летище SKG", "Перея", "Неа Каликратия"],
      pickupLocation: "Място за получаване летище Солун",
      offerName: "Оферта наем на кола летище",
      offerDescription:
        "Бързо получаване след пристигане и маршрут до курорти в Халкидики.",
    },
    ro: {
      shortName: "Aeroport Salonic",
      h1: "Închirieri auto la aeroportul Salonic (SKG)",
      seoTitle: "Închirieri auto la aeroportul Salonic (SKG) | Natali Cars",
      seoDescription:
        "Închiriați mașină la aeroportul Salonic (SKG) cu preluare rapidă, suport direct și transfer la coastă.",
      introText:
        "Pagina aeroportului Salonic (SKG) este destinată călătorilor care sosesc în nordul Greciei și doresc să își continue călătoria direct de la aeroport. Aeroportul Salonic este principala poartă către Halkidiki, iar de aici se ajunge ușor către plajele, stațiunile și satele de coastă ale regiunii. Începând călătoria din SKG, puteți ajunge rapid în destinații din Sithonia, Kassandra și din întreaga zonă Halkidiki.",
      areaServed: ["Aeroport SKG", "Perea", "Nea Kallikratia"],
      pickupLocation: "Punct de preluare aeroport Salonic",
      offerName: "Ofertă închirieri aeroport",
      offerDescription:
        "Preluare rapidă la aeroport și traseu gata pentru stațiunile din Halkidiki.",
    },
    sr: {
      shortName: "Аеродром Солун",
      h1: "Изнајмљивање аута на аеродрому Солун (SKG)",
      seoTitle: "Изнајмљивање аута на аеродрому Солун (SKG) | Natali Cars",
      seoDescription:
        "Изнајмите ауто на аеродрому Солун (SKG) са брзим преузимањем, директном подршком и трансфером до обале.",
      introText:
        "Stranica aerodroma Solun (SKG) namenjena je putnicima koji dolaze u severnu Grčku i žele da nastave putovanje direktno sa aerodroma. Aerodrom Solun predstavlja glavnu kapiju ka Halkidikiju, a odavde je lako stići do plaža, letovališta i primorskih mesta regiona. Ako putovanje započnete sa SKG, jednostavno možete doći do destinacija širom Sitonije, Kasandre i ostatka Halkidikija.",
      areaServed: ["Аеродром SKG", "Переја", "Неа Каликратија"],
      pickupLocation: "Место преузимања аеродром Солун",
      offerName: "Понуда изнајмљивања аеродром",
      offerDescription:
        "Брзо преузимање на аеродрому и маршрут до летовалишта у Халкидикију.",
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
      distanceToThessalonikiText:
        "Halkidiki is about 110 km from Thessaloniki and roughly 90 km from Thessaloniki Airport (SKG).",
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
      distanceToThessalonikiText:
        "Nea Kallikratia is located about 35 km from Thessaloniki and about 25 km from Thessaloniki Airport (SKG).",
      usefulTips: [
        "Book in advance during peak season (July–August) for best availability.",
        "We offer free delivery to hotels and apartments in Nea Kallikratia.",
        "Nea Kallikratia is a convenient stopover en route to Sithonia and Kassandra.",
      ],
      faq: [
        { question: "Can I get a car delivered to my hotel in Nea Kallikratia?", answer: "Yes. We coordinate pickup at or near your hotel or rental; confirm the address when booking." },
        { question: "Is Nea Kallikratia a good base for exploring Halkidiki?", answer: "Yes. It sits on the main route into the peninsula, so Sithonia and Kassandra are easily reachable by car." },
        { question: "What if I arrive from Thessaloniki Airport?", answer: "Book with pickup at the airport or arrange a later handover in Nea Kallikratia after you reach your accommodation." },
      ],
    },
    ru: {
      shortName: "Неа Калликратия",
      h1: "Прокат авто в Неа Калликратии",
      seoTitle: "Прокат авто в Неа Калликратии, Халкидики | Natali Cars",
      seoDescription:
        "Аренда авто в Неа Калликратии с удобной выдачей у пляжа и главной дороги. Идеально для отдыха на побережье и поездок по Халкидикам.",
      introText:
        "Неа Калликратия — популярный прибрежный город на пути в Халкидики. Эта страница поможет организовать прокат авто с выдачей у вашего жилья.",
      areaServed: ["Пляж Неа Калликратия", "Центр Неа Калликратии"],
      pickupLocation: "Точка выдачи в Неа Калликратии",
      offerName: "Прокат авто в Неа Калликратии",
      offerDescription: "Выдача у пляжа для Неа Калликратии и ближайших курортов.",
      pickupGuidance:
        "Выдачу в Неа Калликратии обычно организуют у вашего жилья или у договорной точки на прибрежной трассе. Уточните место при бронировании для удобной передачи авто.",
      nearbyPlaces: ["Салоники (город)", "Неа Муданья (порт)", "Полуостров Ситония"],
      faq: [
        { question: "Можно ли доставить авто к отелю в Неа Калликратии?", answer: "Да. Мы организуем выдачу у отеля или апартаментов; укажите адрес при бронировании." },
        { question: "Удобна ли Неа Калликратия как база для поездок по Халкидикам?", answer: "Да. Город на основной трассе в полуостров, до Ситонии и Кассандры легко доехать на авто." },
        { question: "Что если я прилетаю в аэропорт Салоник?", answer: "Забронируйте выдачу в аэропорту или договоритесь о передаче в Неа Калликратии после заселения." },
      ],
    },
    uk: {
      shortName: "Неа Каллікратія",
      h1: "Оренда авто в Неа Каллікратії",
      seoTitle: "Оренда авто в Неа Каллікратії, Халкідіки | Natali Cars",
      seoDescription:
        "Оренда авто в Неа Каллікратії з зручною видачею біля пляжу та головної дороги. Ідеально для відпочинку на узбережжі та поїздок по Халкідіках.",
      introText:
        "Неа Каллікратія — популярне прибережне місто на шляху в Халкідіки. Ця сторінка допоможе організувати оренду авто з видачею біля вашого помешкання.",
      areaServed: ["Пляж Неа Каллікратія", "Центр Неа Каллікратії"],
      pickupLocation: "Точка отримання в Неа Каллікратії",
      offerName: "Оренда авто в Неа Каллікратії",
      offerDescription: "Видача біля пляжу для Неа Каллікратії та найближчих курортів.",
      pickupGuidance:
        "Видачу в Неа Каллікратії зазвичай організовують біля помешкання або узгодженої точки на прибережній трасі. Уточніть місце при бронюванні для зручної передачі авто.",
      nearbyPlaces: ["Салоніки (місто)", "Неа Муданія (порт)", "Півострів Сітонія"],
      faq: [
        { question: "Чи можна доставити авто до готелю в Неа Каллікратії?", answer: "Так. Ми організуємо видачу біля готелю або апартаментів; вкажіть адресу при бронюванні." },
        { question: "Чи зручна Неа Каллікратія як база для поїздок по Халкідіках?", answer: "Так. Місто на основній трасі півострова, до Сітонії та Кассандри легко доїхати авто." },
        { question: "Що якщо я прилітаю в аеропорт Салонік?", answer: "Забронюйте видачу в аеропорту або домовте передачу в Неа Каллікратії після заселення." },
      ],
    },
    el: {
      shortName: "Νέα Καλλικράτεια",
      h1: "Ενοικίαση αυτοκινήτου στη Νέα Καλλικράτεια",
      seoTitle: "Ενοικίαση αυτοκινήτου στη Νέα Καλλικράτεια, Χαλκιδική | Natali Cars",
      seoDescription:
        "Ενοικιάστε αυτοκίνητο στη Νέα Καλλικράτεια με βολική παραλαβή κοντά στην παραλία και τον κεντρικό δρόμο. Ιδανικό για παραθαλάσσια διαμονή και εκδρομές στη Χαλκιδική.",
      introText:
        "Η Νέα Καλλικράτεια είναι δημοφιλής παραθαλάσσια πόλη στο δρόμο προς τη Χαλκιδική. Αυτή η σελίδα σας βοηθά να οργανώσετε ενοικίαση αυτοκινήτου με παραλαβή κατάλληλη για το κατάλυμά σας.",
      areaServed: ["Παραλία Νέας Καλλικράτειας", "Κέντρο Νέας Καλλικράτειας"],
      pickupLocation: "Σημείο παραλαβής Νέα Καλλικράτεια",
      offerName: "Ενοικίαση αυτοκινήτου Νέα Καλλικράτεια",
      offerDescription: "Παραλαβή κοντά στην παραλία για Νέα Καλλικράτεια και κοντινά θέρετρα.",
      pickupGuidance:
        "Η παραλαβή στη Νέα Καλλικράτεια συνήθως κανονίζεται κοντά στο κατάλυμά σας ή σε συμφωνημένο σημείο στον παραλιακό δρόμο. Επιβεβαιώστε το ακριβές σημείο κατά την κράτηση.",
      nearbyPlaces: ["Θεσσαλονίκη (πόλη)", "Νέα Μουδανιά (λιμάνι)", "Χερσόνησος Σιθωνία"],
      faq: [
        { question: "Μπορώ να παραλάβω αυτοκίνητο στο ξενοδοχείο μου στη Νέα Καλλικράτεια;", answer: "Ναι. Συντονίζουμε παραλαβή στο ξενοδοχείο ή τα διαμερίσματά σας· επιβεβαιώστε τη διεύθυνση κατά την κράτηση." },
        { question: "Είναι η Νέα Καλλικράτεια καλή βάση για εξερεύνηση της Χαλκιδικής;", answer: "Ναι. Βρίσκεται στον κύριο δρόμο της χερσονήσου· η Σιθωνία και η Κασσάνδρα είναι εύκολα προσβάσιμες με αυτοκίνητο." },
        { question: "Τι γίνεται αν φτάσω από το αεροδρόμιο Θεσσαλονίκης;", answer: "Κλείστε με παραλαβή στο αεροδρόμιο ή κανονίστε μεταγενέστερη παράδοση στη Νέα Καλλικράτεια μετά την άφιξή σας." },
      ],
    },
    de: {
      shortName: "Nea Kallikratia",
      h1: "Mietwagen in Nea Kallikratia",
      seoTitle: "Mietwagen in Nea Kallikratia, Chalkidiki | Natali Cars",
      seoDescription:
        "Mieten Sie ein Auto in Nea Kallikratia mit Abholung am Strand und an der Hauptstraße. Ideal für den Küstenurlaub und Ausflüge in die Chalkidiki.",
      introText:
        "Nea Kallikratia ist ein beliebter Küstenort auf dem Weg in die Chalkidiki. Diese Seite hilft Ihnen, einen Mietwagen mit Abholung passend zu Ihrer Unterkunft zu buchen.",
      areaServed: ["Strand Nea Kallikratia", "Zentrum Nea Kallikratia"],
      pickupLocation: "Abholpunkt Nea Kallikratia",
      offerName: "Mietwagen Nea Kallikratia",
      offerDescription: "Strandnahe Abholung für Nea Kallikratia und nahe gelegene Küstenorte.",
      pickupGuidance:
        "Die Abholung in Nea Kallikratia erfolgt in der Regel in der Nähe Ihrer Unterkunft oder an einem vereinbarten Punkt an der Küstenstraße. Bestätigen Sie den genauen Ort bei der Buchung.",
      nearbyPlaces: ["Thessaloniki (Stadt)", "Nea Moudania (Hafen)", "Halbinsel Sithonia"],
      faq: [
        { question: "Kann ich ein Auto zu meinem Hotel in Nea Kallikratia geliefert bekommen?", answer: "Ja. Wir koordinieren die Abholung am oder in der Nähe Ihres Hotels oder Ihrer Ferienwohnung; bestätigen Sie die Adresse bei der Buchung." },
        { question: "Eignet sich Nea Kallikratia als Basis für die Chalkidiki?", answer: "Ja. Der Ort liegt an der Hauptroute zur Halbinsel; Sithonia und Kassandra sind mit dem Auto gut erreichbar." },
        { question: "Was, wenn ich vom Flughafen Thessaloniki anreise?", answer: "Buchen Sie mit Abholung am Flughafen oder vereinbaren Sie eine spätere Übergabe in Nea Kallikratia nach Ihrer Ankunft." },
      ],
    },
    bg: {
      shortName: "Неа Каликратия",
      h1: "Под наем на кола в Неа Каликратия",
      seoTitle: "Под наем на кола в Неа Каликратия, Халкидики | Natali Cars",
      seoDescription:
        "Наем на кола в Неа Каликратия с удобна получаване до плажа и главния път. Идеално за престой на брега и разходки из Халкидики.",
      introText:
        "Неа Каликратия е популярен крайбрежен град по пътя към Халкидики. Тази страница ви помага да организирате наем на кола с получаване подходящо за вашето настаняване.",
      areaServed: ["Плаж Неа Каликратия", "Център Неа Каликратия"],
      pickupLocation: "Място за получаване Неа Каликратия",
      offerName: "Наем на кола Неа Каликратия",
      offerDescription: "Получаване до плажа за Неа Каликратия и близки курорти.",
      pickupGuidance:
        "Получаването в Неа Каликратия обикновено се организира близо до настаняването ви или до договорена точка на крайбрежния път. Потвърдете точното място при резервация.",
      nearbyPlaces: ["Солун (град)", "Неа Мудания (пристанище)", "Полуостров Ситония"],
      faq: [
        { question: "Мога ли да получа кола до хотела в Неа Каликратия?", answer: "Да. Координаираме получаване в или близо до хотела/апартамента; потвърдете адреса при резервация." },
        { question: "Подходяща ли е Неа Каликратия като база за Халкидики?", answer: "Да. Градът е на главния път към полуострова; Ситония и Касандра са лесно достъпни с кола." },
        { question: "Ако пристигна от летище Солун?", answer: "Резервирайте с получаване на летището или уговорете по-късна предаване в Неа Каликратия след пристигане." },
      ],
    },
    ro: {
      shortName: "Nea Kallikratia",
      h1: "Închirieri auto în Nea Kallikratia",
      seoTitle: "Închirieri auto în Nea Kallikratia, Halkidiki | Natali Cars",
      seoDescription:
        "Închiriați mașină în Nea Kallikratia cu preluare convenabilă lângă plajă și drumul principal. Ideal pentru sejur la mare și excursii în Halkidiki.",
      introText:
        "Nea Kallikratia este un oraș litoral popular pe drumul spre Halkidiki. Această pagină vă ajută să organizați închiriere auto cu preluare potrivită cazării dumneavoastră.",
      areaServed: ["Plaja Nea Kallikratia", "Centrul Nea Kallikratia"],
      pickupLocation: "Punct de preluare Nea Kallikratia",
      offerName: "Închirieri auto Nea Kallikratia",
      offerDescription: "Preluare lângă plajă pentru Nea Kallikratia și stațiuni apropiate.",
      pickupGuidance:
        "Preluarea în Nea Kallikratia se organizează de obicei lângă cazare sau la un punct convenit pe drumul litoral. Confirmați locația exactă la rezervare.",
      nearbyPlaces: ["Thessaloniki (oraș)", "Nea Moudania (port)", "Peninsula Sithonia"],
      faq: [
        { question: "Pot primi mașina la hotel în Nea Kallikratia?", answer: "Da. Coordonăm preluarea la sau lângă hotel/apartament; confirmați adresa la rezervare." },
        { question: "Este Nea Kallikratia o bază bună pentru Halkidiki?", answer: "Da. Se află pe traseul principal al peninsulei; Sithonia și Kassandra sunt ușor accesibile cu mașina." },
        { question: "Dacă sosesc de la aeroportul Thessaloniki?", answer: "Rezervați cu preluare la aeroport sau stabiliți o predare ulterioară în Nea Kallikratia după sosire." },
      ],
    },
    sr: {
      shortName: "Неа Каликратија",
      h1: "Изнајмљивање аута у Неа Каликратији",
      seoTitle: "Изнајмљивање аута у Неа Каликратији, Халкидики | Natali Cars",
      seoDescription:
        "Изнајмите ауто у Неа Каликратији са погодном преузимањем код плаже и главног пута. Идеално за одмор на обали и излете по Халкидикију.",
      introText:
        "Неа Каликратија је популарно приобално место на путу ка Халкидикију. Ова страница вам помаже да организујете изнајмљивање аута са преузимањем прилагођеним вашем смештају.",
      areaServed: ["Плажа Неа Каликратија", "Центар Неа Каликратија"],
      pickupLocation: "Место преузимања Неа Каликратија",
      offerName: "Изнајмљивање аута Неа Каликратија",
      offerDescription: "Преузимање код плаже за Неа Каликратију и оближње курорте.",
      pickupGuidance:
        "Преузимање у Неа Каликратији обично се организује близу смештаја или на договореној тачки на обалском путу. Потврдите тачно место при резервацији.",
      nearbyPlaces: ["Солун (град)", "Неа Муданија (лука)", "Полуострво Ситонија"],
      faq: [
        { question: "Могу ли добити ауто испоручено до хотела у Неа Каликратији?", answer: "Да. Координишемо преузимање у или близу хотела/апартмана; потврдите адресу при резервацији." },
        { question: "Да ли је Неа Каликратија добра база за истраживање Халкидикија?", answer: "Да. Налази се на главном путу полуострва; Ситонија и Касандра су лако доступне аутом." },
        { question: "Шта ако стигнем са аеродрома Солун?", answer: "Резервишите са преузимањем на аеродрому или договорите каснију предају у Неа Каликратији након доласка." },
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
    expandLocationContentRecord(localizedValues),
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

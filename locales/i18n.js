import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationsEn from "./en.json";
import translationsEl from "./el.json";
import translationsRu from "./ru.json";

const resources = {
  en: {
    translation: translationsEn,
  },
  el: {
    translation: translationsEl,
  },
  ru: {
    translation: translationsRu,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  supportedLngs: ["en", "gr", "ru"],
  debug: true,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

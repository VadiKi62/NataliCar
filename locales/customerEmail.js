/**
 * Тексты писем и уведомлений.
 * Берёт переводы из locale-файлов (en.json, ru.json, el.json) — ключи customerEmail, orderNotification.
 */

import enLocale from "./en.json";
import ruLocale from "./ru.json";
import elLocale from "./el.json";

const SUPPORTED = ["en", "ru", "el"];
const DEFAULT_LOCALE = "en";

const customerEmailByLocale = {
  en: enLocale.customerEmail,
  ru: ruLocale.customerEmail,
  el: elLocale.customerEmail,
};

const orderNotificationByLocale = {
  en: enLocale.orderNotification,
  ru: ruLocale.orderNotification,
  el: elLocale.orderNotification,
};

/**
 * Нормализует код языка: "el-GR" → "el", "en" → "en".
 * i18n может отдавать язык с регионом (el-GR, en-US), а мы храним только базовый код.
 * @param {string} [locale]
 * @returns {string}
 */
function normalizeLocale(locale) {
  if (!locale || typeof locale !== "string") return DEFAULT_LOCALE;
  const base = locale.split("-")[0].toLowerCase();
  return SUPPORTED.includes(base) ? base : DEFAULT_LOCALE;
}

/**
 * @param {string} [locale] - Код языка (en, ru, el или el-GR, en-US и т.д.)
 * @returns {typeof enLocale.customerEmail}
 */
export function getCustomerEmailStrings(locale) {
  const lang = normalizeLocale(locale);
  return customerEmailByLocale[lang] || customerEmailByLocale[DEFAULT_LOCALE];
}

/**
 * @param {string} [locale] - Код языка (en, ru, el или el-GR, en-US и т.д.)
 * @returns {typeof enLocale.orderNotification}
 */
export function getOrderNotificationStrings(locale) {
  const lang = normalizeLocale(locale);
  return orderNotificationByLocale[lang] || orderNotificationByLocale[DEFAULT_LOCALE];
}

export { SUPPORTED, DEFAULT_LOCALE };

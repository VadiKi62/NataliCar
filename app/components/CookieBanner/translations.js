/**
 * Cookie Banner translations
 * 
 * Dictionary-based i18n for cookie consent banner.
 * Supports: English (default), Greek, Russian
 */

export const cookieBannerTranslations = {
  en: {
    title: "Cookie Consent",
    message: "We use cookies to enhance your browsing experience and analyze site traffic. By clicking \"Accept\", you consent to our use of cookies.",
    accept: "Accept",
    reject: "Reject",
    learnMore: "Learn more",
    privacyLink: "/privacy-policy",
    cookieLink: "/cookie-policy",
  },
  el: {
    title: "Συναίνεση Cookies",
    message: "Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία περιήγησής σας και να αναλύσουμε την επισκεψιμότητα. Κάνοντας κλικ στο \"Αποδοχή\", συναινείτε στη χρήση cookies.",
    accept: "Αποδοχή",
    reject: "Απόρριψη",
    learnMore: "Μάθετε περισσότερα",
    privacyLink: "/privacy-policy",
    cookieLink: "/cookie-policy",
  },
  ru: {
    title: "Согласие на cookies",
    message: "Мы используем файлы cookie для улучшения вашего опыта и анализа трафика сайта. Нажимая \"Принять\", вы соглашаетесь на использование cookie.",
    accept: "Принять",
    reject: "Отклонить",
    learnMore: "Подробнее",
    privacyLink: "/privacy-policy",
    cookieLink: "/cookie-policy",
  },
};

/**
 * Get translations for a given locale
 * Falls back to English if locale is not supported
 */
export function getCookieBannerText(locale) {
  const supportedLocales = ["en", "el", "ru"];
  const lang = supportedLocales.includes(locale) ? locale : "en";
  return cookieBannerTranslations[lang];
}

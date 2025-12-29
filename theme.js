"use client";
import { createTheme } from "@mui/material/styles";

/**
 * Централизованная цветовая палитра
 * Все цвета проекта определены здесь для единообразия
 */
export const colors = {
  // Основные цвета бренда
  brand: {
    primary: "#990606", // Основной красный
    primaryDark: "#8A0707", // Тёмный красный
    secondary: "#346698", // Синий (navbar, первый столбец календаря)
    accent: "#c2d1e0", // Светло-голубой акцент
    gold: "#bfa70d", // Золотой/жёлтый акцент
  },

  // Фоновые цвета
  background: {
    default: "#ffffff",
    paper: "#ffffff",
    light: "#fceee9", // Бежевый
    overlay: "rgba(191,167,93,1)",
  },

  // Текстовые цвета
  text: {
    primary: "#151515",
    secondary: "#333333",
    light: "#ffffff",
    dark: "#151515",
    accent: "rgba(255, 102, 51)", // Оранжевый акцент
  },

  // Цвета статусов заказов
  order: {
    confirmed: "#8A0707", // Подтверждённый заказ (красный)
    confirmedMyOrder: "#4CAF50", // Подтверждённый заказ от компании (зелёный)
    pending: "#c2d1e0", // Ожидающий подтверждения (голубой)
    conflict: "#a3c1ad", // Конфликтующие заказы (мятный)
    conflictText: "rgba(255, 102, 51)", // Текст конфликта (оранжевый)
  },

  // Цвета календаря
  calendar: {
    today: "#ffe082", // Сегодняшний день (жёлтый)
    todayText: "#000000",
    sunday: "#ff0000", // Воскресенье (красный)
    headerBg: "#ffffff",
    cellBorder: "#dddddd",
    firstColumnBg: "#346698", // Первый столбец (синий, как navbar)
    firstColumnText: "#ffffff",
  },

  // Цвета UI элементов
  ui: {
    border: "#dddddd",
    divider: "#e0e0e0",
    hover: "rgba(255, 255, 255, 0.1)",
    disabled: "#9e9e9e",
    error: "#f44336",
    success: "#4CAF50",
    warning: "#ff9800",
    info: "#2196f3",
  },
};

// CSS переменные для использования в globals.css
export const cssVariables = {
  "--color-brand-primary": colors.brand.primary,
  "--color-brand-primary-dark": colors.brand.primaryDark,
  "--color-brand-secondary": colors.brand.secondary,
  "--color-brand-accent": colors.brand.accent,
  "--color-brand-gold": colors.brand.gold,

  "--color-bg-default": colors.background.default,
  "--color-bg-paper": colors.background.paper,
  "--color-bg-light": colors.background.light,

  "--color-text-primary": colors.text.primary,
  "--color-text-secondary": colors.text.secondary,
  "--color-text-light": colors.text.light,
  "--color-text-dark": colors.text.dark,
  "--color-text-accent": colors.text.accent,

  "--color-order-confirmed": colors.order.confirmed,
  "--color-order-confirmed-my": colors.order.confirmedMyOrder,
  "--color-order-pending": colors.order.pending,
  "--color-order-conflict": colors.order.conflict,

  "--color-calendar-today": colors.calendar.today,
  "--color-calendar-today-text": colors.calendar.todayText,
  "--color-calendar-sunday": colors.calendar.sunday,
  "--color-calendar-first-col-bg": colors.calendar.firstColumnBg,
  "--color-calendar-first-col-text": colors.calendar.firstColumnText,
  "--color-calendar-border": colors.calendar.cellBorder,

  "--color-ui-border": colors.ui.border,
  "--color-ui-error": colors.ui.error,
  "--color-ui-success": colors.ui.success,
};

// MUI Theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.brand.primary,
      main1: colors.brand.secondary, // Синий для navbar
      green: colors.brand.accent,
      fiolet: colors.brand.gold,
      red: colors.brand.primaryDark,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    secondary: {
      main: colors.text.primary,
      dark: colors.text.light,
      light: colors.brand.accent,
      beige: colors.background.light,
      background: colors.background.overlay,
      complement: colors.brand.primaryDark,
    },
    text: {
      light: colors.text.light,
      dark: colors.text.dark,
      main: colors.text.accent,
      red: colors.text.accent,
      green: colors.order.conflict,
      yellow: colors.calendar.today,
    },
    // Дополнительные цвета для статусов
    order: {
      confirmed: colors.order.confirmed,
      confirmedMyOrder: colors.order.confirmedMyOrder,
      pending: colors.order.pending,
      conflict: colors.order.conflict,
    },
    calendar: {
      today: colors.calendar.today,
      todayText: colors.calendar.todayText,
      sunday: colors.calendar.sunday,
      firstColumnBg: colors.calendar.firstColumnBg,
      firstColumnText: colors.calendar.firstColumnText,
      border: colors.calendar.cellBorder,
    },
    ui: {
      border: colors.ui.border,
      error: colors.ui.error,
      success: colors.ui.success,
      warning: colors.ui.warning,
      info: colors.ui.info,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        heroButton: {
          fontSize: 45,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          display: "inline-block",
          padding: "10px 28px",
          margin: "0px 2px 0px 0px",
          borderRadius: "50px",
          transition: "0.3s",
          lineHeight: 1,
          color: colors.text.light,
          border: `2px solid ${colors.brand.gold}`,
          "&:hover": {
            backgroundColor: colors.brand.gold,
            color: colors.text.light,
          },
        },
      },
    },
  },
  typography: {
    fontFamily: ["Roboto Slab", "serif"].join(","),
    h1: {
      fontSize: "45px",
      fontFamily: ["B612 Mono", "monospace"].join(","),
    },
    allVariants: {
      fontFamily: ["B612 Mono", "monospace"].join(","),
    },
  },
});

export default theme;

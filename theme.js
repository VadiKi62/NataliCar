"use client";
import { createTheme, alpha } from "@mui/material/styles";

/**
 * Цветовая палитра проекта
 * 
 * Primary: #890000 (тёмно-красный)
 * Complementary: #008989 (бирюзовый)
 * Analogous: #890045 (малиновый), #894500 (коричнево-оранжевый)
 * Triadic: #898900 (оливковый), #008900 (зелёный)
 */

// ============================================
// БАЗОВЫЕ ЦВЕТА ПАЛИТРЫ
// ============================================
export const palette = {
  primary: {
    main: "#890000",
    light: "#b33333",
    dark: "#5c0000",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#008989",
    light: "#33a0a0",
    dark: "#005c5c",
    contrastText: "#ffffff",
  },
  analogous: {
    rose: "#890045",
    roseLight: "#b33370",
    roseDark: "#5c002e",
    amber: "#894500",
    amberLight: "#b36a33",
    amberDark: "#5c2e00",
  },
  triadic: {
    olive: "#898900",
    oliveLight: "#a0a033",
    oliveDark: "#5c5c00",
    green: "#008900",
    greenLight: "#33a033",
    greenDark: "#005c00",
  },
  neutral: {
    white: "#ffffff",
    black: "#0a0a0a",
    gray50: "#fafafa",
    gray100: "#f5f5f5",
    gray200: "#eeeeee",
    gray300: "#e0e0e0",
    gray400: "#bdbdbd",
    gray500: "#9e9e9e",
    gray600: "#757575",
    gray700: "#616161",
    gray800: "#424242",
    gray900: "#212121",
  },
  status: {
    success: "#008900", // Triadic green
    warning: "#894500", // Analogous amber
    error: "#890000", // Primary
    info: "#008989", // Secondary/Complementary
  },
};

// ============================================
// СВЕТЛАЯ ТЕМА
// ============================================
const lightThemeColors = {
  background: {
    default: "#ffffff",
    paper: "#ffffff",
    subtle: palette.neutral.gray50,
    accent: alpha(palette.primary.main, 0.04),
  },
  text: {
    primary: palette.neutral.gray900,
    secondary: palette.neutral.gray700,
    disabled: palette.neutral.gray500,
    inverse: palette.neutral.white,
  },
  divider: palette.neutral.gray200,
  action: {
    active: palette.primary.main,
    hover: alpha(palette.primary.main, 0.08),
    selected: alpha(palette.primary.main, 0.12),
    disabled: palette.neutral.gray400,
    disabledBackground: palette.neutral.gray200,
  },
};

// ============================================
// ТЁМНАЯ ТЕМА
// ============================================
const darkThemeColors = {
  background: {
    default: "#121212",
    paper: "#1e1e1e",
    subtle: "#2a2a2a",
    accent: alpha(palette.secondary.light, 0.08),
  },
  text: {
    primary: "#ffffff",
    secondary: palette.neutral.gray400,
    disabled: palette.neutral.gray600,
    inverse: palette.neutral.gray900,
  },
  divider: palette.neutral.gray800,
  action: {
    active: palette.secondary.light,
    hover: alpha(palette.secondary.light, 0.12),
    selected: alpha(palette.secondary.light, 0.16),
    disabled: palette.neutral.gray700,
    disabledBackground: palette.neutral.gray800,
  },
};

// ============================================
// ЦВЕТА ДЛЯ БИЗНЕС-ЛОГИКИ (ЗАКАЗЫ, КАЛЕНДАРЬ)
// ============================================
export const businessColors = {
  order: {
    confirmed: palette.primary.main, // Подтверждённый заказ (красный)
    confirmedMyOrder: palette.triadic.green, // Заказ от компании (зелёный)
    pending: palette.analogous.amber, // Ожидающий (оранжевый)
    pendingLight: palette.analogous.amberLight,
    conflict: "#e7c475", // Конфликт (жёлтый)
  },
  calendar: {
    today: "#ffe082",
    todayText: palette.neutral.black,
    sunday: palette.primary.main,
    headerBg: palette.neutral.white,
    cellBorder: palette.neutral.gray300,
    firstColumnBg: palette.secondary.main,
    firstColumnText: palette.neutral.white,
    selected: "#1976d2", // Синий для выделения
    moveHighlight: "#ffeb3b", // Жёлтый для режима перемещения
  },
  button: {
    // Мерцающая кнопка "Забронировать"
    book: palette.triadic.green,
    bookHover: palette.triadic.greenDark,
    bookGlow: palette.triadic.greenLight,
    // Мерцающая кнопка "Отправить заявку"
    submit: palette.primary.main,
    submitHover: palette.primary.dark,
    submitGlow: palette.primary.light,
  },
};

// ============================================
// CSS ПЕРЕМЕННЫЕ
// ============================================
export const cssVariables = {
  // Primary
  "--color-primary": palette.primary.main,
  "--color-primary-light": palette.primary.light,
  "--color-primary-dark": palette.primary.dark,
  
  // Secondary (Complementary)
  "--color-secondary": palette.secondary.main,
  "--color-secondary-light": palette.secondary.light,
  "--color-secondary-dark": palette.secondary.dark,
  
  // Analogous
  "--color-rose": palette.analogous.rose,
  "--color-amber": palette.analogous.amber,
  
  // Triadic
  "--color-olive": palette.triadic.olive,
  "--color-green": palette.triadic.green,
  
  // Status
  "--color-success": palette.status.success,
  "--color-warning": palette.status.warning,
  "--color-error": palette.status.error,
  "--color-info": palette.status.info,
  
  // Background
  "--color-bg-default": lightThemeColors.background.default,
  "--color-bg-paper": lightThemeColors.background.paper,
  "--color-bg-subtle": lightThemeColors.background.subtle,
  
  // Text
  "--color-text-primary": lightThemeColors.text.primary,
  "--color-text-secondary": lightThemeColors.text.secondary,
  "--color-text-inverse": lightThemeColors.text.inverse,
  
  // Business
  "--color-order-confirmed": businessColors.order.confirmed,
  "--color-order-confirmed-my": businessColors.order.confirmedMyOrder,
  "--color-order-pending": businessColors.order.pending,
  "--color-calendar-today": businessColors.calendar.today,
  "--color-calendar-first-col": businessColors.calendar.firstColumnBg,
  "--color-calendar-selected": businessColors.calendar.selected,
  
  // Button
  "--color-btn-book": businessColors.button.book,
  "--color-btn-book-glow": businessColors.button.bookGlow,
  "--color-btn-submit": businessColors.button.submit,
  "--color-btn-submit-glow": businessColors.button.submitGlow,
};

// ============================================
// СТИЛИ КНОПОК
// ============================================
const buttonStyles = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: "none",
        fontWeight: 600,
        fontFamily: "'PT Sans', sans-serif",
        padding: "10px 24px",
        transition: "all 0.2s ease-in-out",
      },
      containedPrimary: {
        backgroundColor: palette.primary.main,
        "&:hover": {
          backgroundColor: palette.primary.dark,
        },
      },
      containedSecondary: {
        backgroundColor: palette.secondary.main,
        "&:hover": {
          backgroundColor: palette.secondary.dark,
        },
      },
      containedSuccess: {
        backgroundColor: palette.triadic.green,
        "&:hover": {
          backgroundColor: palette.triadic.greenDark,
        },
      },
      outlinedPrimary: {
        borderColor: palette.primary.main,
        color: palette.primary.main,
        "&:hover": {
          backgroundColor: alpha(palette.primary.main, 0.08),
          borderColor: palette.primary.dark,
        },
      },
    },
  },
};

// ============================================
// КАСТОМНЫЕ ВАРИАНТЫ КНОПОК (для использования в компонентах)
// ============================================
export const customButtonStyles = {
  // Мерцающая кнопка "Забронировать" (зелёная)
  bookButton: {
    backgroundColor: businessColors.button.book,
    color: palette.neutral.white,
    fontWeight: "bold",
    fontSize: "1.1rem",
    minWidth: "180px",
    boxShadow: `0 0 16px ${businessColors.button.bookGlow}`,
    animation: "bookButtonPulse 1.5s ease-in-out infinite",
    "&:hover": {
      backgroundColor: businessColors.button.bookHover,
      animation: "none",
      boxShadow: `0 4px 12px ${alpha(businessColors.button.book, 0.4)}`,
    },
    "@keyframes bookButtonPulse": {
      "0%": {
        boxShadow: `0 0 16px ${businessColors.button.bookGlow}`,
        transform: "scale(1)",
      },
      "50%": {
        boxShadow: `0 0 28px ${businessColors.button.bookGlow}`,
        transform: "scale(1.04)",
      },
      "100%": {
        boxShadow: `0 0 16px ${businessColors.button.bookGlow}`,
        transform: "scale(1)",
      },
    },
  },
  
  // Мерцающая кнопка "Отправить заявку" (красная)
  submitButton: {
    backgroundColor: businessColors.button.submit,
    color: palette.neutral.white,
    fontWeight: "bold",
    fontSize: "1.1rem",
    minWidth: "200px",
    boxShadow: `0 0 16px ${businessColors.button.submitGlow}`,
    animation: "submitButtonPulse 1.5s ease-in-out infinite",
    "&:hover": {
      backgroundColor: businessColors.button.submitHover,
      animation: "none",
      boxShadow: `0 4px 12px ${alpha(businessColors.button.submit, 0.4)}`,
    },
    "@keyframes submitButtonPulse": {
      "0%": {
        boxShadow: `0 0 16px ${businessColors.button.submitGlow}`,
        transform: "scale(1)",
      },
      "50%": {
        boxShadow: `0 0 24px ${businessColors.button.submitGlow}`,
        transform: "scale(1.03)",
      },
      "100%": {
        boxShadow: `0 0 16px ${businessColors.button.submitGlow}`,
        transform: "scale(1)",
      },
    },
  },
  
  // Hero кнопка (для главной страницы)
  heroButton: {
    fontSize: "clamp(14px, 3vw, 20px)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    padding: "12px 32px",
    borderRadius: "50px",
    transition: "all 0.3s ease",
    lineHeight: 1.2,
    color: palette.neutral.white,
    border: `2px solid ${palette.secondary.main}`,
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: palette.secondary.main,
      color: palette.neutral.white,
      transform: "translateY(-2px)",
      boxShadow: `0 4px 16px ${alpha(palette.secondary.main, 0.4)}`,
    },
  },
};

// ============================================
// ТИПОГРАФИКА
// ============================================
const typography = {
  fontFamily: "'PT Sans', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  h1: {
    fontFamily: "'PT Sans', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontFamily: "'PT Sans', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontFamily: "'PT Sans', sans-serif",
    fontWeight: 600,
    fontSize: "clamp(1.25rem, 3vw, 2rem)",
    lineHeight: 1.4,
  },
  h4: {
    fontFamily: "'PT Sans', sans-serif",
    fontWeight: 600,
    fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
    lineHeight: 1.4,
  },
  h5: {
    fontFamily: "'PT Sans', sans-serif",
    fontWeight: 600,
    fontSize: "1.1rem",
    lineHeight: 1.5,
  },
  h6: {
    fontFamily: "'PT Sans', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  body1: {
    fontFamily: "'PT Sans', sans-serif",
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  body2: {
    fontFamily: "'PT Sans', sans-serif",
    fontSize: "0.875rem",
    lineHeight: 1.6,
  },
  button: {
    fontFamily: "'PT Sans', sans-serif",
    fontWeight: 600,
    textTransform: "none",
  },
  caption: {
    fontFamily: "'PT Sans', sans-serif",
    fontSize: "0.75rem",
    lineHeight: 1.5,
  },
};

// ============================================
// СОЗДАНИЕ СВЕТЛОЙ ТЕМЫ
// ============================================
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: palette.primary,
    secondary: palette.secondary,
    success: {
      main: palette.status.success,
      light: palette.triadic.greenLight,
      dark: palette.triadic.greenDark,
      contrastText: palette.neutral.white,
    },
    warning: {
      main: palette.status.warning,
      light: palette.analogous.amberLight,
      dark: palette.analogous.amberDark,
      contrastText: palette.neutral.white,
    },
    error: {
      main: palette.status.error,
      light: palette.primary.light,
      dark: palette.primary.dark,
      contrastText: palette.neutral.white,
    },
    info: {
      main: palette.status.info,
      light: palette.secondary.light,
      dark: palette.secondary.dark,
      contrastText: palette.neutral.white,
    },
    background: lightThemeColors.background,
    text: lightThemeColors.text,
    divider: lightThemeColors.divider,
    action: lightThemeColors.action,
    // Кастомные цвета для бизнес-логики
    order: businessColors.order,
    calendar: businessColors.calendar,
    button: businessColors.button,
    // Дополнительные цвета
    analogous: palette.analogous,
    triadic: palette.triadic,
    neutral: palette.neutral,
  },
  typography,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...buttonStyles,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'PT Sans', sans-serif",
        },
      },
    },
  },
});

// ============================================
// СОЗДАНИЕ ТЁМНОЙ ТЕМЫ
// ============================================
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      ...palette.primary,
      main: palette.primary.light, // Используем светлый вариант для тёмной темы
    },
    secondary: {
      ...palette.secondary,
      main: palette.secondary.light,
    },
    success: {
      main: palette.triadic.greenLight,
      light: palette.triadic.greenLight,
      dark: palette.triadic.green,
      contrastText: palette.neutral.black,
    },
    warning: {
      main: palette.analogous.amberLight,
      light: palette.analogous.amberLight,
      dark: palette.analogous.amber,
      contrastText: palette.neutral.black,
    },
    error: {
      main: palette.primary.light,
      light: palette.primary.light,
      dark: palette.primary.main,
      contrastText: palette.neutral.white,
    },
    info: {
      main: palette.secondary.light,
      light: palette.secondary.light,
      dark: palette.secondary.main,
      contrastText: palette.neutral.black,
    },
    background: darkThemeColors.background,
    text: darkThemeColors.text,
    divider: darkThemeColors.divider,
    action: darkThemeColors.action,
    // Кастомные цвета
    order: businessColors.order,
    calendar: {
      ...businessColors.calendar,
      headerBg: darkThemeColors.background.paper,
    },
    button: businessColors.button,
    analogous: palette.analogous,
    triadic: palette.triadic,
    neutral: palette.neutral,
  },
  typography,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...buttonStyles,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// ============================================
// ЭКСПОРТ ПО УМОЛЧАНИЮ (светлая тема)
// ============================================
export default lightTheme;

// ============================================
// СОВМЕСТИМОСТЬ СО СТАРЫМ КОДОМ
// ============================================
// Эти экспорты нужны для обратной совместимости
export const colors = {
  brand: {
    primary: palette.primary.main,
    primaryDark: palette.primary.dark,
    secondary: palette.secondary.main,
    accent: palette.secondary.light,
    gold: palette.analogous.amber,
  },
  background: lightThemeColors.background,
  text: {
    primary: lightThemeColors.text.primary,
    secondary: lightThemeColors.text.secondary,
    light: palette.neutral.white,
    dark: palette.neutral.black,
    accent: palette.analogous.amber,
  },
  order: businessColors.order,
  calendar: businessColors.calendar,
  ui: {
    border: palette.neutral.gray300,
    divider: palette.neutral.gray200,
    hover: alpha(palette.primary.main, 0.08),
    disabled: palette.neutral.gray500,
    error: palette.status.error,
    success: palette.status.success,
    warning: palette.status.warning,
    info: palette.status.info,
  },
};

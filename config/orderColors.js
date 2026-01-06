/**
 * Order colors configuration
 * 
 * 🎯 ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ для цветов заказов
 * 
 * Colors depend ONLY on:
 * - order.confirmed (boolean)
 * - order.my_order (boolean)
 * 
 * my_order = true  → клиентский заказ (CLIENT)
 * my_order = false → админский заказ (ADMIN)
 * 
 * ЦВЕТОВАЯ ЛОГИКА:
 * - Клиентские заказы (my_order=true):
 *   - Confirmed: красный (primary.main)
 *   - Pending: желтый (triadic.yellow)
 * 
 * - Админские заказы (my_order=false):
 *   - Confirmed: зеленый (triadic.green)
 *   - Pending: оливковый (triadic.olive)
 * 
 * ВСЕ ЦВЕТА ИЗ ПАЛИТРЫ theme.js!
 */

import { alpha } from "@mui/material/styles";
import { palette } from "@/theme";

/**
 * ORDER_COLORS - строгая структура с обязательными полями
 * Каждый объект содержит: key, main, light, dark, text, bg, label, labelEn
 */
export const ORDER_COLORS = {
  // Подтверждённый клиентский заказ (confirmed + my_order=true) - КРАСНЫЙ
  CONFIRMED_CLIENT: {
    key: "CONFIRMED_CLIENT",
    main: palette.primary.main,        // "#890000" - красный
    light: palette.primary.light,       // "#b33333"
    dark: palette.primary.dark,         // "#5c0000"
    text: palette.primary.main,          // "#890000"
    bg: alpha(palette.primary.main, 0.12),
    label: "Подтверждён (клиент)",
    labelEn: "Confirmed (client)",
  },

  // Ожидающий клиентский заказ (pending + my_order=true) - ЖЕЛТЫЙ
  PENDING_CLIENT: {
    key: "PENDING_CLIENT",
    main: palette.triadic.yellow,      // "rgb(247, 220, 112)" - желтый
    light: palette.triadic.yellowLight, // "rgb(249, 237, 121)"
    dark: palette.triadic.yellow,       // желтый
    text: palette.triadic.yellow,       // желтый
    bg: "rgba(247, 220, 112, 0.12)",   // желтый с прозрачностью
    label: "Ожидает (клиент)",
    labelEn: "Pending (client)",
  },

  // Подтверждённый админский заказ (confirmed + my_order=false) - ЗЕЛЕНЫЙ
  CONFIRMED_ADMIN: {
    key: "CONFIRMED_ADMIN",
    main: palette.triadic.green,        // "#008900" - зеленый
    light: palette.triadic.greenLight,  // "#33a033"
    dark: palette.triadic.greenDark,    // "#005c00"
    text: palette.triadic.green,        // "#008900"
    bg: alpha(palette.triadic.green, 0.12),
    label: "Подтверждён (админ)",
    labelEn: "Confirmed (admin)",
  },

  // Ожидающий админский заказ (pending + my_order=false) - ОЛИВКОВЫЙ
  PENDING_ADMIN: {
    key: "PENDING_ADMIN",
    main: palette.triadic.olive,        // "#898900" - оливковый
    light: palette.triadic.oliveLight,  // "#a0a033"
    dark: palette.triadic.oliveDark,    // "#5c5c00"
    text: palette.triadic.olive,        // "#898900"
    bg: alpha(palette.triadic.olive, 0.12),
    label: "Ожидает (админ)",
    labelEn: "Pending (admin)",
  },
};

/**
 * ORDER_UI_COLORS - дополнительные цвета для UI (не используются в getOrderColor)
 */
export const ORDER_UI_COLORS = {
  // Заказ который нельзя подтвердить (конфликт)
  BLOCKED: {
    key: "BLOCKED",
    main: palette.neutral.gray600,
    light: palette.neutral.gray500,
    dark: palette.neutral.gray700,
    text: palette.neutral.gray600,
    bg: alpha(palette.neutral.gray600, 0.12),
    label: "Заблокирован",
    labelEn: "Blocked",
  },

  // Завершённый заказ (в прошлом) - для UI только
  COMPLETED: {
    key: "COMPLETED",
    main: palette.secondary.main,
    light: palette.secondary.light,
    dark: palette.secondary.dark,
    text: palette.secondary.main,
    bg: alpha(palette.secondary.main, 0.12),
    label: "Завершён",
    labelEn: "Completed",
  },
};

/**
 * Получить все цвета для легенды календаря
 * Возвращает 4 состояния в фиксированном порядке
 */
export function getOrderColorsForLegend() {
  return [
    ORDER_COLORS.CONFIRMED_CLIENT,
    ORDER_COLORS.CONFIRMED_ADMIN,
    ORDER_COLORS.PENDING_CLIENT,
    ORDER_COLORS.PENDING_ADMIN,
  ];
}

export default ORDER_COLORS;

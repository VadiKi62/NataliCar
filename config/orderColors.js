/**
 * Order colors configuration
 * 
 * Colors based on:
 * - confirmed status (подтверждён или нет)
 * - my_order flag (клиентский заказ или внутренний)
 * 
 * my_order = true  → клиентский заказ (от клиента или суперадмина)
 * my_order = false → внутренний заказ (админ блокирует даты)
 * 
 * ЦВЕТОВАЯ ЛОГИКА:
 * - Клиентские заказы (my_order=true): красный тон (primary)
 *   - Confirmed: тёмно-красный (высокая насыщенность)
 *   - Pending: светло-красный (низкая насыщенность)
 * 
 * - Внутренние заказы (my_order=false): янтарный/оранжевый тон (analogous.amber)
 *   - Confirmed: тёмно-янтарный (высокая насыщенность)
 *   - Pending: светло-янтарный (низкая насыщенность)
 * 
 * ВСЕ ЦВЕТА ИЗ ПАЛИТРЫ theme.js!
 */

import { palette } from "@/theme";

export const ORDER_COLORS = {
  // ============================================
  // КЛИЕНТСКИЕ ЗАКАЗЫ (my_order = true)
  // Красный тон (primary palette)
  // ============================================

  // Подтверждённый клиентский заказ (confirmed + my_order)
  // Приоритетный, блокирующий — тёмно-красный (максимальная яркость)
  CONFIRMED_BUSINESS: {
    main: palette.primary.main,         // "#5c0000" — очень тёмный красный
    light: palette.primary.light,        // "#890000" — тёмно-красный
    bg: `rgba(92, 0, 0, 0.15)`,
    label: "Подтверждён (клиент)",
    labelEn: "Confirmed (client)",
  },

  // Ожидающий клиентский заказ (pending + my_order)
  // Важный, требует внимания — светло-красный (низкая яркость)
  PENDING_BUSINESS: {
    main: palette.triadic.yellow,        // "#b33333" — светлый красный
    light: palette.triadic.yellowLight,                   // ещё светлее для hover
    bg: `rgba(179, 51, 51, 0.15)`,
    label: "Ожидает (клиент)",
    labelEn: "Pending (client)",
  },

  // ============================================
  // ВНУТРЕННИЕ ЗАКАЗЫ (my_order = false)
  // Янтарный/оранжевый тон (analogous.amber palette)
  // ============================================

  // Подтверждённый внутренний заказ (confirmed + !my_order)
  // Блокирующий — тёмно-янтарный (максимальная яркость)
  CONFIRMED_INTERNAL: {
    main: palette.triadic.green,  // "#5c2e00" — тёмно-янтарный
    light: palette.triadic.greenLight,     // "#894500" — янтарный
    bg: `rgba(92, 46, 0, 0.15)`,
    label: "Подтверждён (внутр.)",
    labelEn: "Confirmed (internal)",
  },

  // Ожидающий внутренний заказ (pending + !my_order)
  // Информационный — светло-янтарный (низкая яркость)
  PENDING_INTERNAL: {
    main: palette.triadic.olive, // "#b36a33" — светло-янтарный
    light: palette.triadic.oliveLight,                   // ещё светлее для hover
    bg: `rgba(179, 106, 51, 0.15)`,
    label: "Ожидает (внутр.)",
    labelEn: "Pending (internal)",
  },

  // ============================================
  // СПЕЦИАЛЬНЫЕ СТАТУСЫ
  // ============================================

  // Заказ который нельзя подтвердить (конфликт)
  BLOCKED: {
    main: palette.neutral.gray600,      // "#757575" — серый
    light: palette.neutral.gray500,     // "#9e9e9e" — светло-серый
    bg: `rgba(117, 117, 117, 0.15)`,
    label: "Заблокирован",
    labelEn: "Blocked",
  },

  // Завершённый заказ (в прошлом)
  COMPLETED: {
    main: palette.secondary.main,    // "#005c00" — тёмно-зелёный
    light: palette.secondary.light,       // "#008900" — зелёный
    bg: `rgba(0, 92, 0, 0.15)`,
    label: "Завершён",
    labelEn: "Completed",
  },
};

/**
 * Получить все цвета для легенды календаря
 */
export function getOrderColorsForLegend() {
  return [
    ORDER_COLORS.CONFIRMED_BUSINESS,
    ORDER_COLORS.CONFIRMED_INTERNAL,
    ORDER_COLORS.PENDING_BUSINESS,
    ORDER_COLORS.PENDING_INTERNAL,
  ];
}

export default ORDER_COLORS;

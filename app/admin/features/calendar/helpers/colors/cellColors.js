/**
 * Цвета ячеек календаря — конфигурация и построитель
 * 
 * Использует ORDER_COLORS для 4 типов заказов:
 * - confirmed + my_order → CONFIRMED_BUSINESS (тёмно-красный)
 * - confirmed + !my_order → CONFIRMED_INTERNAL (тёмно-янтарный)
 * - pending + my_order → PENDING_BUSINESS (светло-красный)
 * - pending + !my_order → PENDING_INTERNAL (светло-янтарный)
 */

import { ORDER_COLORS } from "@/config/orderColors";

/**
 * Семантические ключи для цветов ячеек.
 */
export const CELL_COLOR_KEYS = {
  // Подтверждённые заказы (4 типа на основе ORDER_COLORS)
  confirmedBusiness: ORDER_COLORS.CONFIRMED_BUSINESS.main,    // Тёмно-красный — клиент confirmed
  confirmedInternal: ORDER_COLORS.CONFIRMED_INTERNAL.main,    // Тёмно-янтарный — внутренний confirmed
  pendingBusiness: ORDER_COLORS.PENDING_BUSINESS.main,        // Светло-красный — клиент pending
  pendingInternal: ORDER_COLORS.PENDING_INTERNAL.main,        // Светло-янтарный — внутренний pending
  blocked: ORDER_COLORS.BLOCKED.main,                         // Серый — заблокированный

  // Legacy aliases (для совместимости со старым кодом)
  // confirmed = клиентский подтверждённый (CONFIRMED_BUSINESS)
  confirmed: ORDER_COLORS.CONFIRMED_BUSINESS.main,
  // confirmedMine = внутренний подтверждённый (CONFIRMED_INTERNAL)
  confirmedMine: ORDER_COLORS.CONFIRMED_INTERNAL.main,
  // nonConfirmed = pending внутренний (PENDING_INTERNAL) — для обратной совместимости
  nonConfirmed: ORDER_COLORS.PENDING_INTERNAL.main,

  // Выделение
  selected: "calendar.selected",
  selectedFallback: "#1976d2",

  // Режим перемещения
  moveHighlight: "calendar.moveHighlight",
  moveHighlightFallback: "#ffeb3b",
  moveHighlightAlpha: "rgba(255, 235, 59, 0.8)",

  // Рамки
  cellBorder: "divider",
  cellBorderFallback: "#e0e0e0",
};

/**
 * Возвращает объект цветов для использования внутри компонента.
 * @param {Object} theme - MUI theme
 * @returns {Object} colors - объект с цветами
 */
export function buildCellColors(theme) {
  return {
    // 4 типа заказов (новая система)
    confirmedBusiness: CELL_COLOR_KEYS.confirmedBusiness,
    confirmedInternal: CELL_COLOR_KEYS.confirmedInternal,
    pendingBusiness: CELL_COLOR_KEYS.pendingBusiness,
    pendingInternal: CELL_COLOR_KEYS.pendingInternal,
    blocked: CELL_COLOR_KEYS.blocked,

    // Legacy aliases — ИСПРАВЛЕНО: разные цвета для разных типов
    confirmed: CELL_COLOR_KEYS.confirmed,         // Клиентский confirmed (тёмно-красный)
    confirmedMine: CELL_COLOR_KEYS.confirmedMine, // Внутренний confirmed (тёмно-янтарный)
    nonConfirmed: CELL_COLOR_KEYS.nonConfirmed,   // Pending внутренний (светло-янтарный)

    // Выделение
    selected: theme.palette.calendar?.selected || CELL_COLOR_KEYS.selectedFallback,

    // Режим перемещения
    moveHighlight: theme.palette.calendar?.moveHighlight || CELL_COLOR_KEYS.moveHighlightFallback,
    moveHighlightAlpha: CELL_COLOR_KEYS.moveHighlightAlpha,

    // Рамки
    cellBorder: theme.palette.divider || CELL_COLOR_KEYS.cellBorderFallback,

    // Контрастные цвета для индикаторов
    indicatorConfirmed: theme.palette.neutral?.black || "#000",
    indicatorPending: theme.palette.neutral?.black || "#000",
  };
}

/**
 * Определяет цвет для заказа на основе confirmed + my_order
 * @param {Object} order - заказ
 * @param {Object} colors - объект цветов (опционально)
 * @returns {string} - hex цвет
 */
export function resolveConfirmedColor(order, colors) {
  if (!order) return CELL_COLOR_KEYS.pendingInternal;
  
  const { confirmed, my_order } = order;
  
  if (confirmed) {
    // my_order = true → клиентский заказ → КРАСНЫЙ тон
    // my_order = false → внутренний заказ → ЯНТАРНЫЙ тон
    return my_order ? CELL_COLOR_KEYS.confirmedBusiness : CELL_COLOR_KEYS.confirmedInternal;
  } else {
    // my_order = true → клиентский pending → СВЕТЛО-КРАСНЫЙ
    // my_order = false → внутренний pending → СВЕТЛО-ЯНТАРНЫЙ
    return my_order ? CELL_COLOR_KEYS.pendingBusiness : CELL_COLOR_KEYS.pendingInternal;
  }
}

/**
 * Определяет базовый цвет ячейки (для совместимости)
 * Исправлено: теперь правильно учитывает my_order для всех 4 типов
 * @param {Object} params
 * @returns {{ backgroundColor: string, color: string }}
 */
export function resolveBaseCellColor({ isConfirmed, isUnavailable, hasMyOrder, colors }) {
  if (isConfirmed) {
    // hasMyOrder = true → клиентский (красный тон)
    // hasMyOrder = false → внутренний (янтарный тон)
    const bgColor = hasMyOrder ? CELL_COLOR_KEYS.confirmedBusiness : CELL_COLOR_KEYS.confirmedInternal;
    return { backgroundColor: bgColor, color: "common.white" };
  }
  if (isUnavailable) {
    // hasMyOrder = true → клиентский pending (светло-красный)
    // hasMyOrder = false → внутренний pending (светло-янтарный)
    const bgColor = hasMyOrder ? CELL_COLOR_KEYS.pendingBusiness : CELL_COLOR_KEYS.pendingInternal;
    return { backgroundColor: bgColor, color: "text.primary" };
  }
  return { backgroundColor: "transparent", color: "inherit" };
}

/**
 * Получает цвет для заказа (новый API)
 * @param {Object} order
 * @returns {string}
 */
export function getOrderCellColor(order) {
  return resolveConfirmedColor(order);
}

/**
 * Получает цвет для pending заказа на основе my_order
 * @param {boolean} myOrder - флаг my_order заказа
 * @returns {string} - hex цвет
 */
export function getPendingColor(myOrder) {
  return myOrder ? CELL_COLOR_KEYS.pendingBusiness : CELL_COLOR_KEYS.pendingInternal;
}

/**
 * Получает цвет для confirmed заказа на основе my_order
 * @param {boolean} myOrder - флаг my_order заказа
 * @returns {string} - hex цвет
 */
export function getConfirmedColor(myOrder) {
  return myOrder ? CELL_COLOR_KEYS.confirmedBusiness : CELL_COLOR_KEYS.confirmedInternal;
}

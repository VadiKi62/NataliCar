/**
 * Цвета ячеек календаря — конфигурация и построитель
 */

/**
 * Семантические ключи для цветов ячеек.
 * Значения — MUI palette keys или hex-fallback.
 */
export const CELL_COLOR_KEYS = {
  // Подтверждённые заказы
  confirmed: "primary.main", // Красный — подтверждённый заказ (не my_order)
  confirmedMine: "calendar.confirmed", // Зелёный — подтверждённый заказ (my_order = true)
  confirmedMineFallback: "#4CAF50", // Fallback для my_order

  // Неподтверждённые заказы
  nonConfirmed: "calendar.nonConfirmed", // Серо-зелёный — неподтверждённый (pending)

  // Выделение
  selected: "calendar.selected", // Синий — выбранный заказ
  selectedFallback: "#1976d2",

  // Режим перемещения
  moveHighlight: "calendar.moveHighlight", // Жёлтый — диапазон перемещения
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
    // Подтверждённые заказы
    confirmed: CELL_COLOR_KEYS.confirmed,
    confirmedMine:
      theme.palette.order?.confirmedMyOrder || CELL_COLOR_KEYS.confirmedMineFallback,

    // Неподтверждённые
    nonConfirmed: CELL_COLOR_KEYS.nonConfirmed,

    // Выделение
    selected:
      theme.palette.calendar?.selected || CELL_COLOR_KEYS.selectedFallback,

    // Режим перемещения
    moveHighlight:
      theme.palette.calendar?.moveHighlight || CELL_COLOR_KEYS.moveHighlightFallback,
    moveHighlightAlpha: CELL_COLOR_KEYS.moveHighlightAlpha,

    // Рамки
    cellBorder: theme.palette.divider || CELL_COLOR_KEYS.cellBorderFallback,

    // Контрастные цвета для индикаторов (кружочков)
    indicatorConfirmed: theme.palette.neutral.black, // черный кружочек на зелёном фоне
    indicatorPending: theme.palette.neutral.black, // Тёмный кружочек на светлом фоне
  };
}

/**
 * Определяет цвет для подтверждённого заказа
 * @param {Object} order - заказ
 * @param {Object} colors - объект цветов
 * @returns {string}
 */
export function resolveConfirmedColor(order, colors) {
  return order?.my_order ? colors.confirmedMine : colors.confirmed;
}

/**
 * Определяет базовый цвет ячейки
 * @param {Object} params
 * @returns {{ backgroundColor: string, color: string }}
 */
export function resolveBaseCellColor({ isConfirmed, isUnavailable, hasMyOrder, colors }) {
  if (isUnavailable && !isConfirmed) {
    return { backgroundColor: colors.nonConfirmed, color: "text.primary" };
  }
  if (isConfirmed) {
    return {
      backgroundColor: hasMyOrder ? colors.confirmedMine : colors.confirmed,
      color: "common.white",
    };
  }
  return { backgroundColor: "transparent", color: "inherit" };
}


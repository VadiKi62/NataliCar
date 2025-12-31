/**
 * Утилиты для работы с датами заказов
 */
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

/**
 * Проверяет, попадает ли дата в диапазон заказа
 * @param {Object} order - заказ
 * @param {string} dateStr - дата в формате YYYY-MM-DD
 * @returns {boolean}
 */
export function isDateWithinOrder(order, dateStr) {
  if (!order) return false;
  const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
  const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
  return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
}

/**
 * Проверяет, завершён ли заказ (дата окончания раньше сегодня)
 * @param {Object} order - заказ
 * @returns {boolean}
 */
export function isOrderCompleted(order) {
  return dayjs(order.rentalEndDate).isBefore(dayjs(), "day");
}

/**
 * Проверяет, относится ли дата к завершённому заказу
 * @param {Array} carOrders - массив заказов
 * @param {string} dateStr - дата в формате YYYY-MM-DD
 * @returns {boolean}
 */
export function isDateInCompletedOrder(carOrders, dateStr) {
  return carOrders.some((order) => {
    return isOrderCompleted(order) && isDateWithinOrder(order, dateStr);
  });
}


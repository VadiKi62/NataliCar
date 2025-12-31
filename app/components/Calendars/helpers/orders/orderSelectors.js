/**
 * Селекторы для работы с заказами
 */
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

/**
 * Возвращает все заказы, покрывающие указанную дату
 * @param {Array} carOrders - массив заказов
 * @param {string} dateStr - дата в формате YYYY-MM-DD
 * @returns {Array} массив заказов
 */
export function getOrdersForDate(carOrders, dateStr) {
  return carOrders.filter((order) => {
    const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
    const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
    return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
  });
}

/**
 * Получает выбранный заказ по ID
 * @param {Array} carOrders - массив заказов
 * @param {string} selectedOrderId - ID выбранного заказа
 * @returns {Object|null}
 */
export function getSelectedOrder(carOrders, selectedOrderId) {
  if (!selectedOrderId) return null;
  return carOrders.find((o) => o._id === selectedOrderId) || null;
}


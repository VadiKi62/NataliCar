/**
 * buildPendingConfirmBlockMap
 * 
 * Создаёт map pending заказов, которые НЕ МОГУТ быть подтверждены
 * из-за конфликта с уже подтверждёнными заказами.
 * 
 * Используется в MainContext для предварительного расчёта блокировок.
 */

import { canPendingOrderBeConfirmed } from "@/domain/booking/analyzeConfirmationConflicts";

/**
 * @param {Array} allOrders - все заказы
 * @param {Object} [company] - данные компании (для получения bufferTime)
 * @returns {{ pendingConfirmBlockById: Record<string, string> }}
 *   - ключ: orderId
 *   - значение: сообщение о блокировке
 */
export function buildPendingConfirmBlockMap(allOrders, company) {
  const pendingConfirmBlockById = {};

  if (!Array.isArray(allOrders) || allOrders.length === 0) {
    return { pendingConfirmBlockById };
  }

  // 1) Группируем заказы по carId
  const byCar = new Map();
  for (const order of allOrders) {
    const carId = (order.car?._id || order.car)?.toString();
    if (!carId) continue;
    if (!byCar.has(carId)) byCar.set(carId, []);
    byCar.get(carId).push(order);
  }

  // 2) Для каждой машины — проверяем pending заказы vs confirmed
  for (const [carId, orders] of byCar.entries()) {
    // Отдельно confirmed заказы
    const confirmed = orders.filter((x) => x.confirmed === true);
    if (confirmed.length === 0) continue;

    // Pending заказы
    const pending = orders.filter((x) => !x.confirmed);

    for (const pendingOrder of pending) {
      // Проверяем, может ли этот pending заказ быть подтверждён
      const result = canPendingOrderBeConfirmed({
        pendingOrder,
        allOrders: confirmed, // передаём только confirmed для ускорения
        bufferHours: company?.bufferTime, // Передаём bufferTime из компании
      });

      if (!result.canConfirm && pendingOrder._id) {
        const orderId = pendingOrder._id.toString();
        pendingConfirmBlockById[orderId] =
          result.message ||
          "⛔ Нельзя подтвердить: конфликт с подтверждённым заказом.";
      }
    }
  }

  return { pendingConfirmBlockById };
}

export default buildPendingConfirmBlockMap;


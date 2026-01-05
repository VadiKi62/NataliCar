/**
 * getOrderColor
 * 
 * Возвращает цветовую конфигурацию для заказа на основе:
 * - confirmed (подтверждён или нет)
 * - my_order (клиентский или внутренний)
 * 
 * ❗ БИЗНЕС-ЛОГИКА: не в JSX, только в domain
 */

import { ORDER_COLORS } from "@/config/orderColors";
import dayjs from "dayjs";

/**
 * Определяет цветовую схему для заказа
 * 
 * @param {Object} order - заказ
 * @param {boolean} order.confirmed - подтверждён ли заказ
 * @param {boolean} order.my_order - клиентский ли заказ (true = клиент, false = внутренний)
 * @param {Date|string} [order.rentalEndDate] - дата окончания (для определения завершённости)
 * @returns {Object} - цветовая конфигурация { main, light, bg, label, labelEn }
 */
export function getOrderColor(order) {
  if (!order) {
    return ORDER_COLORS.PENDING_INTERNAL;
  }

  const { confirmed, my_order } = order;

  // Проверяем, завершён ли заказ (в прошлом)
  if (order.rentalEndDate) {
    const endDate = dayjs(order.rentalEndDate);
    const today = dayjs().startOf("day");
    if (endDate.isBefore(today)) {
      return ORDER_COLORS.COMPLETED;
    }
  }

  // Определяем цвет на основе confirmed + my_order
  if (confirmed) {
    return my_order 
      ? ORDER_COLORS.CONFIRMED_BUSINESS 
      : ORDER_COLORS.CONFIRMED_INTERNAL;
  } else {
    return my_order 
      ? ORDER_COLORS.PENDING_BUSINESS 
      : ORDER_COLORS.PENDING_INTERNAL;
  }
}

/**
 * Получает только основной цвет (для использования в sx)
 * 
 * @param {Object} order
 * @returns {string} - hex цвет
 */
export function getOrderMainColor(order) {
  return getOrderColor(order).main;
}

/**
 * Получает светлый цвет (для фона)
 * 
 * @param {Object} order
 * @returns {string} - hex цвет
 */
export function getOrderLightColor(order) {
  return getOrderColor(order).light;
}

/**
 * Получает цвет фона (с прозрачностью)
 * 
 * @param {Object} order
 * @returns {string} - rgba цвет
 */
export function getOrderBgColor(order) {
  return getOrderColor(order).bg;
}

/**
 * Определяет тип заказа для группировки
 * 
 * @param {Object} order
 * @returns {"confirmedBusiness" | "confirmedInternal" | "pendingBusiness" | "pendingInternal"}
 */
export function getOrderType(order) {
  if (!order) return "pendingInternal";
  
  const { confirmed, my_order } = order;
  
  if (confirmed) {
    return my_order ? "confirmedBusiness" : "confirmedInternal";
  } else {
    return my_order ? "pendingBusiness" : "pendingInternal";
  }
}

export default getOrderColor;


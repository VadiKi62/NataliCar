/**
 * getOrderColor
 * 
 * 🎯 ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ для цветов заказов
 * 
 * Возвращает цветовую конфигурацию для заказа на основе:
 * - confirmed (подтверждён или нет)
 * - my_order (клиентский или админский)
 * 
 * ❗ БИЗНЕС-ЛОГИКА: не в JSX, только в domain
 * ❗ Цвета НЕ зависят от времени (прошлое/будущее)
 */

import { ORDER_COLORS } from "@/config/orderColors";

/**
 * Определяет цветовую схему для заказа
 * 
 * @param {Object} order - заказ
 * @param {boolean} order.confirmed - подтверждён ли заказ
 * @param {boolean} order.my_order - клиентский ли заказ (true = клиент, false = админ)
 * @returns {Object} - цветовая конфигурация { key, main, light, dark, text, bg, label, labelEn }
 */
export function getOrderColor(order) {
  if (!order) {
    return ORDER_COLORS.PENDING_ADMIN;
  }

  const { confirmed, my_order } = order;

  // Определяем цвет на основе confirmed + my_order
  // 4 возможных комбинации:
  if (confirmed && my_order) {
    return ORDER_COLORS.CONFIRMED_CLIENT;
  }
  if (confirmed && !my_order) {
    return ORDER_COLORS.CONFIRMED_ADMIN;
  }
  if (!confirmed && my_order) {
    return ORDER_COLORS.PENDING_CLIENT;
  }
  // !confirmed && !my_order
  return ORDER_COLORS.PENDING_ADMIN;
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
 * Получает светлый цвет (для фона/hover)
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
 * @returns {"confirmedClient" | "confirmedAdmin" | "pendingClient" | "pendingAdmin"}
 */
export function getOrderType(order) {
  if (!order) return "pendingAdmin";
  
  const { confirmed, my_order } = order;
  
  if (confirmed) {
    return my_order ? "confirmedClient" : "confirmedAdmin";
  } else {
    return my_order ? "pendingClient" : "pendingAdmin";
  }
}

export default getOrderColor;


/**
 * bookingRules.js
 *
 * Единый источник правил бронирования.
 * 
 * ⚠️ ВАЖНО: bufferHours теперь берётся из базы данных компании (company.bufferTime).
 * Значение здесь используется только как fallback, если bufferTime не задан в компании.
 */

export const BOOKING_RULES = {
  /**
   * Буферное время между заказами (в часах) - FALLBACK значение.
   * Реальное значение берётся из company.bufferTime в базе данных.
   * Используется только если bufferTime не задан в компании.
   */
  bufferHours: 2,

  /**
   * Минимальная продолжительность аренды (в часах).
   */
  minRentalDuration: 1,

  /**
   * Рабочие часы (для будущего использования).
   */
  workingHours: {
    start: "08:00",
    end: "22:00",
  },
};

export default BOOKING_RULES;


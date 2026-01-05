/**
 * analyzeConfirmationConflicts
 *
 * 🎯 ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ для анализа конфликтов при подтверждении.
 *
 * Реализует АСИММЕТРИЧНУЮ логику:
 * ✅ Подтверждаемый → pending = WARNING (разрешить)
 * ⛔ Подтверждаемый → confirmed = BLOCK (запретить)
 *
 * ❗ Использует СТРОГО Athens timezone через fromServerUTC
 * ❗ НИКОГДА не использует dayjs() напрямую для времени из БД
 */

import { fromServerUTC, formatTimeHHMM } from "../time/athensTime";
import { BOOKING_RULES } from "./bookingRules";

/**
 * @typedef {Object} ConfirmationConflict
 * @property {string} orderId
 * @property {string} customerName
 * @property {boolean} isConfirmed
 * @property {number} overlapHours - Чистое пересечение (без буфера)
 * @property {number} effectiveConflictHours - overlap + buffer
 * @property {string} otherTimeIn - "HH:mm"
 * @property {string} otherTimeOut - "HH:mm"
 */

/**
 * @typedef {Object} ConfirmationAnalysisResult
 * @property {boolean} canConfirm
 * @property {"block" | "warning" | null} level
 * @property {string | null} message
 * @property {ConfirmationConflict[]} blockedByConfirmed
 * @property {ConfirmationConflict[]} affectedPendingOrders
 * @property {number} bufferHours
 */

/**
 * Проверяет пересечение времени С УЧЁТОМ буфера
 */
function doTimesOverlap(start1, end1, start2, end2, bufferHours) {
  const bufferedStart2 = start2.subtract(bufferHours, "hour");
  const bufferedEnd2 = end2.add(bufferHours, "hour");
  return start1.isBefore(bufferedEnd2) && end1.isAfter(bufferedStart2);
}

/**
 * Вычисляет ЧИСТЫЕ часы пересечения (без буфера)
 */
function calculateOverlapHours(start1, end1, start2, end2) {
  const overlapStart = start1.isAfter(start2) ? start1 : start2;
  const overlapEnd = end1.isBefore(end2) ? end1 : end2;

  if (overlapStart.isAfter(overlapEnd)) {
    return 0;
  }

  return overlapEnd.diff(overlapStart, "hour", true);
}

/**
 * Вычисляет разницу между возвратом одного заказа и забором другого
 * (для понимания, насколько не хватает буфера)
 */
function calculateGapHours(end1, start2) {
  return start2.diff(end1, "hour", true);
}

/**
 * Анализирует конфликты при подтверждении заказа
 *
 * @param {Object} params
 * @param {Object} params.orderToConfirm - Заказ, который хотим подтвердить
 * @param {Array} params.allOrders - Все заказы для этой машины
 * @param {number} [params.bufferHours] - Буферное время в часах (из компании, по умолчанию из BOOKING_RULES)
 * @returns {ConfirmationAnalysisResult}
 */
export function analyzeConfirmationConflicts({ orderToConfirm, allOrders, bufferHours }) {
  // Используем bufferHours из параметра, если передан, иначе из BOOKING_RULES
  const effectiveBufferHours = bufferHours ?? BOOKING_RULES?.bufferHours ?? 2;

  const result = {
    canConfirm: true,
    level: null,
    message: null,
    blockedByConfirmed: [],
    affectedPendingOrders: [],
    bufferHours: effectiveBufferHours,
  };

  if (!orderToConfirm || !allOrders) {
    return result;
  }

  // Если заказ уже подтверждён — нечего анализировать
  if (orderToConfirm.confirmed) {
    return result;
  }

  // 🎯 КРИТИЧНО: используем fromServerUTC для правильной интерпретации времени
  const confirmingStart = fromServerUTC(orderToConfirm.timeIn);
  const confirmingEnd = fromServerUTC(orderToConfirm.timeOut);

  if (!confirmingStart || !confirmingEnd) {
    return result;
  }

  allOrders.forEach((order) => {
    // Пропускаем текущий заказ
    const orderId = order._id?.toString?.() || order._id;
    const confirmingId = orderToConfirm._id?.toString?.() || orderToConfirm._id;
    if (orderId === confirmingId) return;

    // 🎯 КРИТИЧНО: используем fromServerUTC
    const otherStart = fromServerUTC(order.timeIn);
    const otherEnd = fromServerUTC(order.timeOut);

    if (!otherStart || !otherEnd) return;

    // Проверяем пересечение С УЧЁТОМ буфера
    const hasOverlap = doTimesOverlap(
      confirmingStart,
      confirmingEnd,
      otherStart,
      otherEnd,
      effectiveBufferHours
    );

    if (!hasOverlap) return;

    // Вычисляем ЧИСТОЕ пересечение (без буфера)
    const overlapHours = calculateOverlapHours(
      confirmingStart,
      confirmingEnd,
      otherStart,
      otherEnd
    );

    // Вычисляем разницу между возвратом и забором
    const gapHours = calculateGapHours(confirmingEnd, otherStart);

    const conflictInfo = {
      orderId,
      customerName: order.customerName || "Неизвестный",
      isConfirmed: order.confirmed === true,
      overlapHours: Math.round(overlapHours * 10) / 10,
      effectiveConflictHours: Math.round((overlapHours + effectiveBufferHours) * 10) / 10,
      gapHours: Math.round(gapHours * 10) / 10,
      otherTimeIn: formatTimeHHMM(otherStart),
      otherTimeOut: formatTimeHHMM(otherEnd),
    };

    if (order.confirmed) {
      result.blockedByConfirmed.push(conflictInfo);
    } else {
      result.affectedPendingOrders.push(conflictInfo);
    }
  });

  // Формируем результат с профессиональным UX-копирайтом
  if (result.blockedByConfirmed.length > 0) {
    // 🔴 BLOCK: строго, спокойно
    result.canConfirm = false;
    result.level = "block";

    const c = result.blockedByConfirmed[0];
    result.message =
      `Время пересекается с подтверждённым заказом «${c.customerName}». ` +
      `Возврат: ${c.otherTimeOut} → Забор: ${c.otherTimeIn}. ` +
      `Минимальный буфер: ${effectiveBufferHours} ч. ` +
      `Измените время или дату.`;
  } else if (result.affectedPendingOrders.length > 0) {
    // ⚠️ WARNING: информативно
    result.canConfirm = true;
    result.level = "warning";

    const totalAffected = result.affectedPendingOrders.length;
    const c = result.affectedPendingOrders[0];

    if (totalAffected === 1) {
      result.message =
        `Заказ подтверждён. ` +
        `Конфликт с ожидающим заказом «${c.customerName}» (${c.otherTimeIn} - ${c.otherTimeOut}). ` +
        `Этот заказ не сможет быть подтверждён без изменения времени.`;
    } else {
      result.message =
        `Заказ подтверждён. ` +
        `Конфликт с ${totalAffected} ожидающими заказами. ` +
        `Они не смогут быть подтверждены без изменения времени.`;
    }
  }

  return result;
}

/**
 * Проверяет, может ли pending заказ быть подтверждён
 * (есть ли блокирующие confirmed заказы)
 *
 * @param {Object} params
 * @param {Object} params.pendingOrder
 * @param {Array} params.allOrders
 * @param {number} [params.bufferHours] - Буферное время в часах (из компании, по умолчанию из BOOKING_RULES)
 * @returns {{ canConfirm: boolean, blockingOrder: Object | null, message: string | null }}
 */
export function canPendingOrderBeConfirmed({ pendingOrder, allOrders, bufferHours }) {
  // Используем bufferHours из параметра, если передан, иначе из BOOKING_RULES
  const effectiveBufferHours = bufferHours ?? BOOKING_RULES?.bufferHours ?? 2;

  if (!pendingOrder || pendingOrder.confirmed) {
    return { canConfirm: true, blockingOrder: null, message: null };
  }

  // 🎯 КРИТИЧНО: используем fromServerUTC
  const pendingStart = fromServerUTC(pendingOrder.timeIn);
  const pendingEnd = fromServerUTC(pendingOrder.timeOut);

  if (!pendingStart || !pendingEnd) {
    return { canConfirm: true, blockingOrder: null, message: null };
  }

  for (const order of allOrders) {
    const orderId = order._id?.toString?.() || order._id;
    const pendingId = pendingOrder._id?.toString?.() || pendingOrder._id;
    if (orderId === pendingId) continue;
    if (!order.confirmed) continue;

    const otherStart = fromServerUTC(order.timeIn);
    const otherEnd = fromServerUTC(order.timeOut);

    if (!otherStart || !otherEnd) continue;

    const hasOverlap = doTimesOverlap(
      pendingStart,
      pendingEnd,
      otherStart,
      otherEnd,
      effectiveBufferHours
    );

    if (hasOverlap) {
      // 🔴 BLOCK: спокойное объяснение
      return {
        canConfirm: false,
        blockingOrder: order,
        message:
          `Пересечение с подтверждённым заказом «${order.customerName || "Неизвестный"}» ` +
          `(${formatTimeHHMM(otherStart)} - ${formatTimeHHMM(otherEnd)}). ` +
          `Измените время или дату.`,
      };
    }
  }

  return { canConfirm: true, blockingOrder: null, message: null };
}

export default analyzeConfirmationConflicts;

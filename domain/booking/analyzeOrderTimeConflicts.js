/**
 * analyzeOrderTimeConflicts
 *
 * 🎯 НАЗНАЧЕНИЕ:
 * Проанализировать редактируемый заказ относительно других заказов
 * на ту же дату и вернуть:
 * - summary (один summarized message)
 * - hasBlockingConflict
 * - minPickupTime / maxReturnTime
 *
 * ❗ Использует СТРОГО Athens timezone через athensTime.js
 * ❗ НЕ зависит от таймзоны браузера
 */

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { BOOKING_RULES } from "./bookingRules";
import {
  ATHENS_TZ,
  fromServerUTC,
  createAthensDateTime,
  athensStartOfDay,
  athensEndOfDay,
  formatTimeHHMM,
  formatDateYYYYMMDD,
} from "../time/athensTime";

/**
 * Форматирует дату в читаемый формат "D MMM" (например: "1 Фев")
 */
function formatDateReadable(dayjsDate) {
  if (!dayjsDate) return "—";
  // Используем русские названия месяцев
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  return `${dayjsDate.date()} ${months[dayjsDate.month()]}`;
}

/**
 * Форматирует информацию о заказе для сообщений
 */
function formatOrderInfo(order, timeIn, timeOut, startDate, endDate) {
  const name = order.customerName || "—";
  const email = order.email ? ` (${order.email})` : "";
  const pickupDate = formatDateReadable(startDate);
  const returnDate = formatDateReadable(endDate);
  const pickupTime = formatTimeHHMM(timeIn) || "—";
  const returnTime = formatTimeHHMM(timeOut) || "—";
  
  return {
    name,
    email,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    fullName: `${name}${email}`,
  };
}

dayjs.extend(isSameOrAfter);

/**
 * @typedef {Object} ConflictSummary
 * @property {"block" | "warning"} level
 * @property {string} message
 */

/**
 * @typedef {Object} TimeConflictResult
 * @property {string|null} minPickupTime - "HH:mm" или null
 * @property {string|null} maxReturnTime - "HH:mm" или null
 * @property {ConflictSummary|null} summary - Один summarized message
 * @property {boolean} hasBlockingConflict
 */

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Проверяет, пересекаются ли два временных интервала с учётом буфера
 * 
 * ⚠️ Важно: используем СТРОГОЕ сравнение (isAfter, НЕ isSameOrAfter)
 * Если разница РОВНО равна буферу — это НЕ конфликт, всё ОК
 * Конфликт только если разница МЕНЬШЕ буфера
 */
function doTimesOverlap(start1, end1, start2, end2, bufferHours) {
  // Добавляем буфер к границам второго интервала
  const bufferedStart2 = start2.subtract(bufferHours, "hour");
  const bufferedEnd2 = end2.add(bufferHours, "hour");

  // ✅ СТРОГОЕ сравнение: разница ровно буфер = НЕ overlap
  // Конфликт только если end1 > bufferedStart2 (строго больше)
  const overlap = start1.isBefore(bufferedEnd2) && end1.isAfter(bufferedStart2);

  if (IS_DEV) {
    console.log(
      `🔍 doTimesOverlap: editing=${start1.format("HH:mm")}-${end1.format("HH:mm")} ` +
      `other=${start2.format("HH:mm")}-${end2.format("HH:mm")} ` +
      `buffered=${bufferedStart2.format("HH:mm")}-${bufferedEnd2.format("HH:mm")} ` +
      `buffer=${bufferHours}h → overlap=${overlap}`
    );
  }

  return overlap;
}

/**
 * Анализирует конфликты времени для редактируемого заказа
 *
 * @param {Object} params
 * @param {Object} params.editingOrder - Редактируемый заказ
 * @param {Array} params.orders - Все заказы для этой машины
 * @param {string} params.date - Дата в формате "YYYY-MM-DD"
 * @param {string} [params.editingPickupTime] - Время получения "HH:mm" (Athens)
 * @param {string} [params.editingReturnTime] - Время возврата "HH:mm" (Athens)
 * @param {number} [params.bufferHours] - Буферное время в часах (из компании, по умолчанию из BOOKING_RULES)
 * @returns {TimeConflictResult}
 */
export function analyzeOrderTimeConflicts({
  editingOrder,
  orders,
  date,
  editingPickupTime,
  editingReturnTime,
  bufferHours,
}) {
  // Используем bufferHours из параметра, если передан, иначе из BOOKING_RULES
  const effectiveBufferHours = bufferHours ?? BOOKING_RULES.bufferHours;

  const result = {
    minPickupTime: null,
    maxReturnTime: null,
    summary: null,
    hasBlockingConflict: false,
  };

  if (!editingOrder || !orders || !date) {
    return result;
  }

  const editingConfirmed = editingOrder.confirmed === true;
  const targetDay = athensStartOfDay(date);

  // 🎯 Определяем даты редактируемого заказа
  const editingStartDay = fromServerUTC(editingOrder.rentalStartDate).startOf("day");
  const editingEndDay = fromServerUTC(editingOrder.rentalEndDate).startOf("day");
  
  // 🎯 Определяем ПРАВИЛЬНЫЙ интервал времени для редактируемого заказа НА ЭТОТ ДЕНЬ
  // Это зависит от того, какой это день для заказа (первый, последний, или средний)
  let editingStart, editingEnd;
  
  const isEditingStartDay = targetDay.isSame(editingStartDay, "day");
  const isEditingEndDay = targetDay.isSame(editingEndDay, "day");
  
  if (isEditingStartDay && isEditingEndDay) {
    // Однодневный заказ — от pickupTime до returnTime
    editingStart = editingPickupTime
      ? createAthensDateTime(date, editingPickupTime)
      : null;
    editingEnd = editingReturnTime
      ? createAthensDateTime(date, editingReturnTime)
      : null;
  } else if (isEditingStartDay) {
    // Первый день многодневного заказа — от pickupTime до конца дня
    editingStart = editingPickupTime
      ? createAthensDateTime(date, editingPickupTime)
      : null;
    editingEnd = athensEndOfDay(date);
  } else if (isEditingEndDay) {
    // Последний день многодневного заказа — от начала дня до returnTime
    editingStart = athensStartOfDay(date);
    editingEnd = editingReturnTime
      ? createAthensDateTime(date, editingReturnTime)
      : null;
  } else {
    // Средний день — весь день занят
    editingStart = athensStartOfDay(date);
    editingEnd = athensEndOfDay(date);
  }

  if (IS_DEV) {
    console.log(
      `📅 analyzeOrderTimeConflicts: date=${date}, ` +
      `editingPickup=${editingPickupTime || "null"}, editingReturn=${editingReturnTime || "null"}, ` +
      `isStartDay=${isEditingStartDay}, isEndDay=${isEditingEndDay}, ` +
      `effectiveStart=${editingStart?.format("HH:mm") || "null"}, effectiveEnd=${editingEnd?.format("HH:mm") || "null"}, ` +
      `confirmed=${editingConfirmed}, ordersOnCar=${orders.length}`
    );
  }

  let hasBlock = false;
  let hasWarning = false;
  let blockMessage = "";
  let warningMessage = "";

  orders.forEach((order) => {
    // Пропускаем текущий заказ
    if (order._id === editingOrder._id) return;

    // Парсим даты заказа из UTC → Athens
    const orderStartDay = fromServerUTC(order.rentalStartDate).startOf("day");
    const orderEndDay = fromServerUTC(order.rentalEndDate).startOf("day");

    // Проверяем, попадает ли targetDay в диапазон заказа
    const isSameDay =
      targetDay.isSame(orderStartDay, "day") ||
      targetDay.isSame(orderEndDay, "day") ||
      (targetDay.isAfter(orderStartDay, "day") && targetDay.isBefore(orderEndDay, "day"));

    if (!isSameDay) return;

    const otherConfirmed = order.confirmed === true;

    // Парсим время другого заказа из UTC → Athens
    const otherTimeIn = fromServerUTC(order.timeIn);
    const otherTimeOut = fromServerUTC(order.timeOut);

    if (IS_DEV) {
      console.log(
        `📋 Checking order "${order.customerName || order._id}": ` +
        `confirmed=${otherConfirmed}, timeIn=${otherTimeIn?.format("HH:mm")}, timeOut=${otherTimeOut?.format("HH:mm")}`
      );
    }

    // Если у нас есть время редактируемого заказа — проверяем РЕАЛЬНОЕ пересечение
    if (editingStart && editingEnd) {
      // Определяем время другого заказа на этот день
      let otherStart, otherEnd;

      if (targetDay.isSame(orderStartDay, "day") && targetDay.isSame(orderEndDay, "day")) {
        // Однодневный заказ
        otherStart = otherTimeIn;
        otherEnd = otherTimeOut;
      } else if (targetDay.isSame(orderStartDay, "day")) {
        // Первый день многодневного заказа — от timeIn до конца дня
        otherStart = otherTimeIn;
        otherEnd = athensEndOfDay(date);
      } else if (targetDay.isSame(orderEndDay, "day")) {
        // Последний день многодневного заказа — от начала дня до timeOut
        otherStart = athensStartOfDay(date);
        otherEnd = otherTimeOut;
      } else {
        // Середина многодневного заказа — весь день занят
        otherStart = athensStartOfDay(date);
        otherEnd = athensEndOfDay(date);
      }

      // Проверяем пересечение с учётом буфера
      const hasTimeOverlap = doTimesOverlap(
        editingStart,
        editingEnd,
        otherStart,
        otherEnd,
        effectiveBufferHours
      );

      if (!hasTimeOverlap) {
        // Нет реального пересечения времени — пропускаем
        return;
      }
    }

    // --- Логика приоритетов (UX-копирайт для админа) ---
    
    // Форматируем информацию о конфликтующем заказе
    const info = formatOrderInfo(order, otherTimeIn, otherTimeOut, orderStartDay, orderEndDay);

    // 🟢 confirmed (editing) → pending (other) = INFO
    if (editingConfirmed && !otherConfirmed) {
      hasWarning = true;
      warningMessage = `Пересечение с неподтверждённым заказом: «${info.fullName}» ` +
        `(${info.pickupDate} ${info.pickupTime} — ${info.returnDate} ${info.returnTime}). ` +
        `Буфер между заказами: ${effectiveBufferHours} ч.`;
      return;
    }

    // 🔴 pending (editing) → confirmed (other) = BLOCK
    if (!editingConfirmed && otherConfirmed) {
      hasBlock = true;
      blockMessage = `Пересечение с подтверждённым заказом: «${info.fullName}» ` +
        `(${info.pickupDate} ${info.pickupTime} — ${info.returnDate} ${info.returnTime}). ` +
        `Буфер: ${effectiveBufferHours} ч. ⚙️`;

      // Устанавливаем границы времени
      if (targetDay.isSame(orderStartDay, "day")) {
        const maxTime = otherTimeIn.subtract(effectiveBufferHours, "hour").format("HH:mm");
        if (!result.maxReturnTime || maxTime < result.maxReturnTime) {
          result.maxReturnTime = maxTime;
        }
      }

      if (targetDay.isSame(orderEndDay, "day")) {
        const minTime = otherTimeOut.add(effectiveBufferHours, "hour").format("HH:mm");
        if (!result.minPickupTime || minTime > result.minPickupTime) {
          result.minPickupTime = minTime;
        }
      }
      return;
    }

    // 🟡 pending → pending = INFO
    if (!editingConfirmed && !otherConfirmed) {
      hasWarning = true;
      warningMessage = `Пересечение с неподтверждённым заказом: «${info.fullName}» ` +
        `(${info.pickupDate} ${info.pickupTime} — ${info.returnDate} ${info.returnTime}). ` +
        `Буфер между заказами: ${effectiveBufferHours} ч.`;
      return;
    }

    // 🔴 confirmed → confirmed = BLOCK
    if (editingConfirmed && otherConfirmed) {
      hasBlock = true;
      blockMessage = `Пересечение с подтверждённым заказом: «${info.fullName}» ` +
        `(${info.pickupDate} ${info.pickupTime} — ${info.returnDate} ${info.returnTime}). ` +
        `Буфер: ${effectiveBufferHours} ч. ⚙️`;
    }
  });

  // Формируем summary (только один message)
  if (hasBlock) {
    result.hasBlockingConflict = true;
    result.summary = {
      level: "block",
      message: blockMessage,
    };
  } else if (hasWarning) {
    result.summary = {
      level: "warning",
      message: warningMessage,
    };
  }

  return result;
}

export default analyzeOrderTimeConflicts;

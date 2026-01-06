"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TableCell, Box, useTheme } from "@mui/material";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

import { useMainContext } from "@app/Context";
import { returnOverlapOrders } from "@utils/functions";
import { formatDate, isPast, BUSINESS_TZ } from "@utils/businessTime";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";

// ============================================
// Импорт helpers и hooks
// ============================================
import { getOrderColor } from "@/domain/orders/getOrderColor";
import {
  // Dates
  isDateWithinOrder,
  isOrderCompleted,
  isDateInCompletedOrder,
  getStartEndInfo,
  getStartEndOverlapInfo,
  getOverlapInfo,
  // Orders
  getOrdersForDate,
  getSelectedOrder,
  isDateInSelectedOrder,
  getSelectedOrderEdgeCaseFlags,
  // Move mode
  getMoveDayFlags,
} from "@/app/admin/features/calendar/helpers";
import { useCalendarOrders } from "@/app/admin/features/calendar/hooks";
// ⚠️ ЗАФИКСИРОВАНО: Цвета для режима перемещения из централизованного конфига
import { MOVE_MODE_COLORS } from "@/config/orderColors";

CarTableRow.propTypes = {
  car: PropTypes.object.isRequired,
  days: PropTypes.array.isRequired,
  orders: PropTypes.array,
  setSelectedOrders: PropTypes.func,
  setOpen: PropTypes.func,
  onAddOrderClick: PropTypes.func,
  onLongPress: PropTypes.func.isRequired,
  moveMode: PropTypes.bool,
  onCarSelectForMove: PropTypes.func,
  selectedOrderId: PropTypes.string,
  orderToMove: PropTypes.object,
  selectedMoveOrder: PropTypes.object,
  onExitMoveMode: PropTypes.func,
  selectedOrderDates: PropTypes.array,
  isCarCompatibleForMove: PropTypes.bool,
};

export default function CarTableRow({
  car,
  days,
  orders,
  setSelectedOrders,
  setOpen,
  onAddOrderClick,
  onLongPress,
  moveMode,
  onCarSelectForMove,
  selectedMoveOrder,
  orderToMove,
  onExitMoveMode,
  selectedOrderDates,
  isCarCompatibleForMove,
}) {
  const theme = useTheme();
  const [pressTimer, setPressTimer] = useState(null);
  const [isPressing, setIsPressing] = useState(false);
  const [longPressOrder, setLongPressOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Цвета из единого источника правды (getOrderColor)

  // Заказы и производные данные из кастомного хука
  const {
    carOrders,
    unavailableDates,
    confirmedDates,
    startEndOverlapDates,
    overlapDates,
    startEndDates,
  } = useCalendarOrders(car._id, orders);

  // ordersByCarId нужен для проверки конфликтов при перемещении на другую машину
  const { ordersByCarId, pendingConfirmBlockById } = useMainContext();

  const [wasLongPress, setWasLongPress] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // ============================================
  // Memoization — тяжёлые вычисления
  // ============================================

  // Map заказов по датам — O(1) доступ вместо O(n) filter
  const ordersByDateMap = useMemo(() => {
    const map = new Map();

    carOrders.forEach((order) => {
      // Используем бизнес-таймзону для корректного разбиения по датам
      const start = dayjs(order.rentalStartDate).tz(BUSINESS_TZ);
      const end = dayjs(order.rentalEndDate).tz(BUSINESS_TZ);

      let current = start.clone();
      while (current.isSameOrBefore(end, "day")) {
        const key = current.format("YYYY-MM-DD");
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(order);
        current = current.add(1, "day");
      }
    });

    return map;
  }, [carOrders]);

  // Мемоизированный selectedOrder
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return carOrders.find((o) => o._id === selectedOrderId) || null;
  }, [carOrders, selectedOrderId]);

  // Set завершённых дат — для быстрой проверки isCompletedCell
  const completedDatesSet = useMemo(() => {
    const set = new Set();
    carOrders.forEach((order) => {
      // Используем бизнес-таймзону для корректного сравнения дат
      if (isPast(order.rentalEndDate)) {
        let current = dayjs(order.rentalStartDate).tz(BUSINESS_TZ);
        const end = dayjs(order.rentalEndDate).tz(BUSINESS_TZ);
        while (current.isSameOrBefore(end, "day")) {
          set.add(current.format("YYYY-MM-DD"));
          current = current.add(1, "day");
        }
      }
    });
    return set;
  }, [carOrders]);

  // ============================================

  // Отслеживаем изменения selectedMoveOrder для подсветки
  useEffect(() => {
    if (selectedMoveOrder) {
      setSelectedOrderId(selectedMoveOrder._id);
    } else {
      setSelectedOrderId(null);
    }
  }, [selectedMoveOrder]);

  // Функция для получения заказа по дате
  const getOrderByDate = useCallback(
    (dateStr) => {
      return carOrders.find((order) => {
        const rentalStart = formatDate(order.rentalStartDate, "YYYY-MM-DD");
        const rentalEnd = formatDate(order.rentalEndDate, "YYYY-MM-DD");
        return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
      });
    },
    [carOrders]
  );

  // Функция для проверки, является ли дата частью выбранного заказа (для синей подсветки)
  const isPartOfSelectedOrder = useCallback(
    (dateStr) => {
      if (!selectedOrderId) return false;
      const order = carOrders.find((o) => o._id === selectedOrderId);
      if (!order) return false;

      const rentalStart = formatDate(order.rentalStartDate, "YYYY-MM-DD");
      const rentalEnd = formatDate(order.rentalEndDate, "YYYY-MM-DD");
      return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
    },
    [selectedOrderId, carOrders]
  );

  // Функция для проверки, является ли дата последней для заказа
  const isLastDateForOrder = useCallback(
    (dateStr) => {
      const relevantOrders = carOrders.filter((order) => {
        const rentalStart = formatDate(order.rentalStartDate, "YYYY-MM-DD");
        const rentalEnd = formatDate(order.rentalEndDate, "YYYY-MM-DD");
        return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
      });

      return relevantOrders.some((order) => {
        const rentalEnd = formatDate(order.rentalEndDate, "YYYY-MM-DD");
        return rentalEnd === dateStr;
      });
    },
    [carOrders]
  );

  // Функция для проверки, содержит ли ячейка заказ
  const hasOrder = useCallback(
    (dateStr) => {
      const isConfirmed = confirmedDates.includes(dateStr);
      const isUnavailable = unavailableDates.includes(dateStr);
      const startEndInfo = startEndDates.find((d) => d.date === dateStr);
      const isStartDate = startEndInfo?.type === "start";
      const isEndDate = startEndInfo?.type === "end";
      const isStartAndEndDateOverlapInfo = startEndOverlapDates?.find(
        (dateObj) => dateObj.date === dateStr
      );
      const isStartEndOverlap = Boolean(isStartAndEndDateOverlapInfo);
      const isOverlapDateInfo = overlapDates?.find(
        (dateObj) => dateObj.date === dateStr
      );
      const isOverlapDate = Boolean(isOverlapDateInfo);

      return (
        isConfirmed ||
        isUnavailable ||
        isOverlapDate ||
        isStartEndOverlap ||
        isStartDate ||
        isEndDate
      );
    },
    [
      confirmedDates,
      unavailableDates,
      startEndDates,
      startEndOverlapDates,
      overlapDates,
    ]
  );

  // ИСПРАВЛЕННЫЕ обработчики для длинного нажатия
  const handleLongPressStart = (dateStr) => {
    // Запрещаем длинное нажатие, если уже активен режим перемещения
    if (moveMode) {
      return;
    }
    // Определяем типы даты (старт / конец) и совмещённость
    const startEndInfo = startEndDates.find((d) => d.date === dateStr);
    const isStartDate = startEndInfo?.type === "start";
    const isEndDate = startEndInfo?.type === "end";
    const isStartEndOverlap = Boolean(
      startEndOverlapDates?.find((dateObj) => dateObj.date === dateStr)
    );

    // Собираем все заказы, покрывающие эту дату
    const relevantOrders = carOrders.filter((order) => {
      const rentalStart = formatDate(order.rentalStartDate, "YYYY-MM-DD");
      const rentalEnd = formatDate(order.rentalEndDate, "YYYY-MM-DD");
      return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
    });
    // Проверяем: все заказы завершены (дата окончания раньше сегодняшнего дня)
    const allCompleted =
      relevantOrders.length > 0 &&
      relevantOrders.every((o) =>
        dayjs(o.rentalEndDate).isBefore(dayjs(), "day")
      );
    // Если все завершены — запрещаем переход в режим перемещения
    if (allCompleted) {
      return;
    }

    // Есть ли хотя бы один незавершённый заказ (его конец сегодня или в будущем)
    const hasActiveOrder = relevantOrders.some(
      (o) => !dayjs(o.rentalEndDate).isBefore(dayjs(), "day")
    );

    // Разрешаем длинное нажатие на совмещённой дате (конец + старт), даже если это последний день одного из заказов
    const allowLongPress =
      hasOrder(dateStr) &&
      hasActiveOrder &&
      (!isLastDateForOrder(dateStr) ||
        isStartEndOverlap ||
        (isStartDate && isEndDate));

    if (allowLongPress) {
      setWasLongPress(false);

      const timer = setTimeout(() => {
        // Предпочитаем заказ, который НАЧИНАЕТСЯ в эту дату (требование: на совмещённой дате выбирать начинающийся заказ)
        const startingOrder = relevantOrders.find(
          (order) =>
            formatDate(order.rentalStartDate, "YYYY-MM-DD") === dateStr
        );
        // Если нет стартующего, пробуем заканчивающийся (на случай редких ситуаций), иначе fallback к первой найденной логике
        const endingOrder = relevantOrders.find(
          (order) => formatDate(order.rentalEndDate, "YYYY-MM-DD") === dateStr
        );
        const fallbackOrder = getOrderByDate(dateStr);
        const order = startingOrder || endingOrder || fallbackOrder;

        if (order) {
          setWasLongPress(true);
          console.log("Long press detected on order:", {
            id: order._id,
            customer: order.customerName,
            carId: order.car,
            dates: order.rentalStartDate + " - " + order.rentalEndDate,
            picked: startingOrder
              ? "starting"
              : endingOrder
              ? "ending"
              : "fallback",
          });
          setSelectedOrderId(order._id);
          if (onLongPress) {
            onLongPress(order);
          }
        }
      }, 500); // 500ms для длинного нажатия

      setPressTimer(timer);
    }
  };

  const handleLongPressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const renderDateCell = useCallback(
    (date) => {
      // =======================
      // Date context
      // =======================
      const dateStr = date.format("YYYY-MM-DD");
      const isPastDay = date.isBefore(dayjs(), "day");
      const isCompletedCell = isDateInCompletedOrder(carOrders, dateStr);

      if (isPartOfSelectedOrder(dateStr) && selectedOrderId) {
        const selectedOrder = carOrders.find((o) => o._id === selectedOrderId);
        if (selectedOrder) {
          const selectedOrderStart = dayjs(
            selectedOrder.rentalStartDate
          ).format("YYYY-MM-DD");
          const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
            "YYYY-MM-DD"
          );

          // Первый день выделенного заказа: левая половина - цвет предыдущего заказа, правая - синяя
          if (selectedOrderStart === dateStr) {
            const prevOrder = carOrders.find(
              (order) =>
                formatDate(order.rentalEndDate, "YYYY-MM-DD") === dateStr &&
                order.confirmed === true &&
                order._id !== selectedOrder._id
            );
            if (prevOrder) {
              // Используем getOrderColor для получения цвета заказа
              const prevColor = getOrderColor(prevOrder).main;
              // console.log(
              //   `[BigCalendar][${dateStr}] EDGE-CASE: Первый день выделенного заказа. Левая половина ${
              //     prevOrder.my_order ? "зелёная" : "красная"
              //   }, правая синяя.`
              // );
              return (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Box
                    sx={{
                      width: "50%",
                      height: "100%",
                      backgroundColor: prevColor,
                      borderRadius: "0 50% 50% 0",
                    }}
                  />
                  <Box
                    sx={{
                      width: "50%",
                      height: "100%",
                      backgroundColor: theme.palette.primary.main, // Синий
                      borderRadius: "50% 0 0 50%",
                    }}
                  />
                </Box>
              );
            }
          }

          // Последний день выделенного заказа: левая половина - синяя, правая - цвет следующего заказа
          if (selectedOrderEnd === dateStr) {
            const nextOrder = carOrders.find(
              (order) =>
                formatDate(order.rentalStartDate, "YYYY-MM-DD") === dateStr &&
                order.confirmed === true &&
                order._id !== selectedOrder._id
            );
            if (nextOrder) {
              // Используем getOrderColor для получения цвета заказа
              const nextColor = getOrderColor(nextOrder).main;
              // console.log(
              //   `[BigCalendar][${dateStr}] EDGE-CASE: Последний день выделенного заказа. Левая половина синяя, правая ${
              //     nextOrder.my_order ? "зелёная" : "красная"
              //   }.`
              // );
              return (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Box
                    sx={{
                      width: "50%",
                      height: "100%",
                      backgroundColor: theme.palette.primary.main, // Синий
                      borderRadius: "0 50% 50% 0",
                    }}
                  />
                  <Box
                    sx={{
                      width: "50%",
                      height: "100%",
                      backgroundColor: nextColor,
                      borderRadius: "50% 0 0 50%",
                    }}
                  />
                </Box>
              );
            }
          }
        }
      }

      const firstRedOrder = carOrders.find(
        (order) =>
          formatDate(order.rentalStartDate, "YYYY-MM-DD") === dateStr &&
          order.confirmed === true &&
          order.my_order === false
      );
      const prevGreenOrder = carOrders.find(
        (order) =>
          formatDate(order.rentalEndDate, "YYYY-MM-DD") === dateStr &&
          order.confirmed === true &&
          order.my_order === true
      );

      const lastRedOrder = carOrders.find(
        (order) =>
          formatDate(order.rentalEndDate, "YYYY-MM-DD") === dateStr &&
          order.confirmed === true &&
          order.my_order === false
      );
      const nextGreenOrder = carOrders.find(
        (order) =>
          formatDate(order.rentalStartDate, "YYYY-MM-DD") === dateStr &&
          order.confirmed === true &&
          order.my_order === true
      );

      // Функция для создания желтого overlay для первого/последнего дня перемещения
      // ⚠️ ЗАФИКСИРОВАНО: Используем централизованную константу из config/orderColors.js
      // НЕ изменять цвет здесь - использовать MOVE_MODE_COLORS из конфига
      const YELLOW_COLOR = MOVE_MODE_COLORS.YELLOW_OVERLAY;
      const createYellowOverlay = (isFirstDay, isLastDay) => {
        // Показываем overlay только для совместимых авто и режима перемещения
        if (!moveMode || !isCarCompatibleForMove) return null;

        if (isFirstDay && isLastDay) {
          // Единственный день диапазона
          return (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: YELLOW_COLOR, // Желтый overlay для режима перемещения
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          );
        } else if (isFirstDay) {
          // Правая половина для первого дня
          return (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                backgroundColor: YELLOW_COLOR, // Желтый overlay для режима перемещения
                pointerEvents: "none",
                zIndex: 2,
                borderRadius: "50% 0 0 50%",
              }}
            />
          );
        } else if (isLastDay) {
          // Левая половина для последнего дня
          return (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                backgroundColor: YELLOW_COLOR, // Желтый overlay для режима перемещения
                pointerEvents: "none",
                zIndex: 2,
                borderRadius: "0 50% 50% 0",
              }}
            />
          );
        }
        return null;
      };

      // =======================
      // Base state flags
      // =======================
      const isConfirmed = confirmedDates.includes(dateStr);
      const isUnavailable = unavailableDates.includes(dateStr);

      // Start/End info
      const startEndInfoResult = getStartEndInfo(startEndDates, dateStr);
      const isStartDate = startEndInfoResult.isStartDate;
      const isEndDate = startEndInfoResult.isEndDate;
      const startEndInfo = startEndInfoResult.info;

      // Start+End overlap info
      const startEndOverlapResult = getStartEndOverlapInfo(startEndOverlapDates, dateStr);
      const isStartEndOverlap = startEndOverlapResult.isOverlap;
      const isStartAndEndDateOverlapInfo = startEndOverlapResult.info;

      // Overlap info
      const overlapResult = getOverlapInfo(overlapDates, dateStr);
      const isOverlapDate = overlapResult.isOverlap;
      const isOverlapDateInfo = overlapResult.info;

      const overlapOrders = returnOverlapOrders(carOrders, dateStr);

      // =======================
      // Base cell styling
      // =======================
      const ordersForDate = returnOverlapOrders(carOrders, dateStr);
      
      // Определяем цвет ячейки на основе заказов используя getOrderColor
      let backgroundColor = "transparent";
      let color = "inherit";
      
      if (isConfirmed) {
        // Для confirmed ячеек берем первый confirmed заказ
        const confirmedOrder = ordersForDate?.find((order) => order.confirmed);
        if (confirmedOrder) {
          const orderColor = getOrderColor(confirmedOrder);
          backgroundColor = orderColor.main;
          color = "white";
        }
      } else if (isUnavailable) {
        // Для pending ячеек берем первый pending заказ
        const pendingOrder = ordersForDate?.find((order) => !order.confirmed);
        if (pendingOrder) {
          const orderColor = getOrderColor(pendingOrder);
          backgroundColor = orderColor.main;
          color = "text.primary";
        }
      }
      let borderRadius = "1px";
      let border = `1px solid ${theme.palette.divider || "#e0e0e0"}`;
      let width;

      // =======================
      // Move mode flags
      // =======================
      const moveDayFlags = getMoveDayFlags(selectedOrderDates, dateStr);
      let isFirstMoveDay = moveDayFlags.isFirstMoveDay;
      let isLastMoveDay = moveDayFlags.isLastMoveDay;
      let isInMoveModeDateRange = false;
      let gradientBackground = null;
      let shouldShowYellowOverlay = false;

      if (
        moveMode &&
        selectedOrderDates &&
        selectedOrderDates.includes(dateStr) &&
        isCarCompatibleForMove
      ) {

        // Применяем желтый фон для пустых ячеек и совместимых автомобилей
        // ⚠️ ЗАФИКСИРОВАНО: Используем централизованную константу из config/orderColors.js
        const yellowColor = MOVE_MODE_COLORS.YELLOW_SOLID; // Сплошной желтый для фона
        if (backgroundColor === "transparent") {
          if (isFirstMoveDay) {
            // Желтый фон в правой половине первого дня
            gradientBackground = `linear-gradient(to right, transparent 50%, ${yellowColor} 50%)`;
          } else if (isLastMoveDay) {
            // Желтый фон в левой половине последнего дня
            gradientBackground = `linear-gradient(to right, ${yellowColor} 50%, transparent 50%)`;
          } else {
            // Полный желтый фон для средних дней
            backgroundColor = yellowColor;
          }
          isInMoveModeDateRange = true;
        } else {
          // Для занятых ячеек в первый и последний дни показываем желтый overlay
          if (isFirstMoveDay || isLastMoveDay) {
            shouldShowYellowOverlay = true;
            isInMoveModeDateRange = true;
          }
        }
      }

      // =======================
      // Selected order logic
      // =======================
      // ВАЖНО: Проверка выделения должна быть в самом конце для перезаписи цвета
      // НО не должна перезаписывать желтый фон для режима перемещения
      const selectedOrder = getSelectedOrder(carOrders, selectedOrderId);
      const edgeCaseFlags = getSelectedOrderEdgeCaseFlags({
        selectedOrder,
        carOrders,
        dateStr,
      });

      if (isPartOfSelectedOrder(dateStr) && !isInMoveModeDateRange) {
        // Проверяем edge-case для императивной логики
        const shouldApplyImperativeBlue = !(
          edgeCaseFlags.isStartEdgeCase || edgeCaseFlags.isEndEdgeCase
        );

        if (shouldApplyImperativeBlue) {
          backgroundColor = theme.palette.primary.main; // Синий цвет для выбранного заказа
          color = "white";
        }
      }

      if (isStartDate && !isEndDate) {
        borderRadius = "50% 0 0 50%";
        width = "50%";
        if (!isPartOfSelectedOrder(dateStr) && !isInMoveModeDateRange) {
          // Определяем цвет pending на основе my_order заказа
          // Используем toString() для корректного сравнения ObjectId и строки
          const orderForColor = carOrders?.find((order) => order._id?.toString() === startEndInfo?.orderId?.toString());
          if (orderForColor) {
            backgroundColor = getOrderColor(orderForColor).main;
            color = "common.white";
          }
        }
      }
      if (!isStartDate && isEndDate) {
        borderRadius = "0 50% 50% 0";
        width = "50%";

        // Проверяем edge-case для императивной логики (используем уже вычисленные флаги)
        const shouldApplyBlueBackground =
          isPartOfSelectedOrder(dateStr) &&
          !edgeCaseFlags.isStartEdgeCase &&
          !edgeCaseFlags.isEndEdgeCase;

        if (!shouldApplyBlueBackground && !isInMoveModeDateRange) {
          // Определяем цвет pending на основе my_order заказа
          // Используем toString() для корректного сравнения ObjectId и строки
          const orderForColor = carOrders?.find((order) => order._id?.toString() === startEndInfo?.orderId?.toString());
          if (orderForColor) {
            backgroundColor = getOrderColor(orderForColor).main;
            color = "common.white";
          }
        }
      }

      // =======================
      // Click handlers
      // =======================
      const handleDateClick = () => {
        if (wasLongPress) {
          setWasLongPress(false);
          return;
        }

        if (moveMode) {
          // Проверяем, кликнули ли мы по выбранному для перемещения заказу (синяя ячейка)
          if (selectedMoveOrder) {
            const relevantOrders = carOrders.filter((order) => {
              const rentalStart = formatDate(order.rentalStartDate, "YYYY-MM-DD");
              const rentalEnd = formatDate(order.rentalEndDate, "YYYY-MM-DD");
              return dayjs(dateStr).isBetween(
                rentalStart,
                rentalEnd,
                "day",
                "[]"
              );
            });

            // Если среди заказов на этой дате есть выбранный для перемещения заказ
            const isClickOnSelectedOrder = relevantOrders.some(
              (order) => order._id === selectedMoveOrder._id
            );

            if (isClickOnSelectedOrder) {
              // Выходим из режима перемещения
              if (onExitMoveMode) {
                onExitMoveMode();
              }
              return;
            }
          }
          // Если кликнули не на выбранный заказ (синюю ячейку), блокируем клик
          return;
        }

        const relevantOrders = carOrders.filter((order) => {
          const rentalStart = formatDate(order.rentalStartDate, "YYYY-MM-DD");
          const rentalEnd = formatDate(order.rentalEndDate, "YYYY-MM-DD");
          return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
        });

        // Блокируем клик по ячейке, в которой последний день заказа, если дата в прошлом
        // НО не блокируем если это одновременно первый день другого заказа (isStartDate)
        if (isPastDay && isEndDate && !isStartDate) {
          return;
        }

        // 1. Если одновременно последний и первый день заказа
        if (isEndDate && isStartDate) {
          setSelectedOrders(relevantOrders);
          setOpen(true);
          return;
        }

        // 2. Если последний день заказа и НЕ первый день нового заказа
        if (isEndDate && !isStartDate) {
          // Проверка на конфликтные заказы
          if (relevantOrders.length > 1) {
            // Конфликт: открываем окно редактирования заказов
            setSelectedOrders(relevantOrders);
            setOpen(true);
            return;
          }
          // Нет конфликта: создаём новый заказ
          if (onAddOrderClick) {
            onAddOrderClick(car, dateStr);
          }
          return;
        }

        // 3. Обычная логика для остальных случаев
        if (relevantOrders.length > 0) {
          setSelectedOrders(relevantOrders);
          setOpen(true);
        }
      };

      const isCellEmpty =
        !isConfirmed &&
        !isUnavailable &&
        !isOverlapDate &&
        !isStartEndOverlap &&
        !isStartDate &&
        !isEndDate;

      // ИСПРАВЛЕННАЯ функция обработки клика по пустой ячейке
      const handleEmptyCellClick = () => {
        console.log("Empty cell click - moveMode:", moveMode, "car:", car);

        // Блокируем клик по пустой ячейке, если дата в прошлом
        if (isPastDay) {
          return;
        }

        // Если в режиме перемещения
        if (moveMode) {
          // Проверяем, что это желтая ячейка (совместимый автомобиль и дата в диапазоне)
          const isInYellowRange =
            selectedOrderDates &&
            selectedOrderDates.includes(dateStr) &&
            isCarCompatibleForMove;

          if (!isInYellowRange) {
            // Если это не желтая ячейка, блокируем клик
            return;
          }

          console.log("=== Режим перемещения активен ===");
          console.log("Выбранный заказ для перемещения:", selectedMoveOrder);
          console.log("Целевой автомобиль:", {
            id: car._id,
            number: car.carNumber,
            model: car.model,
          });

          // Проверяем, что есть заказ для перемещения
          if (!selectedMoveOrder) {
            console.error("Ошибка: не выбран заказ для перемещения");
            return;
          }

          // Проверяем, что не пытаемся переместить на тот же автомобиль
          if (selectedMoveOrder.car === car._id) {
            console.log("Попытка переместить на тот же автомобиль");
            return;
          }

          // Проверка на конфликт времени
          const ordersAtTargetCar = ordersByCarId(car._id);
          // Используем бизнес-таймзону для корректного сравнения дат
          const start = dayjs(selectedMoveOrder.rentalStartDate).tz(BUSINESS_TZ);
          const end = dayjs(selectedMoveOrder.rentalEndDate).tz(BUSINESS_TZ);

          const conflict = ordersAtTargetCar.some((order) => {
            // Используем бизнес-таймзону для корректного сравнения
            const otherStart = dayjs(order.rentalStartDate).tz(BUSINESS_TZ);
            const otherEnd = dayjs(order.rentalEndDate).tz(BUSINESS_TZ);

            const overlap =
              (start.isBefore(otherEnd) && end.isAfter(otherStart)) ||
              start.isSame(otherStart) ||
              end.isSame(otherEnd);

            return overlap && order._id !== selectedMoveOrder._id;
          });

          if (conflict) {
            enqueueSnackbar("⛔ Перемещение отменено: конфликт по времени", {
              variant: "error",
            });
            return;
          }

          // Вызываем функцию выбора автомобиля для перемещения
          if (onCarSelectForMove) {
            onCarSelectForMove({
              _id: car._id,
              carNumber: car.carNumber,
              model: car.model,
              regNumber: car.regNumber,
            });
          }
          return;
        }

        // Обычный режим - создание нового заказа
        if (onAddOrderClick) {
          console.log("Создание нового заказа на", {
            car: car._id,
            date: dateStr,
          });
          onAddOrderClick(car, dateStr);
        }
      };

      // =======================
      // Render decision
      // =======================

      // ─────────────────────────────────────────────
      // CASE 1: Empty cell (нет заказов на эту дату)
      // ─────────────────────────────────────────────
      if (isCellEmpty) {
        // Первый день диапазона перемещения - правый желтый полукруг
        if (isFirstMoveDay && isCarCompatibleForMove) {
          return (
            <Box
              onClick={handleEmptyCellClick}
              onMouseDown={() => handleLongPressStart(dateStr)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onContextMenu={(e) => e.preventDefault()}
              title="Нажмите для перемещения заказа"
              sx={{
                border: border,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <Box sx={{ width: "50%", height: "100%" }}></Box>
              <Box
                sx={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: MOVE_MODE_COLORS.YELLOW_SOLID, // ⚠️ ЗАФИКСИРОВАНО: из config/orderColors.js
                  borderRadius: "50% 0 0 50%",
                }}
              ></Box>
            </Box>
          );
        }

        // Если это последний день диапазона перемещения - левый желтый полукруг только для совместимых автомобилей
        if (isLastMoveDay && isCarCompatibleForMove) {
          return (
            <Box
              onClick={handleEmptyCellClick}
              onMouseDown={() => handleLongPressStart(dateStr)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onContextMenu={(e) => e.preventDefault()}
              title="Нажмите для перемещения заказа"
              sx={{
                border: border,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: MOVE_MODE_COLORS.YELLOW_SOLID, // ⚠️ ЗАФИКСИРОВАНО: из config/orderColors.js
                  borderRadius: "0 50% 50% 0",
                }}
              ></Box>
              <Box sx={{ width: "50%", height: "100%" }}></Box>
            </Box>
          );
        }

        return (
          <Box
            onClick={handleEmptyCellClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              moveMode && isInMoveModeDateRange
                ? "Нажмите для перемещения заказа"
                : !moveMode
                ? isPastDay
                  ? "Дата в прошлом — клик недоступен"
                  : "Нажмите для создания нового заказа"
                : undefined
            }
            sx={{
              position: "relative",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: gradientBackground || undefined,
              backgroundColor: !gradientBackground
                ? backgroundColor.startsWith("#")
                  ? backgroundColor
                  : backgroundColor
                : undefined,
              borderRadius,
              color,
              cursor:
                moveMode && !isInMoveModeDateRange
                  ? "not-allowed"
                  : isPastDay
                  ? "not-allowed"
                  : "pointer",
              border: border,
              width: "100%",
            }}
          ></Box>
        );
      }

      // ─────────────────────────────────────────────
      // CASE 2: Overlap date (несколько заказов на одну дату)
      // ─────────────────────────────────────────────
      if (isOverlapDate && !isStartEndOverlap) {
        const circlesPending = isOverlapDateInfo.pending || 0;
        const circlesConfirmed = isOverlapDateInfo.confirmed || 0;

        // Определяем цвет фона для overlap даты на основе заказов
        let overlapBackgroundColor = "transparent"; // по умолчанию
        if (!isPartOfSelectedOrder(dateStr)) {
          // Приоритет: confirmed > pending
          if (circlesConfirmed > 0) {
            // Есть confirmed заказы - берем первый confirmed заказ
            const confirmedOrder = ordersForDate?.find(
              (order) => order.confirmed
            );
            if (confirmedOrder) {
              overlapBackgroundColor = getOrderColor(confirmedOrder).main;
            }
          } else if (circlesPending > 0) {
            // Только pending заказы - проверяем есть ли клиентские
            const pendingOrder = ordersForDate?.find(
              (order) => !order.confirmed
            );
            if (pendingOrder) {
              overlapBackgroundColor = getOrderColor(pendingOrder).main;
            }
          }
        }

        return (
          <Box
            onClick={handleDateClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              moveMode
                ? isPartOfSelectedOrder(dateStr)
                  ? "Нажмите для выхода из режима перемещения"
                  : undefined
                : isCompletedCell
                ? "Нажмите для просмотра заказа"
                : isPastDay && isEndDate && !isStartDate
                ? "Дата в прошлом — клик недоступен"
                : "Длинное нажатие для режима перемещения заказа, обычный клик для просмотра всех заказов"
            }
            sx={{
              border: border,
              position: "relative",
              height: "120%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isPartOfSelectedOrder(dateStr)
                ? "common.white"
                : (() => {
                    // Находим заказ для этой даты
                    const orderForDate = ordersForDate?.[0];
                    return orderForDate && orderForDate.confirmed
                      ? getOrderColor(orderForDate).main
                      : "text.primary";
                  })(),
              backgroundColor: isPartOfSelectedOrder(dateStr)
                ? theme.palette.primary.main
                : overlapBackgroundColor,
              cursor:
                isPastDay && isEndDate && !isStartDate
                  ? "not-allowed"
                  : "pointer",
              width: "100%",
            }}
          >
            {/* Желтый overlay для первого/последнего дня перемещения */}
            {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}

            <Box
              sx={{
                position: "absolute",
                top: 2,
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              {Array.from({ length: circlesConfirmed }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6,
                    height: 6,
                    backgroundColor: theme.palette.neutral?.black || "#000",
                    borderRadius: "50%",
                    border: (() => {
                      const confirmedOrder = ordersForDate?.find((o) => o.confirmed);
                      return confirmedOrder
                        ? `1px solid ${getOrderColor(confirmedOrder).main}`
                        : "1px solid transparent";
                    })(),
                  }}
                />
              ))}
            </Box>
            <Box
              sx={{
                position: "absolute",
                top: 2,
                display: "flex",
                gap: 1,
                justifyContent: "center",
                width: "100%",
              }}
            >
              {Array.from({ length: circlesPending }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6,
                    height: 6,
                    backgroundColor: theme.palette.neutral?.black || "#000",
                    borderRadius: "50%",
                    border: (() => {
                      const confirmedOrder = ordersForDate?.find((o) => o.confirmed);
                      return confirmedOrder
                        ? `1px solid ${getOrderColor(confirmedOrder).main}`
                        : "1px solid transparent";
                    })(),
                  }}
                />
              ))}
            </Box>
          </Box>
        );
      }

      // ─────────────────────────────────────────────
      // CASE 3: Start+End overlap (конец одного + начало другого заказа)
      // ─────────────────────────────────────────────
      if (isStartEndOverlap) {
        // Проверяем edge-case для overlap случая
        let shouldHighlightLeft = false;
        let shouldHighlightRight = false;

        // Проверяем, является ли это первым или последним днем диапазона перемещения
        const isFirstMoveDay =
          moveMode && selectedOrderDates && selectedOrderDates[0] === dateStr;
        const isLastMoveDay =
          moveMode &&
          selectedOrderDates &&
          selectedOrderDates[selectedOrderDates.length - 1] === dateStr;
        // Для первого и последнего дня показываем желтый полукруг только для совместимых автомобилей
        const shouldShowFirstMoveDay = isFirstMoveDay && isCarCompatibleForMove;
        const shouldShowLastMoveDay = isLastMoveDay && isCarCompatibleForMove;

        if (selectedOrderId) {
          const selectedOrder = carOrders.find(
            (o) => o._id === selectedOrderId
          );
          if (selectedOrder) {
            // Логирование для отладки
            const selectedOrderStart = dayjs(
              selectedOrder.rentalStartDate
            ).format("YYYY-MM-DD");
            const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
              "YYYY-MM-DD"
            );

            const previousOrder = carOrders.find((o) => {
              const rentalEnd = dayjs(o.rentalEndDate).format("YYYY-MM-DD");
              return rentalEnd === dateStr && o._id !== selectedOrderId;
            });

            const nextOrder = carOrders.find((o) => {
              const rentalStart = dayjs(o.rentalStartDate).format("YYYY-MM-DD");
              return rentalStart === dateStr && o._id !== selectedOrderId;
            });

            // Если это edge-case (первый день выбранного заказа + есть предыдущий заказ)
            if (selectedOrderStart === dateStr && previousOrder) {
              shouldHighlightLeft = false; // не подсвечивать левую половину (предыдущий заказ)
              shouldHighlightRight = true; // подсвечивать правую половину (выбранный заказ)
            }
            // Если это edge-case (последний день выбранного заказа + есть следующий заказ)
            else if (selectedOrderEnd === dateStr && nextOrder) {
              shouldHighlightLeft = true; // подсвечивать левую половину (выбранный заказ)
              shouldHighlightRight = false; // не подсвечивать правую половину (следующий заказ)
            } else if (isPartOfSelectedOrder(dateStr)) {
              shouldHighlightLeft = true; // обычная подсветка
              shouldHighlightRight = true; // обычная подсветка
            }
          }
        } else if (isPartOfSelectedOrder(dateStr)) {
          shouldHighlightLeft = true; // обычная подсветка
          shouldHighlightRight = true; // обычная подсветка
        }

        const isActiveInMoveMode =
          shouldShowFirstMoveDay ||
          shouldShowLastMoveDay ||
          isPartOfSelectedOrder(dateStr);

        return (
          <Box
            onClick={handleDateClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              moveMode
                ? shouldShowFirstMoveDay || shouldShowLastMoveDay
                  ? "Нажмите для перемещения заказа"
                  : isPartOfSelectedOrder(dateStr)
                  ? "Нажмите для выхода из режима перемещения"
                  : undefined
                : isCompletedCell
                ? "Нажмите для просмотра заказа"
                : isPastDay && isEndDate && !isStartDate
                ? "Дата в прошлом — клик недоступен"
                : "Длинное нажатие для режима перемещения заказа, обычный клик для просмотра и редактирования заказов"
            }
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor:
                isPastDay && isEndDate && !isStartDate
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {/* Желтый overlay для первого/последнего дня перемещения */}
            {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}

            <Box
              sx={{
                width: "50%",
                height: "100%",
                backgroundColor: shouldShowLastMoveDay
                  ? "#ffeb3b" // Явный желтый цвет для режима перемещения
                  : shouldHighlightLeft
                  ? theme.palette.primary.main
                  : isStartAndEndDateOverlapInfo.endConfirmed
                  ? (() => {
                      // Ищем только заказ, который заканчивается в этот день
                      const endingOrder = carOrders.find(
                        (order) =>
                          formatDate(order.rentalEndDate, "YYYY-MM-DD") ===
                            dateStr && order.confirmed === true
                      );
                      // my_order=true → клиентский (красный), my_order=false → внутренний (янтарный)
                      return endingOrder
                        ? getOrderColor(endingOrder).main
                        : "transparent";
                    })()
                  : (() => {
                      // Для pending заказа — ищем заказ, который заканчивается в этот день И не подтверждён
                      const endingPendingOrder = carOrders.find(
                        (order) =>
                          formatDate(order.rentalEndDate, "YYYY-MM-DD") === dateStr &&
                          !order.confirmed
                      );
                      return endingPendingOrder
                        ? getOrderColor(endingPendingOrder).main
                        : "transparent";
                    })(),
                borderRadius: "0 50% 50% 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                backgroundColor: shouldShowFirstMoveDay
                  ? "#ffeb3b" // Явный желтый цвет для режима перемещения
                  : shouldHighlightRight
                  ? theme.palette.primary.main
                  : isStartAndEndDateOverlapInfo.startConfirmed
                  ? (() => {
                      // Ищем только заказ, который начинается в этот день
                      const startingOrder = carOrders.find(
                        (order) =>
                          formatDate(order.rentalStartDate, "YYYY-MM-DD") ===
                            dateStr && order.confirmed === true
                      );
                      return startingOrder
                        ? getOrderColor(startingOrder).main
                        : "transparent";
                    })()
                  : (() => {
                      // Для pending заказа — ищем заказ, который начинается в этот день И не подтверждён
                      const startingPendingOrder = carOrders.find(
                        (order) =>
                          formatDate(order.rentalStartDate, "YYYY-MM-DD") === dateStr &&
                          !order.confirmed
                      );
                      return startingPendingOrder
                        ? getOrderColor(startingPendingOrder).main
                        : "transparent";
                    })(),
                borderRadius: "50% 0 0 50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
          </Box>
        );
      }

      // ─────────────────────────────────────────────
      // CASE 4: Start date only (первый день заказа)
      // ─────────────────────────────────────────────
      if (isStartDate && !isEndDate && !isOverlapDate) {
        // Проверяем edge-case для первого дня заказа
        let shouldHighlightRight = false;

        // Проверяем, является ли это первым днем диапазона перемещения
        const isFirstMoveDay =
          moveMode && selectedOrderDates && selectedOrderDates[0] === dateStr;
        // Для первого дня показываем желтый полукруг только для совместимых автомобилей
        const shouldShowFirstMoveDay = isFirstMoveDay && isCarCompatibleForMove;

        if (selectedOrderId) {
          const selectedOrder = carOrders.find(
            (o) => o._id === selectedOrderId
          );
          if (selectedOrder) {
            const selectedOrderStart = dayjs(
              selectedOrder.rentalStartDate
            ).format("YYYY-MM-DD");
            const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
              "YYYY-MM-DD"
            );

            const previousOrder = carOrders.find((o) => {
              const rentalEnd = dayjs(o.rentalEndDate).format("YYYY-MM-DD");
              return rentalEnd === dateStr && o._id !== selectedOrderId;
            });

            const nextOrder = carOrders.find((o) => {
              const rentalStart = dayjs(o.rentalStartDate).format("YYYY-MM-DD");
              return rentalStart === dateStr && o._id !== selectedOrderId;
            });

            // Если это edge-case (первый день выбранного заказа + есть предыдущий заказ)
            if (selectedOrderStart === dateStr && previousOrder) {
              shouldHighlightRight = true; // подсвечивать правую половину (выбранный заказ)
            }
            // Если это edge-case (последний день выбранного заказа + есть следующий заказ)
            else if (selectedOrderEnd === dateStr && nextOrder) {
              shouldHighlightRight = false; // не подсвечивать правую половину (следующий заказ)
            } else if (isPartOfSelectedOrder(dateStr)) {
              shouldHighlightRight = true; // обычная подсветка
            }
          }
        } else if (isPartOfSelectedOrder(dateStr)) {
          shouldHighlightRight = true; // обычная подсветка
        }

        const isActiveInMoveMode =
          shouldShowFirstMoveDay || shouldHighlightRight;

        return (
          <Box
            onClick={handleDateClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              moveMode
                ? shouldShowFirstMoveDay
                  ? "Нажмите для перемещения заказа в первый день"
                  : shouldHighlightRight
                  ? "Нажмите для выхода из режима перемещения"
                  : undefined
                : isCompletedCell
                ? "Нажмите для просмотра заказа"
                : "Длинное нажатие для режима перемещения, обычный клик для просмотра и редактирования заказа"
            }
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor:
                moveMode && !isActiveInMoveMode ? "not-allowed" : "pointer",
            }}
          >
            {/* Желтый overlay для первого/последнего дня перемещения */}
            {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}

            <Box
              sx={{
                width: "50%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "50% 0 0 50%",
                backgroundColor: shouldShowFirstMoveDay
                  ? "#ffeb3b" // Явный желтый цвет для режима перемещения
                  : shouldHighlightRight
                  ? theme.palette.primary.main
                  : startEndInfo.confirmed
                  ? (() => {
                      // Получаем заказ для startEndInfo
                      const orderForStartEnd = carOrders?.find(
                        (order) => order._id?.toString() === startEndInfo.orderId?.toString()
                      );
                      return orderForStartEnd
                        ? getOrderColor(orderForStartEnd).main
                        : "transparent";
                    })()
                  : (() => {
                      // Для pending — используем my_order из startEndInfo
                      const orderForStartEnd = carOrders?.find(
                        (order) => order._id?.toString() === startEndInfo.orderId?.toString()
                      );
                      return orderForStartEnd
                        ? getOrderColor(orderForStartEnd).main
                        : "transparent";
                    })(),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
          </Box>
        );
      }

      // ─────────────────────────────────────────────
      // CASE 5: End date only (последний день заказа)
      // ─────────────────────────────────────────────
      if (!isStartDate && isEndDate) {
        // Проверяем edge-case: если выбранный заказ начинается или заканчивается в этот день
        let shouldHighlightLeft = false;
        let shouldHighlightRight = false;

        // Проверяем, является ли это последним днем диапазона перемещения
        const isLastMoveDay =
          moveMode &&
          selectedOrderDates &&
          selectedOrderDates[selectedOrderDates.length - 1] === dateStr;
        // Для последнего дня показываем желтый полукруг только для совместимых автомобилей
        const shouldShowLastMoveDay = isLastMoveDay && isCarCompatibleForMove;

        if (selectedOrderId) {
          const selectedOrder = carOrders.find(
            (o) => o._id === selectedOrderId
          );
          if (selectedOrder) {
            const selectedOrderStart = dayjs(
              selectedOrder.rentalStartDate
            ).format("YYYY-MM-DD");
            const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
              "YYYY-MM-DD"
            );

            // Ищем предыдущий заказ, который заканчивается в этот день
            const previousOrder = carOrders.find((o) => {
              const rentalEnd = dayjs(o.rentalEndDate).format("YYYY-MM-DD");
              return rentalEnd === dateStr && o._id !== selectedOrderId;
            });

            // Ищем следующий заказ, который начинается в этот день
            const nextOrder = carOrders.find((o) => {
              const rentalStart = dayjs(o.rentalStartDate).format("YYYY-MM-DD");
              return rentalStart === dateStr && o._id !== selectedOrderId;
            });

            // Если выбранный заказ начинается в этот день И есть предыдущий заказ (edge-case)
            if (selectedOrderStart === dateStr && previousOrder) {
              shouldHighlightLeft = false; // не подсвечивать левую половину (предыдущий заказ)
              shouldHighlightRight = true; // подсвечивать правую половину (выбранный заказ)
            }
            // Если выбранный заказ заканчивается в этот день И есть следующий заказ (edge-case)
            else if (selectedOrderEnd === dateStr && nextOrder) {
              shouldHighlightLeft = true; // подсвечивать левую половину (выбранный заказ)
              shouldHighlightRight = false; // не подсвечивать правую половину (следующий заказ)
            } else if (isPartOfSelectedOrder(dateStr)) {
              shouldHighlightLeft = true; // обычная подсветка
            }
          }
        } else if (isPartOfSelectedOrder(dateStr)) {
          shouldHighlightLeft = true; // обычная подсветка
        }

        const isActiveInMoveMode =
          shouldShowLastMoveDay || shouldHighlightLeft || shouldHighlightRight;

        return (
          <Box
            onClick={handleDateClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              moveMode
                ? shouldShowLastMoveDay
                  ? "Нажмите для перемещения заказа в последний день"
                  : shouldHighlightLeft || shouldHighlightRight
                  ? "Нажмите для выхода из режима перемещения"
                  : undefined
                : isCompletedCell
                ? "Нажмите для просмотра заказа"
                : isPastDay
                ? "Дата в прошлом — клик недоступен"
                : "Длинное нажатие для режима перемещения, обычный клик для просмотра и редактирования заказа"
            }
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor: isPastDay
                ? "not-allowed"
                : moveMode && !isActiveInMoveMode
                ? "not-allowed"
                : "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Желтый overlay для первого/последнего дня перемещения */}
            {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}

            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "0 50% 50% 0",
                backgroundColor: shouldShowLastMoveDay
                  ? "#ffeb3b" // Явный желтый цвет для режима перемещения
                  : shouldHighlightLeft
                  ? theme.palette.primary.main
                  : startEndInfo.confirmed
                  ? (() => {
                      // Получаем заказ для startEndInfo
                      const orderForStartEnd = carOrders?.find(
                        (order) => order._id?.toString() === startEndInfo.orderId?.toString()
                      );
                      return orderForStartEnd
                        ? getOrderColor(orderForStartEnd).main
                        : "transparent";
                    })()
                  : (() => {
                      // Для pending — используем my_order из startEndInfo
                      const orderForStartEnd = carOrders?.find(
                        (order) => order._id?.toString() === startEndInfo.orderId?.toString()
                      );
                      return orderForStartEnd
                        ? getOrderColor(orderForStartEnd).main
                        : "transparent";
                    })(),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: shouldHighlightRight ? "50% 0 0 50%" : undefined,
                backgroundColor: shouldHighlightRight ? theme.palette.primary.main : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: shouldHighlightRight ? "white" : undefined,
              }}
            ></Box>
          </Box>
        );
      }

      // ─────────────────────────────────────────────
      // CASE 6: Yellow overlay for move mode (жёлтый overlay на занятых ячейках)
      // ─────────────────────────────────────────────
      if (
        moveMode &&
        selectedOrderDates &&
        isCarCompatibleForMove &&
        (selectedOrderDates[0] === dateStr ||
          selectedOrderDates[selectedOrderDates.length - 1] === dateStr)
      ) {
        const isFirstMoveDay = selectedOrderDates[0] === dateStr;
        const isLastMoveDay =
          selectedOrderDates[selectedOrderDates.length - 1] === dateStr;

        // Логгирование для контроля
        console.log(
          `[BigCalendar][MOVE] Желтый overlay: ${
            isFirstMoveDay ? "первый день" : "последний день"
          } для авто ${car.model} (${car.regNumber}), дата: ${dateStr}`
        );

        return (
          <Box
            onClick={handleEmptyCellClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title="Нажмите для перемещения заказа"
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor: "pointer",
              overflow: "hidden",
            }}
          >
            {isLastMoveDay && (
              <Box
                sx={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: MOVE_MODE_COLORS.YELLOW_SOLID, // ⚠️ ЗАФИКСИРОВАНО: из config/orderColors.js
                  borderRadius: "0 50% 50% 0",
                  position: "absolute",
                  left: 0,
                  top: 0,
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            )}
            {isFirstMoveDay && (
              <Box
                sx={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: MOVE_MODE_COLORS.YELLOW_SOLID, // ⚠️ ЗАФИКСИРОВАНО: из config/orderColors.js
                  borderRadius: "50% 0 0 50%",
                  position: "absolute",
                  right: 0,
                  top: 0,
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            )}
            {/* Содержимое ячейки под overlay */}
            <Box sx={{ width: "100%", height: "100%" }}>
              {/* Можно оставить стандартную логику отображения заказа, если нужно */}
            </Box>
          </Box>
        );
      }

      // ─────────────────────────────────────────────
      // CASE 7: Default cell (обычная занятая ячейка)
      // ─────────────────────────────────────────────
      return (
        <Box
          onClick={handleDateClick}
          onMouseDown={() => handleLongPressStart(dateStr)}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onContextMenu={(e) => e.preventDefault()}
          title={
            moveMode
              ? isPartOfSelectedOrder(dateStr)
                ? "Нажмите для выхода из режима перемещения"
                : undefined
              : isCompletedCell
              ? "Нажмите для просмотра заказа"
              : "Длинное нажатие для режима перемещения, обычный клик для просмотра и редактирования заказа"
          }
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: gradientBackground
              ? undefined
              : backgroundColor.startsWith("#")
              ? backgroundColor
              : backgroundColor,
            background: gradientBackground || undefined,
            borderRadius,
            color,
            cursor:
              moveMode && !isPartOfSelectedOrder(dateStr)
                ? "not-allowed"
                : "pointer",
            border: border,
            width: "100%",
          }}
        >
          {/* Желтый overlay для первого/последнего дня перемещения */}
          {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}
        </Box>
      );
    },
    [
      confirmedDates,
      unavailableDates,
      overlapDates,
      startEndDates,
      startEndOverlapDates,
      carOrders,
      setOpen,
      setSelectedOrders,
      onAddOrderClick,
      onLongPress,
      car,
      pressTimer,
      isLastDateForOrder,
      hasOrder,
      selectedOrderId,
      isPartOfSelectedOrder,
      getOrderByDate,
      moveMode,
      selectedMoveOrder,
      onCarSelectForMove,
      wasLongPress,
      onExitMoveMode,
      selectedOrderDates,
      isCarCompatibleForMove,
    ]
  );

  return (
    <>
      {days.map((day, colIndex) => (
        <TableCell
          key={day.dayjs.toString()}
          data-col-index={colIndex}
          sx={{ padding: 0 }}
        >
          <Box
            className="bigcalendar-cell-wrapper"
            sx={{
              width: "100%",
              // Адаптивная высота ячеек — row height определяется этим значением
              height: { xs: "28px", sm: "36px", md: "44px", lg: "50px" },
              minHeight: { xs: "28px", sm: "36px", md: "44px", lg: "50px" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onMouseEnter={() => {
              document
                .querySelector(".bigcalendar-root")
                ?.setAttribute("data-hover-col", colIndex);
            }}
            onMouseLeave={() => {
              document
                .querySelector(".bigcalendar-root")
                ?.removeAttribute("data-hover-col");
            }}
          >
            {renderDateCell(day.dayjs)}
          </Box>
        </TableCell>
      ))}
    </>
  );
}

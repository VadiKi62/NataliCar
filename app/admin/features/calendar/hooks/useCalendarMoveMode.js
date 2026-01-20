"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { BUSINESS_TZ } from "@utils/businessTime";
import { buildOrderDateRange } from "./calendarDays";
import { moveOrderToCar } from "@utils/action";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Hook for managing calendar move mode state and logic
 * 
 * @param {Object} params
 * @param {Array} params.cars - Array of car objects
 * @param {Function} params.ordersByCarId - Function to get orders by car ID
 * @param {Function} params.fetchAndUpdateOrders - Function to refresh orders
 * @param {Function} params.showSingleSnackbar - Function to show snackbar messages
 * @returns {Object} Move mode state and handlers
 */
export function useCalendarMoveMode({
  cars,
  ordersByCarId,
  fetchAndUpdateOrders,
  showSingleSnackbar,
}) {
  // =======================
  // 🚚 Move order mode state
  // =======================
  const [moveMode, setMoveMode] = useState(false);
  const [selectedMoveOrder, setSelectedMoveOrder] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    newCar: null,
    oldCar: null,
  });

  // =======================
  // 📊 Derived state
  // =======================
  // Генерируем массив дат для выбранного заказа в режиме перемещения
  const selectedOrderDates = useMemo(() => {
    if (!moveMode || !selectedMoveOrder) return [];
    return buildOrderDateRange(selectedMoveOrder);
  }, [moveMode, selectedMoveOrder]);

  // Функция проверки совместимости автомобиля для перемещения
  const isCarCompatibleForMove = useCallback(
    (carId) => {
      if (!moveMode || !selectedMoveOrder) return true;

      // Исключаем автомобиль с текущим заказом
      if (selectedMoveOrder.car === carId) return false;

      // Получаем заказы целевого автомобиля
      const carOrders = ordersByCarId(carId);

      // Проверяем конфликты по времени (используем бизнес-таймзону)
      const start = dayjs(selectedMoveOrder.rentalStartDate).tz(BUSINESS_TZ);
      const end = dayjs(selectedMoveOrder.rentalEndDate).tz(BUSINESS_TZ);

      const hasConflict = carOrders.some((order) => {
        if (order._id === selectedMoveOrder._id) return false; // Исключаем сам перемещаемый заказ

        const orderStart = dayjs(order.rentalStartDate).tz(BUSINESS_TZ);
        const orderEnd = dayjs(order.rentalEndDate).tz(BUSINESS_TZ);

        // Проверяем пересечение периодов
        return orderStart.isSameOrBefore(end) && orderEnd.isSameOrAfter(start);
      });

      return !hasConflict;
    },
    [moveMode, selectedMoveOrder, ordersByCarId]
  );

  // =======================
  // 🎮 Handlers
  // =======================
  const handleLongPress = useCallback(
    (order) => {
      if (!order?._id) return;
      setSelectedMoveOrder(order);
      setMoveMode(true);
      showSingleSnackbar(
        "Выберите другой автомобиль для перемещения заказа. Доступные автомобили выделены желтым цветом",
        { variant: "info", autoHideDuration: 8000 }
      );
    },
    [showSingleSnackbar]
  );

  const handleCarSelectForMove = useCallback(
    (selectedCar) => {
      if (!moveMode || !selectedMoveOrder) return;

      // Находим информацию о старом автомобиле
      const oldCar = cars.find((car) => car._id === selectedMoveOrder.car);

      // Показываем модальное окно подтверждения с правильными данными
      setConfirmModal({
        open: true,
        newCar: selectedCar,
        oldCar: oldCar, // Добавляем информацию о старом автомобиле
      });
    },
    [moveMode, selectedMoveOrder, cars]
  );

  const exitMoveMode = useCallback(() => {
    setMoveMode(false);
    setSelectedMoveOrder(null);
    showSingleSnackbar("Режим перемещения отключён", { variant: "info" });
  }, [showSingleSnackbar]);

  // =======================
  // 🎹 ESC key listener для выхода из режима перемещения
  // =======================
  useEffect(() => {
    if (!moveMode) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exitMoveMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moveMode, exitMoveMode]);

  // =======================
  // 🔄 Confirm modal handlers
  // =======================
  const handleConfirmMove = useCallback(async () => {
    // 🔧 FIX: Capture values BEFORE clearing state
    const newCar = confirmModal.newCar;
    const order = selectedMoveOrder;

    // Defensive guards
    if (!newCar?._id || !order?._id) {
      showSingleSnackbar("❌ Нет данных для перемещения", { variant: "error" });
      exitMoveMode();
      setConfirmModal({ open: false, newCar: null, oldCar: null });
      return;
    }

    // Close modal after capturing values
    setConfirmModal({ open: false, newCar: null, oldCar: null });

    // Debug logs (dev-friendly)
    if (process.env.NODE_ENV === "development") {
      console.log("[MOVE] newCar:", newCar);
      console.log("[MOVE] order:", order);
    }

    try {
      // Use dedicated moveCar endpoint (allows ADMIN and SUPERADMIN)
      const result = await moveOrderToCar(order._id, newCar._id, newCar.carNumber);

      if (result?.status === 201 || result?.status === 202) {
        await fetchAndUpdateOrders();
        const conflictMsg =
          result.conflicts?.length > 0
            ? " (есть конфликты с неподтвержденными заказами)"
            : "";
        showSingleSnackbar(`Заказ сдвинут на ${newCar.model}${conflictMsg}`, {
          variant: "success",
        });
      } else if (result?.status === 409) {
        // Blocking conflict
        showSingleSnackbar(
          result.message ||
            "Конфликт с подтвержденными заказами. Перемещение невозможно.",
          { variant: "error", autoHideDuration: 5000 }
        );
      } else {
        showSingleSnackbar(
          result.message || "Ошибка перемещения заказа",
          { variant: "error" }
        );
      }
    } catch (error) {
      showSingleSnackbar(`Ошибка перемещения: ${error.message}`, {
        variant: "error",
      });
    } finally {
      // Всегда выходим из режима перемещения после операции
      exitMoveMode();
    }
  }, [confirmModal, selectedMoveOrder, fetchAndUpdateOrders, showSingleSnackbar, exitMoveMode]);

  const handleCloseConfirmModal = useCallback(() => {
    setConfirmModal({ open: false, newCar: null, oldCar: null });
    exitMoveMode();
  }, [exitMoveMode]);

  // orderToMove is an alias of selectedMoveOrder
  // kept to preserve existing component contracts (CarTableRow)
  const orderToMove = selectedMoveOrder;

  return {
    // State
    moveMode,
    selectedMoveOrder,
    orderToMove, // alias
    confirmModal,
    // Computed
    selectedOrderDates,
    isCarCompatibleForMove,
    // Handlers
    handleLongPress,
    handleCarSelectForMove,
    exitMoveMode,
    handleConfirmMove,
    handleCloseConfirmModal,
  };
}

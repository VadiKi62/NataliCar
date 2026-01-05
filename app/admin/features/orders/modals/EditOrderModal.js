// Хук для получения количества дней и стоимости аренды через API (как в AddOrderModal)
function useDaysAndTotal(
  car,
  rentalStartDate,
  rentalEndDate,
  insurance,
  childSeats
) {
  const [daysAndTotal, setDaysAndTotal] = React.useState({
    days: 0,
    totalPrice: 0,
  });
  const [calcLoading, setCalcLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchTotalPrice = async () => {
      if (!car?.carNumber || !rentalStartDate || !rentalEndDate) {
        setDaysAndTotal({ days: 0, totalPrice: 0 });
        return;
      }
      setCalcLoading(true);
      try {
        const res = await fetch("/api/order/calcTotalPrice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carNumber: car.carNumber,
            rentalStartDate,
            rentalEndDate,
            kacko: insurance,
            childSeats: childSeats,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setDaysAndTotal({ days: data.days, totalPrice: data.totalPrice });
        } else {
          setDaysAndTotal({ days: 0, totalPrice: 0 });
        }
      } catch {
        setDaysAndTotal({ days: 0, totalPrice: 0 });
      } finally {
        setCalcLoading(false);
      }
    };
    fetchTotalPrice();
  }, [car?.carNumber, rentalStartDate, rentalEndDate, insurance, childSeats]);

  return { daysAndTotal, calcLoading };
}
import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  useTheme,
} from "@mui/material";
import { ConfirmButton, CancelButton, DeleteButton, ActionButton } from "@/app/components/ui";
import { RenderTextField } from "@/app/components/ui/inputs/Fields";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import Snackbar from "@/app/components/ui/feedback/Snackbar";
import { useMainContext } from "@app/Context";
import TimePicker from "@/app/components/calendar-ui/MuiTimePicker";
import { companyData } from "@utils/companyData";
import { useEditOrderConflicts } from "../hooks/useEditOrderConflicts";
// 🎯 Athens timezone utilities — ЕДИНСТВЕННЫЙ источник правды для времени
import {
  ATHENS_TZ,
  fromServerUTC,
  createAthensDateTime,
  toServerUTC,
  formatTimeHHMM,
  formatDateYYYYMMDD,
} from "@/domain/time/athensTime";
// 🎯 Утилита для проверки возможности подтверждения заказа
import { canPendingOrderBeConfirmed } from "@/domain/booking/analyzeConfirmationConflicts";
// 🎯 Модальное окно настройки буфера
import BufferSettingsModal from "@/app/admin/features/settings/BufferSettingsModal";
import { ORDER_COLORS } from "@/config/orderColors";

import {
  changeRentalDates,
  toggleConfirmedStatus,
  updateCustomerInfo,
  getConfirmedOrders,
} from "@utils/action";
import { RenderSelectField } from "@/app/components/ui/inputs/Fields";
import { useTranslation } from "react-i18next";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ⚠️ УДАЛЁН: timeZone константа и dayjs.tz.setDefault()
// Теперь используем athensTime.js для всей работы с таймзонами

const EditOrderModal = ({
  open,
  onClose,
  order,
  onSave,
  setCarOrders,
  isConflictOrder,
  setIsConflictOrder,
  startEndDates,
  cars, // <-- список автомобилей
  isViewOnly, // <-- режим просмотра (передаётся из BigCalendar для завершённых заказов)
}) => {
  const { allOrders, fetchAndUpdateOrders, company, pendingConfirmBlockById } = useMainContext();
  // Сегодня (локально) для ограничения выбора начала аренды
  const todayStr = dayjs().format("YYYY-MM-DD");
  const locations = company.locations.map((loc) => loc.name);
  const [editedOrder, setEditedOrder] = useState({ ...order });
  // Определяем завершён ли заказ (конец раньше сегодняшнего дня)
  const isCompletedOrder = useMemo(
    () => !!order && dayjs(order.rentalEndDate).isBefore(dayjs(), "day"),
    [order]
  );
  // Определяем "текущий" заказ: старт до сегодня, окончание сегодня или позже
  const isCurrentOrder = useMemo(
    () =>
      !!order &&
      dayjs(order.rentalStartDate).isBefore(dayjs(), "day") &&
      !dayjs(order.rentalEndDate).isBefore(dayjs(), "day"),
    [order]
  );
  // Итоговый флаг режима только просмотра (для завершённых). Текущий не viewOnly, но часть полей блокируется выборочно.
  const viewOnly = isViewOnly || isCompletedOrder;
  // Флаг: первое открытие модального окна (не запускать автосинхронизацию totalPrice)
  const isFirstOpen = React.useRef(true);
  // Флаг: редактирует ли админ вручную поле totalPrice
  const [isManualTotalPrice, setIsManualTotalPrice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // ⚠️ УДАЛЕНЫ: conflictMessage1/2/3, timeInMessage, timeOutMessage, availableTimes
  // Теперь единственный источник истины — useEditOrderConflicts

  const [startTime, setStartTime] = useState(
    editedOrder?.timeIn || editedOrder.rentalStartDate
  );
  const [endTime, setEndTime] = useState(
    editedOrder?.timeOut || editedOrder.rentalEndDate
  );

  // ⚠️ УДАЛЁН: calculateAvailableTimes useEffect
  // Теперь анализ конфликтов делается ТОЛЬКО в useEditOrderConflicts

  useEffect(() => {
    if (order?.hasConflictDates) {
      const ordersIdSet = new Set(order?.hasConflictDates);
      const checkConflicts = async () => {
        const isConflict = await getConfirmedOrders([...ordersIdSet]);
        if (isConflict) {
          setIsConflictOrder(true);
        }
      };
      checkConflicts();
    }
  }, [order]);

  const handleDelete = async () => {
    if (viewOnly) return; // Блокируем удаление в режиме просмотра
    // Запрет удаления текущего (идущего) заказа
    if (
      dayjs(order.rentalStartDate).isBefore(dayjs(), "day") &&
      !dayjs(order.rentalEndDate).isBefore(dayjs(), "day")
    ) {
      setUpdateMessage("Текущий заказ нельзя удалить");
      return;
    }
    const isConfirmed = window.confirm(t("order.sureDelOrder"));
    if (!isConfirmed) return;

    setIsUpdating(true);
    setUpdateMessage("");

    try {
      const response = await fetch(`/api/order/deleteOne/${editedOrder._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to delete order`);
      }

      setCarOrders &&
        setCarOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== editedOrder._id)
        );
      // 🔹 Перезагружаем список заказов из базы, чтобы таблица обновилась
      await fetchAndUpdateOrders();

      showMessage("Order deleted successfully.");
      onClose();
    } catch (error) {
      console.error("Error deleting order:", error);
      setUpdateMessage("Failed to delete order. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (order) {
      // 🎯 Используем fromServerUTC для правильной конвертации UTC → Athens
      const adjustedOrder = {
        ...order,
        rentalStartDate: dayjs(order.rentalStartDate),
        rentalEndDate: dayjs(order.rentalEndDate),
        // Отображаем время заказа в Athens timezone
        timeIn: fromServerUTC(order.timeIn),
        timeOut: fromServerUTC(order.timeOut),
      };
      setEditedOrder(adjustedOrder);
      setIsManualTotalPrice(false); // Сброс ручного режима при открытии
      // Таймпикеры также в Athens timezone
      setStartTime(fromServerUTC(order.timeIn));
      setEndTime(fromServerUTC(order.timeOut));
      isFirstOpen.current = true; // Сбросить флаг при каждом открытии
      setLoading(false);
    }
  }, [order]);

  // --- Серверный расчет количества дней и стоимости ---
  const selectedCar = React.useMemo(() => {
    return cars?.find((c) => c._id === editedOrder.car) || null;
  }, [cars, editedOrder.car]);

  // --- Централизованный анализ конфликтов времени ---
  const {
    pickupSummary,
    returnSummary,
    hasBlockingConflict,
  } = useEditOrderConflicts({
    allOrders,
    editingOrder: order,
    carId: editedOrder?.car,
    pickupDate: editedOrder?.rentalStartDate,
    pickupTime: startTime, // ← ДОБАВЛЕНО: время для анализа
    returnDate: editedOrder?.rentalEndDate,
    returnTime: endTime, // ← ДОБАВЛЕНО: время для анализа
    company, // ← ДОБАВЛЕНО: компания для получения bufferTime
  });

  // State для отображения block-сообщения ТОЛЬКО после попытки сохранения
  const [attemptedSave, setAttemptedSave] = useState(false);
  
  // State для модального окна настройки буфера
  const [bufferModalOpen, setBufferModalOpen] = useState(false);

  // Сбрасываем attemptedSave при изменении времени ИЛИ дат (чтобы сообщение исчезло)
  useEffect(() => {
    setAttemptedSave(false);
  }, [startTime, endTime, editedOrder.rentalStartDate, editedOrder.rentalEndDate]);

  const { daysAndTotal, calcLoading } = useDaysAndTotal(
    selectedCar,
    editedOrder.rentalStartDate
      ? dayjs(editedOrder.rentalStartDate).format("YYYY-MM-DD")
      : null,
    editedOrder.rentalEndDate
      ? dayjs(editedOrder.rentalEndDate).format("YYYY-MM-DD")
      : null,
    editedOrder.insurance,
    editedOrder.ChildSeats
  );

  // Синхронизация numberOfDays и totalPrice с сервером (если не ручной режим)
  useEffect(() => {
    // На первом открытии не трогаем ни numberOfDays, ни totalPrice
    if (isFirstOpen.current) return;
    if (!isManualTotalPrice) {
      // daysAndTotal может случайно стать объектом вида { totalPrice, days }
      const safeTotalPrice =
        typeof daysAndTotal.totalPrice === "number"
          ? daysAndTotal.totalPrice
          : typeof daysAndTotal.totalPrice === "object" &&
            daysAndTotal.totalPrice !== null &&
            typeof daysAndTotal.totalPrice.totalPrice === "number"
          ? daysAndTotal.totalPrice.totalPrice
          : 0;
      const safeDays =
        typeof daysAndTotal.days === "number"
          ? daysAndTotal.days
          : typeof daysAndTotal.days === "object" &&
            daysAndTotal.days !== null &&
            typeof daysAndTotal.days.days === "number"
          ? daysAndTotal.days.days
          : 0;
      if (
        safeDays !== editedOrder.numberOfDays ||
        safeTotalPrice !== editedOrder.totalPrice
      ) {
        setEditedOrder((prev) => ({
          ...prev,
          numberOfDays: safeDays,
          totalPrice: safeTotalPrice,
        }));
      }
    } else {
      // Если ручной режим, только количество дней обновляем
      const safeDays =
        typeof daysAndTotal.days === "number"
          ? daysAndTotal.days
          : typeof daysAndTotal.days === "object" &&
            daysAndTotal.days !== null &&
            typeof daysAndTotal.days.days === "number"
          ? daysAndTotal.days.days
          : 0;
      if (safeDays !== editedOrder.numberOfDays) {
        setEditedOrder((prev) => ({
          ...prev,
          numberOfDays: safeDays,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysAndTotal.days, daysAndTotal.totalPrice]);

  // Сброс ручного режима и isFirstOpen только при реальном изменении ключевых полей
  useEffect(() => {
    if (!order) return;
    // Проверяем, изменились ли ключевые поля по сравнению с order из базы
    const isCarChanged = editedOrder.car !== order.car;
    const isStartChanged =
      dayjs(editedOrder.rentalStartDate).format("YYYY-MM-DD") !==
      dayjs(order.rentalStartDate).format("YYYY-MM-DD");
    const isEndChanged =
      dayjs(editedOrder.rentalEndDate).format("YYYY-MM-DD") !==
      dayjs(order.rentalEndDate).format("YYYY-MM-DD");
    const isInsuranceChanged = editedOrder.insurance !== order.insurance;
    const isChildSeatsChanged = editedOrder.ChildSeats !== order.ChildSeats;
    if (
      isCarChanged ||
      isStartChanged ||
      isEndChanged ||
      isInsuranceChanged ||
      isChildSeatsChanged
    ) {
      setIsManualTotalPrice(false);
      isFirstOpen.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editedOrder.car,
    editedOrder.rentalStartDate,
    editedOrder.rentalEndDate,
    editedOrder.insurance,
    editedOrder.ChildSeats,
    order,
  ]);

  const onCloseModalEdit = () => {
    onClose();
    // ⚠️ УДАЛЕНЫ: setConflictMessage1/2, setAvailableTimes
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setUpdateMessage(null);
  };

  const showMessage = (message, isError = false) => {
    setUpdateMessage(message);
    setSnackbarOpen(true);
    if (!isError) {
      setTimeout(() => {
        setSnackbarOpen(false);
        setUpdateMessage(null);
      }, 3000);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const handleConfirmationToggle = async () => {
    if (viewOnly) return; // Блокируем смену статуса в режиме просмотра
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      const result = await toggleConfirmedStatus(editedOrder._id);

      if (!result.success) {
        // ⛔ BLOCK: нельзя подтвердить (конфликт с confirmed заказом)
        showMessage(result.message, true);
        return;
      }

      // ✅ Успех (возможно с warning)
      setEditedOrder((prevOrder) => ({
        ...prevOrder,
        confirmed: result.updatedOrder?.confirmed,
      }));

      // Показываем сообщение (warning или success)
      const isWarning = result.level === "warning";
      showMessage(result.message, isWarning);
      onSave(result.updatedOrder);

      // Закрываем модальное окно после успешного обновления
      // Для warning даём больше времени прочитать сообщение
      setTimeout(() => {
        onClose();
      }, isWarning ? 3000 : 1500);
    } catch (error) {
      console.error("Error toggling confirmation status:", error);
      showMessage(error.message || "Статус не обновлен. Ошибка сервера.", true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDateUpdate = async () => {
    if (viewOnly) return; // Блокируем обновление дат в режиме просмотра
    setIsUpdating(true);
    try {
      const selectedCar = cars.find((c) => c._id === editedOrder.car);
      // Валидация изменения даты начала: если попытка установить новую прошлую дату
      const originalStart = dayjs(order.rentalStartDate);
      if (
        dayjs(editedOrder.rentalStartDate).isBefore(dayjs(), "day") &&
        !originalStart.isSame(editedOrder.rentalStartDate, "day")
      ) {
        setUpdateMessage(
          "Нельзя устанавливать новую дату начала раньше сегодняшнего дня"
        );
        setIsUpdating(false);
        return;
      }
      // Валидация для текущего заказа: дата окончания не может быть раньше сегодняшнего дня
      if (
        isCurrentOrder &&
        dayjs(editedOrder.rentalEndDate).isBefore(dayjs(), "day")
      ) {
        setUpdateMessage(
          "Для текущего заказа дата окончания не может быть раньше сегодняшнего дня"
        );
        setIsUpdating(false);
        return;
      }
      // Валидация времени окончания: если текущий заказ и дата окончания сегодня - время окончания не может быть в прошлом
      if (
        isCurrentOrder &&
        dayjs(editedOrder.rentalEndDate).isSame(dayjs(), "day")
      ) {
        // 🎯 Используем createAthensDateTime для правильной интерпретации времени
        const endDateStr = formatDateYYYYMMDD(dayjs(editedOrder.rentalEndDate));
        const attemptedEndTime = createAthensDateTime(
          endDateStr,
          formatTimeHHMM(dayjs(endTime))
        );
        if (attemptedEndTime.isBefore(dayjs(), "minute")) {
          setUpdateMessage(
            "Для текущего заказа время окончания не может быть в прошлом"
          );
          setIsUpdating(false);
          return;
        }
      }
      // 🎯 Создаём Athens времена и конвертируем в UTC для БД
      const startDateStr = formatDateYYYYMMDD(dayjs(editedOrder.rentalStartDate));
      const endDateStr = formatDateYYYYMMDD(dayjs(editedOrder.rentalEndDate));

      // ⚠️ КРИТИЧНО: Извлекаем HH:mm и создаём ЗАНОВО в Athens,
      // НЕ конвертируем из таймзоны браузера!
      const timeInAthens = createAthensDateTime(
        startDateStr,
        formatTimeHHMM(dayjs(startTime))
      );
      const timeOutAthens = createAthensDateTime(
        endDateStr,
        formatTimeHHMM(dayjs(endTime))
      );

      const datesToSend = {
        rentalStartDate: dayjs(editedOrder.rentalStartDate).toDate(),
        rentalEndDate: dayjs(editedOrder.rentalEndDate).toDate(),
        timeIn: toServerUTC(timeInAthens),
        timeOut: toServerUTC(timeOutAthens),
        car: editedOrder.car,
        carNumber: selectedCar ? selectedCar.carNumber : undefined,
        placeIn: editedOrder.placeIn,
        placeOut: editedOrder.placeOut,
        ChildSeats: editedOrder.ChildSeats,
        insurance: editedOrder.insurance,
        franchiseOrder: editedOrder.franchiseOrder,
        totalPrice: editedOrder.totalPrice, // <-- сохраняем totalPrice
      };

      // DEBUG: проверяем что отправляется на сервер
      console.log("🪑 EditOrderModal: ChildSeats отправляется:", datesToSend.ChildSeats);
      console.log("🛡️ EditOrderModal: Insurance отправляется:", datesToSend.insurance);

      const response = await changeRentalDates(
        editedOrder._id,
        datesToSend.rentalStartDate,
        datesToSend.rentalEndDate,
        datesToSend.timeIn,
        datesToSend.timeOut,
        editedOrder.placeIn,
        editedOrder.placeOut,
        datesToSend.car,
        datesToSend.carNumber,
        datesToSend.ChildSeats,
        datesToSend.insurance,
        datesToSend.franchiseOrder,
        editedOrder.numberOrder,
        editedOrder.insuranceOrder,
        Number(editedOrder.totalPrice),
        Number(editedOrder.numberOfDays)
      );
      // Обработка ответа сервера
      if (response.status == 202 || response.status == 201) {
        onSave(response.updatedOrder);
      }
      // ⚠️ УДАЛЁН: 408 обработка — теперь конфликты проверяются ПЕРЕД отправкой через useEditOrderConflicts
    } catch (error) {
      console.error("Error updating dates:", error);
      setUpdateMessage(error?.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCustomerUpdate = async () => {
    if (viewOnly) return; // Блокируем обновление данных клиента в режиме просмотра
    setIsUpdating(true);
    try {
      // Логгируем email перед отправкой
      console.log("EditOrderModal: email для сохранения:", editedOrder.email);

      // Явно передаем пустую строку, если email пустой или null
      const updates = {
        customerName: editedOrder.customerName,
        phone: editedOrder.phone,
        email: editedOrder.email ? editedOrder.email : "",
        totalPrice: editedOrder.totalPrice, // <-- сохраняем totalPrice
        flightNumber: editedOrder.flightNumber || "",
      };

      console.log("EditOrderModal: updates для updateCustomerInfo:", updates);

      const response = await updateCustomerInfo(editedOrder._id, updates);

      // Логгируем ответ сервера
      console.log("EditOrderModal: response от updateCustomerInfo:", response);

      // Сообщение показывается в onClick кнопки после всех обновлений
      onSave(response.updatedOrder);
    } catch (error) {
      console.error("Error updating customer info:", error);
      setUpdateMessage("Failed to update customer details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeSelectedBox = (e) => {
    if (viewOnly) return; // Блокируем изменения в режиме просмотра
    const { name, value } = e.target;
    setEditedOrder({ ...editedOrder, [name]: value });
  };

  const handleChange = (field, value) => {
    if (viewOnly) return; // Блокируем изменения в режиме просмотра
    const defaultStartHour = companyData.defaultStart.slice(0, 2);
    const defaultStartMinute = companyData.defaultStart.slice(-2);

    const defaultEndHour = companyData.defaultEnd.slice(0, 2);
    const defaultEndMinute = companyData.defaultEnd.slice(-2);
    let newValue = value;

    if (field === "rentalStartDate" || field === "rentalEndDate") {
      const isValidDate = dayjs(value, "YYYY-MM-DD", true).isValid();
      if (isValidDate) {
        newValue = dayjs(value);

        if (field === "rentalStartDate") {
          newValue = newValue.hour(defaultStartHour).minute(defaultStartMinute);
        } else if (field === "rentalEndDate") {
          newValue = newValue.hour(defaultEndHour).minute(defaultEndMinute);
        }
      } else {
        console.error("Invalid date format");
        return;
      }
    }

    setEditedOrder({ ...editedOrder, [field]: newValue });
  };

  const renderField = (label, field, type = "text") => {
    if (!editedOrder) return null;

    let inputType = type;
    let value;

    switch (type) {
      case "date":
        value = editedOrder[field].format("YYYY-MM-DD");
        inputType = "date";
        break;
      case "time":
        value = editedOrder[field].format("HH:mm");
        inputType = "time";
        break;
      case "boolean":
        value = editedOrder[field] ? "Yes" : "No";
        inputType = "checkbox";
        break;
      default:
        value = editedOrder[field];
    }

    return (
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          component="span"
          sx={{ fontWeight: "bold", mr: 1 }}
        >
          {label}:
        </Typography>
        <TextField
          size="small"
          value={value}
          onChange={(e) => {
            if (viewOnly) return; // запрет изменения
            const newValue = e.target.value;
            handleChange(field, newValue);
          }}
          type={inputType}
          disabled={viewOnly}
          InputProps={{ readOnly: viewOnly }}
        />
      </Box>
    );
  };

  const { t } = useTranslation();
  const theme = useTheme();

  // Стили для отключенных элементов
  const disabledStyles = {
    opacity: 0.6,
    cursor: "not-allowed",
  };

  const enabledStyles = {
    opacity: 1,
    cursor: "pointer",
  };

  // 🎯 Проверяем, может ли pending заказ быть подтверждён
  // Сначала проверяем precomputed map из контекста (быстро)
  const confirmationCheck = useMemo(() => {
    // Если заказ уже подтверждён — не нужно проверять
    if (editedOrder?.confirmed) {
      return { canConfirm: true, message: null, isBlocked: false };
    }

    // 🚀 Быстрая проверка через precomputed map
    const orderId = editedOrder?._id?.toString();
    const blockMessage = pendingConfirmBlockById?.[orderId];
    
    if (blockMessage) {
      return {
        canConfirm: false,
        message: blockMessage,
        isBlocked: true,
      };
    }

    // Fallback: если map ещё не обновился, пересчитываем
    const sameCarOrders = allOrders.filter((o) => {
      const oCarId = o.car?._id || o.car;
      return oCarId?.toString() === editedOrder?.car?.toString();
    });

    const result = canPendingOrderBeConfirmed({
      pendingOrder: editedOrder,
      allOrders: sameCarOrders,
      bufferHours: company?.bufferTime, // Передаём bufferTime из компании
    });
    
    return {
      ...result,
      isBlocked: !result.canConfirm,
    };
  }, [editedOrder, allOrders, company]);

  // Проверка, заблокирована ли кнопка подтверждения
  const isConfirmationDisabled =
    viewOnly ||
    (isCurrentOrder && editedOrder?.confirmed) ||
    (!editedOrder?.confirmed && !confirmationCheck.canConfirm);

  return (
    <>
      <Paper
        sx={{
          // Адаптивная ширина для разных экранов
          width: { xs: "100%", sm: 500, md: 700 },
          maxWidth: { xs: "95vw", sm: "90%" },
          // Адаптивные отступы
          p: { xs: 1.5, sm: 2, md: 4 },
          pt: { xs: 1, sm: 1.5, md: 2 },
          // Центрирование модального окна
          mx: "auto",
          // Ограничение высоты с учётом мобильных устройств
          maxHeight: { xs: "95vh", sm: "99vh" },
          overflow: "auto",
          // Стили для конфликтных заказов
          border: isConflictOrder ? "4px solid" : "none",
          borderColor: isConflictOrder ? "error.main" : "transparent",
          animation: isConflictOrder ? "pulse 2s infinite" : "none",
          // Скругление углов для мобильных
          borderRadius: { xs: 2, sm: 1 },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography
              variant="h6"
              color="primary.main"
              sx={{ 
                letterSpacing: "-0.5px", 
                fontSize: { xs: "1rem", sm: "1.15rem", md: "1.3rem" },
                textAlign: { xs: "center", sm: "left" },
                mb: { xs: 0.5, sm: 0 },
              }}
            >
              {viewOnly ? "Просмотреть заказ" : t("order.editOrder")} №
              {order?.orderNumber ? order.orderNumber.slice(2, -2) : ""}
              {(() => {
                // Найти автомобиль по id заказа
                const carObj = cars?.find(
                  (c) => c._id === (order?.car || editedOrder?.car)
                );
                if (carObj) {
                  return ` (${carObj.model} ${carObj.regNumber})`;
                }
                return "";
              })()}
            </Typography>
            {/* Количество дней и стоимость */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: "center", sm: "flex-start" }}
              flexWrap="wrap"
              sx={{ mb: 1, gap: { xs: 0.5, sm: 0 } }}
            >
              <Typography variant="body1">
                {t("order.daysNumber")}{" "}
                <Box
                  component="span"
                  sx={{ color: "primary.dark", fontWeight: 700 }}
                >
                  {editedOrder?.numberOfDays}
                </Box>{" "}
                | {t("order.price")}
              </Typography>
              <TextField
                value={
                  editedOrder.totalPrice !== undefined &&
                  editedOrder.totalPrice !== null
                    ? editedOrder.totalPrice
                    : ""
                }
                onChange={(e) => {
                  if (viewOnly) return;
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setEditedOrder((prev) => ({
                    ...prev,
                    totalPrice: val ? Number(val) : 0,
                  }));
                  setIsManualTotalPrice(true); // Включаем ручной режим при ручном вводе
                }}
                variant="outlined"
                size="small"
                inputProps={{
                  maxLength: 4,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                InputProps={{
                  endAdornment: (
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 700,
                        fontSize: 18,
                        ml: 0,
                        mr: "-8px",
                        color: "primary.dark",
                      }}
                    >
                      €
                    </Box>
                  ),
                }}
                sx={{
                  ml: 1,
                  width: "90px",
                  "& .MuiInputBase-input": {
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                    letterSpacing: 1,
                    width: "5ch",
                    padding: "8px 8px 8px 12px",
                    boxSizing: "content-box",
                    color: "primary.dark",
                  },
                }}
                disabled={viewOnly}
              />
            </Box>

            {/* Отладочная информация для поля my_order - ЗАКОММЕНТИРОВАНО */}
            {/*
            <Box
              display="flex"
              alignContent="center"
              alignItems="center"
              justifyContent="center"
              sx={{ 
                bgcolor: editedOrder?.my_order ? '#e8f5e8' : '#fff5f5',
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: editedOrder?.my_order ? '#4caf50' : '#f44336',
                my: 1
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                🐛 DEBUG: my_order = {editedOrder?.my_order ? 'true' : 'false'}
                {editedOrder?.my_order ? ' (Заказ с главной страницы)' : ' (Админский заказ)'}
              </Typography>
            </Box>
            */}

            <Divider
              sx={{
                my: 1.5,
                borderColor: editedOrder?.my_order ? ORDER_COLORS.CONFIRMED_BUSINESS.main : ORDER_COLORS.CONFIRMED_INTERNAL.main,
                borderWidth: 2,
              }}
            />

            {/* --- ВЫПАДАЮЩИЙ СПИСОК ДЛЯ ВЫБОРА АВТОМОБИЛЯ --- */}
            {/* <FormControl fullWidth sx={{ mb: 1, minHeight: 36 }} size="small">
              <InputLabel id="car-select-label">{t("order.car")}</InputLabel>
              <Select
                labelId="car-select-label"
                value={editedOrder.car}
                label={t("order.car")}
                name="car"
                size="small"
                onChange={(e) =>
                  setEditedOrder((prev) => ({
                    ...prev,
                    car: e.target.value,
                  }))
                }
                sx={{ minHeight: 36 }}
              >
                {cars &&
                  [...cars]
                    .sort((a, b) => a.model.localeCompare(b.model)) // сортировка по алфавиту по модели
                    .map((car) => (
                      <MenuItem key={car._id} value={car._id}>
                        {car.model} {car.regNumber}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl> */}
            {/* --- КОНЕЦ ВЫБОРА АВТОМОБИЛЯ --- */}

            <Box sx={{ mb: 2 }}>
              <ActionButton
                fullWidth
                onClick={handleConfirmationToggle}
                disabled={isUpdating || isConfirmationDisabled}
                color={editedOrder?.confirmed ? "success" : "primary"}
                label={
                  editedOrder?.confirmed
                    ? t("order.orderConfirmed")
                    : t("order.orderNotConfirmed")
                }
                title={
                  isCurrentOrder && editedOrder?.confirmed
                    ? "Нельзя снять подтверждение у текущего заказа"
                    : confirmationCheck.message || ""
                }
                sx={isConfirmationDisabled ? disabledStyles : enabledStyles}
              />
              {/* ⚠️ Показываем сообщение о блокировке подтверждения */}
              {!editedOrder?.confirmed && confirmationCheck.message && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: "block", textAlign: "center" }}
                >
                  {confirmationCheck.message}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 1 }}>
              {/* Даты — вертикально на мобильных */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1, sm: 2 },
                  mb: 1,
                  alignItems: { xs: "stretch", sm: "flex-start" },
                }}
              >
                <TextField
                  label={t("order.pickupDate")}
                  type="date"
                  value={dayjs(editedOrder.rentalStartDate).format(
                    "YYYY-MM-DD"
                  )}
                  onChange={(e) => {
                    if (viewOnly || isCurrentOrder) return; // блокируем изменение для текущих заказов
                    const newStart = dayjs(e.target.value);
                    // Запрещаем выбор даты раньше сегодняшнего дня
                    if (newStart.isBefore(dayjs(), "day")) {
                      return; // игнорируем недопустимый выбор
                    }
                    setEditedOrder((prev) => {
                      const currentReturn = dayjs(prev.rentalEndDate);
                      if (
                        currentReturn.isValid() &&
                        newStart.isValid() &&
                        !currentReturn.isAfter(newStart, "day")
                      ) {
                        return prev;
                      }
                      return { ...prev, rentalStartDate: newStart };
                    });
                  }}
                  sx={{ flex: 1, minHeight: 48 }}
                  size="medium"
                  InputProps={{ style: { minHeight: 48 } }}
                  disabled={viewOnly || isCurrentOrder}
                  inputProps={{ min: todayStr }}
                />
                <TextField
                  label={t("order.returnDate")}
                  type="date"
                  value={
                    editedOrder.rentalEndDate
                      ? dayjs(editedOrder.rentalEndDate).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) => {
                    if (viewOnly) return;
                    const newReturn = dayjs(e.target.value);
                    const minReturn = isCurrentOrder
                      ? dayjs()
                      : dayjs(editedOrder.rentalStartDate).add(1, "day");
                    const isValid = isCurrentOrder
                      ? newReturn.isValid() &&
                        !newReturn.isBefore(dayjs(), "day")
                      : newReturn.isValid() &&
                        newReturn.isAfter(minReturn.subtract(1, "day"), "day");
                    if (isValid) {
                      setEditedOrder((prev) => ({
                        ...prev,
                        rentalEndDate: newReturn,
                      }));
                    }
                  }}
                  disabled={viewOnly}
                  sx={{ flex: 1, minHeight: 48 }}
                  size="medium"
                  InputProps={{ style: { minHeight: 48 } }}
                  inputProps={{
                    min: isCurrentOrder
                      ? dayjs().format("YYYY-MM-DD")
                      : dayjs(editedOrder.rentalStartDate)
                          .add(1, "day")
                          .format("YYYY-MM-DD"),
                  }}
                />
              </Box>
              {/* Время — TimePicker читает conflicts, не думает */}
              {/* Время — упрощённый TimePicker (НИКОГДА не блокирует ввод) */}
              <TimePicker
                startTime={startTime}
                endTime={endTime}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
                disabled={viewOnly}
                pickupDisabled={viewOnly || isCurrentOrder}
                returnDisabled={viewOnly}
                pickupSummary={pickupSummary}
                returnSummary={returnSummary}
              />

              {/* 🔴 Block-сообщение — ТОЛЬКО после попытки сохранения */}
              {attemptedSave && hasBlockingConflict && (
                <Box
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "error.lighter",
                    border: "1px solid",
                    borderColor: "error.main",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "error.main", fontWeight: 500 }}>
                    🔴 Невозможно сохранить изменения
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="div"
                    sx={{ color: "error.dark", fontSize: 12, mt: 0.5 }}
                  >
                    {(pickupSummary?.level === "block"
                      ? pickupSummary.message
                      : returnSummary?.message
                    )?.split("⚙️").map((part, index, arr) => (
                      index < arr.length - 1 ? (
                        <span key={index}>
                          {part}
                          <span 
                            onClick={() => setBufferModalOpen(true)}
                            style={{ 
                              cursor: "pointer", 
                              textDecoration: "underline",
                              color: "#1976d2"
                            }}
                          >
                            ⚙️ Настройки буфера
                          </span>
                        </span>
                      ) : part
                    ))}
                  </Typography>
                </Box>
              )}

              {/* Место получения и возврата — вертикально на мобильных */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 2 }, 
                mb: 1 
              }}>
                <Autocomplete
                  freeSolo
                  options={locations}
                  value={editedOrder.placeIn || ""}
                  onChange={(_, newValue) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      placeIn: newValue || "",
                    }))
                  }
                  onInputChange={(_, newInputValue) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      placeIn: newInputValue,
                    }))
                  }
                  disabled={viewOnly || isCurrentOrder}
                  PaperProps={{
                    sx: {
                      border: "2px solid",
                      borderColor: "text.primary",
                      borderRadius: 1,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                      backgroundColor: "background.paper",
                    },
                  }}
                  PopperProps={{ style: { zIndex: 1400 } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("order.pickupLocation")}
                      size="medium"
                      required
                      InputProps={{
                        ...params.InputProps,
                        style: { minHeight: 48 },
                      }}
                    />
                  )}
                  sx={{
                    flex: 1,
                    minHeight: 48,
                  }}
                />
                {editedOrder.placeIn &&
                  editedOrder.placeIn.toLowerCase() === "airport" && (
                    <TextField
                      label={t("order.flightNumber") || "Номер рейса"}
                      value={editedOrder.flightNumber || ""}
                      onChange={(e) =>
                        setEditedOrder((prev) => ({
                          ...prev,
                          flightNumber: e.target.value,
                        }))
                      }
                      size="medium"
                      sx={{ width: "25%", alignSelf: "stretch" }}
                      InputLabelProps={{ shrink: true }}
                      disabled={viewOnly || isCurrentOrder}
                    />
                  )}
                <Autocomplete
                  freeSolo
                  options={locations}
                  value={editedOrder.placeOut || ""}
                  onChange={(_, newValue) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      placeOut: newValue || "",
                    }))
                  }
                  onInputChange={(_, newInputValue) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      placeOut: newInputValue,
                    }))
                  }
                  disabled={viewOnly}
                  PaperProps={{
                    sx: {
                      border: "2px solid",
                      borderColor: "text.primary",
                      borderRadius: 1,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                      backgroundColor: "background.paper",
                    },
                  }}
                  PopperProps={{ style: { zIndex: 1400 } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("order.returnLocation")}
                      size="medium"
                      required
                      InputProps={{
                        ...params.InputProps,
                        style: { minHeight: 48 },
                      }}
                    />
                  )}
                  sx={{
                    flex: 1,
                    minHeight: 48,
                  }}
                />
              </Box>
              {/* Страховка и детские кресла — адаптивно */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 2 }, 
                mb: 0 
              }}>
                <FormControl
                  fullWidth
                  sx={{
                    width: { 
                      xs: "100%", 
                      sm: editedOrder.insurance === "TPL" ? "49%" : "30%" 
                    },
                  }}
                >
                  <InputLabel>{t("order.insurance")}</InputLabel>
                  <Select
                    label={t("order.insurance")}
                    value={editedOrder.insurance || ""}
                    onChange={(e) =>
                      !viewOnly &&
                      setEditedOrder((prev) => ({
                        ...prev,
                        insurance: e.target.value,
                      }))
                    }
                    disabled={viewOnly}
                  >
                    {(
                      t("order.insuranceOptions", { returnObjects: true }) || []
                    ).map((option) => {
                      let kaskoPrice = 0;
                      const selectedCar = cars?.find(
                        (c) => c._id === editedOrder.car
                      );
                      if (
                        option.value === "CDW" &&
                        selectedCar &&
                        selectedCar.PriceKacko
                      ) {
                        kaskoPrice = selectedCar.PriceKacko;
                      }
                      return (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value === "CDW"
                            ? `${option.label} ${kaskoPrice}€/${t(
                                "order.perDay"
                              )}`
                            : option.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                {editedOrder.insurance === "CDW" && (
                  <Box sx={{ width: "16%" }}>
                    <RenderTextField
                      name="franchiseOrder"
                      label={t("car.franchise") || "Франшиза заказа"}
                      type="number"
                      updatedCar={editedOrder}
                      handleChange={(e) =>
                        !viewOnly &&
                        setEditedOrder((prev) => ({
                          ...prev,
                          franchiseOrder: Number(e.target.value),
                        }))
                      }
                      isLoading={loading}
                      disabled={viewOnly}
                    />
                  </Box>
                )}
                <FormControl fullWidth sx={{ width: { xs: "100%", sm: "49%" } }}>
                  <InputLabel>
                    {t("order.childSeats")}{" "}
                    {(() => {
                      const selectedCar = cars?.find(
                        (c) => c._id === editedOrder.car
                      );
                      return selectedCar && selectedCar.PriceChildSeats
                        ? selectedCar.PriceChildSeats
                        : 0;
                    })()}
                    €/{t("order.perDay")}
                  </InputLabel>
                  <Select
                    label={`${t("order.childSeats")} ${(() => {
                      const selectedCar = cars?.find(
                        (c) => c._id === editedOrder.car
                      );
                      return selectedCar && selectedCar.PriceChildSeats
                        ? selectedCar.PriceChildSeats
                        : 0;
                    })()}€/${t("order.perDay")}`}
                    value={
                      typeof editedOrder.ChildSeats === "number"
                        ? editedOrder.ChildSeats
                        : 0
                    }
                    onChange={(e) =>
                      !viewOnly &&
                      setEditedOrder((prev) => ({
                        ...prev,
                        ChildSeats: Number(e.target.value),
                      }))
                    }
                    disabled={viewOnly}
                  >
                    <MenuItem value={0}>{t("order.childSeatsNone")}</MenuItem>
                    {[1, 2, 3, 4].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* <Divider
              sx={{
                my: 2,
                borderColor: editedOrder?.my_order ? "success.main" : "error.main",
                borderWidth: 2,
              }}
            /> */}

            {/* Блок данных клиента: имя на отдельной строке, телефон и email — ниже в одну строку */}
            <Box sx={{ mb: 0 }}>
              <FormControl fullWidth margin="dense" sx={{ mt: 0, mb: 0 }}>
                <TextField
                  fullWidth
                  margin="dense"
                  label={
                    <>
                      <span>{t("order.clientName")}</span>
                      <Box component="span" sx={{ color: "primary.dark" }}>*</Box>
                    </>
                  }
                  value={editedOrder.customerName || ""}
                  onChange={(e) =>
                    !viewOnly &&
                    setEditedOrder((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  disabled={viewOnly}
                />
              </FormControl>
              {/* Телефон и email — вертикально на мобильных */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 0.5, sm: 2 }, 
                mb: 0 
              }}>
                <FormControl
                  fullWidth
                  margin="dense"
                  sx={{ flex: 1, minHeight: 36 }}
                >
                  <TextField
                    fullWidth
                    margin="dense"
                    size="small"
                    label={
                      <>
                        <span>{t("order.phone")}</span>
                        <Box component="span" sx={{ color: "primary.dark" }}>*</Box>
                      </>
                    }
                    value={editedOrder.phone || ""}
                    onChange={(e) =>
                      !viewOnly &&
                      setEditedOrder((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={viewOnly}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  margin="dense"
                  sx={{ flex: 1, minHeight: 36 }}
                >
                  <TextField
                    fullWidth
                    margin="dense"
                    size="small"
                    label={
                      <>
                        {t("order.email")}
                        <Box
                          component="span"
                          sx={{
                            color: "success.main",
                            fontWeight: 500,
                            ml: 1,
                          }}
                        >
                          {t("basic.optional")}
                        </Box>
                      </>
                    }
                    value={editedOrder.email || ""}
                    onChange={(e) =>
                      !viewOnly &&
                      setEditedOrder((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={viewOnly}
                  />
                </FormControl>
              </Box>
            </Box>

            {/* Кнопки действий — адаптивное расположение */}
            <Box
              sx={{
                mt: { xs: 2, sm: 1 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { xs: "center", sm: "space-between" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 1, sm: 0 },
              }}
            >
              <CancelButton
                onClick={onCloseModalEdit}
                label={t("basic.cancel")}
                sx={{ order: { xs: 3, sm: 1 }, width: { xs: "100%", sm: "auto" }, }}
              />
              <ConfirmButton
                loading={isUpdating}
                disabled={viewOnly}
                sx={{ 
                  mx: { xs: 0, sm: 2 }, 
                  width: { xs: "100%", sm: "40%" },
                  order: { xs: 1, sm: 2 },

                }}
                onClick={async () => {
                  if (viewOnly) return;

                  // Отмечаем попытку сохранения
                  setAttemptedSave(true);

                  // ❌ БЛОК: Не сохраняем если есть блокирующие конфликты
                  if (hasBlockingConflict) {
                    // Сообщение покажется через attemptedSave + hasBlockingConflict
                    return;
                  }

                  // ✅ Warnings разрешены — сохраняем без подтверждения
                  setIsUpdating(true);
                  try {
                    await handleDateUpdate();
                    await handleCustomerUpdate();
                    showMessage(t("order.orderUpdated"));
                    setAttemptedSave(false); // Сбрасываем после успешного сохранения
                  } catch (error) {
                    setUpdateMessage(
                      error?.message || "Ошибка обновления заказа"
                    );
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                label={t("order.updateOrder")}
              />
              <DeleteButton
                onClick={handleDelete}
                loading={isUpdating}
                disabled={viewOnly || isCurrentOrder || isCompletedOrder}
                label={t("order.deleteOrder")}
                sx={{
                  width: { xs: "100%", sm: "30%" },
                  order: { xs: 2, sm: 3 },
                  opacity: (isCurrentOrder || isCompletedOrder) ? 0.5 : 1,
                  cursor: (isCurrentOrder || isCompletedOrder) ? "not-allowed" : "pointer",
                }}
                title={
                  isCompletedOrder
                    ? "Завершённый заказ нельзя удалить"
                    : isCurrentOrder
                    ? "Текущий заказ нельзя удалить"
                    : t("order.deleteOrder")
                }
              />
            </Box>
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        message={updateMessage}
        closeFunc={handleSnackbarClose}
        isError={
          updateMessage && updateMessage.toLowerCase().includes("failed")
        }
      />

      {/* Модальное окно настройки буфера */}
      <BufferSettingsModal
        open={bufferModalOpen}
        onClose={() => setBufferModalOpen(false)}
      />
    </>
  );
};
export default EditOrderModal;

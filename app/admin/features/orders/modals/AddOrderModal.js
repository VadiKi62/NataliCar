// Генерация номера заказа: ГГГГММДДЧЧММСС (год, месяц, день, час, минуты, секунды)
function generateOrderNumber() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}
import React, { useState, useEffect, useCallback } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
// Хук для получения стоимости и дней (аналогично BookingModal)
function useDaysAndTotal(car, bookDates, insurance, childSeats) {
  const [daysAndTotal, setDaysAndTotal] = useState({ days: 0, totalPrice: 0 });
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    const fetchTotalPrice = async () => {
      if (!car?.carNumber || !bookDates?.start || !bookDates?.end) {
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
            rentalStartDate: bookDates.start,
            rentalEndDate: bookDates.end,
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
  }, [car?.carNumber, bookDates?.start, bookDates?.end, insurance, childSeats]);

  return { daysAndTotal, calcLoading };
}
import {
  Modal,
  Paper,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ConfirmButton, CancelButton, ActionButton } from "@/app/components/ui";
import Autocomplete from "@mui/material/Autocomplete";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MuiCalendar from "@/app/components/calendar-ui/MuiCalendar";
import ConflictMessage from "./conflictMessage";
import Snackbar from "@/app/components/ui/feedback/Snackbar";
import { useMainContext } from "@app/Context";
import {
  functionToCheckDuplicates,
  returnHoursToParseToDayjs,
  toParseTime,
} from "@utils/functions";
import CalendarPicker from "@app/components/CarComponent/CalendarPicker";
import RenderConflictMessage from "./RenderConflictInAddOrder";

import {
  analyzeDates,
  functionPendingOrConfirmedDatesInRange,
} from "@utils/analyzeDates";
import MuiTimePicker from "@/app/components/calendar-ui/MuiTimePicker";
import { RenderSelectField } from "@/app/components/ui/inputs/Fields";

import {
  changeRentalDates,
  toggleConfirmedStatus,
  updateCustomerInfo,
  getConfirmedOrders,
  addOrderNew,
} from "@utils/action";
import { useTranslation } from "react-i18next";
// 🎯 Athens timezone utilities — ЕДИНСТВЕННЫЙ источник правды для времени
import {
  createAthensDateTime,
  toServerUTC,
  formatTimeHHMM,
} from "@/domain/time/athensTime";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const AddOrder = ({ open, onClose, car, date, setUpdateStatus }) => {
  const { fetchAndUpdateOrders, isLoading, ordersByCarId, company } =
    useMainContext();

  const locations = company.locations.map((loc) => loc.name);

  const {
    defaultStartHour,
    defaultStartMinute,
    defaultEndHour,
    defaultEndMinute,
  } = returnHoursToParseToDayjs(company);

  const carOrders = ordersByCarId(car?._id);
  const [bookDates, setBookedDates] = useState({ start: null, end: null });
  const [orderDetails, setOrderDetails] = useState({
    placeIn: "Nea Kalikratia",
    placeOut: "Nea Kalikratia",
    customerName: "",
    phone: "",
    email: "",
    totalPrice: 0,
    numberOfDays: 0,
    confirmed: false,
    my_order: false,
    ChildSeats: 0,
    insurance: "",
    franchiseOrder: undefined,
    orderNumber: "",
    flightNumber: "",
  });
  // Получение количества дней и общей стоимости (React Hook должен быть после объявления bookDates и orderDetails)
  const { daysAndTotal, calcLoading } = useDaysAndTotal(
    car,
    bookDates,
    orderDetails.insurance,
    orderDetails.ChildSeats
  );

  // Автоматически подставлять вычисленную стоимость в поле totalPrice, если оно не редактировалось вручную
  useEffect(() => {
    // Если пользователь не менял вручную или значение совпадает с вычисленным, обновляем
    if (daysAndTotal.totalPrice !== orderDetails.totalPrice) {
      setOrderDetails((prev) => ({
        ...prev,
        totalPrice: daysAndTotal.totalPrice,
      }));
    }
  }, [daysAndTotal.totalPrice]);
  // Хелпер для нормализации дат (аналогично BookingModal)
  function normalizeDate(date) {
    return date ? dayjs(date).format("YYYY-MM-DD") : null;
  }
  const [pendingDatesInRange, setPendingDatesInRange] = useState([]);
  const [confirmedDatesInRange, setConfirmedDatesInRange] = useState([]);
  const [startTime, setStartTime] = useState(
    dayjs().hour(defaultStartHour).minute(defaultStartMinute)
  );
  const [endTime, setEndTime] = useState(
    dayjs().hour(defaultEndHour).minute(defaultEndMinute)
  );

  const [loadingState, setLoadingState] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: null,
    message: "",
  });

  const { confirmed, pending } = analyzeDates(carOrders);

  // --- ВАЖНО: автоматическое заполнение даты и franchiseOrder при открытии модального окна ---
  useEffect(() => {
    if (date && open) {
      // Если date — это диапазон, используем оба значения, иначе +1 день к start
      let startDate = null;
      let endDate = null;
      if (Array.isArray(date) && date.length === 2) {
        startDate = normalizeDate(date[0]);
        endDate = normalizeDate(date[1]);
      } else {
        startDate = normalizeDate(date);
        endDate = normalizeDate(dayjs(date).add(1, "day"));
      }
      // Если стартовая дата в прошлом — заменяем на сегодня и корректируем конец
      const todayStr = dayjs().format("YYYY-MM-DD");
      if (startDate && dayjs(startDate).isBefore(dayjs(), "day")) {
        startDate = todayStr;
        if (
          !endDate ||
          dayjs(endDate).isSameOrBefore(dayjs(startDate), "day")
        ) {
          endDate = dayjs(startDate).add(1, "day").format("YYYY-MM-DD");
        }
      }
      setBookedDates({
        start: startDate,
        end: endDate,
      });
    }
    // Если модалка открыта и franchiseOrder не задан, подставить car.franchise
    if (
      open &&
      car &&
      (orderDetails.franchiseOrder === undefined ||
        orderDetails.franchiseOrder === null ||
        orderDetails.franchiseOrder === "")
    ) {
      setOrderDetails((prev) => ({
        ...prev,
        franchiseOrder: car.franchise ?? 0,
      }));
    }
    // Если модалка открыта и insurance не задан, подставить TPL
    if (
      open &&
      (orderDetails.insurance === undefined ||
        orderDetails.insurance === null ||
        orderDetails.insurance === "")
    ) {
      setOrderDetails((prev) => ({
        ...prev,
        insurance: "TPL",
      }));
    }
    // Если модалка открыта и orderNumber не задан, сгенерировать его
    if (
      open &&
      (!orderDetails.orderNumber || orderDetails.orderNumber === "")
    ) {
      setOrderDetails((prev) => ({
        ...prev,
        orderNumber: generateOrderNumber(),
      }));
    }
  }, [date, open, car]);

  // Оптимизированный обработчик изменения полей
  const handleFieldChange = useCallback((field, value) => {
    setOrderDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const toggleConfirmedStatus = useCallback(() => {
    setOrderDetails((prev) => ({
      ...prev,
      confirmed: !prev.confirmed,
    }));
  }, []);

  // Мемоизированные функции проверки конфликтов
  const checkConflictsPending = useCallback(
    (startDate, endDate) => {
      if (!startDate || !endDate || !pending) return [];

      return functionPendingOrConfirmedDatesInRange(
        pending,
        startDate,
        endDate
      );
    },
    [pending]
  );

  const checkConflictsConfirmed = useCallback(
    (startDate, endDate) => {
      if (!startDate || !endDate || !confirmed) return [];

      return functionPendingOrConfirmedDatesInRange(
        confirmed,
        startDate,
        endDate
      );
    },
    [confirmed]
  );

  const handleSetBookedDates = useCallback(
    (dates) => {
      if (!dates.start || !dates.end) {
        setBookedDates({ start: null, end: null });
        setPendingDatesInRange([]);
        setConfirmedDatesInRange([]);
        return;
      }

      const startDate = dayjs(dates.start).format("YYYY-MM-DD");
      const endDate = dayjs(dates.end).format("YYYY-MM-DD"); // Используем выбранную дату окончания

      const conflicts = checkConflictsPending(dates.start, dates.end);
      const conflictsConfirmed = checkConflictsConfirmed(
        dates.start,
        dates.end
      );

      setBookedDates({
        start: startDate,
        end: endDate,
      });
      setPendingDatesInRange(conflicts);
      setConfirmedDatesInRange(conflictsConfirmed);

      // Улучшенное логирование конфликтов
      if (conflicts?.length > 0) {
        setStatusMessage({
          type: "warning",
          message: `Внимание: В выбранном диапазоне есть ${conflicts.length} ожидающих подтверждения бронирований`,
        });
      } else if (conflictsConfirmed?.length > 0) {
        setStatusMessage({
          type: "error",
          message: `Ошибка: В выбранном диапазоне есть ${conflictsConfirmed.length} уже подтвержденных бронирований`,
        });
      } else {
        setStatusMessage({ type: null, message: "" });
      }
    },
    [checkConflictsPending, checkConflictsConfirmed]
  );

  const handleBookingComplete = async () => {
    setLoadingState(true);
    setStatusMessage({ type: null, message: "" });
    // Валидация: начало не раньше сегодняшнего дня
    if (bookDates.start && dayjs(bookDates.start).isBefore(dayjs(), "day")) {
      setStatusMessage({
        type: "error",
        message: "Дата начала аренды не может быть раньше сегодняшнего дня",
      });
      setLoadingState(false);
      return;
    }

    // 🎯 Используем athensTime utilities для timezone-корректного создания времени
    // Извлекаем HH:mm и создаём заново в Athens БЕЗ конвертации из таймзоны браузера
    const timeInAthens = createAthensDateTime(
      bookDates.start,
      formatTimeHHMM(dayjs(startTime))
    );
    const timeOutAthens = createAthensDateTime(
      bookDates.end,
      formatTimeHHMM(dayjs(endTime))
    );

    // Конвертируем в UTC для сохранения в БД
    const timeInUTC = toServerUTC(timeInAthens);
    const timeOutUTC = toServerUTC(timeOutAthens);

    const data = {
      carNumber: car?.carNumber,
      customerName: orderDetails.customerName,
      phone: orderDetails.phone,
      email: orderDetails.email,
      timeIn: timeInUTC,
      timeOut: timeOutUTC,
      rentalStartDate: dayjs(bookDates.start).toDate(), // Дата без времени
      rentalEndDate: dayjs(bookDates.end).toDate(), // Дата без времени
      placeIn: orderDetails.placeIn,
      placeOut: orderDetails.placeOut,
      confirmed: orderDetails.confirmed,
      my_order: orderDetails.my_order,
      ChildSeats: orderDetails.ChildSeats,
      insurance: orderDetails.insurance,
      franchiseOrder: orderDetails.franchiseOrder,
      orderNumber: orderDetails.orderNumber,
      totalPrice: orderDetails.totalPrice,
      flightNumber: orderDetails.flightNumber,
    };

    try {
      const response = await addOrderNew(data);

      // Унифицированная обработка ответов addOrderNew
      if (response.status === "success") {
        const msg = response?.data?.message || "Заказ успешно добавлен";
        setStatusMessage({ type: "success", message: msg });
        setUpdateStatus({ type: 200, message: msg }); // type: 200 для обновления календаря
        // Явный вызов обновления заказов для BigCalendar
        if (typeof fetchAndUpdateOrders === "function") {
          fetchAndUpdateOrders();
        }
        setTimeout(() => {
          setStatusMessage({ type: null, message: "" });
          onClose();
        }, 4000);
        return;
      }

      if (response.status === "startEndConflict") {
        const msg = response?.message || "Конфликт старт/финиш дат";
        setStatusMessage({ type: "warning", message: msg });
        setUpdateStatus({ type: 200, message: msg });
        return;
      }

      if (response.status === "pending") {
        const msg = response?.message || "Есть неподтвержденные пересечения";
        setStatusMessage({ type: "warning", message: msg });
        setUpdateStatus({ type: 202, message: msg });
        return;
      }

      if (response.status === "conflict") {
        const msg = response?.message || "Даты уже заняты и недоступны";
        setStatusMessage({ type: "error", message: msg });
        setUpdateStatus({ type: 409, message: msg });
        return;
      }

      // status === 'error' или неожиданный статус
      {
        const msg = response?.message || "Не удалось добавить заказ";
        setStatusMessage({ type: "error", message: msg });
        setUpdateStatus({ type: 400, message: msg });
        return;
      }
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);

      setStatusMessage({
        type: "error",
        message:
          error?.message ||
          "Не удалось добавить заказ. Пожалуйста, проверьте данные.",
      });

      setUpdateStatus({
        type: 400,
        message: error?.message || "Ошибка сервера",
      });
    } finally {
      setLoadingState(false);
    }
  };

  // Отрисовка статусного сообщения
  const renderStatusMessage = () => {
    if (!statusMessage.message) return null;

    const colorMap = {
      success: "success.main",
      error: "error.main",
      warning: "warning.main",
    };

    return (
      <Typography
        variant="body2"
        sx={{
          color: colorMap[statusMessage.type] || "inherit",
          textAlign: "center",
          mt: 2,
        }}
      >
        {statusMessage.message}
      </Typography>
    );
  };

  const renderDateTimeSection = () => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label={t("order.pickupDate")}
          type="date"
          value={bookDates.start || ""}
          onChange={(e) => {
            const newStart = normalizeDate(e.target.value);
            // Запрет выбора прошлой даты
            if (newStart && dayjs(newStart).isBefore(dayjs(), "day")) {
              return; // игнорируем недопустимый выбор
            }
            setBookedDates((dates) => {
              if (!newStart) return { ...dates, start: newStart };
              if (
                dates.end &&
                dayjs(dates.end).isSameOrBefore(dayjs(newStart), "day")
              ) {
                return {
                  start: newStart,
                  end: dayjs(newStart).add(1, "day").format("YYYY-MM-DD"),
                };
              }
              return { ...dates, start: newStart };
            });
          }}
          fullWidth
          margin="dense"
          required
          inputProps={{ min: dayjs().format("YYYY-MM-DD") }}
        />
        <TextField
          label={t("order.returnDate")}
          type="date"
          value={bookDates.end || ""}
          onChange={(e) => {
            const newEnd = normalizeDate(e.target.value);
            if (
              bookDates.start &&
              newEnd &&
              dayjs(newEnd).isSameOrBefore(dayjs(bookDates.start), "day")
            ) {
              return;
            }
            setBookedDates((dates) => ({ ...dates, end: newEnd }));
          }}
          fullWidth
          margin="dense"
          inputProps={{
            min: bookDates.start
              ? dayjs(bookDates.start).add(1, "day").format("YYYY-MM-DD")
              : undefined,
          }}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <TextField
          label={t("order.pickupTime")}
          type="time"
          value={startTime.format("HH:mm")}
          onChange={(e) => setStartTime(dayjs(e.target.value, "HH:mm"))}
          margin="dense"
          sx={{ flex: 1 }}
        />
        <TextField
          label={t("order.returnTime")}
          type="time"
          value={endTime.format("HH:mm")}
          onChange={(e) => setEndTime(dayjs(e.target.value, "HH:mm"))}
          margin="dense"
          sx={{ flex: 1 }}
        />
      </Box>
      {/* Места получения и возврата в одну строку */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 2,
          mb: 2,
          flexWrap: "nowrap",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        <Autocomplete
          freeSolo
          options={locations}
          value={orderDetails.placeIn || ""}
          onChange={(e, newValue) =>
            handleFieldChange("placeIn", newValue || "")
          }
          onInputChange={(e, newInput) =>
            handleFieldChange("placeIn", newInput || "")
          }
          PaperProps={{
            sx: {
                      border: "2px solid var(--color-text-primary) !important",
              borderRadius: 1,
              boxShadow: "0 6px 18px rgba(0,0,0,0.12) !important",
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
              InputProps={{ ...params.InputProps, style: { minHeight: 48 } }}
            />
          )}
          sx={{
            width:
              orderDetails.placeIn &&
              orderDetails.placeIn.toLowerCase() === "airport"
                ? "25%"
                : "50%",
            mb: 0,
            mt: 0,
            minHeight: 48,
            alignSelf: "stretch",
          }}
          fullWidth={false}
        />

        {orderDetails.placeIn &&
          orderDetails.placeIn.toLowerCase() === "airport" && (
            <TextField
              name="flightNumber"
              label={t("order.flightNumber") || "Номер рейса"}
              value={orderDetails.flightNumber || ""}
              onChange={(e) =>
                handleFieldChange("flightNumber", e.target.value)
              }
              size="medium"
              sx={{ width: "23%", alignSelf: "stretch" }}
              inputProps={{ maxLength: 20 }}
              InputLabelProps={{ shrink: true }}
            />
          )}

        <Autocomplete
          freeSolo
          options={locations}
          value={orderDetails.placeOut || ""}
          onChange={(e, newValue) =>
            handleFieldChange("placeOut", newValue || "")
          }
          onInputChange={(e, newInput) =>
            handleFieldChange("placeOut", newInput || "")
          }
          PaperProps={{
            sx: {
                      border: "2px solid var(--color-text-primary) !important",
              borderRadius: 1,
              boxShadow: "0 6px 18px rgba(0,0,0,0.12) !important",
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
              InputProps={{ ...params.InputProps, style: { minHeight: 48 } }}
            />
          )}
          sx={{
            width: "50%",
            mb: 0,
            mt: 0,
            minHeight: 48,
            alignSelf: "stretch",
          }}
          fullWidth={false}
        />
      </Box>
    </Box>
  );

  const renderCustomerSection = () => (
    <Box sx={{ mb: 2, mt: 0 }}>
      {/* Динамическая ширина для поля страховки: если выбрано ОСАГО (TPL), ширина 50%, иначе 25% */}
      {(() => {
        //const insuranceWidth = orderDetails.insurance === "TPL" ? "50%" : "25%";
        const insuranceWidth = orderDetails.insurance === "TPL" ? "48%" : "30%";
        return (
          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <FormControl
              sx={{ flexBasis: insuranceWidth, flexGrow: 0, flexShrink: 0 }}
              margin="dense"
            >
              <InputLabel shrink htmlFor="insurance-select">
                {t("order.insurance")}
              </InputLabel>
              <Select
                label={t("order.insurance")}
                value={orderDetails.insurance || ""}
                onChange={(e) => handleFieldChange("insurance", e.target.value)}
                displayEmpty
                inputProps={{ id: "insurance-select" }}
              >
                {/* Удалён placeholder пункт 'Страховка' */}
                {(
                  t("order.insuranceOptions", { returnObjects: true }) || []
                ).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.value === "CDW"
                      ? `${option.label} ${
                          car?.PriceKacko ? car.PriceKacko : 0
                        }€/${t("order.perDay")}`
                      : option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Франшиза показывается только если страховка не ОСАГО (TPL) */}
            {orderDetails.insurance !== "TPL" && (
              <TextField
                sx={{
                  flexBasis: "15%",
                  flexGrow: 0,
                  flexShrink: 0,
                  minWidth: 0,
                }}
                margin="dense"
                label={t("car.franchise")}
                type="number"
                value={orderDetails.franchiseOrder || ""}
                onChange={(e) =>
                  handleFieldChange("franchiseOrder", Number(e.target.value))
                }
              />
            )}
            <FormControl
              sx={{ flexBasis: "48%", flexGrow: 0, flexShrink: 0 }}
              margin="dense"
            >
              <InputLabel sx={{ whiteSpace: "normal", maxWidth: "100%" }}>
                {`${t("order.childSeats")} ${
                  car?.PriceChildSeats ? car.PriceChildSeats : 0
                }€/${t("order.perDay")}`}
              </InputLabel>
              <Select
                label={`${t("order.childSeats")} ${
                  car?.PriceChildSeats ? car.PriceChildSeats : 0
                }€/${t("order.perDay")}`}
                value={orderDetails.ChildSeats || 0}
                onChange={(e) =>
                  handleFieldChange("ChildSeats", Number(e.target.value))
                }
                sx={{
                  flexBasis: "48%",
                  flexGrow: 0,
                  flexShrink: 0,
                  "& .MuiSelect-select": {
                    whiteSpace: "normal",
                    display: "block",
                    maxWidth: "100%",
                  },
                }}
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
        );
      })()}
      <TextField
        fullWidth
        margin="dense"
        label={
          <>
            <span>{t("order.clientName")}</span>
            <span style={{ color: "#990606" }}>*</span>
          </>
        }
        value={orderDetails.customerName}
        onChange={(e) => handleFieldChange("customerName", e.target.value)}
      />
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          margin="dense"
          label={
            <>
              <span>{t("order.phone")}</span>
              <span style={{ color: "#990606" }}>*</span>
            </>
          }
          value={orderDetails.phone}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
        />
        <TextField
          fullWidth
          margin="dense"
          label={
            <>
              {t("order.email")}
              <span
                style={{
                  color: "#4CAF50",
                  fontWeight: 500,
                  marginLeft: 8,
                }}
              >
                {t("basic.optional")}
              </span>
            </>
          }
          value={orderDetails.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
        />
      </Box>
    </Box>
  );

  const { t } = useTranslation();

  const renderConfirmationButton = () => (
    <ActionButton
      fullWidth
      color={orderDetails.confirmed ? "success" : "primary"}
      onClick={toggleConfirmedStatus}
      label={
        orderDetails.confirmed
          ? t("order.bookingConfirmed")
          : t("order.confirmBooking")
      }
      sx={{ mb: 2 }}
    />
  );

  const isMobile = useMediaQuery("(max-width:600px)"); // true для телефона

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          padding: 2,
          margin: "auto",
          bgcolor: "background.paper",
          maxWidth: 700,
          minWidth: { xs: 0, sm: 600 }, // xs — для телефонов, sm и выше — minWidth: 600
          borderRadius: 2,
          // Вертикальный скроллинг и ограничение высоты только для xs (телефонов)
          // Вертикальный скроллинг и ограничение высоты для всех мобильных и планшетов (md и меньше)
          maxHeight: { xs: "90vh", sm: "90vh", md: "90vh", lg: "none" },
          overflowY: { xs: "auto", sm: "auto", md: "auto", lg: "visible" },
        }}
      >
        {loadingState && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                color: "white",
              }}
            >
              <CircularProgress color="inherit" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Отправка заказа...
              </Typography>
            </Box>
          </Box>
        )}
        <Typography
          variant="h6"
          color="primary.main"
          sx={{ letterSpacing: "-0.5px", fontSize: "1.1rem" }}
        >
          {t("order.addOrder")}
          {orderDetails.orderNumber && orderDetails.orderNumber.length > 4 && (
            <>
              {" №"}
              {orderDetails.orderNumber.slice(2, -2)}
            </>
          )}
          {car?.model && (
            <>
              {" "}
              {t("basic.for")} {car.model}
              {car.regNumber ? ` (${car.regNumber})` : ""}
            </>
          )}
        </Typography>

        {/* Количество дней и общая стоимость */}
        <Box
          sx={{
            mb: 2,
            mt: 1,
            fontWeight: 400,
            fontSize: "1.05rem",
            color: "text.primary",
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          {calcLoading ? (
            t("order.calculating")
          ) : (
            <>
              <Typography
                variant="body1"
                component="span"
                sx={{ fontWeight: 400, color: "black" }}
              >
                {(() => {
                  let days = daysAndTotal.days;
                  if (bookDates.start && bookDates.end) {
                    const start = dayjs(bookDates.start);
                    const end = dayjs(bookDates.end);
                    const diff = end.diff(start, "day");
                    if (diff > 0) {
                      days = diff;
                    } else {
                      days = 1;
                    }
                  }
                  return (
                    <>
                      {t("order.daysNumber", { count: days })}
                      <Box
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          color: "primary.main",
                          mx: 0.5,
                        }}
                      >
                        {days}
                      </Box>
                      | {t("order.price")}
                    </>
                  );
                })()}
              </Typography>
              <TextField
                value={orderDetails.totalPrice}
                onChange={(e) =>
                  handleFieldChange("totalPrice", Number(e.target.value))
                }
                type="number"
                variant="outlined"
                margin="dense"
                inputProps={{
                  style: {
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                    letterSpacing: 1,
                    color: "error.main",
                    paddingRight: 0,
                  },
                  maxLength: 4,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  size: 6,
                }}
                sx={{
                  ml: 1,
                  mt: 0,
                  mb: 1,
                  width: "115px",
                  "& .MuiInputBase-input": {
                    padding: "8px 8px 8px 12px",
                    width: "6ch",
                    boxSizing: "content-box",
                    color: "error.main",
                    fontSize: 18,
                  },
                  "& .MuiInputAdornment-root": {
                    marginLeft: 0,
                    marginRight: 0,
                  },
                }}
                placeholder="0"
                InputProps={{
                  endAdornment: (
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        marginLeft: 0,
                        marginRight: "-8px",
                        paddingLeft: 0,
                        paddingRight: 0,
                        letterSpacing: 0,
                        color: "error.main",
                        display: "inline-block",
                      }}
                    >
                      €
                    </span>
                  ),
                }}
              />
            </>
          )}
        </Box>
        {renderDateTimeSection()}
        {renderCustomerSection()}

        {renderStatusMessage()}

        <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
          <CancelButton
            onClick={onClose}
            disabled={loadingState}
            label={t("basic.cancel")}
          />
          <ConfirmButton
            onClick={handleBookingComplete}
            loading={loadingState}
            disabled={
              !bookDates.start ||
              !bookDates.end ||
              !startTime ||
              !endTime ||
              !orderDetails.customerName ||
              !orderDetails.phone
            }
            label={t("order.CompleteBook")}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default AddOrder;

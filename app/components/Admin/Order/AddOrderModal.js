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
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MuiCalendar from "@app/components/Calendars/MuiCalendar";
import ConflictMessage from "./conflictMessage";
import Snackbar from "@app/components/common/Snackbar";
import { useMainContext } from "@app/Context";
import {
  functionToCheckDuplicates,
  returnHoursToParseToDayjs,
  toParseTime,
} from "@utils/functions";
import CalendarPicker from "@app/components/CarComponent/CalendarPicker";
import RenderConflictMessage from "@app/components/Admin/Order/RenderConflictInAddOrder";

import {
  analyzeDates,
  functionPendingOrConfirmedDatesInRange,
} from "@utils/analyzeDates";
import MuiTimePicker from "@app/components/Calendars/MuiTimePicker";
import { RenderSelectField } from "@app/components/common/Fields";

import {
  changeRentalDates,
  toggleConfirmedStatus,
  updateCustomerInfo,
  getConfirmedOrders,
  addOrderNew,
} from "@utils/action";
import { useTranslation } from "react-i18next";

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

    console.log("=== ИСПРАВЛЕНИЕ UTC v2 ===");
    console.log(
      "BookingModal: setTimeToDatejs() создает UTC время из локального времени"
    );
    console.log(
      "AddOrderModal: нужно создать UTC время сохранив локальные часы"
    );

    // ИСПРАВЛЕНИЕ v2: создаю UTC объекты, сохраняя локальное время (как в setTimeToDatejs)
    const timeInWithDate = dayjs.utc(
      bookDates.start + " " + startTime.format("HH:mm")
    ); // создаю UTC из строки

    const timeOutWithDate = dayjs.utc(
      bookDates.end + " " + endTime.format("HH:mm")
    ); // создаю UTC из строки

    console.log("После исправления v2:");
    console.log("timeInWithDate.$u:", timeInWithDate.$u);
    console.log(
      "timeInWithDate.format('HH:mm'):",
      timeInWithDate.format("HH:mm")
    );
    console.log("timeInWithDate.toISOString():", timeInWithDate.toISOString());
    console.log("timeOutWithDate.$u:", timeOutWithDate.$u);
    console.log(
      "timeOutWithDate.format('HH:mm'):",
      timeOutWithDate.format("HH:mm")
    );
    console.log(
      "timeOutWithDate.toISOString():",
      timeOutWithDate.toISOString()
    );

    const data = {
      carNumber: car?.carNumber,
      customerName: orderDetails.customerName,
      phone: orderDetails.phone,
      email: orderDetails.email,
      timeIn: timeInWithDate,
      timeOut: timeOutWithDate,
      rentalStartDate: dayjs.utc(timeInWithDate).toDate(),
      rentalEndDate: dayjs.utc(timeOutWithDate).toDate(),
      placeIn: orderDetails.placeIn,
      placeOut: orderDetails.placeOut,
      confirmed: orderDetails.confirmed,
      my_order: orderDetails.my_order,
      ChildSeats: orderDetails.ChildSeats,
      insurance: orderDetails.insurance,
      franchiseOrder: orderDetails.franchiseOrder,
      orderNumber: orderDetails.orderNumber,
      totalPrice: orderDetails.totalPrice,
    };

    console.log("=== КОНЕЦ ИСПРАВЛЕНИЯ v2 ===");

    try {
      const response = await addOrderNew(data);

      setStatusMessage({
        type: "success",
        message: response.data.message || "Заказ успешно добавлен",
      });

      setUpdateStatus({
        type: 200,
        message: response.data.message || "Заказ добавлен",
      });

      // Закрываем модальное окно с небольшой задержкой для отображения сообщения
      setTimeout(() => {
        setStatusMessage({ type: null, message: "" });
        onClose();
      }, 5000);
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
      success: "green",
      error: "red",
      warning: "orange",
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
        {/* Для телефона отображаем дату в формате DD.MM.YYYY, для ПК — стандартный */}
        <TextField
          label={t("order.pickupDate")}
          type={isMobile ? "text" : "date"}
          value={
            isMobile && bookDates.start
              ? dayjs(bookDates.start).format("DD.MM.YYYY")
              : bookDates.start || ""
          }
          onChange={(e) => {
            let newStart;
            if (isMobile) {
              // Ожидаем ввод в формате DD.MM.YYYY
              const parts = e.target.value.split(".");
              if (parts.length === 3) {
                newStart = dayjs(
                  `${parts[2]}-${parts[1]}-${parts[0]}`
                ).isValid()
                  ? dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`).format(
                      "YYYY-MM-DD"
                    )
                  : "";
              } else {
                newStart = "";
              }
            } else {
              newStart = normalizeDate(e.target.value);
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
          placeholder={isMobile ? "ДД.ММ.ГГГГ" : undefined}
        />
        <TextField
          label={t("order.returnDate")}
          type={isMobile ? "text" : "date"}
          value={
            isMobile && bookDates.end
              ? dayjs(bookDates.end).format("DD.MM.YYYY")
              : bookDates.end || ""
          }
          onChange={(e) => {
            let newEnd;
            if (isMobile) {
              const parts = e.target.value.split(".");
              if (parts.length === 3) {
                newEnd = dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`).isValid()
                  ? dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`).format(
                      "YYYY-MM-DD"
                    )
                  : "";
              } else {
                newEnd = "";
              }
            } else {
              newEnd = normalizeDate(e.target.value);
            }
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
          inputProps={
            !isMobile
              ? {
                  min: bookDates.start
                    ? dayjs(bookDates.start).add(1, "day").format("YYYY-MM-DD")
                    : undefined,
                }
              : undefined
          }
          InputLabelProps={{ shrink: true }}
          required
          placeholder={isMobile ? "ДД.ММ.ГГГГ" : undefined}
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
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <RenderSelectField
          name="placeIn"
          label={t("order.pickupLocation")}
          options={locations}
          updatedCar={orderDetails}
          handleChange={(e) => handleFieldChange("placeIn", e.target.value)}
          required
          sx={{ flex: 1 }}
        />
        <RenderSelectField
          name="placeOut"
          label={t("order.returnLocation")}
          updatedCar={orderDetails}
          options={locations}
          handleChange={(e) => handleFieldChange("placeOut", e.target.value)}
          required
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );

  const renderCustomerSection = () => (
    <Box sx={{ mb: 2, mt: -2 }}>
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
            <span style={{ color: "red" }}>*</span>
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
              <span style={{ color: "red" }}>*</span>
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
                  color: "green",
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
    <Button
      variant="contained"
      color={orderDetails.confirmed ? "success" : "error"}
      onClick={toggleConfirmedStatus}
      sx={{ width: "100%", mb: 2 }}
    >
      {orderDetails.confirmed
        ? t("order.bookingConfirmed")
        : t("order.confirmBooking")}
    </Button>
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
            color: "black",
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
                    color: "red",
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
                    color: "red",
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
                        color: "red",
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
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loadingState}
            sx={{ minWidth: "120px" }}
          >
            {t("basic.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleBookingComplete}
            disabled={
              !bookDates.start ||
              !bookDates.end ||
              !startTime ||
              !endTime ||
              !orderDetails.customerName ||
              !orderDetails.phone ||
              loadingState
            }
            sx={{ minWidth: "120px" }}
          >
            {t("order.CompleteBook")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddOrder;

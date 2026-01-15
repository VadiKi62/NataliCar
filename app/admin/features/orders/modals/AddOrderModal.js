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
import {
  Modal,
  Typography,
  Box,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ConfirmButton,
  CancelButton,
  BookingEditableDateField,
  BookingTimeField,
  BookingTextField,
  BookingLocationAutocomplete,
  BookingFlightField,
} from "@/app/components/ui";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useMainContext } from "@app/Context";
import { returnHoursToParseToDayjs } from "@utils/functions";
import {
  addOrderNew,
  calculateTotalPrice,
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
  const { fetchAndUpdateOrders, company } =
    useMainContext();

  const locations = company.locations.map((loc) => loc.name);

  const {
    defaultStartHour,
    defaultStartMinute,
    defaultEndHour,
    defaultEndMinute,
  } = returnHoursToParseToDayjs(company);

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
  // Состояние для расчета стоимости
  const [daysAndTotal, setDaysAndTotal] = useState({ days: 0, totalPrice: 0 });
  const [calcLoading, setCalcLoading] = useState(false);

  // Получение количества дней и общей стоимости через calculateTotalPrice из utils/action
  useEffect(() => {
    const fetchTotalPrice = async () => {
      if (!car?.carNumber || !bookDates?.start || !bookDates?.end) {
        setDaysAndTotal({ days: 0, totalPrice: 0 });
        return;
      }
      setCalcLoading(true);
      try {
        const result = await calculateTotalPrice(
          car.carNumber,
          bookDates.start,
          bookDates.end,
          orderDetails.insurance,
          orderDetails.ChildSeats
        );
        setDaysAndTotal({ days: result.days, totalPrice: result.totalPrice });
      } catch {
        setDaysAndTotal({ days: 0, totalPrice: 0 });
      } finally {
        setCalcLoading(false);
      }
    };
    fetchTotalPrice();
  }, [
    car?.carNumber,
    bookDates?.start,
    bookDates?.end,
    orderDetails.insurance,
    orderDetails.ChildSeats,
  ]);

  // Автоматически подставлять вычисленную стоимость в поле totalPrice
  useEffect(() => {
    if (daysAndTotal.totalPrice !== orderDetails.totalPrice) {
      setOrderDetails((prev) => ({
        ...prev,
        totalPrice: daysAndTotal.totalPrice,
      }));
    }
  }, [daysAndTotal.totalPrice, orderDetails.totalPrice]);
  // Хелпер для нормализации дат (аналогично BookingModal)
  function normalizeDate(date) {
    return date ? dayjs(date).format("YYYY-MM-DD") : null;
  }
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
  }, [date, open, car, orderDetails.franchiseOrder, orderDetails.insurance, orderDetails.orderNumber]);

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

  const renderDateTimeSection = () => {
    // Handle pickup date change with validation
    const handlePickupDateChange = (newStart) => {
      const normalized = normalizeDate(newStart);
      // Запрет выбора прошлой даты
      if (normalized && dayjs(normalized).isBefore(dayjs(), "day")) {
        return; // игнорируем недопустимый выбор
      }
      setBookedDates((dates) => {
        if (!normalized) return { ...dates, start: normalized };
        if (
          dates.end &&
          dayjs(dates.end).isSameOrBefore(dayjs(normalized), "day")
        ) {
          return {
            start: normalized,
            end: dayjs(normalized).add(1, "day").format("YYYY-MM-DD"),
          };
        }
        return { ...dates, start: normalized };
      });
    };

    // Handle return date change with validation
    const handleReturnDateChange = (newEnd) => {
      const normalized = normalizeDate(newEnd);
      if (
        bookDates.start &&
        normalized &&
        dayjs(normalized).isSameOrBefore(dayjs(bookDates.start), "day")
      ) {
        return;
      }
      setBookedDates((dates) => ({ ...dates, end: normalized }));
    };

    return (
      <Box sx={{ mb: 2 }}>
        {/* Date fields */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            mb: 1,
          }}
        >
          <BookingEditableDateField
            label={t("order.pickupDate")}
            value={bookDates.start || ""}
            onChange={(e) => handlePickupDateChange(e.target.value)}
            sx={{ flex: 1 }}
            inputProps={{ min: dayjs().format("YYYY-MM-DD") }}
          />
          <BookingEditableDateField
            label={t("order.returnDate")}
            value={bookDates.end || ""}
            onChange={(e) => handleReturnDateChange(e.target.value)}
            sx={{ flex: 1 }}
            inputProps={{
              min: bookDates.start
                ? dayjs(bookDates.start).add(1, "day").format("YYYY-MM-DD")
                : dayjs().format("YYYY-MM-DD"),
            }}
          />
        </Box>
        {/* Time fields */}
        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
          <BookingTimeField
            label={t("order.pickupTime")}
            value={startTime.format("HH:mm")}
            onChange={(e) => setStartTime(dayjs(e.target.value, "HH:mm"))}
            sx={{ flex: 1 }}
          />
          <BookingTimeField
            label={t("order.returnTime")}
            value={endTime.format("HH:mm")}
            onChange={(e) => setEndTime(dayjs(e.target.value, "HH:mm"))}
            sx={{ flex: 1 }}
          />
        </Box>
        {/* Location fields */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            mb: 1,
          }}
        >
          <BookingLocationAutocomplete
            label={t("order.pickupLocation")}
            options={locations}
            value={orderDetails.placeIn || ""}
            onChange={(_, newValue) =>
              handleFieldChange("placeIn", newValue || "")
            }
            onInputChange={(_, newInputValue) =>
              handleFieldChange("placeIn", newInputValue)
            }
            sx={{ flex: 1 }}
          />
          <BookingLocationAutocomplete
            label={t("order.returnLocation")}
            options={locations}
            value={orderDetails.placeOut || ""}
            onChange={(_, newValue) =>
              handleFieldChange("placeOut", newValue || "")
            }
            onInputChange={(_, newInputValue) =>
              handleFieldChange("placeOut", newInputValue)
            }
            sx={{ flex: 1 }}
          />
        </Box>
        {/* Flight number - conditional */}
        {orderDetails.placeIn &&
          orderDetails.placeIn.toLowerCase() === "airport" && (
            <BookingFlightField
              label={t("order.flightNumber")}
              value={orderDetails.flightNumber || ""}
              onChange={(e) => handleFieldChange("flightNumber", e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
            />
          )}
      </Box>
    );
  };

  const renderCustomerSection = () => {
    const insuranceOptions =
      t("order.insuranceOptions", { returnObjects: true }) || [];

    return (
      <Box sx={{ mb: 2, mt: 0 }}>
        {/* Insurance and extras */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            mb: 1,
          }}
        >
          <FormControl fullWidth size="small" sx={{ flex: orderDetails.insurance === "TPL" ? 2 : 1 }}>
            <InputLabel>{t("order.insurance")}</InputLabel>
            <Select
              value={orderDetails.insurance || "TPL"}
              label={t("order.insurance")}
              onChange={(e) => handleFieldChange("insurance", e.target.value)}
            >
              {insuranceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label} {option.price ? `(+€${option.price})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {orderDetails.insurance === "CDW" && (
            <BookingTextField
              label={t("order.franchise")}
              type="number"
              value={orderDetails.franchiseOrder || 0}
              onChange={(e) =>
                handleFieldChange(
                  "franchiseOrder",
                  parseFloat(e.target.value) || 0
                )
              }
              sx={{ flex: 1 }}
            />
          )}
          <FormControl fullWidth size="small" sx={{ flex: 1 }}>
            <InputLabel>{t("order.childSeats")}</InputLabel>
            <Select
              value={orderDetails.ChildSeats || 0}
              label={t("order.childSeats")}
              onChange={(e) =>
                handleFieldChange("ChildSeats", parseInt(e.target.value) || 0)
              }
            >
              {[0, 1, 2, 3].map((num) => (
                <MenuItem key={num} value={num}>
                  {num} {num === 1 ? t("order.childSeat") : t("order.childSeats")}
                  {num > 0 && car?.PriceChildSeats
                    ? ` (+€${car.PriceChildSeats * num})`
                    : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {/* Customer fields */}
        <BookingTextField
          label={t("order.name")}
          value={orderDetails.customerName || ""}
          onChange={(e) => handleFieldChange("customerName", e.target.value)}
          required
          sx={{ mb: 1 }}
        />
        <BookingTextField
          label={t("order.phone")}
          value={orderDetails.phone || ""}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
          required
          sx={{ mb: 1 }}
        />
        <BookingTextField
          label={t("order.email")}
          value={orderDetails.email || ""}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          type="email"
          sx={{ mb: 1 }}
        />
      </Box>
    );
  };

  const { t } = useTranslation();

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

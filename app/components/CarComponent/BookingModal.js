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
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import { addOrderNew } from "@utils/action";
import SuccessMessage from "../common/SuccessMessage";
import sendEmail from "@utils/sendEmail";
import { setTimeToDatejs } from "@utils/functions";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useMainContext } from "../../Context";
import { useSnackbar } from "notistack";

// Extend dayjs with plugins
dayjs.extend(utc);

const BookingModal = ({
  open,
  onClose,
  car,
  presetDates = null,
  fetchAndUpdateOrders,
  isLoading,
  selectedTimes,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [daysAndTotal, setDaysAndTotal] = useState({ days: 0, totalPrice: 0 });
  const [calcLoading, setCalcLoading] = useState(false);
  const { t } = useTranslation();
  const { company, companyLoading, companyError } = useMainContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [childSeats, setChildSeats] = useState(0);
  const [insurance, setInsurance] = useState("");
  const [errors, setErrors] = useState({});
  const [emailSent, setSuccessfullySent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const [startTime, setStartTime] = useState(() =>
    setTimeToDatejs(presetDates?.startDate, selectedTimes?.start, true)
  );
  const [endTime, setEndTime] = useState(() =>
    setTimeToDatejs(presetDates?.endDate, selectedTimes?.end)
  );
  const [orderNumber, setOrderNumber] = useState("");
  // Массив мест из базы (company.locations)
  const placeOptions = company?.locations?.map((loc) => loc.name) || [];
  const [placeIn, setPlaceIn] = useState("");
  const [placeOut, setPlaceOut] = useState("");
  const [flightNumber, setFlightNumber] = useState("");

  // Получение стоимости с сервера при изменении дат
  const fetchTotalPrice = useCallback(async () => {
    if (!car?.carNumber || !presetDates?.startDate || !presetDates?.endDate) {
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
          rentalStartDate: presetDates.startDate,
          rentalEndDate: presetDates.endDate,
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
  }, [
    car?.carNumber,
    presetDates?.startDate,
    presetDates?.endDate,
    insurance,
    childSeats,
  ]);

  useEffect(() => {
    fetchTotalPrice();
  }, [fetchTotalPrice]);

  useEffect(() => {
    if (presetDates && presetDates.startDate && presetDates.endDate) {
      setStartTime(
        setTimeToDatejs(presetDates.startDate, selectedTimes?.start, true)
      );
      setEndTime(setTimeToDatejs(presetDates.endDate, selectedTimes?.end));
    }
  }, [presetDates, car, selectedTimes]);

  // Проверка формата email происходит только на фронте, в функции validateEmail:
  const validateEmail = (email) => {
    if (!email) return true; // Email необязателен
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^\+?[0-9]\d{1,14}$/;
    return re.test(phone);
  };

  const bookButtonRef = useRef(null);

  useEffect(() => {
    if (
      open &&
      !isSubmitted &&
      name &&
      email &&
      phone &&
      presetDates?.startDate &&
      presetDates?.endDate &&
      bookButtonRef.current
    ) {
      const timer = setTimeout(() => {
        bookButtonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    open,
    isSubmitted,
    name,
    email,
    phone,
    presetDates?.startDate,
    presetDates?.endDate,
  ]);

  useEffect(() => {
    if (open) {
      resetForm(); // Сбросить форму при каждом открытии модального окна
      setInsurance("TPL"); // Всегда по умолчанию внутренний код ОСАГО
      setChildSeats(0); // Всегда по умолчанию 0
      setOrderNumber(generateOrderNumber());
      setPlaceIn("Halkidikí"); // Значение по умолчанию
      setPlaceOut("Halkidikí"); // Значение по умолчанию
    }
  }, [open]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (email && !validateEmail(email))
      newErrors.email = "Invalid email address";
    if (!validatePhone(phone)) newErrors.phone = "Invalid phone number";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        carNumber: car.carNumber || "",
        customerName: name || "",
        phone: phone || "",
        email: email ? email : "",
        timeIn: startTime ? startTime.toISOString() : "",
        timeOut: endTime ? endTime.toISOString() : "",
        rentalStartDate: presetDates?.startDate
          ? dayjs.utc(presetDates.startDate).toDate()
          : "",
        rentalEndDate: presetDates?.endDate
          ? dayjs.utc(presetDates.endDate).toDate()
          : "",
        my_order: true,
        ChildSeats: childSeats,
        insurance: insurance,
        orderNumber: orderNumber,
        placeIn: placeIn,
        placeOut: placeOut,
        flightNumber: flightNumber,
      };

      const response = await addOrderNew(orderData);

      const prepareEmailData = (orderData, status) => {
        const formattedStartDate = dayjs
          .utc(orderData.rentalStartDate)
          .format("DD.MM.YYYY");
        const formattedEndDate = dayjs
          .utc(orderData.rentalEndDate)
          .format("DD.MM.YYYY");
        let title =
          status === "success"
            ? `Новое бронирование ${orderData.carNumber} ${orderData.carModel}`
            : `Бронирование с неподтвержденными датами ${orderData.carNumber} ${orderData.carModel}`;
        let statusMessage =
          status === "success"
            ? "Создано бронирование в свободные даты."
            : "Бронирование в ожидании подтверждения.";
        return {
          emailCompany: company.email,
          email: orderData.email,
          title: title,
          message: `${statusMessage}\nБронь с ${formattedStartDate} по ${formattedEndDate}. \n Кол-во дней : ${orderData.numberOfDays}  \n Сумма : ${response.data.totalPrice} евро. \n \n Данные машины :   ${orderData.carModel} regNumber : ${car.regNumber} \n \n Данные клиента : \n  Мейл : ${orderData.email}, \n Тел : ${orderData.phone} \n имя: ${orderData.customerName}`,
        };
      };

      const sendConfirmationEmail = async (formData) => {
        try {
          const emailResponse = await sendEmail(
            formData,
            company.email,
            company.useEmail
          );
          setSuccessfullySent(emailResponse.status === 200);
        } catch (emailError) {
          setSuccessfullySent(false);
        }
      };

      switch (response.status) {
        case "success":
          setSubmittedOrder(response.data);
          setIsSubmitted(true);
          fetchAndUpdateOrders();
          await sendConfirmationEmail(
            prepareEmailData(response.data, "success")
          );
          break;
        case "pending": {
          setSubmittedOrder(response.data);
          // Если сервер вернул messageCode и dates, формируем переведённое сообщение
          if (response.messageCode && response.dates) {
            setMessage(
              t(response.messageCode, { dates: response.dates.join(", ") })
            );
          } else {
            setMessage(response.message);
          }
          setIsSubmitted(true);
          fetchAndUpdateOrders();
          await sendConfirmationEmail(
            prepareEmailData(response.data, "pending")
          );
          break;
        }
        case "conflict":
          setErrors({ submit: response.message });
          break;
        case "error":
          throw new Error(response.message);
        default:
          throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("BookingModal: Ошибка при подтверждении заказа:", error);
      setErrors({
        submit:
          error.message || "An error occurred while processing your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setErrors({});
    setIsSubmitted(false);
    setIsSubmitting(false);
    setSubmittedOrder(null);
    setSuccessfullySent(false);
    setMessage(null);
    setPlaceIn("");
    setPlaceOut("");
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {isLoading ? (
        <Box sx={{ display: "flex", alignContent: "center", p: 10 }}>
          <CircularProgress />
          <CircularProgress sx={{ color: "primary.green" }} />
          <CircularProgress sx={{ color: "primary.red" }} />
        </Box>
      ) : (
        <React.Fragment>
          <DialogTitle textAlign="center" mt="3">
            {t("order.book", { model: car.model })}
          </DialogTitle>
          <DialogContent>
            {isSubmitted ? (
              <SuccessMessage
                submittedOrder={submittedOrder}
                presetDates={presetDates}
                onClose={onClose}
                emailSent={emailSent}
                message={message}
              />
            ) : (
              <Box>
                <Typography variant="body1">
                  {t("order.youBook", { model: car.model })}
                  <Box
                    component="span"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {dayjs(presetDates?.startDate).format("MMMM D")}
                  </Box>{" "}
                  {t("order.till")}
                  <Box
                    component="span"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {dayjs(presetDates?.endDate).format("MMMM D")}
                  </Box>
                  .
                </Typography>
                {/* Информация о количестве дней и стоимости */}
                <Box
                  sx={{
                    mb: 2,
                    mt: 1,
                    fontWeight: 400,
                    fontSize: "1.05rem",
                    color: "black",
                    display: "flex",
                    gap: 2,
                  }}
                >
                  {calcLoading ? (
                    t("order.calculating")
                  ) : (
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{ fontWeight: 400, color: "black" }}
                    >
                      {t("order.daysNumber", { count: daysAndTotal.days })}
                      <Box
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          color: "primary.main",
                          mx: 0.5,
                        }}
                      >
                        {daysAndTotal.days}
                      </Box>
                      | {t("order.price")}
                      <Box
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          color: "primary.main",
                          mx: 0.5,
                        }}
                      >
                        {daysAndTotal.totalPrice}€
                      </Box>
                    </Typography>
                  )}
                </Box>
                <Box
                  component="form"
                  sx={{ "& .MuiTextField-root": { my: 1 } }}
                >
                  {/* Время в одной строке, 24-часовой формат */}
                  <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <TextField
                      label={t("order.pickupTime")}
                      type="time"
                      value={startTime.format("HH:mm")}
                      onChange={(e) =>
                        setStartTime(dayjs(e.target.value, "HH:mm"))
                      }
                      sx={{ flex: 1 }}
                      size="small"
                    />
                    <TextField
                      label={t("order.returnTime")}
                      type="time"
                      value={endTime.format("HH:mm")}
                      onChange={(e) =>
                        setEndTime(dayjs(e.target.value, "HH:mm"))
                      }
                      sx={{ flex: 1 }}
                      size="small"
                    />
                  </Box>
                  {/* Места получения/возврата — на мобильных экранах столбцом, на больших в строке */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                      mb: 2,
                      mt: 0,
                      width: "100%",
                      alignItems: "stretch",
                    }}
                  >
                    {/* Если выбран Airport и экран xs — показываем placeIn и flight в одной строке (60/40) */}
                    {placeIn && placeIn.toLowerCase() === "airport" ? (
                      <Box
                        sx={{
                          display: "flex",
                          width: { xs: "100%", sm: "50%" },
                          gap: 2,
                          alignItems: "stretch",
                        }}
                      >
                        <Autocomplete
                          freeSolo
                          options={placeOptions}
                          value={placeIn}
                          onInputChange={(event, newInputValue) =>
                            setPlaceIn(newInputValue)
                          }
                          sx={{
                            width: { xs: "60%", sm: "50%" },
                            minWidth: 0,
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={
                                t("order.pickupLocation") || "Место получения"
                              }
                              variant="outlined"
                              size="small"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                            />
                          )}
                        />
                        <TextField
                          label={t("order.flightNumber") || "Номер рейса"}
                          value={flightNumber}
                          onChange={(e) => setFlightNumber(e.target.value)}
                          size="small"
                          sx={{
                            width: { xs: "40%", sm: "50%" },
                            alignSelf: "stretch",
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    ) : (
                      <Autocomplete
                        freeSolo
                        options={placeOptions}
                        value={placeIn}
                        onInputChange={(event, newInputValue) =>
                          setPlaceIn(newInputValue)
                        }
                        sx={{
                          width: {
                            xs: "100%",
                            sm:
                              placeIn && placeIn.toLowerCase() === "airport"
                                ? "25%"
                                : "50%",
                          },
                          minWidth: 0,
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={
                              t("order.pickupLocation") || "Место получения"
                            }
                            variant="outlined"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        )}
                      />
                    )}
                    <Autocomplete
                      freeSolo
                      options={placeOptions}
                      value={placeOut}
                      onInputChange={(event, newInputValue) =>
                        setPlaceOut(newInputValue)
                      }
                      sx={{ width: { xs: "100%", sm: "50%" }, minWidth: 0 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("order.returnLocation") || "Место возврата"}
                          variant="outlined"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                      )}
                    />
                  </Box>
                  {/* <TextField
                    label={t("order.name")}
                    variant="outlined"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                  /> */}
                  <Box sx={{ display: "flex", gap: 2, mt: 1, mb: 3 }}>
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>{t("order.insurance")}</InputLabel>
                      <Select
                        label={t("order.insurance")}
                        value={insurance}
                        onChange={(e) => setInsurance(e.target.value)}
                        size="small"
                        sx={{ flex: 1, minHeight: 40 }}
                      >
                        {(
                          t("order.insuranceOptions", {
                            returnObjects: true,
                          }) || []
                        ).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.value === "CDW"
                              ? `${option.label} ${
                                  car.PriceKacko ? car.PriceKacko : 0
                                }€/${t("order.perDay")}`
                              : option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>
                        {t("order.childSeats")}{" "}
                        {car.PriceChildSeats ? car.PriceChildSeats : 0}€/
                        {t("order.perDay")}
                      </InputLabel>
                      <Select
                        label={`${t("order.childSeats")} ${
                          car.PriceChildSeats ? car.PriceChildSeats : 0
                        }€/${t("order.perDay")}`}
                        value={childSeats}
                        onChange={(e) => setChildSeats(Number(e.target.value))}
                        size="small"
                        sx={{ flex: 1, minHeight: 40 }}
                      >
                        <MenuItem value={0}>
                          {t("order.childSeatsNone")}
                        </MenuItem>
                        {[1, 2, 3, 4].map((num) => (
                          <MenuItem key={num} value={num}>
                            {num}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  {/* Поле Name опущено ниже по вертикали с помощью mt: 2 */}
                  <TextField
                    label={
                      <>
                        <span>{t("order.clientName")}</span>
                        <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    variant="outlined"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // required
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ mt: 2 }}
                  />

                  {/* Phone и Email в одной строке, как в AddOrderModal */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      label={
                        <>
                          <span>{t("order.phone")}</span>
                          <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      variant="outlined"
                      fullWidth
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      //required
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                    <TextField
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
                      variant="outlined"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email}
                      // required убран, поле необязательное
                    />
                  </Box>
                </Box>
                {errors.submit && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {errors.submit}
                  </Typography>
                )}
                {/* Кнопки внутри DialogContent, BOOK по центру и мигает */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 3,
                    pt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Button onClick={handleModalClose} variant="outlined">
                    {isSubmitted ? "OK" : t("basic.cancel")}
                  </Button>
                  {!isSubmitted && (
                    <Button
                      ref={bookButtonRef}
                      variant="contained"
                      color="error"
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        !name ||
                        !phone ||
                        !presetDates?.startDate ||
                        !presetDates?.endDate
                        // email не требуется для активации
                      }
                      startIcon={
                        isSubmitting ? <CircularProgress size={20} /> : null
                      }
                      sx={{
                        backgroundColor: "primary.red",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        padding: "12px 32px",
                        minWidth: "200px",
                        margin: "0 auto",
                        animation: "bookButtonPulse 1.5s ease-in-out infinite",
                        display: "block",
                        "&:hover": {
                          backgroundColor: "#d32f2f",
                          animation: "none",
                        },
                        "&:disabled": {
                          backgroundColor: "#grey.400",
                          animation: "none",
                        },
                        "@keyframes bookButtonPulse": {
                          "0%": {
                            backgroundColor: "primary.red",
                            boxShadow: "0 0 10px rgba(211, 47, 47, 0.7)",
                            transform: "scale(1)",
                          },
                          "50%": {
                            backgroundColor: "#ff5252",
                            boxShadow: "0 0 20px rgba(255, 82, 82, 0.9)",
                            transform: "scale(1.05)",
                          },
                          "100%": {
                            backgroundColor: "primary.red",
                            boxShadow: "0 0 10px rgba(211, 47, 47, 0.7)",
                            transform: "scale(1)",
                          },
                        },
                      }}
                    >
                      {isSubmitting
                        ? t("order.processing") || "Processing..."
                        : t("order.confirmBooking")}
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </React.Fragment>
      )}
    </Dialog>
  );
};

export default BookingModal;

// Ваш orderData формируется корректно: email: "" (пустая строка).
// На фронте нет проблем с форматом email, если он пустой.
// Если заказ не сохраняется, причина на сервере (API).

// Для отладки можно добавить логгирование на сервере (route.js):
// console.log("API: email =", typeof email, email);

// На фронте ничего менять не нужно — email: "" это корректно для необязательного поля.

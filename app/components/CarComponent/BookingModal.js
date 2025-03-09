import React, { useState, useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { addOrder, addOrderNew } from "@utils/action";
import SuccessMessage from "../common/SuccessMessage";
import TimePicker from "@app/components/Calendars/MuiTimePicker";
import sendEmail from "@utils/sendEmail";
import { setTimeToDatejs } from "@utils/functions";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useMainContext } from "../../Context";

// Extend dayjs with plugins
dayjs.extend(utc);

// const { RangePicker } = DatePicker;

const getYearMonth = (date) => date.year() * 12 + date.month();

const disabledDate = (current, { from, type }) => {
  if (from) {
    const minDate = dayjs(from).subtract(6, "days");
    const maxDate = dayjs(from).add(6, "days");
    switch (type) {
      case "year":
        return (
          current.year() < minDate.year() || current.year() > maxDate.year()
        );
      case "month":
        return (
          getYearMonth(current) < getYearMonth(minDate) ||
          getYearMonth(current) > getYearMonth(maxDate)
        );
      default:
        return Math.abs(current.diff(from, "days")) >= 7;
    }
  }
  return false;
};

const BookingModal = ({
  open,
  onClose,
  car,
  presetDates = null,
  fetchAndUpdateOrders,
  isLoading,
  selectedTimes,
}) => {
  // if (presetDates) console.log("presetDates from Fooking Modal ", presetDates);
  const { t } = useTranslation();
  const { company } = useMainContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  // const [totalPrice, setTotalPrice] = useState(0);
  const [emailSent, setSuccessfullySent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState(null);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [dateRange, setDateRange] = useState([
    presetDates?.startDate ? dayjs(presetDates.startDate).utc() : null,
    presetDates?.endDate ? dayjs(presetDates.endDate).utc() : null,
  ]);

  const [startTime, setStartTime] = useState(() => {
    return setTimeToDatejs(presetDates?.startDate, selectedTimes?.start, true);
  });
  const [endTime, setEndTime] = useState(() => {
    return setTimeToDatejs(presetDates?.endDate, selectedTimes?.end);
  });

  useEffect(() => {
    if (presetDates?.startDate && presetDates?.endDate) {
      setStartTime(
        setTimeToDatejs(presetDates?.startDate, selectedTimes?.start, true)
      );
      setEndTime(setTimeToDatejs(presetDates?.endDate, selectedTimes?.end));
    }
  }, [presetDates?.startDate, presetDates?.endDate, car.pricePerDay]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^\+?[0-9]\d{1,14}$/;
    return re.test(phone);
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Validation checks
    if (!name) newErrors.name = "Name is required";
    if (!validateEmail(email)) newErrors.email = "Invalid email address";
    if (!validatePhone(phone)) newErrors.phone = "Invalid phone number";

    // If there are validation errors, set them and return early
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("startTime before adding ORDER", startTime);
    console.log("endTime before adding ORDER", endTime);
    try {
      const orderData = {
        carNumber: car.carNumber,
        customerName: name,
        phone,
        email,
        timeIn: dayjs(startTime),
        timeOut: dayjs(endTime),
        rentalStartDate: dayjs.utc(presetDates?.startDate).toDate(),
        rentalEndDate: dayjs.utc(presetDates?.endDate).toDate(),
        // totalPrice,
      };

      const response = await addOrderNew(orderData);

      console.log("response ORDER", response);

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
            ? "Создано бронирование в сводобные даты."
            : "Бронирование в ожидании подтверждения.";

        console.log("company", company);
        return {
          emailCompany: company.email,
          email: orderData.email,
          title: title,
          message: `${statusMessage}\nБронь с ${formattedStartDate} по ${formattedEndDate}. \n Кол-во дней : ${orderData.numberOfDays}  \n Сумма : ${response.data.totalPrice} евро. \n \n Данные машины :   ${orderData.carNumber} ${orderData.carModel} regNumber : ${orderData.regNumber} \n \n Данные клиента : \n  Мейл : ${orderData.email}, \n Тел : ${orderData.phone} \n имя: ${orderData.customerName}`,
        };
      };

      const sendConfirmationEmail = async (formData) => {
        try {
          const emailResponse = await sendEmail(
            formData,
            company.email,
            company.useEmail
          );
          if (emailResponse.status === 200) {
            setSuccessfullySent(true);
          } else {
            setSuccessfullySent(false);
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          setSuccessfullySent(false);
        }
      };

      // Handle different response statuses
      switch (response.status) {
        case "success":
          setSubmittedOrder(response.data);
          console.log("Order added successfully:", response.data);
          setIsSubmitted(true);
          fetchAndUpdateOrders();
          await sendConfirmationEmail(
            prepareEmailData(response.data, "success")
          );
          break;

        case "pending":
          console.warn("Order is pending:", response.message);
          setSubmittedOrder(response.data);
          setMessage(response.message);
          // setErrors({ submit: response.message });
          setIsSubmitted(true);
          fetchAndUpdateOrders();
          await sendConfirmationEmail(
            prepareEmailData(response.data, "pending")
          );
          break;

        case "conflict":
          console.warn("Conflict with booking:", response.message);
          setErrors({ submit: response.message });
          break;

        case "error":
          throw new Error(response.message);

        default:
          throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error adding order:", error.message);
      setErrors({
        submit:
          error.message || "An error occurred while processing your request.",
      });
    }
  };

  const resetForm = () => {
    // Reset all form states
    setName("");
    setEmail("");
    setPhone("");
    setErrors({});
    setIsSubmitted(false);
    setSubmittedOrder(null);
    setSuccessfullySent(false);
    setMessage(null);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/*  */}
      {isLoading ? (
        <Box sx={{ display: "flex", alignContent: "center", p: 10 }}>
          {" "}
          <CircularProgress />
          <CircularProgress sx={{ color: "primary.green" }} />
          <CircularProgress sx={{ color: "primary.red" }} />
        </Box>
      ) : (
        <>
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

                <Box
                  component="form"
                  sx={{ "& .MuiTextField-root": { my: 1 } }}
                >
                  <TimePicker
                    startTime={startTime}
                    endTime={endTime}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    isRestrictionTimeIn={selectedTimes.start}
                    isRestrictionTimeOut={selectedTimes.end}
                  />

                  <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                  <TextField
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    error={!!errors.phone}
                    helperText={errors.phone}
                  />
                </Box>
                {errors.submit && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {errors.submit}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>
              {isSubmitted ? "OK" : t("basic.cancel")}
            </Button>

            {!isSubmitted && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={
                  !name ||
                  !email ||
                  !phone ||
                  !presetDates?.startDate ||
                  !presetDates?.endDate
                }
              >
                {t("order.confirmBooking")}
              </Button>
            )}
          </DialogActions>
        </>
      )}
      {/* </Slide> */}
    </Dialog>
  );
};

export default BookingModal;

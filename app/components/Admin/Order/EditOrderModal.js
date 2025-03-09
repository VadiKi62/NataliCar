import React, { useState, useEffect } from "react";
import {
  Modal,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import ConflictMessage from "./conflictMessage";
import Snackbar from "@app/components/common/Snackbar";
import { useMainContext } from "@app/Context";
import TimePicker from "@app/components/Calendars/MuiTimePicker";
import {
  functionToretunrStartEndOverlap,
  getConfirmedAndUnavailableStartEndDates,
  extractArraysOfStartEndConfPending,
  returnOverlapOrders,
  returnOverlapOrdersObjects,
  setTimeToDatejs,
  calculateAvailableTimes,
  returnTime,
} from "@utils/functions";
import { companyData } from "@utils/companyData";

import {
  changeRentalDates,
  toggleConfirmedStatus,
  updateCustomerInfo,
  getConfirmedOrders,
} from "@utils/action";
import { RenderSelectField } from "@app/components/common/Fields";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone
const timeZone = "Europe/Athens";
dayjs.tz.setDefault(timeZone);

const EditOrderModal = ({
  open,
  onClose,
  order,
  onSave,
  setCarOrders,
  isConflictOrder,
  setIsConflictOrder,
  startEndDates,
}) => {
  const { allOrders, fetchAndUpdateOrders, company } = useMainContext();
  const locations = company.locations.map((loc) => loc.name);
  const [editedOrder, setEditedOrder] = useState(order);
  const [loading, setLoading] = useState(true);
  const [conflictMessage1, setConflictMessage1] = useState(null);
  const [conflictMessage2, setConflictMessage2] = useState(null);
  const [conflictMessage3, setConflictMessage3] = useState(null);
  const [timeInMessage, setTimeInMessage] = useState(null);
  const [timeOutMessage, setTimeOutMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [startTime, setStartTime] = useState(
    editedOrder?.timeIn || editedOrder.rentalStartDate
  );
  const [endTime, setEndTime] = useState(
    editedOrder?.timeOut || editedOrder.rentalEndDate
  );
  const [availableTimes, setAvailableTimes] = useState({
    availableStart: null,
    availableEnd: null,
    hourStart: null,
    minuteStart: null,
    hourEnd: null,
    minuteEnd: null,
  });

  useEffect(() => {
    if (editedOrder?.rentalStartDate) {
      // Recalculate available times
      const {
        availableStart,
        availableEnd,
        hourStart,
        minuteStart,
        hourEnd,
        minuteEnd,
      } = calculateAvailableTimes(
        startEndDates,
        editedOrder?.timeIn,
        editedOrder?.timeOut,
        editedOrder?._id
      );
      setAvailableTimes({
        availableStart,
        availableEnd,
        hourStart,
        minuteStart,
        hourEnd,
        minuteEnd,
      });

      // Set start and end times based on calculated values
      // if (availableStart) {
      //   const newStartTimeDate = setTimeToDatejs(
      //     editedOrder?.rentalStartDate,
      //     availableStart,
      //     true
      //   );
      //   setStartTime(newStartTimeDate);
      // }

      // if (availableEnd) {
      //   const newEndTimeDate = setTimeToDatejs(
      //     editedOrder?.rentalEndDate,
      //     availableEnd
      //   );
      //   setEndTime(newEndTimeDate);
      // }
    }
  }, [
    editedOrder?.rentalStartDate,
    startEndDates,
    editedOrder?.timeIn,
    editedOrder?.timeOut,
  ]);

  useEffect(() => {
    if (order?.hasConflictDates) {
      const ordersIdSet = new Set(order?.hasConflictDates);
      const checkConflicts = async () => {
        const isConflict = await getConfirmedOrders([...ordersIdSet]);
        // console.log("isConflict", isConflict);
        if (isConflict) {
          setIsConflictOrder(true);
        }
      };
      checkConflicts();
    }
  }, [order]);

  const handleDelete = async () => {
    // Prompt the user for confirmation before deleting
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!isConfirmed) return;

    setIsUpdating(true);
    setUpdateMessage(""); // Clear any previous update message
    setAvailableTimes(null);

    try {
      const response = await fetch(`/api/order/deleteOne/${editedOrder._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to delete order`);
      }

      // Update car orders after successful deletion
      setCarOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== editedOrder._id)
      );

      showMessage("Order deleted successfully.");
      onClose(); // Close modal on successful deletion
    } catch (error) {
      console.error("Error deleting order:", error);
      setUpdateMessage("Failed to delete order. Please try again.");
    } finally {
      setIsUpdating(false); // Reset updating state
    }
  };

  useEffect(() => {
    if (order) {
      // Convert dates to the correct timezone when setting initial state
      const adjustedOrder = {
        ...order,
        rentalStartDate: dayjs(order.rentalStartDate).utc(),
        rentalEndDate: dayjs(order.rentalEndDate).utc(),
        timeIn: dayjs(order.timeIn).utc(),
        timeOut: dayjs(order.timeOut).utc(),
      };
      setEditedOrder(adjustedOrder);

      if (order.hasConflictDates.length > 0) {
        const conflictingOrderIds = new Set(order.hasConflictDates);
        const conflicts = allOrders.filter((existingOrder) =>
          conflictingOrderIds.has(existingOrder._id)
        );

        setConflictMessage3(conflicts); // Set the conflicting orders
      }

      setLoading(false);
    }
  }, [order]);

  const onCloseModalEdit = () => {
    onClose();
    setConflictMessage2(null);
    setConflictMessage1(null);
    setAvailableTimes(null);
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
    setIsUpdating(true);
    setUpdateMessage(null);
    console.log("editedOrder", editedOrder);
    try {
      const { updatedOrder, message } = await toggleConfirmedStatus(
        editedOrder._id
      );

      setEditedOrder((prevOrder) => ({
        ...prevOrder,
        confirmed: updatedOrder?.confirmed,
      }));

      showMessage(message);
      onSave(updatedOrder);
    } catch (error) {
      console.error("Error toggling confirmation status:", error);
      setUpdateMessage(error.message || "Статус не обновлен. Ошибка сервера.");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleDateUpdate = async () => {
    setIsUpdating(true);
    try {
      const datesToSend = {
        rentalStartDate: dayjs(editedOrder.rentalStartDate).toDate(),
        rentalEndDate: dayjs(editedOrder.rentalEndDate).toDate(),
        timeIn: dayjs(startTime).utc().toDate(),
        timeOut: dayjs(endTime).utc().toDate(),
      };

      console.log("datesTO send!", datesToSend);

      const response = await changeRentalDates(
        editedOrder._id,
        datesToSend.rentalStartDate,
        datesToSend.rentalEndDate,
        datesToSend.timeIn,
        datesToSend.timeOut,
        editedOrder.placeIn,
        editedOrder.placeOut
      );
      console.log("RESPONSE !!!!!", response);
      showMessage(response.message);
      if (response.status == 202) {
        setConflictMessage1(response.conflicts);
        onSave(response.updatedOrder);
      }
      if (response.status == 201) {
        onSave(response.updatedOrder);
      }
      if (response.status == 408) {
        // setConflictMessage1(response.conflicts);
        const isStartConflict = response.conflicts.start.utc();
        const isEndConflict = response.conflicts.end.utc();
        isStartConflict &&
          setTimeInMessage(
            `Car is Not available before ${dayjs(isStartConflict).format(
              "HH:MM"
            )}`
          );
        isEndConflict &&
          setTimeOutMessage(
            `Car is Not available after ${dayjs(isEndConflict).format("HH:MM")}`
          );
      }
    } catch (error) {
      console.error("Error updating dates:", error);
      setUpdateMessage(error?.message);
    } finally {
      setIsUpdating(false);
    }
  };
  const handleCustomerUpdate = async () => {
    setIsUpdating(true);
    try {
      const updates = {
        customerName: editedOrder.customerName,
        phone: editedOrder.phone,
        email: editedOrder.email,
      };

      const response = await updateCustomerInfo(editedOrder._id, updates);
      showMessage(response.message);
      onSave(response.updatedOrder);
    } catch (error) {
      console.error("Error updating customer info:", error);
      setUpdateMessage("Failed to update customer details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeSelectedBox = (e) => {
    const { name, value } = e.target;
    console.log(e.target);
    const newValue = value;

    setEditedOrder({ ...editedOrder, [name]: newValue });
  };
  const handleChange = (field, value) => {
    const defaultStartHour = companyData.defaultStart.slice(0, 2);
    const defaultStartMinute = companyData.defaultStart.slice(-2);

    const defaultEndHour = companyData.defaultEnd.slice(0, 2);
    const defaultEndMinute = companyData.defaultEnd.slice(-2);
    let newValue = value;

    if (field === "rentalStartDate" || field === "rentalEndDate") {
      // Check if the value is valid and in 'YYYY-MM-DD' format for dates
      const isValidDate = dayjs(value, "YYYY-MM-DD", true).isValid();
      if (isValidDate) {
        newValue = dayjs(value);

        // Adjust timeIn and timeOut when rentalStartDate or rentalEndDate is changed
        if (field === "rentalStartDate") {
          newValue = newValue.hour(defaultStartHour).minute(defaultStartMinute);
        } else if (field === "rentalEndDate") {
          newValue = newValue.hour(defaultEndHour).minute(defaultEndMinute);
        }
      } else {
        console.error("Invalid date format");
        return; // Skip if the date format is invalid
      }
    }

    // if (field === "timeIn" || field === "timeOut") {
    //   // Check if the value is valid and in 'HH:mm' format for times
    //   const isValidTime = dayjs(value, "HH:mm", true).isValid();
    //   if (isValidTime) {
    //     if (field === "timeIn") {
    //       // Set timeIn, but apply it to the rentalStartDate
    //       newValue = dayjs(editedOrder.rentalStartDate)
    //         .utc()
    //         .hour(dayjs(value, "HH:mm").hour())
    //         .minute(dayjs(value, "HH:mm").minute());
    //     } else if (field === "timeOut") {
    //       // Set timeOut, but apply it to the rentalEndDate
    //       newValue = dayjs(editedOrder.rentalEndDate)
    //         .utc()
    //         .hour(dayjs(value, "HH:mm").hour())
    //         .minute(dayjs(value, "HH:mm").minute());
    //     }
    //   } else {
    //     console.error("Invalid time format");
    //     return; // Skip if the time format is invalid
    //   }
    // }

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
            const newValue = e.target.value;
            handleChange(field, newValue); // Pass the value to handleChange
          }}
          type={inputType}
        />
      </Box>
    );
  };

  return (
    <>
      {/* <Modal
        open={open}
        onClose={onClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      > */}
      <Paper
        sx={{
          width: { xs: 500, md: 700 },
          maxWidth: "90%",
          p: { xs: 2, md: 4 },
          maxHeight: "90vh",
          overflow: "auto",
          border: isConflictOrder ? "4px solid #FF0000" : "none",
          animation: isConflictOrder ? "pulse 2s infinite" : "none",
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              Редактировать заказ # {order?._id.slice(-4)}
            </Typography>
            {/* <Divider sx={{ my: 2 }} /> */}
            <Box
              display="flex"
              alignContent="center"
              alignItems="center"
              justifyContent="right"
            >
              <Typography variant="body1" sx={{ alignSelf: "center" }}>
                Всего цена: {editedOrder?.totalPrice} | Дней:{" "}
                {editedOrder?.numberOfDays}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleConfirmationToggle}
                disabled={isUpdating}
                sx={{
                  width: "100%",
                  backgroundColor: editedOrder?.confirmed
                    ? "text.green"
                    : "text.red",
                }}
              >
                {editedOrder?.confirmed
                  ? "Заказ подтвержден"
                  : "Заказ не подтвержден"}
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              {renderField("Rental Start Date", "rentalStartDate", "date")}
              {renderField("Rental End Date", "rentalEndDate", "date")}
              <TimePicker
                mb={2}
                startTime={dayjs(startTime).utc()}
                endTime={dayjs(endTime).utc()}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
                isRestrictionTimeIn={availableTimes?.availableStart}
                isRestrictionTimeOut={availableTimes?.availableEnd}
                timeInMessage={timeInMessage}
                timeOutMessage={timeOutMessage}
              />

              {/* {renderField("Place In", "placeIn")}
              {renderField("Place Out", "placeOut")} */}
              <RenderSelectField
                name="placeIn"
                label="Место выдачи"
                options={locations}
                updatedCar={editedOrder}
                handleChange={handleChangeSelectedBox}
                required
              />
              <RenderSelectField
                name="placeOut"
                label="Место возврата"
                updatedCar={editedOrder}
                options={locations}
                handleChange={handleChangeSelectedBox}
                required
              />
              <Button
                variant="contained"
                onClick={handleDateUpdate}
                disabled={isUpdating}
                sx={{ mt: 2 }}
              >
                Обновить данные заказа
              </Button>
              {conflictMessage1 && (
                <ConflictMessage
                  initialConflicts={conflictMessage1}
                  setUpdateMessage={setUpdateMessage}
                  type={1}
                />
              )}
              {conflictMessage2 && (
                <ConflictMessage
                  initialConflicts={conflictMessage2}
                  setUpdateMessage={setUpdateMessage}
                  type={2}
                />
              )}
              {/* {conflictMessage3 && (
                <ConflictMessage
                  initialConflicts={conflictMessage3}
                  setUpdateMessage={setUpdateMessage}
                  type={3}
                />
              )} */}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Инфо клиента
              </Typography>
              {renderField("Customer Name", "customerName")}
              {renderField("Phone", "phone")}
              {renderField("Email", "email")}
              <Button
                variant="contained"
                onClick={handleCustomerUpdate}
                disabled={isUpdating}
                sx={{ mt: 2 }}
              >
                Обновить инфо клиента
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Button onClick={onCloseModalEdit} variant="outlined">
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={handleDelete}
                disabled={isUpdating}
                color="error"
                sx={{ width: "30%" }}
              >
                {isUpdating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Удалить заказ"
                )}
              </Button>
            </Box>
          </>
        )}
      </Paper>
      {/* </Modal> */}
      <Snackbar
        open={snackbarOpen}
        message={updateMessage}
        closeFunc={handleSnackbarClose}
        isError={
          updateMessage && updateMessage.toLowerCase().includes("failed")
        }
      />
    </>
  );
};

export default EditOrderModal;

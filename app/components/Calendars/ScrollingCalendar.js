import React, { useState, useMemo } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangeCalendar } from "@mui/x-date-pickers-pro/DateRangeCalendar";
import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";

const ScrollingCalendar = React.memo(function ScrollingCalendar({
  car,
  setBookedDates,
  onBookingComplete,
}) {
  const [selectedRange, setSelectedRange] = useState([null, null]);

  const unavailableDates = useMemo(() => {
    if (!car?.orders || car.orders.length === 0) {
      return [];
    }

    const allUnavailableDates = [];
    car.orders.forEach((order) => {
      let currentDate = dayjs(order.rentalStartDate);
      const endDate = dayjs(order.rentalEndDate);

      while (
        currentDate.isBefore(endDate) ||
        currentDate.isSame(endDate, "day")
      ) {
        allUnavailableDates.push(currentDate.format("YYYY-MM-DD"));
        currentDate = currentDate.add(1, "day");
      }
    });

    return allUnavailableDates;
  }, [car.orders]);

  const handleDateChange = (newValue) => {
    setSelectedRange(newValue);
    const [start, end] = newValue;

    if (start && end) {
      setBookedDates({ start, end });
      onBookingComplete();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          maxWidth: "calc(100vh - 50px)",
          minWidth: "35vh",
          flexDirection: "column",
          alignItems: "center",
          mt: "auto",
          mb: 3,
          ml: 2,
          bgcolor: "white",
          boxShadow: 1,
          borderRadius: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{ textTransform: "uppercase", pt: 3, color: "primary.red" }}
        >
          Choose your dates for booking
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            mb: 2,
          }}
        ></Box>

        <DateRangeCalendar
          calendars={1}
          value={selectedRange}
          onChange={handleDateChange}
          disablePast
          shouldDisableDate={(date) =>
            unavailableDates.includes(dayjs(date).format("YYYY-MM-DD"))
          }
          // renderInput={(startProps, endProps) => (
          //   <React.Fragment>
          //     <TextField {...startProps} sx={{ m: 1 }} />
          //     <Box sx={{ mx: 2 }}> to </Box>
          //     <TextField {...endProps} sx={{ m: 1 }} />
          //   </React.Fragment>
          // )}
        />
      </Box>
    </LocalizationProvider>
  );
});

export default ScrollingCalendar;


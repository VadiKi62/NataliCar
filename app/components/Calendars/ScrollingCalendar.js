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

// import React, { useState, useMemo, useCallback } from "react";
// import dayjs from "dayjs";
// import { Box, Typography, IconButton, Button, Divider } from "@mui/material";
// import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
// import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// // Wrapping the component in React.memo
// const ScrollingCalendar = React.memo(function ScrollingCalendar({
//   car,
//   setBookedDates,
//   onBookingComplete,
// }) {
//   const [selectedStartDate, setSelectedStartDate] = useState(null);
//   const [selectedEndDate, setSelectedEndDate] = useState(null);
//   const [currentMonth, setCurrentMonth] = useState(dayjs());

//   // Memoize the unavailable dates
//   const unavailableDates = useMemo(() => {
//     if (!car?.orders || car.orders.length === 0) {
//       return [];
//     }

//     const allUnavailableDates = [];
//     car.orders.forEach((order) => {
//       let currentDate = dayjs(order.rentalStartDate);
//       const endDate = dayjs(order.rentalEndDate);

//       while (
//         currentDate.isBefore(endDate) ||
//         currentDate.isSame(endDate, "day")
//       ) {
//         allUnavailableDates.push(currentDate.format("YYYY-MM-DD"));
//         currentDate = currentDate.add(1, "day");
//       }
//     });

//     return allUnavailableDates;
//   }, [car.orders]);

//   // Memoize the days in the current month
//   const daysInMonth = useMemo(() => {
//     const currentMonthDays = [];
//     const startOfMonth = currentMonth.startOf("month");
//     const daysInCurrentMonth = currentMonth.daysInMonth();

//     for (let i = 1; i <= daysInCurrentMonth; i++) {
//       currentMonthDays.push(startOfMonth.date(i));
//     }

//     return currentMonthDays;
//   }, [currentMonth]);

//   const isDateDisabled = useCallback(
//     (date) => {
//       return unavailableDates.includes(dayjs(date).format("YYYY-MM-DD"));
//     },
//     [unavailableDates]
//   );
//   // Memoize isDateInRange function
//   const isDateInRange = useMemo(
//     () => (date) => {
//       if (selectedStartDate && selectedEndDate) {
//         const currentDate = dayjs(date);
//         return (
//           (currentDate.isAfter(dayjs(selectedStartDate)) ||
//             currentDate.isSame(dayjs(selectedStartDate))) &&
//           (currentDate.isBefore(dayjs(selectedEndDate)) ||
//             currentDate.isSame(dayjs(selectedEndDate)))
//         );
//       }
//       return false;
//     },
//     [selectedStartDate, selectedEndDate]
//   );

//   const handleDateClick = (date) => {
//     if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
//       // Start a new selection
//       setSelectedStartDate(date);
//       setSelectedEndDate(null);
//       // onDateSelect(date);
//       setBookedDates({ start: date, end: null });
//     } else {
//       // Complete the selection
//       let startDate, endDate;
//       if (dayjs(date).isBefore(dayjs(selectedStartDate))) {
//         startDate = date;
//         endDate = selectedStartDate;
//       } else {
//         startDate = selectedStartDate;
//         endDate = date;
//       }
//       setSelectedStartDate(startDate);
//       setSelectedEndDate(endDate);
//       setBookedDates({ start: startDate, end: endDate });
//       onBookingComplete();
//     }
//   };

//   const goToPreviousMonth = () => {
//     setCurrentMonth(currentMonth.subtract(1, "month"));
//   };

//   const goToNextMonth = () => {
//     setCurrentMonth(currentMonth.add(1, "month"));
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         maxWidth: "calc(100vh - 20px)",
//         minWidth: "50vh",
//         flexDirection: "column",
//         alignItems: "center",
//         mt: 3,
//         mb: 3,
//         bgcolor: "white",
//         boxShadow: 1,
//         borderRadius: 1,
//       }}
//     >
//       <Typography
//         variant="body2"
//         sx={{ textTransform: "uppercase", py: 2, color: "warning.main" }}
//       >
//         Choose your dates for booking
//       </Typography>
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           // width: "100%",
//           justifyContent: "space-between",
//           px: 2,
//           mb: 2,
//         }}
//       >
//         <IconButton onClick={goToPreviousMonth} size="small">
//           <ArrowBackIosIcon fontSize="small" />
//         </IconButton>
//         <Typography variant="h6" color="primary.main">
//           {currentMonth.format("MMMM YYYY")}
//         </Typography>
//         <IconButton onClick={goToNextMonth} size="small">
//           <ArrowForwardIosIcon fontSize="small" />
//         </IconButton>
//       </Box>

//       <Divider sx={{ width: "100%", mb: 2 }} />

//       <Box
//         sx={{
//           display: "flex",
//           overflowX: "auto",
//           width: "100%",
//           maxWidth: "calc(100vh - 60px)",
//           justifyContent: "center",
//           px: 2,
//           "&::-webkit-scrollbar": { display: "auto" },
//           msOverflowStyle: "auto",
//           scrollbarWidth: "auto",
//         }}
//       >
//         {daysInMonth.map((day) => {
//           const formattedDate = day.format("YYYY-MM-DD");
//           const isDisabled = isDateDisabled(formattedDate);
//           const isSelected =
//             formattedDate === selectedStartDate ||
//             formattedDate === selectedEndDate;
//           const isInRange = isDateInRange(formattedDate);
//           return (
//             <Button
//               key={formattedDate}
//               variant={
//                 isSelected ? "contained" : isInRange ? "contained" : "outlined"
//               }
//               sx={{
//                 minWidth: 40,
//                 height: 40,
//                 m: 0.5,
//                 flexShrink: 0,
//                 fontSize: "0.75rem",
//                 ...(isDisabled && {
//                   backgroundColor: "secondary.light",
//                   color: "white",
//                   "&:hover": {
//                     backgroundColor: "secondary.main",
//                   },
//                 }),
//                 ...(isInRange &&
//                   !isSelected && {
//                     backgroundColor: "primary.light",
//                     color: "primary.contrastText",
//                   }),
//               }}
//               onClick={() => !isDisabled && handleDateClick(formattedDate)}
//               disabled={isDisabled}
//             >
//               <Typography variant="body2">{day.format("D")}</Typography>
//             </Button>
//           );
//         })}
//       </Box>
//     </Box>
//   );
// });

// export default ScrollingCalendar;

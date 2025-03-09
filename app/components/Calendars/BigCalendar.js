"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TableContainer,
  Typography,
  IconButton,
  CircularProgress,
  Modal,
  Paper,
  Grid,
  ArrowLeft,
  Select,
  MenuItem,
} from "@mui/material";
import dayjs from "dayjs";
import { useMainContext } from "@app/Context";
import {
  functionToretunrStartEndOverlap,
  getConfirmedAndUnavailableStartEndDates,
  extractArraysOfStartEndConfPending,
  returnOverlapOrders,
  returnOverlapOrdersObjects,
} from "@utils/functions";
import CarTableRow from "./Row";
import EditOrderModal from "@app/components/Admin/Order/EditOrderModal";

export default function BigCalendar({ cars, orders }) {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [startEndDates, setStartEndDates] = useState([]);
  const [isConflictOrder, setIsConflictOrder] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  const { ordersByCarId, fetchAndUpdateOrders, allOrders } = useMainContext();

  const ordersByCarIdWithAllorders = useCallback((carId, orders) => {
    return orders?.filter((order) => order.car === carId);
  }, []);

  useEffect(() => {
    const { unavailable, confirmed, startEnd, transformedStartEndOverlap } =
      extractArraysOfStartEndConfPending(allOrders);

    const overlap = returnOverlapOrdersObjects(
      allOrders,
      transformedStartEndOverlap
    );

    setStartEndDates(startEnd);
  }, [orders]);

  const handleSaveOrder = async (updatedOrder) => {
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    await fetchAndUpdateOrders();
  };

  const [month, setMonth] = useState(dayjs().month()); // Initial month state (current month)
  const monthName = useMemo(() => dayjs().month(month).format("MMMM"), [month]);
  const daysInMonth = useMemo(
    () => dayjs().month(month).daysInMonth(),
    [month]
  );

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = dayjs()
        .month(month)
        .date(index + 1);
      return {
        dayjs: date,
        date: date.date(),
        weekday: date.format("dddd"),
      };
    });
  }, [month, daysInMonth]);

  // Handle changing the month
  const handlePrevMonth = () =>
    setMonth((prev) => (prev === 0 ? 11 : prev - 1));
  const handleNextMonth = () =>
    setMonth((prev) => (prev === 11 ? 0 : prev + 1));
  const handleSelectMonth = (e) => setMonth(e.target.value);

  return (
    <Box sx={{ overflowX: "auto", whiteSpace: "nowrap", py: 10 }}>
      <TableContainer sx={{ maxHeight: 950 }}>
        <Table aria-label="Car Orders Table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0, // Stick to the top
                  left: 0, // Stick to the left
                  backgroundColor: "white", // Ensure it's visible
                  zIndex: 4, // Highest z-index to ensure no overlap issues
                  fontWeight: "bold",
                }}
              >
                <Box display="flex" alignItems="center">
                  <Select
                    value={month}
                    onChange={handleSelectMonth}
                    size="small"
                    variant="outlined"
                    sx={{ mx: 1, minWidth: 120 }}
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <MenuItem key={index} value={index}>
                        {dayjs().month(index).format("MMMM")}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </TableCell>
              {days.map((day) => (
                <TableCell
                  sx={{
                    position: "sticky",
                    top: 0, // Stick to the top
                    backgroundColor: "white", // Ensure visibility
                    zIndex: 3, // Keep it above other content
                    fontWeight: "bold",
                  }}
                  key={day.dayjs}
                  align="center"
                >
                  <div>{day.date}</div>
                  <div>{day.weekday}</div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car._id}>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "secondary.dark",
                    color: "text.light",
                    zIndex: 2,
                    fontWeight: "bold",
                    padding: "7px",
                  }}
                >
                  {car.model} {car.regNumber}{" "}
                </TableCell>
                <CarTableRow
                  key={car._id}
                  car={car}
                  orders={ordersByCarIdWithAllorders(car._id, orders)}
                  days={days}
                  ordersByCarId={ordersByCarId}
                  setSelectedOrders={setSelectedOrders}
                  setOpen={setOpen}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid
          container
          spacing={1}
          justifyContent="center"
          sx={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "primary.main",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "background.paper",
            },
          }}
        >
          {selectedOrders.map((order, index) => (
            <Grid
              item
              key={order._id}
              xs={12}
              sm={selectedOrders.length === 1 ? 12 : 6}
              md={
                selectedOrders.length === 1
                  ? 12
                  : selectedOrders.length === 2
                  ? 6
                  : selectedOrders.length >= 3 && selectedOrders.length <= 4
                  ? 3
                  : 2
              }
            >
              <EditOrderModal
                order={order}
                open={open}
                onClose={handleClose}
                onSave={handleSaveOrder}
                // setCarOrders={setCarOrders}
                isConflictOrder={selectedOrders.length > 1 ? true : false}
                setIsConflictOrder={setIsConflictOrder}
                startEndDates={startEndDates}
              />
            </Grid>
          ))}
        </Grid>
      </Modal>
    </Box>
  );
}

// function CarTableRow({ car, days }) {
//   const { ordersByCarId } = useMainContext();
//   const [unavailableDates, setUnavailableDates] = useState([]);
//   const [confirmedDates, setConfirmedDates] = useState([]);
//   const [startEndOverlapDates, setStartEndOverlapDates] = useState(null);
//   const [overlapDates, setOverlapDates] = useState(null);
//   const [startEndDates, setStartEndDates] = useState([]);
//   const [carOrders, setCarOrders] = useState([]);
//   useEffect(() => {
//     const updatedOrders = ordersByCarId(car._id) || [];
//     if (car._id == "675b47e3af79aa7cefc80558") {
//       console.log("updatedOrders", updatedOrders);
//     }
//     setCarOrders(updatedOrders);
//   }, [car._id, ordersByCarId]);

//   // console.log(ordersByCarId);
//   // const orders = ordersByCarId(car._id);
//   // console.log("orders", orders);

//   // Extract and process order data
//   useEffect(() => {
//     const { unavailable, confirmed, startEnd, transformedStartEndOverlap } =
//       extractArraysOfStartEndConfPending(carOrders);

//     const overlap = returnOverlapOrdersObjects(
//       carOrders,
//       transformedStartEndOverlap
//     );
//     setOverlapDates(overlap);
//     setStartEndOverlapDates(transformedStartEndOverlap);
//     setUnavailableDates(unavailable);
//     setConfirmedDates(confirmed);
//     setStartEndDates(startEnd);
//   }, []);

//   const renderDateCell = useCallback(
//     (date) => {
//       const dateStr = date.format("YYYY-MM-DD");
//       const isConfirmed = confirmedDates.includes(dateStr);
//       const isUnavailable = unavailableDates.includes(dateStr);

//       const startEndInfo = startEndDates.find((d) => d.date === dateStr);
//       const isStartDate = startEndInfo?.type === "start";
//       const isEndDate = startEndInfo?.type === "end";
//       // проверяем чтобы эта дата не была одновременно начальной и конечной для разных броинрований
//       const isStartAndEndDateOverlapInfo = startEndOverlapDates?.find(
//         (dateObj) => dateObj.date === dateStr
//       );
//       // если предыдущая функция нашла что-то, то эта вернет тру, и если нет таких дат, которые начальные и конечные тогда это будет фолс
//       const isStartEndOverlap = Boolean(isStartAndEndDateOverlapInfo);

//       const overlapOrders = returnOverlapOrders(carOrders, dateStr);
//       // const isOverlapDate = overlapOrders.length > 1;
//       const isOverlapDateInfo = overlapDates?.find(
//         (dateObj) => dateObj.date === dateStr
//       );
//       const isOverlapDate = Boolean(isOverlapDateInfo);

//       // if (
//       //   orders[0]?.car === "670bb226223dd911f0595287" &&
//       //   overlapOrders.length > 1 &&
//       //   overlapDates
//       // ) {
//       //   // console.log("" overlapOrders.length > 1);
//       //   console.log("New : should be true ", isOverlapDate);
//       //   console.log(isOverlapDateInfo);
//       // }

//       let backgroundColor = "transparent";
//       let color = "inherit";
//       let borderRadius = "1px";
//       let border = "1px solid green";
//       let width;

//       if (isUnavailable) {
//         backgroundColor = "primary.green";
//         color = "text.dark";
//       }
//       if (isConfirmed) {
//         backgroundColor = "primary.red";
//         color = "common.white";
//       }

//       // Single order date styling
//       if (isStartDate && !isEndDate) {
//         borderRadius = "50% 0 0 50%";
//         width = "50%";
//         backgroundColor = "primary.green";
//         color = "common.white";
//       }
//       if (!isStartDate && isEndDate) {
//         borderRadius = "0 50% 50% 0";
//         width = "50%";
//         backgroundColor = "primary.green";
//         color = "common.white";
//       }

//       const handleDateClick = () => {
//         const relevantOrders = carOrders.filter((order) => {
//           const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
//           const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

//           return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
//         });

//         if (relevantOrders.length > 0) {
//           setSelectedOrders(relevantOrders);
//           setOpen(true);
//         }
//       };

//       if (isOverlapDate && !isStartEndOverlap) {
//         const circlesPending = isOverlapDateInfo.pending || 0; // Number of yellow circles
//         const circlesConfirmed = isOverlapDateInfo.confirmed || 0; // Number of red circles

//         return (
//           <Box
//             onClick={handleDateClick}
//             sx={{
//               border: border,
//               position: "relative",
//               height: "120%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "text.red",
//               backgroundColor: "text.green",
//               cursor: "pointer",
//               width: "100%",
//             }}
//           >
//             {/* Render red circles based on the number of confirmed */}
//             <Box
//               sx={{
//                 position: "absolute",
//                 top: 2, // Adjust position to place circles at the top
//                 display: "flex",
//                 gap: 1, // Spacing between circles
//                 justifyContent: "flex-end",
//                 width: "100%",
//               }}
//             >
//               {Array.from({ length: circlesConfirmed }).map((_, index) => (
//                 <Box
//                   key={index}
//                   sx={{
//                     width: 6, // Adjust circle size
//                     height: 6,
//                     backgroundColor: "primary.red",
//                     borderRadius: "50%",
//                   }}
//                 />
//               ))}
//             </Box>
//             {/* Render yellow circles based on the number of confirmed */}
//             <Box
//               sx={{
//                 position: "absolute",
//                 top: 2, // Adjust position to place circles at the top
//                 display: "flex",
//                 gap: 1, // Spacing between circles
//                 justifyContent: "center",
//                 width: "100%",
//               }}
//             >
//               {Array.from({ length: circlesPending }).map((_, index) => (
//                 <Box
//                   key={index}
//                   sx={{
//                     width: 6, // Adjust circle size
//                     height: 6,
//                     backgroundColor: "primary.green",
//                     borderRadius: "50%",
//                   }}
//                 />
//               ))}
//             </Box>
//           </Box>
//         );
//       }

//       // For overlapping start/end dates
//       if (isStartEndOverlap) {
//         return (
//           <Box
//             onClick={handleDateClick}
//             sx={{
//               border: border,
//               position: "relative",
//               width: "100%",
//               height: "100%",
//               display: "flex",
//               flexDirection: "row",
//               cursor: "pointer",
//             }}
//           >
//             {/* End Date Box - Left half */}
//             <Box
//               sx={{
//                 width: "50%",
//                 height: "100%",
//                 backgroundColor: isStartAndEndDateOverlapInfo.endConfirmed
//                   ? "primary.main"
//                   : "primary.green",
//                 borderRadius: "0 50% 50% 0",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: "common.white",
//               }}
//             ></Box>

//             {/* Start Date Box - Right half */}
//             <Box
//               sx={{
//                 width: "50%",
//                 height: "100%",
//                 backgroundColor: isStartAndEndDateOverlapInfo.startConfirmed
//                   ? "primary.main"
//                   : "primary.green",
//                 borderRadius: "0 50% 50% 0",
//                 borderRadius: "50% 0 0 50%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: "common.white",
//               }}
//             ></Box>
//           </Box>
//         );
//       }

//       //only start date
//       if (isStartDate && !isEndDate && !isOverlapDate)
//         return (
//           <Box
//             onClick={handleDateClick}
//             sx={{
//               border: border,
//               position: "relative",
//               width: "100%",
//               height: "100%",
//               display: "flex",
//               flexDirection: "row",
//               cursor: "pointer",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "50%",
//                 height: "100%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             ></Box>
//             <Box
//               sx={{
//                 width: "50%",
//                 height: "100%",
//                 borderRadius: "50% 0 0 50%",
//                 backgroundColor: startEndInfo.confirmed
//                   ? "primary.main"
//                   : "primary.green",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color,
//               }}
//             ></Box>
//           </Box>
//         );

//       if (!isStartDate && isEndDate)
//         return (
//           <Box
//             onClick={handleDateClick}
//             sx={{
//               border: border,
//               position: "relative",
//               width: "100%",
//               height: "100%",
//               display: "flex",
//               flexDirection: "row",
//               cursor: "pointer",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "50%",
//                 height: "100%",
//                 borderRadius: "0 50% 50% 0",
//                 backgroundColor: startEndInfo.confirmed
//                   ? "primary.main"
//                   : "primary.green",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color,
//               }}
//             ></Box>
//             <Box
//               sx={{
//                 width: "50%",
//                 height: "100%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               {" "}
//             </Box>
//           </Box>
//         );

//       // Regular cell rendering
//       return (
//         <Box
//           onClick={handleDateClick}
//           sx={{
//             position: "relative",
//             height: "100%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor,
//             borderRadius,
//             color,
//             cursor: "pointer",
//             border: border,
//             width: "100%",
//           }}
//         ></Box>
//       );
//     },
//     [confirmedDates, unavailableDates]
//   );

//   return (
//     <TableRow>
//       <TableCell>
//         {car.model} {car.regNumber}
//       </TableCell>
//       {days.map((day) => (
//         <TableCell key={day.dayjs.toString()} sx={{ padding: 0 }}>
//           <Box
//             sx={{
//               width: "100%",
//               height: "50px",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             {renderDateCell(day.dayjs)}
//           </Box>
//         </TableCell>
//       ))}
//     </TableRow>
//   );
// }

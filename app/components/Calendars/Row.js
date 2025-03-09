"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
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

export default function CarTableRow({
  car,
  days,
  orders,
  setSelectedOrders,
  setOpen,
}) {
  const { ordersByCarId } = useMainContext();
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [confirmedDates, setConfirmedDates] = useState([]);
  const [startEndOverlapDates, setStartEndOverlapDates] = useState(null);
  const [overlapDates, setOverlapDates] = useState(null);
  const [startEndDates, setStartEndDates] = useState([]);
  const [carOrders, setCarOrders] = useState(orders);

  // Update orders when allOrders or car._id changes
  useEffect(() => {
    const updatedOrders = ordersByCarId(car._id);
    setCarOrders(updatedOrders);
  }, [car._id, ordersByCarId]);

  // Extract and process order data
  useEffect(() => {
    const { unavailable, confirmed, startEnd, transformedStartEndOverlap } =
      extractArraysOfStartEndConfPending(carOrders);

    const overlap = returnOverlapOrdersObjects(
      carOrders,
      transformedStartEndOverlap
    );
    setOverlapDates(overlap);
    setStartEndOverlapDates(transformedStartEndOverlap);
    setUnavailableDates(unavailable);
    setConfirmedDates(confirmed);
    setStartEndDates(startEnd);
  }, []);

  const renderDateCell = useCallback(
    (date) => {
      const dateStr = date.format("YYYY-MM-DD");
      const isConfirmed = confirmedDates.includes(dateStr);
      const isUnavailable = unavailableDates.includes(dateStr);

      const startEndInfo = startEndDates.find((d) => d.date === dateStr);
      const isStartDate = startEndInfo?.type === "start";
      const isEndDate = startEndInfo?.type === "end";
      // проверяем чтобы эта дата не была одновременно начальной и конечной для разных броинрований
      const isStartAndEndDateOverlapInfo = startEndOverlapDates?.find(
        (dateObj) => dateObj.date === dateStr
      );
      // если предыдущая функция нашла что-то, то эта вернет тру, и если нет таких дат, которые начальные и конечные тогда это будет фолс
      const isStartEndOverlap = Boolean(isStartAndEndDateOverlapInfo);

      const overlapOrders = returnOverlapOrders(carOrders, dateStr);
      // const isOverlapDate = overlapOrders.length > 1;
      const isOverlapDateInfo = overlapDates?.find(
        (dateObj) => dateObj.date === dateStr
      );
      const isOverlapDate = Boolean(isOverlapDateInfo);

      // if (
      //   orders[0]?.car === "670bb226223dd911f0595287" &&
      //   overlapOrders.length > 1 &&
      //   overlapDates
      // ) {
      //   // console.log("" overlapOrders.length > 1);
      //   console.log("New : should be true ", isOverlapDate);
      //   console.log(isOverlapDateInfo);
      // }

      let backgroundColor = "transparent";
      let color = "inherit";
      let borderRadius = "1px";
      let border = "1px solid green";
      let width;

      if (isUnavailable) {
        backgroundColor = "primary.green";
        color = "text.dark";
      }
      if (isConfirmed) {
        backgroundColor = "primary.red";
        color = "common.white";
      }

      // Single order date styling
      if (isStartDate && !isEndDate) {
        borderRadius = "50% 0 0 50%";
        width = "50%";
        backgroundColor = "primary.green";
        color = "common.white";
      }
      if (!isStartDate && isEndDate) {
        borderRadius = "0 50% 50% 0";
        width = "50%";
        backgroundColor = "primary.green";
        color = "common.white";
      }

      const handleDateClick = () => {
        const relevantOrders = carOrders.filter((order) => {
          const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
          const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

          return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
        });

        if (relevantOrders.length > 0) {
          setSelectedOrders(relevantOrders);
          setOpen(true);
        }
      };

      if (isOverlapDate && !isStartEndOverlap) {
        const circlesPending = isOverlapDateInfo.pending || 0; // Number of yellow circles
        const circlesConfirmed = isOverlapDateInfo.confirmed || 0; // Number of red circles

        return (
          <Box
            onClick={handleDateClick}
            sx={{
              border: border,
              position: "relative",
              height: "120%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.red",
              backgroundColor: "text.green",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {/* Render red circles based on the number of confirmed */}
            <Box
              sx={{
                position: "absolute",
                top: 2, // Adjust position to place circles at the top
                display: "flex",
                gap: 1, // Spacing between circles
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              {Array.from({ length: circlesConfirmed }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6, // Adjust circle size
                    height: 6,
                    backgroundColor: "primary.red",
                    borderRadius: "50%",
                  }}
                />
              ))}
            </Box>
            {/* Render yellow circles based on the number of confirmed */}
            <Box
              sx={{
                position: "absolute",
                top: 2, // Adjust position to place circles at the top
                display: "flex",
                gap: 1, // Spacing between circles
                justifyContent: "center",
                width: "100%",
              }}
            >
              {Array.from({ length: circlesPending }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6, // Adjust circle size
                    height: 6,
                    backgroundColor: "primary.green",
                    borderRadius: "50%",
                  }}
                />
              ))}
            </Box>
          </Box>
        );
      }

      // For overlapping start/end dates
      if (isStartEndOverlap) {
        return (
          <Box
            onClick={handleDateClick}
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor: "pointer",
            }}
          >
            {/* End Date Box - Left half */}
            <Box
              sx={{
                width: "50%",
                height: "100%",
                backgroundColor: isStartAndEndDateOverlapInfo.endConfirmed
                  ? "primary.main"
                  : "primary.green",
                borderRadius: "0 50% 50% 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              {order?.timeEnd}
            </Box>

            {/* Start Date Box - Right half */}
            <Box
              sx={{
                width: "50%",
                height: "100%",
                backgroundColor: isStartAndEndDateOverlapInfo.startConfirmed
                  ? "primary.main"
                  : "primary.green",
                borderRadius: "0 50% 50% 0",
                borderRadius: "50% 0 0 50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
          </Box>
        );
      }

      //only start date
      if (isStartDate && !isEndDate && !isOverlapDate)
        return (
          <Box
            onClick={handleDateClick}
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                width: "50%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "50% 0 0 50%",
                backgroundColor: startEndInfo.confirmed
                  ? "primary.main"
                  : "primary.green",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}
            ></Box>
          </Box>
        );

      if (!isStartDate && isEndDate)
        return (
          <Box
            onClick={handleDateClick}
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "0 50% 50% 0",
                backgroundColor: startEndInfo.confirmed
                  ? "primary.main"
                  : "primary.green",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}
            ></Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {" "}
            </Box>
          </Box>
        );

      // Regular cell rendering
      return (
        <Box
          onClick={handleDateClick}
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor,
            borderRadius,
            color,
            cursor: "pointer",
            border: border,
            width: "100%",
          }}
        ></Box>
      );
    },
    [confirmedDates, unavailableDates]
  );

  return (
    <>
      {days.map((day) => (
        <TableCell key={day.dayjs.toString()} sx={{ padding: 0 }}>
          <Box
            sx={{
              width: "100%",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {renderDateCell(day.dayjs)}
          </Box>
        </TableCell>
      ))}
    </>
    // </TableRow>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Modal,
  Paper,
  Grid,
} from "@mui/material";
import { Calendar } from "antd";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LegendCalendarAdmin from "@app/components/common/LegendCalendarAdmin";
import EditOrderModal from "./EditOrderModal";
import {
  functionToretunrStartEndOverlap,
  getConfirmedAndUnavailableStartEndDates,
  extractArraysOfStartEndConfPending,
  returnOverlapOrders,
  returnOverlapOrdersObjects,
} from "@utils/functions";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const CalendarAdmin = ({
  isLoading = false,
  orders,
  handleOrderUpdate,
  setCarOrders,
}) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [confirmedDates, setConfirmedDates] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [isConflictOrder, setIsConflictOrder] = useState(false);
  const [startEndOverlapDates, setStartEndOverlapDates] = useState(null);
  const [overlapDates, setOverlapDates] = useState(null);
  const [startEndDates, setStartEndDates] = useState([]);
  const disabledDate = (current) => {
    const dateStr = current.format("YYYY-MM-DD");

    return (
      (current && current.isBefore(dayjs().startOf("day"))) ||
      (current &&
        current.isBefore(dayjs().startOf("day")) &&
        !isStartOrEnd &&
        confirmedDates?.includes(dateStr))
    );
  };

  useEffect(() => {
    const { unavailable, confirmed, startEnd, transformedStartEndOverlap } =
      extractArraysOfStartEndConfPending(orders);

    const overlap = returnOverlapOrdersObjects(
      orders,
      transformedStartEndOverlap
    );

    setOverlapDates(overlap);
    setStartEndOverlapDates(transformedStartEndOverlap);
    setUnavailableDates(unavailable);
    setConfirmedDates(confirmed);
    setStartEndDates(startEnd);
  }, [orders]);
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

      const overlapOrders = returnOverlapOrders(orders, dateStr);
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
      let border = "1px solid transparent";
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
        const relevantOrders = orders.filter((order) => {
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
            {date.date()}
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
              {date.date()}
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
            >
              {date.date()}
            </Box>
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
            >
              {" "}
              {date.date()}
            </Box>
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
            >
              {date.date()}
            </Box>
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
            >
              {" "}
              {date.date()}
            </Box>
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
              {date.date()}
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
          }}
        >
          {date.date()}
        </Box>
      );
    },
    [confirmedDates, unavailableDates, orders]
  );
  const handleClose = () => setOpen(false);

  const handleSaveOrder = (updatedOrder) => {
    // handleOrderUpdate();
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    const updatedOrders = orders.map((order) =>
      order._id === updatedOrder._id ? updatedOrder : order
    );
    setCarOrders(updatedOrders);
  };
  const headerRender = ({ value }) => {
    const current = value.clone();
    const month = current.format("MMMM");
    const year = current.year();

    const goToNextMonth = () => {
      setCurrentDate(currentDate.add(1, "month"));
    };

    const goToPreviousMonth = () => {
      setCurrentDate(currentDate.subtract(1, "month"));
    };

    return (
      <Box
        sx={{
          padding: 1,
          display: "flex",
          color: "common.black",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={goToPreviousMonth} color="inherit">
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography variant="h6" sx={{ margin: 0 }}>
          {`${month} ${year}`}
        </Typography>
        <IconButton onClick={goToNextMonth} color="inherit">
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", p: "20px" }}>
      {/* <LegendCalendarAdmin /> */}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Calendar
            fullscreen={false}
            disabledDate={disabledDate}
            fullCellRender={renderDateCell}
            headerRender={headerRender}
            value={currentDate}
          />
        </>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          onClick={(e) => {
            // Закрываем модал при клике на backdrop (вне контента)
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Grid
            container
            spacing={1}
            justifyContent="center"
            onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на контент
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
                  setCarOrders={setCarOrders}
                  isConflictOrder={selectedOrders.length > 1 ? true : false}
                  setIsConflictOrder={setIsConflictOrder}
                  startEndDates={startEndDates}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
};

export default CalendarAdmin;

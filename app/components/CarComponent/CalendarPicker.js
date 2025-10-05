import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Grid,
} from "@mui/material";
import { Calendar, DatePicker } from "antd";
import dayjs from "dayjs";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DefaultButton from "../common/DefaultButton";
import {
  functionToretunrStartEndOverlap,
  getConfirmedAndUnavailableStartEndDates,
  extractArraysOfStartEndConfPending,
  returnTime,
  calculateAvailableTimes,
} from "@utils/functions";
import { analyzeDates } from "@utils/analyzeDates";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "react-i18next";
import ClearIcon from "@mui/icons-material/Clear";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone
dayjs.tz.setDefault("Europe/Athens");

const CalendarPicker = ({
  isLoading,
  setBookedDates,
  onBookingComplete,
  orders,
  carId,
  setSelectedTimes,
  selectedTimes,
  onDateChange, // ⬅️ новый проп
  onCurrentDateChange, // ДОБАВИТЬ ЭТОТ PROP
  discount,
  discountStart,
  discountEnd,
}) => {
  const { t } = useTranslation();
  //console.log(t("order.chooseDates"));
  const [selectedRange, setSelectedRange] = useState([null, null]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [confirmedDates, setConfirmedDates] = useState([]);
  const [startEndDates, setStartEndDates] = useState([]);
  const [showBookButton, setShowBookButton] = useState(false);
  const [startEndOverlapDates, setStartEndOverlapDates] = useState(null);
  // Add refs for the calendar container and tracking clicks
  const lastClickTimeRef = useRef(0);
  const clickCountRef = useRef(0);
  const bookButtonRef = useRef(null);

  // --- useEffect для вертикального скроллинга всей страницы CarGrid ---
  useEffect(() => {
    if (showBookButton && bookButtonRef.current) {
      const button = bookButtonRef.current;
      const buttonRect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollY =
        window.scrollY +
        buttonRect.top +
        buttonRect.height / 2 -
        viewportHeight / 2;
      window.scrollTo({
        top: scrollY,
        behavior: "smooth",
      });
    }
  }, [showBookButton]);

  // Modified onSelect to handle double clicks
  // const onSelect = (date) => {
  //   const now = Date.now();
  //   const timeSinceLastClick = now - lastClickTimeRef.current;

  //   // Reset click count if it's been too long since the last click
  //   if (timeSinceLastClick > 300) {
  //     clickCountRef.current = 0;
  //   }

  //   clickCountRef.current += 1;
  //   lastClickTimeRef.current = now;

  //   // Handle double click
  //   if (clickCountRef.current === 2 && timeSinceLastClick < 300) {
  //     handleClearSelection();
  //     clickCountRef.current = 0;
  //     return;
  //   }

  //   // Regular single click handling
  //   const [start, end] = selectedRange;
  //   const dateStr = date.format("YYYY-MM-DD");

  //   if (!date.isSame(currentDate, "month")) {
  //     setCurrentDate(date.startOf("month"));
  //   }

  //   if (!start || (start && end)) {
  //     setSelectedRange([date, null]);
  //     setShowBookButton(false);
  //   } else {
  //     if (date.isBefore(start)) {
  //       setSelectedRange([date, null]);
  //       setShowBookButton(false);
  //     } else if (date.isSame(start, "day")) {
  //       setSelectedRange([start, null]);
  //       setShowBookButton(false);
  //     } else {
  //       const range = [start, date];
  //       const startStr = range[0];
  //       const endStr = range[1];
  //       setSelectedRange(range);

  //       const {
  //         availableStart,
  //         availableEnd,
  //         hourStart,
  //         minuteStart,
  //         hourEnd,
  //         minuteEnd,
  //       } = calculateAvailableTimes(startEndDates, startStr, endStr);

  //       setSelectedTimes({
  //         start: availableStart,
  //         end: availableEnd,
  //       });
  //       setBookedDates({
  //         start: dayjs.utc(range[0].hour(hourStart).minute(minuteStart)),
  //         end: dayjs.utc(range[1].hour(hourEnd).minute(minuteEnd)),
  //       });
  //       setShowBookButton(true);
  //     }
  //   }
  // };

  // Add a clear selection handler
  const handleClearSelection = () => {
    setSelectedRange([null, null]);
    setShowBookButton(false);
    setSelectedTimes({ start: null, end: null });
    setBookedDates({ start: null, end: null });
  };

  useEffect(() => {
    // функция которая возвращает 4 массива дат для удобного рендеринга клиентского календаря
    const { unavailable, confirmed, startEnd, transformedStartEndOverlap } =
      extractArraysOfStartEndConfPending(orders);

    // тестим в консоли на конкретной машине
    // if (carId === "670bb226223dd911f0595287") {
    //   console.log("startEnd DAYS", startEnd);
    //   console.log("transformedStartEnd", transformedStartEndOverlap);
    // }
    // задаем єти 4 массива в стейт
    setStartEndOverlapDates(transformedStartEndOverlap);
    setUnavailableDates(unavailable);
    setConfirmedDates(confirmed);
    setStartEndDates(startEnd);
  }, [orders]);

  // ДОБАВИТЬ ЭТОТ useEffect ЗДЕСЬ:
  useEffect(() => {
    //console.log("Текущий месяц:", currentDate.format("MMMM YYYY"));

    if (onCurrentDateChange) {
      onCurrentDateChange(currentDate);
    }
  }, [currentDate, onCurrentDateChange]);

  const renderDateCell = (date) => {
    // выбранные даты
    const [start, end] = selectedRange;
    const isSelected =
      (date >= start && date <= end) ||
      date.isSame(start, "day") ||
      date.isSame(end, "day");
    // текущая дата вокруг которой будет рендер и которая будет сравниваться
    const dateStr = date.format("YYYY-MM-DD");

    const isDisabled = disabledDate(date);

    // If the date is disabled, return it with no styles (transparent background)
    if (isDisabled) {
      return (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {date.date()}
        </Box>
      );
    }

    // проверяем подтвержденная ли єто дата
    const isConfirmed = confirmedDates?.includes(dateStr);
    // проверяем ожидающая ли єто дата (еще не подтвердженная)
    const isUnavailable = unavailableDates?.includes(dateStr);
    // проверяем начальная или конечная ли єто дата
    const startEndInfo = startEndDates.find((d) => d.date === dateStr);
    // проверяем начальная ли єто дата
    const isStartDate = startEndInfo?.type === "start";
    // проверяем конечная ли єто дата
    const isEndDate = startEndInfo?.type === "end";

    // проверяем чтобы эта дата не была одновременно начальной и конечной для разных броинрований
    const isStartAndEndDateOverlapInfo = startEndOverlapDates?.find(
      (dateObj) => dateObj.date === dateStr
    );
    // если предыдущая функция нашла что-то, то эта вернет тру, и если нет таких дат, которые начальные и конечные тогда это будет фолс
    const isStartAndEndDateOverlap = Boolean(isStartAndEndDateOverlapInfo);

    // тест в консоли для конкретной машины
    // if (carId === "670bb226223dd911f0595287" && isStartAndEndDateOverlap) {
    //   console.log("isStartAndEndDateOverlapInfo", isStartAndEndDateOverlapInfo);
    // }

    // ДАЛЬШЕ КОД ВНЕДРЯЕТ СТИЛИ для каждого типа

    const getTooltipMessage = () => {
      if (isConfirmed) return t("order.unavailableDate");
      if (isUnavailable) return t("order.not100Date");
      if (isStartDate && startEndInfo.type == "confirmed")
        return `Car needs to be returned after ${startEndInfo.time} `;
      if (isEndDate && startEndInfo.type == "confirmed")
        return `Car is availabe after ${startEndInfo.time} `;
      return null;
    };

    const tooltipMessage = getTooltipMessage();

    // здесь задаем базовые значения для - бекграунд цвета ячейки, цвета таекста, рамки, радиуса рамки
    // Rest of your existing conditions
    let backgroundColor = "transparent";
    let color = "inherit";
    let border = "1px solid grey";
    let borderRadius;

    // Общие стили
    const baseStyles = {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    //если мы тыкаем в ячейку то все предыдущие стили переписываются
    // If selected, these styles will override everything else
    if (isSelected) {
      return (
        <Box
          sx={{
            ...baseStyles,
            backgroundColor: "text.green",
            color: "white",
            border: "1px solid green",
            // Add !important to ensure these styles take precedence
            "& *": {
              backgroundColor: "text.green !important",
              color: "white !important",
              border: "1px solid green !important",
            },
          }}
        >
          {date.date()}
        </Box>
      );
    }

    if (
      isConfirmed ||
      isStartAndEndDateOverlapInfo?.endConfirmed ||
      isStartAndEndDateOverlapInfo?.startConfirmed
    ) {
      backgroundColor = "primary.red";
      color = "common.white";
    } else if (
      isUnavailable ||
      isStartAndEndDateOverlapInfo?.endPending ||
      isStartAndEndDateOverlapInfo?.startPending
    ) {
      backgroundColor = "rgba(194, 209, 224, 0.3)"; // Сделаем неподтвержденные заказы еще бледнее
      color = "common.black";
    }

    if (isConfirmed || isUnavailable) {
      return (
        <Tooltip title={tooltipMessage || ""} placement="top" arrow>
          <Box
            sx={{
              ...baseStyles,
              backgroundColor,
              borderRadius: "1px",
              color,
              border,
            }}
          >
            {date.date()}
          </Box>
        </Tooltip>
      );
    }

    if (isStartDate && !isEndDate && !isStartAndEndDateOverlap) {
      return (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            cursor: "pointer",
            border,
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
            {date.date()}
          </Box>

          <Tooltip title={tooltipMessage || ""} placement="top" arrow>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "50% 0 0 50%",
                backgroundColor: startEndInfo.confirmed
                  ? "primary.red"
                  : "rgba(194, 209, 224, 0.3)", // Сделаем неподтвержденные заказы еще бледнее
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: startEndInfo.confirmed ? "common.white" : "common.black",
              }}
            >
              {date.date()}
            </Box>
          </Tooltip>
        </Box>
      );
    }

    if (!isStartDate && isEndDate && !isStartAndEndDateOverlap) {
      return (
        <Box
          sx={{
            border,
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
          <Tooltip title={tooltipMessage || ""} placement="top" arrow>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "0 50% 50% 0",
                backgroundColor: startEndInfo.confirmed
                  ? "primary.red"
                  : "rgba(194, 209, 224, 0.3)", // Сделаем неподтвержденные заказы еще бледнее
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: startEndInfo.confirmed ? "common.white" : "common.black",
              }}
            >
              {date.date()}
            </Box>
          </Tooltip>
          <Box
            sx={{
              width: "50%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {date.date()}
          </Box>
        </Box>
      );
    }

    // For overlapping start/end dates
    if (isStartAndEndDateOverlap) {
      return (
        <Box
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
                : "rgba(194, 209, 224, 0.3)", // Сделаем неподтвержденные заказы еще бледнее
              borderRadius: "0 50% 50% 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isStartAndEndDateOverlapInfo.endConfirmed
                ? "common.white"
                : "common.black",
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
                : "rgba(194, 209, 224, 0.3)", // Сделаем неподтвержденные заказы еще бледнее
              borderRadius: "0 50% 50% 0",
              borderRadius: "50% 0 0 50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isStartAndEndDateOverlapInfo.startConfirmed
                ? "common.white"
                : "common.black",
            }}
          >
            {date.date()}
          </Box>
        </Box>
      );
    }
    //если ничего из меречисленного не работает то рендерить прозрачно
    //const { t } = useTranslation();
    return (
      <Box
        sx={{
          ...baseStyles,
          backgroundColor,
          borderRadius,
          color,
          border,
        }}
      >
        {date.date()}
      </Box>
    );
  };

  const handleBooking = () => {
    onBookingComplete();
    setShowBookButton(false);
  };

  const onSelect = (date) => {
    // --- ДОБАВЛЕНЫ ПРОВЕРКИ ДЛЯ ЗАПРЕТА КЛИКА ПО ПОДТВЕРЖДЁННЫМ ДАТАМ ---
    const dateStr = date.format("YYYY-MM-DD");
    const isConfirmed = confirmedDates?.includes(dateStr);
    const [start, end] = selectedRange;
    // 1. Если дата подтверждённая — просто выйти
    if (isConfirmed) return;
    // 2. Первый клик: если дата — начало подтверждённого заказа
    if (
      (!start || (start && end)) &&
      startEndDates.some(
        (d) => d.date === dateStr && d.type === "start" && d.confirmed
      )
    )
      return;
    // 3. Второй клик: если дата — конец подтверждённого заказа
    if (
      start &&
      !end &&
      startEndDates.some(
        (d) => d.date === dateStr && d.type === "end" && d.confirmed
      )
    )
      return;
    // 4. Второй клик: если в диапазоне есть подтверждённые даты
    if (start && !end && date.isAfter(start, "day")) {
      // Собираем все даты между start и date (включительно)
      const rangeDates = [];
      let cur = start.clone();
      while (cur.isSameOrBefore(date, "day")) {
        rangeDates.push(cur.format("YYYY-MM-DD"));
        cur = cur.add(1, "day");
      }
      const hasConfirmedInRange = rangeDates.some((d) =>
        confirmedDates.includes(d)
      );
      if (hasConfirmedInRange) {
        // Можно заменить на ваш snackbar
        if (onDateChange) {
          onDateChange({
            type: "error",
            message: "В выбранном диапазоне есть занятые даты!",
          });
        }
        // if (typeof window !== "undefined") {
        //   window.alert && window.alert("В выбранном диапазоне есть занятые даты!");
        // }
        return;
      }
    }
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;

    // Reset click count if it's been too long since the last click
    if (timeSinceLastClick > 300) {
      clickCountRef.current = 0;
    }

    clickCountRef.current += 1;
    lastClickTimeRef.current = now;

    // Handle double click
    if (clickCountRef.current === 2 && timeSinceLastClick < 300) {
      handleClearSelection();
      clickCountRef.current = 0;
      return;
    }

    if (!date.isSame(currentDate, "month")) {
      setCurrentDate(date.startOf("month"));
    }

    if (!start || (start && end)) {
      // First click or resetting the range
      setSelectedRange([date, null]);
      setShowBookButton(false);
    } else {
      if (date.isBefore(start)) {
        // If the second date is before the first, make it the new start
        setSelectedRange([date, null]);
        setShowBookButton(false);
      } else if (date.isSame(start, "day")) {
        // Prevent selecting the same date as both start and end
        setSelectedRange([start, null]);
        setShowBookButton(false);
      } else {
        // Regular behavior: set range with start and end dates
        const range = [start, date];
        const startStr = range[0];
        const endStr = range[1];
        setSelectedRange(range);

        const {
          availableStart,
          availableEnd,
          hourStart,
          minuteStart,
          hourEnd,
          minuteEnd,
        } = calculateAvailableTimes(startEndDates, startStr, endStr);

        // отдельно время забора и отдачи хранится в стринге "hh:mm"
        setSelectedTimes({
          start: availableStart,
          end: availableEnd,
        });
        setBookedDates({
          start: dayjs.utc(range[0].hour(hourStart).minute(minuteStart)),
          end: dayjs.utc(range[1].hour(hourEnd).minute(minuteEnd)),
        });
        setShowBookButton(true);
        console.log("selected time!!!!!!!", selectedTimes);
      }
    }
  };

  const disabledDate = (current) => {
    const dateStr = current.format("YYYY-MM-DD");

    // Проверяем, является ли дата началом или концом существующего бронирования
    const isStartOrEnd = startEndDates.some((d) => d.date === dateStr);
    const isConfirmed = confirmedDates?.includes(dateStr);
    // Проверяем, есть ли пересечения бронирований
    // const hasOverlappingBookings =
    //   orders.filter((order) => {
    //     const start = dayjs(order.rentalStartDate);
    //     const end = dayjs(order.rentalEndDate);
    //     return current.isBetween(start, end, "day", "[]");
    //   }).length > 1;
    return current.isBefore(dayjs().startOf("day"));
  };

  const headerRender = ({ value }) => {
    const current = value.clone();
    const month = current.format("MMMM");
    const year = current.year();

    // const goToNextMonth = () => {
    //   setCurrentDate((prev) => prev.add(1, "month"));
    // };

    // const goToPreviousMonth = () => {
    //   setCurrentDate((prev) => prev.subtract(1, "month"));
    // };
    // В headerRender обновите функции навигации:
    const goToNextMonth = () => {
      setCurrentDate((prev) => prev.add(1, "month"));
    };

    const goToPreviousMonth = () => {
      setCurrentDate((prev) => prev.subtract(1, "month"));
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
        <Box sx={{ display: "flex", gap: 1 }}>
          {selectedRange[0] && (
            <IconButton
              onClick={handleClearSelection}
              color="inherit"
              size="small"
              sx={{
                backgroundColor: "rgba(0,0,0,0.05)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.1)" },
              }}
            >
              <ClearIcon />
            </IconButton>
          )}
          <IconButton onClick={goToNextMonth} color="inherit">
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
        {/* <IconButton onClick={goToNextMonth} color="inherit">
          <ArrowForwardIosIcon />
        </IconButton> */}
      </Box>
    );
  };

  // Проверяем, действует ли скидка в текущем месяце
  let showDiscountInfo = false;
  let discountText = "";
  if (
    discount > 0 &&
    discountStart &&
    discountEnd &&
    dayjs(currentDate)
      .endOf("month")
      .isSameOrAfter(dayjs(discountStart), "day") &&
    dayjs(currentDate)
      .startOf("month")
      .isSameOrBefore(dayjs(discountEnd), "day")
  ) {
    showDiscountInfo = true;
    //   discountText = `Скидка ${discount}% с ${dayjs(discountStart).format(
    //     "DD.MM.YYYY"
    //   )} по ${dayjs(discountEnd).format("DD.MM.YYYY")}`;
    // }

    discountText =
      t("order.discount") +
      ` ${discount}% ` +
      t("basic.from") +
      `${dayjs(discountStart).format("DD.MM")} ` +
      t("basic.to") +
      `${dayjs(discountEnd).format("DD.MM")} `;
  }
  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: "10px 10px 10px 10px", sm: "10px 10px 10px 10px" },
      }}
    >
      {" "}
      {/* Уменьшили верхний padding */}
      <Typography
        variant="h6"
        sx={{
          lineHeight: "1.3rem",
          letterSpacing: "0.1rem",
          textTransform: "uppercase",
          marginBottom: showDiscountInfo ? "8px" : "20px",
          color: "primary.main",
        }}
      >
        {t("order.chooseDates")}
      </Typography>
      {/* {showDiscountInfo && (
        <Typography
          variant="body2"
          sx={{ color: "error.main", fontWeight: 600, mb: 2 }}
        >
          {discountText}
        </Typography>
      )} */}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          {showBookButton && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 2,
                mt: 1,
              }}
            >
              <DefaultButton
                ref={bookButtonRef}
                onClick={handleBooking}
                blinking={true}
                label={`Book ${selectedRange[0]?.format(
                  "MMM D"
                )} - ${selectedRange[1]?.format("MMM D")} `}
                relative={true}
                sx={{
                  backgroundColor: "#00ff00", // Ярко-зелёный цвет
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  minWidth: "200px",
                  boxShadow: "0 0 20px #00ff00",
                  animation: "bookButtonPulse 1.2s infinite",
                  display: "block",
                  "&:hover": {
                    backgroundColor: "#00c853",
                    animation: "none",
                  },
                  "@keyframes bookButtonPulse": {
                    "0%": {
                      backgroundColor: "#00ff00",
                      boxShadow: "0 0 20px #00ff00",
                      transform: "scale(1)",
                    },
                    "50%": {
                      backgroundColor: "#4cff4c",
                      boxShadow: "0 0 40px #4cff4c",
                      transform: "scale(1.08)",
                    },
                    "100%": {
                      backgroundColor: "#00ff00",
                      boxShadow: "0 0 20px #00ff00",
                      transform: "scale(1)",
                    },
                  },
                }}
              />
            </Box>
          )}

          <Calendar
            fullscreen={false}
            onSelect={onSelect}
            fullCellRender={renderDateCell}
            headerRender={headerRender}
            value={currentDate}
            disabledDate={disabledDate}
          />
        </>
      )}
    </Box>
  );
};

export default CalendarPicker;

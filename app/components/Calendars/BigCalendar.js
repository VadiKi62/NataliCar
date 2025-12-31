"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TableContainer,
  Select,
  MenuItem,
  Modal,
  Grid,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import { ActionButton, CancelButton, ConfirmModal, OrdersByDateModal, ModalLayout } from "../ui";
import dayjs from "dayjs";
import { useMainContext } from "@app/Context";
import CarTableRow from "./Row";
import {
  extractArraysOfStartEndConfPending,
  returnOverlapOrdersObjects,
} from "@utils/functions";
import EditOrderModal from "@app/components/Admin/Order/EditOrderModal";
import AddOrderModal from "@app/components/Admin/Order/AddOrderModal";
import { useSnackbar } from "notistack";
import { changeRentalDates } from "@utils/action";
import EditCarModal from "@app/components/Admin/Car/EditCarModal";
import LegendCalendarAdmin from "@app/components/common/LegendCalendarAdmin";

// ============================================
// BigCalendarHeader — UI-компонент шапки таблицы
// ============================================
function BigCalendarHeader({
  days,
  month,
  year,
  todayIndex,
  viewMode,
  rangeDirection,
  monthNames,
  weekday2,
  currentLang,
  isPortraitPhone,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  onDayClick,
  headerStyles,
}) {
  return (
    <TableHead>
      <TableRow>
        {/* Первая ячейка — выбор года/месяца */}
        <TableCell
          sx={{
            position: "sticky",
            left: 0,
            backgroundColor: headerStyles.baseBg,
            zIndex: 5,
            fontWeight: "bold",
            minWidth: 120,
            height: 82,
            py: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Верхняя строка: год */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 28,
                py: 0.5,
                mb: 0.1,
                "@media (max-width:900px) and (orientation: landscape)": {
                  mt: 2,
                },
              }}
            >
              <Select
                className="bigcalendar-year-select"
                value={year}
                onChange={onYearChange}
                size="small"
                sx={{
                  minWidth: 80,
                  fontSize: 13,
                  "& .MuiSelect-select": { py: 0.2, fontSize: 13 },
                }}
                renderValue={() => {
                  if (viewMode === "range15") {
                    const start =
                      rangeDirection === "forward"
                        ? dayjs().year(year).month(month).date(15)
                        : dayjs()
                            .year(year)
                            .month(month)
                            .subtract(1, "month")
                            .date(15);
                    const end =
                      rangeDirection === "forward"
                        ? start.add(1, "month").date(15)
                        : dayjs().year(year).month(month).date(15);
                    const y1 = start.year();
                    const y2 = end.year();
                    return y1 === y2 ? `${y1}` : `${y1}-${y2}`;
                  }
                  return `${year}`;
                }}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <MenuItem
                    key={index}
                    value={year - 2 + index}
                    sx={{ fontSize: 13, py: 0.2 }}
                  >
                    {year - 2 + index}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Нижняя строка: стрелки + месяц */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 28,
                py: 0.5,
                mt: 0.5,
                mb: 0,
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0,
                }}
              >
                <IconButton
                  size="small"
                  onClick={onPrevMonth}
                  sx={{ p: 0.15, mr: 0 }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 16,
                      height: 16,
                      color: headerStyles.weekdayText,
                      fontSize: 13,
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {"\u25C0"}
                  </Box>
                </IconButton>
                <Select
                  className="bigcalendar-month-select"
                  value={month}
                  onChange={onMonthChange}
                  size="small"
                  sx={{
                    minWidth: 80,
                    fontSize: 13,
                    "& .MuiSelect-select": {
                      py: 0.2,
                      fontSize: 13,
                      letterSpacing: 0,
                    },
                    mx: 0.15,
                  }}
                  renderValue={() => {
                    const months = monthNames[currentLang] || monthNames.en;
                    const abbr = (name) =>
                      isPortraitPhone && viewMode === "range15"
                        ? name.slice(0, 3)
                        : name;
                    if (viewMode === "range15") {
                      if (rangeDirection === "forward") {
                        const currentLabel = months[month];
                        const nextLabel = months[(month + 1) % 12];
                        return `${abbr(currentLabel)}-${abbr(nextLabel)}`;
                      } else {
                        const prevLabel = months[(month + 11) % 12];
                        const currentLabel = months[month];
                        return `${abbr(prevLabel)}-${abbr(currentLabel)}`;
                      }
                    }
                    return months[month];
                  }}
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <MenuItem
                      key={index}
                      value={index}
                      sx={{ fontSize: 13, py: 0.2 }}
                    >
                      {(monthNames[currentLang] || monthNames.en)[index]}
                    </MenuItem>
                  ))}
                </Select>
                <IconButton
                  size="small"
                  onClick={onNextMonth}
                  sx={{ p: 0.15, ml: 0 }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 16,
                      height: 16,
                      color: headerStyles.weekdayText,
                      fontSize: 13,
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {"\u25B6"}
                  </Box>
                </IconButton>
              </Box>
            </Box>
          </Box>
        </TableCell>

        {/* Ячейки дней */}
        {days.map((day, idx) => (
          <TableCell
            key={day.dayjs.valueOf()}
            align="center"
            title="Нажмите для просмотра всех начинающихся и заканчивающихся заказов на эту дату"
            className={idx === todayIndex ? "today-column-bg" : undefined}
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor:
                idx === todayIndex ? headerStyles.todayBg : headerStyles.baseBg,
              zIndex: 4,
              fontSize: "16px",
              padding: "6px",
              minWidth: 40,
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => onDayClick(day)}
          >
            <div
              style={{
                color: day.isSunday ? headerStyles.sundayText : "inherit",
              }}
            >
              {day.date}
            </div>
            <div
              style={{
                color: day.isSunday ? headerStyles.sundayText : "inherit",
              }}
            >
              {(weekday2[currentLang] || weekday2.en)[day.dayjs.day()]}
            </div>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ============================================
// BigCalendar — основной компонент
// ============================================
export default function BigCalendar({ cars, showLegend = true }) {
  // ─────────────────────────────────────────
  // Тема и цвета
  // ─────────────────────────────────────────
  const theme = useTheme();
  const calendarColors = theme.palette.calendar || {};

  // Централизованные стили для header
  const calendarHeaderStyles = useMemo(
    () => ({
      baseBg: "background.default",
      todayBg: calendarColors.today || "calendar.today",
      sundayText: calendarColors.sunday || theme.palette.primary.main,
      weekdayText: "text.primary",
      border: calendarColors.border || theme.palette.divider,
    }),
    [calendarColors, theme.palette.primary.main, theme.palette.divider]
  );
  
  // i18n для динамического перевода месяцев и дней недели
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  // Названия месяцев (полные) по языкам проекта
  const monthNames = useMemo(
    () => ({
      en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      ru: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ],
      el: [
        "Ιανουάριος",
        "Φεβρουάριος",
        "Μάρτιος",
        "Απρίλιος",
        "Μάιος",
        "Ιούνιος",
        "Ιούλιος",
        "Αύγουστος",
        "Σεπτέμβριος",
        "Οκτώβριος",
        "Νοέμβριος",
        "Δεκέμβριος",
      ],
    }),
    []
  );

  // Двухсимвольные сокращения дней недели (индекс 0 = Sunday) по языкам
  const weekday2 = useMemo(
    () => ({
      en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
      el: ["Κυ", "Δε", "Τρ", "Τε", "Πέ", "Πα", "Σά"],
    }),
    []
  );
  // ─────────────────────────────────────────
  // Notifications (snackbar)
  // ─────────────────────────────────────────
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const snackKeyRef = useRef(0);
  const showSingleSnackbar = (message, options = {}) => {
    snackKeyRef.current += 1;
    enqueueSnackbar(message, { key: snackKeyRef.current, ...options });
    if (snackKeyRef.current > 1) closeSnackbar(snackKeyRef.current - 1);
  };

  // ─────────────────────────────────────────
  // Context
  // ─────────────────────────────────────────
  const { ordersByCarId, fetchAndUpdateOrders, allOrders, updateCarInContext } =
    useMainContext();

  // ─────────────────────────────────────────
  // State: Навигация по календарю
  // ─────────────────────────────────────────
  const [month, setMonth] = useState(() => {
    const savedMonth = localStorage.getItem("bigCalendar_month");
    return savedMonth !== null ? parseInt(savedMonth, 10) : dayjs().month();
  });
  const [year, setYear] = useState(() => {
    const savedYear = localStorage.getItem("bigCalendar_year");
    return savedYear !== null ? parseInt(savedYear, 10) : dayjs().year();
  });
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bigCalendar_viewMode");
      if (saved === "range15" || saved === "full") return saved;
    }
    return "full";
  }); // 'full' | 'range15'
  const [rangeDirection, setRangeDirection] = useState("forward"); // 'forward' | 'backward'
  const [isPortraitPhone, setIsPortraitPhone] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(
      "(max-width: 600px) and (orientation: portrait)"
    );
    const handler = () => setIsPortraitPhone(mq.matches);
    handler();
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else if (mq.removeListener) mq.removeListener(handler);
    };
  }, []);

  // useEffect для сохранения в localStorage:
  useEffect(() => {
    localStorage.setItem("bigCalendar_month", month.toString());
  }, [month]);

  useEffect(() => {
    localStorage.setItem("bigCalendar_year", year.toString());
  }, [year]);

  // Сохраняем выбранный режим при изменении
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bigCalendar_viewMode", viewMode);
      } catch (e) {}
    }
  }, [viewMode]);

  // ─────────────────────────────────────────
  // State: Заказы и модалки
  // ─────────────────────────────────────────
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [startEndDates, setStartEndDates] = useState([]);
  const [isConflictOrder, setIsConflictOrder] = useState(false);
  const [open, setOpen] = useState(false);
  const [headerOrdersModal, setHeaderOrdersModal] = useState({
    open: false,
    date: null,
    orders: [],
  });
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const handleClose = () => setOpen(false);

  // ─────────────────────────────────────────
  // State: AddOrderModal
  // ─────────────────────────────────────────
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [selectedCarForAdd, setSelectedCarForAdd] = useState(null);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);

  // ─────────────────────────────────────────
  // State: Перемещение заказа
  // ─────────────────────────────────────────
  const [isMoving, setIsMoving] = useState(false);
  const [selectedMoveOrder, setSelectedMoveOrder] = useState(null);
  const [moveMode, setMoveMode] = useState(false);
  const [orderToMove, setOrderToMove] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    newCar: null,
  });

  // ─────────────────────────────────────────
  // State: Редактирование авто
  // ─────────────────────────────────────────
  const [selectedCarForEdit, setSelectedCarForEdit] = useState(null);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);

  const days = useMemo(() => {
    // Если режим диапазона 15-15 — строим дни между 15 текущего и 15 следующего месяца
    if (viewMode === "range15") {
      const start =
        rangeDirection === "forward"
          ? dayjs().year(year).month(month).date(15)
          : dayjs().year(year).month(month).subtract(1, "month").date(15);
      const end =
        rangeDirection === "forward"
          ? start.add(1, "month").date(15)
          : dayjs().year(year).month(month).date(15);
      const totalDays = end.diff(start, "day");
      return Array.from({ length: totalDays + 1 }, (_, index) => {
        const date = start.add(index, "day");
        return {
          dayjs: date,
          date: date.date(),
          weekday: date.format("dd"),
          isSunday: date.day() === 0,
        };
      });
    }
    // Иначе — полный месяц
    const dim = dayjs().year(year).month(month).daysInMonth();
    return Array.from({ length: dim }, (_, index) => {
      const date = dayjs().year(year).month(month).date(1).add(index, "day");
      return {
        dayjs: date,
        date: date.date(),
        weekday: date.format("dd"),
        isSunday: date.day() === 0,
      };
    });
  }, [month, year, viewMode]);

  const today = dayjs();
  const todayIndex = days.findIndex((d) => d.dayjs.isSame(today, "day"));

  // On phones, when the calendar mounts, scroll horizontally so today's
  // column is the first visible day column (accounting for the sticky first column).
  useEffect(() => {
    if (typeof window === "undefined") return;
    // treat phones as portrait phones OR small landscape phones
    const isPhonePortrait = window.matchMedia(
      "(max-width: 600px) and (orientation: portrait)"
    ).matches;
    const isSmallLandscape = window.matchMedia(
      "(max-width: 900px) and (orientation: landscape)"
    ).matches;
    const isPhone = isPhonePortrait || isSmallLandscape;
    if (!isPhone) return;

    const container =
      document.querySelector(".bigcalendar-root .MuiTableContainer-root") ||
      document.querySelector(".bigcalendar-root");
    if (!container) return;

    const scrollToToday = () => {
      try {
        const table =
          container.querySelector(".MuiTable-root") ||
          container.querySelector("table");
        if (!table) return;
        const headerCells = table.querySelectorAll("thead .MuiTableCell-root");
        if (!headerCells || headerCells.length === 0) return;
        // headerCells[0] is the fixed first column (car), days start at index 1
        // Scroll so that the first visible date is today minus 2 days (clamped to month start)
        const offsetDays = 2;
        const desiredDayIdx = Math.max(0, todayIndex - offsetDays);
        const targetIndex = 1 + desiredDayIdx;
        if (targetIndex < 1 || targetIndex >= headerCells.length) return;
        const targetCell = headerCells[targetIndex];
        const firstCell = headerCells[0];

        const tableRect = table.getBoundingClientRect();
        const cellRect = targetCell.getBoundingClientRect();
        const firstRect = firstCell
          ? firstCell.getBoundingClientRect()
          : { width: 0 };

        // offset of the target cell relative to the table left
        const offset = cellRect.left - tableRect.left;
        // aim to place the target cell right after the sticky first column
        const scrollLeft = Math.max(0, offset - firstRect.width - 4); // small gap
        // prefer smooth scroll when available, fallback to direct assignment
        if (typeof container.scrollTo === "function") {
          try {
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
          } catch (e) {
            container.scrollLeft = scrollLeft;
          }
        } else {
          container.scrollLeft = scrollLeft;
        }
      } catch (e) {
        // ignore
      }
    };

    // run shortly after mount so layout is ready
    const t = setTimeout(scrollToToday, 50);

    const onResize = () => setTimeout(scrollToToday, 50);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [todayIndex, days]);

  const handleEditCar = (car) => {
    setSelectedCarForEdit(car);
    setIsEditCarOpen(true);
  };

  // const handleSelectMonth = (e) => setMonth(e.target.value);
  // const handleSelectYear = (e) => setYear(e.target.value);

  const handleSelectMonth = (e) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    setViewMode("full");
    console.log(
      `Выбран месяц: ${dayjs().month(newMonth).format("MMMM")} (${newMonth})`
    );
  };

  const handleSelectYear = (e) => {
    const newYear = e.target.value;
    setYear(newYear);
    setViewMode("full");
    console.log(`Выбран год: ${newYear}`);
  };

  // Переключатели месяца
  // Логика кнопок:
  // - если 'full' -> перейти в 'range15' (окно 15-текущее до 15-следующего)
  // - если 'range15' -> вернуться в 'full' и сдвинуть месяц на +1 (для Next) или -1 (для Prev)
  const handlePrevMonth = () => {
    if (viewMode === "full") {
      setRangeDirection("backward");
      setViewMode("range15");
    } else {
      // шаг назад на полный предыдущий месяц
      setViewMode("full");
      const base = dayjs().year(year).month(month).subtract(1, "month");
      setMonth(base.month());
      setYear(base.year());
    }
  };

  const handleNextMonth = () => {
    if (viewMode === "full") {
      setRangeDirection("forward");
      setViewMode("range15");
    } else {
      // шаг вперёд на полный следующий месяц
      setViewMode("full");
      const base = dayjs().year(year).month(month).add(1, "month");
      setMonth(base.month());
      setYear(base.year());
    }
  };

  const ordersByCarIdWithAllorders = useCallback((carId, orders) => {
    return orders?.filter((order) => order.car === carId);
  }, []);

  // ИСПРАВЛЕННАЯ функция handleLongPress - только активирует режим перемещения
  const handleLongPress = (order) => {
    if (!order?._id) return;

    // Устанавливаем заказ для перемещения и включаем режим перемещения
    setSelectedMoveOrder(order);
    setOrderToMove(order);
    setMoveMode(true);

    // Показываем уведомление
    showSingleSnackbar(
      "Выберите другой автомобиль для перемещения заказа. Доступные автомобили выделены желтым цветом",
      {
        variant: "info",
        autoHideDuration: 8000,
      }
    );

    // НЕ открываем модальное окно редактирования!
  };

  useEffect(() => {
    const { startEnd } = extractArraysOfStartEndConfPending(allOrders);
    setStartEndDates(startEnd);
  }, [allOrders]);

  // Отключил добавление класса hide-navbar-on-landscape-sm для landscape,
  // чтобы Navbar был видим. Если нужно скрывать только легенду — используйте отдельный класс или медиазапрос.

  const handleSaveOrder = async (updatedOrder) => {
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    await fetchAndUpdateOrders();
  };

  const filteredStartEndDates = allOrders
    ? allOrders.map((order) => ({
        startStr: order.startDateISO || order.start,
        endStr: order.endDateISO || order.end,
        orderId: order._id,
      }))
    : [];

  const sortedCars = useMemo(() => {
    return [...cars].sort((a, b) => a.model.localeCompare(b.model));
  }, [cars]);

  // Генерируем массив дат для выбранного заказа в режиме перемещения
  const selectedOrderDates = useMemo(() => {
    if (!moveMode || !selectedMoveOrder) return [];

    const startDate = dayjs(selectedMoveOrder.rentalStartDate);
    const endDate = dayjs(selectedMoveOrder.rentalEndDate);
    const dates = [];

    let currentDate = startDate;
    while (currentDate.isSameOrBefore(endDate, "day")) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  }, [moveMode, selectedMoveOrder]);

  // Функция проверки совместимости автомобиля для перемещения
  const isCarCompatibleForMove = useCallback(
    (carId) => {
      if (!moveMode || !selectedMoveOrder) return true;

      // Исключаем автомобиль с текущим заказом
      if (selectedMoveOrder.car === carId) return false;

      // Получаем заказы целевого автомобиля
      const carOrders = ordersByCarId(carId);

      // Проверяем конфликты по времени
      const start = dayjs(selectedMoveOrder.rentalStartDate);
      const end = dayjs(selectedMoveOrder.rentalEndDate);

      const hasConflict = carOrders.some((order) => {
        if (order._id === selectedMoveOrder._id) return false; // Исключаем сам перемещаемый заказ

        const orderStart = dayjs(order.rentalStartDate);
        const orderEnd = dayjs(order.rentalEndDate);

        // Проверяем пересечение периодов
        return orderStart.isSameOrBefore(end) && orderEnd.isSameOrAfter(start);
      });

      return !hasConflict;
    },
    [moveMode, selectedMoveOrder, ordersByCarId]
  );

  const handleAddOrderClick = (car, dateStr) => {
    // Если в режиме перемещения - не открываем AddOrderModal
    if (moveMode) return;

    setSelectedCarForAdd(car);
    setSelectedDateForAdd(dateStr);
    setIsAddOrderOpen(true);
  };

  const selectedDate =
    headerOrdersModal.date &&
    dayjs(headerOrdersModal.date).format("YYYY-MM-DD");

  const startedOrders = headerOrdersModal.orders.filter((order) => {
    const start = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
    return start === selectedDate;
  });

  const endedOrders = headerOrdersModal.orders.filter((order) => {
    const end = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
    return end === selectedDate;
  });

  const getRegNumberByCarNumber = (carNumber) => {
    const car = cars.find((c) => c.carNumber === carNumber);
    return car ? car.regNumber : carNumber;
  };

  // ИСПРАВЛЕННАЯ функция обработки выбора автомобиля для перемещения
  const handleCarSelectForMove = (selectedCar) => {
    if (!moveMode || !selectedMoveOrder) return;

    // Находим информацию о старом автомобиле
    const oldCar = cars.find((car) => car._id === selectedMoveOrder.car);

    // Проверяем, что выбран другой автомобиль
    // if (selectedMoveOrder.car === selectedCar._id) {
    //   enqueueSnackbar("Заказ уже на этом автомобиле", { variant: "warning" });
    //   return;
    // }

    // Показываем модальное окно подтверждения с правильными данными
    setConfirmModal({
      open: true,
      newCar: selectedCar,
      oldCar: oldCar, // Добавляем информацию о старом автомобиле
    });
  };

  // Функция для выхода из режима перемещения
  const exitMoveMode = () => {
    setMoveMode(false);
    setSelectedMoveOrder(null);
    setOrderToMove(null);
    showSingleSnackbar("Режим перемещения отключён", { variant: "info" });
  };

  const updateOrder = async (orderData) => {
    console.log("🔄 Updating order with data:", orderData);

    try {
      const result = await changeRentalDates(
        orderData._id,
        new Date(orderData.rentalStartDate),
        new Date(orderData.rentalEndDate),
        new Date(orderData.timeIn || orderData.rentalStartDate),
        new Date(orderData.timeOut || orderData.rentalEndDate),
        orderData.placeIn || "",
        orderData.placeOut || "",
        orderData.car,
        orderData.carNumber
      );

      if (result?.status === 201 || result?.status === 202) {
        console.log("✅ Заказ успешно обновлён:", result.updatedOrder);
      } else if (result?.status === 408) {
        console.warn("⚠️ Конфликт по времени:", result.conflicts);
        alert(
          "Конфликт по времени аренды:\n" +
            JSON.stringify(result.conflicts, null, 2)
        );
      } else {
        console.error("❌ Ошибка при обновлении заказа", result);
        alert("Не удалось обновить заказ");
      }
    } catch (error) {
      console.error("🔥 Ошибка в updateOrder:", error);
      alert("Произошла ошибка при обновлении заказа");
    }
  };

  return (
    <Box

      sx={{
        display: "flex",
        flexDirection: "column",
        overflowX: "auto",
        overflowY: "hidden",
        // Учитываем высоту Navbar (~64px) + небольшой отступ
        pt: 4.5,
        maxWidth: "100vw",
        zIndex: 100,
        height: "100vh",
      }}
    >
      {/* Легенда календаря - встроена в BigCalendar */}
      {showLegend && (
        <Box
          className="bigcalendar-legend"
          sx={{
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            alignItems: "center",
            py: 0.5,
            px: 2,
            flexShrink: 0,
            "@media (max-width:900px) and (orientation: landscape)": {
              display: "none",
            },
          }}
        >
          <LegendCalendarAdmin />
        </Box>
      )}
      
      {/* Стили перенесены в globals.css для использования CSS переменных */}
      <TableContainer
        sx={{
          flex: 1,
          minHeight: 0,
          border: `1px solid ${calendarHeaderStyles.border}`,
          overflowX: "auto",
          overflowY: "auto",
          scrollBehavior: "smooth",
        }}
      >
        {/* minWidth для таблицы, чтобы на телефоне был скролл */}
        <Table
          stickyHeader
          sx={{ width: "auto", minWidth: { xs: 700, sm: 0 } }}
        >
          {/* Шапка таблицы — вынесена в отдельный компонент */}
          <BigCalendarHeader
            days={days}
            month={month}
            year={year}
            todayIndex={todayIndex}
            viewMode={viewMode}
            rangeDirection={rangeDirection}
            monthNames={monthNames}
            weekday2={weekday2}
            currentLang={currentLang}
            isPortraitPhone={isPortraitPhone}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onMonthChange={handleSelectMonth}
            onYearChange={handleSelectYear}
            onDayClick={(day) => {
              setHeaderOrdersModal({
                open: true,
                date: day.dayjs,
                orders: allOrders,
              });
            }}
            headerStyles={calendarHeaderStyles}
          />
          <TableBody>
            {sortedCars.map((car) => (
              <TableRow key={car._id}>
                <TableCell
                  className="bigcalendar-first-column"
                  onClick={() => handleEditCar(car)}
                  title="Нажмите для редактирования информации об автомобиле"
                  sx={{
                    position: "sticky",
                    left: 0,
                    // Use the same background as the Navbar to ensure visual consistency
                    backgroundColor: "secondary.main",
                    color: "backgroundLight.bg",
                    zIndex: 3,
                    padding: "0, 0, 0, 5px",
                    minWidth: 120,
                    cursor: "pointer",
                    "&:hover": {
                      // slightly different shade on hover but staying within primary palette
                      backgroundColor: "secondary.dark",
                    },
                  }}
                >
                  {car.model} {car.regNumber}
                </TableCell>

                <CarTableRow
                  key={car._id}
                  car={car}
                  orders={ordersByCarIdWithAllorders(car._id, allOrders)}
                  days={days}
                  ordersByCarId={ordersByCarId}
                  setSelectedOrders={setSelectedOrders}
                  setOpen={setOpen}
                  onAddOrderClick={handleAddOrderClick}
                  todayIndex={todayIndex}
                  onLongPress={handleLongPress}
                  filteredStartEndDates={filteredStartEndDates}
                  moveMode={moveMode}
                  onCarSelectForMove={handleCarSelectForMove}
                  orderToMove={orderToMove}
                  selectedMoveOrder={selectedMoveOrder}
                  onExitMoveMode={exitMoveMode}
                  selectedOrderDates={selectedOrderDates}
                  isCarCompatibleForMove={isCarCompatibleForMove(car._id)}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Модальное окно редактирования заказов - открывается только при обычном клике */}
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
                isConflictOrder={selectedOrders.length > 1 ? true : false}
                setIsConflictOrder={setIsConflictOrder}
                startEndDates={startEndDates}
                cars={cars}
                isViewOnly={dayjs(order.rentalEndDate).isBefore(dayjs(), "day")}
              />
            </Grid>
          ))}
        </Grid>
      </Modal>

      {/* AddOrderModal для создания нового заказа */}
      {isAddOrderOpen && selectedCarForAdd && (
        <AddOrderModal
          open={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          car={selectedCarForAdd}
          date={selectedDateForAdd}
          setUpdateStatus={(status) => {
            console.log("Update status:", status);
            if (status?.type === 200) {
              fetchAndUpdateOrders();
              setForceUpdateKey((prev) => prev + 1); // триггер перерисовки
            }
          }}
        />
      )}

      {/* Модальное окно для заказов по дате в шапке */}
      <OrdersByDateModal
        open={headerOrdersModal.open}
        onClose={() => setHeaderOrdersModal({ ...headerOrdersModal, open: false })}
        date={headerOrdersModal.date}
        startedOrders={startedOrders}
        endedOrders={endedOrders}
        getRegNumberByCarNumber={getRegNumberByCarNumber}
      />

      {/* Модальное окно подтверждения перемещения */}
      <ModalLayout
        open={confirmModal.open}
        onClose={() => {
          setConfirmModal({ open: false, newCar: null, oldCar: null });
          exitMoveMode();
        }}
        title="Подтверждение перемещения"
        size="small"
        centerVertically={false}
      >
        <Typography sx={{ mb: 3, color: "text.primary" }}>
          Вы хотите сдвинуть заказ с автомобиля{" "}
          <strong>{confirmModal.oldCar?.model}</strong> ({confirmModal.oldCar?.regNumber})
          на автомобиль <strong>{confirmModal.newCar?.model}</strong> ({confirmModal.newCar?.regNumber})?
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <CancelButton
              onClick={() => {
                setConfirmModal({ open: false, newCar: null, oldCar: null });
                exitMoveMode();
            }}
            label="НЕТ"
          />
          <ActionButton
            color="success"
              onClick={async () => {
                setConfirmModal({ open: false, newCar: null, oldCar: null });
                let success = false;
                try {
                  const result = await changeRentalDates(
                    selectedMoveOrder._id,
                    new Date(selectedMoveOrder.rentalStartDate),
                    new Date(selectedMoveOrder.rentalEndDate),
                  new Date(selectedMoveOrder.timeIn || selectedMoveOrder.rentalStartDate),
                  new Date(selectedMoveOrder.timeOut || selectedMoveOrder.rentalEndDate),
                    selectedMoveOrder.placeIn || "",
                    selectedMoveOrder.placeOut || "",
                    confirmModal.newCar._id,
                    confirmModal.newCar.carNumber,
                    selectedMoveOrder.ChildSeats,
                    selectedMoveOrder.insurance,
                    selectedMoveOrder.franchiseOrder,
                  selectedMoveOrder.numberOrder || selectedMoveOrder.orderNumber,
                    selectedMoveOrder.insuranceOrder,
                    selectedMoveOrder.totalPrice,
                    selectedMoveOrder.numberOfDays
                  );

                  if (result?.status === 201 || result?.status === 202) {
                    await fetchAndUpdateOrders();
                  showSingleSnackbar(`Заказ сдвинут на ${confirmModal.newCar.model}`, { variant: "success" });
                    success = true;
                  }
                } catch (error) {
                showSingleSnackbar(`Ошибка перемещения: ${error.message}`, { variant: "error" });
                } finally {
                  if (!success) exitMoveMode();
                }
              }}
            label="ДА"
          />
          </Box>
      </ModalLayout>

      {isEditCarOpen && selectedCarForEdit && (
        <EditCarModal
          open={isEditCarOpen}
          onClose={() => {
            setIsEditCarOpen(false);
            setSelectedCarForEdit(null);
          }}
          updatedCar={selectedCarForEdit}
          setUpdatedCar={setSelectedCarForEdit}
          updateCarInContext={updateCarInContext}
          handleChange={(e) =>
            setSelectedCarForEdit((prev) => ({
              ...prev,
              [e.target.name]: e.target.value,
            }))
          }
          handleCheckboxChange={(e) =>
            setSelectedCarForEdit((prev) => ({
              ...prev,
              [e.target.name]: e.target.checked,
            }))
          }
          handleUpdate={async () => {
            const response = await updateCarInContext(selectedCarForEdit);
            if (response?.type === 200) {
              enqueueSnackbar("Машина обновлена", { variant: "success" });
              fetchAndUpdateOrders();
              setIsEditCarOpen(false);
            } else {
              enqueueSnackbar("Ошибка обновления", { variant: "error" });
            }
          }}
        />
      )}
    </Box>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Collapse,
  Button,
} from "@mui/material";
import { styled as muiStyled } from "@mui/material/styles";
// Стили для заголовка автомобиля (как в CarDetails)
const CarTitle = muiStyled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: theme.spacing(1.7),
  marginTop: theme.spacing(2.5),
  width: "60%",
  textAlign: "center",
  // уменьшенный отступ сверху для горизонтальных телефонов
  ["@media (max-width:900px) and (orientation: landscape)"]: {
    marginTop: theme.spacing(0.5),
    fontSize: "1.35rem",
  },
}));
import Image from "next/image";
import Link from "next/link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { lazy, Suspense } from "react";
import { fetchCar } from "@utils/action";
import { fetchOrdersByCar } from "@utils/action";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import { useMainContext } from "@app/Context";


// Lazy load тяжелых компонентов для улучшения производительности
const BookingModal = lazy(() => import("./BookingModal"));
const CalendarPicker = lazy(() => import("./CalendarPicker"));
const PricingTiers = lazy(() => import("@app/components/CarComponent/PricingTiers"));
const CarDetails = lazy(() => import("./CarDetails"));
const CarDetailsModal = lazy(() => import("./CarDetailsModal"));

import { CldImage } from "next-cloudinary";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";

// ДОБАВИТЬ ЭТУ СТРОКУ:
import dayjs from "dayjs";

const StyledCarItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0.5), // Уменьшили с 1 до 0.5
  marginLeft: 2,
  maxWidth: 400,
  zIndex: 22,
  display: "flex",
  justifyContent: "center",
  backgroundColor: "#fff",
  alignItems: "center",
  alignContent: "center",
  flexDirection: "column",
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[5],
  },
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 700,
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up("md")]: {
    // flexDirection: "row",
    // alignItems: "center",
    minWidth: 980,
    padding: theme.spacing(3),
  },
}));

const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const CarImage = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",

  // Мобильные устройства - компактнее
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(1), // Уменьшенный отступ снизу
  },

  [theme.breakpoints.up("md")]: {
    width: 450,
    height: 300,
  },
}));

// Row that places image/params (left) and calendar/pricing (right)
const MediaRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  // For small landscape phones split 40/60
  "@media (max-width:900px) and (orientation: landscape)": {
    flexDirection: "row",
    "& .car-image-wrapper": {
      flex: "0 0 40%",
      maxWidth: "40%",
    },
    "& .calendar-wrapper": {
      flex: "0 0 60%",
      maxWidth: "60%",
    },
  },
}));

// const StyledCarDetails = styled(Box)(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   flexGrow: 1,
// }));

const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

// Мемоизируем компонент для предотвращения ненужных ре-рендеров
const CarItemComponent = React.memo(function CarItemComponent({ 
  car, 
  discount, 
  discountStart, 
  discountEnd,
}) {
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  // Для хранения id последнего снэка
  const lastSnackRef = useRef(null);
  // --- Скидка теперь приходит из родителя ---
  const [imageLoading, setImageLoading] = useState(true);
  useEffect(() => {
    // Set a 3-second delay before showing the image
    const loadingTimer = setTimeout(() => {
      setImageLoading(false);
    }, 3000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(loadingTimer);
  }, []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [bookDates, setBookedDates] = useState({ start: null, end: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState({
    start: null,
    end: null,
  });
  const [calculatedPrice, setCalculatedPrice] = useState(null); // Просчитанная цена из календаря

  // Состояние для передачи месяца из календаря:
  const [currentCalendarDate, setCurrentCalendarDate] = useState(dayjs());

  const { fetchAndUpdateOrders, isLoading, ordersByCarId, allOrders } =
    useMainContext();
  const [carOrders, setCarOrders] = useState([]);

  // Update orders when allOrders or car._id changes
  useEffect(() => {
    const updatedOrders = ordersByCarId(car._id);
    setCarOrders(updatedOrders);
  }, [allOrders, car._id, ordersByCarId]);

  const handleBookingComplete = () => {
    setModalOpen(true);
  };

  // ДОБАВИТЬ ЭТУ ФУНКЦИЮ для передачи месяца из календаря:
  const handleCurrentDateChange = (newDate) => {
    // console.log(
    //   "CarItemComponent получил новую дату:",
    //   newDate.format("YYYY-MM-DD")
    // );
    setCurrentCalendarDate(newDate);
  };

  // Добавляем ref для контейнера CarItemComponent
  const carItemRef = useRef(null);
  // ref для контейнера изображения — будем измерять ширину для расчёта шрифта стикера
  const carImageRef = useRef(null);
  const [stickerFont, setStickerFont] = useState(null);

  // Скроллим CarItemComponent чуть выше центра экрана, когда появляется кнопка BOOK
  useEffect(() => {
    if (carItemRef.current && bookDates?.start && bookDates?.end) {
      const rect = carItemRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Смещение вверх на 160px (можно изменить по желанию)
      const offset = -160;
      const scrollY =
        window.scrollY +
        rect.top +
        rect.height / 2 -
        viewportHeight / 2 +
        offset;
      window.scrollTo({
        top: scrollY,
        behavior: "smooth",
      });
    }
  }, [bookDates?.start, bookDates?.end]);

  // Рассчитываем размер шрифта для стикера в зависимости от ширины контейнера изображения
  useEffect(() => {
    const node = carImageRef.current;
    if (!node) return;

    const computeFont = () => {
      const width = node.clientWidth || 0;
      // Фактор 0.038 — немного уменьшенный для лучшей гарантии размещения в одну строку
      // Ограничиваем размер шрифта в пикселях между 8 и 15
      const px = Math.round(Math.max(8, Math.min(15, width * 0.038)));
      setStickerFont(px + "px");
    };

    // Initial
    computeFont();

    // ResizeObserver — обновляем при изменении ширины
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => computeFont());
      ro.observe(node);
    } else {
      // Фоллбек на window.resize
      window.addEventListener("resize", computeFont);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", computeFont);
    };
  }, []);

  // Добавляем обработчик для CalendarPicker
  const handleDateChange = ({ type, message }) => {
    // Закрыть предыдущий снэк, если есть
    if (lastSnackRef.current) {
      closeSnackbar(lastSnackRef.current);
    }
    // Показать новый снэк и сохранить его id
    lastSnackRef.current = enqueueSnackbar(message, { variant: type });
  };

  return (
    <StyledCarItem elevation={3} ref={carItemRef}>
      <Wrapper>
        {/* Название автомобиля над фото (единый стиль) */}
        <CarTitle variant="h5">{car.model}</CarTitle>
        <MediaRow>
          <Box className="car-image-wrapper">
            <CarImage
              ref={carImageRef}
              style={{
                position: "relative",
                cursor: "pointer",
                marginBottom: 24,
              }}
            >
              {/* Стикер 'Без депозита' */}
              {!imageLoading && car.deposit === 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 2,
                    bgcolor: "calendar.today",
                    color: "text.primary",
                    width: "32%", // увеличили ширину, чтобы поместилась надпись
                    minWidth: 110,
                    px: "3%", // увеличили горизонтальные отступы
                    py: "1%",
                    borderRadius: 2,
                    fontWeight: 700,
                    // responsive font: computed from image width (stickerFont) or fallback clamp
                    fontSize: stickerFont || "clamp(0.6rem, 2vw, 1rem)",
                    boxShadow: 2,
                    textTransform: "uppercase",
                    pointerEvents: "none",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    // force single-line to keep text in one line
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t("car.noDeposit") || "Без депозита"}
                </Box>
              )}
              {imageLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <CircularProgress />
                  <CircularProgress sx={{ color: "primary.green" }} />
                  <CircularProgress sx={{ color: "primary.red" }} />
                </Box>
              ) : (
                <>
                  <CldImage
                    onClick={() => setDetailsModalOpen(true)}
                    src={car?.photoUrl || "NO_PHOTO_h2klff"}
                    alt={`Natali-Cars-${car.model}`}
                    width="450"
                    height="300"
                    crop="fill"
                    priority
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "auto",
                      cursor: "pointer",
                    }}
                    onLoad={() => setImageLoading(false)}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailsModalOpen(true);
                    }}
                    variant="outlined"
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: { xs: 4, sm: 8 },
                      right: { xs: 4, sm: 8 },
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      padding: { xs: "2px 6px", sm: "4px 8px" },
                      zIndex: 1,
                    }}
                  >
                    {t("car.viewDetails")}
                  </Button>
                </>
              )}
            </CarImage>
            <Suspense fallback={<CircularProgress size={24} />}>
              <CarDetails car={car} />
            </Suspense>
          </Box>
          <Box className="calendar-wrapper">
            <Suspense fallback={<CircularProgress size={24} />}>
              <CalendarPicker
              carId={car._id}
              car={car}
              isLoading={isLoading}
              orders={carOrders}
              setBookedDates={setBookedDates}
              onBookingComplete={handleBookingComplete}
              setSelectedTimes={setSelectedTimes}
              selectedTimes={selectedTimes}
              onCurrentDateChange={handleCurrentDateChange}
              discount={discount}
              discountStart={discountStart}
              discountEnd={discountEnd}
              onDateChange={handleDateChange}
              onPriceCalculated={setCalculatedPrice}
              />
            </Suspense>
            {/* Информация о дискаунте с логикой как в PricingTiers */}
            {(() => {
              // Логика отображения надписи о скидке:
              // Для будущих месяцев — как раньше (весь месяц),
              // для текущего — от сегодня до конца месяца.
              if (!discount || !discountStart || !discountEnd) return null;
              const isCurrentMonth = currentCalendarDate.isSame(
                dayjs(),
                "month"
              );
              const monthStart = currentCalendarDate.startOf("month");
              const monthEnd = currentCalendarDate.endOf("month");
              const rangeStart = isCurrentMonth
                ? dayjs().startOf("day")
                : monthStart;
              let discountType = "none"; // 'full', 'partial', 'none'

              if (
                typeof discount === "number" &&
                discount > 0 &&
                discountStart &&
                discountEnd
              ) {
                if (
                  rangeStart.isSameOrAfter(discountStart, "day") &&
                  monthEnd.isSameOrBefore(discountEnd, "day")
                ) {
                  discountType = "full";
                } else if (
                  monthEnd.isSameOrAfter(discountStart, "day") &&
                  rangeStart.isSameOrBefore(discountEnd, "day")
                ) {
                  discountType = "partial";
                } else {
                  discountType = "none";
                }
              }

              if (discountType === "none") return null; // НЕ показываем надпись

              const discountText =
                discountType === "full"
                  ? `${t("order.discount")} ${discount}%`
                  : `${t("order.discount")} ${discount}% ${t(
                      "basic.from"
                    )} ${dayjs(discountStart).format("DD.MM")} ${t(
                      "basic.till"
                    )} ${dayjs(discountEnd).format("DD.MM")}`;

              return (
                <Typography
                  variant="body2"
                  sx={{
                    mt: { xs: 0.5, sm: 0.5 },
                    mb: { xs: 0.5, sm: 0.5 },
                    color: "error.main",
                    fontWeight: 600,
                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    textAlign: "center",
                  }}
                >
                  {discountText}
                </Typography>
              );
            })()}
            {car?.pricingTiers && (
              <Suspense fallback={<CircularProgress size={24} />}>
                <PricingTiers
                  prices={car?.pricingTiers}
                  selectedDate={currentCalendarDate}
                  discount={discount}
                  discountStart={discountStart}
                  discountEnd={discountEnd}
                />
              </Suspense>
            )}
          </Box>
        </MediaRow>
      </Wrapper>
      {modalOpen && (
        <Suspense fallback={<CircularProgress size={24} />}>
          <BookingModal
            fetchAndUpdateOrders={fetchAndUpdateOrders}
            open={modalOpen}
            car={car}
            orders={carOrders}
            presetDates={{ startDate: bookDates?.start, endDate: bookDates?.end }}
            isLoading={isLoading}
            selectedTimes={selectedTimes}
            initialPrice={calculatedPrice}
            onClose={() => {
              setModalOpen(false);
              setCalculatedPrice(null); // Сбрасываем цену при закрытии
            }}
          />
        </Suspense>
      )}
      {detailsModalOpen && (
        <Suspense fallback={<CircularProgress size={24} />}>
          <CarDetailsModal
            open={detailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            car={car}
          />
        </Suspense>
      )}
    </StyledCarItem>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  // Сравниваем только примитивные значения для производительности
  const carChanged = prevProps.car?._id !== nextProps.car?._id;
  const discountChanged = prevProps.discount !== nextProps.discount;
  
  // Для dayjs объектов сравниваем через valueOf (timestamp)
  const discountStartChanged = 
    prevProps.discountStart?.valueOf() !== nextProps.discountStart?.valueOf();
  const discountEndChanged = 
    prevProps.discountEnd?.valueOf() !== nextProps.discountEnd?.valueOf();
  
  // Возвращаем true если ничего не изменилось (не нужно ре-рендерить)
  return !carChanged && !discountChanged && !discountStartChanged && !discountEndChanged;
});

CarItemComponent.displayName = "CarItemComponent";

export default CarItemComponent;

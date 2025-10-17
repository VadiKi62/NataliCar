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
}));
import Image from "next/image";
import Link from "next/link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScrollingCalendar from "../Calendars/ScrollingCalendar";
import { fetchCar } from "@utils/action";
import { fetchOrdersByCar } from "@utils/action";
import BookingModal from "./BookingModal";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CalendarPicker from "./CalendarPicker";
import { useMainContext } from "@app/Context";
import PricingTiers from "@app/components/CarComponent/PricingTiers";
import CarDetails from "./CarDetails";
import CarDetailsModal from "./CarDetailsModal";

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
  bgColor: "black",
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

function CarItemComponent({ car, discount, discountStart, discountEnd }) {
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
  }, [carImageRef.current]);

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
        <CarImage
          ref={carImageRef}
          style={{ position: "relative", cursor: "pointer", marginBottom: 24 }}
        >
          {/* Стикер 'Без депозита' */}
          {!imageLoading && car.deposit === 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 2,
                bgcolor: "#ffe066",
                color: "#333",
                width: "28%", // 28% от ширины контейнера с изображением
                px: "3%", // отступы в процентах от ширины контейнера
                py: "1%",
                borderRadius: 2,
                fontWeight: 700,
                // responsive font: computed from image width (stickerFont) or fallback clamp
                fontSize: stickerFont || "clamp(0.6rem, 2vw, 1rem)",
                boxShadow: 2,
                border: "2px solid #ffd700",
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
        <CarDetails car={car} />
      </Wrapper>
      <Stack>
        <CalendarPicker
          carId={car._id}
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
        />
        {/* Информация о дискаунте с логикой как в PricingTiers */}
        {discount &&
          discountStart &&
          discountEnd &&
          (() => {
            const monthStart = currentCalendarDate.startOf("month");
            const monthEnd = currentCalendarDate.endOf("month");
            let discountType = "none"; // 'full', 'partial', 'none'

            if (
              typeof discount === "number" &&
              discount > 0 &&
              discountStart &&
              discountEnd
            ) {
              // Скидка покрывает весь месяц
              if (
                monthStart.isSameOrAfter(discountStart, "day") &&
                monthEnd.isSameOrBefore(discountEnd, "day")
              ) {
                discountType = "full";
              } else if (
                monthEnd.isSameOrAfter(discountStart, "day") &&
                monthStart.isSameOrBefore(discountEnd, "day")
              ) {
                // Скидка покрывает часть месяца
                discountType = "partial";
              }
            }

            // Отображаем информацию о скидке только если она действует хотя бы частично
            if (discountType !== "none") {
              let discountText = "";
              if (discountType === "full") {
                discountText = `${t("order.discount")} ${discount}%`;
              } else if (discountType === "partial") {
                discountText = `${t("order.discount")} ${discount}% ${t(
                  "basic.from"
                )} ${dayjs(discountStart).format("DD.MM")} ${t(
                  "basic.till"
                )} ${dayjs(discountEnd).format("DD.MM")}`;
              }

              return (
                <Typography
                  variant="body2"
                  sx={{
                    mt: { xs: 0.5, sm: 0.5 }, // Уменьшили верхний отступ
                    mb: { xs: 0.5, sm: 0.5 }, // Уменьшили нижний отступ
                    color: "#d32f2f",
                    fontWeight: 600,
                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    textAlign: "center",
                  }}
                >
                  {discountText}
                </Typography>
              );
            }
            return null;
          })()}
        {car?.pricingTiers && (
          <PricingTiers
            prices={car?.pricingTiers}
            selectedDate={currentCalendarDate}
            discount={discount}
            discountStart={discountStart}
            discountEnd={discountEnd}
          />
        )}
      </Stack>
      <BookingModal
        fetchAndUpdateOrders={fetchAndUpdateOrders}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        car={car}
        orders={carOrders}
        presetDates={{ startDate: bookDates?.start, endDate: bookDates?.end }}
        isLoading={isLoading}
        selectedTimes={selectedTimes}
      />
      <CarDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        car={car}
      />
    </StyledCarItem>
  );
}

export default CarItemComponent;

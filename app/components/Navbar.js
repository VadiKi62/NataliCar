"use client";
import { useState, useRef, useEffect } from "react";
import { styled } from "@mui/system";
import Image from "next/image";
import Link from "next/link";
import { animateScroll as scroll } from "react-scroll";
import {
  AppBar,
  Button,
  Typography,
  Box,
  Stack,
  Toolbar,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Popover,
  MenuItem,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import LanguageIcon from "@mui/icons-material/Language";
import { companyData } from "@utils/companyData";
import { useMainContext } from "@app/Context";
import LegendCalendarAdmin from "./common/LegendCalendarAdmin";
import { CAR_CLASSES } from "@models/enums";
import SelectedFieldClass from "./common/SelectedFieldClass";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { ru } from "date-fns/locale";

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$isCarInfo" && prop !== "scrolled",
})(({ theme, $isCarInfo }) => ({
  zIndex: 996,
  position: "fixed",
  top: 50,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  py: theme.spacing(1),
  backgroundColor: theme.palette.primary.main1,
  // можно использовать $isCarInfo для стилей, если нужно
}));

const GradientAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "scrolled",
})(({ theme, scrolled }) => ({
  width: "100%",
  position: "fixed",
  transition: theme.transitions.create(["height", "background-color"], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  willChange: "height, background-color",
  height: scrolled ? 52 : 60,
  backgroundColor: theme.palette.primary.main1,
  boxShadow: "none",
  backdropFilter: scrolled ? "blur(10px)" : "none",
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.h1?.fontWeight || 400,
  fontFamily: theme.typography.h1.fontFamily,
  color: theme.palette.text.red,
  display: "inline-block",
  // Prevent logo from pushing navbar items on small landscape touch devices only
  // add (hover: none) and (pointer: coarse) so desktop browsers don't match when window is narrowed
  "@media (max-width:900px) and (orientation: landscape) and (hover: none) and (pointer: coarse)":
    {
      // allow a bit more room for the company name on horizontal phones
      maxWidth: 220,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
}));

const LanguageSwitcher = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text?.black || theme.palette.text?.light,
  display: "flex",
  alignItems: "center",
}));

const LanguagePopover = styled(Popover)(({ theme }) => ({
  width: "150px",
  fontFamily: theme.typography.fontFamily,
}));

export default function NavBar({
  isMain,
  isAdmin = false,
  isCarInfo = false,
  setIsCarInfo = null,
}) {
  const headerRef = useRef(null);
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [discountStartDate, setDiscountStartDate] = useState(null);
  const [discountEndDate, setDiscountEndDate] = useState(null);

  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (!isAdmin) return;

    const fetchDiscountFromDB = async () => {
      try {
        const res = await fetch("/api/discount");
        if (!res.ok) throw new Error("Ошибка загрузки скидки из БД");

        const data = await res.json();

        if (data) {
          setSelectedDiscount(data.discount || 0);
          if (data.startDate) setDiscountStartDate(new Date(data.startDate));
          if (data.endDate) setDiscountEndDate(new Date(data.endDate));
        }
      } catch (err) {
        console.error("❌ Ошибка при загрузке скидки:", err);
      }
    };

    fetchDiscountFromDB();
  }, [isAdmin]);

  useEffect(() => {
    // Админка больше не принудительно переключает язык на русский.
    // Язык определяется и сохраняется через общий i18n + Context.
  }, [isAdmin, i18n]);

  const {
    scrolled,
    setSelectedClass,
    selectedClass,
    arrayOfAvailableClasses,
    setSelectedTransmission, // Новые значения для фильтра коробки передач
    selectedTransmission,
    arrayOfAvailableTransmissions,
    lang,
    setLang,
    changeLanguage, // Добавляем функцию смены языка
  } = useMainContext();

  const handleCarClassChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedClass(selectedValue === "" ? "" : selectedValue);
  };

  const handleTransmissionChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedTransmission(selectedValue === "" ? "" : selectedValue);
  };

  const handleLanguageClick = (event) => {
    event.preventDefault();
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  const handleLanguageSelect = (selectedLanguage) => {
    changeLanguage(selectedLanguage); // Используем новую функцию, которая автоматически сохраняет в localStorage
    handleLanguageClose();
  };

  const handleSaveDiscount = async () => {
    if (!isAdmin) return;

    // Валидация дат перед сохранением
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    if (!discountStartDate || !discountEndDate) {
      console.error("❌ Даты скидки не заполнены");
      alert("Укажите дату начала и дату окончания скидки");
      return;
    }
    const startDateLocal = new Date(
      discountStartDate.getFullYear(),
      discountStartDate.getMonth(),
      discountStartDate.getDate()
    );
    const endDateLocal = new Date(
      discountEndDate.getFullYear(),
      discountEndDate.getMonth(),
      discountEndDate.getDate()
    );
    if (startDateLocal < startOfToday) {
      alert("Дата начала скидки не может быть раньше сегодняшней");
      return;
    }
    if (endDateLocal <= startDateLocal) {
      alert("Дата окончания скидки должна быть позже даты начала");
      return;
    }

    // 👉 Преобразуем в UTC-полночь вручную, чтобы сохранить точную дату
    // const startDateUtc = new Date(discountStartDate);
    // startDateUtc.setUTCHours(12, 0, 0, 0);

    const toUTCZeroTime = (date) => {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );
    };

    const startDateUtc = toUTCZeroTime(discountStartDate);
    const endDateUtc = toUTCZeroTime(discountEndDate);

    // 👉 Отправляем в MongoDB

    try {
      const res = await fetch("/api/discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discount: selectedDiscount,
          // startDate: discountStartDate,
          // endDate: discountEndDate,
          startDate: startDateUtc,
          endDate: endDateUtc,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("✅ Скидка сохранена в MongoDB:", data);
      } else {
        console.error("❌ Ошибка сохранения скидки:", data);
      }
    } catch (error) {
      console.error("❌ Ошибка при отправке скидки:", error);
    }

    setDiscountModalOpen(false);
  };

  // Определение: активна ли скидка сегодня (по локальной дате, без времени)
  const isDiscountActiveToday = () => {
    if (!(selectedDiscount > 0 && discountStartDate && discountEndDate))
      return false;
    const normalize = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = normalize(new Date());
    const start = normalize(discountStartDate);
    const end = normalize(discountEndDate);
    return today >= start && today <= end;
  };

  // Форматирование даты для надписи кнопки: DD.MM.YY
  const formatDiscountDate = (date) => {
    if (!date) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  };

  // Итоговая надпись для кнопки скидки (десктоп / мобильное меню)
  const discountButtonLabel = isDiscountActiveToday()
    ? t("discount.activeRange", {
        value: selectedDiscount,
        from: formatDiscountDate(discountStartDate),
        to: formatDiscountDate(discountEndDate),
      })
    : t("discount.inactive");

  return (
    <>
      <GradientAppBar
        ref={headerRef}
        scrolled={scrolled}
        sx={{
          // Явно показываем Navbar на landscape телефоне
          display: {
            xs: "flex",
            "@media (max-width:900px) and (orientation: landscape)": "flex",
          },
        }}
      >
        <Toolbar>
          <Stack
            direction="row-reverse"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              width: "100%",
              boxSizing: "border-box",
              "& > *": { minWidth: 0 },
            }}
          >
            <Stack alignItems="center" direction="row-reverse" spacing={2}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                <MenuIcon />
              </IconButton>

              {/* Языковой переключатель - всегда видим */}
              <LanguageSwitcher color="inherit" onClick={handleLanguageClick}>
                <Typography
                  sx={{
                    fontStretch: "extra-condensed",
                    textTransform: "uppercase",
                  }}
                >
                  {lang}
                </Typography>
              </LanguageSwitcher>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  display: { xs: "none", md: "flex" },
                  minWidth: 0,
                  "& > *": { minWidth: 0 },
                }}
              >
                {!isAdmin && (
                  <>
                    <Link href="/">
                      <Typography
                        sx={{
                          fontStretch: "extra-condensed",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.main")}
                      </Typography>
                    </Link>
                    <Link href="/terms">
                      <Typography
                        sx={{
                          fontStretch: "extra-condensed",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.terms")}
                      </Typography>
                    </Link>
                    <Link href="/contacts">
                      <Typography
                        sx={{
                          fontStretch: "extra-condensed",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.contacts")}
                      </Typography>
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link href="/admin/cars">
                      <Typography
                        sx={{
                          px: { xs: 0.5, md: 3 },
                          fontSize: { xs: 11, md: 15 },
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.cars")}
                      </Typography>
                    </Link>
                    {/*<Link href="/admin/orders">
                      <Typography
                        sx={{
                          px: { xs: 0.5, md: 3 },
                          fontSize: { xs: 11, md: 15 },
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.orders")}
                      </Typography>
                    </Link>*/}
                    <Link href="/admin/orders-calendar">
                      <Typography
                        sx={{
                          px: { xs: 0.5, md: 3 },
                          fontSize: { xs: 11, md: 15 },
                          textTransform: "uppercase",
                        }}
                      >
                        {/* {t("header.calendar")} */}
                        {t("header.orders")}
                      </Typography>
                    </Link>
                    {/*<Link href="/admin/table">
                      <Typography
                        sx={{
                          px: { xs: 0.5, md: 3 },
                          fontSize: { xs: 11, md: 15 },
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.orderList")}
                      </Typography>
                    </Link>*/}
                  </>
                )}

                {isAdmin && (
                  <Button
                    variant="outlined"
                    onClick={() => setDiscountModalOpen(true)}
                    sx={{
                      px: { xs: 0.5, md: 3 },
                      fontSize: { xs: 11, md: 13 },
                      textTransform: "uppercase",
                      color: "white",
                      borderColor: "white",
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    {discountButtonLabel}
                  </Button>
                )}
              </Stack>
            </Stack>

            <Link href="/">
              <Logo
                sx={{
                  fontSize: "clamp(12px, calc(0.99rem + 1vw), 32px)",
                }}
              >
                {companyData.name}
                {isAdmin && " ADMIN"}
              </Logo>
            </Link>
          </Stack>
        </Toolbar>

        <LanguagePopover
          open={Boolean(languageAnchor)}
          anchorEl={languageAnchor}
          onClose={handleLanguageClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={() => handleLanguageSelect("en")}>
            English
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("el")}>
            Ελληνικά
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("ru")}>
            Русский
          </MenuItem>
        </LanguagePopover>

        {isMain && (
          <StyledBox
            scrolled={scrolled ? "true" : undefined}
            $isCarInfo={isCarInfo}
            sx={{
              // Явно показываем StyledBox на landscape телефоне
              display: {
                xs: "flex",
                "@media (max-width:900px) and (orientation: landscape)": "flex",
              },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 10 }}
              alignItems="center"
              justifyContent="center"
              pb={1}
              sx={{
                width: "100%",
                "& > *": { minWidth: 0 },
                // apply only for small landscape touch devices (phones/tablets)
                "@media (max-width:900px) and (orientation: landscape) and (hover: none) and (pointer: coarse)":
                  {
                    gap: 1,
                    px: 1,
                  },
              }}
            >
              {/* Legend: occupy only intrinsic space */}
              <Box sx={{ flex: "0 0 auto", mr: 1, minWidth: 0 }}>
                <LegendCalendarAdmin client={isMain} />
              </Box>

              {/* Контейнер для фильтров - занимает оставшееся пространство и может сжиматься */}
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 3 }}
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: "100%",
                  flex: "1 1 auto",
                  minWidth: 0,
                  flexWrap: { xs: "nowrap", sm: "nowrap" },
                }}
              >
                <Box
                  sx={{
                    // only override widths for small landscape touch devices; let SelectedFieldClass control desktop sizes
                    "& .MuiFormControl-root": {
                      "@media (max-width:900px) and (orientation: landscape) and (hover: none) and (pointer: coarse)":
                        {
                          minWidth: 190,
                          maxWidth: 210,
                        },
                    },
                  }}
                >
                  <SelectedFieldClass
                    name="class"
                    label={t("header.carClass")}
                    options={Object.values(arrayOfAvailableClasses)}
                    value={selectedClass}
                    handleChange={handleCarClassChange}
                  />
                </Box>

                <Box
                  sx={{
                    "& .MuiFormControl-root": {
                      "@media (max-width:900px) and (orientation: landscape) and (hover: none) and (pointer: coarse)":
                        {
                          minWidth: 190,
                          maxWidth: 210,
                        },
                    },
                  }}
                >
                  <SelectedFieldClass
                    name="transmission"
                    label={t("header.transmission")}
                    options={Object.values(arrayOfAvailableTransmissions)}
                    value={selectedTransmission}
                    handleChange={handleTransmissionChange}
                  />
                </Box>
              </Stack>
            </Stack>
          </StyledBox>
        )}
      </GradientAppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Link href="/">
              <Logo>
                {companyData.name}
                {isAdmin && " ADMIN"}
              </Logo>
            </Link>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <List>
            {!isAdmin ? (
              <>
                <ListItem button component={Link} href="/">
                  <ListItemText primary={t("header.main")} />
                </ListItem>
                <ListItem button component={Link} href="/terms">
                  <ListItemText primary={t("header.terms")} />
                </ListItem>
                <ListItem button component={Link} href="/contacts">
                  <ListItemText primary={t("header.contacts")} />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button component={Link} href="/admin/cars">
                  <ListItemText primary={t("header.cars")} />
                </ListItem>
                {/* <ListItem button component={Link} href="/admin/orders">
                  <ListItemText primary={t("header.orders")} />
                </ListItem>
                <ListItem button component={Link} href="/admin/orders-calendar">
                  <ListItemText primary={t("header.calendar")} />
                </ListItem>
                */}
                <ListItem button component={Link} href="/admin/orders-calendar">
                  <ListItemText primary={t("header.orders")} />
                </ListItem>
                {/*<ListItem button component={Link} href="/admin/table">
                  <ListItemText primary={t("header.orderList")} />
                </ListItem>  */}
                {isAdmin && (
                  <ListItem
                    button
                    onClick={() => {
                      setDrawerOpen(false);
                      setDiscountModalOpen(true);
                    }}
                  >
                    <ListItemText primary={discountButtonLabel} />
                  </ListItem>
                )}
              </>
            )}

            {/* Языковой переключатель убран из мобильного меню, 
                поскольку теперь он всегда видим в верхней панели */}
            {/* <ListItem button onClick={handleLanguageClick}>
              <ListItemText primary={lang} />
            </ListItem> */}
          </List>
        </Box>
      </Drawer>

      {isAdmin && (
        <Dialog
          open={discountModalOpen}
          onClose={() => setDiscountModalOpen(false)}
          maxWidth="sm"
          PaperProps={{
            sx: { minHeight: 400, minWidth: 350 },
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            Выбор скидки: {selectedDiscount}%
          </DialogTitle>
          <DialogContent sx={{ minWidth: 350, pb: 3, pt: 3 }}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ru}
            >
              <Box sx={{ mb: 3, mt: 6 }}>
                <DatePicker
                  label="Дата начала скидки"
                  value={discountStartDate}
                  disablePast
                  // Минимальная дата - сегодня
                  minDate={new Date()}
                  onChange={(newValue) => {
                    // Если пользователь очистил поле
                    if (!newValue) {
                      setDiscountStartDate(null);
                      return;
                    }
                    // Обрезаем время (Adapter может давать с временем)
                    const d = new Date(
                      newValue.getFullYear(),
                      newValue.getMonth(),
                      newValue.getDate()
                    );
                    // Запрещаем установку прошлых дат (дополнительная защита)
                    const today = new Date();
                    const todayStart = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    );
                    if (d < todayStart) return; // просто игнорируем
                    setDiscountStartDate(d);
                    // Если дата окончания установлена и стала недопустимой (<= старт), сбрасываем её
                    if (discountEndDate) {
                      const endLocal = new Date(
                        discountEndDate.getFullYear(),
                        discountEndDate.getMonth(),
                        discountEndDate.getDate()
                      );
                      if (endLocal <= d) setDiscountEndDate(null);
                    }
                  }}
                  inputFormat="dd.MM.yyyy"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      sx={{ mt: 2 }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <DatePicker
                  label="Дата окончания скидки"
                  value={discountEndDate}
                  // Минимальная дата: строго позже даты начала, либо завтра если начало ещё не выбрано
                  disablePast
                  minDate={(function () {
                    const today = new Date();
                    const base = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    );
                    if (discountStartDate) {
                      return new Date(
                        discountStartDate.getFullYear(),
                        discountStartDate.getMonth(),
                        discountStartDate.getDate() + 1
                      );
                    }
                    return new Date(
                      base.getFullYear(),
                      base.getMonth(),
                      base.getDate() + 1
                    );
                  })()}
                  onChange={(newValue) => {
                    if (!newValue) {
                      setDiscountEndDate(null);
                      return;
                    }
                    const d = new Date(
                      newValue.getFullYear(),
                      newValue.getMonth(),
                      newValue.getDate()
                    );
                    if (discountStartDate) {
                      const startLocal = new Date(
                        discountStartDate.getFullYear(),
                        discountStartDate.getMonth(),
                        discountStartDate.getDate()
                      );
                      // Требуем строго позже старта
                      if (d <= startLocal) return; // игнорируем недопустимый выбор
                    }
                    // Дополнительная защита от прошлого
                    const today = new Date();
                    const todayStart = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    );
                    if (d <= todayStart) return; // конец не может быть сегодня или в прошлом
                    setDiscountEndDate(d);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      sx={{ mt: 2 }}
                    />
                  )}
                />
              </Box>
            </LocalizationProvider>

            <Typography gutterBottom sx={{ mt: 6, mb: 5 }}>
              Скидка на аренду (%):
            </Typography>
            <Slider
              value={selectedDiscount}
              onChange={(e, value) => setSelectedDiscount(value)}
              valueLabelDisplay="on"
              step={5}
              marks
              min={0}
              max={100}
              sx={{ width: "100%", mt: 1, maxWidth: 300 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDiscountModalOpen(false)}>Закрыть</Button>
            <Button variant="contained" onClick={handleSaveDiscount}>
              Применить
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

const ToggleButtons = ({ isCarInfo, setIsCarInfo }) => {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 0.3, md: 3 }}
      alignItems="center"
    >
      <Button
        variant={isCarInfo ? "contained" : "outlined"}
        sx={{
          px: { xs: 0.5, md: 3 },
          fontSize: { xs: 6, md: 15 },
        }}
        onClick={() => setIsCarInfo(true)}
      >
        Автопарк
      </Button>
      <Button
        variant={!isCarInfo ? "contained" : "outlined"}
        sx={{
          px: { xs: 0.5, md: 3 },
          fontSize: { xs: 6, md: 15 },
        }}
        onClick={() => setIsCarInfo(false)}
      >
        Заказы
      </Button>
    </Stack>
  );
};

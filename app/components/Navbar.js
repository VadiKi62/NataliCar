"use client";
import { useState, useRef, useEffect } from "react";
import { styled } from "@mui/system";
import {
  AppBar,
  Button,
  Typography,
  Box,
  Stack,
  Toolbar,
  Container,
  IconButton,
  Popover,
  MenuItem,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { animateScroll as scroll } from "react-scroll";
import { companyData } from "@utils/companyData";
import { useMainContext } from "@app/Context";
import LegendCalendarAdmin from "./common/LegendCalendarAdmin";
import { CAR_CLASSES } from "@models/enums";
import SelectedFieldClass from "./common/SelectedFieldClass";

const StyledBox = styled(Box)(({ theme }) => ({
  zIndex: 996,
  position: "fixed",
  top: 50,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  padding: theme.spacing(1, 1, 1, 1),
  backgroundColor: theme.palette.primary.main1,
}));

const GradientAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "scrolled",
})(({ theme, scrolled }) => ({
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
  display: "flex",
  fontFamily: theme.typography.h1.fontFamily,
  color: theme.palette.text.light,
  fontSize: { xs: 5, md: 15 },
  // lineHeight: { xs: 0.2 },
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
  // const { i18n, t } = useTranslation();
  // const lang = i18n.language;
  const {
    scrolled,
    setSelectedClass,
    selectedClass,
    arrayOfAvailableClasses,
    lang,
    setLang,
  } = useMainContext();
  const handleCarClassChange = (event) => {
    const selectedValue = event.target.value;
    // If "ALL" is selected, reset to show all cars
    setSelectedClass(selectedValue === "" ? "" : selectedValue);
  };

  const handleLanguageClick = (event) => {
    event.preventDefault();
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setLang(selectedLanguage);
    // i18n.changeLanguage(selectedLanguage);
    handleLanguageClose();
  };

  return (
    <GradientAppBar ref={headerRef} scrolled={scrolled}>
      <Toolbar>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Link href="/">
            <Logo fontSize={{ sm: 10, md: 29 }}>
              {companyData.name}
              {isAdmin && " ADMIN"}
            </Logo>
          </Link>
          <Stack direction="row" spacing={2} alignItems="center">
            {!isAdmin && (
              <>
                {" "}
                <Link href="/">
                  <Typography
                    sx={{
                      fontStretch: "extra-condensed",
                      textTransform: "uppercase",
                    }}
                  >
                    Main
                  </Typography>
                </Link>
                <Link href="/terms">
                  <Typography
                    sx={{
                      fontStretch: "extra-condensed",
                      textTransform: "uppercase",
                    }}
                  >
                    Terms
                  </Typography>{" "}
                </Link>
                <Link href="/contacts">
                  <Typography
                    sx={{
                      fontStretch: "extra-condensed",
                      textTransform: "uppercase",
                    }}
                  >
                    Contacts
                  </Typography>
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                {/* <ToggleButtons
                  isCarInfo={isCarInfo}
                  setIsCarInfo={setIsCarInfo}
                /> */}
                <Link href="/admin/cars">
                  <Typography
                    sx={{
                      px: { xs: 0.5, md: 3 },
                      fontSize: { xs: 6, md: 15 },
                      textTransform: "uppercase",
                    }}
                  >
                    Автопарк
                  </Typography>
                </Link>
                <Link href="/admin/orders">
                  <Typography
                    sx={{
                      px: { xs: 0.5, md: 3 },
                      fontSize: { xs: 6, md: 15 },
                      textTransform: "uppercase",
                    }}
                  >
                    Календарь заказов
                  </Typography>
                </Link>
                <Link href="/admin/orders-calendar">
                  <Typography
                    sx={{
                      px: { xs: 0.5, md: 3 },
                      fontSize: { xs: 6, md: 15 },
                      textTransform: "uppercase",
                    }}
                  >
                    Таблица заказов
                  </Typography>
                </Link>
                <Link href="/admin/orders-calendar">
                  <Typography
                    sx={{
                      px: { xs: 0.5, md: 3 },
                      fontSize: { xs: 6, md: 15 },
                      textTransform: "uppercase",
                    }}
                  >
                    Список заказов
                  </Typography>
                </Link>

                {/* <Link href={"/admin/orders"}>Orders</Link> */}
              </>
            )}
            <LanguageSwitcher color="inherit" onClick={handleLanguageClick}>
              {/* <LanguageIcon /> */}
              <Typography
                sx={{
                  fontStretch: "extra-condensed",
                  textTransform: "uppercase",
                }}
              >
                {lang}
              </Typography>
            </LanguageSwitcher>
          </Stack>
        </Stack>
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
          <MenuItem onClick={() => handleLanguageSelect("de")}>
            Deutsch
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("ro")}>Română</MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("sr")}>Српски</MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("bg")}>
            Български
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("fr")}>
            Française
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("ar")}>Arabic</MenuItem>
        </LanguagePopover>
        {isMain && (
          <StyledBox scrolled={scrolled} isCarInfo={isCarInfo}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 10 }}
              alignItems="center"
              justifyContent="center"
            >
              <LegendCalendarAdmin client={isMain} />
              <SelectedFieldClass
                name="class"
                label="Choose Car Class"
                options={Object.values(arrayOfAvailableClasses)}
                value={selectedClass}
                handleChange={handleCarClassChange}
              />
            </Stack>
          </StyledBox>
        )}
      </Toolbar>
    </GradientAppBar>
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

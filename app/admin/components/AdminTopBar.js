"use client";

import React from "react";
import { Box, Stack, Button, styled } from "@mui/material";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useMainContext } from "@app/Context";
import DefaultButton from "@app/components/common/DefaultButton";
import LegendCalendarAdmin from "@app/components/common/LegendCalendarAdmin";

const StyledTopBar = styled(Box)(({ theme, scrolled }) => ({
  zIndex: 996,
  position: "fixed",
  top: scrolled ? 40 : 50,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  paddingTop: theme.spacing(2),
  backgroundColor: theme.palette.backgroundDark1?.bg || "#1a1a1a",
  transition: "top 0.2s ease-in-out",
}));

const LogoutBox = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 40,
  right: 40,
  zIndex: 1000,
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

/**
 * AdminTopBar - верхняя панель для админки
 * @param {object} props
 * @param {string} props.viewType - тип текущего view: 'cars' | 'orders' | 'orders-calendar' | 'orders-table'
 * @param {function} props.onAddCarClick - callback для кнопки "Добавить авто"
 */
export default function AdminTopBar({ viewType, onAddCarClick }) {
  const { t } = useTranslation();
  const { scrolled } = useMainContext();

  const isCars = viewType === "cars";
  const isCalendarView = viewType === "orders-calendar" || viewType === "orders-big-calendar";

  return (
    <>
      {/* Кнопка выхода */}
      <LogoutBox className="admin-logout-box">
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => signOut({ callbackUrl: "/" })}
          sx={{ m: 1 }}
        >
          {t("basic.logout") || "Выйти"}
        </Button>
      </LogoutBox>

      {/* TopBar */}
      <StyledTopBar
        scrolled={scrolled}
        className="admin-topbar"
        sx={{
          display: {
            xs: "flex",
            "@media (max-width:900px) and (orientation: landscape)": isCars
              ? "flex"
              : "none",
          },
          // Прячем если не cars и не calendar views
          ...(!(isCars || isCalendarView) && { display: "none" }),
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          justifyContent="center"
        >
          {isCars && onAddCarClick && (
            <DefaultButton
              onClick={onAddCarClick}
              minWidth="600px"
              padding={scrolled ? 0 : 1.5}
              relative
              sx={{ width: "100%" }}
            >
              {t("carPark.addCar")}
            </DefaultButton>
          )}
          
          {isCalendarView && (
            <Stack
              className="legend-calendar-admin"
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              alignItems="center"
              justifyContent="center"
              sx={{
                display: "flex",
                "@media (max-width:900px) and (orientation: landscape)": {
                  display: "none",
                },
              }}
            >
              <LegendCalendarAdmin />
            </Stack>
          )}
        </Box>
      </StyledTopBar>
    </>
  );
}


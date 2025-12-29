import React from "react";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Легенда календаря для админки и клиентской части
 * Использует цвета из темы для согласованности
 */
function LegendCalendarAdmin({ client }) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Получаем цвета из темы
  const orderColors = theme.palette.order || {};

  return (
    <Stack
      spacing={{ xs: 1, sm: 2 }}
      direction="row"
      justifyContent="center"
      alignItems="center"
      display={{ xs: "none", sm: "flex" }}
      width="100%"
      sx={{ color: "text.main", mb: client ? 0 : 10 }}
    >
      {/* Подтверждённые заказы */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: { xs: 11, sm: 0 },
          paddingLeft: 5,
          paddingBottom: client ? 0 : 1,
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            backgroundColor: orderColors.confirmed || "primary.red",
            marginRight: "10px",
          }}
        />
        {/* Зелёный квадратик для заказов компании (только админка) */}
        {!client && (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: orderColors.confirmedMyOrder || "ui.success",
              marginRight: "10px",
            }}
          />
        )}
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontSize: "clamp(7px, calc(0.8rem + 1vw), 16px)",
            color: "text.light",
          }}
        >
          {client ? t("order.unavailable-dates") : t("order.confirmed")}
        </Typography>
      </Box>

      {/* Неподтверждённые заказы (только админка) */}
      {!client && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: { xs: 1, sm: 0 },
            paddingBottom: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: orderColors.pending || "primary.green",
              marginRight: "10px",
            }}
          />
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontSize: "clamp(7px, calc(0.8rem + 1vw), 16px)",
              color: "text.light",
            }}
          >
            {t("order.not-confirmed")}
          </Typography>
        </Box>
      )}

      {/* Конфликтующие заказы (только админка) */}
      {!client && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: { xs: 1, sm: 0 },
            paddingBottom: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              position: "relative",
              display: "flex",
              width: "20px",
              height: "22px",
              backgroundColor: orderColors.conflict || "text.green",
              marginRight: "10px",
              color: "text.red",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            1
          </Box>
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontSize: "clamp(7px, calc(0.8rem + 1vw), 16px)",
              color: "text.light",
            }}
          >
            {t("order.conflict")}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

export default LegendCalendarAdmin;

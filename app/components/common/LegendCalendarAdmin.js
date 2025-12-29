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
      sx={{
        mb: client ? 0 : 10,
        py: 1.5,
        px: 2,
        backgroundColor: "#1a1a1a",
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
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
            backgroundColor: orderColors.confirmed || "primary.main",
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
              backgroundColor: orderColors.confirmedMyOrder || "success.main",
              marginRight: "10px",
            }}
          />
        )}
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontSize: "clamp(10px, calc(0.8rem + 1vw), 16px)",
            color: "#ffffff",
            fontWeight: 500,
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
              backgroundColor: orderColors.pending || "warning.main",
              marginRight: "10px",
            }}
          />
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontSize: "clamp(10px, calc(0.8rem + 1vw), 16px)",
              color: "#ffffff",
              fontWeight: 500,
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
              backgroundColor: orderColors.conflict || "#e7c475",
              marginRight: "10px",
              color: "error.main",
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
              fontSize: "clamp(10px, calc(0.8rem + 1vw), 16px)",
              color: "#ffffff",
              fontWeight: 500,
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

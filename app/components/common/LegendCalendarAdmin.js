import React from "react";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Легенда календаря для админки и клиентской части
 * Использует цвета из темы для согласованности
 * @param {boolean} client - режим клиента (упрощённая легенда)
 * @param {boolean} embedded - встроен в другой компонент (без внешних отступов)
 */
function LegendCalendarAdmin({ client, embedded = false }) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Получаем цвета из темы
  const orderColors = theme.palette.order || {};
  // Светлые цвета для тёмного фона
  const darkBgColors = theme.palette.backgroundDark1 || {};

  return (
    <Stack
      spacing={{ xs: 1, sm: 2 }}
      direction="row"
      justifyContent="center"
      alignItems="center"
      display={{ xs: "none", sm: "flex" }}
      width="100%"
      sx={{
        mb: embedded ? 0 : (client ? 0 : 10),
        py: embedded ? 1 : 1.5,
        px: 2,
        backgroundColor: theme.palette.backgroundDark1?.bg || "#1a1a1a",
        borderRadius: embedded ? 1 : 2,
        boxShadow: embedded ? "none" : "0 4px 12px rgba(0, 0, 0, 0.3)",
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
            backgroundColor: theme.palette.primary.main || "#ff6b6b", // Светло-красный для тёмного фона
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
              backgroundColor: darkBgColors.success || "#5cd85c", // Светло-зелёный для тёмного фона
              marginRight: "10px",
            }}
          />
        )}
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontSize: "clamp(10px, calc(0.8rem + 1vw), 16px)",
            color: darkBgColors.text || "#ffffff",
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
              backgroundColor: theme.palette.primary|| "#890000", 
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
              backgroundColor: darkBgColors.warning || "#ffd93d", // Жёлтый для конфликтов
              marginRight: "10px",
              color: "#1a1a1a", // Тёмный текст на жёлтом
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
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

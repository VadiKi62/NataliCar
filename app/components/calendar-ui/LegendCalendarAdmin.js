import React, { useState } from "react";
import { Box, Typography, Stack, useTheme, Tooltip, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslation } from "react-i18next";
import { ORDER_COLORS, getOrderColorsForLegend } from "@/config/orderColors";
import { useMainContext } from "@app/Context";
import BufferSettingsModal from "@/app/admin/features/settings/BufferSettingsModal";

/**
 * Легенда календаря для админки и клиентской части
 * 
 * Для админки показывает 4 типа заказов:
 * 1. Подтверждён (клиент) — красный
 * 2. Подтверждён (внутр.) — горчичный
 * 3. Ожидает (клиент) — фиолетовый
 * 4. Ожидает (внутр.) — жёлтый
 * 
 * + Заблокированные pending (⛔)
 */
function LegendCalendarAdmin({ client }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { company } = useMainContext();
  const [bufferModalOpen, setBufferModalOpen] = useState(false);

  // Светлые цвета для тёмного фона
  const darkBgColors = theme.palette.backgroundDark1 || {};

  // Компонент для одного элемента легенды
  const LegendItem = ({ color, label, tooltip, icon }) => (
    <Tooltip title={tooltip || ""} arrow>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: tooltip ? "help" : "default",
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            backgroundColor: color,
            marginRight: "8px",
            borderRadius: "3px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {icon}
        </Box>
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontSize: "clamp(10px, calc(0.7rem + 0.5vw), 14px)",
            color: darkBgColors.text || "#ffffff",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );

  // Для клиента — упрощённая легенда
  if (client) {
    return (
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction="row"
        justifyContent="center"
        alignItems="center"
        display={{ xs: "none", sm: "flex" }}
        width="100%"
        sx={{
          py: 1.5,
          px: 2,
          backgroundColor: theme.palette.backgroundDark1?.bg || "#1a1a1a",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <LegendItem
          color={ORDER_COLORS.CONFIRMED_CLIENT.main}
          label={t("order.unavailable-dates")}
          tooltip="Эти даты уже забронированы"
        />
      </Stack>
    );
  }

  // Для админки — полная легенда с 4 типами
  return (
    <Stack
      spacing={{ xs: 0.5, sm: 1.5 }}
      direction="row"
      justifyContent="center"
      alignItems="center"
      display={{ xs: "none", sm: "flex" }}
      flexWrap="wrap"
      width="100%"
      sx={{
        mb: 2,
        py: 1.5,
        px: 2,
        backgroundColor: theme.palette.backgroundDark1?.bg || "#1a1a1a",
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        gap: { xs: 1, sm: 2 },
      }}
    >
      {/* 1. Подтверждён (клиент) — красный */}
      <LegendItem
        color={ORDER_COLORS.CONFIRMED_CLIENT.main}
        label={ORDER_COLORS.CONFIRMED_CLIENT.label}
        tooltip="Клиентский заказ подтверждён. Приоритетный."
      />

      {/* 2. Подтверждён (админ) — горчичный */}
      <LegendItem
        color={ORDER_COLORS.CONFIRMED_ADMIN.main}
        label={ORDER_COLORS.CONFIRMED_ADMIN.label}
        tooltip="Админский заказ (блокировка дат). Подтверждён."
      />

      {/* 3. Ожидает (клиент) — светло-красный */}
      <LegendItem
        color={ORDER_COLORS.PENDING_CLIENT.main}
        label={ORDER_COLORS.PENDING_CLIENT.label}
        tooltip="Клиентский заказ ожидает подтверждения."
      />

      {/* 4. Ожидает (админ) — светло-янтарный */}
      <LegendItem
        color={ORDER_COLORS.PENDING_ADMIN.main}
        label={ORDER_COLORS.PENDING_ADMIN.label}
        tooltip="Админский заказ (черновик). Ожидает подтверждения."
      />

      {/* 5. Заблокированный pending (⛔) */}
      {/* <LegendItem
        color={ORDER_COLORS.BLOCKED.main}
        label="⛔ Заблокирован"
        tooltip="Pending заказ, который нельзя подтвердить из-за конфликта с confirmed."
        icon="⛔"
      /> */}

      {/* Кнопка настроек буфера */}
      <Tooltip title={`Буфер между заказами: ${company?.bufferTime ?? 2} ч. (нажмите для изменения)`} arrow>
        <IconButton
          onClick={() => setBufferModalOpen(true)}
          size="small"
          sx={{
            mx: 1,
            color: theme.palette.secondary.light,
            bgcolor: "transparent",
            "&:hover": {
              bgcolor: theme.palette.backgroundDark1?.bg || "#1a1a1a",
              color: theme.palette.secondary.main,
            },
          }}
        >
          <SettingsIcon fontSize="small" sx={{mr: 1}}/>
          <Typography variant="body2" sx={{ fontSize: "clamp(10px, calc(0.7rem + 0.5vw), 14px)", color: theme.palette.secondary.light, fontWeight: 500, whiteSpace: "nowrap" }}> Buffer Time</Typography>
        </IconButton>
      </Tooltip>

      {/* Модальное окно настроек буфера */}
      <BufferSettingsModal
        open={bufferModalOpen}
        onClose={() => setBufferModalOpen(false)}
      />
    </Stack>
  );
}

export default LegendCalendarAdmin;

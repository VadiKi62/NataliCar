import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

function LegendCalendarAdmin({ client }) {
  const { t } = useTranslation();
  console.log("LegendCalendarAdmin rendered, client:", client);
  return (
    <Stack
      //className="legend-calendar-admin"
      spacing={{ xs: 1, sm: 2 }} // Adjust spacing between items based on screen size
      direction={"row"} // Stack items vertically on small screens, horizontally on larger screens
      justifyContent="center"
      alignItems="center"
      display={{ xs: "none", sm: "flex" }}
      width={"100%"}
      sx={{ color: "text.main", mb: client ? 0 : 10 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: { xs: 11, sm: 0 }, // Adjust bottom margin on small screens
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
            backgroundColor: "primary.red",
            marginRight: "10px",
          }}
        />
        {/* Зелёный квадратик прямо справа от красного перед текстом (только админка) */}
        {!client && (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              // Точно такой цвет, как у зелёных подтверждённых заказов (my_order=true) в Row.js
              backgroundColor: "#4CAF50",
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
          {/* На главной странице (client=true) показываем "Недоступные даты", в админке - "Подтвержденные заказы" */}
          {client ? t("order.unavailable-dates") : t("order.confirmed")}
        </Typography>
      </Box>

      {/* Закомментировано для главной страницы - показываем только в админке */}
      {!client && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: { xs: 1, sm: 0 }, // Adjust bottom margin on small screens
            paddingBottom: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: "primary.green",
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

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: { xs: 1, sm: 0 }, // Adjust bottom margin on small screens
          paddingBottom: client ? 0 : 1,
        }}
      >
        {!client && (
          <>
            <Box
              component="span"
              sx={{
                position: "relative",
                display: "inline-block",
                width: "20px",
                height: "22px",
                backgroundColor: "text.green",
                marginRight: "10px",
                color: "text.red",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
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
          </>
        )}
      </Box>
    </Stack>
  );
}

export default LegendCalendarAdmin;

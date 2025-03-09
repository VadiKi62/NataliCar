import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { useTranslation } from "@node_modules/react-i18next";

function LegendCalendarAdmin({ client }) {
  const { t } = useTranslation();
  return (
    <Stack
      spacing={{ xs: 1, sm: 2 }} // Adjust spacing between items based on screen size
      direction={"row"} // Stack items vertically on small screens, horizontally on larger screens
      justifyContent="center"
      alignItems="center"
      display={{ xs: "none", sm: "flex" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: { xs: 1, sm: 0 }, // Adjust bottom margin on small screens
          padding: 1,
          margin: 2,
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
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontSize: "clamp(7px, calc(0.8rem + 1vw), 16px)",
          }}
        >
          {t("order.confirmed")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: { xs: 1, sm: 0 }, // Adjust bottom margin on small screens
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
          }}
        >
          {t("order.not-confirmed")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: { xs: 1, sm: 0 }, // Adjust bottom margin on small screens
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

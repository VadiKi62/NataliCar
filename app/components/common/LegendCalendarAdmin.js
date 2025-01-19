import React from "react";
import { Box, Typography, Stack } from "@mui/material";

function LegendCalendarAdmin({ client }) {
  return (
    <Stack
      spacing={{ xs: 1, sm: 2 }} // Adjust spacing between items based on screen size
      direction={{ xs: "column", sm: "row" }} // Stack items vertically on small screens, horizontally on larger screens
      justifyContent="center"
      alignItems="center"
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
        <Typography component="span" variant="body2">
          Not Available
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
        <Typography component="span" variant="body2">
          Partially Reserved
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
            <Typography component="span" variant="body2">
              Конфликтующие даты бронирования
            </Typography>
          </>
        )}
      </Box>
    </Stack>
  );
}

export default LegendCalendarAdmin;

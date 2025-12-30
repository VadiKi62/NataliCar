"use client";

import React from "react";
import { Box } from "@mui/material";
import BigCalendar from "@app/components/Calendars/BigCalendar";
import { useMainContext } from "@app/Context";

/**
 * BigCalendarSection - секция большого календаря
 * Lazy-loaded компонент
 */
export default function BigCalendarSection() {
  const { cars, allOrders } = useMainContext();

  return (
    <Box sx={{ px: { xs: 0, md: 1 }, pb: 6 }}>
      <BigCalendar cars={cars} orders={allOrders} />
    </Box>
  );
}


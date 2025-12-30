"use client";

import React from "react";
import { Box } from "@mui/material";
import BigCalendar from "@app/components/Calendars/BigCalendar";
import { useCalendar } from "./useCalendar";

/**
 * CalendarSection - секция большого календаря
 * Feature component - lazy-loaded
 */
export default function CalendarSection() {
  const { cars, orders } = useCalendar();

  return (
    <Box sx={{ px: { xs: 0, md: 1 }, pb: 6 }}>
      <BigCalendar cars={cars} orders={orders} />
    </Box>
  );
}


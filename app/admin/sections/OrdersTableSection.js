"use client";

import React from "react";
import { Box } from "@mui/material";
import DataGridOrders from "@app/components/Admin/DataGridOrders";
import { useMainContext } from "@app/Context";

/**
 * OrdersTableSection - секция таблицы заказов
 * Lazy-loaded компонент
 */
export default function OrdersTableSection() {
  const { cars, allOrders } = useMainContext();

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, pb: 6 }}>
      <DataGridOrders cars={cars} orders={allOrders} />
    </Box>
  );
}


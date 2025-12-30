"use client";

import React from "react";
import { Box } from "@mui/material";
import DataGridOrders from "@app/components/Admin/DataGridOrders";
import { useOrders } from "./useOrders";

/**
 * OrdersTableSection - секция таблицы заказов
 * Feature component - lazy-loaded
 */
export default function OrdersTableSection() {
  const { cars, orders } = useOrders();

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, pb: 6 }}>
      <DataGridOrders cars={cars} orders={orders} />
    </Box>
  );
}


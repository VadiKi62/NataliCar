"use client";

import React, { useCallback } from "react";
import { Grid } from "@mui/material";
import Item from "@app/components/Admin/Order/Item";
import AddOrderModal from "@app/components/Admin/Order/AddOrderModal";
import { useOrders } from "./useOrders";

/**
 * OrdersCalendarSection - секция календарей заказов по машинам
 * Feature component - lazy-loaded
 */
export default function OrdersCalendarSection() {
  const {
    sortedCars,
    isAddModalOpen,
    selectedCar,
    closeAddModal,
    openAddModal,
    setSelectedCar,
    updateOrder,
    setNotification,
  } = useOrders();

  // Memoized handler to avoid inline function in render
  const handleSetIsAddOrderOpen = useCallback(
    (open, car) => {
      if (open) openAddModal(car);
      else closeAddModal();
    },
    [openAddModal, closeAddModal]
  );

  return (
    <Grid
      container
      spacing={{ sm: 2, xs: 0.4 }}
      direction="column"
      sx={{
        alignItems: "center",
        alignContent: "center",
        mt: { xs: 10, md: 18 },
      }}
    >
      {sortedCars.map((car) => (
        <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
          <Item
            car={car}
            isAddOrderOpen={isAddModalOpen}
            setSelectedCar={setSelectedCar}
            setIsAddOrderOpen={(open) => handleSetIsAddOrderOpen(open, car)}
            handleOrderUpdate={updateOrder}
          />
        </Grid>
      ))}

      <AddOrderModal
        open={isAddModalOpen}
        onClose={closeAddModal}
        car={selectedCar}
        setUpdateStatus={setNotification}
      />
    </Grid>
  );
}


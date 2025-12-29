"use client";

import React from "react";
import { Grid } from "@mui/material";
import Item from "@app/components/Admin/Order/Item";
import AddOrderModal from "@app/components/Admin/Order/AddOrderModal";
import { useAdminState } from "../hooks/useAdminState";

/**
 * OrdersCalendarSection - секция календарей заказов по машинам
 * Lazy-loaded компонент
 */
export default function OrdersCalendarSection() {
  const {
    cars,
    isAddOrderModalOpen,
    selectedCar,
    closeAddOrderModal,
    openAddOrderModal,
    setSelectedCar,
    handleOrderUpdate,
    setUpdateStatus,
  } = useAdminState();

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
      {cars
        .sort((a, b) => a.model.localeCompare(b.model))
        .map((car) => (
          <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
            <Item
              car={car}
              isAddOrderOpen={isAddOrderModalOpen}
              setSelectedCar={setSelectedCar}
              setIsAddOrderOpen={(open) => {
                if (open) openAddOrderModal(car);
                else closeAddOrderModal();
              }}
              handleOrderUpdate={handleOrderUpdate}
            />
          </Grid>
        ))}

      <AddOrderModal
        open={isAddOrderModalOpen}
        onClose={closeAddOrderModal}
        car={selectedCar}
        setUpdateStatus={setUpdateStatus}
      />
    </Grid>
  );
}


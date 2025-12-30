"use client";

import React from "react";
import { Box } from "@mui/material";
import Cars from "@app/components/Admin/Car/Cars";
import AddCarModal from "@app/components/Admin/AddCarModal";
import { useCars } from "./useCars";

/**
 * CarsSection - секция управления автомобилями
 * Feature component - lazy-loaded
 */
export default function CarsSection() {
  const {
    cars,
    isAddModalOpen,
    closeAddModal,
    deleteCar,
    setNotification,
    resubmitCars,
  } = useCars();

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, pb: 6 }}>
      <Cars
        onCarDelete={deleteCar}
        setUpdateStatus={setNotification}
      />
      
      <AddCarModal
        open={isAddModalOpen}
        onClose={closeAddModal}
        car={cars[0]}
        setUpdateStatus={setNotification}
        fetchAndUpdateCars={resubmitCars}
      />
    </Box>
  );
}


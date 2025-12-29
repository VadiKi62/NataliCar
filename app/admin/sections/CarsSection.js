"use client";

import React from "react";
import { Box } from "@mui/material";
import Cars from "@app/components/Admin/Car/Cars";
import AddCarModal from "@app/components/Admin/AddCarModal";
import { useAdminState } from "../hooks/useAdminState";

/**
 * CarsSection - секция управления автомобилями
 * Lazy-loaded компонент
 */
export default function CarsSection() {
  const {
    cars,
    isAddCarModalOpen,
    closeAddCarModal,
    handleDeleteCar,
    setUpdateStatus,
    resubmitCars,
  } = useAdminState();

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, pb: 6 }}>
      <Cars
        onCarDelete={handleDeleteCar}
        setUpdateStatus={setUpdateStatus}
      />
      
      <AddCarModal
        open={isAddCarModalOpen}
        onClose={closeAddCarModal}
        car={cars[0]}
        setUpdateStatus={setUpdateStatus}
        fetchAndUpdateCars={resubmitCars}
      />
    </Box>
  );
}


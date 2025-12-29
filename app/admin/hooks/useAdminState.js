"use client";

import { useState, useCallback } from "react";
import { useMainContext } from "@app/Context";

/**
 * useAdminState - хук для управления состоянием админки
 * Централизует логику модалов и статусов
 */
export function useAdminState() {
  const {
    cars,
    allOrders,
    setAllOrders,
    fetchAndUpdateOrders,
    resubmitCars,
    deleteCarInContext,
    scrolled,
    isLoading,
    error,
  } = useMainContext();

  // Состояние уведомлений
  const [updateStatus, setUpdateStatus] = useState(null);
  
  // Состояние модалов
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // Handlers для модалов
  const openAddCarModal = useCallback(() => {
    setIsAddCarModalOpen(true);
  }, []);

  const closeAddCarModal = useCallback(() => {
    setIsAddCarModalOpen(false);
  }, []);

  const openAddOrderModal = useCallback((car = null) => {
    setSelectedCar(car);
    setIsAddOrderModalOpen(true);
  }, []);

  const closeAddOrderModal = useCallback(() => {
    setIsAddOrderModalOpen(false);
    setSelectedCar(null);
  }, []);

  // Handler для обновления заказа
  const handleOrderUpdate = useCallback(async (updatedOrder) => {
    setAllOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    await fetchAndUpdateOrders();
  }, [setAllOrders, fetchAndUpdateOrders]);

  // Handler для удаления машины
  const handleDeleteCar = useCallback(async (carId) => {
    const { success, message, errorMessage } = await deleteCarInContext(carId);

    if (success) {
      setUpdateStatus({
        type: 200,
        message: message || "Car deleted successfully",
      });
      await resubmitCars();
    } else {
      setUpdateStatus({
        type: 500,
        message: errorMessage || "Failed to delete the car.",
      });
    }
  }, [deleteCarInContext, resubmitCars]);

  // Handler для закрытия уведомлений
  const closeNotification = useCallback(() => {
    setUpdateStatus(null);
  }, []);

  return {
    // Данные
    cars,
    allOrders,
    scrolled,
    isLoading,
    error,
    
    // Статусы и уведомления
    updateStatus,
    setUpdateStatus,
    closeNotification,
    
    // Модал добавления машины
    isAddCarModalOpen,
    openAddCarModal,
    closeAddCarModal,
    
    // Модал добавления заказа
    isAddOrderModalOpen,
    selectedCar,
    openAddOrderModal,
    closeAddOrderModal,
    setSelectedCar,
    
    // Actions
    handleOrderUpdate,
    handleDeleteCar,
    resubmitCars,
    fetchAndUpdateOrders,
  };
}


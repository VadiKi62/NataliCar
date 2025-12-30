"use client";

import { useState, useCallback, useMemo } from "react";
import { useMainContext } from "@app/Context";

/**
 * useAdminState - хук для управления состоянием админки
 * 
 * Структура возвращаемых значений:
 * - data: данные из контекста (cars, orders, scrolled)
 * - ui: состояние UI (модалы, выбранные элементы)
 * - actions: мемоизированные обработчики событий
 * - status: статусы загрузки и уведомления
 * 
 * Также поддерживает flat-деструктуризацию для обратной совместимости
 */
export function useAdminState() {
  // ─────────────────────────────────────────────────────────────
  // CONTEXT DATA
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // RAW STATE
  // ─────────────────────────────────────────────────────────────
  
  // Notifications state
  const [updateStatus, setUpdateStatus] = useState(null);
  
  // Add Car Modal state
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  
  // Add Order Modal state
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // ─────────────────────────────────────────────────────────────
  // DERIVED VALUES (useMemo)
  // ─────────────────────────────────────────────────────────────
  
  // Sorted cars list (alphabetically by model)
  const sortedCars = useMemo(
    () => [...cars].sort((a, b) => a.model.localeCompare(b.model)),
    [cars]
  );

  // Flag: has any cars
  const hasCars = useMemo(() => cars.length > 0, [cars]);

  // Flag: has any orders  
  const hasOrders = useMemo(() => allOrders.length > 0, [allOrders]);

  // First car (for defaults in modals)
  const firstCar = useMemo(() => cars[0] || null, [cars]);

  // ─────────────────────────────────────────────────────────────
  // ACTIONS - Modal handlers (useCallback)
  // ─────────────────────────────────────────────────────────────

  // Add Car Modal
  const openAddCarModal = useCallback(() => {
    setIsAddCarModalOpen(true);
  }, []);

  const closeAddCarModal = useCallback(() => {
    setIsAddCarModalOpen(false);
  }, []);

  // Add Order Modal
  const openAddOrderModal = useCallback((car = null) => {
    setSelectedCar(car);
    setIsAddOrderModalOpen(true);
  }, []);

  const closeAddOrderModal = useCallback(() => {
    setIsAddOrderModalOpen(false);
    setSelectedCar(null);
  }, []);

  // Select car (for use without opening modal)
  const selectCar = useCallback((car) => {
    setSelectedCar(car);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // ACTIONS - Notification handlers (useCallback)
  // ─────────────────────────────────────────────────────────────

  const closeNotification = useCallback(() => {
    setUpdateStatus(null);
  }, []);

  // Show success notification
  const showSuccess = useCallback((message) => {
    setUpdateStatus({ type: 200, message });
  }, []);

  // Show error notification
  const showError = useCallback((message) => {
    setUpdateStatus({ type: 500, message });
  }, []);

  // ─────────────────────────────────────────────────────────────
  // ACTIONS - Async handlers (useCallback with stable deps)
  // ─────────────────────────────────────────────────────────────

  /**
   * Update order in local state and refetch from server
   * @param {object} updatedOrder - order with updated fields
   */
  const handleOrderUpdate = useCallback(
    async (updatedOrder) => {
      // Optimistic update
      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      // Sync with server
      await fetchAndUpdateOrders();
    },
    [setAllOrders, fetchAndUpdateOrders]
  );

  /**
   * Delete car and show notification
   * @param {string} carId - ID of car to delete
   */
  const handleDeleteCar = useCallback(
    async (carId) => {
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
    },
    [deleteCarInContext, resubmitCars]
  );

  // ─────────────────────────────────────────────────────────────
  // GROUPED RETURN OBJECT
  // ─────────────────────────────────────────────────────────────

  /**
   * Grouped structure for cleaner component code:
   * const { data, ui, actions, status } = useAdminState();
   */
  const grouped = useMemo(
    () => ({
      data: {
        cars,
        sortedCars,
        allOrders,
        scrolled,
        firstCar,
        hasCars,
        hasOrders,
      },
      ui: {
        isAddCarModalOpen,
        isAddOrderModalOpen,
        selectedCar,
      },
      actions: {
        // Car modal
        openAddCarModal,
        closeAddCarModal,
        // Order modal
        openAddOrderModal,
        closeAddOrderModal,
        selectCar,
        setSelectedCar,
        // Data operations
        handleOrderUpdate,
        handleDeleteCar,
        resubmitCars,
        fetchAndUpdateOrders,
        // Notifications
        setUpdateStatus,
        closeNotification,
        showSuccess,
        showError,
      },
      status: {
        isLoading,
        error,
        updateStatus,
      },
    }),
    [
      // data
      cars,
      sortedCars,
      allOrders,
      scrolled,
      firstCar,
      hasCars,
      hasOrders,
      // ui
      isAddCarModalOpen,
      isAddOrderModalOpen,
      selectedCar,
      // actions (stable refs)
      openAddCarModal,
      closeAddCarModal,
      openAddOrderModal,
      closeAddOrderModal,
      selectCar,
      handleOrderUpdate,
      handleDeleteCar,
      resubmitCars,
      fetchAndUpdateOrders,
      closeNotification,
      showSuccess,
      showError,
      // status
      isLoading,
      error,
      updateStatus,
    ]
  );

  // ─────────────────────────────────────────────────────────────
  // FLAT RETURN (backward compatibility)
  // Components can destructure directly: const { cars, openAddCarModal } = useAdminState();
  // ─────────────────────────────────────────────────────────────

  return {
    // Grouped access
    ...grouped,
    
    // === FLAT ACCESS (for backward compatibility) ===
    
    // Data
    cars,
    sortedCars,
    allOrders,
    scrolled,
    firstCar,
    hasCars,
    hasOrders,
    
    // Status
    isLoading,
    error,
    updateStatus,
    
    // UI state
    isAddCarModalOpen,
    isAddOrderModalOpen,
    selectedCar,
    
    // Actions - Car modal
    openAddCarModal,
    closeAddCarModal,
    
    // Actions - Order modal
    openAddOrderModal,
    closeAddOrderModal,
    selectCar,
    setSelectedCar,
    
    // Actions - Data operations
    handleOrderUpdate,
    handleDeleteCar,
    resubmitCars,
    fetchAndUpdateOrders,
    
    // Actions - Notifications
    setUpdateStatus,
    closeNotification,
    showSuccess,
    showError,
  };
}

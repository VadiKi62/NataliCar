"use client";

import React, { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import Navbar from "@app/components/Navbar";
import AdminTopBar from "./AdminTopBar";
import AdminLoader from "./AdminLoader";
import AdminNotifications from "./AdminNotifications";
import { useAdminState } from "../hooks/useAdminState";

// Lazy-loaded секции
const CarsSection = dynamic(
  () => import("../sections/CarsSection"),
  { 
    loading: () => <AdminLoader message="Загрузка автомобилей..." />,
    ssr: false  // Отключаем SSR для более быстрой загрузки клиента
  }
);

const OrdersCalendarSection = dynamic(
  () => import("../sections/OrdersCalendarSection"),
  { 
    loading: () => <AdminLoader message="Загрузка календарей..." />,
    ssr: false 
  }
);

const BigCalendarSection = dynamic(
  () => import("../sections/BigCalendarSection"),
  { 
    loading: () => <AdminLoader message="Загрузка большого календаря..." />,
    ssr: false 
  }
);

const OrdersTableSection = dynamic(
  () => import("../sections/OrdersTableSection"),
  { 
    loading: () => <AdminLoader message="Загрузка таблицы заказов..." />,
    ssr: false 
  }
);

/**
 * AdminShell - основная обёртка админки с lazy loading секций
 * @param {object} props
 * @param {string} props.viewType - тип view: 'cars' | 'orders-calendar' | 'orders-big-calendar' | 'orders-table'
 */
export default function AdminShell({ viewType }) {
  const {
    isLoading,
    error,
    updateStatus,
    closeNotification,
    openAddCarModal,
  } = useAdminState();

  // Мемоизируем выбор секции
  const SectionComponent = useMemo(() => {
    switch (viewType) {
      case "cars":
        return CarsSection;
      case "orders-calendar":
        return OrdersCalendarSection;
      case "orders-big-calendar":
        return BigCalendarSection;
      case "orders-table":
        return OrdersTableSection;
      default:
        return CarsSection;
    }
  }, [viewType]);

  return (
    <>
      <Navbar isAdmin />
      
      <AdminTopBar
        viewType={viewType}
        onAddCarClick={viewType === "cars" ? openAddCarModal : undefined}
      />

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          pt: "72px", // Высота Navbar
          minHeight: "100vh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Suspense fallback={<AdminLoader fullScreen />}>
          <SectionComponent />
        </Suspense>
      </Box>

      {/* Централизованные уведомления */}
      <AdminNotifications
        status={updateStatus}
        onClose={closeNotification}
      />
    </>
  );
}


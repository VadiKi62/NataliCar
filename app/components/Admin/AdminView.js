"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import Feed from "@app/components/Feed";
import AdminLoader from "./AdminLoader";
import AdminTopBar from "./AdminTopBar";
import AdminNotifications from "./AdminNotifications";
import { useAdminState } from "./hooks/useAdminState";

// Lazy-loaded секции для уменьшения initial bundle
const CarsSection = dynamic(
  () => import("./sections/CarsSection"),
  { 
    loading: () => <AdminLoader message="Загрузка автомобилей..." />,
    ssr: false 
  }
);

const OrdersCalendarSection = dynamic(
  () => import("./sections/OrdersCalendarSection"),
  { 
    loading: () => <AdminLoader message="Загрузка календарей..." />,
    ssr: false 
  }
);

const BigCalendarSection = dynamic(
  () => import("./sections/BigCalendarSection"),
  { 
    loading: () => <AdminLoader message="Загрузка большого календаря..." />,
    ssr: false 
  }
);

const OrdersTableSection = dynamic(
  () => import("./sections/OrdersTableSection"),
  { 
    loading: () => <AdminLoader message="Загрузка таблицы заказов..." />,
    ssr: false 
  }
);

/**
 * AdminView - контейнер админки с lazy-loaded секциями
 * @param {object} props
 * @param {object} props.company - данные компании
 * @param {array} props.cars - массив машин
 * @param {array} props.orders - массив заказов
 * @param {string} props.viewType - тип view: 'cars' | 'orders-calendar' | 'orders-big-calendar' | 'orders-table'
 */
export default function AdminView({ company, cars, orders, viewType }) {
  return (
    <Feed cars={cars} orders={orders} company={company} isAdmin isMain={false}>
      <AdminViewContent viewType={viewType} />
    </Feed>
  );
}

/**
 * AdminViewContent - внутренний компонент с доступом к useAdminState
 * (должен быть внутри MainContextProvider из Feed)
 */
function AdminViewContent({ viewType }) {
  const {
    updateStatus,
    closeNotification,
    openAddCarModal,
  } = useAdminState();

  const renderSection = () => {
    switch (viewType) {
      case "cars":
        return <CarsSection />;
      case "orders-calendar":
        return <OrdersCalendarSection />;
      case "orders-big-calendar":
      case "calendar":
        return <BigCalendarSection />;
      case "orders-table":
      case "table":
        return <OrdersTableSection />;
      default:
        return <CarsSection />;
    }
  };

  return (
    <>
      <AdminTopBar
        viewType={viewType}
        onAddCarClick={viewType === "cars" ? openAddCarModal : undefined}
      />
      
      <Box sx={{ my: 3 }}>
        <Suspense fallback={<AdminLoader />}>
          {renderSection()}
        </Suspense>
      </Box>
      
      <AdminNotifications
        status={updateStatus}
        onClose={closeNotification}
      />
    </>
  );
}

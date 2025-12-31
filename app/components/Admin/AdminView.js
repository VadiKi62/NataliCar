"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import Feed from "@app/components/Feed";

// Shared components from new structure
import { AdminLoader, AdminNotifications, AdminTopBar } from "@app/admin/shared";
import { useCars } from "@app/admin/features/cars";

// ─────────────────────────────────────────────────────────────
// LAZY-LOADED FEATURE SECTIONS
// Reduces initial bundle size by loading features on demand
// ─────────────────────────────────────────────────────────────

const CarsSection = dynamic(
  () => import("@app/admin/features/cars/CarsSection"),
  { 
    loading: () => <AdminLoader message="Загрузка автомобилей..." />,
    ssr: false 
  }
);

const OrdersCalendarSection = dynamic(
  () => import("@app/admin/features/orders/OrdersCalendarSection"),
  { 
    loading: () => <AdminLoader message="Загрузка календарей..." />,
    ssr: false 
  }
);

const CalendarSection = dynamic(
  () => import("@app/admin/features/calendar/CalendarSection"),
  { 
    loading: () => <AdminLoader message="Загрузка календаря..." />,
    ssr: false 
  }
);

const OrdersTableSection = dynamic(
  () => import("@app/admin/features/orders/OrdersTableSection"),
  { 
    loading: () => <AdminLoader message="Загрузка таблицы заказов..." />,
    ssr: false 
  }
);

// ─────────────────────────────────────────────────────────────
// FEATURE CONFIG
// Maps viewType to feature component and metadata
// ─────────────────────────────────────────────────────────────

const FEATURES = {
  cars: {
    component: CarsSection,
    feature: "cars",
  },
  "orders-calendar": {
    component: OrdersCalendarSection,
    feature: "orders-calendar",
  },
  "orders-big-calendar": {
    component: CalendarSection,
    feature: "calendar",
  },
  calendar: {
    component: CalendarSection,
    feature: "calendar",
  },
  "orders-table": {
    component: OrdersTableSection,
    feature: "orders-table",
  },
  table: {
    component: OrdersTableSection,
    feature: "orders-table",
  },
};

// ─────────────────────────────────────────────────────────────
// ADMIN VIEW - Main entry point
// ─────────────────────────────────────────────────────────────

/**
 * AdminView - контейнер админки с lazy-loaded feature секциями
 * 
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

// ─────────────────────────────────────────────────────────────
// ADMIN VIEW CONTENT - Thin orchestrator
// Reads viewType and renders appropriate feature
// ─────────────────────────────────────────────────────────────

/**
 * AdminViewContent - внутренний компонент-оркестратор
 * Без бизнес-логики, только выбор feature для отображения
 */
function AdminViewContent({ viewType }) {
  // Get cars feature hook for add car modal
  const { notification, closeNotification, openAddModal } = useCars();

  // Memoize feature config lookup
  const featureConfig = useMemo(
    () => FEATURES[viewType] || FEATURES.cars,
    [viewType]
  );

  const FeatureComponent = featureConfig.component;

  return (
    <>
      {/* Top bar with feature-specific actions */}
      <AdminTopBar
        feature={featureConfig.feature}
        onAddClick={viewType === "cars" ? openAddModal : undefined}
      />
      
      {/* Feature section with lazy loading */}
      <Box sx={{ my: 3 }}>
        <Suspense fallback={<AdminLoader />}>
          <FeatureComponent />
        </Suspense>
      </Box>
      
      {/* Global notifications */}
      <AdminNotifications
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}

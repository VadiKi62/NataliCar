// ─────────────────────────────────────────────────────────────
// MAIN COMPONENTS
// ─────────────────────────────────────────────────────────────
export { default as AdminView } from "./AdminView";
export { default as DataLoader } from "./DataLoader";
export { default as AddCarModal } from "./AddCarModal";
export { default as DataGridCars } from "./DataGridCars";
export { default as DataGridOrders } from "./DataGridOrders";

// ─────────────────────────────────────────────────────────────
// RE-EXPORTS FROM NEW STRUCTURE
// For backward compatibility
// ─────────────────────────────────────────────────────────────

// Shared components
export { 
  AdminLoader, 
  AdminNotifications, 
  AdminTopBar 
} from "@app/admin/shared";

// Shared hooks
export { useAdminUI } from "@app/admin/shared";

// Feature hooks
export { useCars } from "@app/admin/features/cars";
export { useOrders } from "@app/admin/features/orders";
export { useCalendar } from "@app/admin/features/calendar";

// Feature sections (for lazy loading)
export { CarsSection } from "@app/admin/features/cars";
export { 
  OrdersCalendarSection, 
  OrdersTableSection 
} from "@app/admin/features/orders";
export { CalendarSection } from "@app/admin/features/calendar";

// Alias for backward compatibility
export { CalendarSection as BigCalendarSection } from "@app/admin/features/calendar";

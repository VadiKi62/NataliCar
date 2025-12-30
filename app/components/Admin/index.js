// Основные компоненты
export { default as AdminView } from "./AdminView";
export { default as DataLoader } from "./DataLoader";
export { default as AdminLoader } from "./AdminLoader";
export { default as AdminNotifications } from "./AdminNotifications";
export { default as AdminTopBar } from "./AdminTopBar";
export { default as AddCarModal } from "./AddCarModal";
export { default as DataGridCars } from "./DataGridCars";
export { default as DataGridOrders } from "./DataGridOrders";

// Хуки
export { useAdminState } from "./hooks/useAdminState";

// Секции (для lazy loading)
export { 
  CarsSection,
  OrdersCalendarSection, 
  BigCalendarSection,
  OrdersTableSection 
} from "./sections";


// Экспорт секций для lazy loading
// Использование: dynamic(() => import('@/app/admin/sections').then(m => m.CarsSection))

export { default as CarsSection } from "./CarsSection";
export { default as OrdersCalendarSection } from "./OrdersCalendarSection";
export { default as BigCalendarSection } from "./BigCalendarSection";
export { default as OrdersTableSection } from "./OrdersTableSection";


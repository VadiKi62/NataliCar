import DataLoader from "@app/components/Admin/DataLoader";

/**
 * /admin/orders-calendar - страница большого календаря заказов
 */
export default function PageOrdersCalendar() {
  return <DataLoader viewType="orders-big-calendar" />;
}

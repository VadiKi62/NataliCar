import DataLoader from "@app/components/Admin/DataLoader";

/**
 * /admin/orders - страница календарей заказов по машинам
 */
export default function PageOrders() {
  return <DataLoader viewType="orders-calendar" />;
}

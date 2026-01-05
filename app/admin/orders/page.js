import { DataLoader } from "@/app/admin/features/shared";

/**
 * /admin/orders - страница календарей заказов по машинам
 */
export default function PageOrders() {
  return <DataLoader viewType="orders-calendar" />;
}

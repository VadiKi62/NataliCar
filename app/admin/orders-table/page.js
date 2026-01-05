import { DataLoader } from "@/app/admin/features/shared";

/**
 * /admin/orders-table - страница таблицы заказов
 */
export default function PageOrdersTable() {
  return <DataLoader viewType="orders-table" />;
}

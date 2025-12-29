import DataLoader from "@app/components/Admin/DataLoader";

/**
 * /admin/table - страница таблицы заказов (альтернативный путь)
 */
export default function PageTable() {
  return <DataLoader viewType="orders-table" />;
}

import DataLoader from "@app/components/Admin/DataLoader";

/**
 * /admin - главная страница админки (автомобили)
 * Редирект на /admin/cars
 */
export default function AdminPage() {
  return <DataLoader viewType="cars" />;
}

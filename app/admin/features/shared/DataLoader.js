import { unstable_noStore } from "next/cache";
import AdminView from "./AdminView";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";
import { companyData } from "@/config/company";
/**
 * DataLoader — Server Component для загрузки данных админки
 * 
 * Загрузка происходит на сервере через await Promise.all(),
 * поэтому Suspense здесь не нужен — данные уже готовы.
 * 
 * Lazy-loading секций происходит в AdminView через dynamic().
 */
export default async function DataLoader({ viewType }) {
  unstable_noStore(); // Отключаем кеширование для админки
  
  const companyId = companyData.companyId;

  // ⚡ Запускаем ВСЕ загрузки параллельно с Promise.all
  // Это выполняется только один раз при загрузке страницы
  const [company, cars, orders] = await Promise.all([
    fetchCompany(companyId),
    fetchAllCars(),
    reFetchAllOrders(),
  ]);

  // Данные уже загружены — передаём в AdminView без Suspense
  return (
    <AdminView
      company={company}
      cars={cars}
      orders={orders}
      viewType={viewType}
    />
  );
}

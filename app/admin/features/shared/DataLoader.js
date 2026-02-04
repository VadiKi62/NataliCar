import { unstable_noStore } from "next/cache";
import AdminView from "./AdminView";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";
import { COMPANY_ID } from "@/config/company";
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
  
  // ⚡ Запускаем ВСЕ загрузки параллельно с Promise.all
  // skipCache: true для компании — чтобы после изменения буфера при перезагрузке подтягивались свежие данные из БД
  const [company, cars, orders] = await Promise.all([
    fetchCompany(COMPANY_ID, { skipCache: true }),
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

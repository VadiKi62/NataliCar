import { unstable_noStore } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import AdminView from "./AdminView";
import { getCars, getCompany, getAllOrders } from "@/domain/services";
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

  const session = await getServerSession(authOptions);
  const [company, cars, orders] = await Promise.all([
    getCompany(COMPANY_ID),
    getCars({ session }),
    getAllOrders({ session }),
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

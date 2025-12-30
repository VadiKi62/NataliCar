import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import Loading from "@app/loading";
import AdminView from "./AdminView";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";

export default async function DataLoader({ viewType }) {
  unstable_noStore(); // Отключаем кеширование для админки
  
  const companyId = "679903bd10e6c8a8c0f027bc";

  // ⚡ Запускаем ВСЕ загрузки параллельно с Promise.all
  // Это выполняется только один раз при загрузке страницы
  const [company, cars, orders] = await Promise.all([
    fetchCompany(companyId),
    fetchAllCars(),
    reFetchAllOrders(),
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <AdminView
        company={company}
        cars={cars}
        orders={orders}
        viewType={viewType}
      />
    </Suspense>
  );
}

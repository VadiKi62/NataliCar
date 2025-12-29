import { Suspense } from "react";
import Loading from "@app/loading";
import AdminView from "./AdminView";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";

export default async function DataLoader({ viewType }) {
  const companyId = "679903bd10e6c8a8c0f027bc";

  // ⚡ Запускаем ВСЕ загрузки параллельно с Promise.all
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

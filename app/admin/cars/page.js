import React, { Suspense } from "react";
import Cars from "@app/components/Admin/Car/Cars";
import Admin from "@app/components/Admin/Admin";
import Feed from "@app/components/Feed";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";

async function PageCars() {
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  const companyId = "679903bd10e6c8a8c0f027bc";
  const company = await fetchCompany(companyId);
  return (
    <Suspense>
      <Feed
        cars={carsData}
        orders={ordersData}
        company={company}
        isAdmin={true}
        isMain={false}
      >
        <Admin isCars={true} />
      </Feed>
    </Suspense>
  );
}

export default PageCars;

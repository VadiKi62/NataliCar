import React, { Suspense } from "react";
import Feed from "@app/components/Feed";

import { unstable_noStore } from "next/cache";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";
import CarGrid from "./components/CarGrid";
import {companyData as companyDataConfig } from "@config/company";

export default async function Home() {
  unstable_noStore();
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  const {companyId} = companyDataConfig;
  const companyData = await fetchCompany(companyId);

  // const company = await fetchCompany(companyId);

  const company = companyData;

  return (
    <Suspense>
      {/* <CarGrid carsData={carsData} ordersData={ordersData} /> */}
      <Feed cars={carsData} orders={ordersData} isMain={true} company={company}>
        <CarGrid />
      </Feed>
    </Suspense>
  );
}

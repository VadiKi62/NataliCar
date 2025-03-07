import React, { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import { Box } from "@mui/material";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";
import Feed from "@app/components/Feed";
import Loading from "@app/loading";

import BigCalendar from "@app/components/Calendars/BigCalendar";
import Admin from "@app/components/Admin/Admin";

export default async function PageOrdersCalendar() {
  unstable_noStore();
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  const companyId = "679903bd10e6c8a8c0f027bc";
  const company = await fetchCompany(companyId);
  return (
    <Suspense fallback={<Loading />}>
      <Feed
        cars={carsData}
        orders={ordersData}
        company={company}
        isAdmin={true}
        isMain={false}
      >
        <Box sx={{ my: 3 }}>
          <Admin isOrdersBigCalendar={true} />
        </Box>
      </Feed>
    </Suspense>
  );
}

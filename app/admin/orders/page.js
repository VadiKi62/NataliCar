import React, { Suspense } from "react";
import { Box } from "@mui/material";
import { unstable_noStore } from "next/cache";
import Feed from "@app/components/Feed";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";
import DataGridOrders from "@app/components/Admin/DataGridOrders";
import Admin from "@app/components/Admin/Admin";
import Loading from "@app/loading";

async function PageOrders() {
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
          <Admin isOrdersCalendars={true} />
        </Box>
      </Feed>
    </Suspense>
  );
}

export default PageOrders;

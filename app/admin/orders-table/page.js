"use client";
import React, { Suspense } from "react";
import { Box } from "@mui/material";
import Feed from "@app/components/Feed";
import Admin from "@app/components/Admin/Admin";

import { fetchAllCars, reFetchAllOrders } from "@utils/action";

async function pageOrders() {
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();

  return (
    <Suspense>
      <Feed cars={carsData} orders={ordersData} isAdmin={true} isMain={false}>
        <Box sx={{ my: 3 }}>
          <Admin isOrdersTable={true} />
        </Box>
      </Feed>
    </Suspense>
  );
}

export default pageOrders;

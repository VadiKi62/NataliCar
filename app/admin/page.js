import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { unstable_noStore } from "next/cache";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@theme";
import AdminLayout from "./layout";
import Loading from "@app/loading";
import Admin from "../components/Admin/Admin";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";
import { MainContextProvider } from "@app/Context";
import Navbar from "@app/components/Navbar";
import DataGridOrders from "@app/components/Admin/DataGridOrders";
import Feed from "@app/components/Feed";

export default async function PageOrdersCalendar({ children }) {
  unstable_noStore();
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  const companyId = "679903bd10e6c8a8c0f027bc";
  const company = await fetchCompany(companyId);

  return (
    <Suspense fallback={<Loading />}>
      <Feed
        cars={carsData}
        order={ordersData}
        company={company}
        isMain={false}
        isAdmin={true}
      >
        <Admin isCars={true} />
      </Feed>
    </Suspense>
  );
}

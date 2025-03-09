"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { unstable_noStore } from "next/cache";
import { DataGrid } from "@mui/x-data-grid";
import DataGridCars from "./DataGridCars";
import Item from "./Order/Item";
import { Grid, Container, CircularProgress, Box, Stack } from "@mui/material";
import { Element, scroller } from "react-scroll";

import { fetchAllCars } from "@utils/action";
import DefaultButton from "../common/DefaultButton";
import AddCarModal from "./AddCarModal";
import { useMainContext } from "@app/Context";
import Snackbar from "@app/components/common/Snackbar";
import Loading from "@app/loading";
import Error from "@app/error";
import { styled } from "@mui/system";
import Navbar from "@app/components/Navbar";
import LegendCalendarAdmin from "@app/components/common/LegendCalendarAdmin";
import AddOrderModal from "./Order/AddOrderModal";
import Cars from "./Car/Cars";
import DataGridOrders from "@app/components/Admin/DataGridOrders";
import BigCalendar from "@app/components/Calendars/BigCalendar";

const StyledBox = styled("div")(({ theme, scrolled, isCarInfo }) => ({
  zIndex: 996,
  position: "fixed",
  top: scrolled ? 40 : 50,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  paddingTop: theme.spacing(2),
  backgroundColor: !isCarInfo ? theme.palette.secondary.main : "transparent",
  // boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
}));

function Admin({ children, ...props }) {
  unstable_noStore();
  const {
    allOrders,
    setAllOrders,
    resubmitCars,
    cars,
    fetchAndUpdateOrders,
    deleteCarInContext,
    scrolled,
    isLoading,
    error,
  } = useMainContext();
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isModalAddCarOpen, setModalAddCar] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const handleCloseAddOrderModal = () => {
    setIsAddOrderOpen(false);
  };

  const handleOrderUpdate = async (updatedOrder) => {
    setAllOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    await fetchAndUpdateOrders();
  };

  const onCarDelete = async (carId) => {
    const { success, message, errorMessage } = await deleteCarInContext(carId);

    if (success) {
      setUpdateStatus({
        type: 200,
        message: message || "Car deleted successfully",
      });
    } else {
      setUpdateStatus({
        type: 500,
        message: errorMessage || "Failed to delete the car.",
      });
    }
  };

  // Openinig/closing handlers
  const handleCloseSnackbar = () => {
    setUpdateStatus(null);
  };

  const handleAddOpen = () => {
    setModalAddCar(true);
  };
  const onModalAddCarOpen = () => {
    setModalAddCar(false);
  };

  const isOrdersTable = props.isOrdersTable || false;
  const isOrdersBigCalendar = props.isOrdersBigCalendar || false;
  const isCars = props.isCars || false;
  const isOrdersCalendars = props.isOrdersCalendars || false;

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <Suspense fallback={<Loading />}>
      {/* <Navbar
        isAdmin={true}
        isCarInfo={isCarInfo}
        setIsCarInfo={setIsCarInfo}
      /> */}
      <StyledBox scrolled={scrolled} isCarInfo={isCars}>
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          justifyContent="center"
        >
          {isCars && (
            <DefaultButton
              onClick={handleAddOpen}
              minWidth="600px"
              padding={scrolled ? 0 : 1.5}
              relative
              sx={{ width: "100%" }}
            >
              Добавить машину
            </DefaultButton>
          )}
          {(isOrdersCalendars || isOrdersBigCalendar) && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              alignItems="center"
              justifyContent="center"
            >
              <LegendCalendarAdmin />
            </Stack>
          )}
        </Box>
      </StyledBox>
      {children}
      {isCars && (
        <Cars onCarDelete={onCarDelete} setUpdateStatus={setUpdateStatus} />
      )}
      {isOrdersCalendars && (
        <Grid
          container
          spacing={{ sm: 2, sx: 0.4 }}
          direction="column"
          sx={{
            alignItems: "center",
            alignContent: "center",
            mt: { xs: 10, md: 18 },
            // overflow: scroll,
          }}
        >
          {cars
            .sort((a, b) => a.model.localeCompare(b.model))
            .map((car) => (
              <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
                <Item
                  car={car}
                  isAddOrderOpen={isAddOrderOpen}
                  setSelectedCar={setSelectedCar}
                  setIsAddOrderOpen={setIsAddOrderOpen}
                  handleOrderUpdate={handleOrderUpdate}
                />
              </Grid>
            ))}
        </Grid>
      )}
      {isOrdersTable && <DataGridOrders cars={cars} orders={allOrders} />}
      {isOrdersBigCalendar && <BigCalendar cars={cars} orders={allOrders} />}
      {/* {isCarInfo ? (
        <Cars onCarDelete={onCarDelete} setUpdateStatus={setUpdateStatus} />
      ) : (
        <Grid
          container
          spacing={{ sm: 2, sx: 0.4 }}
          direction="column"
          sx={{
            alignItems: "center",
            alignContent: "center",
            mt: { xs: 10, md: 18 },
            overflow: scroll,
          }}
        >
          {cars
            .sort((a, b) => a.model.localeCompare(b.model))
            .map((car) => (
              <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
                <Item
                  car={car}
                  isAddOrderOpen={isAddOrderOpen}
                  setSelectedCar={setSelectedCar}
                  setIsAddOrderOpen={setIsAddOrderOpen}
                  handleOrderUpdate={handleOrderUpdate}
                />
              </Grid>
            ))}
        </Grid>
      )} */}
      {updateStatus && (
        <Snackbar
          key={updateStatus.message + updateStatus.type}
          message={updateStatus.message}
          isError={updateStatus.type !== 200}
          closeFunc={handleCloseSnackbar}
          open={Boolean(updateStatus)}
        />
      )}
      <AddCarModal
        open={isModalAddCarOpen}
        onClose={onModalAddCarOpen}
        car={cars[0]}
        setUpdateStatus={setUpdateStatus}
        fetchAndUpdateCars={resubmitCars}
      />
      <AddOrderModal
        open={isAddOrderOpen}
        onClose={handleCloseAddOrderModal}
        car={selectedCar}
        setUpdateStatus={setUpdateStatus}
      />
    </Suspense>
  );
}

export default Admin;

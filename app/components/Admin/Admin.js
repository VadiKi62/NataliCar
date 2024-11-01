"use client";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridOrders from "./DataGridOrders";
import DataGridCars from "./DataGridCars";
import Item from "./Order/Item";
import { Grid, Container, CircularProgress } from "@mui/material";
import { fetchAllCars } from "@utils/action";
import DefaultButton from "../common/DefaultButton";
import AddCarModal from "./AddCarModal";
import { useMainContext } from "@app/Context";
import Snackbar from "@app/components/common/Snackbar";
import Loading from "@app/loading";
import Error from "@app/error";
import { styled } from "@mui/system";
import Navbar from "@app/components/Navbar";

import Cars from "./Car/Cars";
const StyledBox = styled("div")(({ theme, scrolled }) => ({
  zIndex: 996,
  position: "fixed",
  top: scrolled ? 40 : 50,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  padding: theme.spacing(0.5),
  // backgroundColor: "transparent",
  // boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
}));

function Admin() {
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

  const [isCarInfo, setIsCarInfo] = useState(true);
  const [isModalAddCarOpen, setModalAddCar] = useState(false);

  const [ordersData, setOrders] = useState(allOrders);

  //   try {
  //     setLoading(true);
  //     const fetchedCars = await fetchAllCars();
  //     await resubmitCars();
  //     setCars(fetchedCars);
  //     setError(null);
  //   } catch (error) {
  //     setError("Failed to fetch cars. Please try again later.");
  //     console.error("Error fetching cars:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchAndUpdateCars();
  // }, []);

  // const handleCarUpdate = async (updatedCar) => {
  //   setCars((prevCars) =>
  //     prevCars.map((car) => (car._id === updatedCar._id ? updatedCar : car))
  //   );
  //   // await fetchAndUpdateCars();
  // };

  const handleOrderUpdate = async (updatedOrder) => {
    setOrders((prevOrders) =>
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

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return (
    <div>
      <Navbar
        isAdmin={true}
        isCarInfo={isCarInfo}
        setIsCarInfo={setIsCarInfo}
      />
      <StyledBox scrolled={scrolled}>
        <DefaultButton
          onClick={handleAddOpen}
          minWidth="600px"
          relative
          sx={{ width: "100%", margin: 0.5 }}
        >
          Добавить машину
        </DefaultButton>
      </StyledBox>
      {isCarInfo ? (
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
          }}
        >
          {cars
            .sort((a, b) => a.carNumer - b.carNumer)
            .map((car) => (
              <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
                <Item
                  car={car}
                  // orders={ordersData}
                  handleOrderUpdate={handleOrderUpdate}
                  // setOrders={setOrders}
                />
              </Grid>
            ))}
        </Grid>
      )}
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
    </div>
  );
}

export default Admin;

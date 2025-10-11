"use client";
import React, { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridOrders from "../DataGridOrders";
import DataGridCars from "../DataGridCars";
import { Grid, Container, CircularProgress } from "@mui/material";
import { fetchAllCars } from "@utils/action";
import DefaultButton from "../../common/DefaultButton";
import AddCarModal from "../AddCarModal";
import { useMainContext } from "@app/Context";
import Snackbar from "@app/components/common/Snackbar";
import Loading from "@app/loading";
import Error from "@app/error";
import { styled } from "@mui/system";
import CarItem from "./CarItem";

function Cars({ onCarDelete, setUpdateStatus }) {
  const {
    resubmitCars,
    cars,
    updateCarInContext,
    deleteCarInContext,
    isLoading,
    setIsLoading,
    updateStatus,
    error,
  } = useMainContext();

  // Диагностика: выводим массив cars в консоль после загрузки с сервера
  console.log("Cars.js cars:", cars);
  const [carsData, setCars] = useState(cars);

  console.log("cars", cars);
  console.log("carsData", carsData);

  const sortedCars = useMemo(() => {
    return carsData.sort((a, b) => a.model.localeCompare(b.model));
  }, [carsData]);

  // const fetchAndUpdateCars = async () => {
  //   try {
  //     setIsLoading(true);
  //     const fetchedCars = await fetchAllCars();
  //     await resubmitCars();
  //     // setCars(fetchedCars);
  //     setError(null);
  //   } catch (error) {
  //     setError("Failed to fetch cars. Please try again later.");
  //     console.error("Error fetching cars:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchAndUpdateCars();
  // }, []);

  // const onCarUpdate = async (updatedCar) => {
  //   setCars((prevCars) =>
  //     prevCars.map((car) => (car._id === updatedCar._id ? updatedCar : car))
  //   );
  //   // await fetchAndUpdateCars();
  // };

  useEffect(() => {
    // Восстановить scroll при загрузке
    const savedScroll = localStorage.getItem("carsScrollY");
    if (savedScroll) {
      window.scrollTo({ top: Number(savedScroll), behavior: "auto" });
    }
    // Сохранять scroll при любом изменении
    const handleScroll = () => {
      localStorage.setItem("carsScrollY", window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return (
    <div>
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
        {sortedCars.map((car) => (
          <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
            <CarItem
              car={car}
              onCarDelete={onCarDelete}
              setUpdateStatus={setUpdateStatus}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Cars;

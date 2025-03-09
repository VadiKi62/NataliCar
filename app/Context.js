"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  fetchAllCars,
  reFetchAllOrders,
  updateCar,
  deleteCar,
} from "@utils/action";
import { useTranslation } from "react-i18next";

const MainContext = createContext({
  cars: [],
  allOrders: [],
  setCars: () => {},
  setAllOrders: () => {},
  fetchAndUpdateOrders: () => {},
  ordersByCarId: () => {},
  isLoading: false,
  resubmitCars: () => {},
  scrolled: false,
  company: {},
});

export function useMainContext() {
  return useContext(MainContext);
}

export const MainContextProvider = ({
  carsData,
  ordersData,
  companyData,
  children,
}) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const [company, setCompany] = useState(companyData);
  const [scrolled, setScrolled] = useState(false);
  const [cars, setCars] = useState(carsData || []);
  const [allOrders, setAllOrders] = useState(ordersData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [selectedClass, setSelectedClass] = useState("All");
  const arrayOfAvailableClasses = useMemo(() => {
    return [...new Set(cars.map((car) => car.class))];
  }, [cars]);
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    setScrolled(scrollPosition > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const fetchAndUpdateOrders = async () => {
    setIsLoading(true);
    try {
      const newOrdersData = await reFetchAllOrders();
      setAllOrders(newOrdersData);
      console.log("Updated orders data:", newOrdersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resubmitCars = async (callback) => {
    setIsLoading(true);
    try {
      const newCarsData = await fetchAllCars();
      setCars(newCarsData);
      console.log("Updated cars data:", newCarsData);

      if (typeof callback === "function") {
        callback(newCarsData);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCarInContext = async (updatedCar) => {
    try {
      const newCar = await updateCar(updatedCar);
      setCars((prevCars) =>
        prevCars.map((car) => (car._id === newCar._id ? newCar : car))
      );
      console.log("FROM CONTEXT?", newCar.photoUrl);
      setUpdateStatus({
        type: 200,
        message: "Car updated successfully",
        data: newCar,
      });
      return { data: newCar, type: 200, message: "Car updated successfully" };
    } catch (error) {
      console.error("Failed to update car:", error);
      setUpdateStatus({
        type: 500,
        message: error.message || "Car WAS NOT successfully",
      });
    }
  };

  const deleteCarInContext = async (carId) => {
    try {
      const response = await fetch(`/api/car/delete/${carId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setCars((prevCars) => prevCars.filter((car) => car._id !== carId));
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          errorMessage: errorData.error || "Failed to delete car",
        };
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      return {
        success: false,
        errorMessage: error.message || "An unexpected error occurred",
      };
    }
  };
  const ordersByCarId = useCallback(
    (carId) => {
      return allOrders?.filter((order) => order.car === carId);
    },
    [allOrders]
  );

  const contextValue = useMemo(
    () => ({
      cars,
      allOrders,
      setCars,
      setAllOrders,
      fetchAndUpdateOrders,
      ordersByCarId,
      isLoading,
      setIsLoading,
      resubmitCars,
      scrolled,
      updateCarInContext,
      deleteCarInContext,
      error,
      updateStatus,
      setUpdateStatus,
      setSelectedClass,
      selectedClass,
      arrayOfAvailableClasses,
      lang,
      setLang,
      company,
    }),
    [
      cars,
      allOrders,
      isLoading,
      scrolled,
      selectedClass,
      lang,
      setLang,
      company,
    ]
  );

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};

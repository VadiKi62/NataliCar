"use client";
import { useTranslation } from "react-i18next";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  fetchAllCars,
  reFetchAllOrders,
  updateCar,
  deleteCar,
} from "@utils/action";

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

  // Функция для смены языка с сохранением в localStorage
  const changeLanguage = useCallback(
    (newLang) => {
      if (["en", "el", "ru"].includes(newLang)) {
        i18n.changeLanguage(newLang);
        setLang(newLang);
        // Сохраняем выбранный язык в localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedLanguage", newLang);
        }
      }
    },
    [i18n]
  );

  // Эффект для синхронизации языка при изменении в i18n
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setLang(lng);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Стабилизируем companyData с помощью useRef
  const companyDataRef = useRef(companyData);
  const hasLoadedCompanyRef = useRef(false);
  
  // Обновляем ref только если companyData действительно изменилась (по ID)
  useEffect(() => {
    if (companyData && companyData._id !== companyDataRef.current?._id) {
      companyDataRef.current = companyData;
      hasLoadedCompanyRef.current = true;
    }
  }, [companyData?._id]);

  const [company, setCompany] = useState(companyDataRef.current || companyData);
  const [companyLoading, setCompanyLoading] = useState(!companyData);
  const [companyError, setCompanyError] = useState(null);

  // Загрузка компании ТОЛЬКО если она не была передана с сервера
  // Используем ref для предотвращения повторных загрузок
  useEffect(() => {
    // Если данные уже есть или уже загружались - не делаем повторный запрос
    if (companyData || hasLoadedCompanyRef.current) {
      setCompanyLoading(false);
      if (companyData) {
        setCompany(companyData);
      }
      return;
    }

    // Предотвращаем повторные вызовы
    if (hasLoadedCompanyRef.current) {
      return;
    }

    async function loadCompany() {
      hasLoadedCompanyRef.current = true;
      setCompanyLoading(true);
      setCompanyError(null);
      try {
        const companyId = "679903bd10e6c8a8c0f027bc";
        const { fetchCompany } = await import("@utils/action");
        const freshCompany = await fetchCompany(companyId);
        setCompany(freshCompany);
        companyDataRef.current = freshCompany;
      } catch (err) {
        setCompanyError(err.message || "Ошибка загрузки компании");
        hasLoadedCompanyRef.current = false; // Разрешаем повторную попытку при ошибке
      } finally {
        setCompanyLoading(false);
      }
    }
    loadCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив зависимостей - загружаем только один раз при монтировании
  const [scrolled, setScrolled] = useState(false);
  
  // Стабилизируем начальные данные с помощью useRef
  const initialCarsRef = useRef(carsData);
  const initialOrdersRef = useRef(ordersData);
  
  // Обновляем refs только если данные действительно изменились (по длине или ID первого элемента)
  useEffect(() => {
    if (carsData && carsData.length > 0) {
      const carsChanged = 
        !initialCarsRef.current || 
        initialCarsRef.current.length !== carsData.length ||
        initialCarsRef.current[0]?._id !== carsData[0]?._id;
      if (carsChanged) {
        initialCarsRef.current = carsData;
      }
    }
  }, [carsData?.length, carsData?.[0]?._id]);
  
  useEffect(() => {
    if (ordersData && ordersData.length > 0) {
      const ordersChanged = 
        !initialOrdersRef.current || 
        initialOrdersRef.current.length !== ordersData.length ||
        initialOrdersRef.current[0]?._id !== ordersData[0]?._id;
      if (ordersChanged) {
        initialOrdersRef.current = ordersData;
      }
    }
  }, [ordersData?.length, ordersData?.[0]?._id]);
  
  const [cars, setCars] = useState(initialCarsRef.current || []);
  const [allOrders, setAllOrders] = useState(initialOrdersRef.current || []);
  const [isLoading, setIsLoading] = useState(false);
  
  // Синхронизируем state с пропсами только если данные действительно изменились
  useEffect(() => {
    if (carsData && carsData.length > 0) {
      const carsChanged = 
        cars.length !== carsData.length ||
        cars[0]?._id !== carsData[0]?._id;
      if (carsChanged) {
        setCars(carsData);
      }
    }
  }, [carsData?.length, carsData?.[0]?._id]); // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    if (ordersData && ordersData.length > 0) {
      const ordersChanged = 
        allOrders.length !== ordersData.length ||
        allOrders[0]?._id !== ordersData[0]?._id;
      if (ordersChanged) {
        setAllOrders(ordersData);
      }
    }
  }, [ordersData?.length, ordersData?.[0]?._id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedTransmission, setSelectedTransmission] = useState("All"); // Новый фильтр по коробке передач
  const arrayOfAvailableClasses = useMemo(() => {
    return [...new Set(cars.map((car) => car.class))];
  }, [cars]);
  const arrayOfAvailableTransmissions = useMemo(() => {
    return [...new Set(cars.map((car) => car.transmission))];
  }, [cars]);
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    setScrolled(scrollPosition > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const fetchAndUpdateOrders = useCallback(async () => {
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
  }, []);

  const resubmitCars = useCallback(async (callback) => {
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
  }, []);

  const updateCarInContext = useCallback(async (updatedCar) => {
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
  }, []);

  const deleteCarInContext = useCallback(async (carId) => {
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
  }, []);
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
      setSelectedTransmission, // Новые значения для фильтра коробки передач
      selectedTransmission,
      arrayOfAvailableTransmissions,
      lang,
      setLang,
      changeLanguage, // Добавляем функцию смены языка
      company,
      companyLoading,
      companyError,
    }),
    [
      cars,
      arrayOfAvailableClasses,
      arrayOfAvailableTransmissions,
      error,
      ordersByCarId,
      updateStatus,
      allOrders,
      isLoading,
      scrolled,
      selectedClass,
      selectedTransmission,
      lang,
      changeLanguage,
      company,
      companyLoading,
      companyError,
      fetchAndUpdateOrders,
      resubmitCars,
      updateCarInContext,
      deleteCarInContext,
    ]
  );

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};

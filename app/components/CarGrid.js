"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Grid, Container } from "@mui/material";
import { styled } from "@mui/material/styles";

import { useMainContext } from "../Context";
import CarItemComponent from "./CarComponent/CarItemComponent";

const Section = styled("section")(({ theme }) => ({
  backgroundColor: "transparent",
  textAlign: "center",
}));

import dayjs from "dayjs";

function CarGrid() {
  const { cars, selectedClass, selectedTransmission } = useMainContext();

  // --- Состояния для скидки ---
  const [discount, setDiscount] = useState(null);
  const [discountStart, setDiscountStart] = useState(null);
  const [discountEnd, setDiscountEnd] = useState(null);
  

  // Defer discount fetch to avoid blocking initial render
  // Discount is non-critical for first paint (optional feature)
  const fetchDiscount = useCallback(async () => {
    try {
      const res = await fetch("/api/discount");
      if (!res.ok) throw new Error("Ошибка загрузки скидки");
      const data = await res.json();
      setDiscount(data.discount || null);
      setDiscountStart(data.startDate ? dayjs(data.startDate) : null);
      setDiscountEnd(data.endDate ? dayjs(data.endDate) : null);
    } catch (err) {
      // Ошибка загрузки скидки - тихо игнорируем
    }
  }, []);

  useEffect(() => {
    // Defer non-critical discount fetch after initial paint
    // Use requestIdleCallback if available, otherwise setTimeout
    let timer;
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      timer = window.requestIdleCallback(() => {
        fetchDiscount().catch(() => {
          // Silently ignore errors - discount is optional
        });
      }, { timeout: 2000 });
    } else {
      timer = setTimeout(() => {
        fetchDiscount().catch(() => {
          // Silently ignore errors - discount is optional
        });
      }, 100);
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.requestIdleCallback && typeof timer === 'number') {
        window.cancelIdleCallback(timer);
      } else if (typeof timer !== 'undefined') {
        clearTimeout(timer);
      }
    };
  }, [fetchDiscount]);

  // Мемоизируем фильтрацию и сортировку машин
  const filteredCars = useMemo(() => {
    return cars
      .filter(
        (car) =>
          // Фильтр по классу
          (selectedClass === "All" || car.class === selectedClass) &&
          // Фильтр по коробке передач
          (selectedTransmission === "All" ||
            car.transmission === selectedTransmission)
      )
      .sort((a, b) => a.model.localeCompare(b.model));
  }, [selectedClass, selectedTransmission, cars]);

  return (
    <Container sx={{ mt: 5 }}>
      <Section>
        <Grid
          container
          spacing={{ sm: 2, sx: 0.4 }}
          direction="column"
          sx={{ alignItems: "center", alignContent: "center" }}
        >
          {filteredCars?.map((car, index) => (
            <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
              <CarItemComponent
                car={car}
                discount={discount}
                discountStart={discountStart}
                discountEnd={discountEnd}
                isFirstCar={index === 0}
              />
            </Grid>
          ))}
        </Grid>
      </Section>
    </Container>
  );
}

export default CarGrid;

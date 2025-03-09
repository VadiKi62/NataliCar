"use client";
import React, { useState, useEffect } from "react";
import { Grid, Container, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import { useMainContext } from "../Context";
import Feed from "./Feed";
import CarItemComponent from "./CarComponent/CarItemComponent";

const Section = styled("section")(({ theme }) => ({
  backgroundColor: "transparent",
  textAlign: "center",
}));

function CarGrid() {
  const { cars, company, selectedClass } = useMainContext();
  const [filteredCars, setFilteredCars] = useState(cars);

  // Filter cars by the selected class
  useEffect(() => {
    const updatedCars = cars
      .filter(
        (car) => !!(selectedClass == "All") || car.class === selectedClass
      )
      .sort((a, b) => a.model.localeCompare(b.model)); // Sort the filtered cars
    setFilteredCars(updatedCars);
  }, [selectedClass, cars]);

  return (
    <Container sx={{ paddingTop: { xs: 28, md: 20 } }}>
      <Section>
        <Grid
          container
          spacing={{ sm: 2, sx: 0.4 }}
          direction="column"
          sx={{ alignItems: "center", alignContent: "center" }}
        >
          {filteredCars?.map((car) => (
            <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
              <CarItemComponent car={car} />
            </Grid>
          ))}
        </Grid>
      </Section>
    </Container>
  );
}

export default CarGrid;

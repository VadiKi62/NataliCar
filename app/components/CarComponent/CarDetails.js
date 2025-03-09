import React, { useState } from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
// import PricingTiers from "./PricingTiers";
import Image from "next/image";
import CarDetailsModal from "./CarDetailsModal";
import CarTypography from "../common/CarTypography";
import { useTranslation } from "@node_modules/react-i18next";

const CarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: theme.spacing(1.7),
  marginTop: theme.spacing(2.5),
}));

const CarDetails = ({ car }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();

  const additionalDetails = [
    {
      key: "registration",
      label: t("car.reg-year"),
      icon: "/icons/registration.png",
      getValue: (car) => car.registration,
    },
    {
      key: "regNumber",
      label: t("car.reg-numb"),
      icon: "/icons/regnumber.png",
      getValue: (car) => car.regNumber,
    },
    {
      key: "color",
      label: t("car.color"),
      icon: "/icons/color.png",
      getValue: (car) => car.color,
    },
    {
      key: "numberOfDoors",
      label: t("car.doors"),
      icon: "/icons/doors2.png",
      getValue: (car) => car.numberOfDoors,
    },
    {
      key: "enginePower",
      label: t("car.engine-pow"),
      icon: "/icons/engine_power.png",
      getValue: (car) => `${car.enginePower} HP`,
    },
    {
      key: "engine",
      label: t("car.engine"),
      icon: "/icons/engine.png",
      getValue: (car) => car.engine,
    },
  ];

  const defaultDetails = [
    {
      key: "class",
      label: t("car.class"),
      icon: "/icons/klass.png",
      getValue: (car) => car.class,
    },
    {
      key: "transmission",
      label: t("car.transmission"),
      icon: "/icons/transmission.png",
      getValue: (car) => car.transmission,
    },
    {
      key: "fueltype",
      label: t("car.fuel"),
      icon: "/icons/fuel.png",
      getValue: (car) => car.fueltype,
    },
    {
      key: "seats",
      label: t("car.seats"),
      icon: "/icons/seat.png",
      getValue: (car) => car.seats,
    },
    {
      key: "airConditioning",
      label: t("car.air"),
      icon: "/icons/ac.png",
      getValue: (car) => (car.airConditioning ? "Yes" : "No"),
    },
  ];

  const allDetails = [...additionalDetails, ...defaultDetails];

  return (
    <>
      <CarTitle sx={{ width: "60%", textAlign: "center" }} variant="h5">
        {car.model}
      </CarTitle>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          alignItems: "left",
          px: 3,
        }}
      >
        {defaultDetails.map((detail) => (
          <Grid item key={detail.key} mb={0.4}>
            <Grid container alignItems="center" mb={0.2}>
              <Grid item mr={1}>
                <Image
                  src={detail.icon}
                  alt={detail.label}
                  width={24}
                  height={24}
                />
              </Grid>
              <Grid item>
                <CarTypography>
                  {detail.label}: {detail.getValue(car)}
                </CarTypography>
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Button
          onClick={() => setModalOpen(true)}
          variant="outlined"
          sx={{ mt: 2, mb: 1 }}
        >
          {t("car.viewDetails")}
        </Button>

        <CarDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          car={car}
          additionalDetails={allDetails}
        />

        {/* <PricingTiers prices={car?.pricingTiers} /> */}
      </Box>
    </>
  );
};

export default CarDetails;

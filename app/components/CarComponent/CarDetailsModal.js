import React from "react";
import { Modal, Box, Typography, Button, Grid } from "@mui/material";
import Image from "next/image";
import CarTypography from "../common/CarTypography";
import { useTranslation } from "react-i18next";

const CarDetailsModal = ({ open, onClose, car }) => {
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
      getValue: (car) =>
        car.color ? car.color.charAt(0).toUpperCase() + car.color.slice(1) : "",
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
      getValue: (car) => car.enginePower,
    },
    {
      key: "engine",
      label: t("car.engine"),
      icon: "/icons/engine.png",
      getValue: (car) =>
        car.engine
          ? car.engine.charAt(0).toUpperCase() + car.engine.slice(1)
          : "",
    },
  ];

  const defaultDetails = [
    {
      key: "class",
      label: t("car.class"),
      icon: "/icons/klass.png",
      getValue: (car) =>
        car.class ? car.class.charAt(0).toUpperCase() + car.class.slice(1) : "",
    },
    {
      key: "transmission",
      label: t("car.transmission"),
      icon: "/icons/transmission.png",
      getValue: (car) =>
        car.transmission
          ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)
          : "",
    },
    {
      key: "fueltype",
      label: t("car.fuel"),
      icon: "/icons/fuel.png",
      getValue: (car) =>
        car.fueltype
          ? car.fueltype.charAt(0).toUpperCase() + car.fueltype.slice(1)
          : "",
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

  // Финансовые / страховые детали, добавленные по запросу:
  const financialDetails = [
    {
      key: "PriceChildSeats",
      label: t("car.childSeatsPrice"),
      icon: "/icons/childseat.png",
      getValue: (car) =>
        car.PriceChildSeats || car.PriceChildSeats === 0
          ? `${car.PriceChildSeats} € / ${t("order.perDay")}`
          : "-",
    },
    {
      key: "insuranceTPLFree",
      label: t("car.insuranceTPLFree"), // Строка без значения, просто текст
      icon: "/icons/insurance_tpl.png",
      getValue: () => "", // Ничего справа, вся информация в label
    },
    {
      key: "PriceKacko",
      label: t("car.KackoPrice"),
      icon: "/icons/insurance_kasko.png",
      getValue: (car) =>
        car.PriceKacko || car.PriceKacko === 0
          ? `${car.PriceKacko} € / ${t("order.perDay")}`
          : "-",
    },
    {
      key: "franchiseKacko",
      label: t("car.franchiseKacko"),
      icon: "/icons/franchise.png",
      getValue: (car) =>
        car.franchise || car.franchise === 0 ? `${car.franchise} €` : "-",
    },
    {
      key: "deposit",
      label: t("car.deposit"),
      icon: "/icons/deposit.png",
      getValue: (car) =>
        car.deposit && car.deposit > 0
          ? `${car.deposit} €`
          : t("car.noDeposit"),
    },
  ];

  const allDetails = [
    ...defaultDetails,
    ...additionalDetails,
    ...financialDetails,
  ];
  return (
    <Modal open={open} onClose={onClose} sx={{ textAlign: "center" }}>
      <Box
        onClick={() => onClose()}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          overflowY: "auto",
          cursor: "pointer",
        }}
      >
        {/* Заголовок с названием автомобиля */}
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            textTransform: "uppercase",
            fontWeight: 700,
            mb: 3,
            color: "primary.main",
          }}
        >
          {car?.model || "Car Details"}
        </Typography>
        <Grid container direction="column" spacing={2}>
          {allDetails.map((detail) => (
            <Grid item key={detail.key}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Image
                    src={detail.icon}
                    alt={detail.label}
                    width={24}
                    height={24}
                  />
                </Grid>
                <Grid item>
                  <CarTypography>
                    {detail.label}:{" "}
                    {typeof detail.getValue(car) === "string" &&
                    detail.getValue(car)
                      ? detail.getValue(car).charAt(0).toUpperCase() +
                        detail.getValue(car).slice(1)
                      : detail.getValue(car)}
                  </CarTypography>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
        <Button onClick={onClose} variant="contained" sx={{ mt: 3 }}>
          {t("basic.close")}
        </Button>
      </Box>
    </Modal>
  );
};

export default CarDetailsModal;

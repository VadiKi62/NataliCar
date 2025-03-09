"use client";
// ЭТА СТРАНИЦА НЕ ИСПОЛЬЗУЕТСЯ
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Box, Button, Stack, Divider } from "@mui/material";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { FaCarSide, FaGasPump, FaDoorOpen, FaSnowflake } from "react-icons/fa";

import ScrollingCalendar from "./Calendars/ScrollingCalendar";
import BookingModal from "./CarComponent/BookingModal";

// import BookingModal from "./BookingModal";

// Full-screen container for the car page
const StyledCarPage = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  minHeight: "100vh",
  padding: theme.spacing(0),
  position: "relative",
}));

// Car detail card with box shadow and hover effects
const StyledCarCard = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "900px",
  margin: "auto",
  paddingBottom: 10,
  borderRadius: "12px",
  boxShadow: theme.shadows[5],
  overflow: "hidden",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: theme.shadows[10],
  },
}));

// Image component styled for full responsiveness
const CarImage = styled(Image)(({ theme }) => ({
  width: "100%",
  height: "auto",
  objectFit: "cover",
}));

// Container for the car details
const CarDetails = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "#ffffff", // White background for content readability
}));

// Large title for car model
const CarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 700,
  color: theme.palette.primary.red,
  marginBottom: theme.spacing(2),
}));

// Info section for various car details
const CarInfoSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
}));

// Info box for each car detail
const CarInfoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

// Text styling for the car info
const CarInfoText = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: "#555",
  marginLeft: theme.spacing(1),
}));

const BookButton = styled(Button)(({ theme }) => ({
  position: "sticky", // Sticky positioning
  top: theme.spacing(1), // Sticks 16px from the top of the viewport
  //   left: "50%",
  //   transform: "translateX(-50%)",
  width: "calc(100% - 20px)", // Slightly smaller than the full width
  maxWidth: "900px",
  backgroundColor: theme.palette.primary.green,
  color: theme.palette.secondary.main,
  padding: theme.spacing(2),
  fontSize: "1.5rem",
  boxShadow: theme.shadows[5],
  marginBottom: theme.spacing(4), // Add space below the button
  zIndex: 1022200, // Ensures the button stays on top
  "&:hover": {
    backgroundColor: theme.palette.primary.red,
    color: theme.palette.primary.green,
  },
}));

const PriceSection = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.primary.red,
  color: "#fff", // White text for contrast
  fontWeight: 700,
  fontSize: "1.5rem",
}));
function CarPageComponent({ car }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [bookDates, setBookedDates] = useState({ start: null, end: null });

  // Function to handle date selection
  const handleDateSelect = (date) => {
    // Logic to handle start and end date selection
    if (!bookDates.start || (bookDates.start && bookDates.end)) {
      setBookDates({ start: date, end: null });
    } else {
      setBookDates({ ...bookDates, end: date });
    }
  };

  const handleBookingComplete = () => {
    setModalOpen(true);
  };

  return (
    <StyledCarPage>
      <BookButton onClick={() => setModalOpen(true)}>BOOK NOW</BookButton>

      <StyledCarCard>
        <CarImage src={car.photoUrl} alt={car.model} width={800} height={400} />
        <CarDetails>
          <CarTitle>{car.model}</CarTitle>
          <CarInfoSection>
            <CarInfoBox>
              <FaCarSide size={24} color="#555" />
              <CarInfoText>Class: {car.class}</CarInfoText>
            </CarInfoBox>
            <CarInfoBox>
              <FaGasPump size={24} color="#555" />
              <CarInfoText>Transmission: {car.transmission}</CarInfoText>
            </CarInfoBox>
            <CarInfoBox>
              <FaDoorOpen size={24} color="#555" />
              <CarInfoText>Doors: {car.numberOfDoors}</CarInfoText>
            </CarInfoBox>
            <CarInfoBox>
              <FaSnowflake size={24} color="#555" />
              <CarInfoText>
                AC: {car.airConditioning ? "Yes" : "No"}
              </CarInfoText>
            </CarInfoBox>
          </CarInfoSection>
        </CarDetails>

        <PriceSection
          direction="row"
          divider={<Divider orientation="vertical" flexItem color="white" />}
          spacing={2}
        >
          <Typography textAlign="center"> Price per day:</Typography>
          {Object.entries(car?.pricingTiers).map(([days, price]) => (
            <Typography key={days} variant="body1" component="p">
              {days}d+ €{price}
            </Typography>
          ))}
        </PriceSection>
      </StyledCarCard>

      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        car={car}
        presetDates={{ startDate: bookDates.start, endDate: bookDates.end }}
      />
    </StyledCarPage>
  );
}

export default CarPageComponent;

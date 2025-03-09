import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Collapse,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CalendarAdmin from "./CalendarAdmin";
import { updateCar } from "@utils/action";
import { useMainContext } from "@app/Context";
import DefaultButton from "../../common/DefaultButton";
import { deleteCar } from "@utils/action";
import Snackbar from "@app/components/common/Snackbar";
import AddOrderModal from "./AddOrderModal";

import { CldImage } from "next-cloudinary";

const StyledCarItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 400,
  zIndex: 22,
  display: "flex",
  justifyContent: "center",
  bgColor: "black",
  alignItems: "center",
  alignContent: "center",
  flexDirection: "column",
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[5],
  },
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 950,
    padding: theme.spacing(5),
  },
}));

const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const CarImage = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",

  [theme.breakpoints.up("md")]: {
    width: 450,
    height: 300,
  },
}));

const CarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const CarInfo = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(0.5),
  "& svg": {
    marginRight: theme.spacing(1),
    fontSize: "1.1rem",
  },
}));

function Item({
  car,
  handleOrderUpdate,
  setIsAddOrderOpen,
  isAddOrderOpen,
  setSelectedCar,
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [carOrders, setCarOrders] = useState([]);

  const { ordersByCarId, allOrders, fetchAndUpdateOrders } = useMainContext();

  // Update orders when allOrders or car._id changes
  useEffect(() => {
    const updatedOrders = ordersByCarId(car._id);
    if (car._id == "67486efa4b275f66b785c53f")
      console.log("updatedOrders", updatedOrders);

    setCarOrders(updatedOrders);
  }, [allOrders, car._id, ordersByCarId]);

  useEffect(() => {
    // Set a 3-second delay before showing the image
    const loadingTimer = setTimeout(() => {
      setImageLoading(false);
    }, 3000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(loadingTimer);
  }, []);

  const handleOpneModal = () => {
    setSelectedCar(car);
    setIsAddOrderOpen(true);
  };

  return (
    <StyledCarItem elevation={3}>
      <Wrapper>
        <Button variant="contained" color="primary" onClick={handleOpneModal}>
          Add Order for {car.model}
        </Button>
        {car?.photoUrl && (
          <CarImage>
            {imageLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress />
                <CircularProgress sx={{ color: "primary.green" }} />
                <CircularProgress sx={{ color: "primary.red" }} />
              </Box>
            ) : (
              <>
                <CldImage
                  src={car?.photoUrl || "My Brand/favicon_i6jw77"}
                  alt={`Natali-Cars-${car.model}`}
                  width="450"
                  height="300"
                  crop="fill"
                  priority
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                    marginTop: 10,
                  }}
                  onLoad={() => setImageLoading(false)} //
                />
              </>
            )}
          </CarImage>
        )}

        <CarTitle variant="h5">{car.model}</CarTitle>
        <CarTitle variant="h5">{car.regNumber}</CarTitle>
      </Wrapper>

      <CalendarAdmin
        orders={carOrders}
        handleOrderUpdate={fetchAndUpdateOrders}
        setCarOrders={setCarOrders}
      />
    </StyledCarItem>
  );
}

export default Item;

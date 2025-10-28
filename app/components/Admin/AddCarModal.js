import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Checkbox,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import PricingTiers from "./Car/PricingTiers";
import { useMainContext } from "@app/Context";
import {
  CAR_CLASSES,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  PREDEFINED_COLORS,
  defaultPrices,
} from "@models/enums";
import { styled } from "@mui/material/styles";
import {
  RenderTextField,
  RenderSelectField,
} from "@app/components/common/Fields";
import CarImageUpload from "../common/AddImageComponent";
import { useTranslation } from "react-i18next";

const AddCarModal = ({
  open,
  onClose,
  car,
  setUpdateStatus,
  fetchAndUpdateCars,
}) => {
  const DEFAULT_IMAGE = "./NO_PHOTO.png";
  const { resubmitCars } = useMainContext();

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE);
  const [carData, setCarData] = useState({
    carNumber: "",
    model: "Toyota",
    sort: 999,
    class: CAR_CLASSES.ECONOMY,
    transmission: TRANSMISSION_TYPES.AUTOMATIC,
    fueltype: FUEL_TYPES.PETROL,
    seats: 5,
    registration: 2016,
    regNumber: "123",
    color: "white",
    numberOfDoors: 4,
    airConditioning: true,
    enginePower: "100",
    engine: "1.500",
    pricingTiers: defaultPrices,
    photoUrl: "NO_PHOTO_h2klff",
    PriceChildSeats: 3,
    franchise: 300,
    PriceKacko: 5,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (carData[name] !== newValue) {
      setCarData((prevData) => ({ ...prevData, [name]: newValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("??", carData);
    try {
      const formData = new FormData();
      formData.append("model", carData.model);
      formData.append("class", carData.class);
      formData.append("regNumber", carData.regNumber);
      formData.append("transmission", carData.transmission);
      formData.append("fueltype", carData.fueltype || "");
      formData.append("seats", String(carData.seats));
      formData.append("numberOfDoors", String(carData.numberOfDoors));
      // Send booleans as explicit strings to avoid truthy string pitfalls server-side
      formData.append(
        "airConditioning",
        carData.airConditioning ? "true" : "false"
      );
      formData.append("enginePower", String(carData.enginePower));
      formData.append("engine", String(carData.engine));
      formData.append("color", String(carData.color));
      formData.append("registration", String(carData.registration));
      if (carData.deposit !== undefined && carData.deposit !== null) {
        formData.append("deposit", String(carData.deposit));
      }
      formData.append("pricingTiers", JSON.stringify(carData.pricingTiers));

      console.log("?? FORMDATA", formData);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      console.log("?? FORMDATA", formData);
      const response = await fetch("/api/car/addOne", {
        method: "POST",
        body: formData,
      });

      // Try to parse JSON if available; otherwise read text for better errors
      const contentType = response.headers.get("content-type") || "";
      let result;
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Unexpected non-JSON response (status ${response.status})`);
      }

      if (!response.ok || result?.success === false) {
        const details = result?.details ? ` — ${result.details}` : "";
        const base = result?.message || response.statusText || "Failed to add car";
        throw new Error(`${base}${details}`);
      }

      setUpdateStatus({ message: result.message || "OK", type: 200 });

      if (response.ok) {
        await resubmitCars(); // Refresh car data
        onClose(); // Close the modal
        setCarData({});
        setSelectedImage(null); // Clear image
      }
    } catch (error) {
      setUpdateStatus({ message: error?.message || "Unknown error", type: 400 });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Set preview image and file name
      setImagePreview(URL.createObjectURL(file));
      setSelectedImage(file);
      setCarData({ ...carData, photoUrl: file.name });
    } else {
      // Reset to default if no file is chosen
      setImagePreview(DEFAULT_IMAGE);
      setCarData({ ...carData, photoUrl: "NO_PHOTO_h2klff" });
    }
  };
  const { t } = useTranslation();
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box sx={{ opacity: loading ? 0.3 : 1, transition: "opacity 0.2s" }}>
          <DialogTitle>{t("carPark.addNewCar")}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Stack spacing={3}>
                    <Autocomplete
                      freeSolo
                      options={[
                        "Audi",
                        "BMW",
                        "Chevrolet",
                        "Citroën",
                        "Dacia",
                        "Dodge",
                        "Fiat",
                        "Ford",
                        "Honda",
                        "Hyundai",
                        "Isuzu",
                        "Kia",
                        "Mazda",
                        "Mercedes-Benz",
                        "MG",
                        "Mini",
                        "Mitsubishi",
                        "Nissan",
                        "Opel",
                        "Peugeot",
                        "Renault",
                        "Seat",
                        "Škoda",
                        "Smart",
                        "Suzuki",
                      ]}
                      value={carData.model || ""}
                      onChange={(_, newValue) =>
                        handleChange({
                          target: { name: "model", value: newValue || "" },
                        })
                      }
                      onInputChange={(_, inputValue) =>
                        handleChange({
                          target: { name: "model", value: inputValue },
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("car.model")}
                          name="model"
                        />
                      )}
                    />
                    <RenderSelectField
                      name="transmission"
                      label={t("car.transmission")}
                      options={Object.values(TRANSMISSION_TYPES)}
                      required
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    <RenderTextField
                      type="number"
                      name="seats"
                      label={t("car.seats")}
                      defaultValue="5"
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    <RenderTextField
                      type="number"
                      name="PriceKacko"
                      label={t("car.KackoPrice") || "Цена КАСКО в день"}
                      defaultValue={carData.PriceKacko || 5}
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={carData.airConditioning || false}
                          onChange={handleChange}
                          name="airConditioning"
                        />
                      }
                      label={t("car.air")}
                      sx={{ my: 1 }}
                    />
                    {/* <RenderTextField
                      type="number"
                      name="franchise"
                      label={t("car.franchise")}
                      defaultValue={carData.franchise || 0}
                      updatedCar={carData}
                      handleChange={handleChange}
                    /> */}
                    {/* <RenderTextField
                      type="number"
                      name="PriceChildSeats"
                      label={t("car.childSeatsPrice")}
                      //label="Цена КАСКО в день"
                      defaultValue={carData.PriceChildSeats || 3}
                      updatedCar={carData}
                      handleChange={handleChange}
                    />{" "} */}
                    {/* <RenderTextField
                      type="number"
                      name="PriceKacko"
                      label={t("car.KackoPrice") || "Цена КАСКО в день"}
                      defaultValue={carData.PriceKacko || 5}
                      updatedCar={carData}
                      handleChange={handleChange}
                    /> */}
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={3}>
                    <RenderTextField
                      name="registration"
                      label={t("car.reg-year")}
                      defaultValue="2017"
                      type="number"
                      updatedCar={carData}
                      handleChange={handleChange}
                      required
                    />
                    <RenderSelectField
                      name="fueltype"
                      label={t("car.fuel")}
                      options={Object.values(FUEL_TYPES)}
                      updatedCar={carData}
                      handleChange={handleChange}
                      required
                    />
                    <RenderTextField
                      required
                      type="number"
                      name="numberOfDoors"
                      label={t("car.doors")}
                      defaultValue={carData.numberOfDoors}
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    {/* <RenderTextField
                      type="number"
                      name="franchise"
                      label={t("car.franchise")}
                      defaultValue={carData.franchise || 0}
                      updatedCar={carData}
                      handleChange={handleChange}
                    /> */}
                    {/* <RenderTextField
                      type="number"
                      name="PriceKacko"
                      label={t("car.KackoPrice") || "Цена КАСКО в день"}
                      defaultValue={carData.PriceKacko || 5}
                      updatedCar={carData}
                      handleChange={handleChange}
                    /> */}
                    {/* <RenderTextField
                      type="number"
                      name="deposit"
                      label={t("car.deposit") || "Залог, €"}
                      defaultValue={carData.deposit || 0}
                      updatedCar={carData}
                      handleChange={handleChange}
                    /> */}
                    <RenderTextField
                      type="number"
                      name="franchise"
                      label={t("car.franchise")}
                      defaultValue={carData.franchise || 0}
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={3}>
                    <RenderTextField
                      name="regNumber"
                      label={t("car.reg-numb")}
                      updatedCar={carData}
                      handleChange={handleChange}
                      required
                    />
                    <RenderTextField
                      type="number"
                      name="engine"
                      label={t("car.engine")}
                      updatedCar={carData}
                      handleChange={handleChange}
                      adornment="c.c."
                      required
                    />
                    <Autocomplete
                      freeSolo
                      options={Object.values(PREDEFINED_COLORS)}
                      value={carData.color || ""}
                      getOptionLabel={(option) =>
                        typeof option === "string" && option.length > 0
                          ? option.charAt(0).toUpperCase() + option.slice(1)
                          : option
                      }
                      onChange={(_, newValue) => {
                        handleChange({
                          target: {
                            name: "color",
                            value: (newValue || "").toLowerCase(),
                          },
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("car.color") || "Цвет"}
                          name="color"
                          required
                          onChange={(e) => {
                            handleChange({
                              target: {
                                name: "color",
                                value: e.target.value.toLowerCase(),
                              },
                            });
                          }}
                        />
                      )}
                    />
                    <RenderTextField
                      type="number"
                      name="deposit"
                      label={t("car.deposit") || "Залог, €"}
                      defaultValue={carData.deposit || 0}
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    {/* <RenderTextField
                      type="number"
                      name="franchise"
                      label={t("car.franchise")}
                      defaultValue={carData.franchise || 0}
                      updatedCar={carData}
                      handleChange={handleChange}
                    /> */}
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={3}>
                    <RenderSelectField
                      name="class"
                      label={t("car.class")}
                      options={Object.values(CAR_CLASSES)}
                      required
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    <RenderTextField
                      type="number"
                      name="enginePower"
                      label={t("car.engine-pow")}
                      updatedCar={carData}
                      handleChange={handleChange}
                      adornment="bhp"
                      required
                    />
                    <RenderTextField
                      type="number"
                      name="PriceChildSeats"
                      label={t("car.childSeatsPrice")}
                      defaultValue={carData.PriceChildSeats || 3}
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    <CarImageUpload
                      photoUrl={carData.photoUrl}
                      handleChange={handleChange}
                      handleImageChange={handleImageChange}
                      imagePreview={imagePreview}
                      required
                    />
                    {/* <FormControlLabel
                      control={
                        <Checkbox
                          checked={carData.airConditioning || false}
                          onChange={handleChange}
                          name="airConditioning"
                        />
                      }
                      label={t("car.air")}
                      sx={{ my: 1 }}
                    /> */}
                  </Stack>
                </Grid>

                {/* Pricing Tiers Table */}
                <Grid item xs={12}>
                  <PricingTiers
                    handleChange={handleChange}
                    setUpdatedCar={resubmitCars}
                    isAddcar={true}
                    defaultPrices={defaultPrices}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <Grid item xs={12}>
              <DialogActions
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  onClick={onClose}
                  disabled={loading}
                  sx={{ py: 1.5, px: 4, minWidth: "140px" }}
                >
                  {t("basic.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  color="primary"
                  sx={{ py: 1.5, px: 4, minWidth: "140px" }}
                >
                  {t("carPark.addCar")}
                </Button>
              </DialogActions>
            </Grid>
          </form>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddCarModal;

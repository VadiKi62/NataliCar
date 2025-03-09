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
      formData.append("airConditioning", Boolean(carData.airConditioning));
      formData.append("enginePower", String(carData.enginePower));
      formData.append("engine", String(carData.engine));
      formData.append("color", String(carData.color));
      formData.append("registration", String(carData.registration));
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

      const result = await response.json();
      setUpdateStatus({ message: result.message, type: result.status });

      if (result.status === 200) {
        await resubmitCars(); // Refresh car data
        onClose(); // Close the modal
        setCarData({});
        setSelectedImage(null); // Clear image
      }
    } catch (error) {
      setUpdateStatus({ message: error.message, type: 400 });
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
          <DialogTitle>Add New Car</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Stack spacing={3}>
                    <RenderTextField
                      name="model"
                      label="Model"
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    <RenderSelectField
                      name="transmission"
                      label="Transmission"
                      options={Object.values(TRANSMISSION_TYPES)}
                      required
                      updatedCar={carData}
                      handleChange={handleChange}
                    />

                    {/* <FormControl fullWidth required>
                      <InputLabel>Class</InputLabel>
                      <Select
                        name="class"
                        value={carData.class}
                        onChange={handleChange}
                        label="Class"
                      >
                        {Object.values(CAR_CLASSES).map((carClass) => (
                          <MenuItem key={carClass} value={carClass}>
                            {carClass.charAt(0).toUpperCase() +
                              carClass.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl> */}
                    <RenderTextField
                      type="number"
                      name="seats"
                      label="Seats"
                      defaultValue="5"
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    {/* <FormControl fullWidth required>
                      <InputLabel>Transmission</InputLabel>
                      <Select
                        name="transmission"
                        value={carData.transmission}
                        onChange={handleChange}
                        label="Transmission"
                      >
                        {Object.values(TRANSMISSION_TYPES).map(
                          (transmission) => (
                            <MenuItem key={transmission} value={transmission}>
                              {transmission.charAt(0).toUpperCase() +
                                transmission.slice(1)}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl> */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={carData.airConditioning || false}
                          onChange={handleChange}
                          name="airConditioning"
                        />
                      }
                      label="Air Conditioning"
                      sx={{ my: 2 }}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={3}>
                    <RenderTextField
                      name="registration"
                      label="Registration Year"
                      defaultValue="2017"
                      type="number"
                      updatedCar={carData}
                      handleChange={handleChange}
                      required
                    />
                    <RenderSelectField
                      name="fueltype"
                      label="Fuel Type"
                      options={Object.values(FUEL_TYPES)}
                      updatedCar={carData}
                      handleChange={handleChange}
                      required
                    />
                    <RenderTextField
                      required
                      type="number"
                      name="numberOfDoors"
                      label="Number of Doors"
                      defaultValue={carData.numberOfDoors}
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={3}>
                    <RenderTextField
                      name="regNumber"
                      label="Registration Number"
                      updatedCar={carData}
                      handleChange={handleChange}
                      required
                    />
                    <RenderTextField
                      type="number"
                      name="engine"
                      label="Engine"
                      updatedCar={carData}
                      handleChange={handleChange}
                      adornment="c.c."
                      required
                    />
                    <ColorPicker
                      value={carData.color || ""}
                      onChange={handleChange}
                      required
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Stack spacing={3}>
                    <RenderSelectField
                      name="class"
                      label="Class"
                      options={Object.values(CAR_CLASSES)}
                      required
                      updatedCar={carData}
                      handleChange={handleChange}
                    />
                    <RenderTextField
                      type="number"
                      name="enginePower"
                      label="Engine Power"
                      updatedCar={carData}
                      handleChange={handleChange}
                      adornment="bhp"
                      required
                    />
                    <CarImageUpload
                      photoUrl={carData.photoUrl}
                      handleChange={handleChange}
                      handleImageChange={handleImageChange}
                      imagePreview={imagePreview}
                      required
                    />
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  color="primary"
                  sx={{ py: 1.5, px: 4, minWidth: "140px" }}
                >
                  Add Car
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

const ColorPicker = ({ value, onChange, disabled = false }) => {
  const [colorMode, setColorMode] = useState(
    Object.values(PREDEFINED_COLORS).includes(value?.toLowerCase())
      ? "predefined"
      : "custom"
  );

  const handleColorModeChange = (event) => {
    setColorMode(event.target.value);
    // Reset to first predefined color if switching to predefined mode
    if (event.target.value === "predefined") {
      onChange({ target: { name: "color", value: PREDEFINED_COLORS.BLACK } });
    }
  };

  const handleColorChange = (event) => {
    onChange({
      target: { name: "color", value: event.target.value.toLowerCase() },
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      {colorMode === "predefined" ? (
        <FormControl fullWidth disabled={disabled}>
          <Select
            value={value || ""}
            onChange={handleColorChange}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "4px",
                    backgroundColor: selected,
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                />
                {selected.charAt(0).toUpperCase() + selected.slice(1)}
              </Box>
            )}
          >
            {Object.entries(PREDEFINED_COLORS).map(([key, color]) => (
              <MenuItem key={key} value={color}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "4px",
                      backgroundColor: color,
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  />
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          fullWidth
          name="color"
          placeholder="Введите свой цвет"
          value={value || ""}
          onChange={handleColorChange}
          disabled={disabled}
        />
      )}
      <RadioGroup
        row
        value={colorMode}
        onChange={handleColorModeChange}
        sx={{ mb: 0.5 }}
      >
        <FormControlLabel
          value="predefined"
          control={<Radio size="small" />}
          label="Выбрать из списка"
          disabled={disabled}
          sx={{ my: -1 }}
        />
        <FormControlLabel
          value="custom"
          control={<Radio size="small" />}
          label="Свой цвет"
          disabled={disabled}
          sx={{ my: -1 }}
        />
      </RadioGroup>
    </Box>
  );
};

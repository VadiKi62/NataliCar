import React from "react";
import { TextField, InputAdornment, Box } from "@mui/material";

const CarImageUpload = ({
  photoUrl,
  handleChange,
  handleImageChange,
  imagePreview,
}) => (
  <Box display="flex" flexDirection="column" gap={2}>
    <TextField
      fullWidth
      label="Добавить фото"
      name="photoUrl"
      value={photoUrl}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Box
              component="img"
              src={imagePreview || "/images/NO_PHOTO_h2klff.jpg"}
              alt="Uploaded Preview"
              sx={{
                width: 34,
                height: 34,
                objectFit: "cover",
              }}
            />
          </InputAdornment>
        ),
      }}
    />

    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      style={{ marginTop: -11, marginBottom: -1 }}
    />
  </Box>
);

export default CarImageUpload;

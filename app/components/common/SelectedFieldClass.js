import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const SelectedFieldClass = ({
  name,
  label,
  options,
  value,
  handleChange,
  required = false,
  isLoading = false,
}) => (
  <FormControl
    fullWidth
    required={required}
    sx={{
      mb: 2,
      "& .MuiInputBase-root": {
        color: "white", // Text color inside the input field
        width: 300,
      },
      "& .MuiInputLabel-root": {
        color: "white", // Label color
      },
      "& .MuiSelect-icon": {
        color: "white", // Arrow icon color
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "white", // Border color on focus
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "white", // Border color when focused
      },
    }}
    disabled={isLoading}
  >
    <InputLabel id={`${name}-label`}>{label}</InputLabel>
    <Select
      labelId={`${name}-label`}
      name={name}
      value={value || "All"}
      onChange={handleChange}
      label={label}
    >
      <MenuItem value="All">All</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default SelectedFieldClass;

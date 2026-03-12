import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiInputBase-root": {
    height: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      "@media (orientation: portrait)": {
        height: theme.spacing(6.25),
      },
    },
  },
}));

const BookingLocationAutocomplete = ({
  label,
  value,
  options,
  onChange,
  onInputChange,
  dividerBeforeOption,
  sx,
  ...props
}) => {
  const renderOption = (listItemProps, option) => {
    const labelText = typeof option === "string" ? option : option?.label || "";
    const needsDivider = dividerBeforeOption && labelText === dividerBeforeOption;

    return (
      <li
        {...listItemProps}
        style={{
          ...listItemProps.style,
          ...(needsDivider
            ? {
                borderTop: "2px solid #000",
                marginTop: 4,
                paddingTop: 10,
              }
            : {}),
        }}
      >
        {labelText}
      </li>
    );
  };

  return (
    <StyledAutocomplete
      freeSolo
      options={options}
      value={value}
      onChange={onChange}
      onInputChange={onInputChange}
      renderOption={renderOption}
      sx={sx}
      PaperProps={{
        sx: (theme) => ({
          border: `2px solid ${theme.palette.common.black} !important`,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[6],
          backgroundColor: theme.palette.background.paper,
        }),
      }}
      slotProps={{
        popper: {
          style: { zIndex: 1400 },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          size="small"
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      )}
      {...props}
    />
  );
};

export default BookingLocationAutocomplete;

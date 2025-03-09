import React, { useState } from "react";
import { Box, Typography, Switch, FormControlLabel } from "@mui/material";

const ConfirmationSection = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSwitchChange = (event) => {
    setIsConfirmed(event.target.checked);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          lineHeight: "1.4rem",
          fontSize: "1.2rem",
          backgroundColor: "secondary.light",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        Подтверждение заказа
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={isConfirmed}
            onChange={handleSwitchChange}
            name="orderConfirmation"
            color="primary"
          />
        }
        label={isConfirmed ? "Подтвержден" : "Не подтвержден"}
      />
    </Box>
  );
};

export default ConfirmationSection;

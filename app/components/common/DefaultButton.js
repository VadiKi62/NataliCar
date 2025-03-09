import React from "react";
import MuiButton from "@mui/material/Button";

export default function DefaultButton({
  visibility = true,
  disabled = false,
  relative = false,
  minWidth,
  onClick,
  label,
  children,
  blinking = false,
  props,
}) {
  return (
    visibility && (
      <MuiButton
        variant="contained"
        aria-label={label}
        size="large"
        sx={{
          p: 3,
          m: 1,
          fontSize: "1.3rem",
          fontWeight: 500,
          position: relative ? "relative" : "absolute",
          lineHeight: "1.5rem",
          top: relative ? 0 : 5,
          left: relative ? 0 : 5,
          borderRadius: "15px",
          border: "0px solid white",
          marginBottom: 1,
          minWidth: minWidth,
          zIndex: 4,
          color: "black",
          bgcolor: disabled ? "primary.fiolet" : "primary.green",
          opacity: disabled ? 0.7 : 1,
          "&:hover": {
            color: "white",
            blinking: " false",
          },
          ...(blinking && {
            animation: "blink 1s linear infinite",
          }),
          "@keyframes blink": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.5 },
            "100%": { opacity: 1 },
          },
        }}
        onClick={onClick}
        {...props}
      >
        {label && !children && !props && label}
        {children}
      </MuiButton>
    )
  );
}

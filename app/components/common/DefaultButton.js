import React from "react";
import MuiButton from "@mui/material/Button";
import { useTheme, useMediaQuery } from "@mui/material";

export default function DefaultButton({
  visibility = true,
  disabled = false,
  relative = false,
  minWidth,
  onClick,
  label,
  children,
  blinking = false,
  sx: sxProp,
  props,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
            color: "black",
            blinking: " false",
            ...(blinking && { backgroundColor: "#00ff00" }),
          },
          ...(blinking && {
            bgcolor: "#00ff00",
            color: "black",
            // allow parent sx to override text color
            animation: isMobile
              ? "blinkMobile 1.5s ease-in-out infinite" // 1.5 секунды мигания на мобильных
              : "blinkDesktop 1s linear infinite", // Обычное мигание на десктопе
          }),
          "@keyframes blinkMobile": {
            "0%": { transform: "scale(1)", backgroundColor: "#00ff00" }, // Ярко-зеленый фон, убрали opacity
            "50%": { transform: "scale(1.02)", backgroundColor: "#32ff32" }, // Еще более яркий зеленый, убрали opacity
            "100%": { transform: "scale(1)", backgroundColor: "#00ff00" }, // Ярко-зеленый фон, убрали opacity
          },
          "@keyframes blinkDesktop": {
            "0%": { backgroundColor: "#00ff00", transform: "scale(1)" },
            "50%": { backgroundColor: "#4cff4c", transform: "scale(1.03)" },
            "100%": { backgroundColor: "#00ff00", transform: "scale(1)" },
          },
          // parent-provided sx overrides defaults
          ...sxProp,
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

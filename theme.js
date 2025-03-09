"use client";
import { createTheme } from "@mui/material/styles";

export default createTheme({
  palette: {
    primary: {
      main: "#990606",
      // green: "#e7cb75",
      green: "#c2d1e0",
      fiolet: "#bfa70d",
      red: "#8A0707",
      main1: "#346698",
    },
    secondary: {
      main: "#151515",
      // light: "rgba(231,203,117, 0.70)",
      light: "#c2d1e0",
      beige: "#fceee9",
      background: "rgba(191,167,93,1)",
      complement: "#8A0707",
    },
    text: {
      light: "white",
      dark: "#151515",
      main: "rgba(255, 102, 51)",
      red: "rgba(255, 102, 51)",
      green: "#a3c1ad",
      yellow: "#e7c475",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        heroButton: {
          fontSize: 45,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          display: "inline-block",
          padding: "10px 28px",
          margin: "0px 2px 0px 0px",
          borderRadius: "50px",
          transition: "0.3s",
          lineHeight: 1,
          color: "white",
          border: "2px solid #cda45e",
          "&:hover": {
            backgroundColor: "#cda45e",
            color: "#fff",
          },
        },
      },
    },
  },

  typography: {
    fontFamily: ["Roboto Slab", "serif"].join(","),
    h1: {
      fontSize: "45px",
      fontFamily: ["B612 Mono", "monospace"].join(","),
    },
    allVariants: {
      fontFamily: ["B612 Mono", "monospace"].join(","),
    },
  },
});

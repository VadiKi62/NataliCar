"use client";

import React, { forwardRef } from "react";
import { Button, useTheme } from "@mui/material";
import { keyframes } from "@mui/system";

// Анимация пульсации с градиентом
const bookPulse = keyframes`
  0% {
    background: linear-gradient(135deg, #008989 0%, #008900 100%);
    box-shadow: 0 0 20px rgba(0, 137, 137, 0.5), 0 0 40px rgba(0, 137, 0, 0.3);
    transform: scale(1);
  }
  50% {
    background: linear-gradient(135deg, #4dd4d4 0%, #5cd85c 100%);
    box-shadow: 0 0 30px rgba(77, 212, 212, 0.7), 0 0 60px rgba(92, 216, 92, 0.5);
    transform: scale(1.05);
  }
  100% {
    background: linear-gradient(135deg, #008989 0%, #008900 100%);
    box-shadow: 0 0 20px rgba(0, 137, 137, 0.5), 0 0 40px rgba(0, 137, 0, 0.3);
    transform: scale(1);
  }
`;

/**
 * Градиентная пульсирующая кнопка "Забронировать"
 * Бирюзово-зелёный градиент с эффектом свечения
 */
const GradientBookButton = forwardRef(
  ({ children, label, onClick, disabled, sx, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Button
        ref={ref}
        variant="contained"
        onClick={onClick}
        disabled={disabled}
        sx={{
          // Базовый градиент
          background: "linear-gradient(135deg, #008989 0%, #008900 100%)",
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "1.1rem",
          padding: "12px 28px",
          minWidth: "200px",
          border: "none",
          borderRadius: "12px",
          textTransform: "none",
          whiteSpace: "pre-line",
          textAlign: "center",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
          boxShadow:
            "0 0 20px rgba(0, 137, 137, 0.5), 0 0 40px rgba(0, 137, 0, 0.3)",
          // Анимация пульсации
          animation: disabled ? "none" : `${bookPulse} 1.8s ease-in-out infinite`,
          transition: "all 0.3s ease",
          // Hover состояние
          "&:hover": {
            background: "linear-gradient(135deg, #006b6b 0%, #006b00 100%)",
            animation: "none",
            boxShadow:
              "0 6px 20px rgba(0, 107, 107, 0.5), 0 0 30px rgba(0, 107, 0, 0.4)",
            transform: "translateY(-2px)",
          },
          // Disabled состояние
          "&:disabled": {
            background: theme.palette.neutral?.gray400 || "#bdbdbd",
            color: theme.palette.neutral?.gray600 || "#757575",
            boxShadow: "none",
            animation: "none",
          },
          // Кастомные стили
          ...sx,
        }}
        {...props}
      >
        {label || children}
      </Button>
    );
  }
);

GradientBookButton.displayName = "GradientBookButton";

export default GradientBookButton;


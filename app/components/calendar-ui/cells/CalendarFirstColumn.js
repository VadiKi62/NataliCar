"use client";
import React from "react";
import { TableCell } from "@mui/material";
import { calendarStyles } from "@/theme";

/**
 * Первый столбец календаря (название машины)
 * @param {function} onClick - обработчик клика
 * @param {string} title - tooltip
 * @param {React.ReactNode} children - содержимое ячейки
 */
export default function CalendarFirstColumn({ onClick, title, children, sx = {} }) {
  return (
    <TableCell
      className="bigcalendar-first-column" // Для globals.css (белый текст)
      onClick={onClick}
      title={title}
      sx={{ ...calendarStyles.firstColumn, ...sx }}
    >
      {children}
    </TableCell>
  );
}


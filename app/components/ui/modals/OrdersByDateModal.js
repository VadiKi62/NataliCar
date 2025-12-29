"use client";

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
} from "@mui/material";
import dayjs from "dayjs";
import ModalLayout from "./ModalLayout";
import { ActionButton } from "../index";

/**
 * Модальное окно заказов по дате
 * Показывает заказы, начинающиеся и заканчивающиеся в указанную дату
 * 
 * @param {boolean} open - открыто ли окно
 * @param {function} onClose - обработчик закрытия
 * @param {dayjs} date - дата для отображения
 * @param {Array} startedOrders - заказы, начинающиеся в эту дату
 * @param {Array} endedOrders - заказы, заканчивающиеся в эту дату
 * @param {function} getRegNumberByCarNumber - функция для получения госномера
 */
const OrdersByDateModal = ({
  open,
  onClose,
  date,
  startedOrders = [],
  endedOrders = [],
  getRegNumberByCarNumber,
}) => {
  const cellSx = {
    whiteSpace: "nowrap",
  };

  const renderOrdersTable = (orders, emptyMessage) => {
    if (orders.length === 0) {
      return (
        <Typography align="center" sx={{ color: "text.secondary", py: 2 }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>Машина</TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>Госномер</TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>Срок</TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>Клиент</TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>Телефон</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order, idx) => (
            <TableRow key={order._id || idx}>
              <TableCell sx={cellSx}>{order.carModel}</TableCell>
              <TableCell sx={cellSx}>
                {getRegNumberByCarNumber
                  ? getRegNumberByCarNumber(order.carNumber)
                  : order.carNumber}
              </TableCell>
              <TableCell sx={cellSx}>
                {order.rentalStartDate
                  ? `${dayjs(order.rentalStartDate).format("DD.MM.YY")}-${dayjs(
                      order.rentalEndDate
                    ).format("DD.MM.YY")}`
                  : ""}
              </TableCell>
              <TableCell sx={cellSx}>{order.customerName}</TableCell>
              <TableCell sx={cellSx}>{order.phone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <ModalLayout
      open={open}
      onClose={onClose}
      size="fullWidth"
      showCloseButton={true}
    >
      <Box id="print-orders-modal">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {/* Заказы, начинающиеся */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                align="center"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Заказы, начинающиеся {date && date.format("DD.MM.YY")}
              </Typography>
              {renderOrdersTable(
                startedOrders,
                "Нет заказов, начинающихся в эту дату"
              )}
            </Box>

            {/* Заказы, заканчивающиеся */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                align="center"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Заказы, заканчивающиеся {date && date.format("DD.MM.YY")}
              </Typography>
              {renderOrdersTable(
                endedOrders,
                "Нет заказов, заканчивающихся в эту дату"
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Кнопки */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }} className="no-print">
          <ActionButton
            onClick={() => window.print()}
            variant="outlined"
            color="secondary"
            size="small"
            label="ПЕЧАТЬ"
          />
          <ActionButton
            onClick={onClose}
            color="secondary"
            size="small"
            label="ЗАКРЫТЬ"
          />
        </Box>
      </Box>
    </ModalLayout>
  );
};

export default OrdersByDateModal;


import { Order } from "@models/order";
import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// ИСПРАВЛЕННАЯ функция проверки конфликтов
function checkConflictsFixed(allOrders, newStart, newEnd) {
  const conflictingOrders = [];
  const conflictDates = { start: null, end: null };

  for (const existingOrder of allOrders) {
    const existingStart = dayjs(existingOrder.timeIn);
    const existingEnd = dayjs(existingOrder.timeOut);

    // КЛЮЧЕВАЯ ЛОГИКА: заказы НЕ конфликтуют если "касаются" по времени
    const newEndsWhenExistingStarts = newEnd.isSame(existingStart);
    const newStartsWhenExistingEnds = newStart.isSame(existingEnd);

    // Если заказы касаются - это НЕ конфликт
    if (newEndsWhenExistingStarts || newStartsWhenExistingEnds) {
      continue;
    }

    // Проверяем реальное пересечение периодов
    const hasOverlap =
      newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);

    if (hasOverlap) {
      conflictingOrders.push(existingOrder);

      // Определяем конкретные конфликтные времена
      if (newStart.isBefore(existingEnd) && newStart.isAfter(existingStart)) {
        conflictDates.start = existingStart.toISOString();
      }
      if (newEnd.isAfter(existingStart) && newEnd.isBefore(existingEnd)) {
        conflictDates.end = existingEnd.toISOString();
      }
    }
  }

  if (conflictingOrders.length === 0) {
    return { status: null, data: null }; // Нет конфликтов
  }

  // Проверяем подтвержденность конфликтующих заказов
  const confirmedConflicts = conflictingOrders.filter(
    (order) => order.confirmed
  );

  if (confirmedConflicts.length > 0) {
    // Конфликт с подтвержденными заказами - блокируем
    return {
      status: 409,
      data: {
        conflictMessage: `Time has conflict with confirmed bookings`,
        conflictDates,
        conflictingOrders: confirmedConflicts,
      },
    };
  } else {
    // Конфликт только с неподтвержденными заказами
    return {
      status: 202,
      data: {
        conflictMessage: `Time has conflict with unconfirmed bookings`,
        conflictDates,
        conflictOrdersIds: conflictingOrders.map((order) =>
          order._id.toString()
        ),
        conflictingOrders,
      },
    };
  }
}

export const PUT = async (req) => {
  try {
    await connectToDB();

    const {
      _id,
      rentalStartDate,
      rentalEndDate,
      timeIn,
      timeOut,
      placeIn,
      placeOut,
      car, // id нового автомобиля
      ChildSeats,
      insurance,
      franchiseOrder,
      totalPrice: totalPriceFromClient,
    } = await req.json();

    console.log("PAYLOAD FROM FRONTEND:", { ChildSeats, insurance });

    // Найти заказ
    const order = await Order.findById(_id).populate("car");

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Если выбран новый автомобиль, обновляем его в заказе
    if (car && (!order.car || String(order.car._id) !== car)) {
      const newCar = await Car.findById(car);
      if (!newCar) {
        return new Response(JSON.stringify({ message: "Car not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      order.car = newCar._id;
    }

    // Получаем объект автомобиля для расчётов
    let carDoc;
    if (order.car && typeof order.car === "object" && order.car._id) {
      carDoc = order.car;
    } else {
      carDoc = await Car.findById(order.car);
    }

    // Конвертация дат и времени
    const newStartDate = rentalStartDate
      ? dayjs(rentalStartDate)
      : dayjs(order.rentalStartDate);

    const newEndDate = rentalEndDate
      ? dayjs(rentalEndDate)
      : dayjs(order.rentalEndDate);
    const newTimeIn = timeIn ? dayjs(timeIn) : dayjs(order.timeIn);
    const newTimeOut = timeOut ? dayjs(timeOut) : dayjs(order.timeOut);

    const { start, end } = await timeAndDate(
      newStartDate,
      newEndDate,
      newTimeIn,
      newTimeOut
    );

    // ДОБАВЛЯЕМ ОТЛАДОЧНУЮ ИНФОРМАЦИЮ
    console.log("=== DEBUGGING ORDER UPDATE ===");
    console.log("Order ID:", _id);
    console.log("New time period:", {
      start: start.toISOString(),
      end: end.toISOString(),
    });

    // Ensure start and end dates are not the same
    if (start.isSame(end, "day")) {
      return new Response(
        JSON.stringify({
          message: "Start and end dates cannot be the same.",
        }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if current order already has conflicting dates
    const { resolvedConflicts, stillConflictingOrders } =
      await checkForResolvedConflicts(order, start, end);

    // Remove resolved conflicts from order
    if (resolvedConflicts.length > 0) {
      order.hasConflictDates = order.hasConflictDates.filter(
        (id) => !resolvedConflicts.includes(id.toString())
      );
    }

    // Fetch all orders for the car, excluding the current order
    const allOrders = await Order.find({
      car: order.car,
      _id: { $ne: _id },
    });

    console.log(
      "Existing orders for car:",
      allOrders.map((o) => ({
        id: o._id.toString(),
        timeIn: dayjs(o.timeIn).toISOString(),
        timeOut: dayjs(o.timeOut).toISOString(),
        confirmed: o.confirmed,
      }))
    );

    // ИСПОЛЬЗУЕМ ИСПРАВЛЕННУЮ функцию проверки конфликтов
    const { status, data } = checkConflictsFixed(allOrders, start, end);

    console.log("Conflict check result:", { status, data });

    if (status) {
      switch (status) {
        case 409:
          return new Response(
            JSON.stringify({
              message: data?.conflictMessage,
              conflictDates: data?.conflictDates,
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            }
          );
        case 408:
          return new Response(
            JSON.stringify({
              message: data.conflictMessage,
              conflictDates: data.conflictDates,
            }),
            {
              status: 408,
              headers: { "Content-Type": "application/json" },
            }
          );
        case 202:
          // Update the order and add new pending orderConflicts
          const rentalDays202 = Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
          );
          let totalPrice202 = 0;
          let days202 = rentalDays202;
          if (carDoc && carDoc.calculateTotalRentalPricePerDay) {
            const result = await carDoc.calculateTotalRentalPricePerDay(
              start,
              end,
              insurance,
              ChildSeats
            );
            totalPrice202 = result.total;
            days202 = result.days;
          }

          order.rentalStartDate = start.toDate();
          order.rentalEndDate = end.toDate();
          order.numberOfDays = days202;
          order.totalPrice = totalPrice202;
          order.timeIn = toParseTime(order.rentalStartDate, start);
          order.timeOut = toParseTime(order.rentalEndDate, end);
          order.placeIn = placeIn || order.placeIn;
          order.placeOut = placeOut || order.placeOut;
          order.hasConflictDates = [
            ...new Set([
              ...order.hasConflictDates,
              ...data.conflictOrdersIds,
              ...stillConflictingOrders,
            ]),
          ];

          order.ChildSeats =
            typeof ChildSeats !== "undefined" ? ChildSeats : order.ChildSeats;
          order.insurance =
            typeof insurance !== "undefined" ? insurance : order.insurance;

          const updatedOrder = await order.save();

          return new Response(
            JSON.stringify({
              message: data.conflictMessage,
              conflicts: data.conflictDates,
              updatedOrder: updatedOrder,
            }),
            {
              status: 202,
              headers: { "Content-Type": "application/json" },
            }
          );
      }
    }

    // Recalculate the rental details
    const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let totalPrice = 0;
    let days = rentalDays;
    if (
      typeof totalPriceFromClient === "number" &&
      !isNaN(totalPriceFromClient)
    ) {
      totalPrice = totalPriceFromClient;
    } else if (carDoc && carDoc.calculateTotalRentalPricePerDay) {
      const result = await carDoc.calculateTotalRentalPricePerDay(
        start,
        end,
        insurance,
        ChildSeats
      );
      totalPrice = result.total;
      days = result.days;
    }

    // Update the order
    order.rentalStartDate = start.toDate();
    order.rentalEndDate = end.toDate();
    order.numberOfDays = days;
    order.totalPrice = totalPrice;
    order.timeIn = toParseTime(order.rentalStartDate, start);
    order.timeOut = toParseTime(order.rentalEndDate, end);
    order.placeIn = placeIn || order.placeIn;
    order.placeOut = placeOut || order.placeOut;

    order.ChildSeats =
      typeof ChildSeats !== "undefined" ? ChildSeats : order.ChildSeats;
    order.insurance =
      typeof insurance !== "undefined" ? insurance : order.insurance;
    order.franchiseOrder =
      typeof franchiseOrder !== "undefined"
        ? franchiseOrder
        : order.franchiseOrder;

    console.log("SERVER: заказ перед сохранением:", {
      rentalStartDate: order.rentalStartDate,
      rentalEndDate: order.rentalEndDate,
      timeIn: order.timeIn,
      timeOut: order.timeOut,
      placeIn: order.placeIn,
      placeOut: order.placeOut,
      ChildSeats: order.ChildSeats,
      insurance: order.insurance,
      franchiseOrder: order.franchiseOrder,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email,
      car: order.car,
      carModel: order.carModel,
      carNumber: order.carNumber,
      confirmed: order.confirmed,
      hasConflictDates: order.hasConflictDates,
      numberOfDays: order.numberOfDays,
      totalPrice: order.totalPrice,
      my_order: order.my_order,
    });

    await order.save();

    console.log("Order updated successfully");

    return new Response(
      JSON.stringify({
        message: `ВСЕ ОТЛИЧНО! Даты изменены.`,
        data: order,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(
      JSON.stringify({ message: `Failed to update order: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Function to check if existing conflicts are resolved after changing dates
async function checkForResolvedConflicts(order, newStartDate, newEndDate) {
  const existingConflicts = order.hasConflictDates || [];

  const resolvedConflicts = [];
  const stillConflictingOrders = [];

  // Check each existing conflict
  for (const conflictId of existingConflicts) {
    const conflictingOrder = await Order.findById(conflictId);

    if (conflictingOrder) {
      // Compare conflicting order dates with new start/end dates
      const conflictStartDate = dayjs(conflictingOrder.rentalStartDate);
      const conflictEndDate = dayjs(conflictingOrder.rentalEndDate);

      // ИСПРАВЛЕНО: используем правильную логику сравнения
      // Конфликт разрешен если заказы НЕ пересекаются (могут касаться)
      const ordersTouch =
        newEndDate.isSame(conflictStartDate) ||
        newStartDate.isSame(conflictEndDate);
      const ordersDoNotOverlap =
        newEndDate.isBefore(conflictStartDate) ||
        newStartDate.isAfter(conflictEndDate);

      if (ordersDoNotOverlap || ordersTouch) {
        resolvedConflicts.push(conflictingOrder._id); // This conflict is resolved
      } else {
        stillConflictingOrders.push(conflictingOrder._id); // Still conflicting
      }
    }
  }

  return { resolvedConflicts, stillConflictingOrders };
}

async function timeAndDate(startDate, endDate, startTime, endTime) {
  // Важно: используем точные моменты startTime/endTime (из клиента/базы),
  // чтобы избежать ошибок из-за локали сервера и DST при пересборке часов.
  return {
    start: dayjs(startTime),
    end: dayjs(endTime),
  };
}

function toParseTime(rentalDate, day) {
  const hour = day.hour();
  const minute = day.minute();

  const toReturn = dayjs(rentalDate).hour(hour).minute(minute);
  return toReturn;
}

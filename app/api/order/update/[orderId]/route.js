import { Order } from "@models/order";
import { Car } from "@models/car";
import Company from "@models/company";
import { connectToDB } from "@utils/database";
import { requireAdmin } from "@/lib/adminAuth";
import {
  canEditOrder,
  canEditPricing,
  canConfirmOrder,
  canEditOrderField,
} from "@/domain/orders/orderPermissions";
import { analyzeConfirmationConflicts } from "@/domain/booking/analyzeConfirmationConflicts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Restored from pre-refactor conflict logic: ИСПРАВЛЕННАЯ функция проверки конфликтов
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

// Restored from pre-refactor conflict logic: Function to check if existing conflicts are resolved after changing dates
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

// Restored from pre-refactor conflict logic: timeAndDate function
// Важно: используем точные моменты startTime/endTime (из клиента/базы),
// чтобы избежать ошибок из-за локали сервера и DST при пересборке часов.
async function timeAndDate(startDate, endDate, startTime, endTime) {
  return {
    start: dayjs(startTime),
    end: dayjs(endTime),
  };
}

function toParseTime(rentalDate, day) {
  const hour = day.hour();
  const minute = day.minute();
  return dayjs(rentalDate).hour(hour).minute(minute);
}

export const PATCH = async (request, { params }) => {
  try {
    await connectToDB();

      console.log("HEADERS", Object.fromEntries(request.headers.entries()));

  console.log("COOKIES", request.headers.get("cookie"));

    // Check admin authentication
    const { session, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    

    const { orderId } = params;
    const payload = await request.json();

    // Find the order
    const order = await Order.findById(orderId).populate("car");

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine which fields are being updated
    const hasDateTimeChanges =
      payload.rentalStartDate !== undefined ||
      payload.rentalEndDate !== undefined ||
      payload.timeIn !== undefined ||
      payload.timeOut !== undefined ||
      payload.car !== undefined ||
      payload.placeIn !== undefined ||
      payload.placeOut !== undefined ||
      payload.insurance !== undefined ||
      payload.ChildSeats !== undefined ||
      payload.franchiseOrder !== undefined ||
      payload.totalPrice !== undefined ||
      payload.numberOfDays !== undefined;

    const hasCustomerChanges =
      payload.customerName !== undefined ||
      payload.phone !== undefined ||
      payload.email !== undefined ||
      payload.flightNumber !== undefined;

    const hasConfirmationChange = payload.confirmed !== undefined;

    // Check permissions for each category of changes
    if (hasDateTimeChanges) {
      const permission = canEditPricing(order, session.user);
      if (!permission.allowed) {
        return new Response(
          JSON.stringify({
            success: false,
            message: permission.reason,
            code: "PERMISSION_DENIED",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (hasCustomerChanges) {
      const permission = canEditOrder(order, session.user);
      if (!permission.allowed) {
        return new Response(
          JSON.stringify({
            success: false,
            message: permission.reason,
            code: "PERMISSION_DENIED",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (hasConfirmationChange) {
      const permission = canConfirmOrder(order, session.user);
      if (!permission.allowed) {
        // Get company for bufferHours normalization
        const companyId = "679903bd10e6c8a8c0f027bc"; // TODO: make dynamic
        const company = await Company.findById(companyId);
        const bufferHours = Number(company?.bufferTime ?? 2);

        return new Response(
          JSON.stringify({
            success: false,
            data: null,
            message: permission.reason,
            level: "block",
            conflicts: [],
            affectedOrders: [],
            bufferHours: bufferHours,
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Handle confirmation toggle
    if (hasConfirmationChange) {
      const isConfirming = payload.confirmed === true && !order.confirmed;

      if (isConfirming) {
        // Get all orders for this car
        const allOrdersForCar = await Order.find({
          car: order.car,
        });

        // Get company for bufferTime
        const companyId = "679903bd10e6c8a8c0f027bc"; // TODO: make dynamic
        const company = await Company.findById(companyId);
        const bufferHours = Number(company?.bufferTime ?? 2);

        // Analyze conflicts
        const conflictAnalysis = analyzeConfirmationConflicts({
          orderToConfirm: order,
          allOrders: allOrdersForCar,
          bufferHours: bufferHours,
        });

        if (!conflictAnalysis.canConfirm) {
          const normalized = {
            success: false,
            data: null,
            message: conflictAnalysis.message,
            level: "block",
            conflicts: conflictAnalysis.blockedByConfirmed ?? [],
            affectedOrders: conflictAnalysis.affectedPendingOrders ?? [],
            bufferHours: conflictAnalysis.bufferHours ?? bufferHours,
          };

          return new Response(JSON.stringify(normalized), {
            status: 409,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Can confirm (possibly with warning)
        order.confirmed = true;
        const updatedOrder = await order.save();

        const responseStatus = conflictAnalysis.level === "warning" ? 202 : 200;
        const responseMessage =
          conflictAnalysis.message || "Заказ успешно подтверждён";

        return new Response(
          JSON.stringify({
            success: true,
            data: updatedOrder,
            message: responseMessage,
            level: conflictAnalysis.level ?? null,
            conflicts: [],
            affectedOrders: conflictAnalysis.affectedPendingOrders ?? [],
            bufferHours: conflictAnalysis.bufferHours ?? bufferHours,
            updatedOrder: updatedOrder,
          }),
          {
            status: responseStatus,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        // Unconfirming (always allowed)
        order.confirmed = false;
        const updatedOrder = await order.save();

        const companyId = "679903bd10e6c8a8c0f027bc"; // TODO: make dynamic
        const company = await Company.findById(companyId);
        const bufferHours = Number(company?.bufferTime ?? 2);

        return new Response(
          JSON.stringify({
            success: true,
            data: updatedOrder,
            message: "Подтверждение заказа снято",
            level: null,
            conflicts: [],
            affectedOrders: [],
            bufferHours: bufferHours,
            updatedOrder: updatedOrder,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Handle date/time/pricing/extras updates
    if (hasDateTimeChanges) {
      // Handle car change
      if (payload.car && (!order.car || String(order.car._id || order.car) !== String(payload.car))) {
        const newCar = await Car.findById(payload.car);
        if (!newCar) {
          return new Response(
            JSON.stringify({ message: "Car not found" }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        order.car = newCar._id;
      }

      // Get car document for calculations
      let carDoc;
      if (order.car && typeof order.car === "object" && order.car._id) {
        carDoc = order.car;
      } else {
        carDoc = await Car.findById(order.car);
      }

      // Convert dates and times
      const newStartDate = payload.rentalStartDate
        ? dayjs(payload.rentalStartDate)
        : dayjs(order.rentalStartDate);
      const newEndDate = payload.rentalEndDate
        ? dayjs(payload.rentalEndDate)
        : dayjs(order.rentalEndDate);
      const newTimeIn = payload.timeIn
        ? dayjs(payload.timeIn)
        : dayjs(order.timeIn);
      const newTimeOut = payload.timeOut
        ? dayjs(payload.timeOut)
        : dayjs(order.timeOut);

      const { start, end } = await timeAndDate(
        newStartDate,
        newEndDate,
        newTimeIn,
        newTimeOut
      );

      // Restored from pre-refactor conflict logic: Debug logging for time period
      if (process.env.NODE_ENV !== "production") {
        console.log("=== DEBUGGING ORDER UPDATE ===");
        console.log("Order ID:", orderId);
        console.log("New time period:", {
          start: start.toISOString(),
          end: end.toISOString(),
        });
      }

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
        _id: { $ne: orderId },
      });

      // Restored from pre-refactor conflict logic: Debug logging for conflict checks
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Existing orders for car:",
          allOrders.map((o) => ({
            id: o._id.toString(),
            timeIn: dayjs(o.timeIn).toISOString(),
            timeOut: dayjs(o.timeOut).toISOString(),
            confirmed: o.confirmed,
          }))
        );
      }

      // Restored from pre-refactor conflict logic: Check for conflicts
      const { status: conflictStatus, data: conflictData } =
        checkConflictsFixed(allOrders, start, end);

      // Restored from pre-refactor conflict logic: Debug logging
      if (process.env.NODE_ENV !== "production") {
        console.log("Conflict check result:", { status: conflictStatus, data: conflictData });
      }

      if (conflictStatus) {
        switch (conflictStatus) {
          case 409:
            // Restored from pre-refactor conflict logic: Confirmed conflicts (blocking)
            return new Response(
              JSON.stringify({
                message: conflictData?.conflictMessage,
                conflictDates: conflictData?.conflictDates,
              }),
              {
                status: 409,
                headers: { "Content-Type": "application/json" },
              }
            );
          case 408:
            // Restored from pre-refactor conflict logic: Blocking time conflicts
            return new Response(
              JSON.stringify({
                message: conflictData.conflictMessage,
                conflictDates: conflictData.conflictDates,
              }),
              {
                status: 408,
                headers: { "Content-Type": "application/json" },
              }
            );
          case 202:
            // Restored from pre-refactor conflict logic: Update with pending conflicts (warning, but proceed)
            const rentalDays202 = Math.ceil(
              (end - start) / (1000 * 60 * 60 * 24)
            );
            let totalPrice202 = 0;
            let days202 = rentalDays202;
            if (carDoc && carDoc.calculateTotalRentalPricePerDay) {
              const result = await carDoc.calculateTotalRentalPricePerDay(
                start,
                end,
                payload.insurance ?? order.insurance,
                payload.ChildSeats ?? order.ChildSeats
              );
              totalPrice202 = result.total;
              days202 = result.days;
            }

            // Restored from pre-refactor conflict logic: Update order fields
            order.rentalStartDate = start.toDate();
            order.rentalEndDate = end.toDate();
            order.numberOfDays = days202;
            order.totalPrice = totalPrice202;
            order.timeIn = toParseTime(order.rentalStartDate, start);
            order.timeOut = toParseTime(order.rentalEndDate, end);
            // Restored from pre-refactor conflict logic: Use || operator for placeIn/placeOut to preserve existing values
            order.placeIn = payload.placeIn !== undefined ? payload.placeIn : order.placeIn;
            order.placeOut = payload.placeOut !== undefined ? payload.placeOut : order.placeOut;
            
            // Restored from pre-refactor conflict logic: Update hasConflictDates with new conflicts and still-conflicting orders
            order.hasConflictDates = [
              ...new Set([
                ...order.hasConflictDates,
                ...conflictData.conflictOrdersIds,
                ...stillConflictingOrders,
              ]),
            ];

            // Restored from pre-refactor conflict logic: Update extras fields
            order.ChildSeats =
              payload.ChildSeats !== undefined ? payload.ChildSeats : order.ChildSeats;
            order.insurance =
              payload.insurance !== undefined ? payload.insurance : order.insurance;

            // 🔧 FIX: Also update customer fields if they are in payload (even in conflict case 202)
            if (hasCustomerChanges) {
              if (payload.customerName !== undefined)
                order.customerName = payload.customerName;
              if (payload.phone !== undefined) order.phone = payload.phone;
              if (payload.email !== undefined) order.email = payload.email;
              if (payload.flightNumber !== undefined)
                order.flightNumber = payload.flightNumber;
            }

            const updatedOrder = await order.save();

            // Restored from pre-refactor conflict logic: Return response with conflict info (exact format match)
            return new Response(
              JSON.stringify({
                message: conflictData.conflictMessage,
                conflicts: conflictData.conflictDates,
                updatedOrder: updatedOrder,
                data: updatedOrder, // Added for unified API compatibility
              }),
              {
                status: 202,
                headers: { "Content-Type": "application/json" },
              }
            );
        }
      }

      // Restored from pre-refactor conflict logic: No conflicts - proceed with update
      const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      let totalPrice = 0;
      let days = rentalDays;

      // Restored from pre-refactor conflict logic: Pricing calculation (manual or automatic)
      if (
        typeof payload.totalPrice === "number" &&
        !isNaN(payload.totalPrice)
      ) {
        totalPrice = payload.totalPrice;
      } else if (carDoc && carDoc.calculateTotalRentalPricePerDay) {
        const result = await carDoc.calculateTotalRentalPricePerDay(
          start,
          end,
          payload.insurance ?? order.insurance,
          payload.ChildSeats ?? order.ChildSeats
        );
        totalPrice = result.total;
        days = result.days;
      }

      // Restored from pre-refactor conflict logic: Update order fields
      order.rentalStartDate = start.toDate();
      order.rentalEndDate = end.toDate();
      order.numberOfDays = days;
      order.totalPrice = totalPrice;
      order.timeIn = toParseTime(order.rentalStartDate, start);
      order.timeOut = toParseTime(order.rentalEndDate, end);
      // Restored from pre-refactor conflict logic: Use || operator to preserve existing values
      order.placeIn = payload.placeIn !== undefined ? payload.placeIn : order.placeIn;
      order.placeOut = payload.placeOut !== undefined ? payload.placeOut : order.placeOut;

      // Restored from pre-refactor conflict logic: Update extras fields
      order.ChildSeats =
        payload.ChildSeats !== undefined ? payload.ChildSeats : order.ChildSeats;
      order.insurance =
        payload.insurance !== undefined ? payload.insurance : order.insurance;
      order.franchiseOrder =
        payload.franchiseOrder !== undefined
          ? payload.franchiseOrder
          : order.franchiseOrder;

      // 🔧 FIX: Also update customer fields if they are in payload (even if hasDateTimeChanges is true)
      if (hasCustomerChanges) {
        if (payload.customerName !== undefined)
          order.customerName = payload.customerName;
        if (payload.phone !== undefined) order.phone = payload.phone;
        if (payload.email !== undefined) order.email = payload.email;
        if (payload.flightNumber !== undefined)
          order.flightNumber = payload.flightNumber;
      }

      // Restored from pre-refactor conflict logic: Debug logging before save
      if (process.env.NODE_ENV !== "production") {
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
      }

      const savedOrder = await order.save();

      // Restored from pre-refactor conflict logic: Success logging
      if (process.env.NODE_ENV !== "production") {
        console.log("Order updated successfully");
      }

      return new Response(
        JSON.stringify({
          message: `ВСЕ ОТЛИЧНО! Даты изменены.`,
          data: savedOrder,
          updatedOrder: savedOrder,
          status: 201,
          success: true,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle customer info updates
    if (hasCustomerChanges) {
      if (payload.customerName !== undefined)
        order.customerName = payload.customerName;
      if (payload.phone !== undefined) order.phone = payload.phone;
      if (payload.email !== undefined) order.email = payload.email;
      if (payload.flightNumber !== undefined)
        order.flightNumber = payload.flightNumber;

      const updatedOrder = await order.save();

      return new Response(
        JSON.stringify({
          updatedOrder: updatedOrder,
          data: updatedOrder,
          message: "Данные клиента обновлены успешно",
          status: 200,
          success: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // No changes detected
    return new Response(
      JSON.stringify({
        message: "No changes detected",
        updatedOrder: order,
        status: 200,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(
      JSON.stringify({
        message: `Failed to update order: ${error.message}`,
        status: 500,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};


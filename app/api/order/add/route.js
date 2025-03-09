import { connectToDB } from "@utils/database";
import mongoose from "mongoose";
import { Car } from "@models/car";
import { Order } from "@models/order";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import {
  analyzeDates,
  isSameDay,
  isSameOrBefore,
  calculateAvailableTimes,
  setTimeToDatejs,
  checkConflicts,
} from "@utils/analyzeDates";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export async function POST(request) {
  try {
    await connectToDB();

    const {
      carNumber,
      customerName,
      phone,
      email,
      rentalStartDate,
      rentalEndDate,
      timeIn,
      timeOut,
      placeIn,
      placeOut,
      confirmed,
    } = await request.json();

    console.log("timeIn IS ", timeIn);
    console.log("timeOut is ", timeOut);

    // status 405 for startdate = enddate - order NOT created
    if (dayjs(rentalStartDate).isSame(dayjs(rentalEndDate), "day")) {
      return new Response(
        JSON.stringify({
          message: "Start and End dates could't be at the same date",
        }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find the car by its car number
    const existingCar = await Car.findOne({ carNumber: carNumber });
    if (!existingCar) {
      return new Response(
        JSON.stringify({
          message: "Car is not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check for existing orders for this car
    const existingOrders = await Order.find({
      car: existingCar._id,
    });

    let nonConfirmedDates = [];
    let conflicOrdersId = [];

    const { status, data } = checkConflicts(
      existingOrders,
      rentalStartDate,
      rentalEndDate,
      timeIn,
      timeOut
    );

    console.log("!! - > result1", status);
    console.log("!! - > result1", data);
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
        //// TODO CREATE ORDERS FOR CASE 200
        case 200:
          console.log(data);
          return new Response(
            JSON.stringify({
              message: data.conflictMessage,
              conflictDates: data.conflictDates,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        case 202:
          conflicOrdersId = data.conflictOrdersIds;
          nonConfirmedDates = data.conflictDates;
      }
    }

    // Calculate the number of rental days using dayjs
    const startDate = dayjs(rentalStartDate);
    const endDate = dayjs(rentalEndDate);
    const rentalDays = endDate.diff(startDate, "day"); // include only start  day
    // Calculate the price per day using the car's pricing tiers
    const pricePerDay = existingCar.calculatePrice(rentalDays);
    const totalPrice = pricePerDay * rentalDays;

    // Create a new order document with calculated values
    const newOrder = new Order({
      carNumber: carNumber,
      customerName,
      phone,
      email,
      rentalStartDate: startDate.toDate(),
      rentalEndDate: endDate.toDate(),
      car: existingCar._id,
      carModel: existingCar.model,
      numberOfDays: rentalDays,
      totalPrice,
      timeIn: timeIn ? timeIn : setTimeToDatejs(startDate, null, true),
      timeOut: timeOut ? timeOut : setTimeToDatejs(endDate, null),
      placeIn,
      placeOut,
      date: dayjs().format("MMM D HH:mm"),
      confirmed: confirmed,
    });

    if (nonConfirmedDates.length > 0) {
      newOrder.hasConflictDates = [
        ...new Set([...newOrder.hasConflictDates, ...conflicOrdersId]),
      ];

      await newOrder.save();

      await updateConflictingOrders(conflicOrdersId, newOrder._id);

      return new Response(
        JSON.stringify({
          message: `Даты ${nonConfirmedDates.join(
            ", "
          )} забронированы но пока не подтверждены другими пользователями. Мы свяжемся с Вами в течении 24 часов и уточним наличие дат.`,
          data: newOrder,
        }),
        {
          status: 202,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Save the new order
    await newOrder.save();
    // Add the new order to the car's orders array
    existingCar.orders.push(newOrder._id);
    // Save the updated car document
    await existingCar.save();

    return new Response(JSON.stringify(newOrder), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error adding new order:", error);
    return new Response(`Failed to add new order: ${error.message}`, {
      status: 500,
    });
  }
}

// function that iterates over all conflicting orders adding to them new conflicts orders
async function updateConflictingOrders(conflicOrdersId, newOrderId) {
  try {
    // Iterate over each conflicting order ID
    for (const conflictOrderId of conflicOrdersId) {
      // Find the order by its ID
      const order = await Order.findById(conflictOrderId);

      if (order) {
        // Add the new order ID to the conflicting order's hasConflictDates array
        if (!order.hasConflictDates.includes(newOrderId)) {
          order.hasConflictDates.push(newOrderId);
          await order.save(); // Save the updated order
        }
      }
    }

    console.log("Conflicting orders updated successfully");
  } catch (error) {
    console.error("Error updating conflicting orders:", error);
  }
}

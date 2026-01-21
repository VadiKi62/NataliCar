import { Order } from "@models/order";
import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import { requireAdmin } from "@/lib/adminAuth";
import { canDeleteOrder } from "@/domain/orders/orderPermissions";
import { sendOrderDeletedTelegramNotification } from "@utils/action";

export const DELETE = async (request, { params }) => {
  try {
    await connectToDB();
    
    // Check admin authentication
    const { session, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;
    
    const { orderId } = params;
    console.log("orderId", orderId);

    // Find the order to be deleted
    const orderToDelete = await Order.findById(orderId);

    if (!orderToDelete) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }
    
    // Check if admin has permission to delete this order
    const permission = canDeleteOrder(orderToDelete, session.user);
    
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
    const carOfTheOrder = await Car.findById(orderToDelete.car);
    if (!carOfTheOrder) {
      return new Response(JSON.stringify({ message: "Car not found" }), {
        status: 404,
      });
    }

    // Remove the order ID from the car's orders array
    const newOrderArray = carOfTheOrder.orders.filter(
      (order) => order._id !== orderId
    );

    // Update the car with the new orders array
    await Car.findByIdAndUpdate(orderToDelete.car, { orders: newOrderArray });

    // Check for conflicts and update conflicting orders
    if (
      orderToDelete.hasConflictDates &&
      Array.isArray(orderToDelete.hasConflictDates)
    ) {
      await Order.updateMany(
        { _id: { $in: orderToDelete.hasConflictDates } },
        { $pull: { hasConflictDates: orderId } } // Remove orderId from hasConflictDates
      );
      const allOrders = await Order.find({ car: carOfTheOrder._id });
      console.log("allOrders from delete", allOrders);
      await removeConflictDates(orderToDelete, allOrders);
    }

    // Send Telegram notification before deleting (we still have order data)
    sendOrderDeletedTelegramNotification(
      {
        id: orderToDelete.orderNumber || orderToDelete._id,
        startDate: orderToDelete.rentalStartDate.toISOString(),
        endDate: orderToDelete.rentalEndDate.toISOString(),
        totalPrice: orderToDelete.totalPrice,
        currency: "EUR",
        car: {
          model: carOfTheOrder.model,
          regNumber: carOfTheOrder.regNumber,
        },
        customer: {
          name: orderToDelete.customerName,
          phone: orderToDelete.phone,
          email: orderToDelete.email,
        },
      },
      session.user?.email || session.user?.name || "admin"
    ).catch(() => {}); // Fire and forget, don't block response

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    return new Response(
      JSON.stringify({
        message: `Order with id ${orderId} deleted successfully`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

function removeConflictDates(orderToDelete, allOrders) {
  if (
    !orderToDelete?.hasConflictDates ||
    !Array.isArray(orderToDelete.hasConflictDates)
  ) {
    console.error("Invalid input: hasConflictDates is not an array");
    return;
  }

  // Пройтись по каждому OrderId из orderToDelete.hasConflictDates
  orderToDelete.hasConflictDates.forEach(({ OrderId }) => {
    if (!OrderId) {
      console.log("No conflicts for this order");
      return;
    }

    // Найти заказ по OrderId
    const targetOrder = allOrders.find((order) => order._id === OrderId);

    if (!targetOrder) {
      console.warn(`Order with OrderId ${OrderId} not found in allOrders`);
      return;
    }

    // Убедимся, что у найденного заказа есть массив hasConflictDates
    if (!Array.isArray(targetOrder.hasConflictDates)) {
      console.warn(
        `OrderId ${OrderId} does not have a valid hasConflictDates array`
      );
      return;
    }

    // Удалить OrderId из targetOrder.hasConflictDates
    targetOrder.hasConflictDates = targetOrder.hasConflictDates.filter(
      (conflict) => conflict !== orderToDelete._id
    );

    console.log(
      `OrderId ${orderToDelete.OrderId} removed from hasConflictDates of OrderId ${OrderId}`
    );
  });
}

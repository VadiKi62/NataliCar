import { Order } from "@models/order";
import { connectToDB } from "@utils/database";
import { requireAdmin } from "@/lib/adminAuth";
import { canEditOrder } from "@/domain/orders/orderPermissions";

export const PUT = async (req) => {
  try {
    await connectToDB();
    
    // Check admin authentication
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { _id, phone, email, customerName, my_order, flightNumber } =
      await req.json(); // Destructure only the allowed fields
    
    // Find the order first to check permissions
    const existingOrder = await Order.findById(_id);
    
    if (!existingOrder) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404 }
      );
    }
    
    // Check if admin has permission to edit this order
    const permission = canEditOrder(existingOrder, session.user);
    
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

    // Filter the update to only include allowed fields
    const updateFields = {};
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (customerName) updateFields.customerName = customerName;
    if (typeof my_order === "boolean") updateFields.my_order = my_order;
    // Allow updating flightNumber (accept empty string as a valid value)
    if (flightNumber !== undefined) updateFields.flightNumber = flightNumber;

    // Update the order with only the allowed fields
    const updatedOrder = await Order.findByIdAndUpdate(_id, updateFields, {
      new: true, // return the updated document
    });

    if (!updatedOrder) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(updatedOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to update order", { status: 500 });
  }
};

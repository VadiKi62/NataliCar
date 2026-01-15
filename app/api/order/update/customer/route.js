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

    const { _id, phone, email, customerName, flightNumber } = await req.json(); // Destructure only the allowed fields

    // Debug log to verify incoming payload (including flightNumber)
    console.log("API:update/customer - incoming payload:", {
      _id,
      phone,
      email,
      customerName,
      flightNumber,
    });
    
    // Find the order first to check permissions
    const existingOrder = await Order.findById(_id);
    
    if (!existingOrder) {
      return new Response(JSON.stringify({ message: "Заказ не найден" }), {
        status: 404,
        success: false,
      });
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
    updateFields.email = email; // Обновляем email даже если он пустой
    if (customerName) updateFields.customerName = customerName;
    // Allow updating flightNumber (accept empty string as valid)
    if (flightNumber !== undefined) updateFields.flightNumber = flightNumber;

    // Update the order with only the allowed fields
    const updatedOrder = await Order.findByIdAndUpdate(_id, updateFields, {
      new: true, // return the updated document
    });

    if (!updatedOrder) {
      return new Response(JSON.stringify({ message: "Заказ не найден" }), {
        status: 404,
        success: false,
      });
    }

    return new Response(
      JSON.stringify({
        updatedOrder,
        message: "Данные клиента обновлены успешно",
      }),
      {
        status: 200,
        success: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Ошибка. Данные клиента не обновлены" }),
      { status: 500, success: false }
    );
  }
};

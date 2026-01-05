import { Order } from "@models/order";
import Company from "@models/company";
import { connectToDB } from "@utils/database";
// 🎯 ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ для анализа конфликтов
import { analyzeConfirmationConflicts } from "@/domain/booking/analyzeConfirmationConflicts";

export const PATCH = async (request, { params }) => {
  try {
    await connectToDB();

    const { orderId } = params;
    console.log("switchConfirm orderId:", orderId);

    // Find the order by its ID
    const order = await Order.findById(orderId);

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404 }
      );
    }

    // Если пытаемся подтвердить (переключить с false на true)
    const isConfirming = !order.confirmed;

    if (isConfirming) {
      // Получаем все заказы для этой машины
      const allOrdersForCar = await Order.find({
        car: order.car,
      });

      // Получаем компанию для bufferTime
      const companyId = "679903bd10e6c8a8c0f027bc"; // TODO: сделать динамическим
      const company = await Company.findById(companyId);

      // 🎯 Используем ЕДИНСТВЕННУЮ функцию анализа (Athens timezone)
      const conflictAnalysis = analyzeConfirmationConflicts({
        orderToConfirm: order,
        allOrders: allOrdersForCar,
        bufferHours: company?.bufferTime, // Передаём bufferTime из компании
      });

      console.log("Confirmation conflict analysis:", conflictAnalysis);

      if (!conflictAnalysis.canConfirm) {
        // ⛔ BLOCK: нельзя подтвердить
        return new Response(
          JSON.stringify({
            success: false,
            message: conflictAnalysis.message,
            level: conflictAnalysis.level,
            conflicts: conflictAnalysis.blockedByConfirmed,
            affectedPendingOrders: conflictAnalysis.affectedPendingOrders,
            bufferHours: conflictAnalysis.bufferHours,
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // ✅ Можно подтвердить (возможно с warning)
      order.confirmed = true;
      const updatedOrder = await order.save();

      // Определяем статус ответа
      const responseStatus = conflictAnalysis.level === "warning" ? 202 : 200;
      const responseMessage = conflictAnalysis.message || "Заказ успешно подтверждён";

      return new Response(
        JSON.stringify({
          success: true,
          data: updatedOrder,
          message: responseMessage,
          level: conflictAnalysis.level,
          affectedOrders: conflictAnalysis.affectedPendingOrders,
          bufferHours: conflictAnalysis.bufferHours,
        }),
        {
          status: responseStatus,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Снимаем подтверждение (всегда разрешено)
      order.confirmed = false;
      const updatedOrder = await order.save();

      return new Response(
        JSON.stringify({
          success: true,
          data: updatedOrder,
          message: "Подтверждение заказа снято",
          level: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to toggle order confirmation",
        data: error.message,
        success: false,
      }),
      { status: 500 }
    );
  }
};

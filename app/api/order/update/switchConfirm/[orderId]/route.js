import { Order } from "@models/order";
import { Car } from "@models/car"; // 🔧 FIX: Import Car to ensure it's registered before Order pre-save middleware
import Company from "@models/company";
import { connectToDB } from "@utils/database";
import { requireAdmin } from "@/lib/adminAuth";
import { canConfirmOrder } from "@/domain/orders/orderPermissions";
// 🎯 ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ для анализа конфликтов
import { analyzeConfirmationConflicts } from "@/domain/booking/analyzeConfirmationConflicts";

export const PATCH = async (request, { params }) => {
  try {
    await connectToDB();
    
    // Check admin authentication
    const { session, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

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
    
    // Check if admin has permission to confirm/unconfirm this order
    const permission = canConfirmOrder(order, session.user);
    
    if (!permission.allowed) {
      // ⛔ PERMISSION DENIED (403)
      // Get company for bufferHours normalization
      const companyId = "679903bd10e6c8a8c0f027bc"; // TODO: сделать динамическим
      const company = await Company.findById(companyId);
      const bufferHours = Number(company?.bufferTime ?? 2);
      
      const normalized = {
        success: false,
        data: null,
        message: permission.reason,
        level: "block",
        conflicts: [],
        affectedOrders: [],
        bufferHours: bufferHours,
      };
      
      console.log(`[switchConfirm] 403 PERMISSION_DENIED orderId=${orderId} success=false level=block`);
      
      return new Response(
        JSON.stringify(normalized),
        { status: 403, headers: { "Content-Type": "application/json" } }
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
    
    // Normalize bufferHours
    const bufferHours = Number(company?.bufferTime ?? 2);

    // 🎯 Используем ЕДИНСТВЕННУЮ функцию анализа (Athens timezone)
    const conflictAnalysis = analyzeConfirmationConflicts({
      orderToConfirm: order,
      allOrders: allOrdersForCar,
      bufferHours: bufferHours,
    });

    console.log("Confirmation conflict analysis:", conflictAnalysis);

    if (!conflictAnalysis.canConfirm) {
      // ⛔ BLOCK: нельзя подтвердить (409)
      const normalized = {
        success: false,
        data: null,
        message: conflictAnalysis.message,
        level: "block",
        conflicts: conflictAnalysis.blockedByConfirmed ?? [],
        affectedOrders: conflictAnalysis.affectedPendingOrders ?? [],
        bufferHours: conflictAnalysis.bufferHours ?? bufferHours,
      };
      
      console.log(`[switchConfirm] 409 BLOCK orderId=${orderId} success=false level=block`);
      
      return new Response(
        JSON.stringify(normalized),
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
    
    const normalized = {
      success: true,
      data: updatedOrder,
      message: responseMessage,
      level: conflictAnalysis.level ?? null,
      conflicts: [], // No conflicts on success
      affectedOrders: conflictAnalysis.affectedPendingOrders ?? [],
      bufferHours: conflictAnalysis.bufferHours ?? bufferHours,
    };
    
    console.log(`[switchConfirm] ${responseStatus} SUCCESS orderId=${orderId} success=true level=${normalized.level || "null"}`);

    return new Response(
      JSON.stringify(normalized),
      {
        status: responseStatus,
        headers: { "Content-Type": "application/json" },
      }
    );
    } else {
      // Снимаем подтверждение (всегда разрешено)
      order.confirmed = false;
      const updatedOrder = await order.save();
      
      // Get company for bufferHours normalization
      const companyId = "679903bd10e6c8a8c0f027bc"; // TODO: сделать динамическим
      const company = await Company.findById(companyId);
      const bufferHours = Number(company?.bufferTime ?? 2);

      const normalized = {
        success: true,
        data: updatedOrder,
        message: "Подтверждение заказа снято",
        level: null,
        conflicts: [],
        affectedOrders: [],
        bufferHours: bufferHours,
      };
      
      console.log(`[switchConfirm] 200 SUCCESS orderId=${orderId} success=true level=null (unconfirmed)`);

      return new Response(
        JSON.stringify(normalized),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error updating order:", error);
    
    // Get company for bufferHours normalization (fallback)
    const companyId = "679903bd10e6c8a8c0f027bc"; // TODO: сделать динамическим
    const company = await Company.findById(companyId);
    const bufferHours = Number(company?.bufferTime ?? 2);
    
    const normalized = {
      success: false,
      data: null,
      message: "Failed to toggle order confirmation",
      level: "block",
      conflicts: [],
      affectedOrders: [],
      bufferHours: bufferHours,
    };
    
    console.log(`[switchConfirm] 500 ERROR orderId=${params.orderId} success=false level=block`);
    
    return new Response(
      JSON.stringify(normalized),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

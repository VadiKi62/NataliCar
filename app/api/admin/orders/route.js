import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

/**
 * GET /api/admin/orders
 * 
 * Returns all orders for admin table view.
 * Requires admin authentication.
 * 
 * Response fields:
 * - _id, orderNumber
 * - car (id, model, regNumber, carNumber)
 * - customerName, phone, email
 * - rentalStartDate, rentalEndDate, timeIn, timeOut
 * - confirmed, my_order, createdByRole
 * - totalPrice, numberOfDays
 * - placeIn, placeOut
 * - createdAt, updatedAt
 * 
 * Also returns:
 * - adminRole: current admin's role (0 or 1) for UI permission checks
 * 
 * Sorted by createdAt descending (newest first)
 */
export async function GET(request) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Unauthorized: Admin access required" 
        }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    await connectToDB();
    
    // Get admin's role for permission checks in UI
    // Users are hardcoded in api/auth, not stored in DB, so use session.user.role directly
    const adminRole = session.user?.role ?? 0;
    
    console.log("[GET /api/admin/orders] Admin role from session:", {
      sessionUserId: session.user.id,
      sessionUserEmail: session.user.email,
      sessionUserName: session.user.name,
      sessionUserRole: session.user.role,
      finalAdminRole: adminRole,
    });

    // Fetch all orders with car details populated
    const orders = await Order.find({})
      .populate({
        path: "car",
        select: "_id model regNumber carNumber",
      })
      .sort({ createdAt: -1 }) // Newest first
      .lean(); // Convert to plain JS objects for performance

    // Map orders to include only needed fields
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      car: order.car
        ? {
            _id: order.car._id,
            model: order.car.model,
            regNumber: order.car.regNumber,
            carNumber: order.car.carNumber,
          }
        : null,
      carModel: order.carModel, // Fallback from order itself
      carNumber: order.carNumber, // Fallback from order itself
      customerName: order.customerName,
      phone: order.phone,
      email: order.email || "",
      rentalStartDate: order.rentalStartDate,
      rentalEndDate: order.rentalEndDate,
      timeIn: order.timeIn,
      timeOut: order.timeOut,
      confirmed: order.confirmed,
      my_order: order.my_order,
      // Permission-related fields
      createdByRole: order.createdByRole ?? 0, // Default 0 for existing orders
      createdByAdminId: order.createdByAdminId || null,
      totalPrice: order.totalPrice,
      numberOfDays: order.numberOfDays,
      placeIn: order.placeIn,
      placeOut: order.placeOut,
      createdAt: order.createdAt || order.date,
      updatedAt: order.updatedAt,
      // Additional fields for conflict display
      hasConflictDates: order.hasConflictDates || [],
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: formattedOrders,
        count: formattedOrders.length,
        // Include admin's role for UI permission checks
        adminRole,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}


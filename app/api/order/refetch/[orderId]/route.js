import { connectToDB } from "@utils/database";
import { Order } from "@models/order";

export async function GET(request, { params }) {
  try {
    await connectToDB();

    const { orderId } = params;
    // Проверка наличия orderId
    if (!orderId) {
      return new Response("Order ID is required", { status: 400 });
    }

    console.log("orderId", orderId);
    // Находим заказ по ID
    const order = await Order.findById(orderId);

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return new Response(`Failed to fetch order: ${error.message}`, {
      status: 500,
    });
  }
}

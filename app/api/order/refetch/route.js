import { connectToDB } from "@utils/database";
import { Car } from "@models/car";
import { Order } from "@models/order";

export async function POST(request) {
  try {
    await connectToDB();

    const orders = await Order.find();

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error adding new order:", error);
    return new Response(`Failed to add new order: ${error.message}`, {
      status: 500,
    });
  }
}

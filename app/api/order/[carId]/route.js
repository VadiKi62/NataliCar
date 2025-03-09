import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const GET = async (request, { params }) => {
  console.log("params", params);
  try {
    await connectToDB();
    const { carId } = params;

    console.log("carId:", carId);

    const orders = await Order.find({ car: carId });
    if (orders.length == 0) {
      return new Response("No Orders for this car");
    }
    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to fetch orders", { status: 500 });
  }
};

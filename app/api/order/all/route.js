import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const GET = async (req, res) => {
  try {
    await connectToDB();

    const orders = await Order.find();

    console.log("Fetched orders:", orders); // Log orders to check in Vercel logs

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error); // Log error in Vercel logs
    return new Response("Failed to fetch orders", { status: 500 });
  }
};

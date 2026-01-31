import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import { withOrderVisibility } from "@/middleware/withOrderVisibility";

async function handler(request, { params }) {
  try {
    await connectToDB();

    const car = await Car.findById(params.id).populate("orders").lean();

    if (!car) {
      return new Response("Car not found", { status: 404 });
    }

    return new Response(JSON.stringify(car), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to fetch car", { status: 500 });
  }
}

export const GET = withOrderVisibility(handler);

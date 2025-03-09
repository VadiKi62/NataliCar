import { Car } from "@models/car";
import { connectToDB } from "@utils/database";

export const GET = async (request, { params }) => {
  try {
    await connectToDB();

    const car = await Car.findById(params.id).populate("orders").exec();

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
};

import { Car } from "@models/car";
import { connectToDB } from "@utils/database";

export const GET = async () => {
  try {
    await connectToDB();

    const cars = await Car.find();

    return new Response(JSON.stringify(cars), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to fetch cars", { status: 500, data: error });
  }
};

export const POST = async () => {
  try {
    await connectToDB();

    const cars = await Car.find();

    return new Response(JSON.stringify(cars), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to fetch cars", { status: 500, data: error });
  }
};

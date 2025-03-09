import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import { carsData } from "@utils/initialData";

export const POST = async (request) => {
  try {
    await connectToDB();

    const carsData = await request.json(); // Assuming the cars data is sent in the request body
    let exCars = [];

    for (const carData of carsData) {
      const { carNumber } = carData;

      const existingCar = await Car.findOne({ carNumber });

      if (existingCar) {
        exCars.push(existingCar);
      }
    }

    // Add cars to the database
    const newCars = await Car.create(carsData);
    return new Response(JSON.stringify(newCars), {
      status: 201,
      data: `Cars that are already exist : ${exCars}`,
    });
  } catch (error) {
    console.error("Error adding new cars:", error);
    return new Response(`Failed to add new cars: ${error.message}`, {
      status: 500,
    });
  }
};

//this endpoint delete all old cars and create new ones
export const GET = async (request) => {
  try {
    await connectToDB();

    // const carsData = await request.json(); // Assuming the cars data is sent in the request body

    // Delete all existing cars
    await Car.deleteMany({});

    // Add new cars to the database
    const newCars = await Car.create(carsData);

    return new Response(JSON.stringify(newCars), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error rewriting cars:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

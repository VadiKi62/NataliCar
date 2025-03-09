import { Car } from "@models/car";
import { connectToDB } from "@utils/database";

export const DELETE = async (request, { params }) => {
  try {
    await connectToDB();
    const { carId } = params;

    // Delete the car
    await Car.findByIdAndDelete(carId);

    return new Response(
      JSON.stringify({ message: `Car with id ${carId} deleted successfully` }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting car:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

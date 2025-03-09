import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import dayjs from "dayjs";

export const PUT = async (req) => {
  try {
    await connectToDB();

    const { _id, ...updateFields } = await req.json();

    updateFields.dateLastModified = dayjs().toDate();

    const updatedCar = await Car.findByIdAndUpdate(_id, updateFields, {
      new: true,
    });

    if (!updatedCar) {
      return new Response({
        success: false,
        message: "Car not found",
      });
    }
    return new Response(JSON.stringify(updatedCar), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to update car", { status: 500, data: error });
  }
};

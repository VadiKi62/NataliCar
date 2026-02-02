import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import { withOrderVisibility } from "@/middleware/withOrderVisibility";

async function handler(request, { params }) {
  try {
    await connectToDB();

    const slug = params.slug;
    if (!slug) {
      return new Response("Slug required", { status: 400 });
    }

    const car = await Car.findOne({ slug: slug.trim().toLowerCase() })
      .populate("orders")
      .lean();

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

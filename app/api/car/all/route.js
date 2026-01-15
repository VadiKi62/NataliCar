import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

// Кеширование для статических данных (cars меняются редко)
// Revalidate каждые 10 минут (600 секунд)
export const revalidate = 600;

export const GET = async () => {
  try {
    await connectToDB();

    const cars = await Car.find();

    return NextResponse.json(cars, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Кеширование на клиенте и CDN
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch cars" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// POST запросы не кешируются (для обновления данных)
export const POST = async () => {
  try {
    await connectToDB();

    const cars = await Car.find();

    return NextResponse.json(cars, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch cars" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

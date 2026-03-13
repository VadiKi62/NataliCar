import { Car } from "@models/car";
import { ROLE } from "@models/user";
import { connectToDB } from "@utils/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { NextResponse } from "next/server";

// Кеширование для статических данных (cars меняются редко)
// Revalidate каждые 10 минут (600 секунд)
export const revalidate = 600;

/** Cars with testingCar: true are only returned when the request is from a logged-in superadmin. */
function getCarsFilter(session) {
  const isSuperadmin =
    session?.user?.isAdmin === true && session?.user?.role === ROLE.SUPERADMIN;
  if (isSuperadmin) return {};
  return {
    $or: [
      { testingCar: { $ne: true } },
      { testingCar: { $exists: false } },
    ],
  };
}

export const GET = async (request) => {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    const filter = getCarsFilter(session);
    const cars = await Car.find(filter);

    return NextResponse.json(cars, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
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
export const POST = async (request) => {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    const filter = getCarsFilter(session);
    const cars = await Car.find(filter);

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

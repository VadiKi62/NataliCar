/**
 * POST /api/order/refetch-active
 *
 * 🎯 CLIENT-SAFE endpoint — returns ONLY orders with rentalStartDate >= today (Athens timezone)
 *
 * ⚠️ This endpoint is designed for PUBLIC/CLIENT pages ONLY.
 * Admin pages should use /api/order/refetch which returns ALL orders.
 *
 * Timezone handling:
 * - "Today" is calculated in Europe/Athens timezone (business timezone)
 * - MongoDB stores dates in UTC, so we convert Athens start-of-day to UTC for querying
 * - This ensures consistent behavior regardless of server location
 */

import { connectToDB } from "@utils/database";
import { Order } from "@models/order";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ATHENS_TZ = "Europe/Athens";

/**
 * Get today's start of day in Athens timezone, converted to UTC for MongoDB query.
 *
 * Example:
 * - Athens local: 2025-01-16 00:00:00 EET (UTC+2)
 * - UTC equivalent: 2025-01-15 22:00:00 UTC
 *
 * @returns {Date} JavaScript Date object in UTC representing Athens start-of-day
 */
function getTodayAthensStartUTC() {
  // Get current time in Athens timezone
  const nowAthens = dayjs().tz(ATHENS_TZ);

  // Get start of day in Athens (00:00:00 Athens time)
  const startOfDayAthens = nowAthens.startOf("day");

  // Convert to UTC for MongoDB query
  // MongoDB stores dates in UTC, so we need UTC timestamp
  return startOfDayAthens.utc().toDate();
}

export async function POST(request) {
  try {
    await connectToDB();

    // Calculate today's start in Athens timezone, converted to UTC
    const todayStartUTC = getTodayAthensStartUTC();

    // Debug logging (production-safe)
    if (process.env.NODE_ENV === "development") {
      console.log("[refetch-active] Athens today start (UTC):", todayStartUTC.toISOString());
    }

    // Fetch ONLY orders where rentalStartDate >= today (Athens timezone)
    // This ensures clients never receive historical data
    const orders = await Order.find({
      rentalStartDate: { $gte: todayStartUTC },
    })
      .select(
        "rentalStartDate rentalEndDate timeIn timeOut car carNumber confirmed customerName phone email Viber Whatsapp Telegram numberOfDays totalPrice OverridePrice carModel date my_order placeIn placeOut flightNumber ChildSeats insurance franchiseOrder orderNumber"
      )
      .lean(); // lean() for performance - returns plain JS objects

    if (process.env.NODE_ENV === "development") {
      console.log(`[refetch-active] Returning ${orders.length} active orders (startDate >= today Athens)`);
    }

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching active orders:", error);
    return new Response(`Failed to fetch active orders: ${error.message}`, {
      status: 500,
    });
  }
}

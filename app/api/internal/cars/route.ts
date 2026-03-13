/**
 * Internal API: list cars for external consumers (e.g. bbqr.site).
 * - Returns ONLY real cars (testingCar = false or not set).
 * - Protected by Bearer token (INTERNAL_API_TOKEN).
 * - CORS allowed only from https://bbqr.site.
 * - Returns minimal public fields only.
 */

import { NextRequest, NextResponse } from "next/server";
import { Car } from "@models/car";
import { connectToDB } from "@utils/database";

const ALLOWED_ORIGIN = "https://bbqr.site";
const AUTH_SCHEME = "Bearer";

/** Public shape returned to the client. */
export type InternalCarItem = {
  _id: string;
  brand: string;
  model: string;
  transmission: string;
  price: number;
  slug: string;
  image: string | null;
};

/** Extract first word of model as brand (e.g. "Toyota Yaris" -> "Toyota"). */
function extractBrand(model: string | undefined): string {
  const trimmed = (model ?? "").trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0];
}

/**
 * Get a representative price from pricingTiers (min across all seasons and day tiers).
 * pricingTiers after .lean(): { [season]: { days: { [dayCount]: number } } } or Map.
 */
function getRepresentativePrice(pricingTiers: unknown): number {
  if (pricingTiers == null) return 0;
  const tiers =
    pricingTiers instanceof Map
      ? Object.fromEntries(pricingTiers as Map<string, { days?: Record<string, number> }>)
      : (pricingTiers as Record<string, { days?: Record<string, number> }>);
  let min = Infinity;
  for (const tier of Object.values(tiers ?? {})) {
    const days = tier?.days;
    if (days == null) continue;
    const dayMap = days instanceof Map ? Object.fromEntries(days) : days;
    for (const value of Object.values(dayMap ?? {})) {
      const n = Number(value);
      if (Number.isFinite(n) && n < min) min = n;
    }
  }
  return Number.isFinite(min) ? min : 0;
}

/** Validate Bearer token. Returns true iff token is valid. */
function validateToken(request: NextRequest): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (typeof expected !== "string" || expected.length === 0) {
    return false;
  }
  const auth = request.headers.get("Authorization")?.trim();
  if (!auth || !auth.startsWith(AUTH_SCHEME)) {
    return false;
  }
  const token = auth.slice(AUTH_SCHEME.length).trim();
  return token.length > 0 && token === expected;
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

/** OPTIONS: preflight for CORS. */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/** GET: return only real cars (testingCar = false), minimal public fields. */
export async function GET(request: NextRequest) {
  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders(),
  };

  if (!validateToken(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers }
    );
  }

  try {
    await connectToDB();
  } catch (err) {
    console.error("[internal/cars] DB connection error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers }
    );
  }

  try {
    // Only real cars: testingCar is false or not set (exclude testingCar === true)
    const filter = {
      $or: [
        { testingCar: false },
        { testingCar: { $exists: false } },
      ],
    };
    // Mongoose Query has union overloads that confuse TS; assert to run the chain
    const cars = await (Car as import("mongoose").Model<Record<string, unknown>>)
      .find(filter)
      .select("_id model transmission slug photoUrl pricingTiers")
      .lean()
      .exec();

    const items: InternalCarItem[] = (cars as Array<Record<string, unknown>>).map(
      (doc) => ({
        _id: String(doc._id),
        brand: extractBrand(doc.model as string),
        model: (doc.model as string) ?? "",
        transmission: (doc.transmission as string) ?? "",
        price: getRepresentativePrice(doc.pricingTiers),
        slug: (doc.slug as string) ?? "",
        image: typeof doc.photoUrl === "string" ? doc.photoUrl : null,
      })
    );

    return NextResponse.json(items, { status: 200, headers });
  } catch (err) {
    console.error("[internal/cars] Error fetching cars:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers }
    );
  }
}

import { NextResponse } from "next/server";

import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import fs from "fs/promises";
import path from "path";
import cloudinary from "@utils/cloudinary";

dayjs.extend(isBetween);

// Main handler function
export async function POST(req) {
  try {
    const formData = await req.formData();
    const carData = extractCarData(formData);

    // Generate carNumber by fetching the highest current car number and incrementing it
    carData.carNumber = await generateCarNumber();

    await validateRequiredFields(carData);

    if (carData.file) {
      carData.photoUrl = await handleImageUpload(carData.file);
    } else {
      carData.photoUrl = "NO_PHOTO_h2klff";
    }

    carData.dateAddCar = dayjs().toDate();
    // Create and save the car
    const newCar = new Car(carData);

    await newCar.save();

    return NextResponse.json(
      {
        success: true,
        message: `Машина ${newCar.model} добавлена`,
        data: newCar,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

async function generateCarNumber() {
  // Fetch all car numbers and map them to integers
  const cars = await Car.find().select("carNumber");
  const carNumbers = cars
    .map((car) => parseInt(car.carNumber, 10))
    .filter((num) => !isNaN(num));

  // Find the highest car number
  const maxCarNumber = carNumbers.length > 0 ? Math.max(...carNumbers) : 0;
  const newCarNumber = maxCarNumber + 1;

  // Return as a zero-padded string (e.g., four digits)
  return newCarNumber.toString().padStart(4, "0");
}
// Function to extract data from the form
function extractCarData(formData) {
  console.log("formdata from API :", formData);
  const file = formData.get("image");
  return {
    file,
    model: formData.get("model"),
    class: formData.get("class"),
    transmission: formData.get("transmission"),
    seats: formData.get("seats"),
    numberOfDoors: formData.get("numberOfDoors"),
    airConditioning: formData.get("airConditioning"),
    enginePower: formData.get("enginePower"),
    pricingTiers: parsePricingTiers(formData.get("pricingTiers")),
    regNumber: formData.get("regNumber"),
    color: formData.get("color"),
    engine: formData.get("engine"),
    fueltype: formData.get("fueltype"),
    registration: formData.get("registration"),
  };
}

// Function to validate required fields
function validateRequiredFields(carData) {
  const requiredFields = [
    "carNumber",
    "model",
    "class",
    "transmission",
    "seats",
    "numberOfDoors",
    "airConditioning",
    "enginePower",
    "pricingTiers",
    "fueltype",
  ];
  for (const field of requiredFields) {
    if (!carData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  validatePricingTiers(carData.pricingTiers);
  validateNumberOfDoors(carData.numberOfDoors);
}

// Function to parse and validate pricing tiers
function parsePricingTiers(pricingTiersString) {
  try {
    return pricingTiersString
      ? JSON.parse(pricingTiersString)
      : createEmptyPricingTiers();
  } catch (error) {
    throw new Error("Invalid pricing tiers format");
  }
}

function createEmptyPricingTiers() {
  return {
    NoSeason: { days: {} },
    LowSeason: { days: {} },
    LowUpSeason: { days: {} },
    MiddleSeason: { days: {} },
    HighSeason: { days: {} },
  };
}

function validatePricingTiers(pricingTiers) {
  const seasons = [
    "NoSeason",
    "LowSeason",
    "LowUpSeason",
    "MiddleSeason",
    "HighSeason",
  ];
  for (const season of seasons) {
    if (
      !pricingTiers[season]?.days ||
      Object.keys(pricingTiers[season].days).length === 0
    ) {
      throw new Error(`Missing pricing information for ${season}`);
    }
  }
}

// Validate number of doors
function validateNumberOfDoors(numberOfDoors) {
  if (numberOfDoors < 2 || numberOfDoors > 10) {
    throw new Error("Number of doors must be between 2 and 10");
  }
}

// Function to handle image upload
async function handleImageUpload(file) {
  const allowedMimeTypes = ["image/jpeg", "image/png"];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG and PNG are allowed");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadToCloudinary = () =>
    new Promise((resolve, reject) => {
      const stream = require("stream");
      const passthrough = new stream.PassThrough();
      passthrough.end(buffer);

      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) {
            reject(new Error("Failed to upload image to Cloudinary"));
          } else {
            resolve(result.public_id);
          }
        })
        .end(passthrough.read());
    });

  return await uploadToCloudinary();
}

// Error handling function
function handleError(error) {
  console.error("Error:", error);
  const status = error.code === 11000 ? 409 : 500;
  const message =
    error.code === 11000
      ? "A car with this car number already exists"
      : "Failed to add car";
  return NextResponse.json(
    { success: false, message, details: error.message },
    { status }
  );
}

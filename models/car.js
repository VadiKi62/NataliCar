import { Schema, model, models } from "mongoose";
import { seasons } from "@utils/companyData";
import { CAR_CLASSES, TRANSMISSION_TYPES, FUEL_TYPES } from "./enums";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const pricingTierSchema = new Schema({
  days: {
    type: Map,
    of: Number,
    required: true,
  },
});

const createEnumValidator = (enumObject) => ({
  values: Object.values(enumObject),
  message: `{VALUE} is not a valid option. Valid options are: ${Object.values(
    enumObject
  ).join(", ")}`,
  validate: {
    validator: function (v) {
      return Object.values(enumObject)
        .map((val) => val.toLowerCase())
        .includes(v.toLowerCase());
    },
    message: (props) => `${props.value} is not a valid option`,
  },
});

const CarSchema = new Schema({
  carNumber: {
    type: String,
    required: true,
    unique: true,
  },
  model: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
  },
  sort: {
    type: Number,
    default: 999,
  },
  class: {
    type: String,
    enum: createEnumValidator(CAR_CLASSES),
    required: true,
    set: (v) => v.toLowerCase(),
  },
  transmission: {
    type: String,
    enum: createEnumValidator(TRANSMISSION_TYPES),
    required: true,
    set: (v) => v.toLowerCase(),
  },
  fueltype: {
    type: String,
    enum: createEnumValidator(FUEL_TYPES),
    set: (v) => v.toLowerCase(),
  },
  seats: {
    type: Number,
    default: 5,
    required: true,
  },
  registration: {
    type: Number,
    default: 2016,
  },
  regNumber: {
    type: String,
    default: "NKT 123",
  },
  color: {
    type: String,
  },
  numberOfDoors: {
    type: Number,
    min: 2,
    max: 6,
    required: true,
  },
  airConditioning: {
    type: Boolean,
    required: true,
  },
  enginePower: {
    type: Number,
    required: true,
  },
  engine: {
    type: String,
    default: "1.500",
  },
  pricingTiers: {
    type: Map,
    of: pricingTierSchema,
    required: true,
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  dateAddCar: {
    type: Date,
  },
  dateLastModified: {
    type: Date,
  },
});

CarSchema.methods.getSeason = function (date) {
  const today = dayjs(date);
  const currentYear = today.year();

  for (const [season, range] of Object.entries(seasons)) {
    const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
    const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

    if (today.isBetween(startDate, endDate, null, "[]")) {
      return season;
    }
  }

  return "NoSeason"; // Default return if no season matches
};

// Method to calculate price based on days and current season
CarSchema.methods.calculatePrice = function (days, date = dayjs()) {
  const season = this.getSeason(date); // Determine the current season
  // console.log("season!!!! is !!!", season);

  const pricingTiers = this.pricingTiers.get(season); // Use Map's `get` method
  // console.log("pricingTiers!!!! is !!!", pricingTiers);

  // Ensure the map keys are properly converted to numbers
  const tiers = Array.from(pricingTiers.days.keys()).map((key) =>
    parseInt(key, 10)
  );
  // console.log("TIERS ISSS!!! ", tiers); // Log to see if they are valid numbers

  // Sort the tiers in descending order
  const sortedTiers = tiers.sort((a, b) => b - a);
  // console.log("Sorted TIERS: ", sortedTiers); // Check if sorting works correctly

  // Find the correct price tier for the number of days
  for (let tier of sortedTiers) {
    if (days <= tier) {
      // console.log(
      //   "RETURN ISSS!!!  IS!!! ",
      //   pricingTiers.days.get(tier.toString())
      // ); // Map keys are strings
      return pricingTiers.days.get(tier.toString()); // Use `toString()` for map access
    }
  }

  // Return the highest tier if no match is found
  return pricingTiers.days.get(sortedTiers[sortedTiers.length - 1].toString());
};

const Car = models.Car || model("Car", CarSchema);
export { CarSchema, Car };

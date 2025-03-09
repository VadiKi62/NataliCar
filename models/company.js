// import mongoose from "mongoose";
import { Schema, model, models } from "mongoose";

const SeasonSchema = new Schema({
  start: { type: String, required: true }, // Use MM/DD format
  end: { type: String, required: true }, // Use MM/DD format
});

const CoordsSchema = new Schema({
  lat: { type: String, required: true },
  lon: { type: String, required: true },
});

const locationsSchema = new Schema({
  name: { type: String },
  coords: CoordsSchema,
});
const CompanySchema = new Schema({
  name: { type: String, required: true },
  tel: { type: String, required: true },
  tel2: { type: String },
  email: { type: String, required: true },
  email2: { type: String },
  address: { type: String, required: true },
  slogan: { type: String },
  coords: { type: CoordsSchema, required: true },
  hoursDiffForStart: { type: Number, required: true },
  hoursDiffForEnd: { type: Number, required: true },
  defaultStart: { type: String, required: true }, // Use HH:mm format
  defaultEnd: { type: String, required: true }, // Use HH:mm format
  seasons: {
    NoSeason: { type: SeasonSchema, required: true },
    LowSeason: { type: SeasonSchema, required: true },
    LowUpSeason: { type: SeasonSchema, required: true },
    MiddleSeason: { type: SeasonSchema, required: true },
    HighSeason: { type: SeasonSchema, required: true },
  },
  useEmail: { type: Boolean, default: false, required: true },
  locations: [locationsSchema],
});

const Company = models.Company || model("Company", CompanySchema);

export default Company;

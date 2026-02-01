import mongoose from "mongoose";

const DiscountSettingSchema = new mongoose.Schema({
  discount: { type: Number, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
});

export default mongoose.models?.DiscountSetting ||
  mongoose.model("DiscountSetting", DiscountSettingSchema);

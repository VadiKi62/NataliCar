import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const timeZone = "Europe/Athens";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.utc();

const OrderSchema = new mongoose.Schema({
  rentalStartDate: {
    type: Date,
    required: true,
    set: (value) => dayjs(value).utc().toDate(),
  },
  rentalEndDate: {
    type: Date,
    required: true,
    set: (value) => dayjs(value).utc().toDate(),
  },
  timeIn: {
    type: Date,
    default: function () {
      if (this.rentalStartDate) {
        return dayjs(this.rentalStartDate).hour(12).minute(0).utc().toDate();
      }
      return null;
    },
  },
  timeOut: {
    type: Date,
    default: function () {
      if (this.rentalEndDate) {
        return dayjs(this.rentalEndDate).hour(10).minute(0).utc().toDate();
      }
      return null;
    },
  },
  placeIn: {
    type: String,
    default: "Nea Kallikratia",
  },
  placeOut: {
    type: String,
    default: "Nea Kallikratia",
  },
  customerName: {
    type: String,
    required: true,
  },
  carNumber: {
    type: String,
    required: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  hasConflictDates: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Order",
    default: [],
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  numberOfDays: {
    type: Number,
  },
  totalPrice: {
    type: Number,
  },
  carModel: {
    type: String,
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: true,
  },
  date: {
    type: Date,
    default: dayjs().tz("Europe/Athens").toDate(),
  },
  placeIn: {
    type: String,
    default: "Nea Kalikratia",
  },
  placeOut: {
    type: String,
    default: "Nea Kalikratia",
  },
});

// Pre-save middleware to calculate the number of days and total price
OrderSchema.pre("save", async function (next) {
  const rentalStart = new Date(this.rentalStartDate);
  const rentalEnd = new Date(this.rentalEndDate);

  // Calculate the number of days
  const timeDiff = rentalEnd.getTime() - rentalStart.getTime();
  const numberOfDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  this.numberOfDays = numberOfDays;

  // Fetch car details and calculate price based on the number of days
  const Car = mongoose.model("Car"); // Make sure the Car model is registered
  const car = await Car.findById(this.car);

  if (car) {
    this.carNumber = car.carNumber;
    this.carModel = car.model;

    // Calculate total price using the car's pricing tiers
    const pricePerDay = car.calculatePrice(numberOfDays);
    this.totalPrice = pricePerDay * numberOfDays;
  }

  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export { OrderSchema, Order };

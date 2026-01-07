import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
// 🔧 FIX: Import Car model to ensure it's registered before pre-save middleware
import { Car } from "./car";

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
    required: false, // исправлено на false, чтобы email был необязательным
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
  my_order: {
    type: Boolean,
    default: false,
  },
  /**
   * Role of admin who created this order:
   * 0 = regular admin (default)
   * 1 = superadmin
   * 
   * Used for permission control:
   * - If my_order=true OR createdByRole=1, only superadmin can edit/delete
   */
  createdByRole: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  /**
   * ID of admin who created this order (optional tracking)
   */
  createdByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  ChildSeats: {
    type: Number,
    default: 0,
  },
  // 🔧 TEMPORARY: Support old field name during migration
  // This will be removed after migration is complete
  childSeats: {
    type: Number,
    default: 0,
    select: false, // Don't include in queries by default
  },
  insurance: {
    type: String,
    default: "TPL", // "TPL", "CDW"
  },
  franchiseOrder: {
    type: Number,
    default: 0,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  flightNumber: {
    type: String,
    default: "",
  },
});

// 🔧 MIGRATION SUPPORT: Sync childSeats (old) to ChildSeats (new) if needed
OrderSchema.pre("save", async function (next) {
  // If childSeats exists but ChildSeats doesn't, copy value
  if (this.childSeats !== undefined && this.ChildSeats === undefined) {
    this.ChildSeats = this.childSeats;
  }
  // Always use ChildSeats for calculations
  const childSeatsValue = this.ChildSeats ?? this.childSeats ?? 0;
  
  const rentalStart = new Date(this.rentalStartDate);
  const rentalEnd = new Date(this.rentalEndDate);

  // Calculate the number of days
  const timeDiff = rentalEnd.getTime() - rentalStart.getTime();
  const numberOfDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  this.numberOfDays = numberOfDays;

  // Fetch car details and calculate price based on the number of days
  // 🔧 FIX: Use imported Car model instead of mongoose.model() to avoid registration errors
  const car = await Car.findById(this.car);

  if (car) {
    this.carNumber = car.carNumber;
    this.carModel = car.model;

    // Новый алгоритм расчёта итоговой цены
    this.totalPrice = await car.calculateTotalRentalPricePerDay(
      this.rentalStartDate,
      this.rentalEndDate,
      this.insurance,
      childSeatsValue
    );
  }

  next();
});

// 🔧 MIGRATION SUPPORT: After loading, sync childSeats to ChildSeats if needed
OrderSchema.post("init", function () {
  if (this.childSeats !== undefined && (this.ChildSeats === undefined || this.ChildSeats === 0)) {
    this.ChildSeats = this.childSeats;
  }
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export { OrderSchema, Order };

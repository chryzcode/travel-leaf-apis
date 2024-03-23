import mongoose from "mongoose";

const carTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a valid name"],
  },
});

const carSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    carType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carType",
      required: [true, "Please provide car type"],
    },
    location: {
      type: String,
      required: [true, "Please provide location"],
    },
    brand: {
      type: String,
      required: [true, "Please provide brand"],
    },
    year: {
      type: Number,
      required: [true, "Please provide car year"],
    },
    color: {
      type: String,
      required: [true, "Please provide car color"],
    },
    plateNumber: {
      type: String,
      required: [true, "Please provide car plate number"],
    },
    dateAvailable: {
      type: Date,
      required: [true, "Please provide date"],
    },
    available: {
      type: Boolean,
    },
    booked: {
      type: Boolean,
      default: false,
    },
    media: ["Media"],
    description: {
      type: String,
      required: [true, "Please provide description"],
    },
    currency: {
      type: String,
      enum: ["USD"],
      default: "USD",
      required: [true, "Please provide currency, ex. USD"],
    },
    installmentalPayment: {
      type: Boolean,
      default: true,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

carSchema.pre("save", async function () {
  const currentDate = new Date();
  if (currentDate < this.dateAvailable) {
    this.available = true;
  }
  this.available = false;
});

const Car = mongoose.model("Car", carSchema);
const carType = mongoose.model("carType", carTypeSchema);

export { Car, carType };

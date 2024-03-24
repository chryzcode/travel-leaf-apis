import mongoose from "mongoose";

const yatchTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a valid name"],
  },
});

const yatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please provide name"],
    },
    yatchType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "yatchType",
      required: [true, "Please provide yatch type"],
    },
    location: {
      type: String,
      required: [true, "Please provide location"],
    },
    brand: {
      type: String,
      required: [true, "Please provide brand"],
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
    price: {
      type: Number,
      required: [true, "Please provide price"],
    },
    media: ["Media"],
    description: {
      type: String,
      required: [true, "Please provide description"],
    },
    currency: {
      type: String,
      enum: ["usd"],
      default: "usd",
      required: [true, "Please provide currency, ex. usd"],
    },
    features: [
      {
        type: String,
      },
    ],
    serviceFee: {
      type: Number,
      default: 0,
    },
    cleaningFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
    },
  },
  { timestamps: true }
);

yatchSchema.pre("save", async function () {
  const taxAmount = (this.price * 7) / 100;
  this.tax = taxAmount;
});

const Yatch = mongoose.model("Yatch", yatchSchema);
const yatchType = mongoose.model("yatchType", yatchTypeSchema);

export { Yatch, yatchType };

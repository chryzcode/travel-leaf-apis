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
    carType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "yatchType",
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
    dateAvailable: {
      type: Date,
      required: [true, "Please provide date"],
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
    negotiation: {
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

const Yatch = mongoose.model("Yatch", yatchSchema);
const yatchType = mongoose.model("yatchType", yatchTypeSchema);

export { Yatch, yatchType };

import mongoose from "mongoose";

const houseTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a valid name"],
  },
});

const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, "Please provide url"],
  },
});

const houseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
      type: String,
      required: [true, "Please provide location"],
    },
    houseType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "houseType",
      required: [true, "Please provide house type"],
    },
    numberOfRooms: {
      type: Number,
      required: [true, "Please provide number of rooms"],
    },
    numberOfKitchens: {
      type: Number,
      required: [true, "Please provide number of kitchens"],
    },
    numberOfBathrooms: {
      type: Number,
      required: [true, "Please provide number of bathrooms"],
    },
    description: {
      type: String,
      required: [true, "Please provide description"],
    },
    available: {
      type: Boolean,
    },
    booked: {
      type: Boolean,
      default: false,
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
    dateAvailable: {
      type: Date,
      required: [true, "Please provide date"],
    },
    features: [
      {
        type: String,
      },
    ],
    media: [mediaSchema],
  },
  { timestamps: true }
);

houseSchema.pre("save", async function () {
  const currentDate = new Date();
  if (currentDate < this.dateAvailable) {
    this.available = true;
  }
  this.available = false;
});

const House = mongoose.model("House", houseSchema);
const houseType = mongoose.model("houseType", houseTypeSchema);
const Media = mongoose.model("Media", mediaSchema);

export { House, houseType, Media };

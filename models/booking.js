import mongoose from "mongoose";

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    numberOfGuests: {
      type: Number,
      required: [true, '"Please provide number of guests'],
    },
    numberOfNights: {
      type: Number,
      required: [true, '"Please provide number of nights'],
    },
    arrival: {
      type: Date,
      required: [true, '"Please provide arrival date'],
    },
    departure: {
      type: Date,
    },
    amount: {
      type: Number,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    listingId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export { Booking };

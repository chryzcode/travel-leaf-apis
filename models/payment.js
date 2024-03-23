import mongoose from "mongoose";

const walletSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    default: 0,
  },
});

const paymentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

const Wallet = mongoose.model("Wallet", walletSchema);
const Payment = mongoose.model("Payment", paymentSchema);

export { Wallet, Payment };

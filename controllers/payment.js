import "dotenv/config";
import stripePackage from "stripe";
import { Booking } from "../models/booking.js";

// Initialize Stripe with your secret key
const stripe = new stripePackage(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (bookingId, currency) => {
  try {
    const booking = await Booking.findOne({ _id: bookingId });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.amount, // Amount in cents
      currency: currency, // Currency code (e.g., 'usd')
    });
    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

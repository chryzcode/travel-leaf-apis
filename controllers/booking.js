import "dotenv/config";
import { Booking } from "../models/booking.js";
import { Car } from "../models/car.js";
import { House } from "../models/house.js";
import { Yatch } from "../models/yatch.js";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";
import stripePackage from "stripe";
import { createPayment } from "./payment.js";

const stripe = new stripePackage(process.env.STRIPE_SECRET_KEY);

export const createBooking = async (req, res) => {
  const { userId } = req.user;
  const { listingId } = req.params;
  req.body.user = req.user.userId;
  const arrival = new Date(req.body.arrival);
  const days = req.body.nights;
  const departure = new Date(arrival);
  departure = departure.setDate(arrival.getDate() + days);
  req.body.departure = departure;

  const listing =
    (await Car.findOne({ listingId: listingId })) ||
    (await House.findOne({ listingId: listingId })) ||
    (await Yatch.findOne({ listingId: listingId }));

  if (!listing || listing.booked == true) {
    throw new NotFoundError(`Listing (either house, car or yatch with ${listingId} does not exist)`);
  }
  amount = listing.price * days;
  req.body.amount = amount;
  const booking = await Booking.create({ ...req.body });
  const payment = await createPayment(booking.id, listing.currency);
  const paymentIntent = await stripe.paymentIntents.retrieve(payment);
  if (!paymentIntent.status === "succeeded") {
    res.status(StatusCodes.BadRequestError).json({ error: "payment was not successful" });
  }
  await listing.findOneAndUpdate({ dateAvailable: departure, booked: true });
  await booking.findOneAndUpdate({ paid: true });
  res.status(StatusCodes.OK).json({ success: "payment successful" });
};

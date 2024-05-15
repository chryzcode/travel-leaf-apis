import "dotenv/config";
import { Booking } from "../models/booking.js";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";
import { House } from "../models/house.js";
import { Yatch } from "../models/yatch.js";
import { Car } from "../models/car.js";
import { StatusCodes } from "http-status-codes";
import { Payment, Wallet } from "../models/payment.js";
import stripePackage from "stripe";

const stripe = new stripePackage(process.env.STRIPE_SECRET_KEY);

export const walletPayout = async (req, res) => {
  const { userId } = req.user;
  const { bankId } = req.params;
  const wallet = await Wallet.findOne({ user: userId });
  const amount = req.body.amount;
  if (amount > wallet.amount) {
    throw new BadRequestError(`Insufficient funds`);
  }
  try {
    const payout = await stripe.payouts.create({
      amount: Number(amount) * 100, // amount in cents
      currency: "usd", // adjust currency as needed
      method: "standard",
      destination: bankId,
    });
    console.log("Payout successful:", payout);
    res.status(StatusCodes.OK).json({ payout });
  } catch (error) {
    console.error("Error:", error);
    throw new BadRequestError(`Error in payout ${error}`);
  }
};

export const cancelPayment = async (req, res) => {
  const { userId } = req.user;
  const { bookingId } = req.params;
  const booking = await Booking.findOne({ _id: bookingId, user: userId });
  if (!booking) {
    throw new BadRequestError("You don not have booking or this booking is not yours");
  }

  res.status(StatusCodes.OK).json({ success: "payment process cancelled" });
};

export const successfulPayment = async (req, res) => {
  const { userId } = req.user;
  const { bookingId } = req.params;
  if (await Booking.findOne({ _id: bookingId, paid: true })) {
    res.status(StatusCodes.OK).send(`Booking has been paid for already`);
  } else {
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId },
      { paid: true },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "fullName avatar username userType _id");
    if (!booking) {
      throw new NotFoundError(`Booking with ${bookingId} not found`);
    }
    var listing =
      (await Car.findOneAndUpdate(
        { _id: booking.listingId },
        { dateAvailable: booking.departure, booked: true },
        {
          new: true,
          runValidators: true,
        }
      )) ||
      (await House.findOneAndUpdate(
        { _id: booking.listingId },
        { dateAvailable: booking.departure, booked: true },
        {
          new: true,
          runValidators: true,
        }
      )) ||
      (await Yatch.findOneAndUpdate(
        { _id: booking.listingId },
        { dateAvailable: booking.departure, booked: true },
        {
          new: true,
          runValidators: true,
        }
      ));

    if (!listing) {
      throw new NotFoundError(`Listing (either house, car or yatch with ${booking.listingId} does not exist)`);
    }

    var payment = await Payment.findOne({ user: userId, booking: bookingId, paid: true });
    if (!payment) {
      payment = await Payment.create({
        user: userId,
        booking: booking.id,
        paid: true,
      });
    }
    payment = await Payment.findOne({ user: userId, booking: bookingId, paid: true }).populate(
      "user",
      "fullName avatar username userType _id"
    );
    const hostCharge = (booking.amount * 3) / 100;
    const amount = booking.amount - hostCharge;
    const wallet = await Wallet.findOne({ user: listing.user });
    await Wallet.findOneAndUpdate(
      { user: listing.user },
      { amount: Number(wallet.amount + amount) },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(StatusCodes.OK).json({ booking, payment });
  }
};

export const getMonthlyIncome = async (req, res) => {
  const { userId } = req.user;
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Start of the current month
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59); // End of the current month

  const bookings = await Booking.find({
    user: userId,
    createdAt: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  });
  let income = 0;
  if (bookings) {
    bookings.forEach(booking => {
      income += booking.amount;
    });
  }

  const wallet = await Wallet.findOne({ user: userId });
  const percentage = (income / wallet.amount) * 100;
  res.status(StatusCodes.OK).json({ monthly_income: income, percentage: percentage });
};

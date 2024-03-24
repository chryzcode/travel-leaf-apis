import { Booking } from "../models/booking.js";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";
import { House } from "../models/house.js";
import { Yatch } from "../models/yatch.js";
import { Car } from "../models/car.js";
import { StatusCodes } from "http-status-codes";
import { Payment } from "../models/payment.js";
import { Wallet } from "../models/payment.js";

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
    );
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

    const hostCharge = listing.price * 0.3;
    const amount = listing.price - hostCharge;
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

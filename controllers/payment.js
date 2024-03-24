import { Booking } from "../models/booking.js";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";
import { House } from "../models/house.js";
import { Yatch } from "../models/yatch.js";
import { Car } from "../models/car.js";
import { StatusCodes } from "http-status-codes";
import { Payment } from "../models/payment.js";

export const successfulPayment = async (req, res) => {
  const { userId } = req.user;
  const { bookingId } = req.params;
  const booking = await Booking.findOne(
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
      { dateAvailable: departure, booked: true },
      {
        new: true,
        runValidators: true,
      }
    )) ||
    (await House.findOneAndUpdate(
      { _id: booking.listingId },
      { dateAvailable: departure, booked: true },
      {
        new: true,
        runValidators: true,
      }
    )) ||
    (await Yatch.findOneAndUpdate(
      { _id: booking.listingId },
      { dateAvailable: departure, booked: true },
      {
        new: true,
        runValidators: true,
      }
    ));

  if (!listing || listing.booked == true) {
    throw new NotFoundError(`Listing (either house, car or yatch with ${booking.listingId} does not exist)`);
  }
  const payment = Payment.create({
    user: userId,
    booking: bookingId,
    paid: true,
  });
  res.status(StatusCodes.OK).json({ payment: booking });
};

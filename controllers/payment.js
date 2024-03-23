import { Booking } from "../models/booking.js";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";
import { House } from "../models/house.js";
import { Yatch } from "../models/yatch.js";
import { Car } from "../models/car.js";

export const successfulPayment = async (req, res) => {
  const { bookingId } = req.params;
  var booking = await Booking.findOne({ _id: bookingId });
  if (!booking) {
    throw new NotFoundError(`Booking with ${bookingId} not found`);
  }
  booking = await Booking.findOneAndUpdat(
    { _id: bookingId },
    { paid: true },
    {
      new: true,
      runValidators: true,
    }
  );
};

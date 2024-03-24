import { StatusCodes } from "http-status-codes";
import { Notification } from "../models/notification.js";
import { Booking } from "../models/booking.js";
import { Car } from "../models/car.js";
import { House } from "../models/house.js";
import { Yatch } from "../models/yatch.js";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";

export const createNotification = async (req, res) => {
  const { userId } = req.user;
  req.body.fromUser = userId;
  const { listingId } = req.params;
  var listing =
    (await Car.findOne({ _id: listingId })) ||
    (await House.findOne({ _id: listingId })) ||
    (await Yatch.findOne({ _id: listingId }));

  if (!listing) {
    throw new NotFoundError(`Listing does not exists`);
  }
  req.body.toUser = listing.user;
  req.body.listingId = listing.id;
  const currentDate = new Date();
  console.log(currentDate);
  const eligibleBooking = await Booking.findOne({
    user: userId,
    listingId: listing.id,
    paid: true,
    departure: { $gte: currentDate },
  });
  if (!eligibleBooking) {
    throw new UnauthenticatedError(`User is not eligible/ unauthorized to make notification to listing`);
  }
  const notification = await Notification.create({ ...req.body });
  res.status(StatusCodes.CREATED).json({ notification });
};

export const getAllNotifications = async (req, res) => {
  const { userId } = req.user;
  const notifications = await Notification.find({ toUser: userId });
  res.status(StatusCodes.CREATED).json({ notifications });
};

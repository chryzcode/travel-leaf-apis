import { StatusCodes } from "http-status-codes";
import { Rating } from "../models/rating.js";
import { Booking } from "../models/booking.js";
import { Car } from "../models/car.js";
import { House } from "../models/house.js";
import { Yatch } from "../models/yatch.js";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";

export const createRating = async (req, res) => {
  const { userId } = req.user;
  req.body.user = userId;
  const { listingId } = req.params;
  var listing =
    (await Car.findOne({ _id: listingId })) ||
    (await House.findOne({ _id: listingId })) ||
    (await Yatch.findOne({ _id: listingId }));

  if (!listing) {
    throw new NotFoundError(`Listing does not exists`);
  }
  const eligibleUser = await Booking.find({ user: userId, listingId: listing.id, paid: true });
  if (!eligibleUser) {
    throw new UnauthenticatedError(`User is not eligible/ unauthorized to rate listing`);
  }
  req.body.listingId = listing.id;
  const rating = await Rating.create({ ...req.body }).populate("user", "fullName avatar username userType _id");
  res.status(StatusCodes.CREATED).json({ rating });
};

export const allListingRatings = async (req, res) => {
  const { listingId } = req.params;
  var listing =
    (await Car.findOne({ _id: listingId })) ||
    (await House.findOne({ _id: listingId })) ||
    (await Yatch.findOne({ _id: listingId }));

  if (!listing) {
    throw new NotFoundError(`Listing does not exists`);
  }
  const ratings = await Rating.find({ listingId: listing.id }).populate(
    "user",
    "fullName avatar username userType _id"
  );
  res.status(StatusCodes.OK).json({ ratings });
};

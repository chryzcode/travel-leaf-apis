import { carType, Car } from "../models/car.js";
import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";

export const allCarTypes = async (req, res) => {
  const types = await carType.find({});
  res.status(StatusCodes.OK).json({ types });
};

export const allCars = async (req, res) => {
  const cars = await Car.find({}).sort("createdAt");
  res.status(StatusCodes.OK).json({ cars });
};

export const currentUserCars = async (req, res) => {
  const userId = req.user.userId;
  const cars = await Car.find({ user: userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ cars });
};

export const getCarsByTypes = async (req, res) => {
  const { typeId } = req.params;
  const cars = await Car.find({ carType: typeId });
  res.status(StatusCodes.OK).json({ cars });
};

export const createCar = async (req, res) => {
  req.body.user = req.user.userId;
  const media = req.body.media;
  var type = await carType.findOne({ name: req.body.carType });
  if (!type) {
    await carType.create({
      name: req.body.carType,
    });
  }
  type = await carType.findOne({ name: req.body.carType });
  req.body.carType = type.id;
  if (media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].url, {
          folder: "Trave-Leaf/Cars/Media/",
          use_filename: true,
        });
        media[i].url = result.url; // Replace media URL w
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }
  const car = await Car.create({ ...req.body });
  res.status(StatusCodes.OK).json({ car });
};

export const editCar = async (req, res) => {
  const { carId } = req.params;
  const userId = req.user.userId;
  const media = req.body.media;

  var type = await carType.findOne({ name: req.body.carType });
  if (!type) {
    await carType.create({
      name: req.body.carType,
    });
  }
  type = await carType.findOne({ name: req.body.carType });
  req.body.carType = type.id;

  var car = await Car.findOne({ _id: carId, user: userId });
  if (!car) {
    throw new NotFoundError(`Car with id ${carId} does not exist`);
  }
  if (media !== car.media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].url, {
          folder: "Trave-Leaf/Car/Media/",
          use_filename: true,
        });
        media[i].url = result.url; // Replace media URL w
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }

  car = await Car.findOneAndUpdate({ _id: carId, user: userId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ car });
};

export const getAvailableCars = async (req, res) => {
  const { userId } = req.user;
  const cars = await Car.find({ user: userId, available: true });
  res.status(StatusCodes.OK).json({ cars });
};

export const getBookedCars = async (req, res) => {
  const { userId } = req.user;
  const cars = await Car.find({ user: userId, booked: true });
  res.status(StatusCodes.OK).json({ cars });
};

export const getCarDetail = async (req, res) => {
  const { carId } = req.params;
  const car = await Car.findOne({ _id: carId });
  if (!car) {
    throw new NotFoundError(`Car with ${carId} does not exist`);
  }
  res.status(StatusCodes.OK).json({ car });
};

export const deleteCar = async (req, res) => {
  const { carId } = req.params;
  const { userId } = req.user;
  const car = await Car.findOneAndDelete({ _id: carId, user: userId });
  if (!car) {
    throw new NotFoundError(`Car with ${carId} does not exist`);
  }
  res.status(StatusCodes.OK).send();
};

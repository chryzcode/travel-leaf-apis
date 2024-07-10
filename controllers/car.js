import { carType, Car } from "../models/car.js";
import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors/index.js";
const fs = require("fs");

export const allCarTypes = async (req, res) => {
  const types = await carType.find({});
  res.status(StatusCodes.OK).json({ types });
};

export const allCars = async (req, res) => {
  const cars = await Car.find({})
    .sort("createdAt")
    .populate("user", "fullName avatar username userType _id")
    .populate("carType", "name _id");
  res.status(StatusCodes.OK).json({ cars });
};

export const currentUserCars = async (req, res) => {
  const userId = req.user.userId;
  const cars = await Car.find({ user: userId })
    .sort("createdAt")
    .populate("user", "fullName avatar username userType _id")
    .populate("carType", "name _id");
  res.status(StatusCodes.OK).json({ cars });
};

export const getCarsByTypes = async (req, res) => {
  const { typeId } = req.params;
  const cars = await Car.find({ carType: typeId })
    .populate("user", "fullName avatar username userType _id")
    .populate("carType", "name _id");
  res.status(StatusCodes.OK).json({ cars });
};

export const createCar = async (req, res) => {
  req.body.user = req.user.userId;
  const media = req.files;
  const img = [];
  var type = await carType.findOne({ name: req.body.carType });
  if (!type) {
    throw NotFoundError(`Car type does not exist`);
  }
  req.body.carType = type.id;
  if (media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].path, {
          folder: "Trave-Leaf/Cars/Media/",
          use_filename: true,
        });
        img.push({
          url: result.url,
        });
        //media[i].url = result.url; // Replace media URL w
        fs.unlinkSync(media[i].path);
      } catch (error) {
        console.error(error);
        throw new BadRequestError({
          "error uploading image on cloudinary": error,
        });
      }
    }
  }
  let car = await Car.create({ ...req.body, media: img });
  car = await Car.findOne({ _id: car._id })
    .populate("user", "fullName avatar username userType _id")
    .populate("carType", "name _id");
  res.status(StatusCodes.OK).json({ car });
};

export const editCar = async (req, res) => {
  const { carId } = req.params;
  const userId = req.user.userId;
  const media = req.body.media;

  var type = await carType.findOne({ name: req.body.carType });
  if (!type) {
    throw NotFoundError(`House type does not exist`);
  }

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
        throw new BadRequestError({
          "error uploading image on cloudinary": error,
        });
      }
    }
  }

  car = await Car.findOneAndUpdate({ _id: carId, user: userId }, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("user", "fullName avatar username userType _id")
    .populate("carType", "name _id");

  res.status(StatusCodes.OK).json({ car });
};

export const getAvailableCars = async (req, res) => {
  const { userId } = req.user;
  const cars = await Car.find({ user: userId, booked: false })
    .populate("user", "fullName avatar username userType _id")
    .populate("carType", "name _id");
  res.status(StatusCodes.OK).json({ cars });
};

export const getBookedCars = async (req, res) => {
  const { userId } = req.user;
  const cars = await Car.find({ user: userId, booked: true })
    .populate("user", "fullName avatar username userType _id")
    .populate("carType", "name _id");
  res.status(StatusCodes.OK).json({ cars });
};

export const getCarDetail = async (req, res) => {
  const { carId } = req.params;
  var car = await Car.findOne({ _id: carId });
  if (!car) {
    throw new NotFoundError(`Car with ${carId} does not exist`);
  }
  const currentDate = new Date();
  if (currentDate > car.dateAvailable) {
    car = await Car.findOneAndUpdate(
      { _id: carId },
      { booked: false },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user", "fullName avatar username userType _id")
      .populate("carType", "name _id");
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
  if (car.booked == true) {
    throw new UnauthenticatedError(`You can not deleted a booked car`);
  }
  res.status(StatusCodes.OK).send();
};

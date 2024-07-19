import { carType, Car } from "../models/car.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors/index.js";
import { uploadToCloudinary } from "../utils/cloudinaryConfig.js";

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
  const mediaFiles = req.files; // Use req.files from Multer

  try {
    let type = await carType.findOne({ name: req.body.carType });
    if (!type) {
      return res.status(404).json({ error: "Car type does not exist" });
    }
    req.body.carType = type._id;

    const mediaUrls = [];
    if (mediaFiles) {
      for (const file of mediaFiles) {
        try {
          const result = await uploadToCloudinary(file);
          mediaUrls.push({ url: result.secure_url });
        } catch (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return res.status(400).json({ error: "Error uploading image to Cloudinary" });
        }
      }
    }
    req.body.media = mediaUrls;

    let car = await Car.create({ ...req.body });
    car = await Car.findOne({ _id: car._id })
      .populate("user", "fullName avatar username userType _id")
      .populate("carType", "name _id");

    res.status(200).json({ car });
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ error: "Error creating car", details: error.message });
  }
};

export const editCar = async (req, res) => {
  const { carId } = req.params;
  const userId = req.user.userId;
  const mediaFiles = req.files; // Use req.files from Multer

  try {
    let type = await carType.findOne({ name: req.body.carType });
    if (!type) {
      return res.status(404).json({ error: "Car type does not exist" });
    }
    req.body.carType = type._id;

    let car = await Car.findOne({ _id: carId, user: userId });
    if (!car) {
      return res.status(404).json({ error: `Car with id ${carId} does not exist` });
    }

    if (mediaFiles && mediaFiles.length > 0) {
      const uploadPromises = mediaFiles.map(file => uploadToCloudinary(file));
      try {
        const results = await Promise.all(uploadPromises);
        req.body.media = results.map(result => ({ url: result.secure_url }));
      } catch (error) {
        console.error("Error uploading images to Cloudinary:", error);
        return res.status(400).json({ error: "Error uploading images" });
      }
    }

    car = await Car.findOneAndUpdate({ _id: carId, user: userId }, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("user", "fullName avatar username userType _id")
      .populate("carType", "name _id");

    res.status(200).json({ car });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Error updating car", details: error.message });
  }
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

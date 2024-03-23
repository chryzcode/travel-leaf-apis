import { House, houseType } from "../models/house.js";
import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";

export const allHouseTypes = async (req, res) => {
  const types = await houseType.find({});
  res.status(StatusCodes.OK).json({ types });
};

export const allHouses = async (req, res) => {
  const houses = await House.find({}).sort("createdAt");
  res.status(StatusCodes.OK).json({ houses });
};

export const currentUserHouses = async (req, res) => {
  const userId = req.user.userId;
  const houses = await House.find({ user: userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ houses });
};

export const getHousesByTypes = async (req, res) => {
  const { typeId } = req.params;
  const houses = await House.find({ houseType: typeId });
  res.status(StatusCodes.OK).json({ houses });
};

export const createHouse = async (req, res) => {
  req.body.user = req.user.userId;
  const media = req.body.media;
  var type = await houseType.findOne({ name: req.body.houseType });
  if (!type) {
    await houseType.create({
      name: req.body.houseType,
    });
  }
  type = await houseType.findOne({ name: req.body.houseType });
  req.body.houseType = type.id;
  if (media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].url, {
          folder: "Trave-Leaf/House/Media/",
          use_filename: true,
        });
        media[i].url = result.url; // Replace media URL w
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }
  const house = await House.create({ ...req.body });
  res.status(StatusCodes.OK).json({ house });
};

export const editHouse = async (req, res) => {
  const { houseId } = req.params;
  const userId = req.user.userId;
  const media = req.body.media;

  var type = await houseType.findOne({ name: req.body.houseType });
  if (!type) {
    await houseType.create({
      name: req.body.houseType,
    });
  }
  type = await houseType.findOne({ name: req.body.houseType });
  req.body.houseType = type.id;

  var house = await House.findOne({ _id: houseId, user: userId });
  if (!house) {
    throw new NotFoundError(`House with id ${houseId} does not exist`);
  }
  if (media !== house.media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].url, {
          folder: "Trave-Leaf/House/Media/",
          use_filename: true,
        });
        media[i].url = result.url; // Replace media URL w
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }

  house = await House.findOneAndUpdate({ _id: houseId, user: userId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ house });
};

export const getAvailableHouses = async (req, res) => {
  const { userId } = req.user;
  const houses = await House.find({ user: userId, available: true });
  res.status(StatusCodes.OK).json({ houses });
};

export const getBookedHouses = async (req, res) => {
  const { userId } = req.user;
  const houses = await House.find({ user: userId, booked: true });
  res.status(StatusCodes.OK).json({ houses });
};

export const getHouseDetail = async (req, res) => {
  const { houseId } = req.params;
  const house = await House.findOne({ _id: houseId });
  if (!house) {
    throw new NotFoundError(`House with ${houseId} does not exist`);
  }
  res.status(StatusCodes.OK).json({ house });
};

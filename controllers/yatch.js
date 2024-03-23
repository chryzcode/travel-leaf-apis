import { yatchType, Yatch } from "../models/yatch.js";
import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";

export const allYatchTypes = async (req, res) => {
  const types = await yatchType.find({});
  res.status(StatusCodes.OK).json({ types });
};

export const allYatchs = async (req, res) => {
  const yatchs = await Yatch.find({}).sort("createdAt");
  res.status(StatusCodes.OK).json({ yatchs });
};

export const currentUserYatchs = async (req, res) => {
  const userId = req.user.userId;
  const yatch = await Yatch.find({ user: userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ yatch });
};

export const getYatchsByTypes = async (req, res) => {
  const { typeId } = req.params;
  const yatch = await Yatch.find({ yatchType: typeId });
  res.status(StatusCodes.OK).json({ yatch });
};

export const createYatch = async (req, res) => {
  req.body.user = req.user.userId;
  const media = req.body.media;
  var type = await yatchType.findOne({ name: req.body.yatchType });
  if (!type) {
    await yatchType.create({
      name: req.body.yatchType,
    });
  }
  type = await yatchType.findOne({ name: req.body.yatchType });
  req.body.yatchType = type.id;
  if (media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].url, {
          folder: "Trave-Leaf/Yatch/Media/",
          use_filename: true,
        });
        media[i].url = result.url; // Replace media URL w
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }
  const yatch = await Yatch.create({ ...req.body });
  res.status(StatusCodes.OK).json({ yatch });
};

export const editYatch = async (req, res) => {
  const { yatchId } = req.params;
  const userId = req.user.userId;
  const media = req.body.media;

  var type = await yatchType.findOne({ name: req.body.yatchType });
  if (!type) {
    await yatchType.create({
      name: req.body.yatchType,
    });
  }
  type = await yatchType.findOne({ name: req.body.yatchType });
  req.body.yatchType = type.id;

  var yatch = await Yatch.findOne({ _id: yatchId, user: userId });
  if (!yatch) {
    throw new NotFoundError(`Car with id ${yatchId} does not exist`);
  }
  if (media !== yatch.media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].url, {
          folder: "Trave-Leaf/Yatch/Media/",
          use_filename: true,
        });
        media[i].url = result.url; // Replace media URL w
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }

  yatch = await Yatch.findOneAndUpdate({ _id: yatchId, user: userId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ yatch });
};

export const getAvailableYatchs = async (req, res) => {
  const { userId } = req.user;
  const yatchs = await Yatch.find({ user: userId, available: true });
  res.status(StatusCodes.OK).json({ yatchs });
};

export const getBookedYatchs = async (req, res) => {
  const { userId } = req.user;
  const yatchs = await Yatch.find({ user: userId, booked: true });
  res.status(StatusCodes.OK).json({ yatchs });
};

export const getYatchDetail = async (req, res) => {
  const { yatchId } = req.params;
  const yatch = await Yatch.findOne({ _id: yatchId });
  if (!yatch) {
    throw new NotFoundError(`Car with ${yatchId} does not exist`);
  }
  res.status(StatusCodes.OK).json({ yatch });
};
